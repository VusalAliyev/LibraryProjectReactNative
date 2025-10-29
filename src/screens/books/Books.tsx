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
  const isAdmin = !!user?.isSU; // ✅ admin kontrolü
  const [books, setBooks] = useState<Book[]>([]);

  useEffect(() => {
    const data = realm.objects<Book>("Book").sorted("createdAt", true);
    setBooks([...data]);

    const listener = () => setBooks([...data]);
    data.addListener(listener);
    return () => data.removeListener(listener);
  }, [realm]);

  const addBook = () => {
    if (!isAdmin) return; // sadece admin
    navigation.navigate("BookForm");
  };

  const borrowBook = (book: Book) => {
    if (!user?._id) {
      Alert.alert("Uyarı", "Lütfen önce giriş yapın.");
      return;
    }

    const existing = realm.objects("BorrowRequest").filtered(
      "bookId == $0 && userId == $1 && status == 'pending'",
      book._id,
      new ObjectId(user._id)
    );

    if (existing.length > 0) {
      Alert.alert("Zaten bekleyen bir isteğiniz var.");
      return;
    }

    realm.write(() => {
      realm.create("BorrowRequest", {
        _id: new ObjectId(),
        bookId: book._id,
        userId: new ObjectId(user._id),
        status: "pending",
        requestedAt: new Date(),
      });
    });

    Alert.alert("Başarılı", "Ödünç isteği gönderildi!");
  };

  const deleteBook = (book: Book) => {
    if (!isAdmin) return;
    Alert.alert("Onay", "Bu kitabı silmek istiyor musunuz?", [
      { text: "İptal", style: "cancel" },
      {
        text: "Sil",
        style: "destructive",
        onPress: () => {
          realm.write(() => {
            realm.delete(book);
          });
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Books</Text>

      {/* ✅ Sadece admin için add button */}
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
          <View style={styles.item}>
            {/* Cover image */}
            {item.coverUrl ? (
              <Image source={{ uri: item.coverUrl }} style={styles.thumbnail} />
            ) : (
              <View style={[styles.thumbnail, styles.noCover]}>
                <Text style={{ color: "#9CA3AF", fontSize: 12 }}>No cover</Text>
              </View>
            )}

            {/* Book info */}
            <View style={{ flex: 1 }}>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("BookDetails", { id: String(item._id) })
                }
              >
                <Text style={styles.title}>{item.title}</Text>
              </TouchableOpacity>
              <Text style={styles.author}>{item.author}</Text>
              <Text
                style={{
                  color: item.available > 0 ? "green" : "red",
                  fontWeight: "500",
                }}
              >
                {item.available > 0
                  ? `Available: ${item.available}`
                  : "Not Available"}
              </Text>
            </View>

            {/* ✅ Kullanıcı -> Borrow / ✅ Admin -> Delete */}
            {!isAdmin && (
              <TouchableOpacity
                style={styles.btn}
                onPress={() => borrowBook(item)}
              >
                <Text style={styles.btnText}>Borrow</Text>
              </TouchableOpacity>
            )}

            {isAdmin && (
              <TouchableOpacity
                style={[styles.btn, styles.delBtn]}
                onPress={() => deleteBook(item)}
              >
                <Text style={styles.btnText}>X</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 22, fontWeight: "700", marginBottom: 8 },
  emptyText: { textAlign: "center", marginTop: 40, color: "#6B7280" },
  addBtn: {
    backgroundColor: "#111827",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    alignItems: "center",
  },
  addText: { color: "white", fontWeight: "600" },
  item: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
    paddingVertical: 10,
  },
  thumbnail: {
    width: 50,
    height: 70,
    borderRadius: 6,
    marginRight: 10,
    backgroundColor: "#F3F4F6",
  },
  noCover: {
    justifyContent: "center",
    alignItems: "center",
  },
  title: { fontSize: 16, fontWeight: "600" },
  author: { color: "#6B7280" },
  btn: {
    backgroundColor: "#1D4ED8",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginLeft: 8,
  },
  delBtn: { backgroundColor: "#B91C1C" },
  btnText: { color: "#fff" },
});
