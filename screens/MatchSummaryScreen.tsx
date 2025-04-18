import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import axios from 'axios';
import { BASE_URL } from '../App';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';

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

type PartnershipA = {
    BatsmanAName: string;
    BatsmanBName: string;
    PartnershipRuns: number;
    PartnershipBalls: number;
    WicketNumber: number;
};

type PartnershipB = {
    BatsmanAName: string;
    BatsmanBName: string;
    PartnershipRuns: number;
    PartnershipBalls: number;
    WicketNumber: number;
};


type MatchSummaryScreenRouteProp = RouteProp<RootStackParamList, 'MatchSummaryScreen'>;

const MatchSummaryScreen = () => {
    const route = useRoute<MatchSummaryScreenRouteProp>();
    const { matchId } = route.params;

    const [teamABatsmanDetails, setTeamABatsmanDetails] = useState<BattingDetail[]>([]);
    const [teamABowlerDetails, setTeamABowlerDetails] = useState<BowlingDetail[]>([]);
    const [teamASummaryDetails, setTeamASummaryDetails] = useState<any>({});
    const [teamBBatsmanDetails, setTeamBBatsmanDetails] = useState<SecondBattingDetail[]>([]);
    const [teamBBowlerDetails, setTeamBBowlerDetails] = useState<SecondBowlingDetail[]>([]);
    const [teamBSummaryDetails, setTeamBSummaryDetails] = useState<any>({});
    const [TeamDataAvailability, setTeamDataAvailability] = useState<any>({});
    const [loading, setLoading] = useState<boolean>(true);
    const [partnershipsA, setPartnershipsA] = useState<PartnershipA[]>([]);
    const [partnershipsB, setPartnershipsB] = useState<PartnershipB[]>([]);


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
                    setPartnershipsA(data.TeamAPartnershipDetails)
                    setPartnershipsB(data.TeamBPartnershipDetails)
                    console.log('Team B Summary:', data.TeamBSummaryDetails[0]);

                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [matchId]);


    if (loading) {
        return <Text>Loading...</Text>;
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Match Summary</Text>
            <Text style={styles.toss}>{teamASummaryDetails.Toss}</Text>
            <Text style={styles.result}>Result : Royal College Won By 10 Wickets</Text>

            <Text style={styles.teamName}>{teamABatsmanDetails[0]?.TeamAName}</Text>
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
                {teamABatsmanDetails.map((item, index) => (
                    <View key={item.BatsmanName} style={[styles.row, index % 2 === 0 ? styles.rowEven : styles.rowOdd]}>
                        <Text style={[styles.cell, styles.batsmanName]}>{item.BatsmanName}</Text>
                        <Text style={styles.cell}>{item.DismissalType}</Text>
                        <Text style={styles.cell}>{item.Runs}</Text>
                        <Text style={styles.cell}>{item.Balls}</Text>
                        <Text style={styles.cell}>{item.Fours}</Text>
                        <Text style={styles.cell}>{item.Sixes}</Text>
                        <Text style={styles.cell}>{item.StrikeRate}</Text>
                    </View>
                ))}
            </View>

            <Text style={styles.teamName}>{teamABowlerDetails[0]?.TeamBName}</Text>
            <View style={styles.tableContainer}>
                <View style={styles.tableHeader}>
                    <Text style={styles.tableHeaderCell}>Bowler</Text>
                    <Text style={styles.tableHeaderCell}>O</Text>
                    <Text style={styles.tableHeaderCell}>M</Text>
                    <Text style={styles.tableHeaderCell}>R</Text>
                    <Text style={styles.tableHeaderCell}>W</Text>
                    <Text style={styles.tableHeaderCell}>Ave</Text>
                </View>
                {teamABowlerDetails.map((item, index) => (
                    <View key={item.BowlerName} style={[styles.row, index % 2 === 0 ? styles.rowEven : styles.rowOdd]}>
                        <Text style={styles.cell}>{item.BowlerName}</Text>
                        <Text style={styles.cell}>{item.Overs}</Text>
                        <Text style={styles.cell}>{item.Maidens}</Text>
                        <Text style={styles.cell}>{item.Runs}</Text>
                        <Text style={styles.cell}>{item.Wickets}</Text>
                        <Text style={styles.cell}>{item.Average}</Text>
                    </View>
                ))}
            </View>

            <View style={styles.matchStatsContainer}>
                <View style={styles.matchStatsRow}>
                    <Text style={styles.matchStatsText}>
                        Total - {teamASummaryDetails.Runs}/{teamASummaryDetails.Wickets}
                    </Text>
                    <Text style={styles.matchStatsText}>Overs ({teamASummaryDetails.Overs})</Text>
                </View>
                <View style={styles.extrasRow}>
                    <Text style={styles.matchStatsText}>WD: {teamASummaryDetails.Wides}</Text>
                    <Text style={styles.matchStatsText}>NB: {teamASummaryDetails.NoBalls}</Text>
                    <Text style={styles.matchStatsText}>B: {teamASummaryDetails.Byes}</Text>
                    <Text style={styles.matchStatsText}>LB: {teamASummaryDetails.LegByes}</Text>
                    <Text style={styles.matchStatsText}>PEN: {teamASummaryDetails.Penalities}</Text>
                </View>
                <Text style={styles.matchStatsText}>Total Extras: {teamASummaryDetails.TotalExtras}</Text>
            </View>

            <Text style={styles.partnershipsHeader}>Partnerships</Text>

                    {partnershipsA.map((p, index) => (
                        <View key={index} style={styles.partnershipRowStyled}>
                            <Text style={styles.wicketNumber}>#{p.WicketNumber}</Text>

                            <Text style={styles.batsmanNameLeft}>{p.BatsmanAName}</Text>

                            <View style={styles.centerCircleContainer}>
                                <View style={styles.runCircle}>
                                    <Text style={styles.runText}>{p.PartnershipRuns}</Text>
                                </View>
                                <Text style={styles.ballText}>{p.PartnershipBalls} balls</Text>
                            </View>

                            <Text style={styles.batsmanNameRight}>{p.BatsmanBName}</Text>
                        </View>
                    ))}

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
                {teamBBatsmanDetails.map((item, index) => (
                    <View key={item.BatsmanName} style={[styles.row, index % 2 === 0 ? styles.rowEven : styles.rowOdd]}>
                        <Text style={[styles.cell, styles.batsmanName]}>{item.BatsmanName}</Text>
                        <Text style={styles.cell}>{item.DismissalType}</Text>
                        <Text style={styles.cell}>{item.Runs}</Text>
                        <Text style={styles.cell}>{item.Balls}</Text>
                        <Text style={styles.cell}>{item.Fours}</Text>
                        <Text style={styles.cell}>{item.Sixes}</Text>
                        <Text style={styles.cell}>{item.StrikeRate}</Text>
                    </View>
                ))}
            </View>

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
                {teamBBowlerDetails.map((item, index) => (
                    <View key={item.BowlerName} style={[styles.row, index % 2 === 0 ? styles.rowEven : styles.rowOdd]}>
                        <Text style={styles.cell}>{item.BowlerName}</Text>
                        <Text style={styles.cell}>{item.Overs}</Text>
                        <Text style={styles.cell}>{item.Maidens}</Text>
                        <Text style={styles.cell}>{item.Runs}</Text>
                        <Text style={styles.cell}>{item.Wickets}</Text>
                        <Text style={styles.cell}>{item.Average}</Text>
                    </View>
                ))}
            </View>

            {teamBSummaryDetails?.Runs !== undefined && (
                <>
                    <View style={styles.matchStatsContainer}>
                        <View style={styles.matchStatsRow}>
                            <Text style={styles.matchStatsText}>
                                Total - {teamBSummaryDetails.Runs}/{teamBSummaryDetails.Wickets}
                            </Text>
                            <Text style={styles.matchStatsText}>Overs ({teamBSummaryDetails.Overs})</Text>
                        </View>
                        <View style={styles.extrasRow}>
                            <Text style={styles.matchStatsText}>WD: {teamBSummaryDetails.Wides}</Text>
                            <Text style={styles.matchStatsText}>NB: {teamBSummaryDetails.NoBalls}</Text>
                            <Text style={styles.matchStatsText}>B: {teamBSummaryDetails.Byes}</Text>
                            <Text style={styles.matchStatsText}>LB: {teamBSummaryDetails.LegByes}</Text>
                            <Text style={styles.matchStatsText}>PEN: {teamBSummaryDetails.Penalities}</Text>
                        </View>
                        <Text style={styles.matchStatsText}>Total Extras: {teamBSummaryDetails.TotalExtras}</Text>
                    </View>

                    <View style={{ height: 30 }} />

                    <Text style={styles.partnershipsHeader}>Partnerships</Text>

                    {partnershipsB.map((p, index) => (
                        <View key={index} style={styles.partnershipRowStyled}>
                            <Text style={styles.wicketNumber}>#{p.WicketNumber}</Text>

                            <Text style={styles.batsmanNameLeft}>{p.BatsmanAName}</Text>

                            <View style={styles.centerCircleContainer}>
                                <View style={styles.runCircle}>
                                    <Text style={styles.runText}>{p.PartnershipRuns}</Text>
                                </View>
                                <Text style={styles.ballText}>{p.PartnershipBalls} balls</Text>
                            </View>

                            <Text style={styles.batsmanNameRight}>{p.BatsmanBName}</Text>
                        </View>
                    ))}

                    <View style={{ height: 100 }} />

                </>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 50,
        paddingHorizontal: 15,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    result:{
        fontSize: 13,
        marginTop: 5,
        textAlign: 'center',
        fontWeight: 'bold',
        color: 'green',
    },
    toss: {
        fontSize: 13,
        marginTop: 5,
        textAlign: 'center',
        fontWeight: 'bold',
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
        minWidth: 60,
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
        minWidth: 60,
    },
    batsmanName: {
        textAlign: 'left',
    },
    matchStatsContainer: {
        paddingHorizontal: 10,
        marginTop: 20,
    },
    matchStatsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
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
    partnershipsContainer: {
        marginTop: 20,
        padding: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#f1f1f1',
        borderRadius: 8,
    },
    partnershipsTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    partnershipRow: {
        marginBottom: 10,
        padding: 8,
        backgroundColor: '#fff',
        borderRadius: 6,
        shadowColor: '#ccc',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    partnershipText: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#333',
    },
    partnershipDetail: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    partnershipRowStyled: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 15,
        paddingHorizontal: 10,
        marginBottom: 10,
        backgroundColor: '#fff',
        borderRadius: 8,
        shadowColor: '#ccc',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
    },

    wicketNumber: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#444',
        width: 25,
    },

    batsmanNameLeft: {
        flex: 1,
        textAlign: 'right',
        marginRight: 10,
        fontSize: 13,
        color: '#222',
    },

    batsmanNameRight: {
        flex: 1,
        textAlign: 'left',
        marginLeft: 10,
        fontSize: 13,
        color: '#222',
    },

    centerCircleContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },

    runCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'gray',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 5,
    },

    runText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },

    ballText: {
        fontSize: 12,
        color: '#555',
    },
    partnershipsHeader: {
        fontSize: 20,
        fontWeight: 'bold',
        marginVertical: 16,
        textAlign: 'center',
        color: '#333',
    },
    
});

export default MatchSummaryScreen;
