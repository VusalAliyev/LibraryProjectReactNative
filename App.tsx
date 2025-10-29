import React from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { Provider } from "react-redux";
import { RealmProvider } from "./src/realm";
import RootNavigator from "./src/nav/RootNavigator";
import { store } from "./src/store";

const navTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: "#ffffff" }
};

export default function App() {
  return (
    <RealmProvider>
      <Provider store={store}>
        <NavigationContainer theme={navTheme}>
          <RootNavigator />
        </NavigationContainer>
      </Provider>
    </RealmProvider>
  );
}
