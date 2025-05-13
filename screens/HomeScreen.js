import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;
const spacing = 10;
const itemWidth = (screenWidth - spacing * 3) / 2;

const categories = ['ทั้งหมด', 'แฟชั่น', 'เสื้อผ้า', 'รองเท้า', 'กระเป๋า', 'อุปกรณ์', 'ตุ๊กตา', 'อื่นๆ'];

export default function HomeScreen() {
  const [posts, setPosts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ทั้งหมด');
  const [loading, setLoading] = useState(true); // ✅ เพิ่ม loading
  const navigation = useNavigation(); 

  useEffect(() => {
    const postsRef = collection(db, 'posts');
    const q = query(postsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedPosts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(fetchedPosts);
      setLoading(false); // ✅ เลิกโหลดเมื่อได้ข้อมูล
    }, (error) => {
      console.error('Fetch posts error:', error);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const filteredPosts = selectedCategory === 'ทั้งหมด'
    ? posts
    : posts.filter(post => post.category === selectedCategory);

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('สินค้า', { postId: item.id })}>
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: item.mediaUrls?.[0] || 'https://via.placeholder.com/150' }} 
          style={styles.image} 
          resizeMode="cover" 
        />
        <View style={styles.priceTag}>
          <Text style={styles.priceText}>{item.price ? `${item.price} บาท` : 'ไม่ระบุราคา'}</Text>
        </View>
      </View>
      <View style={styles.detailContainer}>
        <Text numberOfLines={2} style={styles.title}>{item.title || 'ไม่มีชื่อสินค้า'}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#f90" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>สำหรับคุณ</Text>
        <TouchableOpacity onPress={() => navigation.navigate('สินค้าที่ถูกใจ')}>
          <Ionicons name="heart-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* หมวดหมู่ */}
      <View style={styles.categoryBar}>
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.categoryButton, selectedCategory === item && styles.categoryButtonActive]}
              onPress={() => setSelectedCategory(item)}
            >
              <Text style={[styles.categoryText, selectedCategory === item && styles.categoryTextActive]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* สินค้า */}
      <FlatList
  data={filteredPosts}
  renderItem={renderItem}
  keyExtractor={(item) => item.id}
  numColumns={2}
  columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: spacing }}
  contentContainerStyle={styles.flatlistContent}
  ListEmptyComponent={<Text style={styles.emptyText}>ไม่มีสินค้าสำหรับหมวดนี้</Text>}
  refreshing={loading}  // Add refreshing prop
  onRefresh={() => {  // Handle refresh action
    setLoading(true);
    // Optionally, reset the data and reload it from Firestore again
    const postsRef = collection(db, 'posts');
    const q = query(postsRef, orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedPosts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(fetchedPosts);
      setLoading(false);
    }, (error) => {
      console.error('Fetch posts error:', error);
      setLoading(false);
    });
  }}
/>

    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  takePhotoButton: {
    padding: 10,
    backgroundColor: '#FF914D',
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  header: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  categoryBar: {
    height: 70, // <<< fixed ไม่ให้ขยาย
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  categoryButton: {
    backgroundColor: '#eee',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
    height: 40, // <<< fixed ขนาดหมวดหมู่
  },
  categoryButtonActive: {
    backgroundColor: '#FF6F00',
  },
  categoryText: {
    color: '#555',
    fontSize: 14,
  },
  categoryTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  flatlistContent: {
    padding: spacing,
    paddingBottom: 100,
    backgroundColor: '#fff',
  },
  card: {
    width: itemWidth,
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
  },
  imageContainer: {
    width: '100%',
    height: itemWidth,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  priceTag: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#ff8a65',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  priceText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  detailContainer: {
    padding: 8,
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'left',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#999',
  },
});
