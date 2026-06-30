import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { useAuth } from '../context/AuthContext';

import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import ModuleScreen from '../screens/ModuleScreen';
import LessonScreen from '../screens/LessonScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const NAV_THEME = {
  dark: true,
  colors: {
    primary: '#ff3b33',
    background: '#0a0a0b',
    card: '#101012',
    text: '#ece8e2',
    border: 'rgba(236,232,226,0.1)',
    notification: '#ff3b33',
  },
  fonts: {
    regular: { fontFamily: 'System', fontWeight: '400' },
    medium: { fontFamily: 'System', fontWeight: '500' },
    bold: { fontFamily: 'System', fontWeight: '700' },
    heavy: { fontFamily: 'System', fontWeight: '900' },
  },
};

const STACK_OPTS = {
  headerStyle: { backgroundColor: '#101012' },
  headerTintColor: '#ece8e2',
  headerTitleStyle: { fontWeight: '700', fontSize: 16 },
  headerBackTitleVisible: false,
};

function CourseStack() {
  return (
    <Stack.Navigator screenOptions={STACK_OPTS}>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: '高橋帝国' }}
      />
      <Stack.Screen
        name="Module"
        component={ModuleScreen}
        options={{ title: 'モジュール' }}
      />
      <Stack.Screen
        name="Lesson"
        component={LessonScreen}
        options={{ title: 'レッスン' }}
      />
    </Stack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#101012',
          borderTopColor: 'rgba(236,232,226,0.1)',
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: '#ff3b33',
        tabBarInactiveTintColor: '#4a4a50',
        tabBarLabelStyle: { fontSize: 11, marginTop: -2 },
      }}
    >
      <Tab.Screen
        name="CourseStack"
        component={CourseStack}
        options={{
          title: 'コース',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>▤</Text>,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'マイページ',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>◉</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) return null;

  return (
    <NavigationContainer theme={NAV_THEME}>
      {user ? (
        <MainTabs />
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
