function Game(canvasWidth, canvasHeight, canvasID, scoreCanvasID){
    this.minx = 0;
    this.maxx = canvasWidth;
    this.miny = 0;
    this.maxy = canvasHeight;

    this.canvasID      = canvasID;
    this.scoreCanvasID = scoreCanvasID;
    this.ribbon        = new Ribbon(canvasWidth, canvasHeight, canvasID);
    this.terrain       = new Terrain(canvasWidth, canvasHeight, canvasID);

    this.playing  = false;
    this.started  = false;

    this.increaseSpeed = 1;

    this.score = -1;
    this.scoreDelta = 1;

    this.obstacles = [];

    this.drawScore = this.drawScoreConstructor();
}

Game.prototype.update = function (){
    this.ribbon.update();
    this.terrain.update();
    this.updateScore();
    this.updateObstacles();
    this.draw();

    var crash = this.detectCollision();
    if(crash){
        this.started = false;
        this.ribbon.die(this.terrain.pointsBot, this);
    }
    return crash;
}

Game.prototype.draw = function (){
    this.clear();
    this.ribbon.draw();
    this.drawObstacles();
    this.terrain.draw();
    this.drawScore();
}

Game.prototype.detectCollision = function (){
    //check ribbon is in canvas bounds
    if(this.ribbon.lastPoint() > this.maxy || this.ribbon.lastPoint() < this.miny){
        return true;
    }

    //check ribbon hasn't hit terrain
    if(this.ribbon.lastPoint() < this.terrain.midPointTop())
        return true;
    if(this.ribbon.lastPoint() > this.terrain.midPointBot())
        return true;

    for(i in this.obstacles)
        if(this.obstacles[i].collidesWith(this.maxx, this.ribbon.lastPoint()))
            return true;

    //all good -- did not crash
    return false;
}

Game.prototype.updateScore = function (){
    this.score += this.scoreDelta;
}

Game.prototype.updateObstacles = function (){
    if(this.obstacles.length > 0){
        if(this.obstacles[0].shouldDestroy(this.maxx)){
            this.obstacles.shift();
        }
    }
    for(var i = 0; i<this.obstacles.length; i++){
        this.obstacles[i].update(this.ribbon.width);
    }
}

Game.prototype.drawObstacles = function (){
    for(var i = 0; i<this.obstacles.length; i++){
        this.obstacles[i].draw(this.canvasID);
    }
}

Game.prototype.makeMoreDifficult = function (){
    if(this.increaseSpeed == 0 && this.ribbon.width < 10){
        this.ribbon.increaseWidth(1);
        this.terrain.increaseWidth(1);
        this.scoreDelta += 2;
    }

    if(Math.floor(Math.random()*10) % 2 == 0){
        this.createObstacle();
    }

    if(this.terrain.gap() > 100){
        this.terrain.increaseGap(-2);
        this.scoreDelta += 1;
    }
    this.increaseSpeed = (this.increaseSpeed+1)%10; //increase speed on every tenth call
}

Game.prototype.createObstacle = function (){
    var obstacle = new ObstacleStatic(this.terrain.gap(), this.terrain.lastPointTop());
    this.obstacles.push(obstacle);
}

Game.prototype.drawScoreConstructor = function (){
    var count = 0;
    return function() {
        if (count % 10 == 0){
            var canvas = document.getElementById(this.scoreCanvasID);
            var ctx    = canvas.getContext("2d");

            ctx.clearRect(0, 0, canvas.width, canvas.height); // clear canvas

            ctx.font          = "bold 24px 'Luckiest Guy', sans-serif";
            ctx.textBaseline  = "bottom";
            ctx.fillStyle     = "#f8ed43";
            ctx.shadowColor   = "rgba(0,0,0,1)";
            ctx.shadowBlur    = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;

            var score = pad(this.score.toString(), 8);
            ctx.fillText(score, 10, this.maxy-10);
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
        }
        count += 1;
    }
}

Game.prototype.clear = function (){
    var canvas = document.getElementById(this.canvasID);
    var ctx    = canvas.getContext("2d");

    //ctx.clearRect(0, 0, canvas.width, canvas.height); // clear canvas

    //draw background
    ctx.fillStyle = '#273a4d';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function pad(inStr, len){
    var str = inStr;
    while(str.length < len)
        str = '0' + str;
    return str;
}

/////////////////// start and end game methods //////////////////////

Game.prototype.humanFriendlyScore = function (){
    var score = this.score.toString();
    if(score.length < 4){
        return score;
    }

    for(var i = score.length, acc = ""; i > 3; i = score.length){
        take = i%3 == 0 ? 3 : i%3
        head = score.slice(0, take)
        score = score.slice(take)
        acc += head + ','
    }
    return acc + score
}

Game.prototype.showEndGameScreen = function (){
    this.started = false;

    var canvas = document.getElementById(this.canvasID);
    var ctx    = canvas.getContext("2d");

    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font          = "bold 56px 'Chewy', sans-serif";
    ctx.textBaseline  = "top";
    ctx.fillStyle     = "#f8ed43";
    ctx.shadowColor   = "rgba(0,0,0,1)";
    ctx.shadowBlur    = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    this.drawCenteredText(this.generateInsult(), 15);
    this.drawCenteredText("Your score: " + this.humanFriendlyScore(), 70);

    var img = new Image();
    img.src = "./play_icon.png";
    ctx.drawImage(img, (this.maxx-img.width)/2, 140);

    this.drawCenteredText("Try again?", 120+img.height+20);

    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    this.makeBlanketVisible(false);

    this.checkNewHighscore(this.score);
}

Game.prototype.drawCenteredText = function (text,y){
    var canvas = document.getElementById(this.canvasID);
    var ctx    = canvas.getContext("2d");
    ctx.fillText(text, (this.maxx-ctx.measureText(text).width)/2, y);
}

Game.prototype.generateInsult = function(){
    var bad = ["Worst ever?",
               "Oh dear...",
               "Hopeless",
               "Plain awful",
               "You need practice",
               "You suck!",
               "Terrible",
               "I can't watch"];

    var mediocre = ["Meh",
                    "You can do better",
                    "I've seen worse",
                    "Average to bad",
                    "Keep trying",
                    "Oops",
                    "That's not the idea"];

    var good = ["Nice",
                "Not bad!",
                "Good work",
                "Acceptable",
                "Alright, I suppose..."];

    var vgood = ["Excellent",
                 "Getting bored?",
                 "Too easy?",
                 "Are you cheating?",
                 "Jedi, huh?",
                 "Ribbon: mastered"];

    if(this.score < 20000){
        var group = bad;
    }else if(this.score < 100000){
        var group = mediocre;
    }else if(this.score < 150000){
        var group = good;
    }else{
        var group = vgood;
    }

    var idx = Math.round(Math.random() * (group.length-1))
    return group[idx];
}

Game.prototype.displayStartButton = function (){
    var canvas = document.getElementById(this.canvasID);
    var ctx    = canvas.getContext("2d");

    var img = new Image();
    img.src = "./play_icon.png";
    ctx.drawImage(img, (this.maxx-img.width)/2, (this.maxy-img.height)/2);
}

Game.prototype.displayStartMessage = function (){
    var canvas = document.getElementById(this.canvasID);
    var ctx    = canvas.getContext("2d");

    this.draw(); //reset display

    ctx.font          = "bold 48px 'Chewy', sans-serif";
    ctx.textBaseline  = "top";
    ctx.fillStyle     = "#f8ed43";
    ctx.shadowColor   = "rgba(0,0,0,1)";
    ctx.shadowBlur    = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    this.drawCenteredText("Press any key to start...", this.maxy/2+50);

    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    this.makeBlanketVisible(true);
}

Game.prototype.makeBlanketVisible = function (visible){
    var blanket = document.getElementById("blanket");
    if(visible){
        blanket.style.display = 'block';
    }else{
        blanket.style.display = 'none';
    }
}

/////////////////// highscore methods //////////////////////

Game.prototype.checkNewHighscore = function (scoreToCheck){
    g = this;
    $.getJSON("score.py",
        function (data, status, request){
            if(status == "success"){
                if(Number(data[data.length-1]['score']) < scoreToCheck){
                    g.actOnNewHighScore();
                }
            }
        }
    );
}

Game.prototype.actOnNewHighScore = function (){
    var str = "";
    str += '<div id="high-score">';
    str += '    <h1>New Highscore!</h1>';
    str += '    <form name="highscore-form">';
    str += '        <input type="text" size="41" spellcheck="false" id="high-score-input-name" name="name"/>';
    str += '        <input type="hidden" id="form-score" name="score" value="'+this.score.toString()+'">';
    str += '        <input type="hidden" id="form-new-score" name="new-score" value="1">';
    str += '        <input type="submit" name="score-submit" value="Go!" id="high-score-submit" />';
    str += '    </form>';
    str += '</div>';

    $("#top-scoreboard").after(str);
    $("#high-score").fadeIn("slow");
    $("#high-score-input-name").focus();

    $("#high-score-submit").click(function (event){
        event.preventDefault();
        this.disabled = "disabled"; //prevent multiple submissions
        $.ajax({
               type: "POST",
                url: "http://www.gregsexton.org/ribbon/score.py",
               data: $(this.form).serialize(),
            success: function (){
                //reload the scoreboard!
                $.getJSON("score.py",
                    function (data, status, request){
                        if(status != "success"){
                            $("#scoreboard-container").after("<p>Error loading scoreboard.</p>");
                            return;
                        }
                        game.buildScoreboard(data, function(str){
                            $("#scoreboard-table").fadeOut();
                            $("#scoreboard-table").replaceWith(str);
                            $("#scoreboard-table").fadeIn();
                        });
                    }
                );
            }});
        $("#high-score").fadeOut("slow");
    })
}

Game.prototype.buildScoreboard = function (data, callback){
    //pre-condition: data should be a list of maps, each should have a 'name' and 'score' key.
    var str = '<table class="scoreboard-table" id="scoreboard-table" style="display:none;">';
    for(var i=0; i<data.length; i++){
        if(i == 0)
            str += '<tr class="scoreboard-top-row">';
        else if(i%2 == 0)
            str += '<tr class="scoreboard-row">';
        else
            str += '<tr class="scoreboard-row-alternate">';
        str += '<td>'+ (i+1).toString() +'</td>';
        str += '<td>' + data[i]['name'] + '</td>';
        str += '<td class="score">' + data[i]['score'] + '</td>';
        str += '</tr>';
    }

    str += '</table>';
    callback(str);
}
