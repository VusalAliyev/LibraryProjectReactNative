import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function Books() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Books</Text>
      <Text>CRUD ve borrow akışı bir sonraki adımda.</Text>
    </View>
  );
}
const styles = StyleSheet.create({ container:{flex:1,padding:16}, title:{fontSize:20,fontWeight:"700",marginBottom:8} });
