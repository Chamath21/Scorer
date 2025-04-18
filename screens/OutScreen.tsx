import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import axios from 'axios';
import { BASE_URL } from '../App';

// Define dismissal options and their corresponding numbers
const dismissalOptions = [
  { label: 'Bowled', number: 1 },
  { label: 'Caught', number: 2 },
  { label: 'LBW', number: 3 },
  { label: 'Run out', number: 4 },
  { label: 'Stumped', number: 5 },
  { label: 'Retired', number: 6 },
  { label: 'Hit the ball twice', number: 7 },
  { label: 'Hit wicket', number: 8 },
  { label: 'Obstructing the field', number: 9 },
  { label: 'Timed out', number: 10 },
  { label: 'Handled the ball', number: 11 }
];

type OutScreenRouteProp = RouteProp<RootStackParamList, 'OutScreen'>;

type OutScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'OutScreen'>;
  route: OutScreenRouteProp;
};

const OutScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<OutScreenRouteProp>();

  const { matchId, battingTeamId, striker, strikerName } = route.params;

  const [selectedDismissal, setSelectedDismissal] = useState<{ label: string; number: number } | null>(null);


  if (!striker) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Error: No striker data found.</Text>
      </View>
    );
  }

  const confirmDismissal = () => {
    if (!selectedDismissal) {
      Alert.alert('Error', 'Please select a dismissal type.');
      return;
    }
  
    Alert.alert(
      'Confirm Dismissal',
      `${selectedDismissal.label}. Proceed?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              const response = await axios.post(`${BASE_URL}/AddBatsmanDismissal`, {
                matchId: matchId,
                teamId: battingTeamId,
                playerId: striker,
                dismissalType: selectedDismissal.number 
              });
  
              if (response.status === 200) {
                Alert.alert('Success', 'Dismissal saved successfully');
                navigation.navigate('SelectNewBatterScreen', {
                  matchId: matchId,
                  battingTeamId: battingTeamId,
                });
              } else {
                Alert.alert('Error', 'Failed to save dismissal details');
              }
            } catch (error) {
              console.error('Error dismissing batsman:', error);
              Alert.alert('Error', 'An error occurred while processing the dismissal.');
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{strikerName} is OUT!</Text>
      {dismissalOptions.map((option) => (
        <TouchableOpacity
          key={option.number}
          style={[styles.optionButton, selectedDismissal?.number === option.number && styles.selectedOption]}
          onPress={() => setSelectedDismissal(option)}
        >
          <Text style={styles.optionText}>{option.label}</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity style={styles.confirmButton} onPress={confirmDismissal}>
        <Text style={styles.confirmText}>Confirm Out</Text>
      </TouchableOpacity>
    </View>
  );
};


const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: 'white', 
    padding: 20, 
    alignItems: 'center',
    marginTop: 30 
  },
  title: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    marginBottom: 15 
  },
  optionButton: { 
    padding: 10, 
    marginVertical: 5, 
    backgroundColor: '#f1f1f1', 
    width: '80%', 
    alignItems: 'center', 
    borderRadius: 5 
  },
  selectedOption: { 
    backgroundColor: 'gray' 
  },
  optionText: { 
    fontSize: 16 
  },
  confirmButton: { 
    marginTop: 20, 
    backgroundColor: 'red', 
    padding: 10, 
    borderRadius: 5 
  },
  confirmText: { 
    color: 'white', 
    fontWeight: 'bold' 
  },
});

export default OutScreen;
