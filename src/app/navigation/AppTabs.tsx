import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Books from "../../screens/books/Books";
import MyBooks from "../../screens/my/MyBooks";
import Requests from "../../screens/requests/Requests";
import Profile from "../../screens/profile/Profile";
import { Ionicons } from "@expo/vector-icons";
import { useAppSelector } from "../../store";

export type TabsParamList = {
  Books: undefined;
  MyBooks: undefined;
  Requests: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<TabsParamList>();

export default function AppTabs() {
  const { user } = useAppSelector((s) => s.session);
  const isAdmin = !!user?.isSU;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerTitleAlign: "center",
        tabBarIcon: ({ focused, size }) => {
          const name =
            route.name === "Books"
              ? "book"
              : route.name === "MyBooks"
              ? "library"
              : route.name === "Requests"
              ? "list"
              : "person";
          return <Ionicons name={name as any} size={size} />;
        }
      })}
    >
      <Tab.Screen name="Books" component={Books} />
      <Tab.Screen name="MyBooks" component={MyBooks} options={{ title: "My Books" }}/>
      {isAdmin && <Tab.Screen name="Requests" component={Requests} />}
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}
