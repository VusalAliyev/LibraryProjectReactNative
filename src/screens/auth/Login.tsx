import React, { useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { useRealm } from "@realm/react";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { verifyPassword } from "../../utils/auth";
import { useAppDispatch } from "../../store";
import { setUser } from "../../store/slices/session";
import { useNavigation } from "@react-navigation/native";

export default function Login() {
  const realm = useRealm();
  const dispatch = useAppDispatch();
  const navigation = useNavigation<any>();

  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [busy, setBusy] = useState(false);

  const onLogin = async () => {
    if (!email || !pass) {
      Alert.alert("Hata", "E-posta ve şifre gerekli.");
      return;
    }
    try {
      setBusy(true);
      const user = realm
        .objects("User")
        .filtered("email == $0", email.trim().toLowerCase())[0] as any;

      if (!user) {
        Alert.alert("Hata", "Kullanıcı bulunamadı.");
        return;
      }

      const ok = await verifyPassword(pass, user.passwordHash);
      if (!ok) {
        Alert.alert("Hata", "Şifre hatalı.");
        return;
      }

      dispatch(
        setUser({
          _id: String(user._id),
          email: user.email,
          name: user.name,
          isSU: user.isSU,
        })
      );
    } catch (e: any) {
      console.error(e);
      Alert.alert("Giriş başarısız", e?.message ?? "Bilinmeyen hata");
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome</Text>
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
      <Button title={busy ? "Please wait..." : "Login"} onPress={onLogin} disabled={busy} />

      <Text
        style={styles.hintLink}
        onPress={() => navigation.navigate("SignUp")}
      >
        Hesabın yoksa buraya tıklayarak oluştur.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 16, textAlign: "center" },
  hintLink: { marginTop: 12, color: "#1D4ED8", textAlign: "center" },
});
