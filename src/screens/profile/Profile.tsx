import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Button from "../../components/Button";
import { useAppDispatch, useAppSelector } from "../../store";
import { setUser } from "../../store/slices/session";

export default function Profile() {
  const { user } = useAppSelector(s => s.session);
  const dispatch = useAppDispatch();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      {user ? (
        <>
          <Text style={styles.line}>Email: {user.email}</Text>
          <Text style={styles.line}>Name: {user.name}</Text>
          <Text style={styles.line}>Role: {user.isSU ? "Admin" : "User"}</Text>
          <Button title="Logout" onPress={() => dispatch(setUser(null))} style={{ marginTop: 16 }}/>
        </>
      ) : (
        <Text>No session</Text>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container:{flex:1,padding:16},
  title:{fontSize:20,fontWeight:"700",marginBottom:8},
  line:{marginTop:6}
});
