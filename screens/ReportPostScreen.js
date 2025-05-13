import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function ReportPostScreen() {
  const [selectedReason, setSelectedReason] = useState(null);
  const route = useRoute();
  const navigation = useNavigation();
  const { postId } = route.params;

  const reasons = [
    'บุคคล/องค์กรที่เป็นอันตราย',
    'ภาพโป๊เปลือยหรือเนื้อหาทางเพศ',
    'การฉ้อโกง',
    'ข้อมูลที่ทำให้เกิดความเข้าใจผิด',
    'เนื้อหาหรือภาพที่รุนแรง',
    'การคุกคามหรือการกลั่นแกล้ง',
    'คำพูดแสดงความเกลียดชัง',
    'บัญชีปลอม',
    'การละเมิดทรัพย์สินทางปัญญา',
    'อื่นๆ'
  ];

  const reporterId = 'user123'; // แทนด้วย user จริงในระบบของคุณ

  const submitReport = async () => {
    if (!selectedReason) return Alert.alert('กรุณาเลือกเหตุผลในการรายงาน');
    try {
      await addDoc(collection(db, 'reports'), {
        postId,
        reporterId,
        reason: selectedReason,
        createdAt: serverTimestamp()
      });
      Alert.alert('รายงานเรียบร้อยแล้ว');
      navigation.goBack();
    } catch (err) {
      console.error('Report error:', err);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถรายงานได้ กรุณาลองใหม่');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>◀ กลับ</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>รายงานโพสต์</Text>
        <View style={{ width: 60 }} />
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        {reasons.map(reason => (
          <TouchableOpacity
            key={reason}
            style={[styles.option, selectedReason === reason && styles.selected]}
            onPress={() => setSelectedReason(reason)}>
            <Text style={styles.optionText}>{reason}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.button} onPress={submitReport}>
          <Text style={styles.buttonText}>รายงาน</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#FFF'
  },
  back: { fontSize: 18, color: '#007BFF' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#222' },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 25,
    color: '#222',
    textAlign: 'center'
  },
  option: {
    padding: 14,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: '#F9F9F9'
  },
  selected: {
    backgroundColor: '#FFD9B2',
    borderColor: '#FFD9B2'
  },
  optionText: {
    fontSize: 16,
    color: '#333'
  },
  button: {
    marginTop: 30,
    backgroundColor: '#FF6B00',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center'
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 19
  }
});
