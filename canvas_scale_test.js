var canvas = document.getElementById("GameCanvas");
var ctx = canvas.getContext("2d");
canvas.width  = window.innerWidth/2;
canvas.height = window.innerHeight/2;
canv_start_w = canvas.width;
canv_start_h = canvas.height;

function set_canvas_bg(color) {	
	ctx.fillStyle = color;
	ctx.fillRect(0,0,canvas.width, canvas.height);
}

function draw_line(coords, color) {
	ctx.beginPath();
	ctx.lineWidth="3";
	ctx.strokeStyle=color;
	ctx.moveTo(coords[0].x, coords[0].y);
	ctx.lineTo(coords[1].x, coords[1].y);
	ctx.stroke();
	ctx.closePath();
}

function draw_circ(r, pos, color) {
	ctx.beginPath();
	ctx.fillStyle=color;
	ctx.arc(pos.x, pos.y, r, 0, 2*Math.PI);
	ctx.fill();
	ctx.closePath();
}

function update() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    set_canvas_bg("lightblue");

    if (window.innerWidth < window.innerHeight) {

        var xscale = (window.innerHeight)/canv_start_w;
        var yscale = (window.innerWidth)/canv_start_h;
        ctx.setTransform(xscale, 0, 0, yscale, 0, 0);

        ctx.rotate((90/360)*(2*Math.PI));
        ctx.translate(0, -window.innerWidth);
    } else {

        var xscale = (window.innerWidth)/canv_start_w;
        var yscale = (window.innerHeight)/canv_start_h;
        ctx.setTransform(xscale, 0, 0, yscale, 0, 0);

        ctx.rotate((0/360)*(2*Math.PI));
    }

    draw_circ(canv_start_w/10, {x: canv_start_w/2, y: canv_start_h/2}, "black");
    draw_line([{x: canv_start_w/16, y: canv_start_h/2}, {x: 15*canv_start_w/16, y: canv_start_h/2}])
    requestAnimationFrame(update);
}

update();