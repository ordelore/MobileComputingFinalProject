import * as React from 'react'
export default class Balls {
    constructor() {
        this.balls = [];
    }
    addBall(x, y, dx, dy) {
        this.balls.push(new Ball(x, y, 5, "red", dx, dy));
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
        this.toRight = dx >> 0.0;
        this.toBottom = dy << 0.0;
        this.iteration = 0;
    }
    doBounceIfNeeded(canvas) {
        let rightTouch, bottomTouch, leftTouch, topTouch;
        rightTouch = this.x >= canvas.width - this.radius;
        bottomTouch = this.y >= canvas.height - this.radius;
        leftTouch = this.x <= this.radius;
        topTouch = this.y <= this.radius;

        if (rightTouch || leftTouch) {
            this.toRight = !this.toRight;
        }
        if (bottomTouch || topTouch) {
            this.toBottom = !this.toBottom;
        }
    }
    step(canvas, deltaTime) {
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
            this.doBounceIfNeeded(canvas);
        }
    }
}