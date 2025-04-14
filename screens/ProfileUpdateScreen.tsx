import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

const ProfileUpdateScreen = () => {
  return (
    <View style={styles.container}>
      <Image
        source={{ uri: 'https://cdn-icons-png.flaticon.com/512/753/753345.png' }}
        style={styles.icon}
      />
      <Text style={styles.title}>Oops!</Text>
      <Text style={styles.subtitle}>This feature will be released soon.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  icon: {
    width: 100,
    height: 100,
    marginBottom: 24,
    tintColor: 'rgba(0, 0, 0, 0.7)',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: 'rgba(0, 0, 0, 0.7)',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#ccc',
    textAlign: 'center',
  },
});

export default ProfileUpdateScreen;
