import React, { useState, useRef, useEffect, createRef, Component } from "react";
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Pressable, Dimensions } from 'react-native';
import Canvas from 'react-native-canvas';
import io from "socket.io-client";

const Cvs = ({ route }) => {
  const socketRef = useRef();
  const otherUser = useRef();
  const sendChannel = useRef(); // Data channel
  const { roomID } = route.params;
  const userID = useRef()

  useEffect(() => {
    // Step 1: Connect with the Signal server [set your ip address]
    socketRef.current = io.connect("http://10.0.0.53:9000"); // Address of the Signal server

    // Step 2: Join the room. If initiator we will create a new room otherwise we will join a room
    socketRef.current.emit("join room", roomID); // Room ID

    // Step 3: Waiting for the other peer to join the room
    socketRef.current.on("other user", userID => {
      console.log('other user joined')
      otherUser.current = userID;
    });

    // get your user id 
    socketRef.current.on("userID", user => {
      console.log('set user id', user)
      userID.current = user;
    })

    // Signals that both peers have joined the room
    socketRef.current.on("user joined", userID => {
      otherUser.current = userID;
    });

    socketRef.current.on("receiving message", msg => {
      handleReceiveMessage(msg)
    })

  }, []);


  function handleReceiveMessage(msg){
    // Handle the msg received 
    console.log("[INFO] Message received from peer", e.data);
    
    // do something w/ message
  };

  function sendMessage(msg){
    // send message to other users
    console.log(userID.current, 'is sending message...')
    socketRef.current.emit("sending message", msg);
  }

  function handleCanvas(canvas) {
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'purple';
    ctx.fillRect(0, 0, 100, 100);
  };


  function onPressIn(evt) {console.log(`clicked in at (${evt.nativeEvent.locationX}, ${evt.nativeEvent.locationY}) at time ${evt.nativeEvent.timestamp}`);};
  function onPressOut(evt) {console.log(`clicked out at (${evt.nativeEvent.locationX}, ${evt.nativeEvent.locationY}) at time ${evt.nativeEvent.timestamp}`);};
  
    return (
      <View style={styles.container}>
        <Pressable onPressIn={onPressIn} onPressOut={onPressOut} >
        <StatusBar style="auto" />
        <Canvas ref={handleCanvas}/>
        <Text>Hello</Text>
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

export default Cvs;