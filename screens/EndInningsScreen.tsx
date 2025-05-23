import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Alert } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import axios from 'axios';
import { BASE_URL } from '../App';
import {RootStackParamList } from '../types'; // Correctly import types

type EndInningsScreenRouteProp = RouteProp<RootStackParamList, 'MatchTossScreen'>;

const EndInningsScreen = () => {
  const route = useRoute<EndInningsScreenRouteProp>(); // Correctly typed useRoute
  //const navigation = useNavigation<EndInningsScreenNavigationProp>(); // Correctly typed useNavigation

  const { matchId } = route.params; // matchId from the route params

  const [isModalVisible, setIsModalVisible] = useState(false);

  // Toggle Modal Visibility
  const toggleModal = () => {
    setIsModalVisible((prev) => !prev);
  };

  // End the innings and redirect to the summary screen
  const endInnings = async () => {
    try {
      // Send request to the backend to end the innings
      await axios.post(`${BASE_URL}/endInnings`, { matchId });
      console.log('Innings ended successfully');
      //navigation.navigate('MatchSummary'); // Navigate to the Match Summary screen
    } catch (error) {
      console.error('Error ending innings:', error);
      Alert.alert('Error', 'An error occurred while ending the innings.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>End Innings</Text>
      
      {/* Button to trigger the modal */}
      <TouchableOpacity style={styles.button} onPress={toggleModal}>
        <Text style={styles.buttonText}>End Innings</Text>
      </TouchableOpacity>

      {/* End Innings Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={toggleModal}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Are you sure you want to end the innings?</Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity style={styles.modalButton} onPress={endInnings}>
                <Text style={styles.buttonText}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={toggleModal}>
                <Text style={styles.buttonText}>No</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#FF6347',
    padding: 15,
    borderRadius: 5,
    marginVertical: 20,
    width: '60%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 10,
  },
});

export default EndInningsScreen;
