import React, { useState, useEffect, createRef, Component } from "react";
import { StyleSheet, Text, View, Pressable, Dimensions } from 'react-native';
import Balls from './Balls';
import Canvas from 'react-native-canvas';

export default class App extends Component {
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
    // this.componentDidUpdate = this.componentDidUpdate.bind(this);
    this.previousFrame = (new Date()).getTime();

  }
  componentDidMount() {
    const canvas = this.canvas.current;
    canvas.width = Dimensions.get('window').width;
    canvas.height = Dimensions.get('window').height;
    this.drawBalls();
  }

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
  }

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
