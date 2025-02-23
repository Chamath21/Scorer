import React from 'react';
import { View, Text } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types'; // Adjust path if needed

type SelectTeamsScreenRouteProp = RouteProp<RootStackParamList, 'SelectTeamsScreen'>;

const SelectTeamsScreen = () => {
  const route = useRoute<SelectTeamsScreenRouteProp>();  // Use the correct type here
  const { matchId } = route.params;  // Now matchId is recognized as part of params

  return (
    <View>
      <Text>Selected Match ID: {matchId}</Text>
    </View>
  );
};

export default SelectTeamsScreen;
