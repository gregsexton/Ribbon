function ObstacleStatic(availableHeight, yMin){
    this.height = availableHeight / (Math.random()*3+3);
    this.xDelta = 0;
    this.y      = (availableHeight - this.height)*Math.random() + yMin;
    this.width  = Math.random()*30 + 30;

    this.sampleWidth = 8;
    this.pointsTop = [];
    this.pointsBot = [];
    this.controlPointL = [];
    this.controlPointR = [];
    this.generatePoints();
}

ObstacleStatic.prototype.generatePoints = function (){
    var deviationRange = 5;
    for(var i = 0; i<this.width/this.sampleWidth; i++){
        var signTop = Math.pow(-1, Math.round(Math.random()*10));
        var signBot = Math.pow(-1, Math.round(Math.random()*10));
        var topVariation = Math.random() * deviationRange * signTop;
        var botVariation = Math.random() * deviationRange * signBot;

        this.pointsTop.push(this.y + topVariation);
        this.pointsBot.push(this.y + this.height + botVariation);
    }

    var controlXDeviation = this.height/2;
    // index 0 is the x delta, index 1 is the actual y value
    this.controlPointL[0] = Math.round(Math.random() * controlXDeviation);
    this.controlPointR[0] = Math.round(Math.random() * controlXDeviation);
    this.controlPointL[1] = (Math.random() * this.height)+this.y;
    this.controlPointR[1] = (Math.random() * this.height)+this.y;
}

ObstacleStatic.prototype.draw = function (canvasID){
    var canvas = document.getElementById(canvasID);
    var ctx    = canvas.getContext("2d");

    this.model(canvas.width - this.xDelta, ctx);
    this.fillObstacle(ctx);
}

ObstacleStatic.prototype.model = function (x, ctx){
    ctx.beginPath();
    ctx.moveTo(x, this.y);

    //draw top
    for(var i=0; i<this.pointsTop.length; i++)
        ctx.lineTo(x+i*this.sampleWidth, this.pointsTop[i]);

    //join top to bottom using quadratic and control point
    var lastPointIdx = this.pointsBot.length-1;
    var rightMostX = x+lastPointIdx*this.sampleWidth
    ctx.quadraticCurveTo(rightMostX+this.controlPointR[0], this.controlPointR[1],
                         rightMostX, this.pointsBot[lastPointIdx]);
    //draw bottom
    for(var i=this.pointsBot.length-2; i>=0; i--)
        ctx.lineTo(x+i*this.sampleWidth, this.pointsBot[i]);

    //join bottom to top using quadratic and control point
    ctx.quadraticCurveTo(x-this.controlPointL[0], this.controlPointL[1],
                         x, this.pointsTop[0]);
}

ObstacleStatic.prototype.fillObstacle = function (ctx){
    ctx.strokeStyle = '#f1e5c9';
    ctx.lineWidth   = 2;
    var gradient    = ctx.createLinearGradient(0,0, 0,this.y+this.height);
    gradient.addColorStop(0, '#738392');
    gradient.addColorStop(1, '#36383b');
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.stroke();
}

ObstacleStatic.prototype.update = function (width){
    this.xDelta += width;
}

ObstacleStatic.prototype.shouldDestroy = function (canvasWidth){
    return canvasWidth <= this.xDelta - this.width;
}

ObstacleStatic.prototype.collidesWith = function (canvasWidth, y){
    var mid = canvasWidth/2;
    if((this.xDelta >= mid) && (this.xDelta <= mid + this.width))
        return (y >= this.y) && (y <= this.y+this.height);
    return false;
}
