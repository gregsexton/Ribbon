function Ribbon(canvasWidth, canvasHeight) {
    this.minx = 0;
    this.maxx = canvasWidth;
    this.miny = 0;
    this.maxy = canvasHeight;

    this.height = 4;
    this.width = 2;

    this.points = []
    for(var i = 0; i<canvasWidth/(this.width*2); i++){
        this.points[i] = canvasHeight/2;
    }

    this.velocity = 0;
    this.gravity  = 7.0;

    this.rising = false;
}

Ribbon.prototype.moveUp = function (delta) {
    if(this.lastPoint() - delta + this.height > this.miny){
        this.setPoints(-delta);
    }else{
        this.setPoints(0);
    }
}

Ribbon.prototype.moveDown = function (delta) {
    if(this.lastPoint() + delta < this.maxy){
        this.setPoints(delta);
    }else{
        this.setPoints(0);
    }
}

Ribbon.prototype.setPoints = function (delta) {
    this.points.shift();
    var lastPoint = this.lastPoint()
    this.points.push(lastPoint + delta);
}

Ribbon.prototype.lastPoint = function () {
    return this.points[this.points.length-1]
}

Ribbon.prototype.draw = function () {
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");

    ctx.fillStyle = "rgb(255,255,255)";

    ctx.beginPath();
    ctx.moveTo(0, this.points[0]);
    for(var i = 1; i<this.maxx/(this.width*2); i++){
        ctx.lineTo(i*this.width, this.points[i]);
    }

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = this.height;
    ctx.stroke();
}

Ribbon.prototype.update = function () {
    //s = ut - 0.5at^2
    //v = u + at
    var t   = 1;
    var u   = this.velocity;
    var a   = this.gravity;
    var a   = this.rising ? -(a) : a;
    var s   = (u*t) - (0.5*a*t*t);
    var v   = u + (a*t);

    //scale down!
    this.moveDown(s/50); 

    this.velocity = v;
}
