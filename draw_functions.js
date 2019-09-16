// test: communicate w/ php

// var str = "test test test";




// inputs: radius, position on canvas and context

// control canvas prints - setup
var canvas = document.getElementById("GameCanvas");
var ctx = canvas.getContext("2d");
canvas.width  = window.innerWidth;
canvas.height = window.innerHeight;
var canv_w = canvas.width;
var canv_h = canvas.height;
var horizontal_screen = true;
var vertical_screen = false;

function tilt_canvas() {

	if (window.innerHeight > window.innerWidth) {
		// tilt to vertical
		// canvas.width = window.innerWidth;
		// canvas.height = window.innerHeight;
		ctx.rotate((90/360)*(2*Math.PI));
		ctx.translate(0, -window.innerWidth);
		/*
		console.log("tilt to vertical")
		ctx.rotate((90/360)*(2*Math.PI));
		ctx.translate(0, -window.innerWidth);
		vertical_screen = true;
		horizontal_screen = false;
		// */
	} else if (window.innerHeight < window.innerWidth) { // vertical_screen
		// tilt to horizontal
		// canvas.width = window.innerWidth;
		// canvas.height = window.innerHeight;
		ctx.rotate((0)*(2*Math.PI)); // absolute coordinates
		// horizontal_screen = true;
		// vertical_screen = false;
	}
}

// preparing tilt
if (window.innerHeight > window.innerWidth) {
	tilt_canvas();
	canv_w = canvas.height;
	canv_h = canvas.width;
}

// TODO implement scrolling

function clear_canvas() {
	
	ctx.clearRect(0, 0, canv_w, canv_h);
	
}

function set_canvas_bg(color) {
	
	ctx.fillStyle = color;
	ctx.fillRect(0,0,canv_w,canv_h);
	
}

function draw_grid() {
	
	for (h = 0; h < canv_h; h += canv_h/n_rows) {
		coords = [
			{x: 0, y: h},
			{x: canv_w, y: h}
		];
		draw_poly(coords, "white");
	}
	
	for (v = 0; v < canv_w; v += canv_w/n_cols) {
		coords = [
			{x: v, y: 0},
			{x: v, y: canv_h}
		];
		draw_poly(coords, "white");
	}
}

function refresh_canvas() {
	clear_canvas();
	draw_grid();
}

function draw_timed(n_frames) {
	if (visible_counter <= n_frames) {
		refresh_canvas();
		// draw stuff...
		visible_counter++;
	} else {
		refresh_canvas();
	}
}

function draw_line(coords, color) {
	ctx.beginPath();
	ctx.lineWidth="1";
	ctx.strokeStyle=color;
	ctx.moveTo(coords[0].x, coords[0].y);
	ctx.lineTo(coords[1].x, coords[1].y);
	ctx.stroke();
	ctx.closePath();
}

function draw_path(coords, color) {
	ctx.beginPath();
	ctx.lineWidth="1";
	ctx.strokeStyle=color;
	ctx.moveTo(coords[0].x, coords[0].y);
	for (let index = 1; index < coords.length; index++) {
		ctx.lineTo(coords[index].x, coords[index].y);
	}
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

function draw_circ_outline(r, pos, outlinecolor, fillcolor) {
	ctx.beginPath();
	ctx.fillStyle=fillcolor;
	ctx.strokeStyle=outlinecolor;
	ctx.arc(pos.x, pos.y, r, 0, 2*Math.PI);
	ctx.fill();
	ctx.stroke();
	ctx.closePath();
}

function draw_poly(coords, color) {
	ctx.beginPath();
	ctx.moveTo(coords[0].x, coords[0].y);
	ctx.strokeStyle=color;
	ctx.fillStyle=color;
	for (i=1; i<coords.length; i++) {
		ctx.lineTo(coords[i].x, coords[i].y);
	}
	ctx.lineTo(coords[coords.length-1].x, coords[coords.length-1].y);
	ctx.closePath();
	ctx.stroke();
	ctx.fill();
}

function draw_speech_bubble(text, pos) {
	// get measures from text
	var font_size = Math.round(0.05*canv_h);
	ctx.font = String(font_size)+"px Arial";
	var textwidth = ctx.measureText(text).width;
	var textheight = ctx.measureText(text).height; // does not seem to work correctly
	var width = textwidth + 20;
	var height = font_size; // incl padding
	// create coords
	coords = [];
	coords.push([pos.x + 0.01*canv_h, 					pos.y - 0.01*canv_h]); // fixed
	coords.push([pos.x + 0.02*canv_h, 					pos.y - font_size/2]); // fixed
	coords.push([pos.x + 0.025*canv_h - width/2,			pos.y - font_size/2]);
	coords.push([pos.x + 0.025*canv_h - width/2,			pos.y - font_size/2 - height]);
	coords.push([pos.x + 0.025*canv_h + width/2,			pos.y - font_size/2 - height]);
	coords.push([pos.x + 0.025*canv_h + width/2,			pos.y - font_size/2]);
	coords.push([pos.x + 0.03*canv_h, 					pos.y - font_size/2]); // fixed
	coords.push([pos.x + 0.01*canv_h, 					pos.y - 0.01*canv_h]); // closing - first coord
	// adding colors
	ctx.strokeStyle="black";
	ctx.fillStyle="white";
	ctx.lineWidth = 3;
	ctx.beginPath();
	// assuming edge of bubble starts 10 px to right and above pos
	for (let index = 0; index < coords.length; index++) {
		const coord = coords[index];
		ctx.lineTo(...coord); //moveTo
	}
	ctx.closePath();
	ctx.stroke();
	ctx.fill();
	draw_canvas_text_flex(text, {x: pos.x + 0.025*canv_h, y: pos.y - 0.025*canv_h - 0.01*canv_h}, "black", 0.9*font_size, align="center");
}

function draw_vertex(coord) {
	
	ctx.beginPath();
	ctx.lineWidth="1";
	ctx.strokeStyle="blue";
	ctx.arc(coord.x,coord.y,5,0,2*Math.PI);
	ctx.stroke();
	ctx.closePath();
	
}

function draw_rect(coord, w, h, color) {
	ctx.beginPath();
	ctx.fillStyle=color;
	ctx.rect(coord.x, coord.y, w, h);
	ctx.fill();
}

function draw_rect_outline(coord, w, h, strokecolor, fillcolor) {
	ctx.beginPath();
	ctx.strokeStyle=strokecolor;
	ctx.fillStyle=fillcolor;
	ctx.rect(coord.x, coord.y, w, h);
	ctx.stroke();
	ctx.fill();
}

function draw_debug_text(string) {
	
	ctx.font = "40px Arial";
	ctx.strokeStyle="red";
	ctx.fillStyle="red";
	ctx.strokeText(string, canvas.width/4, canvas.height/2);
	ctx.fillText(string, canvas.width/4, canvas.height/2); 
	
}

function draw_canvas_text_flex(string, pos, color, size, align="center") {
	
	ctx.font = String(size)+"px Arial";
	ctx.fillStyle=color;
	ctx.textAlign = align; 
	ctx.fillText(string, pos.x, pos.y);
	
}

function draw_canvas_text(string, pos) {
	
	ctx.font = "40px Arial";
	ctx.fillStyle="red";
	ctx.fillText(string, pos.x, pos.y);
	
}

function highlight_cell(cell, color) {
	var w = canv_w/n_cols;
	var h = canv_h/n_rows;
	draw_rect({x: cell.col*w, y: cell.row*h}, w, h, color);
}

function draw_problematic_cells(sec, pc, pcc) {
	
	// pc: problematic_cells
	// pcc: counter
	
	// draw problematic cells if any
	if (pc.length > 0 && pcc < sec*60) {
		for (var i=0; i<pc.length; i++) {
			highlight_cell({col: pc[i].col, row: pc[i].row}, "red");
			// move forward time
			pcc++;
			problematic_cells_counter = pcc;
		}
	}
	// reset if no problems or counter too long
	else {
		// set_values({probcells: [], probcount: 0});
		problematic_cells = [];
		problematic_cells_counter = 0;
	}
	
}

function draw_finished_polys(selectcolor, inactivecolor, list_of_polys, active_poly_ind) {
	
	for (var i=0; i<list_of_polys.length; i++) {
		// draw selected poly orange
		if (i == active_poly_ind) { var color = selectcolor; }
		else { var color = inactivecolor; }
		draw_poly(list_of_polys[i], color);
	}
	
}

function draw_polys_gameplay(color, list_of_polys) {
	
	for (var i=0; i<list_of_polys.length; i++) {
		draw_poly(list_of_polys[i], color);
	}
	
}

function draw_grid_occupancies(grid, color1, color2, color3, color4) {
	
	for (var i=0; i<grid.length; i++) {
		for (var j=0; j<grid[i].length; j++) {
			// if (grid[i][j] == -1) {highlight_cell({col: i, row: j}, color1);}
			if (grid[i][j] == 1) {highlight_cell({col: i, row: j}, color2);}
			else if (grid[i][j] == 2) {highlight_cell({col: i, row: j}, color3);}
			else if (grid[i][j] == 3) {highlight_cell({col: i, row: j}, color4);}
		}
	}
	
}

function draw_active_cells(grid, color) {
	for (var i=0; i<grid.length; i++) {
		for (var j=0; j<grid[i].length; j++) {
			if (grid[i][j] == -1) {highlight_cell({col: i, row: j}, color);}
		}
	}
}

function testdraw_active_lines(color, active_cells_draw) {
	
	for (var i=0; i<active_cells_draw.length; i++) {
		highlight_cell(active_cells_draw[i], color);
	}
	
}

function testdraw_polys_cells(color, list_of_polys_cells) {
	
	for (var i=0; i<list_of_polys_cells.length; i++) {
		for (var j=0; j<list_of_polys_cells[i].length; j++) {
			highlight_cell({col: list_of_polys_cells[i][j].col, row: list_of_polys_cells[i][j].row}, color);
		}
	}
	
}

function testdraw_cell_occupations(linecolor, selectedcolor, inactivecolor, polys_grid_state, active_poly_ind) {
	
	for (var i=0; i<polys_grid_state.length; i++) {
		for (var j=0; j<polys_grid_state[i].length; j++) {
			// active line
			if (polys_grid_state[i][j] == -1) {
				highlight_cell({col: i, row: j}, linecolor);
			}
			if (polys_grid_state[i][j] > 0 && polys_grid_state[i][j] != active_poly_ind+1) {
				highlight_cell({col: i, row: j}, inactivecolor);
			}
			if (polys_grid_state[i][j] > 0 && polys_grid_state[i][j] == active_poly_ind+1) {
				highlight_cell({col: i, row: j}, selectedcolor);
			}
		}
	}
	
}

function draw_active_vertices(active_poly) {
	
	for (var i=0; i<active_poly.length; i++) {
		draw_vertex(active_poly[i]);
	}
	
}

function draw_active_lines(active_poly) {
	
	var lines = lines_from_coords(active_poly, false);
	for (var i=0; i<lines.length; i++) {
		draw_poly(lines[i], "blue");
	}
	
}

function draw_cursor(pic, pos) {
	
	ctx.drawImage(
		pic,
		0,
		0,
		80,
		80,
		pos.x-10,
		pos.y-10,
		20,
		20
	);
	
}

function draw_highscores(pair) {
	set_canvas_bg("black");
	draw_canvas_text_flex("HIGHSCORES", 	{x: canv_w/2, y: canv_h/10}, "white", canv_h/15, align="center");
	var ypos = 2*(canv_h/9);
	for (let index = 0; index < pair.length; index++) {
		var splitted = pair[index].split("|a|");
		draw_canvas_text_flex(String(index+1)+".", 	{x: canv_w/2 - 2*canv_w/5, y: ypos}, "white", canv_h/15, align="left");
		console.log(splitted)
		draw_canvas_text_flex(splitted[0], 		{x: canv_w/2 - canv_w/3, y: ypos}, "white", canv_h/15, align="left");
		draw_canvas_text_flex(splitted[1]+" €", 	{x: canv_w - (canv_w/2 - 2*canv_w/5), y: ypos}, "white", canv_h/15, align="right");
		ypos += canv_h/9;
	}
	draw_canvas_text_flex("Click / tap to try again", 	{x: canv_w/2, y: canv_h - canv_h/10}, "white", canv_h/15, align="center");
}