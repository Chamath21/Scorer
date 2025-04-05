import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert, 
  Image, 
  Modal, 
  TouchableWithoutFeedback 
} from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { AfterSelectAddMatchDetailsNavigationProp, MatchTossScreenNavigationProp, RootStackParamList } from '../types';
import { BASE_URL } from '../App';

interface Match {
  MatchLocation: string;
  TeamA: string;
  TeamB: string;
  TeamAImage: string;  
  TeamBImage: string; 
  SeriesName: string;
  MatchDate: string;
  MatchTime: string;
  MatchId: number;
  MatchStatus: number; 
}

const SeriesWiseMatchScreen = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'AfterSelectAddMatchDetailsScreen'>>();  
  const { seriesId } = route.params;

  const [selectedTab, setSelectedTab] = useState<'Upcoming' | 'Live' | 'Past'>('Upcoming'); 
  const [loading, setLoading] = useState(true);
  const [groupedMatches, setGroupedMatches] = useState({
    Upcoming: [] as Match[],
    Live: [] as Match[],
    Past: [] as Match[],
  });
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null); 
  const [isModalVisible, setIsModalVisible] = useState(false); 
  const [isDeleting, setIsDeleting] = useState(false);

  const navigation = useNavigation<AfterSelectAddMatchDetailsNavigationProp>();
  const navigation1 = useNavigation<MatchTossScreenNavigationProp>();

  const handleAddMatchPress = () => {
    navigation.navigate('AfterSelectAddMatchDetailsScreen', { seriesId: seriesId, teamId: null });
  };

  useEffect(() => {
    fetchMatches();
  }, [selectedTab, seriesId]);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/get_SeriesWisematches?seriesId=${seriesId}`);
      const data = await response.json();

      const grouped = {
        Upcoming: data.filter((match: Match) => match.MatchStatus === 1),
        Live: data.filter((match: Match) => match.MatchStatus === 2),
        Past: data.filter((match: Match) => match.MatchStatus === 3),
      };

      setGroupedMatches(grouped); 
    } catch (error) {
      Alert.alert('Error', 'Failed to load matches');
    } finally {
      setLoading(false);
    }
  };

  const renderMatchCard = ({ item }: { item: Match }) => (
    <TouchableOpacity 
      onPress={() => handleMatchPress(item)} 
      style={[styles.matchCard, item.MatchStatus === 1 && styles.upcoming, item.MatchStatus === 2 && styles.live, item.MatchStatus === 3 && styles.past]}
    >
      <View style={styles.matchCardHeader}>
        <Image source={{ uri: item.TeamAImage }} style={styles.teamImage} />
        <Text style={styles.matchTitle}>{item.TeamA} vs {item.TeamB}</Text>
        <Image source={{ uri: item.TeamBImage }} style={styles.teamImage} />
      </View>
      <Text style={styles.matchInfo}>
        {formatMatchDateTime(item.MatchDate, item.MatchTime)} | {item.MatchLocation}
      </Text>
    </TouchableOpacity>
  );

  const formatMatchDateTime = (date: string, time: string): string => {
    const matchDate = new Date(`${date}T${time}`); 
    
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',  
      month: '2-digit',  
      day: '2-digit',    
      hour: '2-digit',   
      minute: '2-digit',
      hour12: true,      
    };
    
    return new Intl.DateTimeFormat('en-GB', options).format(matchDate);
  };

  const handleMatchPress = (match: Match) => {
    setSelectedMatch(match);
    setIsModalVisible(true);  // Show modal when match is clicked
  };

  const handleResumeScoring = () => {
    if (selectedMatch) {
      // Navigate to ScoringScreen
      navigation.navigate('ScoringScreen', { matchId: selectedMatch.MatchId });
      setIsModalVisible(false);  // Close modal after navigating
    }
  };

  const handleStartMatch = () => {
    if (selectedMatch) {
      // Navigate to the SelectTeamsScreen and pass the MatchId parameter
      navigation1.navigate('MatchTossScreen', { matchId: selectedMatch.MatchId });
  
      // Close the modal after navigating
      setIsModalVisible(false);
    }
  };

  const handleDeleteMatch = async () => {
    if (selectedMatch) {
      setIsDeleting(true);  // Show loading state
      try {
        const response = await fetch(`${BASE_URL}/deleteMatchById`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ matchId: selectedMatch.MatchId }),
        });

        const result = await response.json();
        if (response.ok && result.message === 'Delete successful') {
          Alert.alert('Success', 'Match deleted successfully');
          // Remove the deleted match from the list
          const updatedMatches = groupedMatches.Upcoming.filter(
            (match) => match.MatchId !== selectedMatch.MatchId
          );
          setGroupedMatches((prevState) => ({
            ...prevState,
            Upcoming: updatedMatches,
          }));
        } else {
          Alert.alert('Error', result.error || 'Failed to delete match');
        }
      } catch (error) {
        Alert.alert('Error', 'Something went wrong');
      } finally {
        setIsDeleting(false); // Hide loading state
        setIsModalVisible(false); // Close modal after action
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Matches for Series ID: {seriesId}</Text>

      {/* Tabs for filtering matches */}
      <View style={styles.tabContainer}>
        {['Upcoming', 'Live', 'Past'].map((tab) => (
          <TouchableOpacity 
            key={tab} 
            style={[styles.tabButton, selectedTab === tab && styles.activeTab]} 
            onPress={() => setSelectedTab(tab as 'Upcoming' | 'Live' | 'Past')}
          >
            <Text style={styles.tabText}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Match List */}
      {loading ? (
        <ActivityIndicator size="large" color="#FFD700" />
      ) : (
        <FlatList 
          data={groupedMatches[selectedTab]}
          keyExtractor={(item) => item.MatchId.toString()}
          renderItem={renderMatchCard}
          ListEmptyComponent={<Text style={styles.emptyText}>No matches found</Text>}
        />
      )}

      {/* Conditionally Render Add Match Button */}
      {selectedTab === 'Upcoming' && (
        <TouchableOpacity style={styles.addMatchButton} onPress={handleAddMatchPress}>
          <Text style={styles.addMatchText}>+ Add Match</Text>
        </TouchableOpacity>
      )}

      {/* Modal for Match Options */}
      <Modal 
        visible={isModalVisible} 
        transparent={true} 
        animationType="fade" 
        onRequestClose={() => setIsModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsModalVisible(false)}>
          <View style={styles.modalBackground}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Choose an Option</Text>
              {/* Conditionally render options */}
              {selectedMatch?.MatchStatus === 2 ? (
                <TouchableOpacity onPress={handleResumeScoring} style={styles.modalButton}>
                  <Text style={styles.modalButtonText}>Resume Scoring</Text>
                </TouchableOpacity>
              ) : (
                <>
                  <TouchableOpacity onPress={handleStartMatch} style={styles.modalButton}>
                    <Text style={styles.modalButtonText}>Start Match</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleDeleteMatch} style={styles.modalButton}>
                    <Text style={styles.modalButtonText}>Delete Match</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 10, 
    backgroundColor: '#ffffff' 
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#fff', 
    textAlign: 'center', 
    marginBottom: 10 
  },
  tabContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    marginBottom: 15 
  },
  tabButton: { 
    paddingVertical: 10, 
    paddingHorizontal: 30, 
    borderRadius: 25, 
    backgroundColor: '#333' 
  },
  activeTab: { 
    backgroundColor: 'rgba(30, 30, 30, 0.8)' 
  },
  tabText: { 
    color: '#fff',  // Set text color to white
    fontWeight: 'bold' 
  },
  matchCard: { 
    backgroundColor: 'rgba(30, 30, 30, 0.8)', 
    padding: 20, 
    borderRadius: 15, 
    marginVertical: 10, 
    borderWidth: 2, 
    borderColor: '#333' 
  },
  matchCardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 10 
  },
  teamImage: { 
    width: 50, 
    height: 50, 
    borderRadius: 25 
  },
  matchTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#ffffff',  // Set text color to gold
    textAlign: 'center', 
    flex: 1 
  },
  matchInfo: { 
    fontSize: 14, 
    color: '#ddd',  // Set text color to light gray
    marginTop: 5, 
    textAlign: 'center' 
  },
  upcoming: { 
    borderColor: 'rgba(30, 30, 30, 0.8)', 
    borderWidth: 2 
  },
  live: { 
    borderColor: '#FF4500', 
    borderWidth: 2 
  },
  past: { 
    borderColor: '#A9A9A9', 
    borderWidth: 2 
  },
  emptyText: { 
    textAlign: 'center', 
    color: '#bbb',  // Set text color to light gray
    marginTop: 20 
  },
  addMatchButton: { 
    backgroundColor: 'rgba(30, 30, 30, 0.8)', 
    paddingVertical: 12, 
    alignItems: 'center', 
    borderRadius: 10, 
    marginTop: 20 
  },
  addMatchText: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#ffffff'  // Set text color to black
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    borderRadius: 5,
    marginBottom: 10,
  },
  modalButtonText: {
    fontSize: 16,
    color: 'white',
  },
});

export default SeriesWiseMatchScreen;
