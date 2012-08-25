var gg = function(x) { return document.getElementById(x);}
function resize_canvas(c){
    c = gg('x');
    /*canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
    canvasWidth = Math.min(canvasWidth, canvasHeight);
    canvasHeight = canvasWidth;
    */
    canvasWidth = 500;
    canvasHeight = 500;;
    c.setAttribute('width', canvasWidth);
    c.setAttribute('height', canvasHeight);
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
    new Species(wheel, 'blue',  .25);
    new Species(truss, 'red',   .75);
    //new Species(strand,'green', .75)
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

var sss = .025;
var thrust = 0;

var STEP = 1;
var step = 0;
var pair = 0;
var M = 1;
var strand = function(a,b){
    //return new Constraint(a,b,.1);
    if (Math.abs(a.n - b.n) == 1) {
        return new Constraint(a,b,.1);
    }
    if (a.n == 2 * b.n) return new Constraint(a,b,.2);
    return 0;
}
var r2 = Math.sqrt(2);
truss = function(a,b){
    var d = a.n - b.n;
    c = .1 * Math.max(.02, 1 - Math.sqrt(a.n)/10.0);
    if (d == 1) return new Constraint(a,b,c);
    if (d == 2) return new Constraint(a,b,c*r2);
    //if (d == 3) return new Constraint(a,b,c);
}
wheel = function(a,b){
    if (b.n == 0) return new Constraint(a,b,.23);
    if (a.n - b.n == 1) return new Constraint(a,b,.1);
    if (a.n - b.n == 2) return new Constraint(a,b,.2,.15);
}
var draw = function(){
    t += dt;
    if (step == 0){
        step = STEP;
        if (pair == 0){
            pair = M;
            M+=1;
            if (pair > 12) step  = -1;
            for (var s in species){
                species[s].birth();
            }
        } else {
            for (var s in species){
                species[s].create(0,pair);
            }
            pair-=1;
        }
    } else {
        step -= 1;
    }
    ctx.fillStyle = 'gray';
    square();
    // empty the objects list into a temp list
    for (var s in species){
        species[s].update();
    }
}

dt = .1;

function Species(f,c, x){
    this.color = c;
    this.x = x;
    var p = gg("programs");
    p.innerHTML += '<div><p>'+c+'</p><textarea class=program id="species_'+c+'">'+f+'</textarea></div>';
    species.push(this);
    this.reset();
}
Species.prototype.reset = function(){
    this.xs = [new FixedPoint(this.x, 1)];
    this.cs = [];
    var f = gg('species_'+this.color).value;
    eval("var g = "+f); // constraint creation function
    this.f = g;
}
Species.prototype.create = function(i,j){
    var a = this.xs[i];
    var b = this.xs[j];
    if (a ==  undefined || b == undefined) return;
    var c = this.f(a,b);
    if (c) this.cs.push(c);
}
Species.prototype.birth = function(){
    this.xs.unshift(new Particle(this.xs.length));
}
Species.prototype.update = function(){
    ctx.fillStyle = this.color;
    var constraints = this.cs;
    var objects = this.xs;
    for (var i in objects){
        objects[i].update();
    }
    var N = constraints.length;
    for (var j=0;j<1000;j++){
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
function Particle(n){
    this.n = n;
    this.x = Math.random();
    this.y = 0;
    this._x = this.x;
    this._y = this.y;
}
Particle.prototype.add = function(dx,dy){
    this.x += dx;
    this.y += dy;
    // todo, prevent movements outside of r from _x,_y
}
function FixedPoint(x,y){
    this.x = x;
    this.y = y;
    this.n = 0;
}
FixedPoint.prototype.add = function(dx,dy){
}
FixedPoint.prototype.update = function(){};
/*function(){
    ctx.save();
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
    ctx.lineTo(1,1);
    ctx.lineTo(1,0);
    ctx.lineTo(0,0);
    ctx.fill();
    ctx.restore();
};*/


Particle.prototype.update = function(){
    // Verlet integration
    // dont track velocity directly
    // track pos and old pos
    /*
    if (this.x > 1) {
        //this._x = .5 * (this._x + this.x);
        this.x = 1; //bounce
    } else if (this.x < 0){
        //this._x = .5 * (this._x + this.x);
        this.x = 0; //bounce
    }
    */
    var dx = .9*(this.x - this._x);
    this._x = this.x;
    this.x += dx;

    this.y += .001;
    if (this.y > 1) {
        this._y = this.y;
        this.y = 1; //bounce
    }/* else if (this.y < 0){
        //this._y = .5 * (this._y + this.y);
        this.y = 0; //bounce
    }*/
    var dy = .9*(this.y - this._y);
    this._y = this.y;
    this.y += dy;
}

function Constraint(a,b,maxdist,mindist){
    if (mindist == undefined) mindist = maxdist;
    this.a = a;
    this.b = b;
    this.min = mindist;
    this.max = maxdist;
}
Constraint.prototype.satisfy=function(){
    // move the points to the required length
    var dx = this.a.x - this.b.x;
    var dy = this.a.y - this.b.y;
    var m = Math.sqrt(dx*dx+dy*dy);
    var dm = 0;
    if (m > this.max){
        dm = Math.max(-.005, -(m - this.max) / m);
    } else if (m < this.min){
        dm = Math.min(.005, -(m - this.min) / m);
    }
    var mx = dx * dm * .5;
    var my = dy * dm * .5;
    this.a.add(mx, my);
    this.b.add(-mx, -my);
}
Constraint.prototype.draw = function(){
    // line
    if (this.min + .1 < this.max) return;
    ctx.strokeStyle = 'black';
    ctx.lineWidth = .1 * sss;
    ctx.beginPath();
    ctx.moveTo(this.a.x,this.a.y);
    ctx.lineTo(this.b.x,this.b.y);
    ctx.stroke();
}
Particle.prototype.draw = function(){
    ctx.save();
    //ctx.fillStyle = 'black';
    ctx.translate(this.x, this.y);
    //ctx.rotate(this.t);
    ctx.scale(sss, sss);
    ctx.translate(-.5, -.5);
    //square();
    // the ship shape
    ctx.beginPath();
    ctx.moveTo(0,0);
    ctx.lineTo(0,1);
    ctx.lineTo(1,1);
    ctx.lineTo(1,0);
    ctx.lineTo(0,0);
    ctx.fill();
    ctx.restore();
}
FixedPoint.prototype.draw = Particle.prototype.draw;
var species = [];
var replay = function(){
    step = 0;
    pair = 0;
    M = 1;
    for (var i in species){
        species[i].reset();
    }
}
