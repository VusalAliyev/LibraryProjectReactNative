import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { useRealm } from "@realm/react";
import { ObjectId } from "bson";
import { useAppSelector } from "../../store";

export default function MyBooks() {
  const realm = useRealm();
  const { user } = useAppSelector(s => s.session);
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    if (!user?._id) return;

    const data = realm.objects("BorrowRequest")
      .filtered("userId == $0 && status == 'approved'", new ObjectId(user._id))
      .sorted("requestedAt", true);

    setRequests([...data]);

    const listener = () => setRequests([...data]);
    data.addListener(listener);
    return () => data.removeListener(listener);
  }, [realm, user]);

  const getBookTitle = (bookId: ObjectId) => {
    const book = realm.objectForPrimaryKey("Book", bookId);
    return book ? book.title : "Unknown Book";
  };

  const markReturned = (req: any) => {
    realm.write(() => {
      req.status = "returned";
      req.decidedAt = new Date();

      const book = realm.objectForPrimaryKey("Book", req.bookId);
      if (book) {
        book.available += 1;
        book.updatedAt = new Date();
      }
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Borrowed Books</Text>

      <FlatList
        data={requests}
        keyExtractor={r => String(r._id)}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 40, color: "#6B7280" }}>
            You have no borrowed books.
          </Text>
        }
        renderItem={({ item }) => {
          const bookTitle = getBookTitle(item.bookId);
          const due = item.dueDate
            ? new Date(item.dueDate).toLocaleDateString()
            : "—";

          return (
            <View style={styles.item}>
              <View style={{ flex: 1 }}>
                <Text style={styles.bookTitle}>📘 {bookTitle}</Text>
                <Text style={styles.dueText}>Due: {due}</Text>
              </View>

              <TouchableOpacity
                style={[styles.btn, styles.returnBtn]}
                onPress={() => markReturned(item)}
              >
                <Text style={styles.btnText}>Return</Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 16 },
  item: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
    paddingVertical: 10,
  },
  bookTitle: { fontSize: 16, fontWeight: "600" },
  dueText: { color: "#6B7280" },
  btn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  returnBtn: { backgroundColor: "#2563EB" },
  btnText: { color: "white" },
});
