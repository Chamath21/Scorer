import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Image, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import axios from 'axios';
import { RootStackParamList, ScoringScreenNavigationProp } from '../types'; // Adjust path if needed

type MatchTossScreenRouteProp = RouteProp<RootStackParamList, 'MatchTossScreen'>;

// Define the Team type based on the data structure you're using
interface Team {
  TeamName: string;
  TeamPictureUrl: string;
}

const MatchTossScreen = () => {
  const route = useRoute<MatchTossScreenRouteProp>(); // Use the correct type here
  const navigation = useNavigation();
  const navigation1 = useNavigation<ScoringScreenNavigationProp>();
  const { matchId } = route.params;  // Now matchId is recognized as part of params

  const [matchDetails, setMatchDetails] = useState<any>(null); // Replace 'any' with your type if needed
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null); // Set the type for selectedTeam
  const [highlightedTeam, setHighlightedTeam] = useState<string | null>(null); // Track highlighted team
  const [selectedOption, setSelectedOption] = useState<string | null>(null); // Track selected option
  const [highlightedOption, setHighlightedOption] = useState<string | null>(null); // Track highlighted option
  const [isModalVisible, setIsModalVisible] = useState(true);

  useEffect(() => {
    // Fetch match details based on matchId
    const fetchMatchDetails = async () => {
      try {
        const response = await axios.get(`http://192.168.1.3:5000/get_MatchDetailsByMatchId?matchId=${matchId}`);
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

  // Define handleTeamSelect with a typed parameter 'team' of type Team
  const handleTeamSelect = (team: Team) => {
    setSelectedTeam(team);
    setHighlightedTeam(team.TeamName); // Highlight the selected team
  };

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
    setHighlightedOption(option); // Highlight the selected option
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
      // Send API request to save the toss information (team and option)
      const response = await axios.post('http://192.168.1.3:5000/saveTossDetails', {
        matchId: matchId,
        teamName: selectedTeam.TeamName,  // Assuming the team name or team ID is passed
        selectedOption: selectedOption,
      });

      if (response) {
        // If the API call is successful, navigate to the ScoringScreen
        navigation1.navigate('ScoringScreen', {matchId: matchId,});
        setIsModalVisible(false); // Close the modal
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
                    highlightedTeam === matchDetails.Home && styles.selectedTeam, // Apply border if selected
                  ]}
                  onPress={() => handleTeamSelect({ TeamName: matchDetails.Home, TeamPictureUrl: matchDetails.HomePictureUrl })}
                >
                  <Image
                    source={{ uri: matchDetails.HomePictureUrl }}
                    style={styles.teamImage}
                  />
                  <Text
                    style={[
                      styles.teamName,
                      highlightedTeam === matchDetails.Home && styles.highlightedTeam, // Apply highlight when selected
                    ]}
                  >
                    {matchDetails.Home}
                  </Text>
                </TouchableOpacity>

                {/* Team 2 */}
                <TouchableOpacity
                  style={[
                    styles.teamOption,
                    highlightedTeam === matchDetails.Visitors && styles.selectedTeam, // Apply border if selected
                  ]}
                  onPress={() => handleTeamSelect({ TeamName: matchDetails.Visitors, TeamPictureUrl: matchDetails.VisitorsPictureUrl })}
                >
                  <Image
                    source={{ uri: matchDetails.VisitorsPictureUrl }}
                    style={styles.teamImage}
                  />
                  <Text
                    style={[
                      styles.teamName,
                      highlightedTeam === matchDetails.Visitors && styles.highlightedTeam, // Apply highlight when selected
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
                      highlightedOption === 'BAT' && styles.highlightedOption, // Apply highlight when selected
                      highlightedOption === 'BAT' && styles.selectedOption, // Apply border when selected
                    ]}
                    onPress={() => handleOptionSelect('BAT')}
                  >
                    <Text style={styles.optionText}>BAT</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.optionButton,
                      highlightedOption === 'BOWL' && styles.highlightedOption, // Apply highlight when selected
                      highlightedOption === 'BOWL' && styles.selectedOption, // Apply border when selected
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
    borderColor: 'rgba(30, 30, 30, 0.8)', // Border color when team is selected
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
    color: 'rgba(30, 30, 30, 0.8)', // Highlight color for selected team
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
    borderColor: 'rgba(30, 30, 30, 0.8)', // Border color when option is selected
  },
  highlightedOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Highlight color for selected option
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
