import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Image, StyleSheet, SafeAreaView,
  Alert, Platform, Linking, Dimensions, ScrollView
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Accelerometer } from 'expo-sensors';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../firebaseConfig';  // ไม่ต้อง import storage แล้ว
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { addNotification } from '../utils/notifications';
import axios from 'axios';

const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dl9niyi9k/image/upload';
const CLOUDINARY_UPLOAD_PRESET = 'uploads'; // ใช้ Preset ที่ตั้งค่าเป็น Unsigned
const uploadToCloudinary = async (uri) => {
  const data = new FormData();
  data.append('file', {
    uri,
    type: 'image/jpeg', // หรือ 'image/png' ขึ้นอยู่กับประเภทไฟล์
    name: uri.split('/').pop(), // ตั้งชื่อไฟล์ตามชื่อไฟล์ในระบบ
  });
  data.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  try {
    const res = await axios.post(CLOUDINARY_URL, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data.secure_url;  // คืนค่าที่อยู่ URL ของภาพที่อัปโหลด
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

const { width } = Dimensions.get('window');

export default function PostItemScreen({ route, navigation }) {
  const [media, setMedia] = useState([]);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState(null);
  const { photoUri } = route.params || {}; 

  useEffect(() => {
    if (photoUri) {
      setMedia((prev) => [...prev, { uri: photoUri }]);
    }
  }, [photoUri]);

  useEffect(() => {
    (async () => {
      await ImagePicker.requestCameraPermissionsAsync();
      await Location.requestForegroundPermissionsAsync();
    })();
  }, []);

  useEffect(() => {
    let subscription;
    let lastShakeTime = 0;
    const subscribe = () => {
      subscription = Accelerometer.addListener(({ x, y, z }) => {
        const magnitude = Math.sqrt(x * x + y * y + z * z);
        const now = Date.now();
        if (magnitude > 2.5 && now - lastShakeTime > 2000) {
          lastShakeTime = now;
          openCameraAutomatically();
        }
      });
      Accelerometer.setUpdateInterval(300);
    };
    subscribe();
    return () => { if (subscription) subscription.remove(); };
  }, []);

  const openCameraAutomatically = async () => {
    try {
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
        const newPhoto = { uri: result.assets[0].uri };
        setMedia(prev => [...prev, newPhoto]);  // ✅ อัปเดต media ที่นี่เลย
      }
    } catch (error) {
      console.log('เกิดข้อผิดพลาด:', error);
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
      setMedia((prev) => [...prev, result.assets[0]]);
    }
  };

  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.85,
    });
    if (!result.canceled && result.assets?.length > 0) {
      setMedia((prev) => [...prev, ...result.assets]);
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
    const updated = [...media];
    updated.splice(index, 1);
    setMedia(updated);
  };

  const uploadPost = async () => {
    if (media.length === 0 || !title.trim() || !price.trim() || !category) {
      Alert.alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
  
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('กรุณาเข้าสู่ระบบก่อนโพสต์สินค้า');
        return;
      }
      const currentUserId = user.uid;
  
      const mediaUrls = [];
      // อัปโหลดแต่ละรูปไปยัง Cloudinary
      for (const m of media) {
        const cloudinaryUrl = await uploadToCloudinary(m.uri);
        mediaUrls.push(cloudinaryUrl);  // เก็บ URL ของภาพที่อัปโหลด
      }
  
      // เพิ่มข้อมูลโพสต์ลง Firestore
      const postRef = await addDoc(collection(db, 'posts'), {
        title,
        price: parseFloat(price),
        description,
        category,
        location,
        mediaUrls,
        createdAt: serverTimestamp(),
        userId: currentUserId,
      });
  
      // ✅ ส่งแจ้งเตือนหลังโพสต์สำเร็จ
      await addNotification(
        user.photoURL,
        user.displayName,
        'อัปโหลดโพสต์สำเร็จแล้ว',
        'โพสต์ใหม่',
        mediaUrls[0], // เอารูปแรก
        postRef.id
      );
  
      Alert.alert('โพสต์สำเร็จ');
      navigation.navigate('Home');
    } catch (error) {
      console.log(error);
      Alert.alert('เกิดข้อผิดพลาดขณะโพสต์');
    }
  };
  

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>โพสต์สินค้าใหม่</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
          {media.map((item, index) => (
            item.uri && (
              <TouchableOpacity key={index} onPress={() => removeImage(index)}>
                <Image source={{ uri: item.uri }} style={styles.bigImageBox} />
              </TouchableOpacity>
            )
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

        <TouchableOpacity style={styles.postButton} onPress={uploadPost}>
          <Text style={styles.postText}>โพสต์สินค้า</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fefefe' },
  container: { padding: 20 },
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
    color: '#007AFF', // เปลี่ยนเป็นสีที่ต้องการ
    textDecorationLine: 'underline', // ทำให้เป็นลิงค์
    marginLeft: 20, // ระยะห่างจากข้อความ "เพิ่มตำแหน่งที่ตั้ง"
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
