import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types'; // Import the param list type
import { BASE_URL } from '../App';

type ScoreCardScreenRouteProp = RouteProp<RootStackParamList, 'ScoreCardScreen'>;

// Define the types for batting and bowling details
type BattingDetail = {
    TeamAName: string;
    BatsmanName: string;
    Runs: number;
    Balls: number;
    Fours: number;
    Sixes: number;
    StrikeRate: number;
    DismissalType: string;
};

type BowlingDetail = {
    TeamBName: string;
    BowlerName: string;
    Overs: number;
    Maidens: number;
    Runs: number;
    Wickets: number;
    Average: number;
};

type SecondBattingDetail = {
    TeamBName: string;
    BatsmanName: string;
    Runs: number;
    Balls: number;
    Fours: number;
    Sixes: number;
    StrikeRate: number;
    DismissalType: string;
};

type SecondBowlingDetail = {
    TeamAName: string;
    BowlerName: string;
    Overs: number;
    Maidens: number;
    Runs: number;
    Wickets: number;
    Average: number;
};


const ScoreCardScreen = () => {
    const route = useRoute<ScoreCardScreenRouteProp>();
    const { matchId } = route.params; // matchId from the route params
    const [teamABatsmanDetails, setTeamABatsmanDetails] = useState<BattingDetail[]>([]);
    const [teamABowlerDetails, setTeamABowlerDetails] = useState<BowlingDetail[]>([]);
    const [teamASummaryDetails, setTeamASummaryDetails] = useState<any>({});
    const [teamBBatsmanDetails, setTeamBBatsmanDetails] = useState<SecondBattingDetail[]>([]);
    const [teamBBowlerDetails, setTeamBBowlerDetails] = useState<SecondBowlingDetail[]>([]);
    const [teamBSummaryDetails, setTeamBSummaryDetails] = useState<any>({});
    const [TeamDataAvailability, setTeamDataAvailability] = useState<any>({});
    const [loading, setLoading] = useState<boolean>(true);

    // Fetch data when the component mounts
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${BASE_URL}/get_scorecarddata?matchId=${matchId}`);
                const data = await response.json();

                if (data.error) {
                    console.error('Error fetching scorecard data:', data.error);
                } else {
                    setTeamDataAvailability(data.TeamDataAvailability[0]);
                    setTeamABatsmanDetails(data.TeamABatsmanDetails);
                    setTeamABowlerDetails(data.TeamABowlerDetails);
                    setTeamASummaryDetails(data.TeamASummaryDetails[0]);
                    setTeamBBatsmanDetails(data.TeamBBatsmanDetails);
                    setTeamBBowlerDetails(data.TeamBBowlerDetails);
                    setTeamBSummaryDetails(data.TeamBSummaryDetails[0]);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [matchId]);

    // Render Batting Details with correct type
    const renderBattingDetails = ({ item, index }: { item: BattingDetail; index: number }) => {
        return (
            <View style={[styles.row, index % 2 === 0 ? styles.rowEven : styles.rowOdd]}>
                {/* Batsman Name */}
                <Text style={[styles.cell, styles.batsmanName]}>{item.BatsmanName}</Text>

                {/* Dismissal Type Column */}
                <Text style={styles.cell}>{item.DismissalType}</Text>

                {/* Batting stats */}
                <Text style={styles.cell}>{item.Runs}</Text>
                <Text style={styles.cell}>{item.Balls}</Text>
                <Text style={styles.cell}>{item.Fours}</Text>
                <Text style={styles.cell}>{item.Sixes}</Text>
                <Text style={styles.cell}>{item.StrikeRate}</Text>
            </View>
        );
    };

    // Render Bowling Details with correct type
    const renderBowlingDetails = ({ item, index }: { item: BowlingDetail; index: number }) => {
        const rowStyle = index % 2 === 0 ? styles.rowEven : styles.rowOdd;
        return (
            <View style={[styles.row, rowStyle]}>
                <Text style={styles.cell}>{item.BowlerName}</Text>
                <Text style={styles.cell}>{item.Overs}</Text>
                <Text style={styles.cell}>{item.Maidens}</Text>
                <Text style={styles.cell}>{item.Runs}</Text>
                <Text style={styles.cell}>{item.Wickets}</Text>
                <Text style={styles.cell}>{item.Average}</Text>
            </View>
        );
    };

    if (loading) {
        return <Text>Loading...</Text>;
    }

    const renderSecondBattingDetails = ({ item, index }: { item: SecondBattingDetail; index: number }) => {
        // Check if TeamDataAvailability exists and IsSecondInnings is true
        if (TeamDataAvailability?.IsSecondInnings) {
            return (
                <View style={[styles.row, index % 2 === 0 ? styles.rowEven : styles.rowOdd]}>
                    {/* Batsman Name */}
                    <Text style={[styles.cell, styles.batsmanName]}>{item.BatsmanName}</Text>
    
                    {/* Dismissal Type Column */}
                    <Text style={styles.cell}>{item.DismissalType}</Text>
    
                    {/* Batting stats */}
                    <Text style={styles.cell}>{item.Runs}</Text>
                    <Text style={styles.cell}>{item.Balls}</Text>
                    <Text style={styles.cell}>{item.Fours}</Text>
                    <Text style={styles.cell}>{item.Sixes}</Text>
                    <Text style={styles.cell}>{item.StrikeRate}</Text>
                </View>
            );
        }
    
        return null; // Return null if IsSecondInnings is not available or false
    };
    
    // Render Bowling Details with correct type
    const renderSecondBowlingDetails = ({ item, index }: { item: SecondBowlingDetail; index: number }) => {
        // Check if TeamDataAvailability exists and IsSecondInnings is true
        if (TeamDataAvailability?.IsSecondInnings) {
            const rowStyle = index % 2 === 0 ? styles.rowEven : styles.rowOdd;
            return (
                <View style={[styles.row, rowStyle]}>
                    <Text style={styles.cell}>{item.BowlerName}</Text>
                    <Text style={styles.cell}>{item.Overs}</Text>
                    <Text style={styles.cell}>{item.Maidens}</Text>
                    <Text style={styles.cell}>{item.Runs}</Text>
                    <Text style={styles.cell}>{item.Wickets}</Text>
                    <Text style={styles.cell}>{item.Average}</Text>
                </View>
            );
        }
    
        return null; // Return null if IsSecondInnings is not available or false
    };
    
    if (loading) {
        return <Text>Loading...</Text>;
    }
    

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Match Centre</Text>
            <Text style={styles.toss}>{teamASummaryDetails.Toss}</Text>

            {/* Conditionally Render Team A Batting Details */}
            <Text style={styles.teamName}>{teamABatsmanDetails[0].TeamAName}</Text>
            <View style={styles.tableContainer}>
                <View style={styles.tableHeader}>
                    <Text style={styles.tableHeaderCell}>Batsman</Text>
                    <Text style={styles.tableHeaderCell}>H/O</Text>
                    <Text style={styles.tableHeaderCell}>R</Text>
                    <Text style={styles.tableHeaderCell}>B</Text>
                    <Text style={styles.tableHeaderCell}>4s</Text>
                    <Text style={styles.tableHeaderCell}>6s</Text>
                    <Text style={styles.tableHeaderCell}>SR</Text>
                </View>
                <FlatList
                    data={teamABatsmanDetails}
                    renderItem={renderBattingDetails}
                    keyExtractor={(item) => item.BatsmanName}
                />
            </View>

            {/* Team A Bowling Details */}
            <Text style={styles.teamName}>{teamABowlerDetails[0].TeamBName}</Text>
            <View style={styles.tableContainer}>
                <View style={styles.tableHeader}>
                    <Text style={styles.tableHeaderCell}>Bowler</Text>
                    <Text style={styles.tableHeaderCell}>O</Text>
                    <Text style={styles.tableHeaderCell}>M</Text>
                    <Text style={styles.tableHeaderCell}>R</Text>
                    <Text style={styles.tableHeaderCell}>W</Text>
                    <Text style={styles.tableHeaderCell}>Ave</Text>
                </View>
                <FlatList
                    data={teamABowlerDetails}
                    renderItem={renderBowlingDetails}
                    keyExtractor={(item) => item.BowlerName}
                />
            </View>

            {/* Team A Summary Stats */}
            <View style={styles.matchStatsContainer}>
                <View style={styles.matchStatsRow}>
                    <Text style={styles.matchStatsText}>
                        Total - {teamASummaryDetails.Runs}/{teamASummaryDetails.Wickets}
                    </Text>
                    <Text style={styles.matchStatsText}>
                        Overs ({teamASummaryDetails.Overs})
                    </Text>
                </View>
                <View style={styles.extrasRow}>
                    <Text style={styles.matchStatsText}>WD: {teamASummaryDetails.Wides}</Text>
                    <Text style={styles.matchStatsText}>NB: {teamASummaryDetails.NoBalls}</Text>
                    <Text style={styles.matchStatsText}>B: {teamASummaryDetails.Byes}</Text>
                    <Text style={styles.matchStatsText}>LB: {teamASummaryDetails.LegByes}</Text>
                    <Text style={styles.matchStatsText}>PEN: {teamASummaryDetails.Penalities}</Text>
                </View>
                <Text style={styles.matchStatsText}>
                    Total Extras: {teamASummaryDetails.TotalExtras}
                </Text>
            </View>

            {TeamDataAvailability?.IsSecondInnings && (
    <>
        {/* Conditionally Render Team B Batting Details */}
        <Text style={styles.teamName}>{teamBBatsmanDetails[0]?.TeamBName}</Text>
        <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
                <Text style={styles.tableHeaderCell}>Batsman</Text>
                <Text style={styles.tableHeaderCell}>H/O</Text>
                <Text style={styles.tableHeaderCell}>R</Text>
                <Text style={styles.tableHeaderCell}>B</Text>
                <Text style={styles.tableHeaderCell}>4s</Text>
                <Text style={styles.tableHeaderCell}>6s</Text>
                <Text style={styles.tableHeaderCell}>SR</Text>
            </View>
            <FlatList
                data={teamBBatsmanDetails}
                renderItem={renderSecondBattingDetails}
                keyExtractor={(item) => item.BatsmanName}
            />
        </View>

        {/* Team A Bowling Details */}
        <Text style={styles.teamName}>{teamBBowlerDetails[0]?.TeamAName}</Text>
        <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
                <Text style={styles.tableHeaderCell}>Bowler</Text>
                <Text style={styles.tableHeaderCell}>O</Text>
                <Text style={styles.tableHeaderCell}>M</Text>
                <Text style={styles.tableHeaderCell}>R</Text>
                <Text style={styles.tableHeaderCell}>W</Text>
                <Text style={styles.tableHeaderCell}>Ave</Text>
            </View>
            <FlatList
                data={teamBBowlerDetails}
                renderItem={renderSecondBowlingDetails}
                keyExtractor={(item) => item.BowlerName}
            />
        </View>

        {/* Team A Summary Stats */}
        <View style={styles.matchStatsContainer}>
            <View style={styles.matchStatsRow}>
                <Text style={styles.matchStatsText}>
                    Total - {teamBSummaryDetails.Runs}/{teamBSummaryDetails.Wickets}
                </Text>
                <Text style={styles.matchStatsText}>
                    Overs ({teamBSummaryDetails.Overs})
                </Text>
            </View>
            <View style={styles.extrasRow}>
                <Text style={styles.matchStatsText}>WD: {teamBSummaryDetails.Wides}</Text>
                <Text style={styles.matchStatsText}>NB: {teamBSummaryDetails.NoBalls}</Text>
                <Text style={styles.matchStatsText}>B: {teamBSummaryDetails.Byes}</Text>
                <Text style={styles.matchStatsText}>LB: {teamBSummaryDetails.LegByes}</Text>
                <Text style={styles.matchStatsText}>PEN: {teamBSummaryDetails.Penalities}</Text>
            </View>
            <Text style={styles.matchStatsText}>
                Total Extras: {teamBSummaryDetails.TotalExtras}
            </Text>
        </View>
    </>
)}

        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 10,
        paddingHorizontal: 15,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    toss: {
        fontSize: 13,
        marginTop: 5,
        textAlign: 'center',
    },
    teamName: {
        fontSize: 15,
        fontWeight: 'bold',
        marginTop: 20,
        textAlign: 'center',
    },
    tableContainer: {
        marginTop: 10,
        borderWidth: 2,
        borderColor: '#ccc',
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        padding: 10,
    },
    tableHeader: {
        flexDirection: 'row',
        marginTop: 0,
        borderBottomWidth: 2,
        borderBottomColor: '#ccc',
        paddingBottom: 10,
        backgroundColor: '#f4f4f4',
    },
    tableHeaderCell: {
        flex: 1,
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
        paddingVertical: 8,
        minWidth: 60, // Ensure cells don't shrink too much
    },
    row: {
        flexDirection: 'row',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    rowEven: {
        backgroundColor: '#f9f9f9',
    },
    rowOdd: {
        backgroundColor: '#fff',
    },
    cell: {
        flex: 1,
        fontSize: 12,
        textAlign: 'center',
        paddingVertical: 8,
        minWidth: 60, // Ensure consistent width across cells
    },
    batsmanName: {
        textAlign: 'left', // Align batsman name to the left
    },
    dismissalType: {
        textAlign: 'center', // Align dismissal type to center
    },
    matchStatsContainer: {
        paddingHorizontal: 10,
        marginTop: 20,
    },
    matchStatsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 0,
    },
    extrasRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 5,
    },
    matchStatsText: {
        fontSize: 12,
        fontWeight: 'bold',
        marginRight: 10,
    },
});

export default ScoreCardScreen;
