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
    if(this.ribbon.lastPoint() < this.terrain.midPointTop())
        return false;
    if(this.ribbon.lastPoint() > this.terrain.midPointBot())
        return false;

    //all good
    return true;
}

Game.prototype.makeMoreDifficult = function (){
    if(this.increaseSpeed == 0){
        this.ribbon.increaseWidth(1);
        this.terrain.increaseWidth(1);
    }
    this.terrain.increaseGap(-2);
    this.increaseSpeed = (this.increaseSpeed+1)%10; //increase speed on every tenth call
}
