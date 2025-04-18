import React, { useEffect, useState, useLayoutEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { MatchSeriesScreenNavigationProp } from '../types';
import { BASE_URL } from '../App';
import Ionicons from 'react-native-vector-icons/Ionicons'; 

const screenWidth = Dimensions.get('window').width;

const MatchSeriesScreen = () => {
  const [seriesData, setSeriesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const navigation = useNavigation<MatchSeriesScreenNavigationProp>();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Match Series',
    });
  }, [navigation]);

  useEffect(() => {
    fetchSeriesData();
  }, []);

  const fetchSeriesData = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/get_seriesmasterData`);
      setSeriesData(response.data);
    } catch (error) {
      console.error('Error fetching series data:', error);
      Alert.alert('Error', 'Failed to load match series data.');
    } finally {
      setLoading(false);
    }
  };

  const handleSeriesClick = (seriesId: string) => {
    navigation.navigate('SeriesWiseMatchScreen', { seriesId });
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={seriesData}
        keyExtractor={(item) => item.SeriesId.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => handleSeriesClick(item.SeriesId)}
          >
            <Image source={{ uri: item.PictureUrl }} style={styles.image} />
            <Text style={styles.seriesName}>{item.SeriesName}</Text>
            <Text style={styles.seriesLocation}>{item.SeriesLocation}</Text>
          </TouchableOpacity>
        )}
        ListFooterComponent={
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => navigation.navigate('CreateMatchSeriesScreen')}
          >
            <Text style={styles.createButtonText}>+ Create Match Series</Text>
          </TouchableOpacity>
        }
      />

      <TouchableOpacity
        style={styles.floatingIcon}
        onPress={() => navigation.navigate('LogInScreen')}
      >
        <Ionicons name="person-circle-outline" size={48} color="#FFD700" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
  },
  card: {
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    borderRadius: 10,
    overflow: 'hidden',
    margin: 8,
    width: screenWidth,
    alignItems: 'center',
    paddingBottom: 10,
  },
  image: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  seriesName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 5,
  },
  seriesLocation: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 2,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  createButton: {
    marginTop: 20,
    marginBottom: 30,
    padding: 15,
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    borderRadius: 10,
    alignItems: 'center',
    alignSelf: 'center',
    width: '90%',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  floatingIcon: {
    position: 'absolute',
    bottom: 25,
    right: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    width: 72,
    height: 72,
    borderRadius: 36, 
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },  
});

export default MatchSeriesScreen;
