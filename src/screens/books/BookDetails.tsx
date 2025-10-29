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
  const [book, setBook] = useState<any>(null);

  useEffect(() => {
    const obj = realm.objectForPrimaryKey("Book", new ObjectId(id));
    if (obj) setBook({ ...obj });

    const listener = (updated: any) => {
      setBook({ ...updated });
    };

    obj?.addListener(listener);
    return () => obj?.removeListener(listener);
  }, [id]);

  if (!book)
    return (
      <View style={styles.container}>
        <Text style={{ padding: 16 }}>Book not found</Text>
      </View>
    );

  const onBorrow = () => {
    if (book.available <= 0) {
      Alert.alert("Uyarı", "Bu kitap şu anda mevcut değil.");
      return;
    }
    realm.write(() => {
      book.available -= 1;
      book.updatedAt = new Date();
    });
    Alert.alert("Başarılı", "Kitabı ödünç aldınız!");
  };

  const onReturn = () => {
    realm.write(() => {
      book.available += 1;
      book.updatedAt = new Date();
    });
    Alert.alert("Başarılı", "Kitabı iade ettiniz!");
  };

  const onDelete = () => {
    Alert.alert("Silme Onayı", "Bu kitabı silmek istiyor musunuz?", [
      { text: "İptal", style: "cancel" },
      {
        text: "Sil",
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
      {book.available > 0 ? (
        <Button title="Borrow Book" onPress={onBorrow} />
      ) : (
        <Button title="Return Book" onPress={onReturn} />
      )}

      {user?.isSU && (
        <>
          <Button
            title="Edit Book"
            onPress={() =>
              navigation.navigate("BookForm", { id: String(book._id) })
            }
          />
          <Button
            title="Delete Book"
            onPress={onDelete}
            disabled={false}
          />
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
