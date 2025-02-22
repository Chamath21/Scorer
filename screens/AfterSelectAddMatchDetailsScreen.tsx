import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, Image } from 'react-native';
import { AfterSelectAddMatchDetailsNavigationProp, MatchSeriesScreenNavigationProp, RootStackParamList, SeriesWiseMatchScreenNavigationProp } from '../types';
import { RouteProp, useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import axios from 'axios';

interface TeamDetails {
  TeamName: string;
  TeamLocation: string;
  TeamPictureUrl: string;
}

const AfterSelectAddMatchDetailsScreen = () => {
  const [team1, setTeam1] = useState('');
  const [team1Picture, setTeam1Picture] = useState('');
  const [venue, setVenue] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [overs, setOvers] = useState('');
  const [scorerName, setScorerName] = useState('');
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation<AfterSelectAddMatchDetailsNavigationProp>();
  const backNavigation = useNavigation<MatchSeriesScreenNavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'AfterSelectAddMatchDetailsScreen'>>(); 
  const route1 = useRoute<RouteProp<RootStackParamList, 'MatchSeriesScreen'>>(); 
  const { seriesId, teamId } = route.params; 
  

  useFocusEffect(
    React.useCallback(() => {
      if (teamId) {
        fetchTeamData(teamId);
      }
    }, [teamId])
  );

  const fetchTeamData = async (teamId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`http://192.168.1.3:5000/?teamId=$get_TeamDetailsById{teamId}`);
      const data = await response.json();

      if (data) {
        setTeam1(data.TeamName);
        setTeam1Picture(data.TeamPictureUrl);
      } else {
        Alert.alert('No Data', 'No team data found for this ID.');
      }
    } catch (error) {
      console.error('Error fetching team data', error);
      Alert.alert('Error', 'An error occurred while fetching team details.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMatch = async () => {
    if (!team1 || !venue || !date || !time || !overs || !scorerName) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    const matchData = {
      matchType: 2,
      matchOvers: overs,
      matchLocation: venue,
      matchDateTime: `${date} ${time}`,
      seriesId: seriesId,
      teamId: teamId, 
      scorerName: scorerName
    };

    try {
      setLoading(true);
      const response = await axios.post('http://192.168.1.3:5000/save_match', matchData);
      
      if (response.status === 200) {
        Alert.alert('Success', 'Match saved successfully!');
        backNavigation.navigate('MatchSeriesScreen');
      } else {
        Alert.alert('Error', 'Failed to save match.');
      }
    } catch (error) {
      console.error('Error saving match', error);
      Alert.alert('Error', 'An error occurred while saving the match.');
    } finally {
      setLoading(false);
    }
  };

  const handleOversChange = (text: string) => {
    const regex = /^[0-9]*$/;
    if (regex.test(text)) {
      setOvers(text);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.teamSelectionContainer}>
        <View style={styles.teamContainer}>
          <TouchableOpacity
            style={styles.teamRoundButton}
            onPress={() => navigation.navigate('SelectTeamScreen', { seriesId, team: team1 })}
          >
            {team1Picture ? (
              <Image
                source={{ uri: team1Picture }}
                style={styles.teamImage}
              />
            ) : (
              <Text style={styles.plusSign}>+</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.teamName}>{team1 ? team1 : 'Opposition'}</Text>
        </View>
      </View>

      {/* Venue Input */}
      <TextInput
        style={styles.venueInput}
        placeholder="Enter Venue"
        value={venue}
        onChangeText={setVenue}
        placeholderTextColor="#b2b2b2"
      />

      {/* Date and Time Input */}
      <View style={styles.dateTimeContainer}>
        <TextInput
          style={styles.dateTimeInput}
          placeholder="Enter Date (MM/DD/YYYY)"
          value={date}
          onChangeText={setDate}
          placeholderTextColor="#b2b2b2"
        />
        <TextInput
          style={styles.dateTimeInput}
          placeholder="Enter Time (HH:MM AM/PM)"
          value={time}
          onChangeText={setTime}
          placeholderTextColor="#b2b2b2"
        />
      </View>

      {/* Overs Input */}
      <TextInput
        style={styles.oversInput}
        placeholder="Enter Overs (whole number)"
        value={overs}
        onChangeText={handleOversChange}
        keyboardType="numeric"
        placeholderTextColor="#b2b2b2"
      />

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
        disabled={loading}
      >
        <Text style={styles.saveMatchButtonText}>{loading ? 'Saving...' : 'Save Match'}</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: 50,
    marginBottom: 20,
  },
  teamContainer: {
    alignItems: 'center',
    width: '60%',
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
  teamImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  plusSign: {
    fontSize: 40,
    color: '#FFD700',
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
  oversInput: {
    width: '90%',
    padding: 10,
    marginTop: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#ffffff',
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
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
    marginTop: 50,
    backgroundColor: '#ffffff',
    padding: 20,
    width: '80%',
    borderRadius: 5,
    alignItems: 'center',
  },
  saveMatchButtonText: {
    color: 'rgba(30, 30, 30, 0.8)',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AfterSelectAddMatchDetailsScreen;
