import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Define all your routes here
export type RootStackParamList = {
  MatchSeriesScreen: undefined;
  SeriesWiseMatchScreen: { seriesId: string };
  SelectTeamScreen: {seriesId: string | null, team: string };
  AfterSelectAddMatchDetailsScreen: {seriesId: string | null, teamId: string | null};
  AddPlayersScreen:{teamId: string}
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

// Define a type for navigation that can be used for both screens (AddMatchScreen and SelectTeamScreen)
export type AddOrSelectTeamScreenNavigationProp =
  | SelectTeamScreenNavigationProp;
