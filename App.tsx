import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import MatchSeriesScreen from './screens/MatchSeriesScreen';
import SeriesWiseMatchScreen from './screens/SeriesWiseMatchScreen';
import { RootStackParamList } from './types'; // Import stack type
import SelectTeamScreen from './screens/SelectTeam';
import AfterSelectAddMatchDetailsScreen from './screens/AfterSelectAddMatchDetailsScreen';
import AddPlayersScreen from './screens/AddPlayersScreen';
import MatchTossScreen from './screens/MatchTossScreen';
import ScoringScreen from './screens/ScoringScreen';

const Stack = createNativeStackNavigator<RootStackParamList>(); // ✅ Type the navigator

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
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
