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
    return this.detectCollision();
}

Game.prototype.draw = function (){
    this.ribbon.draw();
    this.drawObstacles();
    this.terrain.draw();
    this.drawScore();
}

Game.prototype.detectCollision = function (){
    //check ribbon is in canvas bounds
    if(this.ribbon.lastPoint() > this.maxy || this.ribbon.lastPoint() < this.miny){
        return false;
    }

    //check ribbon hasn't hit terrain
    if(this.ribbon.lastPoint() < this.terrain.midPointTop())
        return false;
    if(this.ribbon.lastPoint() > this.terrain.midPointBot())
        return false;

    for(i in this.obstacles)
        if(this.obstacles[i].collidesWith(this.maxx, this.ribbon.lastPoint()))
            return false;

    //all good
    return true;
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
    //TODO: need to put caps on this -- especially obstacles!
    if(this.increaseSpeed == 0){
        this.ribbon.increaseWidth(1);
        this.terrain.increaseWidth(1);
        this.scoreDelta += 2;
    }

    if(this.increaseSpeed % 2 == 0){
        this.createObstacle();
    }

    this.terrain.increaseGap(-2);
    this.scoreDelta += 1;
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

function pad(inStr, len){
    var str = inStr;
    while(str.length < len)
        str = '0' + str;
    return str;
}
