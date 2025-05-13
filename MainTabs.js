import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'; // ต้องมีการ import Tab
import HomeScreen from './screens/HomeScreen';
import SearchScreen from './screens/SearchScreen';
import PostItemScreen from './screens/PostItemScreen';
import MessageScreen from './screens/MessageScreen'; 
import ProfileScreen from './screens/ProfileScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack'; 

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function CustomPostButton(props) {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      {...props}
      onPress={() => navigation.navigate('โพสต์ใหม่ของคุณ')}
      style={styles.postButton}
    >
      <Text style={styles.plus}>+</Text>
    </TouchableOpacity>
  );
}

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#FF6F00',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          height: 70,
          paddingBottom: 5,
          paddingTop: 5,
          position: 'absolute',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          backgroundColor: '#fff',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="home-outline" size={30} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="search-outline" size={30} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="โพสต์ใหม่ของคุณ"
        component={PostItemScreen}
        options={{
          tabBarButton: (props) => <CustomPostButton {...props} />,
          tabBarIcon: () => null,  // No icon for this button
        }}
      />
      <Tab.Screen
        name="Message"
        component={MessageScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="chatbubble-outline" size={30} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-outline" size={30} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
    postButton: {
      position: 'absolute',                // ทำให้ลอยขึ้นมา
      bottom: Platform.OS === 'ios' ? 0 : 15,  // ปรับขึ้นลง ตามต้องการ
      alignSelf: 'center',                 // จัดกึ่งกลางแนวนอน
      backgroundColor: '#FFA500',
      width: 60,
      height: 60,
      borderRadius: 30,                    // = width/2
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOpacity: 0.2,
      shadowOffset: { width: 0, height: 4 },
      elevation: 8,
      zIndex: 10,
    },
    plus: {
      fontSize: 36,
      color: '#fff',
      fontWeight: 'bold',
      marginTop: -2,

  },
});
