var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
var commandField = document.getElementById("command");

commandField.addEventListener("keyup", function(event) {
    event.preventDefault();
    if (event.keyCode === 13) {
        document.getElementById("execute").click();
    }
});

function changeCoordinateSystem(xstart, yend) {
    ctx.translate(xstart, yend);
    ctx.scale(1, -1);
}

var T=8, L=2, R=1, B=4;

function code(x, y,xmin, xmax, ymin, ymax) {
    var c=0;
    if (x>xmax) {
        c = c | R;
    }
    else if (x<xmin) {
        c = c | L;
    }
    if (y<ymin) {
        c = c | B;
    }
    else if (y>ymax) {
        c = c | T;
    }
    return c;
}
function findPartInsideScreen(x0, y0, x1, y1, xmin, xmax, ymin, ymax) {
    var accept = false, done=false;
    var c0 = code(x0,y0, xmin, xmax, ymin, ymax), c1 = code(x1,y1, xmin, xmax, ymin, ymax);
    do {
        if (c0 == 0 && c1 == 0) {
            accept = true;
            done = true;
        }
        else if (c0&c1 != 0) {
            done = true;
        }
        else {
            var x, y, cx;
            if (c0 != 0) cx = c0;
            else cx = c1;
            if (cx & T) {
                x = x0 + ((x1 - x0)*(y0 - ymax) / (y1 - y0));
                y = ymax;
            }
            else if (cx & B) {
                y = ymin;
                x = x0 + ((x1 - x0)*(ymin - y0) / (y1 - y0));
            }
            else if (cx & R) {
                x = xmax;
                y = y0 + ((y1 - y0)*(xmax - x0) / (x1 - x0));
            }
            else if (cx & L) {
                x = xmin;
                y = y0 + ((y1 - y0)*(xmin - x0) / (x1 - x0));
            }
            if (cx == c0) {
                x0 = x;
                y0 = y;
                c0 = code(x0, y0, xmin, xmax, ymin, ymax);
            }
            else {
                x1 = x;
                y1 = y;
                c1 = code(x1, y1, xmin, xmax, ymin, ymax);
            }
        }
    } while(!done);
    if (accept) return [x0, y0, x1, y1];
    else return [x0, y0, x0, y0];
}

var lines = new Array();

var minX, minY, maxX, maxY;
var x,y, orientation, penUp;


minX = 0;
minY = 0;
maxX = 800;
maxY= 600;

var startx = (maxX-minX)/2-4;
var starty = (maxY-minY)/2-4;

x = startx;
y = starty;
orientation = 0;
penUp=false;
changeCoordinateSystem(minX, maxY);

var kochlength= 500;

ctx.moveTo(x,y);
drawTurtle();

function moveTurtle(newx, newy) {
    x = newx;
    y = newy;
    ctx.moveTo(x, y);
    redraw();
}

function addLine(destx, desty) {
    lines.push(line = {
        x0: x,
        y0: y,
        x1: destx,
        y1: desty,
        color: ctx.strokeStyle,
        width: ctx.lineWidth,
    });
}

function drawTurtle() {
    var turtSize = 10;
    ctx.save();
    ctx.fillStyle = "#FF0000";
    ctx.strokeStyle="#FF0000";
    ctx.translate(x,y);
    ctx.rotate(-orientation*Math.PI/180);
    ctx.translate(-x,-y);
    ctx.beginPath();
    ctx.moveTo(x, y+turtSize);
    ctx.lineTo(x-turtSize, y-turtSize);
    ctx.lineTo(x+turtSize, y-turtSize);
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
    ctx.translate(x,y);
    ctx.rotate(orientation*Math.PI/180);
    ctx.translate(-x,-y);
    ctx.restore();
}

function drawLine(line) {
    ctx.beginPath();
    ctx.moveTo(line.x0, line.y0);
    ctx.lineTo(line.x1, line.y1);
    ctx.stroke();
    ctx.closePath();
}

function redraw() {
    ctx.save();
    ctx.setTransform(1,0,0,1,0,0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    for(var i=0; i<lines.length; i++) {
        ctx.strokeStyle = lines[i].color;
        ctx.lineWidth = lines[i].width;
        drawLine(lines[i]);
    }
    drawTurtle();
}

function changeWidth(size) {
    ctx.lineWidth = size;
}

function forward(length) {
    var potx, poty;
    var rad = orientation*Math.PI/180;
    potx = x+Math.sin(rad)*length;
    poty = y+Math.cos(rad)*length;
    var newcords = findPartInsideScreen(x, y, potx, poty, minX, maxX, minY, maxY);
    var newx = newcords[2], newy = newcords[3];
    if (penUp == false) {
        addLine(newx, newy);
        moveTurtle(newx, newy);
    }
    else {
        moveTurtle(newx, newy);
    }
}

function backward(length) {
    var potx, poty;
    var rad = (orientation + 180 % 360)*Math.PI/180;
    potx = x+Math.sin(rad)*length;
    poty = y+Math.cos(rad)*length;
    var newcords = findPartInsideScreen(x, y, potx, poty, minX, maxX, minY, maxY);
    var newx = newcords[2], newy = newcords[3];
    if (penUp == false) {
        addLine(newx, newy);
        moveTurtle(newx, newy);
    }
    else {
        moveTurtle(newx, newy);
    }
}

function left(num) {
    orientation = (orientation-num) % 360;
    redraw();
}

function right(num) {
    orientation = (orientation + num) % 360;
    redraw();
}

function pu() {
    penUp = true;
}

function pd() {
    penUp = false;
}

function changeColor(color) {
    ctx.strokeStyle = color;
}

function koch(level, kochlength) {
    if (level <1) {
        forward(kochlength);
    }
    else {
        koch (level - 1, kochlength / 3.0);
        left (60);
        koch (level - 1, kochlength / 3.0);
        right (120);
        koch (level - 1, kochlength / 3.0);
        left (60);
        koch (level - 1, kochlength / 3.0);
    }
}

function sampleFigures() {
    changeColor("#F00");
    moveTurtle(300,370);
    forward(200);
    right (90);
    forward(200);
    right(90);
    forward(200);
    right(90);
    forward(200);
    moveTurtle(500, 100);
    changeColor("#0F0");
    forward(100);
    right(120);
    forward(250);
    right(120);
    forward(250);
    right(120);
    forward(250);
    moveTurtle(130,100);
    right(60);
    forward(120);
    right(60);
    forward(120);
    right(60);
    forward(120);
    right(60);
    forward(120);
    right(60);
    forward(120);
    right(60);
    forward(120);

}

function clear() {
    lines = new Array();
    moveTurtle(startx, starty);
}


function buttonPressed() {
    var input = commandField.value;
    commandField.value = "";
    invoke(input);
}

function invoke(commands) {
    commands = commands.split(";");

    for (i = 0; i < commands.length; i++) {
        var cmd = commands[i];
        cmd = cmd.toLowerCase();
        cmd = cmd.split(" ");

        execute(cmd);

    }
}

function execute(cmd) {

    switch (cmd[0]) {
        case "forward":
            forward(parseInt(cmd[1]));
            break;
        case "backward":
            backward(parseInt(cmd[1]));
            break;
        case "left":
            left(parseInt(cmd[1]));
            break;
        case "right":
            right(parseInt(cmd[1]));
            break;
        case "pu":
            pu();
            break;
        case "pd":
            pd();
            break;
        case "goto":
            moveTurtle(parseInt(cmd[1]), parseInt(cmd[2]));
            break;
        case "color":
            changeColor(cmd[1]);
            break;
        case "width":
            changeWidth(parseInt(cmd[1]));
            break;
        case "koch":
            moveTurtle(minX+((maxX-minX)/5), minY+ ((maxY-minY)/8));
            for (var i = 0; i < 3; i++) {
                koch(parseInt(cmd[1]), kochlength);
                right (120);
            }
            break;
        case "sample":
            sampleFigures();
            break;
        case "clear":
            clear();
            break;
    }
}