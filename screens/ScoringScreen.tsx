import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { OutScreenNavigationProp, RootStackParamList } from '../types';
import axios from 'axios';
import { BASE_URL } from '../App';

// Define the route prop type
type MatchScoringScreenRouteProp = RouteProp<RootStackParamList, 'ScoringScreen'>;

// Define types for batsman
type Batsman = {
  batsmanId: number;
  batsmanName: string;
  battingTeamId: number;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
};

// Define types for bowler
type Bowler = {
  bowlerId: number;
  bowlerName: string;
  bowlingTeamId: number;
  overs: number;
  maidens: number;
  runs: number;
  wickets: number;
};

const MatchScoringScreen = () => {
  const route = useRoute<MatchScoringScreenRouteProp>();
  const { matchId } = route.params;

  const [score, setScore] = useState<number>(0);
  const [wickets, setWickets] = useState<number>(0);
  const [overs, setOvers] = useState<number>(0.0);
  const [extras, setExtras] = useState<number>(0);
  const [history, setHistory] = useState<{ score: number; wickets: number }[]>([]);
  const navigation = useNavigation<OutScreenNavigationProp>();
  const [isExtra, setIsExtra] = useState<boolean>(false);

  // State for batsmen and to track the striker
  const [batsmen, setBatsmen] = useState<Batsman[]>([]);
  const [strikerIndex, setStrikerIndex] = useState<number>(0); // Track the striker's index

  // State for bowlers
  const [bowlers, setBowlers] = useState<Bowler[]>([]);

  // State for balls in over
  const [ballsInOver, setBallsInOver] = useState<number>(0);

  useEffect(() => {
    const fetchMatchData = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/get_matchstartingdata?matchId=${matchId}`);
        const { batsmen, bowlers, totalScore, wickets, overCount, ballsForOver } = response.data;

        console.log("API Response: ", response.data); // Debugging log
        const initializedBatsmen = batsmen.map((batsman: any) => ({
          ...batsman,
          runs: batsman.runs || 0,
          balls: batsman.balls || 0,
          fours: batsman.fours || 0,
          sixes: batsman.sixes || 0,
        }));

        const initializedBowlers = bowlers.map((bowler: any) => ({
          ...bowler,
          overs: bowler.overs || 0,
          maidens: bowler.maidens || 0,
          runs: bowler.runs || 0,
          wickets: bowler.wickets || 0,
        }));

        setBatsmen(initializedBatsmen);
        setBowlers(initializedBowlers);
        setScore(totalScore || 0);
        setWickets(wickets || 0);
        setOvers(overCount || 0);
        setBallsInOver(ballsForOver || 0)
      } catch (error) {
        console.error("Error fetching match data: ", error);
      }
    };

    fetchMatchData();
  }, [matchId]); // Runs when matchId changes

  const rotateBatsmen = () => {
    setStrikerIndex((prevIndex) => (prevIndex === 0 ? 1 : 0));
  };

  const addRuns = async (runs: number) => {
    const updatedBatsmen = [...batsmen];
    const striker = updatedBatsmen[strikerIndex];
    const currentBowler = bowlers[0];

    // Update the batsman's stats only if it's not an extra
    let isBoundary = false;
    if (!isExtra) {
        striker.runs += runs;
        striker.balls += 1;
        if (runs === 4) {
            striker.fours += 1;
            isBoundary = true; // Mark as boundary if it's a 4
        }
        if (runs === 6) {
            striker.sixes += 1;
            isBoundary = true; // Mark as boundary if it's a 6
        }
    }

    setBatsmen(updatedBatsmen);
    setScore((prevScore) => prevScore + runs);

    // Update balls in over and calculate overs
    setBallsInOver((prevBalls) => {
      console.log('previous balls', prevBalls)
        
      const newBalls = Number(prevBalls) + 1; // Convert prevBalls to a number before adding
        if (newBalls === 6) {
            // Reset balls in over
            setOvers((prevOvers) => Number(prevOvers) + 1);
            return 0; // Reset balls after 6
        }
        return newBalls;
    });

    // Rotate striker if runs are odd and it's not an extra
    if (!isExtra && runs % 2 !== 0) rotateBatsmen();

    console.log("Balls in Over: ", ballsInOver);  // Check for any mismatch

    try {
        await axios.post(`${BASE_URL}/AddRuns`, {
            batsmanId: striker.batsmanId,
            bowlerId: currentBowler.bowlerId,
            matchId: matchId,
            batsmanRuns: striker.runs,
            batsmanBalls: striker.balls,
            batsmanFours: striker.fours,
            batsmanSixes: striker.sixes,
            runs: runs,
            battingTeamId: striker.battingTeamId,
            bowlingTeamId: currentBowler.bowlingTeamId,
            isExtra: isExtra, // Whether it's an extra
            extraRuns: isExtra ? runs : 0, // Only pass extra runs if isExtra is true
            isBoundary: isBoundary,
            overs: overs,
            ballsInOver: ballsInOver
        });
        console.log('Run recorded successfully');
    } catch (error) {
        console.error('Error recording run:', error);
        Alert.alert('Error', 'An error occurred while recording the run.');
    }
};


  const handleWicket = () => {
    if (batsmen.length > 0) {
      const striker = batsmen[strikerIndex];
      const nonStriker = batsmen[strikerIndex === 0 ? 1 : 0];  // Get the non-striker

      const battingTeamId = striker.battingTeamId; // Assuming the first batsman belongs to the batting team
      // Pass the batsmen and striker to OutScreen
      navigation.navigate('OutScreen', {
        matchId: matchId,
        battingTeamId: battingTeamId,
        striker: striker.batsmanId,
        nonStriker: nonStriker.batsmanId,  // Pass the non-striker along with the striker
      });
    }
  };

  const handlePenaltyRuns = () => {
    setScore(score + 5);
  };

  const undoAction = () => {
    if (history.length > 0) {
      const lastState = history.pop();
      setScore(lastState?.score ?? score);
      setWickets(lastState?.wickets ?? wickets);
    }
  };

  const goToSettings = () => {
    console.log('Navigate to Settings');
  };

  const handleMore = () => {
    console.log('More options');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Match Centre</Text>
        <Text style={styles.teamName}>Team A vs Team B</Text>
        <Text style={styles.innings}>1st Innings</Text>

        <View style={styles.scoreContainer}>
          <Text style={styles.score}>{score} - {wickets}</Text>
          <Text style={styles.subText}>Overs: {overs}.{ballsInOver} | Extras: {extras}</Text>
        </View>

        {/* Batsman Stats Table */}
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderText}>Batsman</Text>
            <Text style={styles.tableHeaderText}>R</Text>
            <Text style={styles.tableHeaderText}>B</Text>
            <Text style={styles.tableHeaderText}>4</Text>
            <Text style={styles.tableHeaderText}>6</Text>
            <Text style={styles.tableHeaderText}>SR</Text>
          </View>
          {batsmen.map((batsman, index) => {
            const strikeRate = batsman.balls > 0 ? ((batsman.runs / batsman.balls) * 100).toFixed(2) : '0.00';
            const isStriker = strikerIndex === index; // Check if this batsman is the striker
            return (
              <View key={batsman.batsmanId} style={[styles.tableRow, isStriker && styles.striker]}>
                <Text style={[styles.tableRowText, isStriker && styles.strikerText]}>{batsman.batsmanName}</Text>
                <Text style={[styles.tableRowText, isStriker && styles.strikerText]}>{batsman.runs}</Text>
                <Text style={[styles.tableRowText, isStriker && styles.strikerText]}>{batsman.balls}</Text>
                <Text style={[styles.tableRowText, isStriker && styles.strikerText]}>{batsman.fours}</Text>
                <Text style={[styles.tableRowText, isStriker && styles.strikerText]}>{batsman.sixes}</Text>
                <Text style={[styles.tableRowText, isStriker && styles.strikerText]}>{strikeRate}</Text>
              </View>
            );
          })}
        </View>

        {/* Bowler Stats Table */}
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderText}>Bowler</Text>
            <Text style={styles.tableHeaderText}>O</Text>
            <Text style={styles.tableHeaderText}>M</Text>
            <Text style={styles.tableHeaderText}>R</Text>
            <Text style={styles.tableHeaderText}>W</Text>
            <Text style={styles.tableHeaderText}>ECO</Text>
          </View>
          {bowlers.map((bowler) => {
            const economy = bowler.overs > 0 ? (bowler.runs / bowler.overs).toFixed(2) : '0.00';
            return (
              <View key={bowler.bowlerId} style={styles.tableRow}>
                <Text style={styles.tableRowText}>{bowler.bowlerName}</Text>
                <Text style={styles.tableRowText}>{bowler.overs}</Text>
                <Text style={styles.tableRowText}>{bowler.maidens}</Text>
                <Text style={styles.tableRowText}>{bowler.runs}</Text>
                <Text style={styles.tableRowText}>{bowler.wickets}</Text>
                <Text style={styles.tableRowText}>{economy}</Text>
              </View>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.buttonSection}>
        <View style={styles.buttonsContainer}>
          {[1, 2, 3, 4, 6].map((num) => (
            <TouchableOpacity key={num} style={styles.button} onPress={() => addRuns(num)}>
              <Text style={styles.buttonText}>{num}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.extraButtonsContainer}>
          {['WD', 'NB', 'Bye', 'LB', 'Out'].map((label) => (
            <TouchableOpacity
              key={label}
              style={styles.button}
              onPress={() => {
                if (label === 'Out') {
                  handleWicket();  // Handle wicket scenario
                } else {
                  setIsExtra(true);  // Set isExtra to true for extras
                  setExtras(extras + 1); // Update the extras score
                  addRuns(1);  // Assuming 1 run for extras like WD or NB
                }
              }}
            >
              <Text style={styles.buttonText}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.extraButtonsContainer}>
          <TouchableOpacity style={styles.button} onPress={() => addRuns(0)}>
            <Text style={styles.buttonText}>0</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handlePenaltyRuns}>
            <Text style={styles.buttonText}>P</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={goToSettings}>
            <Text style={styles.buttonText}>Set..</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={undoAction}>
            <Text style={styles.buttonText}>Un..</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleMore}>
            <Text style={styles.buttonText}>M...</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 60,
    paddingBottom: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  teamName: {
    fontSize: 18,
    marginBottom: 3,
  },
  innings: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 10,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  score: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  subText: {
    fontSize: 16,
    color: 'gray',
  },
  tableContainer: {
    width: '100%',
    marginTop: 20,
    paddingHorizontal: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  tableHeaderText: {
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  tableRowText: {
    flex: 1,
    textAlign: 'center',
  },
  striker: {
    backgroundColor: '#808080', // Gray background for the striker
  },
  strikerText: {
    color: 'white', // White text for the striker
  },
  button: {
    padding: 10,
    margin: 5,
    backgroundColor: '#f1f1f1',
    borderRadius: 5,
    width: 50,  // Set a consistent width for each button
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
  buttonSection: {
    width: '100%',
    paddingVertical: 15,
    backgroundColor: 'white',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    position: 'absolute',
    bottom: 80,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',  // Evenly distribute buttons
    marginBottom: 10,
  },
  extraButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',  // Evenly distribute extra buttons
  },
});

export default MatchScoringScreen;
