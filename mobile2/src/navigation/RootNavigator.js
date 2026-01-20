import React from "react";
import { Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { LoginScreen } from "../screens/LoginScreen";
import { SignupScreen } from "../screens/SignupScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { DevicesScreen } from "../screens/DevicesScreen";
import { DeviceDetailScreen } from "../screens/DeviceDetailScreen";
import { AddDeviceScreen } from "../screens/AddDeviceScreen";
import { ScanQRScreen } from "../screens/ScanQRScreen";
import { AccessHistoryScreen } from "../screens/AccessHistoryScreen";
import { ProfileScreen } from "../screens/ProfileScreen";

import { Colors } from "../constants/theme";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const AuthStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
    </Stack.Navigator>
  );
};

const HomeStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="HomeTab" component={HomeScreen} />
    </Stack.Navigator>
  );
};

const DevicesStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="DevicesTab" component={DevicesScreen} />
      <Stack.Screen name="DeviceDetail" component={DeviceDetailScreen} />
      <Stack.Screen name="AddDevice" component={AddDeviceScreen} />
    </Stack.Navigator>
  );
};

const AppStack = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textTertiary,
        tabBarStyle: {
          borderTopColor: Colors.border,
          backgroundColor: Colors.surface,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          tabBarLabel: "Inicio",
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🏠</Text>,
        }}
      />
      <Tab.Screen
        name="Devices"
        component={DevicesStack}
        options={{
          tabBarLabel: "Dispositivos",
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>📱</Text>,
        }}
      />
      <Tab.Screen
        name="Scan"
        component={ScanQRScreen}
        options={{
          tabBarLabel: "Escanear",
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>📲</Text>,
        }}
      />
      <Tab.Screen
        name="History"
        component={AccessHistoryScreen}
        options={{
          tabBarLabel: "Historial",
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>📋</Text>,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: "Perfil",
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
};

export const RootNavigator = ({ isAuthenticated }) => {
  return (
    <NavigationContainer key={isAuthenticated ? 'authenticated' : 'anonymous'}>
      {isAuthenticated ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
};
