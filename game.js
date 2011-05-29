function Game(canvasWidth, canvasHeight, canvasID){
    this.minx = 0;
    this.maxx = canvasWidth;
    this.miny = 0;
    this.maxy = canvasHeight;

    this.canvasID = canvasID;
    this.ribbon   = new Ribbon(canvasWidth, canvasHeight, canvasID);

    this.playing  = false;
}

Game.prototype.update = function () {
    this.ribbon.update();
    this.draw();
    if(this.ribbon.lastPoint() > this.maxy || this.ribbon.lastPoint() < this.miny){
        return false;
    }
    return true;
}

Game.prototype.draw = function () {
    this.ribbon.draw();
}
