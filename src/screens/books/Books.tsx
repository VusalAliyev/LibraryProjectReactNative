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
  const [books, setBooks] = useState<Book[]>([]);

  useEffect(() => {
    const data = realm.objects<Book>("Book").sorted("createdAt", true);
    setBooks([...data]);

    const listener = () => setBooks([...data]);
    data.addListener(listener);
    return () => data.removeListener(listener);
  }, [realm]);

  const addBook = () => {
    navigation.navigate("BookForm");
  };

  const borrowBook = (book: Book) => {
    if (book.available <= 0) return;
    realm.write(() => {
      book.available -= 1;
      book.updatedAt = new Date();
    });
  };

  const returnBook = (book: Book) => {
    realm.write(() => {
      book.available += 1;
      book.updatedAt = new Date();
    });
  };

  const deleteBook = (book: Book) => {
    Alert.alert("Confirm", "Delete this book?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
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

      <TouchableOpacity style={styles.addBtn} onPress={addBook}>
        <Text style={styles.addText}>+ Add Book</Text>
      </TouchableOpacity>

      <FlatList
        data={books}
        keyExtractor={(item) => String(item._id)}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 40, color: "#6B7280" }}>
            No books yet. Add your first book!
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.item}>
            {/* Cover thumbnail */}
            {item.coverUrl ? (
              <Image
                source={{ uri: item.coverUrl }}
                style={styles.thumbnail}
              />
            ) : (
              <View style={[styles.thumbnail, styles.noCover]}>
                <Text style={{ color: "#9CA3AF", fontSize: 12 }}>No cover</Text>
              </View>
            )}

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

            {item.available > 0 ? (
              <TouchableOpacity
                style={styles.btn}
                onPress={() => borrowBook(item)}
              >
                <Text style={styles.btnText}>Borrow</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.btn, styles.returnBtn]}
                onPress={() => returnBook(item)}
              >
                <Text style={styles.btnText}>Return</Text>
              </TouchableOpacity>
            )}

            {user?.isSU && (
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
  returnBtn: { backgroundColor: "#047857" },
  delBtn: { backgroundColor: "#B91C1C" },
  btnText: { color: "#fff" },
});
