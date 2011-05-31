function Terrain(canvasWidth, canvasHeight, canvasID){
    this.minx = 0;
    this.maxx = canvasWidth;
    this.miny = 0;
    this.maxy = canvasHeight;

    this.canvasID = canvasID;

    this.width  = 4; //distance between interpolated points

    this.maxForce  = 7.0; //max absolute value of force used to modify terrain
    this.nextForceChange = 0;
    this.currentForce    = 0;
    this.currentVelocity = 0; //current rate of terrain change
    this.rescuing        = false;

    this.pointsTop = [];
    this.pointsBot = [];

    var gapHeight = 250;
    for(var i = 0; i<canvasWidth/(this.width); i++){
        this.pointsTop[i] = 0;
        this.pointsBot[i] = this.maxy;
    }
    var index = Math.floor((canvasWidth/this.width));
    this.pointsTop[index] = (this.maxy-gapHeight)/2;
    this.pointsBot[index] = gapHeight + this.pointsTop[i];
}

//TODO: magic numbers
Terrain.prototype.update = function (){
    this.modifyForce();

    //s = ut - 0.5at^2
    //v = u + at
    var t = 1;
    var u = this.currentVelocity;
    var a = this.currentForce;
    var s = (u*t) - (0.5*a*t*t);
    var v = u + (a*t);

    //scale down!
    this.updatePoints(s/50); 
    this.currentVelocity = v;
}

Terrain.prototype.modifyForce = function (){
    if(this.nextForceChange == 0){
        var nextForce     = this.maxForce * Math.random();
        var sign          = Math.floor(Math.random() * 10) % 2 == 0 ? (-1) : 1
        this.currentForce = nextForce * sign;

        //change the force regardless; iff the terrain is in danger of becoming impassable
        if(this.lastPointBot() > this.maxy - 20 ){
            this.currentForce = -1 * this.turnForceAround();
            return;
        }
        if(this.lastPointTop() < 20){
            this.currentForce = this.turnForceAround();
            return;
        }
        this.rescuing = false;
    }

    this.nextForceChange = (this.nextForceChange+1) % 5;
}

Terrain.prototype.turnForceAround = function () {
    if(!this.rescuing){
        this.currentVelocity = 0;
        this.rescuing = true;
    }
    return Math.abs(this.currentForce);
}

Terrain.prototype.midPointTop = function (){
    return this.pointsTop[Math.floor(this.pointsTop.length/2)];
}

Terrain.prototype.midPointBot = function (){
    return this.pointsBot[Math.floor(this.pointsBot.length/2)];
}

Terrain.prototype.lastPointTop = function (){
    return this.pointsTop[this.pointsTop.length-1];
}

Terrain.prototype.lastPointBot = function (){
    return this.pointsBot[this.pointsBot.length-1];
}

Terrain.prototype.updatePoints = function (delta){
    this.pointsTop.shift();
    var lastPointTop = this.pointsTop[this.pointsTop.length-1];
    this.pointsTop.push(lastPointTop+delta);

    this.pointsBot.shift();
    var lastPointBot = this.pointsBot[this.pointsBot.length-1];
    this.pointsBot.push(lastPointBot+delta);
}

Terrain.prototype.draw = function (){
    var canvas = document.getElementById(this.canvasID);
    var ctx    = canvas.getContext("2d");

    this.drawRoof(ctx);
    this.drawFloor(ctx);
}

Terrain.prototype.drawRoof = function (ctx){
    this.drawPoints(ctx, this.pointsTop, 0);
    this.fillTerrain(ctx, true);
}

Terrain.prototype.drawFloor = function (ctx){
    this.drawPoints(ctx, this.pointsBot, this.maxy);
    this.fillTerrain(ctx, false);
}

Terrain.prototype.drawPoints = function (ctx, points, startY){
    ctx.beginPath();
    ctx.moveTo(0, startY);

    for(var i = 0; i<this.maxx/this.width; i++){
        ctx.lineTo(i*this.width, points[i]);
    }

    ctx.lineTo(this.maxx, points[points.length-1]);
    ctx.lineTo(this.maxx, startY);
    ctx.closePath();
}

Terrain.prototype.fillTerrain = function (ctx, isRoof){
    ctx.fillStyle = '#656565';
    var gradient = ctx.createLinearGradient(0,0, 0,this.maxy);
    gradient.addColorStop(isRoof?1:0, '#738392');
    //gradient.addColorStop(isRoof?0:1, '#1f282d');
    gradient.addColorStop(isRoof?0:1, '#36383b');
    ctx.fillStyle = gradient;
    ctx.fill();
}

Terrain.prototype.increaseWidth = function (delta){
    var newWidth = this.width + delta;

    //convert current coordinates
    var newPointsTop = [];
    var newPointsBot = [];
    var ratio = this.width/newWidth;
    for(var i=0; i<this.pointsTop.length; i++){
        var newIndex = i*ratio;
        newPointsTop[Math.round(newIndex)] = this.pointsTop[i];
    }
    for(var i=0; i<this.pointsBot.length; i++){
        var newIndex = i*ratio;
        newPointsBot[Math.round(newIndex)] = this.pointsBot[i];
    }

    this.pointsTop = newPointsTop;
    this.pointsBot = newPointsBot;
    this.width = newWidth;
}

Terrain.prototype.increaseGap = function (delta){
    this.pointsTop[this.pointsTop.length-1] -= delta/2;
    this.pointsBot[this.pointsBot.length-1] += delta/2;
}
