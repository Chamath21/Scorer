import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { OutScreenNavigationProp, RootStackParamList, SelectNewBowlersScreenRouteProp } from '../types';
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
  balls: number;
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
  const navigation1 = useNavigation<SelectNewBowlersScreenRouteProp>();
  const [isExtra, setIsExtra] = useState<boolean>(false);
  const [isBowlerExtra, setIsBowlerExtra] = useState<boolean>(false);
  const [isOverCompleted, setIsOverCompleted] = useState<boolean | null>(null);
  const [extraType, setExtraType] = useState<number | 0>(0);



  // State for batsmen and to track the striker
  const [batsmen, setBatsmen] = useState<Batsman[]>([]);
  const [strikerIndex, setStrikerIndex] = useState<number>(0); // Track the striker's index

  // State for bowlers
  const [bowlers, setBowlers] = useState<Bowler[]>([]);

  // State for balls in over
  const [ballsInOver, setBallsInOver] = useState<number>(0);

  const [bowlerOvers, setBowlerOvers] = useState<number>(0.0);
  const [bowlerballs, setBowlerballs] = useState<number>(0.0);

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
          balls: bowler.overs || 0,
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
        setBowlerballs(bowlers[0].balls || 0)
        setBowlerOvers(bowlers[0].overs || 0)
      } catch (error) {
        console.error("Error fetching match data: ", error);
      }
    };

    fetchMatchData();
  }, [matchId]); // Runs when matchId changes

  useEffect(() => {
    if (matchId) {
      const fetchOverCompletionStatus = async () => {
        try {
          const response = await axios.get(`${BASE_URL}/get_IsOverCompleted`, {
            params: { matchId }
          });
          setIsOverCompleted(response.data.IsOverCompleted || 1);
        } catch (error) {
          console.error('Error fetching over completion status:', error);
          Alert.alert('Error', 'An error occurred while fetching over completion status.');
        }
      };
  
      fetchOverCompletionStatus();
      console.log(isOverCompleted)
      if(isOverCompleted){
        navigation.navigate('SelectNewBowlersScreen', { matchId: matchId });
      }
    }
  }, [matchId]);

  const rotateBatsmen = () => {
    setStrikerIndex((prevIndex) => (prevIndex === 0 ? 1 : 0));
  };

  const addRuns = async (runs: number, isExtra: boolean = false) => {
    const updatedBatsmen = [...batsmen];
    const striker = updatedBatsmen[strikerIndex];
    const currentBowler = bowlers[0];
  
    let isBoundary = false;
    
    // Update the batsman's stats only if it's not an extra
    if (!isExtra) {
      striker.runs += runs;
      striker.balls += 1;
      currentBowler.runs += runs;
  
      if (runs === 4) {
        striker.fours += 1;
        isBoundary = true;
      }
      if (runs === 6) {
        striker.sixes += 1;
        isBoundary = true;
      }
    } else {
      // For extras, just update the runs (without increasing ball or striker stats)
      setExtras((prevExtras) => prevExtras + runs);
    }

    if (isBowlerExtra) {
      currentBowler.runs += runs;  
    } 
    if (isBowlerExtra && extraType == 2){
      striker.balls += 1;
    }
      else {
      // For extras, just update the runs (without increasing ball or striker stats)
      setExtras((prevExtras) => prevExtras + runs);
    }
  
    setBatsmen(updatedBatsmen);
    setScore((prevScore) => prevScore + runs);
  
    if (!isExtra) {
      setBallsInOver((prevBalls) => {
        const newBalls = Number(prevBalls) + 1;
        if (newBalls === 6) {
          setOvers((prevOvers) => Number(prevOvers) + 1);
          setBallsInOver(0);
          navigation1.navigate('SelectNewBowlersScreen', { matchId: matchId });
          return 0;
        }
        return newBalls;
      });
  
      setBowlerballs((prevBalls) => {
        const newBalls = Number(prevBalls) + 1;
        if (newBalls === 6) {
          setBowlerOvers((prevOvers) => Number(prevOvers) + 1);
          return 0;
        }
        return newBalls;
      });
    }
  
    if (!isExtra && runs % 2 !== 0) rotateBatsmen();
  
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
        ballsInOver: ballsInOver,
        isBowlerExtra: isBowlerExtra,
        bowlersballs: bowlerballs,
        bowlerOvers: bowlerOvers,
        extraType: extraType
      });
      console.log('Run recorded successfully');
    } catch (error) {
      console.error('Error recording run:', error);
      Alert.alert('Error', 'An error occurred while recording the run.');
    }
  };
  
  const extraButtonHandler = (label: string) => {
    setIsBowlerExtra(true);
    setIsExtra(true);
    
    let currentExtraType = 0;
  
    switch (label) {
      case 'WD':
        currentExtraType = 1; // WD gets the value 1
        break;
      case 'NB':
        currentExtraType = 2; // NB gets the value 2
        break;
      case 'Bye':
        currentExtraType = 3; // Bye gets the value 3
        setIsBowlerExtra(false);
        break;
      case 'LB':
        currentExtraType = 4; // LB gets the value 4
        setIsBowlerExtra(false);
        break;
      case 'Out':
        handleWicket();
        setIsBowlerExtra(false);
        setIsExtra(false);
        currentExtraType = 0;
        break;
    }
  
    // Now pass the currentExtraType directly to addRuns
    setExtraType(currentExtraType);  // Update the state
    addRuns(1, true); // Add runs for the selected extra
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
    setIsBowlerExtra(false);
    setExtraType(5);
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

  const handleMatchCentreClick = () => {
    navigation.navigate('ScoreCardScreen', { matchId });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
      <TouchableOpacity onPress={handleMatchCentreClick}>
          <Text style={styles.title}>Match Centre</Text>
        </TouchableOpacity>
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
                <Text style={styles.tableRowText}>{bowlerOvers}.{bowlerballs}</Text>
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
            <TouchableOpacity key={num} style={styles.button} onPress={() => {
              setIsBowlerExtra(false);
              addRuns(num)
            }
            }>
              <Text style={styles.buttonText}>{num}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Extra buttons */}
      <View style={styles.extraButtonsContainer}>
        <TouchableOpacity style={styles.button} onPress={() => extraButtonHandler('WD')}>
          <Text style={styles.buttonText}>WD</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => extraButtonHandler('NB')}>
          <Text style={styles.buttonText}>NB</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => extraButtonHandler('Bye')}>
          <Text style={styles.buttonText}>Bye</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => extraButtonHandler('Leg Bye')}>
          <Text style={styles.buttonText}>Leg Bye</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => extraButtonHandler('Out')}>
          <Text style={styles.buttonText}>Out</Text>
        </TouchableOpacity>
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
    paddingTop: 10,
    paddingBottom: 10,
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
