import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  ActivityIndicator, 
  Alert, 
  TouchableOpacity, 
  Image 
} from 'react-native';
import axios from 'axios';
import { Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MatchSeriesScreenNavigationProp } from '../types';

const screenWidth = Dimensions.get('window').width;

const MatchSeriesScreen = () => {
  const [seriesData, setSeriesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<MatchSeriesScreenNavigationProp>(); // Navigation Hook

  useEffect(() => {
    fetchSeriesData();
  }, []);

  const fetchSeriesData = async () => {
    try {
      const response = await axios.get('http://192.168.1.3:5000/get_seriesmasterData');
      setSeriesData(response.data);
    } catch (error) {
      console.error('Error fetching series data:', error);
      Alert.alert('Error', 'Failed to load match series data.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Series Click and Navigate with SeriesId
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
    <View style={styles.container}>  {/* Changed ImageBackground to View with background color */}
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
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 10, 
    backgroundColor: '#ffffff'  // Background color set here
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
    color: '#ffffff',
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
    backgroundColor: '#121212',
  },
});

export default MatchSeriesScreen;
