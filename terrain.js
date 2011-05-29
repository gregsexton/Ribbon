function Terrain(canvasWidth, canvasHeight, canvasID){
    this.minx = 0;
    this.maxx = canvasWidth;
    this.miny = 0;
    this.maxy = canvasHeight;

    this.canvasID = canvasID;

    this.width  = 8; //distance between interpolated points

    this.gapHeight = 250;
    this.maxForce  = 7.0; //max absolute value of force used to modify terrain

    this.nextForceChange = 0;
    this.currentForce    = 0;
    this.currentVelocity = 0; //current rate of terrain change
    this.rescuing        = false;

    this.points = []
    for(var i = 0; i<canvasWidth/(this.width); i++){
        this.points[i] = (this.maxy-this.gapHeight)/2;
    }
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
    //TODO: cap max possible height taking in to account gapHeight
    //TODO: adjust so that cave in the middle, should never have floor or ceiling dissappear
    if(this.nextForceChange == 0){
        var nextForce     = this.maxForce * Math.random();
        var sign          = Math.floor(Math.random() * 10) % 2 == 0 ? (-1) : 1
        this.currentForce = nextForce * sign;

        //change the force regardless; iff the terrain is in danger of becoming impassable
        if(this.lastPoint() + this.gapHeight > this.maxy - 20 ){
            this.currentForce = -1 * this.turnForceAround();
            return;
        }
        if(this.lastPoint() < 20){
            this.currentForce = this.turnForceAround();
            return;
        }
        this.rescuing = false;
    }

    this.nextForceChange = (this.nextForceChange+1) % 10;
}

Terrain.prototype.turnForceAround = function () {
    if(!this.rescuing){
        this.currentVelocity = 0;
        this.rescuing = true;
    }
    return Math.abs(this.currentForce);
}

Terrain.prototype.midPoint = function (){
    //TODO: does this work always?
    return this.points[this.points.length/2];
}

Terrain.prototype.lastPoint = function (){
    return this.points[this.points.length-1];
}

Terrain.prototype.updatePoints = function (delta){
    this.points.shift();
    var lastPoint = this.points[this.points.length-1];
    this.points.push(lastPoint+delta);
}

Terrain.prototype.draw = function (){
    var canvas = document.getElementById(this.canvasID);
    var ctx    = canvas.getContext("2d");

    this.drawRoof(ctx);
    this.drawFloor(ctx);
}

Terrain.prototype.drawRoof = function (ctx){
    ctx.beginPath();
    ctx.moveTo(0, 0);

    for(var i = 0; i<this.maxx/this.width; i++){
        ctx.lineTo(i*this.width, this.points[i]);
    }

    ctx.lineTo(this.maxx, this.points[this.points.length-1]);
    ctx.lineTo(this.maxx, 0);
    ctx.closePath();
    this.fillTerrain(ctx);
}

Terrain.prototype.drawFloor = function (ctx){
    ctx.beginPath();
    ctx.moveTo(0, this.maxy);

    for(var i = 0; i<this.maxx/this.width; i++){
        ctx.lineTo(i*this.width, this.gapHeight+this.points[i]);
    }

    ctx.lineTo(this.maxx, this.gapHeight+this.points[this.points.length-1]);
    ctx.lineTo(this.maxx, this.maxy);
    ctx.closePath();
    this.fillTerrain(ctx);
}

Terrain.prototype.fillTerrain = function (ctx){
    ctx.fillStyle = '#656565';
    ctx.fill();
}
