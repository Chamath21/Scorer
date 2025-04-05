import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { RootStackParamList, ScoringScreenNavigationProp } from '../types';
import { BASE_URL } from '../App';

interface Bowler {
  playerName: string;
  playerId: number;
}

type SelectBowlersScreenRouteProp = RouteProp<RootStackParamList, 'SelectBowlersScreen'>;

const SelectBowlersScreen = () => {
  const route = useRoute<SelectBowlersScreenRouteProp>();
  const navigation = useNavigation();
  const navigation1 = useNavigation<ScoringScreenNavigationProp>();
  const { matchId, selectedBatterIds } = route.params;

  const [bowlers, setBowlers] = useState<Bowler[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedBowler, setSelectedBowler] = useState<Bowler | null>(null);
  const [MatchDecidedOvers, setMatchDecidedOvers] = useState<number | 0>(0);

  useEffect(() => {
    const fetchBowlers = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/get_bowlers?matchId=${matchId}`);
        setBowlers(response.data);
      } catch (error) {
        console.error('Error fetching bowlers:', error);
        Alert.alert('Error', 'An error occurred while fetching bowlers.');
      } finally {
        setLoading(false);
      }
    };

    fetchBowlers();
  }, [matchId]);

  const handleSelectBowler = (bowler: Bowler) => {
    setSelectedBowler(bowler);
  };

  const handleStartMatchButtonClick = async () => {
    if (!selectedBowler) {
      Alert.alert('Error', 'Please select a bowler.');
      return;
    }

    // Prepare the data to send in the API call
    const data = {
      matchId,
      selectedBatterIds, // Array of selected batter IDs
      selectedBowlerId: selectedBowler.playerId, // Selected bowler's playerId
    };

    try {
      const response = await axios.post(`${BASE_URL}/save_selectedplayerdata`, data);

      if (response.status === 200) {
        navigation1.navigate('ScoringScreen', { matchId: Number(matchId) });
      } else {
        Alert.alert('Error', 'Failed to start the match.');
      }
    } catch (error) {
      console.error('Error starting match:', error);
      Alert.alert('Error', 'An error occurred while starting the match.');

      try {
        const response = await axios.get(`${BASE_URL}/get_IsInningsCompleted`, {
          params: { matchId }
        });
        setMatchDecidedOvers(response.data.MatchDecidedOvers || 1000);
        console.log('MatchDecidedOvers', MatchDecidedOvers)
      } catch (error) {
        console.error('Error fetching over completion status:', error);
        Alert.alert('Error', 'An error occurred while fetching over completion status.');
      }

    }
  };

  const renderBowler = ({ item }: { item: Bowler }) => {
    const isSelected = selectedBowler?.playerId === item.playerId;
    return (
      <View style={[styles.batterRow, isSelected && styles.selectedBatter]}>
        <Text style={styles.batterName}>{item.playerName}</Text>
        <TouchableOpacity
          style={[styles.addButton, isSelected && styles.selectedButton]}
          onPress={() => handleSelectBowler(item)}
        >
          <Text style={styles.addButtonText}>{isSelected ? '✓' : '+'}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Bowler</Text>

      {loading ? (
        <Text style={styles.loadingText}>Loading...</Text>
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
});

export default SelectBowlersScreen;
