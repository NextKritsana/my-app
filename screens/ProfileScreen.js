import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, FlatList, TouchableOpacity, Image, StyleSheet, Alert, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '../firebaseConfig'; 
import { collection, query, onSnapshot, doc, getDoc, deleteDoc, updateDoc } from 'firebase/firestore'; 

const ProfileScreen = ({ navigation, route }) => {
  const [posts, setPosts] = useState([]);  
  const [userName, setUserName] = useState('');  // Default username from Firebase Auth
  const [userImage, setUserImage] = useState('');  // Default user profile image
  const [userId, setUserId] = useState('');  
  const [tabSelected, setTabSelected] = useState('posted'); 
  const [refreshing, setRefreshing] = useState(false); // State to handle refreshing

  // Fetch profile data when screen is focused or when coming back from EditProfileScreen
  useEffect(() => {
    const auth = getAuth();
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid); 
        if (!userName) setUserName(user.displayName || 'ผู้ใช้');  // Default name from Firebase Auth, only if userName is empty
        if (!userImage) setUserImage(user.photoURL || 'https://path/to/your/default/gray/image.jpg');  // Default profile image if not available
  
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserName(prevName => prevName || userData.username || userName);  // Set the updated username if available
            setUserImage(prevImage => prevImage || userData.profileImage || userImage);  // Set the updated profile image if available
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    });
  
    // Cleanup listeners on component unmount
    return () => {
      unsubscribeAuth();
    };
  }, []);

  // Update profile data if params from EditProfileScreen are available
  useEffect(() => {
    if (route.params?.updatedUserName || route.params?.updatedUserImage) {
      setUserName(route.params.updatedUserName || userName);
      setUserImage(route.params.updatedUserImage || userImage);
    }
  }, [route.params]); // Listen for changes in route.params

  useEffect(() => {
    if (!userId) return;

    // Fetching posts from Firestore
    const postsRef = collection(db, 'posts');
    const q = query(postsRef); 

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const postsData = [];
      querySnapshot.forEach((doc) => {
        const post = { ...doc.data(), id: doc.id };
        if (post.likedBy?.includes(userId) || tabSelected !== 'liked') {
          postsData.push(post);
        }
      });
      setPosts(postsData); 
    });

    return () => unsubscribe(); 
  }, [userId, tabSelected]);

  const getFilteredPosts = () => {
    if (tabSelected === 'posted') {
      return posts.filter(post => post.userId === userId && !post.isSold); 
    } else if (tabSelected === 'sold') {
      return posts.filter(post => post.userId === userId && post.isSold); 
    } else if (tabSelected === 'liked') {
      return posts.filter(post => post.likedBy?.includes(userId)); 
    }
    return posts;
  };

  const handleDeletePost = async (postId) => {
    Alert.alert(
      'ยืนยันการลบโพสต์',
      'ต้องการลบโพสต์นี้หรือไม่?',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        { text: 'ตกลง', onPress: async () => {
            try {
              const postRef = doc(db, 'posts', postId);
              await deleteDoc(postRef);
              Alert.alert('สำเร็จ', 'โพสต์ถูกลบแล้ว');
            } catch (error) {
              console.error('Error deleting post:', error);
            }
          }
        },
      ]
    );
  };

  const handleEditPost = (postId) => {
    navigation.navigate('EditPost', { postId });
  };

  const handleConfirmSale = async (postId) => {
    Alert.alert(
      'ยืนยันการขายสินค้า',
      'ยืนยันการขายสินค้านี้แล้วหรือไม่?',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        { text: 'ตกลง', onPress: async () => {
            try {
              const postRef = doc(db, 'posts', postId);
              await updateDoc(postRef, { isSold: true });
              Alert.alert('สำเร็จ', 'สินค้าได้ขายแล้ว');
            } catch (error) {
              console.error('Error confirming sale:', error);
            }
          }
        },
      ]
    );
  };

  const onRefresh = () => {
    setRefreshing(true);

    // Re-fetching the user data and posts to refresh the whole page
    const auth = getAuth();
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid); 
        setUserName(user.displayName || 'ผู้ใช้');
        setUserImage(user.photoURL || 'https://path/to/your/default/gray/image.jpg');
  
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserName(prevName => prevName || userData.username || userName);
            setUserImage(prevImage => prevImage || userData.profileImage || userImage);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    });

    // Re-fetch posts after the user data has been refreshed
    const postsRef = collection(db, 'posts');
    const q = query(postsRef);

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const postsData = [];
      querySnapshot.forEach((doc) => {
        const post = { ...doc.data(), id: doc.id };
        if (post.likedBy?.includes(userId) || tabSelected !== 'liked') {
          postsData.push(post);
        }
      });
      setPosts(postsData); 
    });

    // Simulate a delay to stop the refresh indicator
    setTimeout(() => {
      setRefreshing(false);
    }, 2000); 

    return () => {
      unsubscribeAuth();
      unsubscribe();
    };
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('สินค้า', { postId: item.id })}>
      <Image source={{ uri: item.mediaUrls?.[0] || item.imageUrl }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.price}>฿{item.price}</Text>
      </View>
      {item.isSold ? (
        <View style={styles.soldTag}>
          <Text style={styles.soldText}>ขายแล้ว</Text>
        </View>
      ) : (
        tabSelected !== 'liked' && (
          <TouchableOpacity onPress={() => handleConfirmSale(item.id)} style={styles.confirmSaleButton}>
            <Text style={styles.confirmSaleText}>ขาย</Text>
          </TouchableOpacity>
        )
      )}
      {!item.isSold && (
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => handleEditPost(item.id)} style={styles.actionButton}>
            <Ionicons name="pencil-outline" size={20} color="#FF914D" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDeletePost(item.id)} style={styles.actionButton}>
            <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {/* User profile image (circle) */}
        <Image
          source={{ uri: userImage || 'https://path/to/your/default/gray/image.jpg' }} // Display default if no image
          style={styles.profileImage}
        />
        <Text style={styles.username}>{userName}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.settingsIcon}>
          <Ionicons name="settings-outline" size={28} color="#333" />
        </TouchableOpacity>
      </View>
  
      <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('EditProfile')}>
        <Text style={styles.editButtonText}>แก้ไขโปรไฟล์</Text>
      </TouchableOpacity>
  
      <View style={styles.tabs}>
        {['posted', 'sold', 'liked'].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setTabSelected(tab)}
            style={[styles.tab, tabSelected === tab && styles.tabActive]}
          >
            <Text style={[styles.tabText, tabSelected === tab && styles.tabTextActive]}>
              {tab === 'posted' ? 'โพสต์ขาย' : tab === 'sold' ? 'ขายแล้ว' : 'ถูกใจ'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
  
      <FlatList
        data={getFilteredPosts()}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.productList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh} // Trigger the full refresh on pull down
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFF8F3',
    paddingHorizontal: 20, 
  },
  header: {
    flexDirection: 'column',  // เพิ่มเพื่อให้รูปและชื่ออยู่ในแนวตั้ง
    alignItems: 'center',     // จัดให้อยู่กึ่งกลาง
    marginBottom: 30,
    marginTop: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#eee',  // กำหนดสีพื้นหลังให้สำหรับกรณีที่ไม่มีรูปภาพ
    marginBottom: 10,
    borderWidth: 3,
    borderColor: '#FF914D',  // ให้ border มีสีที่แตกต่าง
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, // เพิ่มความโปร่งใสของเงา
    shadowRadius: 6,
    elevation: 5,
  },
  username: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
  },
  settingsIcon: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  editButton: {
    backgroundColor: '#FF914D',
    paddingVertical: 12,
    paddingHorizontal: 40,
    alignSelf: 'center',
    borderRadius: 30,
    marginBottom: 20,
    shadowColor: '#FF914D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  tab: {
    marginHorizontal: 15,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  tabActive: {
    backgroundColor: '#FF914D',
    borderColor: '#FF914D',
  },
  tabText: {
    fontSize: 16,
    color: '#777',
  },
  tabTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  productList: {
    paddingBottom: 20,
  },
  card: {
    flex: 1,
    margin: 10,
    backgroundColor: '#fff',
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  image: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    marginHorizontal: 12,
    color: '#333',
  },
  price: {
    fontSize: 14,
    color: '#FF914D',
    marginBottom: 12,
    marginHorizontal: 12,
    fontWeight: 'bold',
  },
  soldTag: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    paddingHorizontal: 30,
    paddingVertical: 10,
  },
  soldText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 10,
    right: 10,
  },
  actionButton: {
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 50,
    marginLeft: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  confirmSaleButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 6,  
    paddingHorizontal: 12,  
    borderRadius: 25,  
    marginLeft: 5,
    maxWidth: 180,  
    width: '65',  
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginTop: 5,  
  },
  
  confirmSaleText: {
    color: '#fff',
    fontSize: 18,
  },
});

export default ProfileScreen;
