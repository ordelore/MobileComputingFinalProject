import * as React from 'react'
// for a touch to be considered near a given ball, it must be a multiple of the ball's radius away from the ball's center
const BALL_RADIUS = 5;
const CLOSE_DISTANCE = 5 * BALL_RADIUS;
export default class Balls {
    constructor() {
        this.balls = [];
    }
    addBall(x, y, dx, dy) {
        this.balls.push(new Ball(x, y, BALL_RADIUS, `rgb(${Math.random()*255}, ${Math.random()*255}, ${Math.random()*255})`, dx, dy));
    }
    addABall(ball) {
        this.balls.push(ball);
    }
    addColorBall(x, y, color, dx, dy) {
        this.balls.push(new Ball(x, y, BALL_RADIUS, color, dx, dy));
    }
    updateBalls() {
        this.balls.forEach(ball => {
            ball.step();
        });
    }
    getBalls() {
        return this.balls;
    }
}
class Ball {
    constructor(x, y, r, color, dx, dy) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.radius = r;
        this.dx = dx;
        this.dy = dy;
        this.toRight = dx > 0.0;
        this.toBottom = dy > 0.0;
        this.iteration = 0;
        this.toBeRemoved = 0;
        // console.log(`dx: ${this.dx}`)
        // console.log(`dy: ${this.dy}`)
        // console.log(`toRight: ${this.toRight}`)
        // console.log(`toBottom: ${this.toBottom}`)
    }

    step(canvas, deltaTime, numUsers) {
        this.x += this.dx * deltaTime;
        this.y += this.dy * deltaTime;
        const bottomTouch = (this.y >= canvas.height - this.radius) && (this.dy > 0.0);
        const topTouch = (this.y <= this.radius) && (this.dy < 0.0);
        
        if (bottomTouch || (topTouch && (numUsers <= 3))) {
            this.toBottom = !this.toBottom;
            this.dy *= -1.0;
        }
    }

    isNear(x, y) {
        const distance = Math.sqrt((this.x - x) ** 2 + (this.y - y) ** 2);
        return distance <= CLOSE_DISTANCE;
    }
}
