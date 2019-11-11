function switch_0_1(num) {
	if (num == 1) { return 0; } else { return 1; }
}

function multi_append(inlist, appendlist) {
	
	for (var i=0; i<appendlist.length; i++) {
		inlist.push(appendlist[i]);
	}
	return inlist;
	
}

function append_cells_avoid_doubles(clist, appendclist) {
	
	for (var i=0; i<appendclist.length; i++) {
		if (!cell_in_cells(appendclist[i], clist)) {
			clist.push(appendclist[i]);
		}
	}
	return clist;
	
}

function sort_vertical_intersections(inters) {
	return inters.sort(function(a,b){return a.y - b.y});
}

function getXY(e) {
	
	// return rounded position according to grid, not actual coordinates
	
	var x = mouse_pos_relative_to_canvas(e).x;
	var y = mouse_pos_relative_to_canvas(e).y;
	return create_vertex_pos(x, y);
	
}

function getXY_exact(e, xscale=1, yscale=1) {
	
	// return exact position relative to canvas (for physics)
	if (canvas.height > canvas.width) {
		var x_exact = mouse_pos_relative_to_canvas(e).y;
		var y_exact = canvas.width - mouse_pos_relative_to_canvas(e).x;
	} else {
		var x_exact = mouse_pos_relative_to_canvas(e).x;
		var y_exact = mouse_pos_relative_to_canvas(e).y;
	}
	
	var return_x = x_exact/xscale;
	var return_y = y_exact/yscale;

	// mind that canvas is transformed (translated) in css

	return_x += canv_w/2;
	return_y += canv_h/2;
	// return_x += window.innerHeight/2;
	// return_y += window.innerWidth/2;
	return {x: return_x, y: return_y};
	
}

function initialize_grid(n_cols, n_rows) {
	var polys_grid_state = [];
	for (var i=0; i<n_cols; i++) {
		polys_grid_state.push([]);
		// filling with zeros
		for (var j=0; j<n_rows; j++) {
			polys_grid_state[polys_grid_state.length-1].push(0);
		}
	}
	return polys_grid_state;
}

function mouse_pos_relative_to_canvas(e) {
	
	var xval = e.clientX - canvas.offsetLeft;
	var yval = e.clientY - canvas.offsetTop;
	return {x: xval, y: yval};
	
}

function pos_to_cells(pos) {
	
	// output: coordinates that are occupied
	output = [];
	to_be_tested = [];
	
	px_per_col = canv_w/n_cols;
	px_per_row = canv_h/n_rows;
	
	to_be_tested.push({col: Math.round(pos.x/px_per_col) -1, row: Math.round(pos.y/px_per_row) -1});
	to_be_tested.push({col: Math.round(pos.x/px_per_col) -1, row: Math.round(pos.y/px_per_row)});
	to_be_tested.push({col: Math.round(pos.x/px_per_col), row: Math.round(pos.y/px_per_row) -1});
	to_be_tested.push({col: Math.round(pos.x/px_per_col), row: Math.round(pos.y/px_per_row)});
	
	for (var i=0; i<to_be_tested.length; i++) {
		// careful: add padding, otherwise filled cells around lines/polys out of bounds
		if (to_be_tested[i].col > 0 && to_be_tested[i].col < n_cols - 1 && to_be_tested[i].row > 0 && to_be_tested[i].row < n_rows - 1) {
			output.push(to_be_tested[i]);
		}
	}
	
	return output;
	
}

function pos_to_cells_random(pos) {
	// assuming pos can be between grid lines (not snapped to grid)
	
	// output: coordinates that are occupied
	output = [];
	to_be_tested = [];
	
	var px_per_col = canv_w/n_cols;
	var px_per_row = canv_h/n_rows;
	var halfy = px_per_row/2;
	
	// special case: exactly in middle, then not two coords
	if ((pos.y - halfy) % px_per_row == 0) {
		to_be_tested.push({col: Math.round(pos.x/px_per_col) -1, row: Math.round(pos.y/px_per_row) -1});
	} else {
		to_be_tested.push({col: Math.round(pos.x/px_per_col) -1, row: Math.round(pos.y/px_per_row) -1});
		to_be_tested.push({col: Math.round(pos.x/px_per_col) -1, row: Math.round(pos.y/px_per_row)});
	}
	
	// to_be_tested.push({col: Math.round(pos.x/px_per_col), row: Math.round(pos.y/px_per_row) -1});
	// to_be_tested.push({col: Math.round(pos.x/px_per_col), row: Math.round(pos.y/px_per_row)});
	
	for (var i=0; i<to_be_tested.length; i++) {
		if (to_be_tested[i].col >= 0 || to_be_tested[i].col < n_cols || to_be_tested[i].row >= 0 || to_be_tested[i].row < n_rows) {
			output.push(to_be_tested[i]);
		}
	}
	
	return output;
	
}

function keep_col_val_equal(cell_list, colval) {
	var cells_correct_col = [];
	for (var i=0; i<cell_list.length; i++) {
		cells_correct_col.push({col: colval, row: cell_list[i].row});
	}
	return cells_correct_col;
}

function get_vertical_cells_string(line) {
	
	var px_per_col = canv_w/n_cols;
	var px_per_row = canv_h/n_rows;
	var halfx = px_per_col/2;
	var halfy = px_per_row/2;
	
	//TODO issue: sometimes x coord not correct
	
	var all_cells = [];
	// get the x coordinate (always the same)
	var colcell = pos_to_cell(line[0]).col;
	var first_cells = pos_to_cells_random(line[0]);
	// take care that random function does not mess up x
	first_cells_correct_col = keep_col_val_equal(first_cells, colcell);
	// append first cells
	all_cells = multi_append(all_cells, first_cells_correct_col);
	// snap to between grid
	var first_step = 1.5*px_per_row - line[0].y % px_per_row;
	var ycoord = line[0].y + first_step;
	var snd_cells = pos_to_cells_random({x: line[0].x, y: ycoord});
	// take care that random function does not mess up x
	snd_cells_correct_col = keep_col_val_equal(snd_cells, colcell);
	// append
	all_cells = append_cells_avoid_doubles(all_cells, snd_cells_correct_col);
	// loop from p1 snapped between grid to p2 until > line
	for (var posy=ycoord; posy<line[1].y; posy += px_per_row) {
		var third_cells = [pos_to_cell({x: line[0].x, y: posy})];
		// take care that random function does not mess up x
		third_cells_correct_col = keep_col_val_equal(third_cells, colcell);
		all_cells = append_cells_avoid_doubles(all_cells, third_cells_correct_col);
	}
	// last cells
	var last_cells = pos_to_cells_random({x: line[0].x, y: line[1].y});
	// take care that random function does not mess up x
	last_cells_correct_col = keep_col_val_equal(last_cells, colcell);
	all_cells = append_cells_avoid_doubles(all_cells, last_cells_correct_col);
	
	// return the finished list
	return all_cells
	
}

function pos_to_cell(pos) {
	
	// pos exactly between grid lines --> only one solution
	
	var px_per_col = canv_w/n_cols;
	var px_per_row = canv_h/n_rows;
	var halfx = px_per_col/2;
	var halfy = px_per_row/2;
	
	// x
	var colcell = (pos.x - halfx)/px_per_col;
	// y
	var rowcell = (pos.y - halfy)/px_per_row;
	return {col: colcell, row: rowcell};
	
}

function pos_list_to_cell_list(pos_list) {
	
	// assuming always one solution per pos!
	
	output = [];
	
	for (var i=0; i<pos_list.length; i++) {
		output.push(pos_to_cell(pos_list[i]));
	}
	
	return output;
	
}

function line_to_grid_cells(line) {
	
	// output: coordinates that are occupied
	output = [];
	
	px_per_col = canv_w/n_cols;
	px_per_row = canv_h/n_rows;
	
	var aabb_inds = aabb_cells_from_line(line);
	
	for (var i=aabb_inds[0].col; i<=aabb_inds[1].col; i++) {
		for (var j=aabb_inds[0].row; j<=aabb_inds[1].row; j++) {
			var lower_bound = {x: px_per_col*i, y: px_per_row*j};
			var upper_bound = {x: px_per_col*i + px_per_col, y: px_per_row*j + px_per_row};
			if (line_in_cell(line, lower_bound, upper_bound)) {
				output.push({col: i, row: j});
			}
		}
	}
	
	return output;
}

function is_inside_canvas(e) {
	
	var x = mouse_pos_relative_to_canvas(e).x;
	var y = mouse_pos_relative_to_canvas(e).y;
	
	if (x < 0 || x > canv_w || y < 0 || y > canv_h) {
		return false;
	}
	
	return true;
	
}

function create_vertex_pos(x, y) {
	 
	px_per_col = canv_w/n_cols;
	px_per_row = canv_h/n_rows;
	
	// index of line in grid
	var x_ind = Math.round(x / px_per_col);
	var y_ind = Math.round(y / px_per_row);
	
	// find rounded pos
	var x_ind_in_pos = px_per_col * x_ind;
	var y_ind_in_pos = px_per_row * y_ind;
	
	// make vertex object
	var vertex = {
		x: x_ind_in_pos,
		y: y_ind_in_pos
	}
	return vertex;
	
}

function lines_from_coords(coords, is_closed) {
	var lines = [];
	for (v_ind = 0; v_ind < coords.length - 1; v_ind++) {
		lines.push([coords[v_ind], coords[v_ind+1]]);
	}
	
	// close path if verts are finished
	if (is_closed) {
		lines.push([coords[0], coords[coords.length-1]]);
	}
	return lines;
}

function slope(line) {
	// special case: vertical
	if (line[0].x == line[1].x) {
		return Infinity;
	}
	// normal slope formula
	return ((line[1].y - line[0].y) / (line[1].x - line[0].x));
}

function intercept(line) {
	// special case: vertical
	if (slope(line) == Infinity) {
		// on y axis
		if (line[0].x == 0) { return Infinity; }
		// not on y axis
		else { return NaN; }
	}
	// not vertical --> one solution
	return line[0].y - slope(line) * line[0].x;
}

function line_line_inters(line1, line2) {
	// special case: parallel
	if (slope(line1) == slope(line2)) {
		// differentiate zero or infinity intersections
		if (intercept(line1) == intercept(line2)) { return Infinity; }
		else { return NaN; }
	}
	// special case: one line is vertical
	if (slope(line1) == Infinity) {
		// special case within special case: other line has slope 0
		if (slope(line2) == 0) {
			return {x: line1[0].x, y: line2[0].y};
		}
		yi = slope(line2)*line1[0].x + intercept(line2);
		xi = (yi - intercept(line2))/slope(line2);
		return {x: xi, y: yi};
	}
	if (slope(line2) == Infinity) {
		// special case within special case: other line has slope 0
		if (slope(line1) == 0) {
			return {x: line2[0].x, y: line1[0].y};
		}
		yi = slope(line1)*line2[0].x + intercept(line1);
		xi = (yi - intercept(line1))/slope(line1);
		return {x: xi, y: yi};
	}
	// otherwise: always one solution
	yi = ((line2[0].y - intercept(line2))/slope(line2))*slope(line1) + intercept(line1);
	xi = (yi - intercept(line1))/slope(line1);
	return {x: xi, y: yi};
	
}

function lineseg_lineseg_inters(line1, line2) {
	
	// first check if aabbs overlap
	aabb1 = aabb_from_coords(line1);
	aabb2 = aabb_from_coords(line2);
	// no intersection if aabbs do not overlap
	if (!overlap_2_dim(aabb1, aabb2)) { return NaN; }
	else { return line_line_inters(line1, line2); }
	
}

function order_2_vals(val1, val2) {
	if (val1 < val2) { sv = val1; lv = val2 } else { sv = val2; lv = val1; }
	return [sv, lv];
}

// keep the y value attached to the same x --> returns line
function order_line_by_x(line) {
	if (line[0].x < line[1].x) {
		new_line = [{x: line[0].x, y: line[0].y}, {x: line[1].x, y: line[1].y}];
	} else {
		new_line = [{x: line[1].x, y: line[1].y}, {x: line[0].x, y: line[0].y}];
	}
	return new_line;
}

// return new line within specified x range
function bound_line_horizontal(line, lowerb, upperb) {
	// make sure x1 < x2
	ordered_l = order_line_by_x(line);
	p1 = {};
	p2 = {};
	// special cases first: smaller as bounds
	if (ordered_l[0].x > lowerb) { p1.x = ordered_l[0].x; p1.y = ordered_l[0].y; }
	else {
		lowerb_line = [{x: lowerb, y: 0}, {x: lowerb, y:canv_h}];
		p1 = line_line_inters(ordered_l, lowerb_line);
	}
	if (ordered_l[1].x < upperb) { p2.x = ordered_l[1].x; p2.y = ordered_l[1].y; }
	else {
		upperb_line = [{x: upperb, y: 0}, {x: upperb, y:canv_h}];
		p2 = line_line_inters(ordered_l, upperb_line);
	}
	return [p1, p2];
}

function aabb_from_line(line) {
	// return sorted values (2 coordinates)
	sortx = order_2_vals(line[0].x, line[1].x)
	sorty = order_2_vals(line[0].y, line[1].y)
	return [{x: sortx[0], y: sorty[0]}, {x: sortx[1], y: sorty[1]}];
}

function aabb_from_coords(coords) {
	// return sorted values (2 coordinates)
	// append all x values together
	x_vals = [];
	for (var i=0; i<coords.length; i++) {
		x_vals.push(coords[i].x);
	}
	// append all y values together
	y_vals = [];
	for (var i=0; i<coords.length; i++) {
		y_vals.push(coords[i].y);
	}
	var sortx = [Math.min(...x_vals), Math.max(...x_vals)];
	var sorty = [Math.min(...y_vals), Math.max(...y_vals)];
	return [{x: sortx[0], y: sorty[0]}, {x: sortx[1], y: sorty[1]}];
}

function aabb_cells_from_line(line) {
	// order according to AABB conventions
	var ordered_coords = aabb_from_line(line);
	
	var px_per_col = canv_w/n_cols;
	var px_per_row = canv_h/n_rows;
	
	var sx = Math.round(ordered_coords[0].x / px_per_col) - 1;
	var sy = Math.round(ordered_coords[0].y / px_per_row) - 1;
	var lx = Math.round(ordered_coords[1].x / px_per_col);
	var ly = Math.round(ordered_coords[1].y / px_per_row);
	return [{col: sx, row: sy}, {col: lx, row: ly}];
}

// check if there's overlap in 2 1-dimensional segments --> bool
function overlap_1_dim(s11, s12, s21, s22) {
	// make sure vals are sorted
	sorted_s1 = order_2_vals(s11, s12);
	sorted_s2 = order_2_vals(s21, s22);
	// no overlap if any larger value is smaller as the other's smaller value
	if (sorted_s1[1] < sorted_s2[0]) { return false; }
	if (sorted_s2[1] < sorted_s1[0]) { return false; }
	// otherwise: overlap
	return true;
}

function overlap_2_dim(aabb1, aabb2) {
	// there must be overlap in both dims for return to be true
	// check in 1st dim
	overlap_1st = overlap_1_dim(aabb1[0].x, aabb1[1].x, aabb2[0].x, aabb2[1].x);
	// check in 2nd dim
	overlap_2nd = overlap_1_dim(aabb1[0].y, aabb1[1].y, aabb2[0].y, aabb2[1].y);
	if (!overlap_1st || !overlap_2nd) { return false; }
	else { return true; }
}

function line_in_cell(line, lowerb, upperb) {
	// inputs: line (2 coords), bounds of cell (lower and upper, each 1 coord)
	// output: bool
	
	// special case: horizontal
	if (slope(line) == 0) {
		if (line[0].y >= lowerb.y && line[0].y <= upperb.y) { return true; } else { return false; }
	}
	// special case: vertical
	if (slope(line) == Infinity) {
		if (line[0].x >= lowerb.x && line[0].x <= upperb.x) { return true; } else { return false; }
	}
	
	// else
	// get vertical intersection limits
	x_bounded_line = bound_line_horizontal(line, lowerb.x, upperb.x);
	// check overlap in other dimension
	if (overlap_1_dim(lowerb.y, upperb.y, x_bounded_line[0].y, x_bounded_line[1].y)) {
		return true;
	} else { return false; }
	
}

function aabb_from_cell_inds(cell_inds) {
	// append all col_ind values together
	col_inds = [];
	for (var i=0; i<cell_inds.length; i++) {
		col_inds.push(cell_inds[i].col);
	}
	// append all row_ind values together
	row_inds = [];
	for (var i=0; i<cell_inds.length; i++) {
		row_inds.push(cell_inds[i].row);
	}
	s_col = Math.min(...col_inds);
	l_col = Math.max(...col_inds);
	s_row = Math.min(...row_inds);
	l_row = Math.max(...row_inds);
	return [{col: s_col, row: s_row}, {col: l_col, row: l_row}];
}

function get_inds_around_vertex(pos) {
	// return 1, 2 or 3 cells (depending whether on edge)
	output = [];
	
	var px_per_col = canv_w/n_cols;
	var px_per_row = canv_h/n_rows;
	
	var sx = Math.round(pos.x / px_per_col) - 1;
	var sy = Math.round(pos.y / px_per_row) - 1;
	var lx = Math.round(pos.x / px_per_col);
	var ly = Math.round(pos.y / px_per_row);
	
	// catch case when outside canvas
	if (sx < 0 || lx >= n_cols || sy < 0 || ly >= n_rows) { return output; }
	
	output.push({col: sx, row: sy});
	output.push({col: sx, row: ly});
	output.push({col: lx, row: sy});
	output.push({col: lx, row: ly});
	
	return output;
}

function cell_from_coord_diff(coord_diff) {
	
	// input dimensions: x and y values
	// output dimensions: col and row values
	// both are differences, not absolute values
	
	var px_per_col = canv_w/n_cols;
	var px_per_row = canv_h/n_rows;
	
	var col_i = coord_diff.x / px_per_col;
	var row_i = coord_diff.y / px_per_row;
	
	return {col: col_i, row: row_i};
	
}

function apply_coord_diff(coords, diff) {
	var new_coords = [];
	for (var i=0; i<coords.length; i++) {
		var new_coord = {x: -1, y: -1};
		new_coord.x = coords[i].x - diff.x;
		new_coord.y = coords[i].y - diff.y;
		new_coords.push(new_coord);
	}
	return new_coords;
}

function apply_cell_diff(cells, diff) {
	var	new_cells = [];
	for (var i=0; i<cells.length; i++) {
		var new_cell = {col: -1, row: -1};
		new_cell.col = cells[i].col - diff.col;
		new_cell.row = cells[i].row - diff.row;
		new_cells.push(new_cell);
	}
	return new_cells;
}

function aabb_cell_within_canvas(aabb) {
	
	// assumes no scrolling
	if (aabb[0].col < 0 || aabb[0].row < 0) { return false; }
	if (aabb[1].col >= n_cols || aabb[1].row >= n_rows) { return false; }
	
	// no problems:
	return true;
	
}

function first_cell_from_dir(cell_string, dir) {
	// dir: 'f' ||'b' (forward, backward)
	
}

function get_dirs_from_celldiff(celldiff) {
	
	var dirs = [];
	
	// positive: leftwards or upwards
	// negative: rightwards or downwards
	if (celldiff.row > 0) { dirs.push('t') };
	if (celldiff.row < 0) { dirs.push('b') };
	if (celldiff.col > 0) { dirs.push('l') };
	if (celldiff.col < 0) { dirs.push('r') };
	
	return dirs;
	
}

function inverse_dirs(dirs) {
	
	var inv_dirs = [];
	
	// handy function for collision detection
	for (var i=0; i<dirs.length; i++) {
		if (dirs[i] == 'l') { inv_dirs.push('r'); }
		if (dirs[i] == 'r') { inv_dirs.push('l'); }
		if (dirs[i] == 't') { inv_dirs.push('b'); }
		if (dirs[i] == 'b') { inv_dirs.push('t'); }
	}
	
	return inv_dirs;
	
}

function inds_from_dirs(dirs) {
	var dirs_inds = [];
	var dirs_labels = ['l','t','r','b'];
	for (var h=0; h<dirs.length; h++) {
		for (var i=0; i<dirs_labels.length; i++) {
			if (dirs[h] == dirs_labels[i]) { dirs_inds.push(i); }
		}
	}
	return dirs_inds;
}

function cells_overlap(cells_o, cells_s) {
	
	// similar cells
	var sim_cells = [];
	
	// compare each cell with any other
	for (var i=0; i<cells_o.length; i++) {
		for (var j=0; j<cells_s.length; j++) {
			if (cells_o[i].row == cells_s[j].row && cells_o[i].col == cells_s[j].col) {
				sim_cells.push(cells_o[i]);
			}
		}
	}
	
	return sim_cells;
	
}

function get_cells_from_dir(cells, dir, grid, ind) {
	// returns a subset of cells --> only the first reached from a certain direction
	// dir: one letter ('l', 'r', 't', 'b')
	// ind: what is searched
	// each col ('t' || 'b') or each row ('l', 'r'):
	// each loop: return element that is first reached
	
	// output variable:
	var cells_from_dir = [];
	
	// problem: cells as input not ordered: needs complete grid w/ AABB
	// derive aabb
	aabb = aabb_from_cell_inds(cells);
	
	// case distinctions: l/r --> outer loop over rows, inner over cols (vice versa for t/b)
	if (dir == 'l' || dir == 't') {
		var start_i = aabb[0]; // 'i' for inner
		var end_i = aabb[1];
		var step = 1; // increments
		// var subtr = 0; // normally forward
	} else { // 'r' or 'b' (search is backwards)
		var start_i = aabb[1]; // 'i' for inner
		var end_i = aabb[0];
		var step = -1; // decrements
	}
	if (dir == 'l' || dir == 'r') {
		var start_il = start_i.col;		// 'l' for loop - running out of naming ideas...
		var end_il = end_i.col;
		var start_ol = aabb[0].row;
		var end_ol = aabb[1].row;
	} else { // 'b' or 't' (search is vertical)
		var start_il = start_i.row;		// 'l' for loop - running out of naming ideas...
		var end_il = end_i.row;
		var start_ol = aabb[0].col;
		var end_ol = aabb[1].col;
	}
	
	// putting it together
	for (var i=start_ol; i<=end_ol; i++) {
		var found = false;
		// distinction between increments and decrements
		// makes it a bit more verbose...
		if (dir == 'l' || dir == 't') { // forward
			for (var j=start_il; j<=end_il; j+=step) {
				// also distinct between what dimension i and j refer to
				if (dir == 'l') {var coli = j; var rowi = i;} else {var coli = i; var rowi = j;}
				if (grid[coli][rowi] == ind && !found) {
					// break the inner loop and append to output var
					cells_from_dir.push({col: coli, row: rowi});
					found = true;
				}
			}
		} else { // backward
			for (var j=start_il; j>=end_il; j+=step) {
				// also distinct between what dimension i and j refer to
				if (dir == 'r') {var coli = j; var rowi = i;} else {var coli = i; var rowi = j;}
				if (grid[coli][rowi] == ind && !found) {
					// break the inner loop and append to output var
					cells_from_dir.push({col: coli, row: rowi});
					found = true;
				}
			}
		}
		
	}
	
	return cells_from_dir;
	
}
	
function get_all_edges(new_cells) {
	
	var new_edges = [];
	for (var i=0; i<dirs_labels.length; i++) {
		var edge = get_cells_from_dir(new_cells, dirs_labels[i], polys_grid_state, list_of_polys.length);
		new_edges.push(edge);
	}
	return new_edges;
	
}

function gradual_diff_list(diff_cells) {
	// returns list with diff values until both diff in both dims is zero
	var output = [];
	// append the starting difference (making a copy of object is necessary...)
	output.push({col: diff_cells.col, row: diff_cells.row});
	var remain_diff = diff_cells;
	var current_turn = 'col';
	if (diff_cells.row < 0) {var rdir = 1;} else {var rdir = -1;}
	if (diff_cells.col < 0) {var cdir = 1;} else {var cdir = -1;}
	while (remain_diff.row != 0 || remain_diff.col != 0) {
		if (current_turn == 'col') {
			// only remove from diff if there is diff
			if (remain_diff.col != 0) {
				remain_diff.col += cdir;
				current_turn = 'row';
			// if no diff: other dimension must have it
			} else {
				remain_diff.row += rdir;
			}
		} else {
			// only remove from diff if there is diff
			if (remain_diff.row != 0) {
				remain_diff.row += rdir;
				current_turn = 'col';
			// if no diff: other dimension must have it
			} else {
				remain_diff.col += cdir;
			}
		}
		// append to list
		var append_cell_diff = remain_diff;
		output.push({col: remain_diff.col, row: remain_diff.row});
	}
	
	return output;
	
}
	
function cell_to_coord(cell) {
	
	var px_per_col = canv_w/n_cols;
	var px_per_row = canv_h/n_rows;
	
	return {x: cell.col*px_per_col, y: cell.row*px_per_row};
	
}

// TODO: figure out problem: not always correctly filled!
function fill_poly(coords, poly_grid_state) {
	// search col by col
	// fill search area constrained by aabb cells
	var aabb_line = aabb_from_coords(coords);
	var aabb = aabb_cells_from_line(aabb_line);
	var all_cells = [];
	// loop through every cell in aabb
	for (var i=aabb[0].col; i<=aabb[1].col; i++) {
		// reset values
		var col_active = false;
		var collected_string = [];
		for (var j=aabb[0].row; j<=aabb[1].row; j++) {
			// start detected
			if (poly_grid_state[i][j] == -1) {
				col_active = true;
				// append the boundary cells
				all_cells.push({col: i, row: j});
			}
			// empty after "switched on": start to fill up string
			// if no end detected: list gets emptied at next iteration
			if (col_active && poly_grid_state[i][j] == 0) { // first empty cell detected --> collect
				collected_string.push({col: i, row: j});
			}
			// end detected: fill with collected cells
			if (col_active && poly_grid_state[i][j] == -1 && collected_string.length > 0) {
				col_active = false;
				// append the collected cells to all cells
				for (var k=0; k<collected_string.length; k++) {
					all_cells.push(collected_string[k]);
				}
				collected_string = [];
			}
		}
	}
	
	return all_cells;
	
}

function cell_in_cells(cell, cells) {
	// detects if certain cell is in list of cells
	for (var i=0; i<cells.length; i++) {
		if (cell.col == cells[i].col && cell.row == cells[i].row) {
			return true;
		}
	}
	// if (cells.indexOf(cell) >= 0) {
		// return true;
	// }
	return false;
}

function lines_to_grid_cells(coords, is_closed) {
	// return var
	var all_cells = [];
	// make the lines
	var all_lines = lines_from_coords(coords, is_closed);
	for (var i=0; i<all_lines.length; i++) {
		// find cells for one line
		var cells = line_to_grid_cells(all_lines[i]);
		// append
		append_cells_avoid_doubles(all_cells, cells);
	}
	return all_cells;
}

// TODO does not operate correctly with vertical concave parts
function fill_coords(coords) {
	//TODO avoid double cells
	
	// get aabb from coords
	var aabb_coords = aabb_from_coords(coords);
	var aabb = aabb_cells_from_line(aabb_coords);
	// get all line cells
	var line_cells = lines_from_coords(coords, true);
	// output list
	var all_cells = [];
	// convert coords to cells!
	// first get list of lines
	var lineslist = lines_from_coords(coords);
	// loop over each line and push to cells variable
	var cells = [];
	for (var i=0; i<lineslist.length; i++) {
		var linecells = line_to_grid_cells(lineslist[i]);
		for (var j=0; j<linecells.length; j++) {
			cells.push(linecells[j]);
		}
	}
	// check each col iteratively
	for (var i=aabb[0].col; i<=aabb[1].col; i++) {
		// reset values at beginning of each col
		var col_active = false; // start detected
		var collected_string = []; // collect all found cells in col
		// loop through each row
		for (var j=aabb[0].row; j<=aabb[1].row; j++) {
			// start detected
			if (cell_in_cells({col: i, row: j}, cells)) {
				col_active = true;
				// append the boundary cells
				all_cells.push({col: i, row: j});
			}
			// empty after "switched on": start to fill up list
			// if no end detected: list gets emptied at next iteration
			if (col_active && !cell_in_cells({col: i, row: j}, cells)) { // first empty cell detected --> collect
				collected_string.push({col: i, row: j});
			}
			// end detected: fill with collected cells
			if (col_active && cell_in_cells({col: i, row: j}, cells) && collected_string.length > 0) {
				col_active = false;
				// append the collected cells to all cells
				for (var k=0; k<collected_string.length; k++) {
					all_cells.push(collected_string[k]);
				}
				// empty the list after filling up
				collected_string = [];
			}
		}
	}
	// return resulting list
	return all_cells;	
}

function fill_poly_from_coords(coords) {
	
	// return variable
	var all_cells = []; // the actual cells
	// /*
	// returns all the cells
	// grid conversion variables
	px_per_col = canv_w/n_cols;
	halfx = px_per_col/2;
	px_per_row = canv_h/n_rows;
	halfy = px_per_row/2;
	// get aabb of coords
	var aabb_coords = aabb_from_coords(coords);
	// loop over each column
	var xstart = aabb_coords[0].x + halfx;
	var xstep = px_per_col;
	for (var posx = xstart; posx+halfx<=aabb_coords[1].x; posx += xstep) {
		////////// PART 1: find intersections ///////////
		// create two points of vertical line at posx
		var p1 = {x: posx, y: aabb_coords[0].y - halfy};
		var p2 = {x: posx, y: aabb_coords[1].y + halfy};
		// create the line
		var current_line = [p1, p2];
		// find the intersections with poly lines
		var all_inters = []; // list to append to
		var all_lines = lines_from_coords(coords, false);
		// loop through all the lines of poly
		for (var i=0; i<all_lines.length; i++) {
			var inters = lineseg_lineseg_inters(all_lines[i], [p1, p2]);
			// append if there is intersection with poly line
			if (inters.x != undefined) {
				all_inters.push(inters);
			}
		}
		////////// PART 2: find cells given the intersections ///////////
		var fill_line = []; // line with coordinates (start-end)
		// sort intersections (because looping through lines of poly does not sort intersections)
		all_inters = sort_vertical_intersections(all_inters);
		// loop through all intersections
		for (var i=0; i<all_inters.length; i++) {
			fill_line.push(all_inters[i]);
			// line completed:
			if (fill_line.length == 2) {
				var cells_line = get_vertical_cells_string(fill_line);
				fill_line = [];
				// fill into list of all_cells
				for (var j=0; j<cells_line.length; j++) {
					all_cells.push(cells_line[j]);
				}
			}
		}
	}
	// */
	////////// LAST PART: append the edges of poly! ///////////
	var last_cells = lines_to_grid_cells(coords, false); // is not closed because last vert already doubled
	all_cells = append_cells_avoid_doubles(all_cells, last_cells);
	// round all cells!
	var rounded_cells = [];
	for (var i=0; i<all_cells.length; i++) {
		// make sure to round
		var cell = {col: Math.round(all_cells[i].col), row: Math.round(all_cells[i].row)};
		rounded_cells.push(cell);
	}
	// return cells
	return rounded_cells;
}

function set_ball_opts(p, r, id) {
	opt = {};
	opt.p = p;
	opt.v = {x:0, y:0};
	opt.a = {x:0, y:0};
	opt.r = r;
	opt.mass = r*10;
	opt.id = id;
	opt.sim_time_remaining = 0.0;
	return opt;
}

function rad_to_coord(rad, distance) {
    var x_val = Math.cos(rad)*distance;
    var y_val = Math.sin(rad)*distance;
    return {x: x_val, y: y_val};
}

function sigmoid(input, mid, max, rate) {
	// TODO don't understand whether formula is wrong or understanding insufficient
	var nominator = max;
	var denominator = 1 + Math.exp(-rate*(input - mid));
	return nominator/denominator;
}

function get_rate(input, min, max) {
	if (input < min) {
		return -1;
	} else if (input > max) {
		return 1;
	} else {
		// assuming that min = -max!
		return input/max;
		// var diff = max - min;
		// return (2/diff)*input - (2/diff)*min - 1;
	}
}

function round_digits(input, decimals) {
    return Math.round(input*(decimals*10))/(decimals*10);
}

function get_rad_for_arrow(rate) {
	var rad = rate/2;
	rad *= -1;
	rad += 1;
	rad *= Math.PI;
	return rad;
}

function get_rate_for_arrow(rad) {
	var rate = rad/Math.PI;
	rate -= 1;
	rate /= -1;
	return rate*2;
}

function get_distance(pos1, pos2) {
	// pythagoras' theorem
	var len_x = pos2.x - pos1.x;
	var len_y = pos2.y - pos1.y;
	return Math.sqrt(len_x*len_x + len_y*len_y);
}