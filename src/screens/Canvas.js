import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Pressable, Dimensions } from 'react-native';
import Canvas from 'react-native-canvas';
import React, {Component, useState, useRef, useEffect} from 'react';
import Balls from '../Balls';
import io from "socket.io-client";
import { render } from "react-dom";

export default class Cvs extends Component {

  constructor(props) {
    super(props);
    this.state = {reset: false};
    this.tapIn = [0, 0, 0],
    this.tapOut = [0, 0, 0],
    this.canvasRef = React.createRef();
    this.canvas
    this.balls = new Balls();
    this.onPressIn = this.onPressIn.bind(this);
    this.onPressOut = this.onPressOut.bind(this);
    this.drawBalls = this.drawBalls.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.previousFrame = (new Date()).getTime();

      // server refs
    this.socketRef;
    this.sendChannel; // Data channel
    console.log(props.route.params.roomID)
    this.roomID = props.route.params.roomID;
    this.userID;
    this.userLoc; // the user's location in server's room user array (left, middle, or right (-1, 0, 1))
  };

  componentDidMount() {
    this.canvas = this.canvasRef.current
    const canvas = this.canvas;
    canvas.width = Dimensions.get('window').width;
    canvas.height = Dimensions.get('window').height;
    this.drawBalls();

    // socket init
    // Step 1: Connect with the Signal server [set your ip address]
    this.socketRef = io.connect("http://192.168.0.147:9000"); // Address of the Signal server

    // Step 2: Join the room. If initiator we will create a new room otherwise we will join a room
    this.socketRef.emit("join room", this.roomID); // Room ID

    this.socketRef.on("array location", loc => {
      this.userLoc = loc;
    })

    // Step 3: Waiting for the other peer to join the room
    this.socketRef.on("other user", userID => {
      console.log('other user joined')
      this.numUsers += 1;
    });

    // get your user id
    this.socketRef.on("userID", user => {
      console.log('set user id', user)
      this.userID = user;
    })

    // Signals that both peers have joined the room
    this.socketRef.on("user joined", userID => {
      this.otherUser = userID;
      this.numUsers += 1;
    });

    this.socketRef.on("receiving message", msg => {
      // handleReceiveMessage(msg)
      console.log("Message received from peer", msg.text, 'from', msg.userID);
    })

    this.socketRef.on("remove ball", ballID => {
      // console.log(`ballID: ${ballID}`);
      // console.log(`this: ${this.balls}`);
      let idx;
      this.balls.getBalls().forEach((ball, i) => {
        if (ball.color == ballID) {
          idx = i;
        }
      });
      // console.log(`pre-splice num balls: ${this.balls.getBalls().length}`);
      this.balls.getBalls().splice(idx, 1);
      // console.log(`post-splice num balls: ${this.balls.getBalls().length}`);
    })

    this.socketRef.on("add ball", msg => {
      // {ballX: 0, ballY: msg.ballY, ballRadius: msg.ballRadius, ballColor: msg.ballColor, ballDx: msg.ballDx, ballDy: msg.ballDy})
      let bx = (msg.ballX > 900000) ? canvas.width - 10 : msg.ballX;
      this.balls.addColorBall(bx, msg.ballY, msg.ballColor, msg.ballDx, msg.ballDy);
      console.log(`added ball to ${this.userID}`);
    })

  };

  // handleReceiveMessage(msg){
  //   // Handle the msg received
  //   console.log("Message received from peer", msg.text, 'from', msg.userID);
  //
  //   // do something w/ message
  // };

  sendMessage(msg){
    // send message to other users
    console.log(this.userID, 'is sending message...');
    this.socketRef.emit("sending message", {text: msg, userID: this.userID});
  }

  handleCanvas(r) {
    this.canvas.current.current = r
    // const ctx = canvas.current.getContext('2d');
    // ctx.fillStyle = 'purple';
    // ctx.fillRect(0, 0, 100, 100);
  };

  drawBalls() {
    const { balls } = this.balls;
    const canvas = this.canvas;
    const context = canvas.getContext("2d", {alpha: false});
    context.width = canvas.width;
    context.height = canvas.height;
    context.font = "20px Arial";
    context.fillText(`room id: ${this.roomID}`, 50, 100);

    const currentFrame = (new Date()).getTime();
    balls.forEach(ball => {
      context.fillStyle = ball.color;
      context.beginPath();
      context.arc(Math.floor(ball.x), Math.floor(ball.y), ball.radius, 0, 2 * Math.PI);
      context.closePath();
      context.fill();
      ball.step(canvas, currentFrame - this.previousFrame, this.userLoc);

      let rightTouch, leftTouch;
      rightTouch = ball.x >= canvas.width - ball.radius;
      leftTouch = ball.x <= ball.radius;
      if (rightTouch && ball.dx > 0) {
        if (ball.toBeRemoved == 0) {
          console.log("GOTTA GO right")
          this.socketRef.emit("touch wall", {wall: "right", ballX: ball.x, ballY: ball.y, ballRadius: ball.radius, ballColor: ball.color, ballDx: ball.dx, ballDy: ball.dy, userID: this.userID, canvWidth: canvas.width});
          if (this.userLoc <= 0) {
            ball.toBeRemoved = 1;
          }
        }
      }
      else if (leftTouch && ball.dx < 0) {
        if (ball.toBeRemoved == 0) {
          console.log("GOTTA GO left")
          this.socketRef.emit("touch wall", {wall: "left", ballX: ball.x, ballY: ball.y, ballRadius: ball.radius, ballColor: ball.color, ballDx: ball.dx, ballDy: ball.dy, userID: this.userID, canvWidth: canvas.width});
          if (this.userLoc >= 0) {
            ball.toBeRemoved = 1;
          }
        }
      }
    });
    this.previousFrame = currentFrame;
    requestAnimationFrame(this.drawBalls);
  };

  onPressIn(evt) {
    if (this.tapIn[2] === 0) {
      this.tapIn = [0, 0, 0];
      this.tapOut = [0, 0, 0];
      // console.log(`clicked in at (${evt.nativeEvent.locationX}, ${evt.nativeEvent.locationY}) at time ${evt.nativeEvent.timestamp}`);
      this.tapIn = [evt.nativeEvent.locationX, evt.nativeEvent.locationY, evt.nativeEvent.timestamp];
    }
    this.setState({reset: !this.state.reset});
  };

  onPressOut(evt) {
    this.sendMessage('hello')
    if (this.tapIn[2] !== 0) {
      // console.log(`clicked out at (${evt.nativeEvent.locationX}, ${evt.nativeEvent.locationY}) at time ${evt.nativeEvent.timestamp}`);
      this.tapOut = [evt.nativeEvent.locationX, evt.nativeEvent.locationY, evt.nativeEvent.timestamp];
      var change = this.tapOut.map((x, i) => x - this.tapIn[i]);
      console.log(`velocity: ${-change[0] / change[2]}, ${change[1] / change[2]}`);
      this.balls.addBall(this.tapIn[0], this.tapIn[1], -change[0] / change[2], -change[1] / change[2]);
      this.tapIn = [0, 0, 0];
    }
    this.setState({reset: !this.state.reset});

  };

  render() {
    return (
      <View style={styles.container}>
        <Pressable onPressIn={this.onPressIn} onPressOut={this.onPressOut} >
          <Canvas ref={this.canvasRef} />
        </Pressable>
      </View>
    )
  }
}


const styles = StyleSheet.create({
  container: {
    flex:1,
    backgroundColor: '#fafafa',
    alignItems: 'center',
    justifyContent: 'center',
    width: null,
    margin: 0,
  },
})
