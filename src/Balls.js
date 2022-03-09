import * as React from 'react'
export default class Balls {
    constructor() {
        this.balls = [];
    }
    addBall(x, y, dx, dy) {
        this.balls.push(new Ball(x, y, 5, `rgb(${Math.random()*255}, ${Math.random()*255}, ${Math.random()*255})`, dx, dy));
    }
    addColorBall(x, y, color, dx, dy) {
        this.balls.push(new Ball(x, y, 5, color, dx, dy));
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
        this.toRight = dx < 0.0;
        this.toBottom = dy < 0.0;
        this.iteration = 0;
        this.toBeRemoved = 0;
        console.log(`dx: ${this.dx}`)
        console.log(`dy: ${this.dy}`)
        console.log(`toRight: ${this.toRight}`)
        console.log(`toBottom: ${this.toBottom}`)
    }
    doBounceIfNeeded(canvas, numUsers){
        let rightTouch, bottomTouch, leftTouch, topTouch;
        rightTouch = this.x >= canvas.width - this.radius;
        bottomTouch = this.y >= canvas.height - this.radius;
        leftTouch = this.x <= this.radius;
        topTouch = this.y <= this.radius;

        // if (rightTouch){// && walls > 0) {
        //     this.toRight = !this.toRight;
        // }
        // if (leftTouch){// && walls < 0) {
        //   this.toRight = !this.toRight;
        // }
        if (bottomTouch || (topTouch && (numUsers <= 3))) {
            this.toBottom = !this.toBottom;
        }
    }
    step(canvas, deltaTime, numUsers) {
        const safeDistance = this.radius * 10;
        if (this.toRight && this.toBottom) {
            this.x += this.dx * deltaTime;
            this.y += this.dy * deltaTime;
            this.iteration++;
        } else if (!this.toRight && this.toBottom) {
            this.x -= this.dx * deltaTime;
            this.y += this.dy * deltaTime;
            this.iteration++;

        } else if (!this.toRight && !this.toBottom) {
            this.x -= this.dx * deltaTime;
            this.y -= this.dy * deltaTime;
            this.iteration++;
        } else if (this.toRight && !this.toBottom) {
            this.x += this.dx * deltaTime;
            this.y -= this.dy * deltaTime;
            this.iteration++;
        }
        if (
            this.iteration >= safeDistance / this.dy - this.radius ||
            this.iteration >= safeDistance / this.dx - this.radius
        ) {
            this.doBounceIfNeeded(canvas, numUsers);
        }
    }
}
