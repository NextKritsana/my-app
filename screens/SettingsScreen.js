import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// Settings Screen with full screen, SafeArea, and back navigation
export default function SettingsScreen() {
  const navigation = useNavigation();

  const goToHelp = () => {
    navigation.navigate('Helps');
  };

  const logout = () => {
    console.log('ออกจากระบบแล้ว');
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header with Back Button */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Ionicons name="settings" size={28} color="#000" />
        <Text style={styles.headerTitle}>การตั้งค่า</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Option List */}
        <View style={styles.optionsContainer}>
          <TouchableOpacity style={styles.optionButton} onPress={goToHelp}>
            <Ionicons name="help-circle" size={24} color="#FFB978" />
            <Text style={styles.optionText}>ช่วยเหลือ/ติดต่อ</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionButton} onPress={logout}>
            <Ionicons name="log-out" size={24} color="#FFB978" />
            <Text style={styles.optionText}>ออกจากระบบ</Text>
          </TouchableOpacity>
        </View>
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
    marginLeft: 8,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#FFF7F0',
  },
  optionsContainer: {
    marginTop: 20,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  optionText: {
    fontSize: 18,
    marginLeft: 15,
    color: '#333',
    fontWeight: '500',
  },
});
