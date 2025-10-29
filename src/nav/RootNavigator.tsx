import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AppTabs from "./AppTabs";
import Login from "../screens/auth/Login";
import SignUp from "../screens/auth/SignUp";
import BookForm from "../screens/books/BookForm";
import BookDetails from "../screens/books/BookDetails";
import { useAppSelector } from "../store";

export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
  BookForm: { id?: string } | undefined;
  BookDetails: { id: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { user } = useAppSelector(s => s.session);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <Stack.Screen name="Auth" component={AuthStack} />
      ) : (
        <>
          <Stack.Screen name="App" component={AppTabs} />
          <Stack.Screen name="BookForm" component={BookForm} />
          <Stack.Screen name="BookDetails" component={BookDetails} />
        </>
      )}
    </Stack.Navigator>
  );
}

function AuthStack() {
  const Auth = createNativeStackNavigator();
  return (
    <Auth.Navigator>
      <Auth.Screen name="Login" component={Login} options={{ title: "Login" }} />
      <Auth.Screen name="SignUp" component={SignUp} options={{ title: "Sign Up" }} />
    </Auth.Navigator>
  );
}
