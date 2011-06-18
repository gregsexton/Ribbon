function update(){
    if(game.update()){
        stopGame();
    }
}

function makeMoreDifficult(){
    game.makeMoreDifficult();
}

function startGame(){
    refresh = setInterval(update, 17); //roughly 60fps
    difficult = setInterval(makeMoreDifficult, 1000);
    //setInterval(update, 1117); //for debugging
    game.playing = true;
}

function stopGame(){
    clearInterval(refresh);
    clearInterval(difficult);
    game.playing = false;
    //reset();
}

function reset(){
    game = new Game(canvas.width, canvas.height, "canvas");
    update();
}

window.onload = function init(){
    var canvas        = document.getElementById("game-div");
    var viewportWidth = window.innerWidth;
    canvas.style.position = "fixed"
    canvas.style.left     = (viewportWidth - 710) / 2;

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
