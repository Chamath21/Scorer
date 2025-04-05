import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import MatchSeriesScreen from './screens/MatchSeriesScreen';
import SeriesWiseMatchScreen from './screens/SeriesWiseMatchScreen';
import { RootStackParamList } from './types';
import SelectTeamScreen from './screens/SelectTeam';
import AfterSelectAddMatchDetailsScreen from './screens/AfterSelectAddMatchDetailsScreen';
import AddPlayersScreen from './screens/AddPlayersScreen';
import MatchTossScreen from './screens/MatchTossScreen';
import ScoringScreen from './screens/ScoringScreen';
import SelectBattersScreen from './screens/SelectBattersScreen';
import SelectBowlersScreen from './screens/SelectBowlersScreen';
import OutScreen from './screens/OutScreen';
import SelectNewBatterScreen from './screens/SelectNewBatterScreen';
import SelectNewBowlersScreen from './screens/SelectNewBowlerScreen';
import ScoreCardScreen from './screens/ScoreCardScreen';
import EndInningsScreen from './screens/EndInningsScreen';
import MatchSummaryScreen from './screens/MatchSummaryScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const BASE_URL = 'http://192.168.1.2:5000';  


const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="MatchSeriesScreen" component={MatchSeriesScreen} />
        <Stack.Screen name="SeriesWiseMatchScreen" component={SeriesWiseMatchScreen} />
        <Stack.Screen name="SelectTeamScreen" component={SelectTeamScreen} />
        <Stack.Screen name="AfterSelectAddMatchDetailsScreen" component={AfterSelectAddMatchDetailsScreen}/>
        <Stack.Screen name="AddPlayersScreen" component={AddPlayersScreen} />
        <Stack.Screen name="MatchTossScreen" component={MatchTossScreen} />
        <Stack.Screen name="ScoringScreen" component={ScoringScreen} />
        <Stack.Screen name="SelectBattersScreen" component={SelectBattersScreen} />
        <Stack.Screen name="SelectBowlersScreen" component={SelectBowlersScreen} />
        <Stack.Screen name="OutScreen" component={OutScreen} />
        <Stack.Screen name="SelectNewBatterScreen" component={SelectNewBatterScreen} />
        <Stack.Screen name="SelectNewBowlersScreen" component={SelectNewBowlersScreen} />
        <Stack.Screen name="ScoreCardScreen" component={ScoreCardScreen} />
        <Stack.Screen name="EndInningsScreen" component={EndInningsScreen} />
        <Stack.Screen name="MatchSummaryScreen" component={MatchSummaryScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
