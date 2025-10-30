import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Image,
  ScrollView,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useRealm } from "@realm/react";
import { ObjectId } from "bson";
import Button from "../../components/Button";
import { useAppSelector } from "../../store";

type RouteParams = { id: string };

export default function BookDetails() {
  const { id } = useRoute().params as RouteParams;
  const realm = useRealm();
  const navigation = useNavigation<any>();
  const { user } = useAppSelector((s) => s.session);
  const isAdmin = !!user?.isSU;
  const [book, setBook] = useState<any>(null);

  useEffect(() => {
    const obj = realm.objectForPrimaryKey("Book", new ObjectId(id));
    if (obj) setBook({ ...obj });

    const listener = (updated: any) => setBook({ ...updated });
    obj?.addListener(listener);
    return () => obj?.removeListener(listener);
  }, [id]);

  if (!book)
    return (
      <View style={styles.container}>
        <Text style={{ padding: 16 }}>Book not found</Text>
      </View>
    );

  // ✅ Kullanıcının aktif isteği olup olmadığını kontrol et
  const hasActiveRequest = (userId: ObjectId) => {
    const active = realm
      .objects("BorrowRequest")
      .filtered(
        "userId == $0 AND (status == 'pending' OR status == 'approved')",
        userId
      );
    return active.length > 0;
  };

  // ✅ Kullanıcı kitap isteği oluşturuyor
  const onRequestBorrow = () => {
    if (!user?._id) {
      Alert.alert("Warning", "Please log in first.");
      return;
    }

    const userId = new ObjectId(user._id);

    if (book.available <= 0) {
      Alert.alert("Not Available", "This book is currently unavailable.");
      return;
    }

    // Aktif isteği varsa
    if (hasActiveRequest(userId)) {
      Alert.alert(
        "Already Borrowed",
        "You already have an active book. Please return it before borrowing another one."
      );
      return;
    }

    // Zaten pending isteği varsa
    const existing = realm.objects("BorrowRequest").filtered(
      "bookId == $0 AND userId == $1 AND status == 'pending'",
      book._id,
      userId
    );
    if (existing.length > 0) {
      Alert.alert("You already have a pending request for this book.");
      return;
    }

    // ✅ Yeni istek oluştur
    realm.write(() => {
      realm.create("BorrowRequest", {
        _id: new ObjectId(),
        bookId: book._id,
        userId,
        status: "pending",
        requestedAt: new Date(),
      });
    });

    Alert.alert("Success", "Your borrow request has been sent!");
  };

  const onDelete = () => {
    Alert.alert("Delete Confirmation", "Do you want to delete this book?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          realm.write(() => {
            realm.delete(book);
          });
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Cover */}
      {book.coverUrl ? (
        <Image source={{ uri: book.coverUrl }} style={styles.cover} />
      ) : (
        <View style={[styles.cover, styles.noCover]}>
          <Text style={{ color: "#9CA3AF" }}>No Cover</Text>
        </View>
      )}

      {/* Info */}
      <Text style={styles.title}>{book.title}</Text>
      <Text style={styles.author}>{book.author}</Text>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>📚 Total: {book.total}</Text>
        <Text
          style={[
            styles.infoText,
            { color: book.available > 0 ? "green" : "red" },
          ]}
        >
          {book.available > 0
            ? `Available: ${book.available}`
            : "Not Available"}
        </Text>
        <Text style={styles.infoText}>
          🕓 Created: {new Date(book.createdAt).toLocaleDateString()}
        </Text>
      </View>

      {/* Actions */}
      {!isAdmin && (
        <Button
          title="Request to Borrow"
          onPress={onRequestBorrow}
          disabled={book.available <= 0}
        />
      )}

      {isAdmin && (
        <>
          <Button
            title="Edit Book"
            onPress={() =>
              navigation.navigate("BookForm", { id: String(book._id) })
            }
          />
          <Button title="Delete Book" onPress={onDelete} />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: "center",
  },
  cover: {
    width: 160,
    height: 220,
    borderRadius: 10,
    marginBottom: 16,
    backgroundColor: "#F3F4F6",
  },
  noCover: {
    justifyContent: "center",
    alignItems: "center",
  },
  title: { fontSize: 22, fontWeight: "700", textAlign: "center" },
  author: { color: "#6B7280", marginBottom: 16, textAlign: "center" },
  infoBox: { marginBottom: 16 },
  infoText: { fontSize: 16, marginBottom: 4 },
});
