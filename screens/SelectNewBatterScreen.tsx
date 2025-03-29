import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { RouteProp, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { RootStackParamList, SelectBowlersScreenNavigationProp } from '../types';
import { BASE_URL } from '../App';

interface Batter {
  playerName: string;
  playerId: number;
}

type SelectNewBatterScreenRouteProp = RouteProp<RootStackParamList, 'SelectNewBatterScreen'>;

const SelectNewBatterScreen: React.FC = () => {
  const route = useRoute<SelectNewBatterScreenRouteProp>();
  const navigation1 = useNavigation<SelectBowlersScreenNavigationProp>(); 
  const { matchId, battingTeamId } = route.params;

  const [batters, setBatters] = useState<Batter[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedBatters, setSelectedBatters] = useState<Batter[]>([]);

  useEffect(() => {
    if (battingTeamId && matchId) {
        const fetchBatters = async () => {
            try {
                const response = await axios.get(`${BASE_URL}/get_PlayersByTeamId?teamId=${battingTeamId}&matchId=${matchId}`);
                setBatters(response.data);
                console.log(response.data);
            } catch (error) {
                console.error('Error fetching batters:', error);
                Alert.alert('Error', 'An error occurred while fetching batters.');
            } finally {
                setLoading(false);
            }
        };
        
        fetchBatters();
    }
}, [battingTeamId, matchId]); // Dependency array added here


  const handleSelectBatter = (batter: Batter) => {
    const isSelected = selectedBatters.some((b) => b.playerId === batter.playerId);

    if (isSelected) {
      // Unselect batter
      setSelectedBatters(selectedBatters.filter((b) => b.playerId !== batter.playerId));
    } else if (selectedBatters.length < 2) {
      // Select batter, only if less than 2 are selected
      setSelectedBatters([...selectedBatters, batter]);
    }
  };

  const handleSelectBatsmanButtonClick = async () => {  
    console.log('Selected Batters:', selectedBatters);
    
    // Extracting selectedBatterIds from selectedBatters
    const selectedBatterIds = selectedBatters.map((batter) => batter.playerId);
    console.log('Selected Batter IDs:', selectedBatterIds);
  
    try {
      // Sending an object with both matchId and selectedBatterIds to the backend
      const response = await axios.post(`${BASE_URL}/save_selectedNewBatsman`, {
        matchId: matchId,
        selectedBatterIds: selectedBatterIds
      });
  
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


  const renderBatter = ({ item }: { item: Batter }) => {
    const isSelected = selectedBatters.some((b) => b.playerId === item.playerId);
    return (
      <View style={[styles.batterRow, isSelected && styles.selectedBatter]}>
        <Text style={styles.batterName}>{item.playerName}</Text>
        <TouchableOpacity
          style={[styles.addButton, isSelected && styles.selectedButton]}
          onPress={() => handleSelectBatter(item)}
          disabled={selectedBatters.length >= 1 && !isSelected}
        >
          <Text style={styles.addButtonText}>{isSelected ? '✓' : '+'}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <Text style={styles.loadingText}>Loading...</Text>
      ) : batters.length > 0 ? (
        <FlatList
          data={batters}
          renderItem={renderBatter}
          keyExtractor={(item) => item.playerId.toString()}
          contentContainerStyle={styles.list}
        />
      ) : (
        <Text style={styles.noPlayersText}>No batters found.</Text>
      )}

      {selectedBatters.length === 1 && (
        <TouchableOpacity
          style={styles.selectBatsmanButton}
          onPress={handleSelectBatsmanButtonClick}
        >
          <Text style={styles.selectBatsmanText}>Select Batsman(s)</Text>
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
  selectBatsmanButton: {
    backgroundColor: 'rgba(30, 30, 30, 0.8)' ,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  selectBatsmanText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default SelectNewBatterScreen;
