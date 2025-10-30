import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from "react-native";
import { useRealm } from "@realm/react";
import { ObjectId } from "bson";
import { useAppSelector } from "../../store";
import { useNavigation } from "@react-navigation/native";

type Book = {
  _id: ObjectId;
  title: string;
  author: string;
  coverUrl?: string;
  total: number;
  available: number;
  createdAt: Date;
  updatedAt: Date;
};

export default function Books() {
  const realm = useRealm();
  const navigation = useNavigation<any>();
  const { user } = useAppSelector((s) => s.session);
  const isAdmin = !!user?.isSU;
  const [books, setBooks] = useState<Book[]>([]);

  useEffect(() => {
    const data = realm.objects<Book>("Book").sorted("createdAt", true);
    setBooks([...data]);

    const listener = () => setBooks([...data]);
    data.addListener(listener);
    return () => data.removeListener(listener);
  }, [realm]);

  const addBook = () => {
    if (!isAdmin) return;
    navigation.navigate("BookForm");
  };

  // ✅ Kullanıcının aktif isteği olup olmadığını kontrol eden fonksiyon
  const hasActiveRequest = (userId: ObjectId) => {
    const active = realm
      .objects("BorrowRequest")
      .filtered(
        "userId == $0 AND (status == 'pending' OR status == 'approved')",
        userId
      );
    return active.length > 0;
  };

  const borrowBook = (book: Book) => {
    if (!user?._id) {
      Alert.alert("Warning", "Please log in first.");
      return;
    }

    const userId = new ObjectId(user._id);

    // ✅ 1️⃣ Kullanıcının zaten aktif (pending veya approved) isteği varsa
    if (hasActiveRequest(userId)) {
      Alert.alert(
        "Already Borrowed",
        "You already have an active book. Please return it before borrowing another one."
      );
      return;
    }

    // ✅ 2️⃣ Bu kitap için zaten pending istek varsa
    const existing = realm.objects("BorrowRequest").filtered(
      "bookId == $0 AND userId == $1 AND status == 'pending'",
      book._id,
      userId
    );
    if (existing.length > 0) {
      Alert.alert("You already have a pending request for this book.");
      return;
    }

    // ✅ 3️⃣ Yeni istek oluştur
    realm.write(() => {
      realm.create("BorrowRequest", {
        _id: new ObjectId(),
        bookId: book._id,
        userId,
        status: "pending",
        requestedAt: new Date(),
      });
    });

    Alert.alert("Success", "Borrow request sent!");
  };

  const deleteBook = (book: Book) => {
    if (!isAdmin) return;
    Alert.alert("Confirmation", "Do you want to delete this book?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          realm.write(() => realm.delete(book));
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Books</Text>

      {isAdmin && (
        <TouchableOpacity style={styles.addBtn} onPress={addBook}>
          <Text style={styles.addText}>+ Add Book</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={books}
        keyExtractor={(item) => String(item._id)}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No books yet. {isAdmin ? "Add your first book!" : ""}
          </Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("BookDetails", { id: String(item._id) })
            }
            activeOpacity={0.8}
          >
            <View style={styles.card}>
              {item.coverUrl ? (
                <Image source={{ uri: item.coverUrl }} style={styles.cover} />
              ) : (
                <View style={[styles.cover, styles.noCover]}>
                  <Text style={{ color: "#9CA3AF", fontSize: 12 }}>
                    No cover
                  </Text>
                </View>
              )}

              <View style={styles.info}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.author}>👤 {item.author}</Text>
                <Text style={styles.desc}>Description</Text>

                {!isAdmin && (
                  <TouchableOpacity
                    style={styles.borrowBtn}
                    onPress={() => borrowBook(item)}
                  >
                    <Text style={styles.borrowText}>Borrow</Text>
                  </TouchableOpacity>
                )}

                {isAdmin && (
                  <TouchableOpacity
                    style={[styles.borrowBtn, styles.delBtn]}
                    onPress={() => deleteBook(item)}
                  >
                    <Text style={styles.borrowText}>Delete</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#F3F4F6" },
  header: { fontSize: 22, fontWeight: "700", marginBottom: 10 },
  addBtn: {
    backgroundColor: "#111827",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    alignItems: "center",
  },
  addText: { color: "white", fontWeight: "600" },
  emptyText: { textAlign: "center", marginTop: 40, color: "#6B7280" },
  card: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cover: {
    width: 70,
    height: 100,
    borderRadius: 6,
    marginRight: 12,
    backgroundColor: "#E5E7EB",
  },
  noCover: { justifyContent: "center", alignItems: "center" },
  info: { flex: 1 },
  title: { fontSize: 16, fontWeight: "700", marginTop: 4 },
  author: { fontSize: 13, color: "#6B7280", marginTop: 2 },
  desc: { color: "#16A34A", fontSize: 13, marginTop: 4, marginBottom: 10 },
  borrowBtn: {
    alignSelf: "flex-end",
    backgroundColor: "#2563EB",
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  delBtn: { backgroundColor: "#B91C1C" },
  borrowText: { color: "white", fontWeight: "600", fontSize: 13 },
});
