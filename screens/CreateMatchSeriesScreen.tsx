import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView
} from 'react-native';
import axios from 'axios';
import { BASE_URL } from '../App'; // Adjust based on your setup
import { useNavigation } from '@react-navigation/native';
import { MatchSeriesScreenNavigationProp } from '../types';

const CreateMatchSeriesScreen = () => {
  const [seriesName, setSeriesName] = useState('');
  const [seriesLocation, setSeriesLocation] = useState('');
  const [pictureUrl, setPictureUrl] = useState('');

  const navigation = useNavigation<MatchSeriesScreenNavigationProp>(); 

  const handleSave = async () => {
    if (!seriesName || !seriesLocation || !pictureUrl) {
      Alert.alert('Error', 'Please fill out all fields.');
      return;
    }

    try {
      await axios.post(`${BASE_URL}/add_series`, {
        SeriesName: seriesName,
        SeriesLocation: seriesLocation,
        PictureUrl: pictureUrl,
      });

      Alert.alert('Success', 'Match series created successfully!');
      navigation.navigate('MatchSeriesScreen');
    } catch (error) {
      console.error('Error saving match series:', error);
      Alert.alert('Error', 'Failed to create match series.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Series Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter series name"
        value={seriesName}
        onChangeText={setSeriesName}
      />

      <Text style={styles.label}>Series Location</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter series location"
        value={seriesLocation}
        onChangeText={setSeriesLocation}
      />

      <Text style={styles.label}>Picture URL</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter image URL"
        value={pictureUrl}
        onChangeText={setPictureUrl}
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#FFF',
  },
});

export default CreateMatchSeriesScreen;
