import React, { useEffect, useState } from 'react'; 
import { SafeAreaView, View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, TextInput, Linking, Share, RefreshControl, Alert, Dimensions, FlatList } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { doc, updateDoc, arrayUnion, arrayRemove, onSnapshot } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '../firebaseConfig';
import { addNotification } from '../utils/notifications';
import { Ionicons } from '@expo/vector-icons';

export default function ProductDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { postId } = route.params;

  const [post, setPost] = useState(null);
  const [userName, setUserName] = useState('');
  const [userImage, setUserImage] = useState('');
  const [userId, setUserId] = useState('');
  const [comment, setComment] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const screenWidth = Dimensions.get('window').width;
  const imageHeight = screenWidth * 1.1; // Adjust image height proportionally

  // Fetch user data and post data with real-time updates using onSnapshot
  useEffect(() => {
    const auth = getAuth();
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid); 
        if (!userName) setUserName(user.displayName || 'ผู้ใช้');
        if (!userImage) setUserImage(user.photoURL || 'https://path/to/your/default/gray/image.jpg');

        // Fetch user data (with real-time updates)
        const userDocRef = doc(db, 'users', user.uid);
        const unsubscribeUser = onSnapshot(userDocRef, (userDoc) => {
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserName(prevName => prevName || userData.username);
            setUserImage(prevImage => prevImage || userData.profileImage);
          }
        });

        // Cleanup on unmount
        return () => unsubscribeUser();
      }
    });

    // Cleanup listeners on component unmount
    return () => unsubscribeAuth();
  }, []);

  // Fetch post data with real-time updates using onSnapshot
  useEffect(() => {
    const postRef = doc(db, 'posts', postId);
    const unsubscribePost = onSnapshot(postRef, (postDoc) => {
      if (postDoc.exists()) {
        const data = postDoc.data();
        setPost({ id: postDoc.id, ...data });
      }
    });

    // Cleanup listener on unmount
    return () => unsubscribePost();
  }, [postId]);

  const onRefresh = async () => {
    setRefreshing(true);
    setRefreshing(false);
  };

  const toggleLike = async () => {
    if (!post || !userId) return;
    const liked = post.likedBy?.includes(userId);
    try {
      const ref = doc(db, 'posts', postId);
      await updateDoc(ref, {
        likedBy: liked
          ? arrayRemove(userId)
          : arrayUnion(userId),
      });
      setPost((prev) => ({
        ...prev,
        likedBy: liked
          ? prev.likedBy.filter((id) => id !== userId)
          : [...(prev.likedBy || []), userId],
      }));
    } catch (err) {
      console.error('Like toggle error:', err);
    }
  };

  const handleLocationPress = () => {
    if (post.location) {
      const { latitude, longitude } = post.location;
      const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
      Linking.openURL(url);
    }
  };

  const handleCommentSubmit = async () => {
    if (!comment.trim()) return;  // ถ้าคอมเมนต์ว่างไม่ทำอะไร

    try {
      const ref = doc(db, 'posts', postId);  // ดึงโพสต์จาก Firestore
      const newComment = {
        username: userName,
        text: comment.trim(),
        timestamp: new Date(),
      };

      // เพิ่มคอมเมนต์ในอาเรย์ของโพสต์
      await updateDoc(ref, { comments: arrayUnion(newComment) });

      // ส่งการแจ้งเตือนหากโพสต์ไม่ได้เป็นของผู้ใช้คนเดียวกัน
      if (post.userId && userId !== post.userId) {
        const user = getAuth().currentUser;
        await addNotification(
          user.photoURL,  // รูปโปรไฟล์ผู้ใช้
          user.displayName, // ชื่อผู้ใช้
          comment.trim(), // ข้อความคอมเมนต์
          'คอมเมนต์ใหม่', // สถานะ
          post.mediaUrls?.[0] || null, // รูปโพสต์ (ถ้ามี)
          postId // postId ของโพสต์
        );
      }

      setComment('');  // รีเซ็ตฟิลด์คอมเมนต์
    } catch (err) {
      console.error('Error adding comment:', err);
      Alert.alert('Error', 'ไม่สามารถส่งความคิดเห็นได้');
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `ดูสิน้านี้: ${post.title} ราคา ${post.price} บาท`,
      });
    } catch (err) {
      console.error('Share error:', err);
    }
  };

  const handleReport = () => {
    // Navigate to the ReportPost screen and pass the postId
    navigation.navigate('ReportPost', { postId });
  };

  if (!post) return <Text style={styles.loading}>กำลังโหลด...</Text>;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>

        {/* Header with Back Button and Report Button */}
        <View style={styles.header}>
          {/* Back Button */}
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back-outline" size={28} color="#333" />
          </TouchableOpacity>

          {/* User Info */}
          <Image
            source={{ uri: userImage || 'https://path/to/your/default/gray/image.jpg' }}
            style={styles.profileImage}
          />
          <Text style={styles.username}>{userName}</Text>

          {/* Report Button */}
          <TouchableOpacity onPress={handleReport} style={styles.reportButton}>
            <Text style={styles.report}>🚨 รายงาน</Text>
          </TouchableOpacity>
        </View>


        <FlatList
          data={post.mediaUrls || []}
          horizontal
          pagingEnabled
          keyExtractor={(_, idx) => idx.toString()}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <Image source={{ uri: item }} style={{ width: screenWidth, height: imageHeight, resizeMode: 'cover' }} />
          )}
        />

        <View style={styles.info}>
          <Text style={styles.price}>{post.price} บาท</Text>
          <Text style={styles.title}>{post.title}</Text>
          <Text style={styles.desc}>{post.description}</Text>
          <TouchableOpacity onPress={handleLocationPress}>
            <Text style={styles.location}>
              📍{' '}
              {post.location
                ? `${post.location.latitude.toFixed(4)}, ${post.location.longitude.toFixed(4)}`
                : 'ไม่ระบุสถานที่'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity onPress={toggleLike} style={styles.likeBtn}>
            <Text style={styles.likeTxt}>
              {post.likedBy?.includes(userId) ? '💖 ยกเลิกถูกใจ' : '🤍 ถูกใจ'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
            <Text style={styles.shareTxt}>📤 แชร์</Text>
          </TouchableOpacity>
        </View>

        {/* Comments Section */}
        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>ความคิดเห็น</Text>
          {post.comments?.length ? (
            post.comments.map((c, idx) => (
              <View key={idx} style={styles.commentBox}>
                <Text style={styles.commentUser}>{c.username}</Text>
                <Text style={styles.commentText}>{c.text}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noComments}>ยังไม่มีความคิดเห็น</Text>
          )}
          <TextInput
            style={styles.input}
            placeholder="พิมพ์ความคิดเห็น..."
            value={comment}
            onChangeText={setComment}
          />
          <TouchableOpacity onPress={handleCommentSubmit} style={styles.sendBtn}>
            <Text style={styles.sendTxt}>โพสต์ความคิดเห็น</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#FFF',
  },
  backButton: {
    marginRight: 10,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  reportButton: {
    marginLeft: 10,
  },
  report: {
    fontSize: 18,
    color: '#E53935',
  },

  loading: { marginTop: 100, textAlign: 'center', fontSize: 16, color: '#777' },

  info: { padding: 20 },
  price: { fontSize: 24, color: '#FF6B00', fontWeight: 'bold' },
  title: { fontSize: 20, fontWeight: '600', marginVertical: 10, color: '#333' },
  desc: { fontSize: 15, color: '#666', lineHeight: 22 },
  location: { marginTop: 10, color: '#007BFF', textDecorationLine: 'underline' },

  actions: {
    flexDirection: 'row',
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  likeBtn: {
    flex: 1,
    marginRight: 10,
    paddingVertical: 10,
    backgroundColor: '#f9bdbb',
    borderRadius: 30,
    alignItems: 'center',
  },
  shareBtn: {
    flex: 1,
    marginLeft: 10,
    paddingVertical: 10,
    backgroundColor: '#b3e5fc',
    borderRadius: 30,
    alignItems: 'center',
  },
  likeTxt: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  shareTxt: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1DA1F2',
  },

  commentsSection: { padding: 20, backgroundColor: '#FFF' },
  commentsTitle: { fontSize: 18, fontWeight: '600', marginBottom: 10 },
  commentBox: { borderBottomWidth: 1, borderColor: '#EEE', paddingVertical: 10 },
  commentUser: { fontWeight: '600', color: '#444' },
  commentText: { marginLeft: 10, color: '#555' },
  noComments: { color: '#888' },
  input: { borderWidth: 1, borderColor: '#DDD', borderRadius: 20, padding: 10, marginTop: 15 },
  sendBtn: { marginTop: 10, backgroundColor: '#FF6B00', padding: 12, borderRadius: 20, alignItems: 'center' },
  sendTxt: { color: '#FFF', fontWeight: '600' },
});
