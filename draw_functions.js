// test: communicate w/ php

var game_state = "choose_mode"; // choose_mode instructions game highscores

function resizeCanvas() {

	if (window.innerWidth/window.innerHeight > 1.78) {
		// too stretched; add PAL bars
		canvas.width = window.innerHeight*1.78;
		canvas.height = window.innerHeight;
	} else if (window.innerWidth/window.innerHeight < 1.4) {
		// too stretched; add PAL bars
		canvas.width = window.innerWidth;
		canvas.height = window.innerWidth/1.4;
	} else {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
	}

    // if (game_state == "game") {
	xscale = canvas.width/canv_w;
	yscale = canvas.height/canv_h;
	ctx.setTransform(xscale, 0, 0, yscale, 0, 0);
    // }
    
}

// inputs: radius, position on canvas and context

// control canvas prints - setup
var canvas = document.getElementById("GameCanvas");
var ctx = canvas.getContext("2d");
resizeCanvas();
var canv_w = canvas.width;
var canv_h = canvas.height;

// var horizontal_screen = true;
// var vertical_screen = false;

// function tilt_canvas() {

// 	if (window.innerHeight > window.innerWidth) {
// 		// tilt to vertical
// 		// canvas.width = window.innerWidth;
// 		// canvas.height = window.innerHeight;
// 		ctx.rotate((90/360)*(2*Math.PI));
// 		ctx.translate(0, -window.innerWidth);
// 		/*
// 		console.log("tilt to vertical")
// 		ctx.rotate((90/360)*(2*Math.PI));
// 		ctx.translate(0, -window.innerWidth);
// 		vertical_screen = true;
// 		horizontal_screen = false;
// 		// */
// 	} else if (window.innerHeight < window.innerWidth) { // vertical_screen
// 		// tilt to horizontal
// 		// canvas.width = window.innerWidth;
// 		// canvas.height = window.innerHeight;
// 		ctx.rotate((0)*(2*Math.PI)); // absolute coordinates
// 		// horizontal_screen = true;
// 		// vertical_screen = false;
// 	}
// }

// // preparing tilt
// if (window.innerHeight > window.innerWidth) {
// 	tilt_canvas();
// 	canv_w = canvas.height;
// 	canv_h = canvas.width;
// }

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
	ctx.lineWidth=Math.max(1, canv_w/500);
	
	ctx.strokeStyle=color;
	ctx.moveTo(coords[0].x, coords[0].y);
	ctx.lineTo(coords[1].x, coords[1].y);
	ctx.stroke();
	ctx.closePath();
}

function draw_path(coords, color, thickness=Math.max(1, canv_w/500)) {
	ctx.beginPath();
	ctx.lineWidth=thickness;
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
	ctx.lineWidth=Math.max(1, canv_w/500);
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
	ctx.lineWidth=Math.max(1, canv_w/200);
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

function draw_textbox(lines, pos, len=1) {
	var w = len*(canv_w/8);
	var h = (canv_w/35)*lines.length + (canv_w/50);

	// center pos
	pos.x -= w/2;
	pos.y -= h/2;

	draw_rect_outline(pos, w, h, "GoldenRod", "Gold");

	var step = canv_w/35;
	var size = canv_w/35;

	for (let index = 0; index < lines.length; index++) {
		const line = lines[index];
		draw_canvas_text_flex(line, {x: pos.x + w/2, y: pos.y + (canv_w/35) + (canv_w/100)}, "DarkViolet", size, align="center");
		pos.y += step;
	}

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
	ctx.lineWidth=Math.max(1, canv_w/200);
	ctx.strokeStyle=strokecolor;
	ctx.fillStyle=fillcolor;
	ctx.rect(coord.x, coord.y, w, h);
	ctx.stroke();
	ctx.fill();
}

function draw_debug_text(string, pos = {x: canvas.width/4, y: canvas.height/2}) {
	
	ctx.font = "40px Arial";
	ctx.strokeStyle="red";
	ctx.fillStyle="red";
	ctx.strokeText(string, pos.x, pos.y);
	ctx.fillText(string, pos.x, pos.y); 
	
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
		draw_canvas_text_flex(splitted[0], 		{x: canv_w/2 - canv_w/3, y: ypos}, "white", canv_h/15, align="left");
		draw_canvas_text_flex(splitted[1]+" €", 	{x: canv_w - (canv_w/2 - 2*canv_w/5), y: ypos}, "white", canv_h/15, align="right");
		ypos += canv_h/9;
	}
	draw_canvas_text_flex("Click / tap to try again", 	{x: canv_w/2, y: canv_h - canv_h/10}, "white", canv_h/15, align="center");
}

function get_color_label(R, G, B, A) {
    return "rgba(" + String(R) + ", " + String(G) + ", " + String(B) + ", " + String(A) + ")";
}

function show_instructions1() {

    set_canvas_bg("black");
	var lines = [
		"In der folgenden Aufgabe sollen Sie in",
		"begrenzter Zeit so viel Geld wie möglich erwirtschaften.",
		"Sie generieren Geld, indem Sie im Büro arbeiten",
		"und genügend Mitarbeiter produktiv sind.",
		"Sie können Mitarbeiter produktiv halten,",
		"indem Sie auf die entsprechenden Türen klicken.",
		"Beachten Sie aber, dass Sie dann für eine",
		"gewisse Zeit nicht im Büro sind.",
		"",
		"- Clicken/Tippen für nächste Seite -"
	]
	var ypos = canv_h/10;
	var step = canv_h/12;
	var size = canv_w/35;
    
    for (let index = 0; index < lines.length; index++) {
        const line = lines[index];
        draw_canvas_text_flex(line, {x: canv_w/2, y: ypos}, "white", size, align="center");
        ypos += step;
    }

}

function show_instructions2() {

	// TODO remove hardcoding of price

    set_canvas_bg("black");
	var lines = [
		"Sobald genügend Geld erwirtschaftet ist",
		"und wenn alle Mitarbeiter produktiv sind,",
		"gibt es Gelegenheiten, das Gebäude zu erweitern",
		"und mehr Mitarbeiter einzustellen.",
		"Die Kosten pro neue Tür belaufen sich auf",
		String(cost_per_door) + " €. Kein Rabatt.",
		"Mehr produktive Mitarbeiter - mehr Geld.",
		"Entscheiden Sie selbst.",
		"",
		"- Clicken/Tippen, um zum Menü zurückzukehren -"
	]
	var ypos = canv_h/10;
	var step = canv_h/12;
	var size = canv_w/35;
    
    for (let index = 0; index < lines.length; index++) {
        const line = lines[index];
        draw_canvas_text_flex(line, {x: canv_w/2, y: ypos}, "white", size, align="center");
        ypos += step;
    }

}

function start_screen(arrows) {
	set_canvas_bg("black");
    var lines = [
            "DAS BESTE(-)SPIEL",
			"",
            "Anleitung",
            "Spiel starten",
        ]
        var ypos = canv_h/5;
        var step = canv_h/7;
        var size = canv_w/30;
    
    for (let index = 0; index < lines.length; index++) {
        const line = lines[index];
        draw_canvas_text_flex(line, {x: canv_w/2, y: ypos}, "white", size, align="center");
        ypos += step;
	}
	
	for (let index = 0; index < arrows.length; index++) {
		const a = arrows[index];
		draw_arrow_flex(a, Math.PI, "white");
	}
}

function draw_arrow(rad) {

	// draw next to bank account display
	var arrow_width = canv_h/10;
	var pos = {x: 0.5*canv_w, y: canv_h/(6*2) + arrow_width/2};

	var middle_coord = {x: pos.x + 0.5*arrow_width, y: pos.y - 0.5*arrow_width};

	// line
	var coords = [];
	var coord2 = rad_to_coord(rad, 0.85*arrow_width);
	coords.push({x: middle_coord.x + coord2.x, 				y: middle_coord.y + coord2.y});
	coords.push({x: pos.x + 0.5*arrow_width,				y: pos.y - 0.5*arrow_width});

	// arrow head
	var coords_poly = [];
	var rad1 = (rad + 0.5*Math.PI)%(2*Math.PI);
	var rad2 = (rad + 1.0*Math.PI)%(2*Math.PI);
	var rad3 = (rad + 1.5*Math.PI)%(2*Math.PI);
	var coord_poly1 = rad_to_coord(rad1, 0.2*arrow_width);
	var coord_poly2 = rad_to_coord(rad2, 0.5*arrow_width);
	var coord_poly3 = rad_to_coord(rad3, 0.2*arrow_width);
	coords_poly.push({x: middle_coord.x + coord_poly1.x, 	y: middle_coord.y + coord_poly1.y});
	coords_poly.push({x: middle_coord.x + coord_poly2.x, 	y: middle_coord.y + coord_poly2.y});
	coords_poly.push({x: middle_coord.x + coord_poly3.x, 	y: middle_coord.y + coord_poly3.y});

	// color is determined by rate
	var rate = get_rate_for_arrow(rad);
	// draw_debug_text(round_digits(rate, 2), {x: pos.x + 200, y: pos.y});
	if (rate > 0) {
		var G = 255;
		var R = Math.round((1 - rate)*255);
	} else {
		var R = 255;
		var G = Math.round((1 - Math.abs(rate))*255);
	}
	var color = get_color_label(R, G, 0, 1);

	// draw with the specs
	draw_path(coords, color, Math.max(1, canv_w/200));
	draw_poly(coords_poly, color);
}

function draw_arrow_flex(pos, rad, color) {

	// draw next to bank account display
	var arrow_width = canv_h/10;

	var middle_coord = {x: pos.x + 0.5*arrow_width, y: pos.y - 0.5*arrow_width};

	// line
	var coords = [];
	var coord2 = rad_to_coord(rad, 0.85*arrow_width);
	coords.push({x: middle_coord.x + coord2.x, 				y: middle_coord.y + coord2.y});
	coords.push({x: pos.x + 0.5*arrow_width,				y: pos.y - 0.5*arrow_width});

	// arrow head
	var coords_poly = [];
	var rad1 = (rad + 0.5*Math.PI)%(2*Math.PI);
	var rad2 = (rad + 1.0*Math.PI)%(2*Math.PI);
	var rad3 = (rad + 1.5*Math.PI)%(2*Math.PI);
	var coord_poly1 = rad_to_coord(rad1, 0.2*arrow_width);
	var coord_poly2 = rad_to_coord(rad2, 0.5*arrow_width);
	var coord_poly3 = rad_to_coord(rad3, 0.2*arrow_width);
	coords_poly.push({x: middle_coord.x + coord_poly1.x, 	y: middle_coord.y + coord_poly1.y});
	coords_poly.push({x: middle_coord.x + coord_poly2.x, 	y: middle_coord.y + coord_poly2.y});
	coords_poly.push({x: middle_coord.x + coord_poly3.x, 	y: middle_coord.y + coord_poly3.y});

	// draw with the specs
	draw_path(coords, color, Math.max(1, canv_w/200));
	draw_poly(coords_poly, color);
}