import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Image,
} from "react-native";
import { useRealm } from "@realm/react";
import { ObjectId } from "bson";
import { useRoute, useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import Button from "../../components/Button";

type RouteParams = { id?: string };

export default function BookForm() {
  const realm = useRealm();
  const navigation = useNavigation<any>();
  const route = useRoute();
  const params = (route.params ?? {}) as RouteParams;
  const bookId = params.id;

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [total, setTotal] = useState("5");
  const [coverUrl, setCoverUrl] = useState<string | undefined>();

  useEffect(() => {
    if (bookId) {
      const book = realm.objectForPrimaryKey("Book", new ObjectId(bookId));
      if (book) {
        setTitle(book.title);
        setAuthor(book.author);
        setTotal(String(book.total));
        if (book.coverUrl) setCoverUrl(book.coverUrl);
      }
    }
  }, [bookId]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled) {
      setCoverUrl(result.assets[0].uri);
    }
  };

  const onSave = () => {
    if (!title || !author) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    realm.write(() => {
      if (bookId) {
        // UPDATE
        const book = realm.objectForPrimaryKey("Book", new ObjectId(bookId));
        if (book) {
          book.title = title;
          book.author = author;
          book.total = parseInt(total);
          book.coverUrl = coverUrl;
          book.updatedAt = new Date();
        }
      } else {
        // CREATE
        realm.create("Book", {
          _id: new ObjectId(),
          title,
          author,
          total: parseInt(total),
          available: parseInt(total),
          coverUrl,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    });

    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{bookId ? "Edit Book" : "Add Book"}</Text>

      {/* Cover Image Picker */}
      <TouchableOpacity onPress={pickImage} style={styles.coverWrap}>
        {coverUrl ? (
          <Image source={{ uri: coverUrl }} style={styles.cover} />
        ) : (
          <Text style={{ color: "#6B7280" }}>Select Cover Image</Text>
        )}
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Book title"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="Author"
        value={author}
        onChangeText={setAuthor}
      />
      <TextInput
        style={styles.input}
        placeholder="Total count"
        value={total}
        keyboardType="numeric"
        onChangeText={setTotal}
      />

      <Button title="Save" onPress={onSave} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  coverWrap: {
    width: 140,
    height: 180,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    alignSelf: "center",
  },
  cover: { width: "100%", height: "100%", borderRadius: 10 },
});
