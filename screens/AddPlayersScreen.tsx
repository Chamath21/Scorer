import moment from 'moment';
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Modal, Button, Alert, Switch, StyleSheet } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker'; // Import the DateTimePickerModal
import { BASE_URL } from '../App';

type Player = {
    PlayerId: string;
    PlayerName: string;
    battingstyle: string;
    bowlingstyle: string;
    iswicketkeeper: boolean;
    birthdate: string; 
    teamId: string;
};

type AddPlayersScreenProps = {
    route: any;
    navigation: any;
};

const AddPlayersScreen: React.FC<AddPlayersScreenProps> = ({ route, navigation }) => {
    const { teamId } = route.params;
    const [players, setPlayers] = useState<Player[]>([]);
    const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [newPlayerName, setNewPlayerName] = useState('');
    const [battingStyle, setBattingStyle] = useState('1'); 
    const [bowlingStyle, setBowlingStyle] = useState('1'); 
    const [isWicketKeeper, setIsWicketKeeper] = useState(false); 
    const [birthdate, setBirthdate] = useState(''); 

    useEffect(() => {
        const fetchPlayers = async () => {
            try {
                const response = await fetch(`${BASE_URL}/get_Players?teamId=${teamId}`);
                const data = await response.json();
                if (response.ok) {
                    setPlayers(data);
                    setFilteredPlayers(data);
                } else {
                    console.error('Error fetching players:', data.error);
                }
            } catch (error) {
                console.error('Error fetching players:', error);
            }
        };
        

        fetchPlayers();
    }, [teamId]);

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        const filtered = players.filter(player =>
            player.PlayerName.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredPlayers(filtered);
    };

    const handleAddPlayer = async () => {
        if (!newPlayerName || !birthdate) {
            Alert.alert('Error', 'Please fill in the player name and birthdate!');
            return;
        }

        const newPlayer: Player = {
            PlayerId: Math.random().toString(36).substr(2, 9),
            PlayerName: newPlayerName,
            battingstyle: battingStyle,
            bowlingstyle: bowlingStyle,
            iswicketkeeper: isWicketKeeper,
            birthdate: birthdate, 
            teamId: teamId, 
        };

        try {
            const response = await fetch(`${BASE_URL}/save_player`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    teamId: teamId,
                    playername: newPlayerName,
                    battingstyle: battingStyle,
                    bowlingstyle: bowlingStyle,
                    birthdate: birthdate,
                    iswicketkeeper: isWicketKeeper,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setPlayers([...players, newPlayer]);
                setFilteredPlayers([...players, newPlayer]);
                setShowModal(false);
                setNewPlayerName('');
                setBattingStyle('1');
                setBowlingStyle('1');
                setIsWicketKeeper(false);
                setBirthdate(''); 
            } else {
                console.error('Error adding player:', data.error);
                Alert.alert('Error', data.error || 'Something went wrong');
            }
        } catch (error) {
            console.error('Error adding player:', error);
            Alert.alert('Error', 'An error occurred while adding the player.');
        }
    };

    const handleConfirmDate = (date: Date) => {
        const selectedDate = moment(date);
        const currentDate = moment();

        if (selectedDate.isAfter(currentDate, 'day')) {
            Alert.alert('Error', 'Birthdate cannot be in the future!');
            return;
        }

        setBirthdate(selectedDate.format('YYYY-MM-DD'));
    };

    const renderPlayer = ({ item }: { item: Player }) => (
        <View style={styles.playerRow}>
            <Text style={styles.playerName}>{item.PlayerName}</Text>
            <TouchableOpacity style={styles.addPlayerButton}>
                <Text style={styles.addPlayerButtonText}>+</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Search Bar */}
            <TextInput
                style={styles.searchBar}
                placeholder="Search players"
                placeholderTextColor="#fff"
                value={searchQuery}
                onChangeText={handleSearch}
            />

            {/* Players List */}
            <FlatList
                data={filteredPlayers}
                renderItem={renderPlayer}
                keyExtractor={item => item.PlayerId}
                contentContainerStyle={styles.list}
                extraData={filteredPlayers} // Ensure re-render when filtered
            />

            {/* Add Player Button */}
            <TouchableOpacity style={styles.addButton} onPress={() => setShowModal(true)}>
                <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>

            {/* Modal for Adding a Player */}
            <Modal
                visible={showModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowModal(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Add New Player</Text>
                        <Text style={styles.modalLabel}>Player Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Player Name"
                            value={newPlayerName}
                            onChangeText={setNewPlayerName}
                        />

                        {/* Batting Style Selection */}
                        <Text style={styles.modalLabel}>Batting Style</Text>
                        <View style={styles.buttonGroup}>
                            <TouchableOpacity
                                style={[styles.styleButton, battingStyle === '1' && styles.selectedButton]}
                                onPress={() => setBattingStyle('1')}
                            >
                                <Text style={styles.styleButtonText}>Right</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.styleButton, battingStyle === '2' && styles.selectedButton]}
                                onPress={() => setBattingStyle('2')}
                            >
                                <Text style={styles.styleButtonText}>Left</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Bowling Style Selection */}
                        <Text style={styles.modalLabel}>Bowling Style</Text>
                        <View style={styles.buttonGroup}>
                            <TouchableOpacity
                                style={[styles.styleButton, bowlingStyle === '1' && styles.selectedButton]}
                                onPress={() => setBowlingStyle('1')}
                            >
                                <Text style={styles.styleButtonText}>Right</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.styleButton, bowlingStyle === '2' && styles.selectedButton]}
                                onPress={() => setBowlingStyle('2')}
                            >
                                <Text style={styles.styleButtonText}>Left</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Wicketkeeper Toggle */}
                        <Text style={styles.modalLabel}>Is Wicketkeeper?</Text>
                        <Switch
                            value={isWicketKeeper}
                            onValueChange={setIsWicketKeeper}
                            thumbColor={isWicketKeeper ? 'grey' : 'grey'} 
                            trackColor={{ false: 'grey', true: 'grey' }} 
                        />
                        <Button title="Save Player" onPress={handleAddPlayer} color="grey" />
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
        borderColor: '#fff',
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 20,
        paddingLeft: 10,
        color: '#fff',
    },
    list: {
        paddingBottom: 20,
    },
    playerRow: {
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
    playerName: {
        fontSize: 18,
        color: '#fff',
    },
    addPlayerButton: {
        backgroundColor: '#28a745',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addPlayerButtonText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    addButton: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: 10,
        borderRadius: 50,
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        bottom: 20,
        right: 20,
    },
    addButtonText: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#fff',
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
        color: '#333',
    },
    input: {
        height: 40,
        borderColor: '#cccccc',
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 10,
        paddingLeft: 10,
        color: '#333',
    },
    modalLabel: {
        fontSize: 16,
        marginBottom: 5,
        color: '#333',
    },
    buttonGroup: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 10,
    },
    styleButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
    },
    selectedButton: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    styleButtonText: {
        fontSize: 16,
        color: '#333',
    },
    datePickerButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        marginTop: 10,
        backgroundColor: '#f7f7f7',
        justifyContent: 'center',
        alignItems: 'center',
    },
    datePickerText: {
        fontSize: 16,
        color: '#333',
    },
});

export default AddPlayersScreen;
