import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Define all your routes here
export type RootStackParamList = {
  MatchSeriesScreen: undefined;
  SeriesWiseMatchScreen: { seriesId: string };
  SelectTeamScreen: { seriesId: string | null; team: string };
  AfterSelectAddMatchDetailsScreen: { seriesId: string | null; teamId: string | null };
  AddPlayersScreen: { teamId: string };
  MatchTossScreen: { matchId: number };
  ScoringScreen: { matchId: number };
  SelectBattersScreen: { BattingTeamId: string; matchId: number };
  SelectBowlersScreen: { matchId: string; selectedBatterIds: number[] };
  OutScreen: { matchId: number; battingTeamId: number; striker:  number; nonStriker: number };
  SelectNewBatterScreen: { matchId: number; battingTeamId: number; };
  SelectNewBowlersScreen: { matchId: number;};
  ScoreCardScreen: { matchId: number;};
  EndInningsScreen: { matchId: number;};
  MatchSummaryScreen: { matchId: number;};
  CreateMatchSeriesScreen: undefined;
  UserProfileScreen: {userId: number;};
  ProfileUpdateScreen:undefined;
};

// Type for navigation in each screen
export type MatchSeriesScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'MatchSeriesScreen'
>;

export type SeriesWiseMatchScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'SeriesWiseMatchScreen'
>;

export type SelectTeamScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'SelectTeamScreen'
>;

export type AfterSelectAddMatchDetailsNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'AfterSelectAddMatchDetailsScreen'
>;

export type AddPlayersScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'AddPlayersScreen'
>;

export type MatchTossScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'MatchTossScreen'
>;

export type ScoringScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ScoringScreen'
>;

export type SelectBattersScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'SelectBattersScreen'
>;

export type SelectBowlersScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'SelectBowlersScreen'
>;

export type OutScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'OutScreen'
>; 

export type SelectNewBatterScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'SelectNewBatterScreen'
>;

export type SelectNewBowlersScreenRouteProp = NativeStackNavigationProp<
  RootStackParamList,
  'SelectNewBowlersScreen'
>;

export type ScoreCardScreenRouteProp = NativeStackNavigationProp<
  RootStackParamList,
  'ScoreCardScreen'
>;

export type EndInningsScreenRouteProp = NativeStackNavigationProp<
  RootStackParamList,
  'EndInningsScreen'
>;

export type MatchSummaryScreenRouteProp = NativeStackNavigationProp<
  RootStackParamList,
  'MatchSummaryScreen'
>;

export type CreateMatchSeriesScreen = NativeStackNavigationProp<
  RootStackParamList,
  'CreateMatchSeriesScreen'
>;

export type UserProfileScreenRouteProp = NativeStackNavigationProp<
  RootStackParamList,
  'UserProfileScreen'
>;

export type ProfileUpdateScreenRouteProp = NativeStackNavigationProp<
  RootStackParamList,
  'ProfileUpdateScreen'
>;

export type AddOrSelectTeamScreenNavigationProp =
  | SelectTeamScreenNavigationProp;