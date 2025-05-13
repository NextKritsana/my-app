import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, FlatList, TouchableOpacity, Image, StyleSheet, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { getAuth } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const screenWidth = Dimensions.get('window').width;
const itemWidth = (screenWidth - 30) / 2; // Adjusted for padding/margin

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState([]);
  const [currentUserId, setCurrentUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  // Get current user UID once
  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      setCurrentUserId(user.uid);
    } else {
      setLoading(false);
    }
  }, []);

  // Subscribe to liked posts when UID is available
  useEffect(() => {
    if (!currentUserId) return;
    const unsubscribe = onSnapshot(collection(db, 'posts'), (snapshot) => {
      const liked = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(post => post.likedBy?.includes(currentUserId));
      setFavorites(liked);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [currentUserId]);

  const handleItemPress = (item) => {
    if (item.isSold) {
      // Show alert when clicking on sold items
      Alert.alert("สินค้าหมด", "สินค้าชิ้นนี้ขายไปแล้วไม่สามารถดูได้");
    } else {
      // Navigate to product detail if it's not sold
      navigation.navigate('สินค้า', { postId: item.id });
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => handleItemPress(item)}
    >
      <Image source={{ uri: item.mediaUrls[0] }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.price}>฿{item.price}</Text>
      </View>
      {item.isSold && (
        <View style={styles.soldTag}>
          <Text style={styles.soldText}>หมดแล้ว</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FF7F50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>สินค้าที่ถูกใจ 💖</Text>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#FF7F50" style={styles.loading} />
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          numColumns={2}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFF7F0',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FF7F50',
  },
  list: {
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 100,
  },
  card: {
    width: itemWidth,
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 15,
    marginHorizontal: 5,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  image: {
    width: '100%',
    height: itemWidth,
    resizeMode: 'cover',
  },
  info: {
    padding: 10,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  price: {
    fontSize: 14,
    color: '#FF7F50',
    fontWeight: 'bold',
  },
  soldTag: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  soldText: {
    color: '#fff',
    fontSize: 25,
    fontWeight: 'bold',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
