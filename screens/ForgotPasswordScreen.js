import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth'; // Firebase Authentication
import { Ionicons } from '@expo/vector-icons'; // For the back button icon

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState(''); // State to store the email entered by the user

  // Function to handle the password reset
  const handlePasswordReset = async () => {
    const auth = getAuth(); // Get Firebase Auth instance

    if (!email) {
      Alert.alert('Error', 'กรุณากรอกอีเมล'); // Show alert if email is not entered
      return;
    }

    try {
      // Send password reset email to the entered email address
      await sendPasswordResetEmail(auth, email);
      Alert.alert('Success', 'อีเมลการรีเซ็ตรหัสผ่านถูกส่งไปที่อีเมลของคุณ');
      
      // Navigate to the ResetPasswordScreen and pass the email
      navigation.navigate('ResetPassword', { email });
    } catch (error) {
      let errorMessage = 'เกิดข้อผิดพลาด';
      if (error.code === 'auth/invalid-email') {
        errorMessage = 'อีเมลไม่ถูกต้อง';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'ไม่พบอีเมลนี้ในระบบ';
      }
      Alert.alert('Error', errorMessage); // Display error messages for invalid email or user not found
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container}>
        {/* Back Button */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back-outline" size={28} color="#333" />
        </TouchableOpacity>

        <Image source={require('../assets/logo.png')} style={styles.logo} />
        <Text style={styles.title}>Forgot Password</Text>
        <TextInput
          placeholder="Email"
          style={styles.input}
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TouchableOpacity style={styles.button} onPress={handlePasswordReset}>
          <Text style={styles.buttonText}>Confirm</Text>
        </TouchableOpacity>
        
        <View style={styles.bottomBar}></View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 20,
    backgroundColor: '#fff' 
  },
  logo: { 
    width: 200, 
    height: 200, 
    marginBottom: 20
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 50
  },
  input: { 
    width: '100%', 
    padding: 12, 
    marginBottom: 10, 
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
    marginBottom: 200 
  },
  buttonText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 16 
  },
  backButton: {
    position: 'absolute',
    top: 50, // Adjust the top value to move the back button lower or higher
    left: 20,
    padding: 10,
  }
});
