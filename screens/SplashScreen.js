import React, { useEffect } from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    setTimeout(() => {
      navigation.replace('Login');
    }, 2000);  // ตั้งเวลาหน้า Splash ให้นาน 2 วินาที
  }, []);

  return (
    <View style={styles.container}>
      <Image source={require('../assets/logo.png')} style={styles.logo} />

      {/* กรอบสีส้มที่ด้านล่าง */}
      <View style={styles.bottomBar}></View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#fff' 
  },
  logo: { 
    width: 200, 
    height: 200, 
    marginBottom: 50 // เพิ่มระยะห่างจากข้อความ
  },
  subtitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#f90'  // ข้อความสีส้ม
  },
  bottomBar: {
    backgroundColor: '#FFE6CC',  // สีส้มที่ด้านล่าง
    width: '100%',  // ครอบคลุมความกว้างของหน้าจอ
    height: 200,  // ความสูงของกรอบ
    position: 'absolute',  // วางอยู่ที่ด้านล่างของหน้าจอ
    bottom: 0,  // อยู่ที่ด้านล่างสุดของหน้าจอ
    alignItems: 'center',  // จัดข้อความตรงกลาง
    justifyContent: 'center',  // จัดข้อความตรงกลาง
  }
});