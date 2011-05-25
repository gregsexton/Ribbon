function update(){

    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height); // clear canvas

    //draw background
    ctx.fillStyle = "rgb(15,47,66)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ribbon.update();
    ribbon.draw();
}

window.onload = window.onresize = function init(){
    var canvas        = document.getElementById("canvas");
    var viewportWidth = window.innerWidth;
    canvas.setAttribute("width",  700);
    canvas.setAttribute("height", 350);
    canvas.style.position = "fixed"
    canvas.style.left     = (viewportWidth - canvas.width) / 2;

    ribbon = new Ribbon(canvas.width, canvas.height);

    setInterval(update, 17); //roughly 60fps
    update();
}

window.onkeydown = function (event) {
    if(!ribbon.rising){
        ribbon.rising = true;
    }
}

window.onkeyup = function (event) {
    ribbon.rising = false;
}
