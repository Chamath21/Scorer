import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, Image, StyleSheet, TouchableOpacity, Modal, Button, Alert } from 'react-native';
import { AddOrSelectTeamScreenNavigationProp } from '../types';
import { BASE_URL } from '../App';

type Team = {
  TeamId: string;
  TeamName: string;
  TeamLocation: string;
  TeamPictureUrl: string;
};

type SelectTeamScreenProps = {
  navigation: AddOrSelectTeamScreenNavigationProp;
  route: any;
};

const SelectTeamScreen: React.FC<SelectTeamScreenProps> = ({ navigation, route }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [teams, setTeams] = useState<Team[]>([]);
  const [filteredTeams, setFilteredTeams] = useState<Team[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamLocation, setNewTeamLocation] = useState('');
  const [newTeamPictureUrl, setNewTeamPictureUrl] = useState('');

  const { seriesId } = route.params;

  useEffect(() => {
    const fetchTeamDetails = async () => {
      try {
        const response = await fetch(`${BASE_URL}/get_TeamDetails`);
        const data = await response.json();
        if (response.ok) {
          setTeams(data);
          setFilteredTeams(data);
        } else {
          console.error('Error fetching team details:', data.error);
        }
      } catch (error) {
        console.error('Error fetching team details:', error);
      }
    };

    fetchTeamDetails();
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = teams.filter(team =>
      team.TeamName.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredTeams(filtered);
  };

  const handleTeamSelect = (team: Team) => {
    navigation.navigate('AfterSelectAddMatchDetailsScreen', { seriesId: seriesId, teamId: team.TeamId });
  };

  const handleAddPlayers = (teamId: string) => {
    navigation.navigate('AddPlayersScreen', { teamId });  
  };

  const renderTeam = ({ item }: { item: Team }) => (
    <View style={styles.teamRow}>
      <TouchableOpacity style={styles.teamItem} onPress={() => handleTeamSelect(item)}>
        <Image source={{ uri: item.TeamPictureUrl }} style={styles.teamLogo} />
        <View style={styles.teamInfo}>
          <Text style={styles.teamName}>{item.TeamName}</Text>
          <Text style={styles.teamLocation}>{item.TeamLocation}</Text>
        </View>
      </TouchableOpacity>

      {/* "+" Icon for Adding Players */}
      <TouchableOpacity
        style={styles.addPlayerButton}
        onPress={() => handleAddPlayers(item.TeamId)}
      >
        <Text style={styles.addPlayerButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );

  const handleAddTeam = async () => {
    if (!newTeamName || !newTeamLocation || !newTeamPictureUrl) {
      Alert.alert('Error', 'Please fill in all fields!');
      return;
    }

    const newTeam: Team = {
      TeamId: Math.random().toString(36).substr(2, 9),
      TeamName: newTeamName,
      TeamLocation: newTeamLocation,
      TeamPictureUrl: newTeamPictureUrl,
    };

    try {
      const response = await fetch(`${BASE_URL}/add_teams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTeam),
      });

      const data = await response.json();

      if (response.ok) {
        setTeams([...teams, newTeam]);
        setFilteredTeams([...teams, newTeam]);
        setShowModal(false);
        setNewTeamName('');
        setNewTeamLocation('');
        setNewTeamPictureUrl('');
      } else {
        console.error('Error adding team:', data.error);
        Alert.alert('Error', data.error || 'Something went wrong');
      }
    } catch (error) {
      console.error('Error adding team:', error);
      Alert.alert('Error', 'An error occurred while adding the team.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search teams"
        value={searchQuery}
        onChangeText={handleSearch}
      />

      {/* Teams List */}
      <FlatList
        data={filteredTeams}
        renderItem={renderTeam}
        keyExtractor={item => item.TeamId}
        contentContainerStyle={styles.list}
      />

      {/* Add Team Button (Now with "+" mark) */}
      <TouchableOpacity style={styles.addButton} onPress={() => setShowModal(true)}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

      {/* Modal for Adding a Team */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Team</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Team Name"
              value={newTeamName}
              onChangeText={setNewTeamName}
            />
            <TextInput
              style={styles.input}
              placeholder="Team Location"
              value={newTeamLocation}
              onChangeText={setNewTeamLocation}
            />
            <TextInput
              style={styles.input}
              placeholder="Team Picture URL"
              value={newTeamPictureUrl}
              onChangeText={setNewTeamPictureUrl}
            />

            <Button title="Save Team" onPress={handleAddTeam} />
            <Button title="Cancel" onPress={() => setShowModal(false)} color="red" />
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
  searchBar: {
    height: 40,
    borderColor: '#ffffff',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
    paddingLeft: 10,
    color: '#ffffff',
  },
  list: {
    paddingBottom: 20,
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ffffff',
    justifyContent: 'space-between',
  },
  teamItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamLogo: {
    width: 50,
    height: 50,
    marginRight: 10,
    borderRadius: 25,
  },
  teamInfo: {
    flexDirection: 'column',
  },
  teamName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  teamLocation: {
    fontSize: 14,
    color: '#ffffff',
  },
  addButton: {
    backgroundColor: '#ffffff',
    padding: 10,
    borderRadius: 50,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  addButtonText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'rgba(30, 30, 30, 0.8)',
  },
  addPlayerButton: {
    backgroundColor: '#ff9800',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPlayerButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'rgba(0, 0, 0, 0.5)',
  },
  input: {
    height: 40,
    borderColor: 'rgba(0, 0, 0, 0.5)',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingLeft: 10,
    color: 'rgba(0, 0, 0, 0.5)',
  },
});

export default SelectTeamScreen;
