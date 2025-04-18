import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';


import MatchSeriesScreen from './screens/MatchSeriesScreen';
import SeriesWiseMatchScreen from './screens/SeriesWiseMatchScreen';
import AfterSelectAddMatchDetailsScreen from './screens/AfterSelectAddMatchDetailsScreen';
import AddPlayersScreen from './screens/AddPlayersScreen';
import MatchTossScreen from './screens/MatchTossScreen';
import ScoringScreen from './screens/ScoringScreen';
import SelectBattersScreen from './screens/SelectBattersScreen';
import SelectBowlersScreen from './screens/SelectBowlersScreen';
import OutScreen from './screens/OutScreen';
import SelectNewBatterScreen from './screens/SelectNewBatterScreen';

import ScoreCardScreen from './screens/ScoreCardScreen';
import EndInningsScreen from './screens/EndInningsScreen';
import MatchSummaryScreen from './screens/MatchSummaryScreen';
import CreateMatchSeriesScreen from './screens/CreateMatchSeriesScreen';
import SelectNewBowlersScreen from './screens/SelectNewBowlerScreen';
import LoginScreen from './screens/LogInScreen';
import SelectTeamScreen from './screens/SelectTeam';
import UserProfileScreen from './screens/UserProfileScreen';
import ProfileUpdateScreen from './screens/ProfileUpdateScreen';

const Stack = createStackNavigator();

export const BASE_URL = 'http://192.168.1.2:5000';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false); 

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="MatchSeriesScreen" component={MatchSeriesScreen} />
            <Stack.Screen name="LogInScreen" component={LoginScreen} />
            <Stack.Screen name="SeriesWiseMatchScreen" component={SeriesWiseMatchScreen} />
            <Stack.Screen name="SelectTeamScreen" component={SelectTeamScreen} />
            <Stack.Screen name="AfterSelectAddMatchDetailsScreen" component={AfterSelectAddMatchDetailsScreen} />
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
            <Stack.Screen name="CreateMatchSeriesScreen" component={CreateMatchSeriesScreen} />
            <Stack.Screen name="UserProfileScreen" component={UserProfileScreen} />
            <Stack.Screen name="ProfileUpdateScreen" component={ProfileUpdateScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
