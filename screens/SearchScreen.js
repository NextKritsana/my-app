import React, { useState, useEffect } from 'react';
import { View, TextInput, FlatList, Text, TouchableOpacity, StyleSheet, SafeAreaView, Image } from 'react-native';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [allProducts, setAllProducts] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [history, setHistory] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'posts'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAllProducts(data);
      setRecentProducts(data);
    });
    return () => unsubscribe();
  }, []);

  const results = query.length > 1
    ? allProducts.filter(post =>
        post.title.toLowerCase().includes(query.toLowerCase()) ||
        post.description.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const removeHistoryItem = (index) => {
    const newHistory = [...history];
    newHistory.splice(index, 1);
    setHistory(newHistory);
  };

  const handleSelectProduct = (item) => {
    if (!history.includes(item.title)) {
      setHistory(prev => [item.title, ...prev]);
    }
    navigation.navigate('สินค้า', { postId: item.id });
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#aaa" style={{ marginLeft: 10 }} />
        <TextInput
          placeholder="ค้นหาสินค้า..."
          style={styles.input}
          value={query}
          onChangeText={setQuery}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Ionicons name="close" size={20} color="#aaa" style={{ marginRight: 10 }} />
          </TouchableOpacity>
        )}
      </View>

      {/* ประวัติการค้นหา */}
      {history.length > 0 && (
        <View style={styles.historyContainer}>
          {history.map((item, index) => (
            <View key={index} style={styles.historyItem}>
              <Text style={styles.historyText}>{item}</Text>
              <TouchableOpacity onPress={() => removeHistoryItem(index)}>
                <Ionicons name="close" size={16} color="#aaa" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* ผลการค้นหา */}
      {query.length > 1 && (
        <>
          <Text style={styles.resultTitle}>ผลการค้นหา</Text>
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleSelectProduct(item)} style={styles.productCard}>
                <Image source={{ uri: item.mediaUrls?.[0] }} style={styles.productImage} />
                <View style={styles.productInfo}>
                  <Text numberOfLines={1} style={styles.productTitle}>{item.title}</Text>
                  <Text style={styles.productPrice}>฿{item.price}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </>
      )}

      {/* สินค้าล่าสุด */}
      {query.length <= 1 && (
        <>
          <Text style={styles.recentTitle}>📦 สินค้าล่าสุด</Text>
          <FlatList
            data={recentProducts}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleSelectProduct(item)} style={styles.productCard}>
                <Image source={{ uri: item.mediaUrls?.[0] }} style={styles.productImage} />
                <View style={styles.productInfo}>
                  <Text numberOfLines={1} style={styles.productTitle}>{item.title}</Text>
                  <Text style={styles.productPrice}>฿{item.price}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 15,
    borderRadius: 25,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  historyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 15,
    gap: 10,
    marginBottom: 10,
  },
  historyItem: {
    flexDirection: 'row',
    backgroundColor: '#eee',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignItems: 'center',
    marginRight: 5,
  },
  historyText: {
    marginRight: 5,
    fontSize: 14,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 15,
    marginBottom: 5,
  },
  recentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 15,
    marginBottom: 5,
    marginTop: 10,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  list: {
    paddingHorizontal: 10,
    paddingBottom: 30,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    width: '48%',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
  },
  productImage: {
    width: '100%',
    height: 140,
    resizeMode: 'cover',
  },
  productInfo: {
    padding: 8,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  productPrice: {
    fontSize: 13,
    color: '#FF6F00',
    marginTop: 2,
  },
});
