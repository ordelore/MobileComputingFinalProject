import React, { useState } from "react";
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Pressable } from 'react-native';

export default function App () {
  const onPressIn = (evt) => {console.log(`clicked in at (${evt.nativeEvent.locationX}, ${evt.nativeEvent.locationY}) at time ${evt.nativeEvent.timestamp}`);};
  const onPressOut = (evt) => {console.log(`clicked out at (${evt.nativeEvent.locationX}, ${evt.nativeEvent.locationY}) at time ${evt.nativeEvent.timestamp}`);};
  return (
    <View style={styles.container}>
      <Pressable onPressIn={onPressIn} onPressOut={onPressOut} >
      <Text>Open up App.js to start working on your app!</Text>
      <StatusBar style="auto" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
