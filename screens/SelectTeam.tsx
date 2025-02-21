import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { AddOrSelectTeamScreenNavigationProp, SelectTeamScreenNavigationProp } from '../types';

// Define a TypeScript type for a team
type Team = {
  TeamId: string;
  TeamName: string;
  TeamLocation: string;
  TeamPictureUrl: string;
};

type SelectTeamScreenProps = {
    navigation: AddOrSelectTeamScreenNavigationProp; // Use the union type here
  };

  const SelectTeamScreen: React.FC<SelectTeamScreenProps> = ({ navigation }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [teams, setTeams] = useState<Team[]>([]); // Assuming Team is defined elsewhere
    const [filteredTeams, setFilteredTeams] = useState<Team[]>([]);

  useEffect(() => {
    const fetchTeamDetails = async () => {
      try {
        const response = await fetch('http://192.168.1.9:5000/get_TeamDetails'); // Replace with your actual API URL
        const data = await response.json();
        if (response.ok) {
          setTeams(data);
          setFilteredTeams(data); // Initially, display all teams
        } else {
          console.error('Error fetching team details:', data.error);
        }
      } catch (error) {
        console.error('Error fetching team details:', error);
      }
    };

    fetchTeamDetails();
  }, []);

  // Handle search input change
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = teams.filter(team =>
      team.TeamName.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredTeams(filtered);
  };

  // Handle team selection and navigate back to AddMatchScreen
  const handleTeamSelect = (team: Team) => {
    // Navigate to the AfterSelectAddMatchDetailsScreen and pass the team ID as a parameter
    navigation.navigate('AfterSelectAddMatchDetailsScreen', { teamId: team.TeamId });
  };
  

  const renderTeam = ({ item }: { item: Team }) => (
    <TouchableOpacity style={styles.teamRow} onPress={() => handleTeamSelect(item)}>
      <Image source={{ uri: item.TeamPictureUrl }} style={styles.teamLogo} />
      <View style={styles.teamInfo}>
        <Text style={styles.teamName}>{item.TeamName}</Text>
        <Text style={styles.teamLocation}>{item.TeamLocation}</Text>
      </View>
    </TouchableOpacity>
  );

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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  searchBar: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
    paddingLeft: 10,
  },
  list: {
    paddingBottom: 20,
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  teamLogo: {
    width: 50,
    height: 50,
    marginRight: 10,
    borderRadius: 25, // Adjust if logos are circular
  },
  teamInfo: {
    flexDirection: 'column',
  },
  teamName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  teamLocation: {
    fontSize: 14,
    color: '#555',
  },
});

export default SelectTeamScreen;
