import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import MatchSeriesScreen from './screens/MatchSeriesScreen';
import SeriesWiseMatchScreen from './screens/SeriesWiseMatchScreen';
import { RootStackParamList } from './types'; // Import stack type
import AddMatchScreen from './screens/AddMatchScreen';
import SelectTeamScreen from './screens/SelectTeam';
import AfterSelectAddMatchDetailsScreen from './screens/AfterSelectAddMatchDetailsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>(); // ✅ Type the navigator

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="MatchSeriesScreen" component={MatchSeriesScreen} />
        <Stack.Screen name="SeriesWiseMatchScreen" component={SeriesWiseMatchScreen} />
        <Stack.Screen name="AddMatchScreen" component={AddMatchScreen} />
        <Stack.Screen name="SelectTeamScreen" component={SelectTeamScreen} />
        <Stack.Screen name="AfterSelectAddMatchDetailsScreen" component={AfterSelectAddMatchDetailsScreen}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
