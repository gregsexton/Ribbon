function ObstacleStatic(availableHeight, yMin){
    this.height = availableHeight / (Math.random()*3+3);
    this.xDelta = 0;
    this.y      = (availableHeight - this.height)*Math.random() + yMin;
    this.width  = Math.random()*30 + 30;
}

ObstacleStatic.prototype.draw = function (canvasID){
    var canvas = document.getElementById(canvasID);
    var ctx    = canvas.getContext("2d");

    ctx.strokeStyle = '#f1e5c9';
    ctx.lineWidth   = 2;
    var gradient    = ctx.createLinearGradient(0,0, 0,this.y+this.height);
    gradient.addColorStop(0, '#738392');
    gradient.addColorStop(1, '#36383b');
    ctx.fillStyle = gradient;
    ctx.fillRect(canvas.width-this.xDelta, this.y, this.width, this.height);
    ctx.strokeRect(canvas.width-this.xDelta, this.y, this.width, this.height);
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
