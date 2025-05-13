import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { getAuth, updateProfile, onAuthStateChanged } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function EditProfileScreen() {
  const auth = getAuth();
  const navigation = useNavigation();
  const [newUsername, setNewUsername] = useState('');
  const [newImage, setNewImage] = useState('');
  const [initialImage, setInitialImage] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setNewUsername(user.displayName || '');
        setInitialImage(user.photoURL || '');
      }
    });
    return () => unsubscribe();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.cancelled) {
      setNewImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    const user = auth.currentUser;
    if (user) {
      await updateProfile(user, {
        displayName: newUsername,
        photoURL: newImage || initialImage,
      });
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FF914D" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>แก้ไขโปรไฟล์</Text>
      </View>

      <View style={styles.content}>
        <TouchableOpacity onPress={pickImage} style={styles.imageWrapper}>
          <Image
            source={{ uri: newImage || initialImage || 'https://path/to/default/profile.png' }}
            style={styles.profileImage}
          />
          <Text style={styles.changePhotoText}>เปลี่ยนรูปโปรไฟล์</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="แก้ไขชื่อผู้ใช้"
          value={newUsername}
          onChangeText={setNewUsername}
        />

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>บันทึก</Text>
        </TouchableOpacity>
      </View>
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF914D',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  imageWrapper: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e0e0e0',
    borderWidth: 2,
    borderColor: '#FF914D',
  },
  changePhotoText: {
    color: '#FF914D',
    fontSize: 14,
    marginTop: 8,
    fontWeight: '600',
  },
  input: {
    borderBottomWidth: 2,
    borderColor: '#FF914D',
    width: '80%',
    padding: 12,
    fontSize: 16,
    color: '#333',
    borderRadius: 8,
    marginBottom: 30,
  },
  saveButton: {
    backgroundColor: '#FF914D',
    paddingVertical: 14,
    paddingHorizontal: 60,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
