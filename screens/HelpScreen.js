import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

export default function HelpScreen() {
  const [inputText, setInputText] = useState('');
  const [images, setImages] = useState([]);
  const navigation = useNavigation();

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true, // Android supported
      quality: 1,
    });

    if (!result.canceled) {
      const uris = result.assets.map(asset => asset.uri);
      setImages(prev => [...prev, ...uris]);
    }
  };

  const send = () => {
    console.log('ข้อความ:', inputText);
    console.log('แนบรูป:', images);
    // ส่งข้อมูลไปยัง Firebase หรือ API
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header with Back Button */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ช่วยเหลือ/ติดต่อ</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <TextInput
          style={styles.inputBox}
          placeholder="กรอกข้อมูล..."
          value={inputText}
          onChangeText={setInputText}
          multiline
          textAlignVertical="top"
        />

        <Text style={styles.label}>แนบรูป</Text>
        <View style={styles.imageGrid}>
          {images.map((uri, index) => (
            <Image key={index} source={{ uri }} style={styles.imagePreview} />
          ))}
          <TouchableOpacity style={styles.imageBox} onPress={pickImage}>
            <Ionicons name="add" size={36} color="#777" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.sendButton} onPress={send}>
          <Text style={styles.sendText}>ส่ง</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
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
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  container: {
    padding: 20,
  },
  inputBox: {
    backgroundColor: '#eee',
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#339CFF',
    minHeight: 120,
    fontSize: 16,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 30,
  },
  imageBox: {
    width: 80,
    height: 80,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  sendButton: {
    backgroundColor: '#FFB978',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  sendText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
