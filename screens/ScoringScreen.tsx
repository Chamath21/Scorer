import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';

// Define the route prop type
type MatchScoringScreenRouteProp = RouteProp<RootStackParamList, 'ScoringScreen'>;

const MatchScoringScreen = () => {
  // Access matchId from route params
  const route = useRoute<MatchScoringScreenRouteProp>();
  const { matchId } = route.params;

  const [score, setScore] = useState(0);
  const [wickets, setWickets] = useState(0);
  const [overs, setOvers] = useState(0.0);
  const [extras, setExtras] = useState(0);

  const addRuns = (runs: number) => {
    setScore(score + runs);
  };

  const handleWicket = () => {
    setWickets(wickets + 1);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Match Centre</Text>
        <Text style={styles.teamName}>Team A vs Team B</Text>
        <Text style={styles.innings}>1st Innings</Text>

        <View style={styles.scoreContainer}>
          <Text style={styles.score}>{score} - {wickets}</Text>
          <Text style={styles.subText}>Overs: {overs} | Extras: {extras}</Text>
        </View>

        {/* Displaying matchId */}
        <Text style={styles.matchId}>Match ID: {matchId}</Text> {/* Show the matchId in the UI */}
      </ScrollView>

      {/* Button Section */}
      <View style={styles.buttonSection}>
        <View style={styles.buttonsContainer}>
          {[1, 2, 3, 4, 6].map((num) => (
            <TouchableOpacity key={num} style={styles.button} onPress={() => addRuns(num)}>
              <Text style={styles.buttonText}>{num}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.extraButtonsContainer}>
          {['Wide', 'NB', 'Bye', 'LB', 'Out'].map((label) => (
            <TouchableOpacity
              key={label}
              style={styles.button}
              onPress={() => label === 'Out' ? handleWicket() : setExtras(extras + 1)}
            >
              <Text style={styles.buttonText}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white', // Background color white
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'flex-start', // Align content towards the top
    paddingTop: 60, // Moves content higher
    paddingBottom: 60, // Adjust bottom spacing
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5, // Reduced spacing
  },
  teamName: {
    fontSize: 18,
    marginBottom: 3, // Reduced spacing
  },
  innings: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 10, // Reduced spacing
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 15, // Reduced spacing
  },
  score: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  subText: {
    fontSize: 16,
    color: 'gray',
  },
  matchId: {
    fontSize: 16,
    color: 'blue',
    marginTop: 20,
    fontWeight: 'bold',
  },
  buttonSection: {
    width: '100%',
    paddingVertical: 15,
    backgroundColor: 'white',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    position: 'absolute',
    bottom: 80, // Keeps buttons slightly higher
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  extraButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    padding: 15,
    margin: 5,
    backgroundColor: 'white', // White background
    alignItems: 'center',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc', // Light gray border
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black', // Black text
  },
});

export default MatchScoringScreen;
