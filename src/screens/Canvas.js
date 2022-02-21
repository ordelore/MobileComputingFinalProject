import React, { useState, useEffect, createRef, Component } from "react";
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Pressable, Dimensions } from 'react-native';
import Canvas from 'react-native-canvas';
import React, {useState, useRef, useEffect, useCallback} from 'react';
import io from "socket.io-client";


export default class App extends Component {
  handleCanvas(canvas) {
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'purple';
    ctx.fillRect(0, 0, 100, 100);
  };
  onPressIn(evt) {console.log(`clicked in at (${evt.nativeEvent.locationX}, ${evt.nativeEvent.locationY}) at time ${evt.nativeEvent.timestamp}`);};
  onPressOut(evt) {console.log(`clicked out at (${evt.nativeEvent.locationX}, ${evt.nativeEvent.locationY}) at time ${evt.nativeEvent.timestamp}`);};
  render() {
    return (
      <View style={styles.container}>
        <Pressable onPressIn={this.onPressIn} onPressOut={this.onPressOut} >
        <StatusBar style="auto" />
        <Canvas ref={this.handleCanvas}/>
        </Pressable>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
