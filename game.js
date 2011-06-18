function Game(canvasWidth, canvasHeight, canvasID){
    this.minx = 0;
    this.maxx = canvasWidth;
    this.miny = 0;
    this.maxy = canvasHeight;

    this.canvasID = canvasID;
    this.ribbon   = new Ribbon(canvasWidth, canvasHeight, canvasID);
    this.terrain  = new Terrain(canvasWidth, canvasHeight, canvasID);

    this.playing  = false;
    this.started  = false;

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

Game.prototype.showEndGameScreen = function (){
    this.started = false;

    var canvas = document.getElementById(this.canvasID);
    var ctx    = canvas.getContext("2d");

    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font          = "bold 56px 'Luckiest Guy', sans-serif";
    ctx.textBaseline  = 'top';
    ctx.shadowColor   = '#000000';
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle     = '#f8ed43';

    this.drawCenteredText(this.generateInsult(), 20);
    this.drawCenteredText("Your score: " + this.score.toString(), 80);

    var img = new Image();
    img.src = "./play_icon.png";
    ctx.drawImage(img, (this.maxx-img.width)/2, 140);

    this.drawCenteredText("Try again?", 140+img.height+20);

    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
}

Game.prototype.drawCenteredText = function (text,y){
    var canvas = document.getElementById(this.canvasID);
    var ctx    = canvas.getContext("2d");
    ctx.fillText(text, (this.maxx-ctx.measureText(text).width)/2, y);
}

Game.prototype.generateInsult = function(){
    var bad = ["Worst ever?",
               "Oh dear...",
               "Hopeless",
               "Plain awful",
               "You need practice",
               "You suck!",
               "Terrible",
               "I can't watch"];

    var mediocre = ["Meh",
                    "You can do better",
                    "I've seen worse",
                    "Average to bad",
                    "Keep trying",
                    "Oops",
                    "That's not the idea"];

    var good = ["Nice",
                "Not bad!",
                "Good work",
                "Acceptable",
                "Alright, I suppose..."];

    var vgood = ["Excellent",
                 "Getting bored?",
                 "Too easy?",
                 "Are you cheating?",
                 "Jedi, huh?",
                 "Ribbon: mastered"];

    if(this.score < 20000){
        var group = bad;
    }else if(this.score < 100000){
        var group = mediocre;
    }else if(this.score < 150000){
        var group = good;
    }else{
        var group = vgood;
    }

    var idx = Math.round(Math.random() * (group.length-1))
    return group[idx];
}

Game.prototype.displayStartButton = function (){
    var canvas = document.getElementById(this.canvasID);
    var ctx    = canvas.getContext("2d");

    var img = new Image();
    img.src = "./play_icon.png";
    ctx.drawImage(img, (this.maxx-img.width)/2, (this.maxy-img.height)/2);
}

Game.prototype.displayStartMessage = function (){
    var canvas = document.getElementById(this.canvasID);
    var ctx    = canvas.getContext("2d");

    this.update(); //reset display

    ctx.font          = "bold 48px 'Luckiest Guy', sans-serif";
    ctx.textBaseline  = 'top';
    ctx.shadowColor   = '#000000';
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle     = '#f8ed43';

    this.drawCenteredText("Press any key to start", this.maxy/2+50);

    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
}
