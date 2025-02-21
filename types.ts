import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Define all your routes here
export type RootStackParamList = {
  MatchSeriesScreen: undefined;
  SeriesWiseMatchScreen: { seriesId: string };
  AddMatchScreen: { seriesId: string };
  SelectTeamScreen: { team: string };
  AfterSelectAddMatchDetailsScreen: {teamId: string}
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

export type AddMatchScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'AddMatchScreen'
>;

export type SelectTeamScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'SelectTeamScreen'
>;

export type AfterSelectAddMatchDetailsNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'AfterSelectAddMatchDetailsScreen'
>;

// Define a type for navigation that can be used for both screens (AddMatchScreen and SelectTeamScreen)
export type AddOrSelectTeamScreenNavigationProp =
  | AddMatchScreenNavigationProp
  | SelectTeamScreenNavigationProp;
