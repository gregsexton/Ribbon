function Game(canvasWidth, canvasHeight, canvasID){
    this.minx = 0;
    this.maxx = canvasWidth;
    this.miny = 0;
    this.maxy = canvasHeight;

    this.canvasID = canvasID;
    this.ribbon   = new Ribbon(canvasWidth, canvasHeight, canvasID);
    this.terrain  = new Terrain(canvasWidth, canvasHeight, canvasID);

    this.playing  = false;
}

Game.prototype.update = function (){
    this.ribbon.update();
    this.terrain.update();
    this.draw();
    return this.detectCollision();
}

Game.prototype.draw = function (){
    this.ribbon.draw();
    this.terrain.draw();
}

Game.prototype.detectCollision = function (){
    //check ribbon is in canvas bounds
    if(this.ribbon.lastPoint() > this.maxy || this.ribbon.lastPoint() < this.miny){
        return false;
    }

    //check ribbon hasn't hit terrain
    //TODO: does this work always?
    if(this.ribbon.lastPoint() < this.terrain.midPoint())
        return false;
    if(this.ribbon.lastPoint() > this.terrain.midPoint() + this.terrain.gapHeight)
        return false;

    //all good
    return true;
}
