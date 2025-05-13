import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  KeyboardAvoidingView, 
  ScrollView, 
  Platform, 
  Alert, 
  ActivityIndicator 
} from 'react-native';
import { getAuth, sendPasswordResetEmail, updatePassword, signOut } from 'firebase/auth'; // Firebase Authentication
import { Ionicons } from '@expo/vector-icons'; // For back button icon

export default function ResetPasswordScreen({ route, navigation }) {
  const { email } = route.params;
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);  // Added loading state

  const handleSavePassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('แจ้งเตือน', 'กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('แจ้งเตือน', 'รหัสผ่านไม่ตรงกัน');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('แจ้งเตือน', 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      return;
    }

    try {
      setLoading(true);  // Start loading

      const user = getAuth().currentUser;
      if (user) {
        await updatePassword(user, newPassword); // ✅ อัปเดตรหัสผ่าน

        await signOut(getAuth()); // ✅ Sign out user

        Alert.alert('สำเร็จ', 'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว กรุณาเข้าสู่ระบบใหม่');
        navigation.replace('Login'); // ✅ กลับไปหน้า Login ทันที
      } else {
        Alert.alert('ผิดพลาด', 'ไม่พบผู้ใช้งาน กรุณาเข้าสู่ระบบใหม่');
        navigation.navigate('Login');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('ผิดพลาด', 'ไม่สามารถเปลี่ยนรหัสผ่านได้ กรุณาลองใหม่');
    } finally {
      setLoading(false);  // End loading
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
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.emailText}>For {email}</Text>

        <TextInput
          placeholder="New Password"
          style={styles.input}
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
        />
        <TextInput
          placeholder="Confirm New Password"
          style={styles.input}
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        {loading ? ( // Show loading spinner if in loading state
          <ActivityIndicator size="large" color="#FF914D" />
        ) : (
          <TouchableOpacity style={styles.button} onPress={handleSavePassword}>
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>
        )}

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
    marginBottom: 0 
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 30 
  },
  emailText: { 
    fontSize: 16, 
    fontWeight: '500', 
    marginBottom: 30, 
    color: '#888' 
  },
  input: { 
    width: '100%', 
    padding: 12, 
    marginBottom: 15, 
    borderWidth: 1, 
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
    top: 50, // Adjust the top value to move the back button lower or higher
    left: 20,
    padding: 10,
  }
});
