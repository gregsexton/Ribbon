function Game(canvasWidth, canvasHeight, canvasID){
    this.minx = 0;
    this.maxx = canvasWidth;
    this.miny = 0;
    this.maxy = canvasHeight;

    this.canvasID = canvasID;
    this.ribbon   = new Ribbon(canvasWidth, canvasHeight, canvasID);
    this.terrain  = new Terrain(canvasWidth, canvasHeight, canvasID);

    this.playing  = false;

    this.increaseSpeed = 1;

    this.score = -1;
    this.scoreDelta = 1;

    this.obstacles = [];
}

Game.prototype.update = function (){
    this.ribbon.update();
    this.terrain.update();
    this.updateScore();
    this.updateObstacles();
    this.draw();

    var crash = this.detectCollision();
    if(crash){
        this.ribbon.die(this.terrain.pointsBot, this);
    }
    return crash;
}

Game.prototype.draw = function (){
    this.clear();
    this.ribbon.draw();
    this.drawObstacles();
    this.terrain.draw();
    this.drawScore();
}

Game.prototype.detectCollision = function (){
    //check ribbon is in canvas bounds
    if(this.ribbon.lastPoint() > this.maxy || this.ribbon.lastPoint() < this.miny){
        return true;
    }

    //check ribbon hasn't hit terrain
    if(this.ribbon.lastPoint() < this.terrain.midPointTop())
        return true;
    if(this.ribbon.lastPoint() > this.terrain.midPointBot())
        return true;

    for(i in this.obstacles)
        if(this.obstacles[i].collidesWith(this.maxx, this.ribbon.lastPoint()))
    return true;

    //all good -- did not crash
    return false;
}

Game.prototype.updateScore = function (){
    this.score += this.scoreDelta;
}

Game.prototype.updateObstacles = function (){
    if(this.obstacles.length > 0){
        if(this.obstacles[0].shouldDestroy(this.maxx)){
            this.obstacles.shift();
        }
    }
    for(var i = 0; i<this.obstacles.length; i++){
        this.obstacles[i].update(this.ribbon.width);
    }
}

Game.prototype.drawObstacles = function (){
    for(var i = 0; i<this.obstacles.length; i++){
        this.obstacles[i].draw(this.canvasID);
    }
}

Game.prototype.makeMoreDifficult = function (){
    if(this.increaseSpeed == 0 && this.ribbon.width < 10){
        this.ribbon.increaseWidth(1);
        this.terrain.increaseWidth(1);
        this.scoreDelta += 2;
    }

    if(Math.floor(Math.random()*10) % 2 == 0){
        this.createObstacle();
    }

    if(this.terrain.gap() > 100){
        this.terrain.increaseGap(-2);
        this.scoreDelta += 1;
    }
    this.increaseSpeed = (this.increaseSpeed+1)%10; //increase speed on every tenth call
}

Game.prototype.createObstacle = function (){
    var obstacle = new ObstacleStatic(this.terrain.gap(), this.terrain.lastPointTop());
    this.obstacles.push(obstacle);
}

Game.prototype.drawScore = function (){
    var canvas = document.getElementById(this.canvasID);
    var ctx    = canvas.getContext("2d");

    ctx.font          = "bold 24px 'Luckiest Guy', sans-serif";
    ctx.textBaseline  = 'bottom';
    ctx.shadowColor   = '#000000';
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle     = '#f8ed43';

    var score = pad(this.score.toString(), 8);
    ctx.fillText(score, 10, this.maxy-10);
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
}

Game.prototype.clear = function (){
    var canvas = document.getElementById(this.canvasID);
    var ctx    = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height); // clear canvas

    //draw background
    var gradient = ctx.createLinearGradient(0,0, canvas.width,0);
    gradient.addColorStop(0,   '#1b2936');
    gradient.addColorStop(1,   '#273a4d');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function pad(inStr, len){
    var str = inStr;
    while(str.length < len)
        str = '0' + str;
    return str;
}
