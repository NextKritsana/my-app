import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { db } from '../firebaseConfig';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { Ionicons } from '@expo/vector-icons';  // To use the back arrow icon

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const handleSignUp = async () => {
    if (!email || !username || !password) {
      Alert.alert('แจ้งเตือน', 'กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    try {
      setLoading(true);

      // ✅ 1. สมัครผ่าน Firebase Authentication ก่อน
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // ✅ 2. แล้วค่อยบันทึกข้อมูลเพิ่มเติมใน Firestore (ไม่เก็บ password)
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        username: username,
        createdAt: serverTimestamp(),
      });

      Alert.alert('สำเร็จ', 'สมัครสมาชิกเรียบร้อยแล้ว');
      navigation.replace('Home');
    } catch (error) {
      console.error(error);
      Alert.alert('เกิดข้อผิดพลาด', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.container}>
        
        {/* Back Button - Positioned lower */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back-outline" size={28} color="#333" />
        </TouchableOpacity>

        <Image source={require('../assets/logo.png')} style={styles.logo} />
        <Text style={styles.title}>SIGN UP</Text>

        <TextInput
          placeholder="Email"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          placeholder="Username"
          style={styles.input}
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          placeholder="Password"
          style={styles.input}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          style={[styles.button, loading && { backgroundColor: '#ccc' }]}
          onPress={handleSignUp}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>SIGN UP</Text>
          )}
        </TouchableOpacity>

        <View style={styles.bottomBar}></View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flexGrow: 1, 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 20,
    backgroundColor: '#fff' 
  },
  logo: { 
    width: 200, 
    height: 200, 
    marginBottom: 40
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 30
  },
  input: { 
    width: '100%', 
    padding: 12, 
    marginBottom: 20, 
    borderWidth: 2, 
    borderColor: '#ddd', 
    borderRadius: 20, 
    fontSize: 16 
  },
  button: { 
    backgroundColor: '#f90', 
    padding: 12, 
    borderRadius: 20, 
    width: '100%', 
    alignItems: 'center', 
    marginBottom: 20 
  },
  buttonText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 16 
  },
  bottomBar: {
    height: 30,
  },
  backButton: {
    position: 'absolute',
    top: 50, // Adjust this value to move the back button down
    left: 20,
    padding: 10,
  },
});
