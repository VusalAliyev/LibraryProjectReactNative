import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useRealm } from "@realm/react";
import { ObjectId } from "bson";

export default function Requests() {
  const realm = useRealm();
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    const data = realm.objects("BorrowRequest").sorted("requestedAt", true);
    setRequests([...data]);
    const listener = () => setRequests([...data]);
    data.addListener(listener);
    return () => data.removeListener(listener);
  }, [realm]);

  const getBookTitle = (bookId: ObjectId) => {
    const book = realm.objectForPrimaryKey("Book", bookId);
    return book ? book.title : "Unknown Book";
  };

  const getUserName = (userId: ObjectId) => {
    const user = realm.objectForPrimaryKey("User", userId);
    return user ? user.name : "Unknown User";
  };

  const approve = (req: any) => {
    realm.write(() => {
      req.status = "approved";
      req.decidedAt = new Date();

      const book = realm.objectForPrimaryKey("Book", req.bookId);
      if (book) {
        book.available -= 1;
        book.updatedAt = new Date();
      }
    });
  };

  const reject = (req: any) => {
    realm.write(() => {
      req.status = "rejected";
      req.decidedAt = new Date();
    });
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
      <Text style={styles.title}>Borrow Requests</Text>

      <FlatList
        data={requests}
        keyExtractor={r => String(r._id)}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 40, color: "#6B7280" }}>
            No requests yet
          </Text>
        }
        renderItem={({ item }) => {
          const bookTitle = getBookTitle(item.bookId);
          const userName = getUserName(item.userId);

          return (
            <View style={styles.item}>
              <Text style={styles.bookTitle}>📘 {bookTitle}</Text>
              <Text style={styles.userName}>👤 {userName}</Text>
              <Text>Status: {item.status}</Text>
              <Text>
                Requested: {new Date(item.requestedAt).toLocaleDateString()}{" "}
                {new Date(item.requestedAt).toLocaleTimeString()}
              </Text>

              {item.status === "pending" && (
                <View style={styles.row}>
                  <TouchableOpacity
                    style={[styles.btn, styles.ok]}
                    onPress={() => approve(item)}
                  >
                    <Text style={styles.btnText}>Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.btn, styles.reject]}
                    onPress={() => reject(item)}
                  >
                    <Text style={styles.btnText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              )}

              {item.status === "approved" && (
                <TouchableOpacity
                  style={[styles.btn, styles.return]}
                  onPress={() => markReturned(item)}
                >
                  <Text style={styles.btnText}>Mark Returned</Text>
                </TouchableOpacity>
              )}
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
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
    paddingVertical: 12,
  },
  bookTitle: { fontWeight: "600", fontSize: 16 },
  userName: { color: "#6B7280", marginBottom: 6 },
  row: { flexDirection: "row", marginTop: 8 },
  btn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginRight: 8,
  },
  ok: { backgroundColor: "#059669" },
  reject: { backgroundColor: "#DC2626" },
  return: { backgroundColor: "#2563EB" },
  btnText: { color: "white" },
});
