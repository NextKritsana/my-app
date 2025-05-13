import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Image, StyleSheet, SafeAreaView,
  Alert, Platform, Linking, Dimensions, ScrollView
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { getAuth } from 'firebase/auth';
import { db } from '../firebaseConfig'; 
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function EditPostScreen({ route, navigation }) {
  const { postId } = route.params;  // Receive postId from params
  const [post, setPost] = useState(null);
  const [media, setMedia] = useState([]);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const postRef = doc(db, 'posts', postId);
        const postDoc = await getDoc(postRef);
        if (postDoc.exists()) {
          const postData = postDoc.data();
          setPost(postData);
          setTitle(postData.title);
          setPrice(postData.price.toString());
          setDescription(postData.description);
          setCategory(postData.category);
          setLocation(postData.location);
          setMedia(postData.mediaUrls);
        } else {
          Alert.alert('ไม่พบโพสต์');
        }
      } catch (error) {
        console.error(error);
        Alert.alert('เกิดข้อผิดพลาดในการโหลดข้อมูลโพสต์');
      }
    };

    fetchPost();
  }, [postId]);

  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.85,
    });
    if (!result.canceled && result.assets?.length > 0) {
      setMedia(result.assets.map(item => item.uri));  // Update media
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('ต้องอนุญาตเข้าถึงกล้องก่อน');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      cameraType: ImagePicker.CameraType.back,
      allowsEditing: true,
      quality: 0.85,
    });
    if (!result.canceled && result.assets?.length > 0) {
      setMedia((prev) => [...prev, result.assets[0].uri]);  // Add new photo to media
    }
  };

  const chooseMediaOption = () => {
    Alert.alert('เลือกรูป', 'คุณต้องการเพิ่มอะไร?', [
      { text: '📷 ถ่ายรูป', onPress: takePhoto },
      { text: '🖼️ เลือกจากคลัง', onPress: pickFromGallery },
      { text: 'ยกเลิก', style: 'cancel' },
    ]);
  };

  const chooseCategory = () => {
    Alert.alert('เลือกหมวดหมู่', '', [
      { text: 'แฟชั่น', onPress: () => setCategory('แฟชั่น') },
      { text: 'เสื้อผ้า', onPress: () => setCategory('เสื้อผ้า') },
      { text: 'รองเท้า', onPress: () => setCategory('รองเท้า') },
      { text: 'กระเป๋า', onPress: () => setCategory('กระเป๋า') },
      { text: 'อุปกรณ์', onPress: () => setCategory('อุปกรณ์') },
      { text: 'ตุ๊กตา', onPress: () => setCategory('ตุ๊กตา') },
      { text: 'อื่น ๆ', onPress: () => setCategory('อื่น ๆ') },
      { text: 'ยกเลิก', style: 'cancel' },
    ]);
  };

  const getLocation = async () => {
    try {
      const { coords } = await Location.getCurrentPositionAsync({});
      setLocation(coords);
    } catch (error) {
      console.log('Error getting location:', error);
      Alert.alert('เกิดข้อผิดพลาดในการดึงตำแหน่ง');
    }
  };

  const openMap = () => {
    if (location) {
      const { latitude, longitude } = location;
      const url = Platform.OS === 'ios'
        ? `http://maps.apple.com/?q=${latitude},${longitude}`
        : `https://maps.google.com/?q=${latitude},${longitude}`;
      Linking.openURL(url);
    }
  };

  const removeImage = (index) => {
    const updatedMedia = [...media];
    updatedMedia.splice(index, 1);
    setMedia(updatedMedia);  // Remove image from the media array
  };

  const updatePost = async () => {
    if (!title.trim() || !price.trim() || !category || !media.length) {
      Alert.alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    try {
      const postRef = doc(db, 'posts', postId);

      // Update post details in Firestore
      await updateDoc(postRef, {
        title,
        price: parseFloat(price),
        description,
        category,
        location,
        mediaUrls: media, // Update media URLs
      });

      Alert.alert('โพสต์ถูกอัปเดตแล้ว');
      navigation.goBack();  // Go back after updating
    } catch (error) {
      console.error('Error updating post:', error);
      Alert.alert('เกิดข้อผิดพลาดในการอัปเดตโพสต์');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* ปุ่มย้อนกลับ */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>

        <Text style={styles.header}>แก้ไขโพสต์สินค้า</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
          {media.map((item, index) => (
            <TouchableOpacity key={index} onPress={() => removeImage(index)}>
              <Image source={{ uri: item }} style={styles.bigImageBox} />
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.addBox} onPress={chooseMediaOption}>
            <Ionicons name="add" size={40} color="#aaa" />
          </TouchableOpacity>
        </ScrollView>

        <TextInput style={styles.input} placeholder="ชื่อสินค้า ✨" value={title} onChangeText={setTitle} />
        <TextInput style={styles.input} placeholder="รายละเอียดสินค้า..." value={description} onChangeText={setDescription} multiline />
        <TextInput style={styles.input} placeholder="ราคา (บาท)" value={price} onChangeText={setPrice} keyboardType="numeric" />

        <TouchableOpacity style={styles.option} onPress={chooseCategory}>
          <MaterialIcons name="category" size={20} color="#555" />
          <Text style={styles.optionText}>{category ? `หมวดหมู่: ${category}` : 'เลือกหมวดหมู่'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.option} onPress={getLocation}>
          <Ionicons name="location-outline" size={20} color="#555" />
          <Text style={styles.optionText}>
            เพิ่มตำแหน่งที่ตั้ง:
            {location && (
              <TouchableOpacity onPress={openMap}>
                <Text style={styles.locationText}>
                  📍 {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                </Text>
              </TouchableOpacity>
            )}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.postButton} onPress={updatePost}>
          <Text style={styles.postText}>อัปเดตโพสต์</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fefefe' },
  container: { padding: 20 },
  backButton: {
    marginBottom: 20,
  },
  header: { fontSize: 26, fontWeight: '700', color: '#000', textAlign: 'center', marginBottom: 25 },
  bigImageBox: {
    width: width * 0.65,
    height: width * 0.65,
    borderRadius: 15,
    marginRight: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
  },
  addBox: {
    width: width * 0.65,
    height: width * 0.65,
    borderRadius: 15,
    backgroundColor: '#f1f1f1',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ccc',
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#eee',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  optionText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#444',
  },
  locationText: {
    color: '#007AFF',
    textDecorationLine: 'underline',
    marginLeft: 20,
  },
  postButton: {
    backgroundColor: '#FF6F00',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    marginTop: 10,
  },
  postText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
  },
});
