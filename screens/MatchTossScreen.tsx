import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Image, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import axios from 'axios';
import { RootStackParamList, SelectBattersScreenNavigationProp } from '../types'; // Adjust path if needed
import { BASE_URL } from '../App';

type MatchTossScreenRouteProp = RouteProp<RootStackParamList, 'MatchTossScreen'>;

interface Team {
  TeamName: string;
  TeamPictureUrl: string;
}

const MatchTossScreen = () => {
  const route = useRoute<MatchTossScreenRouteProp>();
  const navigation = useNavigation();
  const navigation1 = useNavigation<SelectBattersScreenNavigationProp>();
  const { matchId } = route.params;

  const [matchDetails, setMatchDetails] = useState<any>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [highlightedTeam, setHighlightedTeam] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [highlightedOption, setHighlightedOption] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(true);

  useEffect(() => {
    const fetchMatchDetails = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/get_MatchDetailsByMatchId?matchId=${matchId}`);
        if (response.data.length > 0) {
          setMatchDetails(response.data[0]);
        }
      } catch (error) {
        console.error('Error fetching match details', error);
        Alert.alert('Error', 'An error occurred while fetching match details.');
      }
    };
    fetchMatchDetails();
  }, [matchId]);

  const handleTeamSelect = (team: Team) => {
    setSelectedTeam(team);
    setHighlightedTeam(team.TeamName);
  };

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
    setHighlightedOption(option);
  };

  const handleStartScoring = async () => {
    if (!selectedTeam || !selectedOption) {
      Alert.alert('Error', 'Please select both a team and an option (BAT/BOWL).');
      return;
    }

    if (matchDetails.Home === matchDetails.Visitors) {
      Alert.alert('Error', 'Home and Visitors teams cannot be the same.');
      return;
    }

    try {
      const response = await axios.post(`${BASE_URL}/saveTossDetails`, {
        matchId: matchId,
        teamName: selectedTeam.TeamName,
        selectedOption: selectedOption,
      });

      if (response) {
        navigation1.navigate('SelectBattersScreen', {
          matchId: matchId,
          BattingTeamId: selectedTeam.TeamName, 
        });
        setIsModalVisible(false);
      } else {
        Alert.alert('Error', 'Failed to save toss details.');
      }
    } catch (error) {
      console.error('Error saving toss details', error);
      Alert.alert('Error', 'An error occurred while saving toss details.');
    }
  };

  return (
    <View style={styles.container}>
      {matchDetails ? (
        <>
          <Modal
            animationType="slide"
            transparent={true}
            visible={isModalVisible}
            onRequestClose={() => setIsModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.title}>Who Won The Toss?</Text>

                {/* Team 1 */}
                <TouchableOpacity
                  style={[
                    styles.teamOption,
                    highlightedTeam === matchDetails.Home && styles.selectedTeam,
                  ]}
                  onPress={() => handleTeamSelect({ TeamName: matchDetails.Home, TeamPictureUrl: matchDetails.HomePictureUrl })}
                >
                  <Image source={{ uri: matchDetails.HomePictureUrl }} style={styles.teamImage} />
                  <Text
                    style={[
                      styles.teamName,
                      highlightedTeam === matchDetails.Home && styles.highlightedTeam,
                    ]}
                  >
                    {matchDetails.Home}
                  </Text>
                </TouchableOpacity>

                {/* Team 2 */}
                <TouchableOpacity
                  style={[
                    styles.teamOption,
                    highlightedTeam === matchDetails.Visitors && styles.selectedTeam,
                  ]}
                  onPress={() => handleTeamSelect({ TeamName: matchDetails.Visitors, TeamPictureUrl: matchDetails.VisitorsPictureUrl })}
                >
                  <Image source={{ uri: matchDetails.VisitorsPictureUrl }} style={styles.teamImage} />
                  <Text
                    style={[
                      styles.teamName,
                      highlightedTeam === matchDetails.Visitors && styles.highlightedTeam,
                    ]}
                  >
                    {matchDetails.Visitors}
                  </Text>
                </TouchableOpacity>

                <Text style={styles.subTitle}>Elected To?</Text>

                {/* BAT or BOWL options */}
                <View style={styles.optionContainer}>
                  <TouchableOpacity
                    style={[
                      styles.optionButton,
                      highlightedOption === 'BAT' && styles.highlightedOption,
                      highlightedOption === 'BAT' && styles.selectedOption,
                    ]}
                    onPress={() => handleOptionSelect('BAT')}
                  >
                    <Text style={styles.optionText}>BAT</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.optionButton,
                      highlightedOption === 'BOWL' && styles.highlightedOption,
                      highlightedOption === 'BOWL' && styles.selectedOption,
                    ]}
                    onPress={() => handleOptionSelect('BOWL')}
                  >
                    <Text style={styles.optionText}>BOWL</Text>
                  </TouchableOpacity>
                </View>

                {/* Start Scoring Button */}
                <TouchableOpacity
                  style={styles.startScoringButton}
                  onPress={handleStartScoring}
                >
                  <Text style={styles.startScoringText}>Start Scoring</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </>
      ) : (
        <Text>Loading match details...</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  modalContainer: {
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
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subTitle: {
    fontSize: 16,
    marginTop: 20,
  },
  teamOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    padding: 10,
  },
  selectedTeam: {
    borderWidth: 2,
    borderColor: 'rgba(30, 30, 30, 0.8)',
    borderRadius: 5,
  },
  teamImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  teamName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  highlightedTeam: {
    color: 'rgba(30, 30, 30, 0.8)',
  },
  optionContainer: {
    flexDirection: 'row',
    marginTop: 15,
  },
  optionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    margin: 10,
    borderRadius: 5,
  },
  selectedOption: {
    borderWidth: 2,
    borderColor: 'rgba(30, 30, 30, 0.8)',
  },
  highlightedOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  optionText: {
    color: '#000',
    fontSize: 16,
  },
  startScoringButton: {
    backgroundColor: '#28a745',
    paddingVertical: 10,
    paddingHorizontal: 40,
    marginTop: 20,
    borderRadius: 5,
  },
  startScoringText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default MatchTossScreen;
