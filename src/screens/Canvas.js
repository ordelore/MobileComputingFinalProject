import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Pressable, Dimensions } from 'react-native';
import Canvas from 'react-native-canvas';
import React, {Component, useState, useRef, useEffect} from 'react';
import Balls from './Balls';
import io from "socket.io-client";
import { render } from "react-dom";

//const Cvs = ({ route }) => {
export default class Cvs extends Component {
  // // server refs
  // const socketRef = useRef();
  // const otherUser = useRef();
  // const sendChannel = useRef(); // Data channel
  // const { roomID } = route.params;
  // const userID = useRef()
  // const canvas = useRef(null);
  // let numUsers = 1

  // canvas refs
  // state = {reset: false};
  // let tapIn = [0, 0, 0];
  // let tapOut = [0, 0, 0];
  // let balls = new Balls();
  // let onPressIn = this.onPressIn.bind(this);
  // let onPressOut = this.onPressOut.bind(this);
  // let drawBalls = this.drawBalls.bind(this);
  // //let componentDidMount = componentDidMount.bind(this);
  // let previousFrame = (new Date()).getTime();

  // useEffect(() => {
  //   // socket init
  //   // Step 1: Connect with the Signal server [set your ip address]
  //   socketRef.current = io.connect("http://10.0.0.53:9000"); // Address of the Signal server

  //   // Step 2: Join the room. If initiator we will create a new room otherwise we will join a room
  //   socketRef.current.emit("join room", roomID); // Room ID

  //   // Step 3: Waiting for the other peer to join the room
  //   socketRef.current.on("other user", userID => {
  //     console.log('other user joined')
  //     otherUser.current = userID;
  //     numUsers += 1;
  //   });

  //   // get your user id 
  //   socketRef.current.on("userID", user => {
  //     console.log('set user id', user)
  //     userID.current = user;
  //   })

  //   // Signals that both peers have joined the room
  //   socketRef.current.on("user joined", userID => {
  //     otherUser.current = userID;
  //     numUsers += 1;
  //   });

  //   socketRef.current.on("receiving message", msg => {
  //     handleReceiveMessage(msg)
  //   })

  //   // canvas init
  //   const canvas = this.canvas.current;
  //   canvas.width = Dimensions.get('window').width;
  //   canvas.height = Dimensions.get('window').height;
  //   this.drawBalls();

  // }, []);

  constructor(props) {
    super(props);
    this.state = {reset: false};
    this.tapIn = [0, 0, 0],
      this.tapOut = [0, 0, 0],
      this.canvas = React.createRef(),
      this.balls = new Balls();
    this.onPressIn = this.onPressIn.bind(this);
    this.onPressOut = this.onPressOut.bind(this);
    this.drawBalls = this.drawBalls.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.previousFrame = (new Date()).getTime();

      // server refs
    this.socketRef;
    this.sendChannel; // Data channel
    this.roomID = route.params;
    this.userID;
  };

  componentDidMount() {
    const canvas = this.canvas.current;
    canvas.width = Dimensions.get('window').width;
    canvas.height = Dimensions.get('window').height;
    this.drawBalls();

    // socket init
    // Step 1: Connect with the Signal server [set your ip address]
    this.socketRef = io.connect("http://10.0.0.53:9000"); // Address of the Signal server

    // Step 2: Join the room. If initiator we will create a new room otherwise we will join a room
    this.socketRef.emit("join room", roomID); // Room ID

    // Step 3: Waiting for the other peer to join the room
    this.socketRef.on("other user", userID => {
      console.log('other user joined')
      otherUser.current = userID;
      numUsers += 1;
    });

    // get your user id 
    this.socketRef.on("userID", user => {
      console.log('set user id', user)
      this.userID = user;
    })

    // Signals that both peers have joined the room
    this.socketRef.on("user joined", userID => {
      this.otherUser = userID;
      numUsers += 1;
    });

    this.socketRef.on("receiving message", msg => {
      handleReceiveMessage(msg)
    })

  };

  handleReceiveMessage(msg){
    // Handle the msg received 
    console.log("Message received from peer", msg.text, 'from', msg.userID);
    
    // do something w/ message
  };

  sendMessage(msg){
    // send message to other users
    console.log(userID.current, 'is sending message...');
    socketRef.current.emit("sending message", {text: msg, userID: userID.current});
  }

  handleCanvas() {
    const ctx = canvas.current.getContext('2d');
    ctx.fillStyle = 'purple';
    ctx.fillRect(0, 0, 100, 100);
  };

  drawBalls() {
    const { balls } = this.balls;
    const canvas = this.canvas.current;
    const context = canvas.getContext("2d", {alpha: false});
    context.width = canvas.width;
    context.height = canvas.height;

    const currentFrame = (new Date()).getTime();
    balls.forEach(ball => {
      context.fillStyle = ball.color;
      context.beginPath();
      context.arc(Math.floor(ball.x), Math.floor(ball.y), ball.radius, 0, 2 * Math.PI);
      context.closePath();
      context.fill();
      ball.step(canvas, currentFrame - this.previousFrame);
    });
    this.previousFrame = currentFrame;
    requestAnimationFrame(this.drawBalls);
  };

  onPressIn(evt) {
    if (this.tapIn[2] === 0) {
      this.tapIn = [0, 0, 0];
      this.tapOut = [0, 0, 0];
      console.log(`clicked in at (${evt.nativeEvent.locationX}, ${evt.nativeEvent.locationY}) at time ${evt.nativeEvent.timestamp}`);
      this.tapIn = [evt.nativeEvent.locationX, evt.nativeEvent.locationY, evt.nativeEvent.timestamp];
    }
    this.setState({reset: !this.state.reset});
  };

  onPressOut(evt) {
    if (this.tapIn[2] !== 0) {
      console.log(`clicked out at (${evt.nativeEvent.locationX}, ${evt.nativeEvent.locationY}) at time ${evt.nativeEvent.timestamp}`);
      this.tapOut = [evt.nativeEvent.locationX, evt.nativeEvent.locationY, evt.nativeEvent.timestamp];
      var change = this.tapOut.map((x, i) => x - this.tapIn[i]);
      console.log(`velocity: ${change[0] / change[2]}, ${change[1] / change[2]}`);
      this.balls.addBall(this.tapIn[0], this.tapIn[1], -change[0] / change[2], -change[1] / change[2]);
      this.tapIn = [0, 0, 0];
    }
    this.setState({reset: !this.state.reset});

  };

  render() {
    return (
      <View style={styles.container}>
        <Pressable onPressIn={this.onPressIn} onPressOut={this.onPressOut} >
          <Canvas ref={this.canvas} />
        </Pressable>
      </View>
    )
  }
}
