var gg = function(x) { return document.getElementById(x);}
function resize_canvas(c){
    c = gg('x');
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
    canvasWidth = Math.min(canvasWidth, canvasHeight);
    canvasHeight = canvasWidth;
    c.setAttribute('width',canvasWidth);
    c.setAttribute('height',canvasHeight);
    //taken from http://stackoverflow.com/questions/1152203/centering-a-canvas/1646370
}

var ctx;
var t = 0;

window.onload = function(){
    ctx = gg('x').getContext('2d');
    resize_canvas(ctx);
    ctx.scale(canvasWidth, canvasHeight);
    ctx.lineWidth = 1;
    setInterval(draw, 33);
}

function square(){
    ctx.strokeStyle = 'rgb(255,255,255)';
    ctx.lineWidth = .01;
    ctx.beginPath();
    ctx.moveTo(0,0);
    ctx.lineTo(0,1);
    ctx.lineTo(1,1);
    ctx.lineTo(1,0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

var sss = .05;
var thrust = 0;

var STEP = 0;
var step = 0;
var pair = 0;
var create_constraint = function(a,b){
    //return new Constraint(a,b,.1);
    if (Math.abs(a.n - b.n) == 1) {
        return new Constraint(a,b,.1);
    }
    if (a.n == 2 * b.n) return new Constraint(a,b,.2);
    return 0;
}
var draw = function(){
    t += dt;
    if (step == 0){
        step = STEP;
        if (pair == 0){
            pair = objects.length;
            objects.unshift(new Particle(pair));
        } else {
            var c = create_constraint(objects[0], objects[pair]);
            if (c) constraints.push(c);
            pair-=1;
        }
    } else {
        step -= 1;
    }
    ctx.fillStyle = 'gray';
    square();
    // empty the objects list into a temp list
    for (var i in objects){
        objects[i].update();
    }
    var N = constraints.length;
    for (var j=0;j<100;j++){
        var i = Math.floor(N * Math.random());
        constraints[i].satisfy();
    }
    for (var i in objects){
        objects[i].draw();
    }
    for (var i in constraints){
        constraints[i].draw();
    }
}

dt = .1;

function Particle(n){
    this.n = n;
    this.x = Math.random();
    this.y = Math.random();
    this._x = this.x;
    this._y = this.y;
}

Particle.prototype.update = function(){
    // Verlet integration
    // dont track velocity directly
    // track pos and old pos
    if (this.x > 1) {
        //this._x = .5 * (this._x + this.x);
        this.x = 1; //bounce
    } else if (this.x < 0){
        //this._x = .5 * (this._x + this.x);
        this.x = 0; //bounce
    }
    var dx = .9*(this.x - this._x);
    this._x = this.x;
    this.x += dx;

    //this.y += .002;
    if (this.y > 1) {
        //this._y = .5 * (this._y + this.y);
        this.y = 1; //bounce
    } else if (this.y < 0){
        //this._y = .5 * (this._y + this.y);
        this.y = 0; //bounce
    }
    var dy = this.y - this._y;
    this._y = this.y;
    this.y += dy;
}

function Constraint(a,b,dist){
    this.a = a;
    this.b = b;
    this.d = dist;
}
Constraint.prototype.satisfy=function(){
    // move the points to the required length
    var dx = this.a.x - this.b.x;
    var dy = this.a.y - this.b.y;
    var m = Math.sqrt(dx*dx+dy*dy);
    var dm = this.d / (m + .001) - 1;
    var mx = dx * dm * .10;
    this.a.x += mx;
    this.b.x -= mx;
    var my = dy * dm;
    this.a.y += my;
    this.b.y -= my;
}
Constraint.prototype.draw = function(){
    // line
    ctx.strokeStyle = 'black';
    ctx.lineWidth = .1 * sss;
    ctx.beginPath();
    ctx.moveTo(this.a.x,this.a.y);
    ctx.lineTo(this.b.x,this.b.y);
    ctx.stroke();
}
Particle.prototype.draw = function(){
    ctx.save();
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 1;
    //ctx.fillStyle = 'black';
    ctx.translate(this.x, this.y);
    //ctx.rotate(this.t);
    ctx.scale(sss, sss);
    ctx.translate(0, -.5);
    //square();
    // the ship shape
    ctx.beginPath();
    ctx.moveTo(0,0);
    ctx.lineTo(0,1);
    ctx.stroke();
    ctx.restore();
}

var objects = [];
var constraints = [];
