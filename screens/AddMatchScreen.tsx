import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Modal, Button } from 'react-native';
import { SelectTeamScreenNavigationProp } from '../types';
import { useNavigation } from '@react-navigation/native';

const AddMatchTeamsScreen = () => {
  const [team1, setTeam1] = useState('');
  const [venue, setVenue] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [matchFormat, setMatchFormat] = useState('');
  const [showFormatModal, setShowFormatModal] = useState(false);
  const [overs, setOvers] = useState('');
  const [showOversInput, setShowOversInput] = useState(false);
  const [scorerName, setScorerName] = useState('');

  const navigation = useNavigation<SelectTeamScreenNavigationProp>();

  const handleTeamSelect = (team: string) => {
    if (team === 'team1') {
      navigation.navigate("SelectTeamScreen", { team: 'team1' });
      setTeam1('Opposition Selected');
    }
  };

  const handleFormatSelect = (format: string) => {
    setMatchFormat(format);
    if (format === 'Short-Format') {
      setShowOversInput(true);
    } else {
      setShowOversInput(false);
      setOvers('');  // Reset overs if Test is selected
    }
    setShowFormatModal(false);
  };

  const handleSaveOvers = () => {
    if (overs) {
      setMatchFormat(`Short-Format (${overs} overs)`);
      setShowOversInput(false);
    }
  };

  const handleSaveMatch = () => {
    // Logic to save the match (this could be saving to a database or state management)
    alert('Match Saved!');
  };

  return (
    <View style={styles.container}>
      <View style={styles.teamSelectionContainer}>
        {/* Team 1 */}
        <View style={styles.teamContainer}>
          <TouchableOpacity
            style={styles.teamRoundButton}
            onPress={() => handleTeamSelect('team1')}>
            <Text style={styles.plusSign}>+</Text>
          </TouchableOpacity>
          <Text style={styles.teamName}>{team1 || 'Opposition'}</Text>
        </View>
      </View>

      {/* Venue Input with Underline */}
      <TextInput
        style={styles.venueInput}
        placeholder="Enter Venue"
        value={venue}
        onChangeText={setVenue}
        placeholderTextColor="#b2b2b2"
      />

      {/* Date and Time Input on One Line */}
      <View style={styles.dateTimeContainer}>
        {/* Date Input */}
        <TextInput
          style={styles.dateTimeInput}
          placeholder="Enter Date (MM/DD/YYYY)"
          value={date}
          onChangeText={setDate}
          placeholderTextColor="#b2b2b2"
        />

        {/* Time Input */}
        <TextInput
          style={styles.dateTimeInput}
          placeholder="Enter Time (HH:MM AM/PM)"
          value={time}
          onChangeText={setTime}
          placeholderTextColor="#b2b2b2"
        />
      </View>

      {/* Match Format Selection */}
      <TouchableOpacity
        style={styles.formatButton}
        onPress={() => setShowFormatModal(true)}
      >
        <Text style={styles.buttonText}>
          {matchFormat || 'Select Match Format'}
        </Text>
      </TouchableOpacity>

      {/* Format Modal */}
      <Modal
        transparent={true}
        visible={showFormatModal}
        animationType="slide"
        onRequestClose={() => setShowFormatModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Format</Text>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => handleFormatSelect('Test')}
            >
              <Text style={styles.modalText}>Test</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => handleFormatSelect('Short-Format')}
            >
              <Text style={styles.modalText}>Short-Format</Text>
            </TouchableOpacity>

            {/* If Short-Format is selected, show the overs input */}
            {showOversInput && (
              <View style={styles.oversInputContainer}>
                <TextInput
                  style={styles.oversInput}
                  placeholder="Enter Overs"
                  value={overs}
                  onChangeText={setOvers}
                  keyboardType="numeric"
                  placeholderTextColor="#b2b2b2"
                />
                <TouchableOpacity style={styles.saveButton} onPress={handleSaveOvers}>
                  <Text style={styles.buttonText}>Save</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowFormatModal(false)}
            >
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Scorer Name Input */}
      <TextInput
        style={styles.scorerInput}
        placeholder="Enter Scorer Name"
        value={scorerName}
        onChangeText={setScorerName}
        placeholderTextColor="#b2b2b2"
      />

      {/* Save Match Button */}
      <TouchableOpacity
        style={styles.saveMatchButton}
        onPress={handleSaveMatch}
      >
        <Text style={styles.saveMatchButtonText}>Save Match</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    padding: 15,
  },
  teamSelectionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 50,
    marginBottom: 20,
  },
  teamContainer: {
    alignItems: 'center',
    width: '40%',
  },
  teamRoundButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  plusSign: {
    fontSize: 40,
    color: 'rgba(30, 30, 30, 0.8)',
    fontWeight: 'bold',
  },
  teamName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  venueInput: {
    width: '90%',
    padding: 10,
    marginTop: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#ffffff',
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginTop: 20,
  },
  dateTimeInput: {
    flex: 1,
    padding: 10,
    marginRight: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#ffffff',
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
  },
  formatButton: {
    marginTop: 30,
    padding: 10,
    borderWidth: 2,
    borderColor: '#ffffff',
    borderRadius: 5,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 18,
    marginBottom: 15,
  },
  modalOption: {
    marginVertical: 10,
  },
  modalText: {
    color: '#ffffff',
    fontSize: 16,
  },
  oversInputContainer: {
    marginTop: 15,
  },
  oversInput: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ffffff',
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
  },
  saveButton: {
    marginTop: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ffffff',
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    alignItems: 'center',
    borderRadius: 5,
  },
  closeButton: {
    marginTop: 15,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ffffff',
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    alignItems: 'center',
    borderRadius: 5,
  },
  selectedFormatContainer: {
    marginTop: 20,
    padding: 10,
    borderWidth: 2,
    borderColor: 'rgba(30, 30, 30, 0.8)',
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  scorerInput: {
    width: '90%',
    padding: 10,
    marginTop: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#ffffff',
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
  },
  saveMatchButton: {
    marginTop: 80,  // Added margin for spacing
    padding: 15,
    backgroundColor: '#ffffff',  // Yellow color for the button
    borderRadius: 5,
    width: '90%',
    alignItems: 'center',
  },
  saveMatchButtonText: {
    color: 'rgba(30, 30, 30, 0.8)',  // Text color black for contrast
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AddMatchTeamsScreen;
