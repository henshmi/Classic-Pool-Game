"use strict";

function WamPoolGameWorld() {

    this.whiteBallStartingPosition = new Vector2(413,413);

    this.redBalls = [
    new Ball(new Vector2(1056,433),Color.red),//3
    new Ball(new Vector2(1090,374),Color.red),//4
    new Ball(new Vector2(1126,393),Color.red),//8
    new Ball(new Vector2(1126,472),Color.red),//10;
    new Ball(new Vector2(1162,335),Color.red),//11
    new Ball(new Vector2(1162,374),Color.red),//12
    new Ball(new Vector2(1162,452),Color.red)//14
    ]

    this.yellowBalls = [
    new Ball(new Vector2(1022,413),Color.yellow),//1
    new Ball(new Vector2(1056,393),Color.yellow),//2
    new Ball(new Vector2(1090,452),Color.yellow),//6
    new Ball(new Vector2(1126,354),Color.yellow),//7
    new Ball(new Vector2(1126,433),Color.yellow),//9
    new Ball(new Vector2(1162,413),Color.yellow),//13
    new Ball(new Vector2(1162,491),Color.yellow)//15
    ];

    this.ball = new Ball(new Vector2(413,413),Color.white);
    this.blackBall = new Ball(new Vector2(1090,413),Color.black);

    this.balls = [
    this.yellowBalls[0],
    this.yellowBalls[1],
    this.redBalls[0],
    this.redBalls[1],
    this.blackBall,
    this.yellowBalls[2],
    this.yellowBalls[3],
    this.redBalls[2],
    this.yellowBalls[4],
    this.redBalls[3],
    this.redBalls[4],
    this.redBalls[5],
    this.yellowBalls[5],
    this.redBalls[6],
    this.yellowBalls[6],
    this.ball]

    this.stick = new Stick({ x : 413, y : 413 });

    this.gameOver = false;
}

WamPoolGameWorld.prototype.getBallsSetByColor = function(color){

    if(color === Color.red){
        return this.redBalls;
    }
    if(color === Color.yellow){
        return this.yellowBalls;
    }
    if(color === Color.white){
        return this.ball;
    }
    if(color === Color.black){
        return this.blackBall;
    }
}

WamPoolGameWorld.prototype.handleInput = function (delta) {
    this.stick.handleInput(delta);
};

WamPoolGameWorld.prototype.update = function (delta) {
    this.stick.update(delta);

    for (var i = 0 ; i < this.balls.length; i++){
        for(var j = i + 1 ; j < this.balls.length ; j++){
            this.handleCollision(this.balls[i], this.balls[j], delta);
        }
    }

    for (var i = 0 ; i < this.balls.length; i++) {
        this.balls[i].update(delta);
    }

    var ballsMoving = false;

    for (var i = 0 ; i < this.balls.length; i++) {
        if(this.balls[i].moving){
            ballsMoving = true;
        }
    }

    if(!ballsMoving){
        Game.policy.updateTurnOutcome();
        if(Game.policy.foul){
            this.stick.visible = false;
            if(!Mouse.left.down){
                this.ball.position = Mouse.position;
            }
            else{
                let ballsOverlap = false;
                for (var i = 0 ; i < this.balls.length; i++) {
                    if(this.ball !== this.balls[i]){
                        if(this.ball.position.distanceFrom(this.balls[i].position)<38){
                            ballsOverlap = true;
                        }
                    }
                }
                if(!Game.policy.isOutsideBorder(Mouse.position,Vector2.zero) &&
                   !Game.policy.isInsideHole(Mouse.position) &&
                   !ballsOverlap){
                    this.ball.position = Mouse.position;
                    this.ball.inHole = false;
                    Game.policy.foul = false;
                    this.stick.position = this.ball.position;
                    this.stick.visible = true;
                }
            }
        }
    }

};

WamPoolGameWorld.prototype.handleCollision = function(ball1, ball2, delta){

    if(ball1.inHole || ball2.inHole)
        return;

    if(!ball1.moving && !ball2.moving)
        return;

    var ball1NewPos = ball1.position.add(ball1.velocity.multiply(delta));
    var ball2NewPos = ball2.position.add(ball2.velocity.multiply(delta));

    var dist = ball1NewPos.distanceFrom(ball2NewPos);

    if(dist<38){
        Game.policy.checkColisionValidity(ball1, ball2);

        var power = (Math.abs(ball1.velocity.x) + Math.abs(ball1.velocity.y)) + 
                    (Math.abs(ball2.velocity.x) + Math.abs(ball2.velocity.y));
        power = power * 0.00482;

        var ballsCollide = sounds.ballsCollide.cloneNode(true);
        ballsCollide.volume = (power/(20))<1?(power/(20)):1;
        ballsCollide.play();

        var opposite = ball1.position.y - ball2.position.y;
        var adjacent = ball1.position.x - ball2.position.x;
        var rotation = Math.atan2(opposite, adjacent);

        ball1.moving = true;
        ball2.moving = true;

        var velocity2 = new Vector2(90*Math.cos(rotation + Math.PI)*power,90*Math.sin(rotation + Math.PI)*power);
        ball2.velocity = ball2.velocity.addTo(velocity2);

        ball2.velocity.multiplyWith(0.97);

        var velocity1 = new Vector2(90*Math.cos(rotation)*power,90*Math.sin(rotation)*power);
        ball1.velocity = ball1.velocity.addTo(velocity1);

        ball1.velocity.multiplyWith(0.97);
    }

}

WamPoolGameWorld.prototype.draw = function () {
    Canvas2D.drawImage(sprites.background);
    Game.policy.drawScores();

    for (var i = 0; i < this.balls.length; i++) {
        this.balls[i].draw();
    }

    this.stick.draw();
};

WamPoolGameWorld.prototype.reset = function () {
    this.gameOver = false;

    this.ball.reset();
    this.stick.reset();

    for (var i = 0; i < this.balls.length; i++) {
        this.balls[i].reset();
    }
};

