import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  Image,
  Dimensions,
} from 'react-native';
import axios from 'axios';
import { BASE_URL } from '../App';
import { useRoute } from '@react-navigation/native';

interface RouteParams {
  userId: string;
}

interface Series {
  seriesId: number;
  seriesName: string;
  seriesLocation: string;
  pictureUrl: string;
}

interface UserProfileResponse {
  userId: number;
  userName: string;
  userEmail: string;
  assignedSeries: Series[];
  // Optional: Add profile picture if your backend supports it
  profilePictureUrl?: string;
}

const { width } = Dimensions.get('window');

const UserProfileScreen = () => {
  const route = useRoute();
  const { userId } = route.params as RouteParams;

  const [userDetails, setUserDetails] = useState<UserProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchUserProfile();
    } else {
      Alert.alert('Error', 'User ID is missing!');
      setLoading(false);
    }
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get<UserProfileResponse>(`${BASE_URL}/get_user_profile`, {
        params: { userId },
      });

      setUserDetails(response.data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      Alert.alert('Error', 'Failed to load user data.');
    } finally {
      setLoading(false);
    }
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
      {userDetails ? (
        <>
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <Image
              source={{
                uri:
                  userDetails.profilePictureUrl ||
                  'https://www.w3schools.com/w3images/avatar5.png',
              }}
              style={styles.avatar}
            />
            <Text style={styles.name}>{userDetails.userName}</Text>
            <Text style={styles.email}>{userDetails.userEmail}</Text>
          </View>

          {/* Match Series Section */}
          <Text style={styles.subtitle}>🏏 Assigned Match Series</Text>

          <FlatList
            data={userDetails.assignedSeries}
            keyExtractor={(item) => item.seriesId.toString()}
            contentContainerStyle={styles.seriesList}
            renderItem={({ item }) => (
              <View style={styles.seriesCard}>
                <Image
                  source={{ uri: item.pictureUrl }}
                  style={styles.seriesImage}
                  resizeMode="cover"
                />
                <View style={styles.seriesInfo}>
                  <Text style={styles.seriesName}>{item.seriesName}</Text>
                  <Text style={styles.seriesLocation}>📍 {item.seriesLocation}</Text>
                </View>
              </View>
            )}
          />
        </>
      ) : (
        <Text style={styles.detail}>User not found.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingTop: 80,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.7)',
    backgroundColor: '#333',
    marginBottom: 12,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'rgba(0, 0, 0, 0.7)',
  },
  email: {
    fontSize: 16,
    color: 'rgba(0, 0, 0, 0.7)',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'rgba(0, 0, 0, 0.7)',
    marginBottom: 10,
    marginLeft: 4,
  },
  seriesList: {
    paddingBottom: 40,
  },
  seriesCard: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 3,
  },
  seriesImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#333',
  },
  seriesInfo: {
    padding: 12,
  },
  seriesName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'rgba(0, 0, 0, 0.7)',
    marginBottom: 4,
  },
  seriesLocation: {
    fontSize: 16,
    color: '#ccc',
  },
  detail: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginTop: 30,
  },
});

export default UserProfileScreen;
