import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert,
  ScrollView, SafeAreaView, Image, RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { db } from '../firebaseConfig';
import { collection, onSnapshot, query, orderBy, deleteDoc, doc, getDocs, writeBatch } from 'firebase/firestore';

export default function Message() {
  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false); // State to handle refreshing
  const navigation = useNavigation();

  // Fetch notifications when component mounts
  useEffect(() => {
    const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newNotifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setNotifications(newNotifications);
    });
    return () => unsubscribe();
  }, []);

  const handleNotification = (notification) => {
    if (notification.postId) {
      navigation.navigate('สินค้า', { postId: notification.postId });
    } else {
      Alert.alert('แจ้งเตือน', `${notification.username} พูดว่า: ${notification.comment}`);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await deleteDoc(doc(db, 'notifications', id));
    } catch (error) {
      console.error('ลบไม่สำเร็จ:', error);
    }
  };

  const clearAllNotifications = async () => {
    try {
      const q = query(collection(db, 'notifications'));
      const snapshot = await getDocs(q);
      const batch = writeBatch(db);
      snapshot.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
    } catch (error) {
      console.error('ล้างทั้งหมดล้มเหลว:', error);
    }
  };

  // Handle refresh action
  const onRefresh = async () => {
    setRefreshing(true);
    
    try {
      const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const newNotifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setNotifications(newNotifications); // Update state with new notifications
    } catch (error) {
      console.error('Error refreshing notifications:', error);
    }
    
    setRefreshing(false); // Stop refreshing animation after data is fetched
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing} // Show refreshing indicator while loading
            onRefresh={onRefresh}  // Trigger refresh when pulled down
          />
        }
      >

        {/* Clear all notifications button */}
        {notifications.length > 0 && (
          <TouchableOpacity onPress={clearAllNotifications} style={styles.clearAllButton}>
            <Text style={styles.clearAllText}>ล้างทั้งหมด</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.header}>🔔 การแจ้งเตือนของคุณ</Text>

        {notifications.length > 0 ? (
          notifications.map((notification, index) => (
            <TouchableOpacity
              key={index}
              style={styles.notificationItem}
              onPress={() => handleNotification(notification)}
            >
              <View style={styles.notificationContent}>

                {/* Profile image */}
                {notification.userProfileImage && (
                  <Image
                    source={{ uri: notification.userProfileImage }}
                    style={styles.avatar}
                  />
                )}

                {/* Notification content */}
                <View style={{ flex: 1 }}>
                  <Text style={styles.notificationText}>
                    <Text style={styles.username}>{notification.username}</Text> ✅ {notification.comment}
                  </Text>
                </View>

                {/* Post image */}
                {notification.postImage && (
                  <Image
                    source={{ uri: notification.postImage }}
                    style={styles.postImage}
                  />
                )}

                {/* Button to view post */}
                {notification.postId && (
                  <TouchableOpacity onPress={() => handleNotification(notification)} style={styles.viewPostButton}>
                    <Ionicons name="arrow-forward-circle-outline" size={24} color="#4CAF50" />
                  </TouchableOpacity>
                )}

                {/* Delete button */}
                <TouchableOpacity onPress={() => deleteNotification(notification.id)} style={styles.deleteButton}>
                  <Ionicons name="trash-outline" size={20} color="#888" />
                </TouchableOpacity>

              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={60} color="#ddd" />
            <Text style={styles.noNotifications}>ยังไม่มีการแจ้งเตือน</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  container: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
  },
  clearAllButton: {
    alignSelf: 'flex-end',
    marginBottom: 10,
  },
  clearAllText: {
    color: 'red',
    fontWeight: 'bold',
    fontSize: 16,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
    textAlign: 'center',
  },
  notificationItem: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 12,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  postImage: {
    width: 24,
    height: 24,
    borderRadius: 4,
    marginLeft: 10,
  },
  notificationText: {
    fontSize: 15,
    color: '#333',
  },
  username: {
    fontWeight: 'bold',
    color: '#FF8C42',
  },
  deleteButton: {
    padding: 5,
    marginLeft: 10,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  noNotifications: {
    marginTop: 10,
    fontSize: 16,
    color: '#aaa',
  },
});
