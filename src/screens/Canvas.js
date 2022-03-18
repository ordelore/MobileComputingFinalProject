import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, Button, View, Pressable, Dimensions } from 'react-native';
import Canvas from 'react-native-canvas';
import React, {Component, useState, useRef, useEffect} from 'react';
import Balls from '../Balls';
import io from "socket.io-client";
import { render } from "react-dom";
const MAX_VEL = 0.2;

export default class Cvs extends Component {

  constructor(props) {
    super(props);
    this.state = {reset: false};
    this.tapIn = [0, 0, 0],
    this.tapOut = [0, 0, 0],
    this.canvasRef = React.createRef();
    this.canvas = null;
    this.balls = new Balls();
    this.removedBall = null;
    this.onPressIn = this.onPressIn.bind(this);
    this.onPressOut = this.onPressOut.bind(this);
    this.drawBalls = this.drawBalls.bind(this);
    this.clearCanvas = this.clearCanvas.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.previousFrame = (new Date()).getTime();

      // server refs
    this.socketRef;
    this.sendChannel; // Data channel
    this.roomID = props.route.params.roomID;
    this.userID;
    this.numUsers;
  };

  componentDidMount() {
    this.canvas = this.canvasRef.current
    const canvas = this.canvas;
    canvas.width = Dimensions.get('window').width;
    canvas.height = Dimensions.get('window').height;
    this.drawBalls();

    // socket init
    // Step 1: Connect with the Signal server [set your ip address]
    this.socketRef = io.connect("http://10.0.0.53:9000");

    // Step 2: Join the room. If initiator we will create a new room otherwise we will join a room
    this.socketRef.emit("join room", this.roomID); // Room ID


    this.socketRef.on("new user", num => {
      this.numUsers = num;
    })

    // get your user id
    this.socketRef.on("userID", user => {
      this.userID = user;
    })

    // Signals that both peers have joined the room
    this.socketRef.on("user joined", userID => {
      this.otherUser = userID;
      this.numUsers += 1;
    });

    this.socketRef.on("receiving message", msg => {

    })

    this.socketRef.on("remove ball", ballID => {
      let idx;
      this.balls.getBalls().forEach((ball, i) => {
        if (ball.color == ballID) {
          idx = i;
        }
      });
      this.balls.getBalls().splice(idx, 1);
    })

    this.socketRef.on("add ball", msg => {
      let bx = (msg.ballX > 900000) ? canvas.width - 10 : msg.ballX;
      this.balls.addColorBall(bx, msg.ballY, msg.ballColor, msg.ballDx, msg.ballDy);
    })

  };

  sendMessage(msg){
    // send message to other users
    this.socketRef.emit("sending message", {text: msg, userID: this.userID});
  };

  handleCanvas = (canvas) => {
    this.context = canvas.getContext('2d');
    this.canvas = canvas;
  };

  drawBalls() {
    const { balls } = this.balls;
    const canvas = this.canvas;
    const context = canvas.getContext("2d", {alpha: false});
    context.width = canvas.width;
    context.height = canvas.height;
    context.font = "20px Arial";

    if (this.numUsers > 3) {
      let numRects = this.numUsers - 3;
      let rectLen = Math.ceil(canvas.width / numRects)
      for (let i=0; i<numRects; i++) {
        context.fillStyle = (i%2 == 0) ? "black" : "gray";
        context.fillRect(i*rectLen, 20, rectLen, 50);
      }
    }

    const currentFrame = (new Date()).getTime();

    balls.forEach(ball => {
      context.fillStyle = ball.color;
      context.beginPath();
      context.arc(Math.floor(ball.x), Math.floor(ball.y), ball.radius, 0, 2 * Math.PI);
      context.closePath();
      context.fill();
      ball.step(canvas, currentFrame - this.previousFrame, this.numUsers);
      if (ball.toBeRemoved == 0) {
        let rightTouch, leftTouch, topTouch;
        rightTouch = (ball.x/canvas.width >= 0.99);
        leftTouch = (ball.x/canvas.width <= 0.01);
        topTouch = (ball.y/canvas.height <= 0.01) && (this.numUsers > 3);
        if (rightTouch && ball.toRight) {
          this.socketRef.emit("touch wall", {wall: "right", ballX: ball.x, ballY: ball.y, ballRadius: ball.radius, ballColor: ball.color, ballDx: ball.dx, ballDy: ball.dy, userID: this.userID, canvWidth: canvas.width});
          ball.toBeRemoved = 1;

        }
        else if (leftTouch && !ball.toRight) {
          this.socketRef.emit("touch wall", {wall: "left", ballX: ball.x, ballY: ball.y, ballRadius: ball.radius, ballColor: ball.color, ballDx: ball.dx, ballDy: ball.dy, userID: this.userID, canvWidth: canvas.width});
          ball.toBeRemoved = 1;

        } else if (topTouch && !ball.toBottom) {
          this.socketRef.emit("touch wall", {wall: "top", ballX: ball.x, ballY: ball.y, ballRadius: ball.radius, ballColor: ball.color, ballDx: ball.dx, ballDy: ball.dy, userID: this.userID, canvWidth: canvas.width});
          ball.toBeRemoved = 1;
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
      this.tapIn = [evt.nativeEvent.locationX, evt.nativeEvent.locationY, evt.nativeEvent.timestamp];
      // checks for if the tapIn is near any balls on the screen
      this.balls.getBalls().every((ball, idx) => {
        if (ball.isNear(this.tapIn[0], this.tapIn[1]) && !this.toBeRemoved) {
          this.toBeRemoved = this.balls.getBalls().splice(idx, 1)[0];
          return false;
        }
      });
    }
    this.setState({reset: !this.state.reset});
  };

  onPressOut(evt) {
    this.sendMessage('hello')
    if (this.tapIn[2] !== 0) {
      this.tapOut = [evt.nativeEvent.locationX, evt.nativeEvent.locationY, evt.nativeEvent.timestamp];
      const change = this.tapOut.map((x, i) => x - this.tapIn[i]);
      const curVel = Math.sqrt((change[0] / change[2]) ** 2 + (change[1] / change[2]) ** 2);
      var velX = curVel < MAX_VEL ? change[0] / change[2] : change[0] / change[2] * MAX_VEL / curVel;
      var velY = curVel < MAX_VEL ? change[1] / change[2] : change[1] / change[2] * MAX_VEL / curVel;
      if (this.toBeRemoved) {
        this.toBeRemoved.dx = velX;
        this.toBeRemoved.dy = velY;
        this.balls.addABall(this.toBeRemoved);
        this.toBeRemoved = null;
      } else {
        this.balls.addBall(this.tapIn[0], this.tapIn[1], velX, velY);
      }
      this.tapIn = [0, 0, 0];
    }
    this.setState({reset: !this.state.reset});

  };

  clearCanvas(evt) {
    // clear the canvas of lines
    const canvas = this.canvas;
    const context = canvas.getContext("2d", {alpha: false});
    context.width = canvas.width;
    context.height = canvas.height;

    context.clearRect(0, 0, canvas.width, canvas.height);
    this.balls = new Balls();
  };

  render() {
    return (
      <View style={styles.container}>
        <Pressable onPressIn={this.onPressIn} onPressOut={this.onPressOut} >
          <Canvas ref={this.canvasRef}/>
        </Pressable>
        <View  style={styles.text}>
          <Text style={{ alignSelf: 'center', fontSize: 20, margin: 8 }}>Canvas {this.roomID}</Text>
        </View>
          <Pressable  style={styles.button} onPress={this.clearCanvas}>
            <Text style={{color: 'white', alignSelf: 'center', fontSize: 18}} color='white'>Clear Canvas</Text>
          </Pressable>
          {/* <Button onPress = {this.clearCanvas} color = 'green' title ='Clear Canvas' /> */}
      </View>
    )
  }
}


const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex:1,
  },
  button: {
    position: "absolute",
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    bottom:10,
    height: 50,
    width: 120,
    borderColor: 'green',
    borderWidth: 5,
    alignSelf: 'center',
    borderRadius: 10,
    right: 10,
    backgroundColor: 'green',
  },
  text: {
    position: "absolute",
    zIndex: 10000,
    bottom:10,
    left: 10,
    fontSize: 450,
  }
})
