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
}

function reset(){
    game = new Game(canvas.width, canvas.height, "canvas");
    update();
    game.displayStartButton();
}

window.onload = function init(){
    var canvas        = document.getElementById("game-div");
    var viewportWidth = window.innerWidth;

    canvas.onmousedown = function (){
        if(!game.started){
            reset();
            game.started = true;
            game.displayStartMessage();
        }
    }
    reset();

    var input = createInitialScoreboard();
    setInterval(updateScoreboard(input), 30000); //every 30 secs
}

function createInitialScoreboard(){
    var extractStr = ""
    buildScoreBoard(function(str){
        $("#scoreboard-container").after(str);
        $("#scoreboard-table").fadeIn();
        extractStr = str;
    });
    return extractStr;
}

function updateScoreboard(inputStr){
    var checkString = inputStr
    return function(){
        buildScoreBoard(function(str){
            if (str != checkString){
                checkString = str;
                $("#scoreboard-table").fadeOut();
                $("#scoreboard-table").replaceWith(str);
                $("#scoreboard-table").fadeIn();
            }
        });
    }
}

function buildScoreBoard(callback){
    //callback should take a string as an argument
    $.getJSON("score.py",
        function (data, status, request){
            if(status != "success"){
                $("#scoreboard-container").after("<p>Error loading scoreboard.</p>");
                return;
            }
            game.buildScoreboard(data, callback);
        }
    );
}

window.onkeydown = function (event){
    if(game.started){
        event.preventDefault();
    }

    if(game.started && !game.playing){
        startGame();
        return;
    }

    if(game.playing && !game.ribbon.rising){
        game.ribbon.rising = true;
    }
}

window.onkeyup = function (event){
    game.ribbon.rising = false;
}
