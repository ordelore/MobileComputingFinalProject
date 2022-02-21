import React, {Component} from 'react';
import {View, Text} from 'react-native'
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Importing our screens
import Home from './src/screens/Home';
import Canvas from './src/screens/Canvas';

const Stack = createStackNavigator();

export default function App(){
    return(
      <NavigationContainer>
        <Stack.Navigator>
            <Stack.Screen name="Home" component={Home}/>
            <Stack.Screen name="Canvas" component={Canvas}/>
        </Stack.Navigator>
    </NavigationContainer>
    );
}

/*
  We are wrapping Home screen and Canvas screen in a single stack, 
  so that we can navigate from Home to Canvas screen.
*/