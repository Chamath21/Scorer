import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Modal, ActivityIndicator } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { MatchSummaryScreenRouteProp, RootStackParamList, ScoringScreenNavigationProp } from '../types';
import { BASE_URL } from '../App';

interface Bowler {
  playerName: string;
  playerId: number;
}

type SelectNewBowlersScreenRouteProp = RouteProp<RootStackParamList, 'SelectNewBowlersScreen'>;

const SelectNewBowlersScreen = () => {
  const route = useRoute<SelectNewBowlersScreenRouteProp>();
  const navigation1 = useNavigation<ScoringScreenNavigationProp>();
  const navigation2 = useNavigation<MatchSummaryScreenRouteProp>();
  const { matchId } = route.params;

  const [bowlers, setBowlers] = useState<Bowler[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedBowler, setSelectedBowler] = useState<Bowler | null>(null);
  const [MatchDecidedOvers, setMatchDecidedOvers] = useState<number>(0);
  const [nowOvers, setNowOvers] = useState<number>(0);
  const [isEndInningsModalVisible, setIsEndInningsModalVisible] = useState<boolean>(false);
  const [isEndMatchModalVisible, setisEndMatchModalVisible] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchInningsCompletionStatus(), fetchBowlers()]);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [matchId]);

  const fetchBowlers = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/get_bowlers?matchId=${matchId}`);
      setBowlers(response.data);
    } catch (error) {
      console.error('Error fetching bowlers:', error);
      Alert.alert('Error', 'An error occurred while fetching bowlers.');
    }
  };

  const fetchInningsCompletionStatus = async () => {
    try {
      // Wait for 6 seconds before making the API call
      await new Promise(resolve => setTimeout(resolve, 1000));
  
      const response = await axios.get(`${BASE_URL}/get_IsInningsCompleted`, {
        params: { matchId },
      });
  
      console.log('API Response:', response.data);  // Add this line to debug API response
  
      setMatchDecidedOvers(response.data.MatchDecidedOvers || 0);
      setNowOvers(response.data.CurrentlyBowledOvers || 0);
  
      console.log('MatchDecidedOvers:', MatchDecidedOvers); // Check the value of MatchDecidedOvers
      console.log('NowOvers:', nowOvers); // Check the value of nowOvers
  
      if (response.data.MatchDecidedOvers === response.data.CurrentlyBowledOvers) {
        setIsEndInningsModalVisible(true); // You can enable this line if necessary
      } else {
        setIsEndInningsModalVisible(false);
      }
    } catch (error) {
      console.error('Error fetching over completion status:', error);
      Alert.alert('Error', 'An error occurred while fetching over completion status.');
    }
  };

  const fetchNewInningsData = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
  
      const response = await axios.get(`${BASE_URL}/get_NewInningsMatchData`, {
        params: { matchId },
      });
  
      console.log('API Response:', response.data);  // Add this line to debug API response

      const isMatchCompleted = response.data;

      setisEndMatchModalVisible(isMatchCompleted)

      navigation1.navigate('SelectBattersScreen', { matchId: Number(matchId), BattingTeamId: (response.data.TeamId) });

      fetchMatchEndData();

    } catch (error) {
      console.error('Error fetching over completion status:', error);
      Alert.alert('Error', 'An error occurred while fetching over completion status.');
    }
  };

  const fetchMatchEndData = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
  
      const response = await axios.get(`${BASE_URL}/get_MatchEndData`, {
        params: { matchId },
      });
  
      console.log('API Response:', response.data);  // Add this line to debug API response

      if(response.data == true){
        navigation2.navigate('MatchSummaryScreen', { matchId: Number(matchId)});
      }
     

    } catch (error) {
      console.error('Error fetching over completion status:', error);
      Alert.alert('Error', 'An error occurred while fetching over completion status.');
    }
  };
  
  const handleSelectBowler = (bowler: Bowler) => {
    setSelectedBowler(bowler);
  };

  const handleStartMatchButtonClick = async () => {
    if (!selectedBowler) {
      Alert.alert('Error', 'Please select a bowler.');
      return;
    }

    const data = {
      matchId,
      selectedBowlerId: selectedBowler.playerId,
    };

    try {
      const response = await axios.post(`${BASE_URL}/save_selectedNewBowler`, data);

      if (response.status === 200) {
        navigation1.navigate('ScoringScreen', { matchId: Number(matchId) });
      } else {
        Alert.alert('Error', 'Failed to start the match.');
      }
    } catch (error) {
      console.error('Error starting match:', error);
      Alert.alert('Error', 'An error occurred while starting the match.');
    }
  };

  const handleInningsEnd = async () => {
    try {
      // Sending matchId in the body of the POST request
      const response = await axios.post(`${BASE_URL}/save_inningsEnd`, {
        matchId: matchId, // Sending matchId as part of the body
      });
  
      if (response.status === 200) {
        fetchNewInningsData();
      } else {
        Alert.alert('Error', 'Failed to end the innings.');
      }
    } catch (error) {
      console.error('Error ending innings:', error);
      Alert.alert('Error', 'An error occurred while ending the innings.');
    }
  };
  

  const renderBowler = ({ item }: { item: Bowler }) => {
    const isSelected = selectedBowler?.playerId === item.playerId;
    return (
      <View style={[styles.batterRow, isSelected && styles.selectedBatter]}>
        <Text style={[styles.batterName, isSelected && { color: 'yellow' }]}>{item.playerName}</Text>
        <TouchableOpacity
          style={[styles.addButton, isSelected && styles.selectedButton]}
          onPress={() => handleSelectBowler(item)}
        >
          <Text style={styles.addButtonText}>{isSelected ? '✓' : '+'}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const toggleModalIsInningsEnded = () => {
    setIsEndInningsModalVisible(false);
  };

  const toggleModalisEndMatchEnded = () => {
    setisEndMatchModalVisible(false);
  };

  const endInnings = () => {
    handleInningsEnd();
    toggleModalIsInningsEnded();
  };

  const endMatch = () => {
    //handleInningsEnd();
    toggleModalisEndMatchEnded();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Bowler</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#fff" />
      ) : bowlers.length > 0 ? (
        <FlatList
          data={bowlers}
          renderItem={renderBowler}
          keyExtractor={(item) => item.playerId.toString()}
          contentContainerStyle={styles.list}
        />
      ) : (
        <Text style={styles.noPlayersText}>No bowlers found.</Text>
      )}

      {selectedBowler && (
        <TouchableOpacity
          style={styles.startMatchButton}
          onPress={handleStartMatchButtonClick}
        >
          <Text style={styles.startMatchText}>Start Match</Text>
        </TouchableOpacity>
      )}

      <Modal
        visible={isEndInningsModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={toggleModalIsInningsEnded}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContentEndInnings}>
            <Text style={styles.modalText}>Are you sure you want to end the innings?</Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity style={styles.modalButton} onPress={endInnings}>
                <Text style={styles.buttonText}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={toggleModalIsInningsEnded}>
                <Text style={styles.buttonText}>No</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isEndMatchModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={toggleModalisEndMatchEnded}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContentEndInnings}>
            <Text style={styles.modalText}>Are you sure you want to end the match?</Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity style={styles.modalButton} onPress={endMatch}>
                <Text style={styles.buttonText}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={toggleModalisEndMatchEnded}>
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
    padding: 20,
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#fff',
  },
  batterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    justifyContent: 'space-between',
    marginBottom: 10,
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    borderRadius: 8,
    paddingHorizontal: 15,
    shadowColor: '#fff',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  selectedBatter: {
    backgroundColor: 'gray',
  },
  batterName: {
    fontSize: 18,
    color: '#fff',
  },
  addButton: {
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedButton: {
    backgroundColor: '#6c757d',
  },
  addButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  loadingText: {
    fontSize: 18,
    color: '#fff',
  },
  noPlayersText: {
    fontSize: 18,
    color: '#fff',
  },
  list: {
    paddingBottom: 20,
  },
  startMatchButton: {
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  startMatchText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContentEndInnings: {
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
    width: '70%',
  },
  modalButton: {
    backgroundColor: 'gray',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 50,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
});

export default SelectNewBowlersScreen;
