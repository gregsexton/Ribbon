function update(){

    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height); // clear canvas

    //draw background
    ctx.fillStyle = "rgb(15,47,66)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if(!game.update()){
        stopGame();
    }
}

function startGame(){
    refresh = setInterval(update, 17); //roughly 60fps
    //setInterval(update, 1117); //for debugging
    game.playing = true;
}

function stopGame(){
    clearInterval(refresh);
    game.playing = false;
    //reset();
}

function reset(){
    game = new Game(canvas.width, canvas.height, "canvas");
    update();
}

window.onload = function init(){
    var canvas        = document.getElementById("canvas");
    var viewportWidth = window.innerWidth;
    canvas.setAttribute("width",  700);
    canvas.setAttribute("height", 350);
    canvas.style.position = "fixed"
    canvas.style.left     = (viewportWidth - canvas.width) / 2;

    reset();
}

window.onkeydown = function (event){
    if(!game.playing){
        startGame();
        return;
    }
    if(!game.ribbon.rising){
        game.ribbon.rising = true;
    }
}

window.onkeyup = function (event){
    game.ribbon.rising = false;
}
