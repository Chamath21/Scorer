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

const ScoreCardScreen = () => {
  const route = useRoute<ScoreCardScreenRouteProp>();
  const { matchId } = route.params; // matchId from the route params
  const [teamABatsmanDetails, setTeamABatsmanDetails] = useState<BattingDetail[]>([]);
  const [teamABowlerDetails, setTeamABowlerDetails] = useState<BowlingDetail[]>([]);
  const [teamASummaryDetails, setTeamASummaryDetails] = useState<any>({});
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
          setTeamABatsmanDetails(data.TeamABatsmanDetails);
          setTeamABowlerDetails(data.TeamABowlerDetails);
          setTeamASummaryDetails(data.TeamASummaryDetails[0]);
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
    const rowStyle = index % 2 === 0 ? styles.rowEven : styles.rowOdd;
    return (
      <View style={[styles.row, rowStyle]}>
        <Text style={styles.cell}>{item.BatsmanName}</Text>
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

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Score Card</Text>
      <Text style={styles.toss}>{teamASummaryDetails.Toss}</Text>

      {/* Conditionally Render Team A Batting Details */}
      <Text style={styles.teamName}>{teamABatsmanDetails[0].TeamAName}</Text>
      <View style={styles.tableContainer}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, styles.headerText]}>Batsman Name</Text>
          <Text style={[styles.tableHeaderCell, styles.headerText]}>Runs</Text>
          <Text style={[styles.tableHeaderCell, styles.headerText]}>Balls</Text>
          <Text style={[styles.tableHeaderCell, styles.headerText]}>Fours</Text>
          <Text style={[styles.tableHeaderCell, styles.headerText]}>Sixes</Text>
          <Text style={[styles.tableHeaderCell, styles.headerText]}>Strike Rate</Text>
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
          <Text style={[styles.tableHeaderCell, styles.headerText]}>Bowler Name</Text>
          <Text style={[styles.tableHeaderCell, styles.headerText]}>Overs</Text>
          <Text style={[styles.tableHeaderCell, styles.headerText]}>Maidens</Text>
          <Text style={[styles.tableHeaderCell, styles.headerText]}>Runs</Text>
          <Text style={[styles.tableHeaderCell, styles.headerText]}>Wickets</Text>
          <Text style={[styles.tableHeaderCell, styles.headerText]}>Average</Text>
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 20,
    paddingHorizontal: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  matchInfo: {
    fontSize: 18,
    color: 'gray',
    textAlign: 'center',
    marginTop: 10,
  },
  teamName: {
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
  },
  tableContainer: {
    marginTop: 20,
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
  },
  headerText: {
    color: '#333',
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
  toss:{
    fontSize: 13,
    marginTop: 5,
    textAlign: 'center',
  }
});

export default ScoreCardScreen;
