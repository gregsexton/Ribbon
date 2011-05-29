function Ribbon(canvasWidth, canvasHeight, canvasID) {
    this.minx = 0;
    this.maxx = canvasWidth;
    this.miny = 0;
    this.maxy = canvasHeight;

    this.canvasID = canvasID;

    this.height = 4;
    this.width  = 8; //distance between interpolated points
                     //the larger this number the 'faster' the ribbon moves.

    this.points = []
    for(var i = 0; i<canvasWidth/(this.width*2); i++){
        this.points[i] = canvasHeight/2;
    }

    this.velocity = 0;
    this.gravity  = 7.0;

    this.rising = false;

    this.strokes = ["#ff0000", "#ff7000", "#fffc00", "#00b439", "#00eaff", "#2428e6", "#b320e6", "#ff00c6"];

    this.stroke = 0; //current starting stroke color
    this.offset = -1; //the current stroke offset, in order to make the colors 'move'
}

Ribbon.prototype.move = function (delta) {
    this.setPoints(delta);
}

Ribbon.prototype.setPoints = function (delta) {
    this.points.shift();
    var lastPoint = this.lastPoint()
    this.points.push(lastPoint + delta);
}

Ribbon.prototype.lastPoint = function () {
    return this.points[this.points.length-1]
}

//TODO: remove magic numbers
Ribbon.prototype.draw = function () { //TODO: refactor, far too busy
    var canvas = document.getElementById(this.canvasID);
    var ctx    = canvas.getContext("2d");

    this.offset = (this.offset+1) % 20;
    if(this.offset == 0){
        this.stroke = (this.stroke+1) % this.strokes.length;
    }
    var stroke = this.stroke;

    ctx.beginPath();
    var startSegmentX = 0;
    var startSegmentY = this.points[0];
    ctx.moveTo(startSegmentX, startSegmentY);

    for(var i = 1; i<this.maxx/(this.width*2); i++){

        ctx.lineTo(i*this.width, this.points[i]);

        if((i+this.offset)%20 == 0){
            //begin a new color section
            var gradient = ctx.createLinearGradient(startSegmentX, startSegmentY,
                                                    i*this.width, this.points[i]);
            gradient.addColorStop(0, this.strokes[stroke++ % this.strokes.length]);
            gradient.addColorStop(1, this.strokes[stroke   % this.strokes.length]);
            ctx.strokeStyle = gradient;
            ctx.lineWidth = this.height;
            ctx.stroke();
            ctx.beginPath();
            startSegmentX = i * this.width;
            startSegmentY = this.points[i];
            ctx.moveTo(startSegmentX, startSegmentY);
        }
    }

    if(startSegmentX > this.maxx/2-this.width)
        return; //starting a new block of color - nothing to draw; flashes gradient on the screen
    var gradient = ctx.createLinearGradient(startSegmentX, startSegmentY,
                                            this.maxx/2-this.width, this.lastPoint());

    gradient.addColorStop(0, this.strokes[stroke++ % this.strokes.length]);
    gradient.addColorStop(1, this.strokes[stroke   % this.strokes.length]);
    ctx.strokeStyle = gradient;
    ctx.lineWidth = this.height;
    ctx.stroke();

}

Ribbon.prototype.update = function () {
    //s = ut - 0.5at^2
    //v = u + at
    var t = 1;
    var u = this.velocity;
    var a = this.gravity;
    var a = this.rising ? -(a) : a;
    var s = (u*t) - (0.5*a*t*t);
    var v = u + (a*t);

    //scale down!
    this.move(s/50); 

    this.velocity = v;
}
