import React, { useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { useRealm } from "@realm/react";
import { ObjectId } from "bson";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { hashPassword } from "../../utils/auth";
import { useNavigation } from "@react-navigation/native";
import { useAppDispatch } from "../../store";
import { setUser } from "../../store/slices/session";

export default function SignUp() {
  const realm = useRealm();
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [busy, setBusy] = useState(false);

  const onSignUp = async () => {
    if (!email || !pass || !name) {
      Alert.alert("Hata", "Tüm alanları doldurun.");
      return;
    }

    try {
      setBusy(true);

      const existing = realm
        .objects("User")
        .filtered("email == $0", email.trim().toLowerCase());
      if (existing.length > 0) {
        Alert.alert("Hata", "Bu e-posta zaten kayıtlı.");
        return;
      }

      // İlk kullanıcı admin olacak
      const totalUsers = realm.objects("User").length;
      const isSU = totalUsers === 0;

      const passwordHash = await hashPassword(pass);

      let newUser: any;
      realm.write(() => {
        newUser = realm.create("User", {
          _id: new ObjectId(),
          name: name.trim(),
          email: email.trim().toLowerCase(),
          passwordHash,
          isSU,
          createdAt: new Date(),
        });
      });

      dispatch(
        setUser({
          _id: String(newUser._id),
          email: newUser.email,
          name: newUser.name,
          isSU: newUser.isSU,
        })
      );
    } catch (e: any) {
      console.error(e);
      Alert.alert("Kayıt başarısız", e?.message ?? "Bilinmeyen hata");
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <Input label="Full Name" value={name} onChangeText={setName} placeholder="Ad Soyad" />
      <Input
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        placeholder="you@mail.com"
      />
      <Input
        label="Password"
        value={pass}
        onChangeText={setPass}
        secureTextEntry
        placeholder="••••••••"
      />
      <Button title={busy ? "Please wait..." : "Sign Up"} onPress={onSignUp} disabled={busy} />

      <Text
        style={styles.hintLink}
        onPress={() => navigation.navigate("Login")}
      >
        Zaten hesabın var mı? Giriş yap.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 16, textAlign: "center" },
  hintLink: { marginTop: 12, color: "#1D4ED8", textAlign: "center" },
});
