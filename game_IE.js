"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _instanceof(left, right) { if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) { return !!right[Symbol.hasInstance](left); } else { return left instanceof right; } }

function _classCallCheck(instance, Constructor) { if (!_instanceof(instance, Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

// initialization - setup global vars
var game_state = "choose_mode"; // choose_mode instructions1 instructions2 game highscores

var hover_arrows_menu = [];
var best_five_array; // for highscores
// game-feel, not game-play related

var n_steps_in_tread = 6;
var slogans_enabled = true; // for safety reasons possible to switch it off...

var slogans = ["Mir platzt gleich der Arsch", "HÖMMA!", "Das müssen wir jetzt sofort klären, SOFORT!", "Da krieg ich Puls!"];
var curse_dur = 2.5; // speech bubble visibility in seconds

var xscale = 1;
var yscale = 1; // gameplay-relevant parameters

var cost_per_door = 60000;
var time_left; // 3.5 minutes seem realistic

var n_floors;
var n_offices_per_floor;
var floor_height;
var money; // realistic start: 500000

var min_awake_dur;
var max_awake_dur;
var walk_speed;
var cost_of_sleep_per_person_per_frame; // careful: time in frames, not seconds

var boss_productivity_per_person_per_frame; // gain of money

var scare_tolerance; // how near can coworkers come to boss to not be scared?

var door_check_dur; // seconds to wait in front of each door

var stairway_w;
var hallway_w; // physics

var goal_tolerance; // never smaller than 0.5*walk_speed! left and right of goal
// containers and class instances (objects)

var coworkers;
var new_coworkers; // in case of upgrade: differentiate between old and new coworkers
// because identity of new coworkers must be defined first

var stories;
var doors;
var doors_path; // gets emptied when a door is reached

var boss_door; // has special properties (or rather reduced functions)

var boss; // gets instantiated in Story class (already placed in correct door :)

var grass; // vars that keep track of game states

var current_pos;
var startTime;
var endTime, secondsElapsed;
var skycolor = "blue"; // add event listeners
// document.addEventListener("mousemove", mousemove);

document.addEventListener("mousedown", mousedown);
document.addEventListener("mousemove", mousemove);
document.addEventListener("touchstart", tapped); // TODO: find out whether single quotes necessary here

window.addEventListener('orientationchange', resizeCanvas, false);
window.addEventListener('resize', resizeCanvas, false); // classes

var Text =
/*#__PURE__*/
function () {
  function Text(label, pos) {
    _classCallCheck(this, Text);

    this.label = label;
    this.pos = pos; // {x: 0, y: 0};

    this.color = "white";
    this.size = 10; // start really small!

    this.val = 0;

    if (isNumber(label)) {
      this.val = label;
    }

    this.align = "center";
  }

  _createClass(Text, [{
    key: "render",
    value: function render() {
      draw_canvas_text_flex(this.label, this.pos, this.color, this.size, this.align);
    }
  }]);

  return Text;
}();

var Opportunity =
/*#__PURE__*/
function () {
  function Opportunity(type) {
    _classCallCheck(this, Opportunity);

    this.type = type;
    this.horizontal_lines = 1;
    this.vertical_lines = 1;
    this.worth = 0;

    if (this.type == "door") {
      this.vertical_lines = 3; // get x position

      var x_pos = building.stairway2_start_x + building.stairway_width + canv_w / 12; // get y position

      var start_y = canv_h - building.building_height - 0.5 * grass.height;
      var end_y = start_y + building.building_height;
      var y_pos = start_y + (end_y - start_y) / 2;
      this.worth = building.n_floors * cost_per_door;
    }

    if (this.type == "floor") {
      this.horizontal_lines = 3; // get x position

      var x_pos = canv_w / 2; // get y position

      var y_pos = canv_h - building.building_height - 0.5 * grass.height - canv_h / 40 - canv_h / 25;
      this.worth = n_offices_per_floor * cost_per_door;
    }

    this.w = this.horizontal_lines * (canv_w / 8);
    this.h = canv_w / 35 * this.vertical_lines + canv_w / 50;
    this.pos = {
      x: Math.min(x_pos, canv_w - this.w / 2),
      y: y_pos
    };
    this.x1 = this.pos.x - this.w / 2;
    this.x2 = this.pos.x + this.w / 2;
    this.y1 = this.pos.y - this.h / 2;
    this.y2 = this.pos.y + this.h / 2;
  }

  _createClass(Opportunity, [{
    key: "clicked_on",
    value: function clicked_on(pos) {
      if (pos.x >= this.x1 && pos.x <= this.x2 && pos.y >= this.y1 && pos.y <= this.y2) {
        return true;
      } // else


      return false;
    }
  }, {
    key: "render",
    value: function render() {
      if (this.type == "door") {
        // plural
        var add = "";
        if (building.n_floors > 1) add = "S";
        draw_textbox(["BÜRO" + add, "KAUFEN", String(cost_per_door * building.n_floors / 1000) + " K"], this.pos);
      }

      if (this.type == "floor") {
        draw_textbox(["ETAGE KAUFEN " + String(cost_per_door * n_offices_per_floor / 1000) + " K"], this.pos, 3);
      }
    }
  }]);

  return Opportunity;
}();

var Timer =
/*#__PURE__*/
function (_Text) {
  _inherits(Timer, _Text);

  function Timer(start_time) {
    var _this;

    _classCallCheck(this, Timer);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(Timer).call(this, start_time, {
      x: canv_w - 20,
      y: canv_h / 6 - canv_h / 50
    })); // {x:canv_w/2 - 30, y:50}

    _this.size = canv_h / 6;
    _this.label = start_time;
    _this.second = 1;
    _this.align = "right";
    return _this;
  }

  _createClass(Timer, [{
    key: "highscore",
    value: function highscore() {
      var score = bank_account.balance; // read out highscores
      // put highscore in list (if new or good enough)
      // var hs_ind = get_ind_of_highscore(score, highscores);

      var xmlhttp = new XMLHttpRequest();

      xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
          var best_five = this.responseText;
          best_five_array = best_five.split("|a||b|")[0]; // eliminate empty rows

          best_five_array = best_five_array.split("|b|");
          best_five_array.pop();
        }
      };

      xmlhttp.open("GET", "load_highscores.php", false);
      xmlhttp.send(); // check if in top five:

      var hs_ind = get_ind_of_highscore(score, get_scores(best_five_array));

      if (hs_ind == "append") {
        // append to database
        var name = window.prompt("Well done! Put your name in here: ", ""); // handle case when pressed "cancel" --> therefore "try"

        try {
          name.replace("|", ""); // make sure splitting works correctly...

          if (name.length > 25) {
            name = name.slice(0, 24);
          }

          var xmlhttp = new XMLHttpRequest();

          xmlhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
              var best_five = this.responseText;
              best_five_array = best_five.split("|a||b|")[0]; // eliminate empty rows

              best_five_array = best_five_array.split("|b|");
              best_five_array.pop();
            }
          };

          xmlhttp.open("GET", "add_to_highscores.php?q=" + name + "|" + String(score), false);
          xmlhttp.send();
        } catch {} // reload scores from database


        var xmlhttp = new XMLHttpRequest();

        xmlhttp.onreadystatechange = function () {
          if (this.readyState == 4 && this.status == 200) {
            var best_five = this.responseText;
            best_five_array = best_five.split("|a||b|")[0]; // eliminate empty rows

            best_five_array = best_five_array.split("|b|");
            best_five_array.pop();
          }
        };

        xmlhttp.open("GET", "load_highscores.php", false);
        xmlhttp.send();
      } // change state


      game_state = "highscores";
    }
  }, {
    key: "update",
    value: function update(seconds_elapsed) {
      // assuming a timer
      this.second -= seconds_elapsed;

      if (this.second <= 0) {
        this.label -= 1;
        this.second = 1;
      }

      if (this.label <= 0) {
        // game over
        bank_account.gameover();
      }
    }
  }]);

  return Timer;
}(Text);

var CoworkerStateText =
/*#__PURE__*/
function (_Text2) {
  _inherits(CoworkerStateText, _Text2);

  function CoworkerStateText(label, pos, color, speed) {
    var _this2;

    _classCallCheck(this, CoworkerStateText);

    _this2 = _possibleConstructorReturn(this, _getPrototypeOf(CoworkerStateText).call(this, label, pos));
    _this2.color = color; // lightblue

    _this2.max_dist = 0.075 * canv_h; // units it is allowed to float

    var startx = _this2.pos.x;
    var starty = _this2.pos.y;
    _this2.start_pos = {
      x: startx,
      y: starty
    }; //{x: pos.x, y: pos.y}; // make copy, else linked!

    _this2.start_size = _this2.size;
    _this2.speed = speed; // px per frame in each axis (0.2 for sleep)

    _this2.size_increase = 0.002 * canv_h; // size increase per frame

    return _this2;
  }

  _createClass(CoworkerStateText, [{
    key: "distance",
    value: function distance() {
      // distance to start
      var x_dist = this.start_pos.x - this.pos.x;
      var y_dist = this.start_pos.y - this.pos.y;
      return Math.sqrt(x_dist * x_dist + y_dist * y_dist);
    }
  }, {
    key: "reset",
    value: function reset() {
      // else positions somehow add up?
      this.pos = {
        x: this.start_pos.x,
        y: this.start_pos.y
      }; // again use copy

      this.size = this.start_size;
    }
  }, {
    key: "update",
    value: function update() {
      // move to upper left
      this.pos.x += this.speed;
      this.pos.y -= this.speed; // increase size until half distance is met

      if (this.distance() < this.max_dist / 2) {
        this.size += this.size_increase;
      } else if (this.distance() > this.max_dist / 2) {
        this.size -= this.size_increase;
      } // restart at position if max dist is reached


      if (this.distance() > this.max_dist) {
        this.reset();
      }
    }
  }]);

  return CoworkerStateText;
}(Text);

var SleepText =
/*#__PURE__*/
function (_CoworkerStateText) {
  _inherits(SleepText, _CoworkerStateText);

  function SleepText(pos) {
    _classCallCheck(this, SleepText);

    return _possibleConstructorReturn(this, _getPrototypeOf(SleepText).call(this, "z", pos, "lightblue", 0.0001 * canv_w));
  }

  return SleepText;
}(CoworkerStateText);

var OldTalkText =
/*#__PURE__*/
function (_CoworkerStateText2) {
  _inherits(OldTalkText, _CoworkerStateText2);

  function OldTalkText(pos) {
    var _this3;

    _classCallCheck(this, OldTalkText);

    _this3 = _possibleConstructorReturn(this, _getPrototypeOf(OldTalkText).call(this, "bla", pos, "darkred", 1.2));
    _this3.max_dist = 50; // units it is allowed to float

    return _this3;
  }

  return OldTalkText;
}(CoworkerStateText);

var TalkText =
/*#__PURE__*/
function (_Text3) {
  _inherits(TalkText, _Text3);

  function TalkText(door) {
    var _this4;

    _classCallCheck(this, TalkText);

    _this4 = _possibleConstructorReturn(this, _getPrototypeOf(TalkText).call(this, "bla", {
      x: door.door_x_pos + 0.5 * door.door_width,
      y: door.start_y + 0.5 * door.door_height
    })); // - 10: considering that text is not centered

    _this4.start_pos = {
      x: door.door_x_pos + 0.5 * door.door_width,
      y: door.start_y + 0.5 * door.door_height
    };
    _this4.color = "black";
    _this4.pos_list = [];
    _this4.seconds_elapsed = 0;
    _this4.size = 0.05 * canv_h;
    _this4.door = door;
    _this4.max_texts = 2;
    _this4.bla_dur = 0.7;
    return _this4;
  }

  _createClass(TalkText, [{
    key: "update",
    value: function update(seconds_elapsed) {
      this.seconds_elapsed += seconds_elapsed;

      if (this.seconds_elapsed > this.bla_dur) {
        this.seconds_elapsed = 0;
        var randaddx = Math.random() * this.door.door_width - 0.5 * this.door.door_width;
        var randaddy = Math.random() * this.door.door_height - 0.5 * this.door.door_height;
        var new_pos = {
          x: this.start_pos.x + randaddx,
          y: this.start_pos.y + randaddy
        }; // always keep maximum of 3 texts

        if (this.pos_list.length >= this.max_texts) {
          this.pos_list.shift();
        }

        this.pos_list.push(new_pos);
      }
    }
  }, {
    key: "render",
    value: function render() {
      for (var index = 0; index < this.pos_list.length; index++) {
        var p = this.pos_list[index];
        this.pos = p;
        Text.prototype.render.call(this);
      }
    }
  }]);

  return TalkText;
}(Text);

var BankAccount =
/*#__PURE__*/
function () {
  function BankAccount(start_capital) {
    _classCallCheck(this, BankAccount);

    this.balance = start_capital;
    this.opportunities = [];
    this.prev_balance = start_capital; // to get change velocity

    this.rate = 1;
    this.rad = get_rad_for_arrow(this.rate);
    this.maxrate;
    this.color = "lime";
    this.sleeping_n = 0;
    this.size = canv_h / 10;
    this.pos = {
      x: 3 * canv_w / 7,
      y: canv_h / (6 * 2) + this.size / 2
    };
    this.align = "right";
  }

  _createClass(BankAccount, [{
    key: "update",
    value: function update() {
      this.maxrate = boss_productivity_per_person_per_frame * coworkers.length;
      this.prev_balance = this.balance; // reduce money by amount of sleeping people

      this.sleeping_n = 0;

      for (var index = 0; index < coworkers.length; index++) {
        if (!coworkers[index].working) {
          this.sleeping_n += 1;
        }
      }

      this.balance -= this.sleeping_n * cost_of_sleep_per_person_per_frame; // raise money by working boss

      if (boss.working) {
        var cw_work_count = 0;

        for (var _index = 0; _index < coworkers.length; _index++) {
          if (coworkers[_index].working) {
            cw_work_count++;
          }
        }

        this.balance += boss_productivity_per_person_per_frame * cw_work_count;
      } // set color depending on money amount


      if (this.balance < 100000) {
        this.color = "red";
      } else if (this.balance < 300000) {
        this.color = "yellow";
      } else {
        this.color = "lime";
      } // get rate and rad for arrow


      this.rate = get_rate(this.balance - this.prev_balance, -this.maxrate, this.maxrate);
      var goal_rad = get_rad_for_arrow(this.rate); // ensure gradual movement of arrow

      if (round_digits(goal_rad, 2) < round_digits(this.rad, 2)) {
        this.rad -= 0.005;
      }

      if (round_digits(goal_rad, 2) > round_digits(this.rad, 2)) {
        this.rad += 0.005;
      } // draw buying opportunities


      this.opportunities = []; // reset
      // only given if boss is in office and no one is sleeping/talking

      var everybody_productive = true;

      for (var _index2 = 0; _index2 < coworkers.length; _index2++) {
        var cw = coworkers[_index2];

        if (cw.sleeping || cw.talking) {
          everybody_productive = false;
          break;
        }
      }

      if (boss.in_office && everybody_productive) {
        // 1. door(s)
        if (this.balance > cost_per_door * building.n_floors && n_offices_per_floor < 8) {
          this.opportunities.push(new Opportunity("door"));
        } // 2. floor


        if (this.balance > cost_per_door * n_offices_per_floor && building.n_floors < 6) {
          this.opportunities.push(new Opportunity("floor"));
        }
      } // set game over


      if (this.balance <= 0) {
        this.gameover();
      }
    }
  }, {
    key: "gameover",
    value: function gameover() {
      // this.balance = "GAME OVER   ".concat(this.balance);
      timer.highscore();
    }
  }, {
    key: "render",
    value: function render() {
      draw_canvas_text_flex(String(this.balance).concat(" €"), this.pos, this.color, this.size, this.align);
      draw_arrow(this.rad);

      for (var index = 0; index < this.opportunities.length; index++) {
        var opp = this.opportunities[index];
        opp.render();
      }
    }
  }]);

  return BankAccount;
}();

var Mover =
/*#__PURE__*/
function () {
  function Mover() {
    _classCallCheck(this, Mover);
  }

  _createClass(Mover, [{
    key: "distance",
    value: function distance(p1, p2) {
      var xdist = p2.x - p1.x;
      var ydist = p2.y - p1.y;
      return Math.sqrt(xdist * xdist + ydist * ydist);
    }
  }]);

  return Mover;
}();

var Building =
/*#__PURE__*/
function () {
  function Building() {
    _classCallCheck(this, Building);

    this.stairway_width = stairway_w;
    this.hallway_length = hallway_w;
    this.n_floors = n_floors;
    this.height = floor_height; // derived vars

    this.stairway1_start_x = canv_w / 2 - this.hallway_length / 2 - this.stairway_width;
    this.stairway2_start_x = canv_w / 2 + this.hallway_length / 2;
    this.building_height = floor_height * this.n_floors;
  }

  _createClass(Building, [{
    key: "render",
    value: function render() {
      // stairways boxes
      draw_rect_outline({
        x: this.stairway1_start_x,
        y: canv_h - this.building_height - 0.5 * grass.height
      }, this.stairway_width, this.building_height, "black", "white");
      draw_rect_outline({
        x: this.stairway2_start_x,
        y: canv_h - this.building_height - 0.5 * grass.height
      }, this.stairway_width, this.building_height, "black", "white");
    }
  }]);

  return Building;
}();

var Stairs =
/*#__PURE__*/
function (_Building) {
  _inherits(Stairs, _Building);

  function Stairs(side, start_x, end_x, start_y) {
    var _this5;

    _classCallCheck(this, Stairs);

    _this5 = _possibleConstructorReturn(this, _getPrototypeOf(Stairs).call(this));
    _this5.coords = [{
      x: start_x,
      y: start_y
    }];
    _this5.step_length = _this5.stairway_width / n_steps_in_tread;
    _this5.step_height = _this5.height / 2 / n_steps_in_tread;

    if (side == 0) {
      // left hand stairway
      var new_x = _this5.coords[_this5.coords.length - 1].x; // move to left first

      while (new_x > end_x + 1) {
        new_x = _this5.coords[_this5.coords.length - 1].x - _this5.step_length;

        _this5.coords.push({
          x: new_x,
          y: _this5.coords[_this5.coords.length - 1].y
        });

        var new_y = _this5.coords[_this5.coords.length - 1].y + _this5.step_height;

        _this5.coords.push({
          x: _this5.coords[_this5.coords.length - 1].x,
          y: new_y
        });
      } // then to right


      end_x += _this5.stairway_width;

      while (new_x < end_x) {
        new_x = _this5.coords[_this5.coords.length - 1].x + _this5.step_length;

        _this5.coords.push({
          x: new_x,
          y: _this5.coords[_this5.coords.length - 1].y
        });

        var _new_y = _this5.coords[_this5.coords.length - 1].y + _this5.step_height;

        _this5.coords.push({
          x: _this5.coords[_this5.coords.length - 1].x,
          y: _new_y
        });
      }
    }

    if (side == 1) {
      // right hand stairway --> here is error
      // move to right first
      var _new_x = _this5.coords[_this5.coords.length - 1].x; // TODO figure out why "- 1" necessary

      while (_new_x < end_x - 1) {
        _new_x = _this5.coords[_this5.coords.length - 1].x + _this5.step_length;

        _this5.coords.push({
          x: _new_x,
          y: _this5.coords[_this5.coords.length - 1].y
        });

        var _new_y2 = _this5.coords[_this5.coords.length - 1].y + _this5.step_height;

        _this5.coords.push({
          x: _this5.coords[_this5.coords.length - 1].x,
          y: _new_y2
        });
      } // then to left


      end_x -= _this5.stairway_width;

      while (_new_x > end_x) {
        _new_x = _this5.coords[_this5.coords.length - 1].x - _this5.step_length;

        _this5.coords.push({
          x: _new_x,
          y: _this5.coords[_this5.coords.length - 1].y
        });

        var _new_y3 = _this5.coords[_this5.coords.length - 1].y + _this5.step_height;

        _this5.coords.push({
          x: _this5.coords[_this5.coords.length - 1].x,
          y: _new_y3
        });
      }
    }

    return _this5;
  }

  _createClass(Stairs, [{
    key: "render",
    value: function render() {
      draw_path(this.coords, "black");
    }
  }]);

  return Stairs;
}(Building);

var Story =
/*#__PURE__*/
function (_Building2) {
  _inherits(Story, _Building2);

  // here also doors are added
  function Story(floor_n, after_upgrade) {
    var _this6;

    _classCallCheck(this, Story);

    var after_upgrade = after_upgrade || false;
    _this6 = _possibleConstructorReturn(this, _getPrototypeOf(Story).call(this));
    _this6.n_doors = n_offices_per_floor;
    _this6.floor_n = floor_n; // derived vars

    _this6.start_x = canv_w / 2 - _this6.hallway_length / 2; // only hallway

    _this6.end_x = _this6.start_x + _this6.hallway_length; // only hallway

    _this6.start_y = canv_h - _this6.floor_n * _this6.height; // only hallway
    // derived vars - stairs

    _this6.stairs1 = new Stairs(0, _this6.stairway1_start_x + _this6.stairway_width, _this6.stairway1_start_x, _this6.start_y - _this6.height - 0.5 * grass.height);
    _this6.stairs2 = new Stairs(1, _this6.stairway2_start_x, _this6.stairway2_start_x + _this6.stairway_width, _this6.start_y - _this6.height - 0.5 * grass.height); // derived vars - door coordinates

    var boss_placed = false;

    for (var index = 0; index < _this6.n_doors; index++) {
      // don't add boss door to list (first in topmost floor)
      if (_this6.floor_n == n_floors - 1 && !boss_placed) {
        boss_door = new Door(index, _this6.start_x, _this6.start_y - 0.5 * grass.height, -1, _this6.floor_n);
        boss_door.color = "brown";
        boss = new DaBoss(boss_door.goal, boss_door);
        boss_placed = true;
      } else {
        var new_door = new Door(index, _this6.start_x, _this6.start_y - 0.5 * grass.height, doors.length, _this6.floor_n); // spawn the correct coworker in working state --> only if not upgraded building

        new_door.coworkers_in_room.push(new CoWorker(new_door, after_upgrade));
        doors.push(new_door);
      }
    }

    return _this6;
  }

  _createClass(Story, [{
    key: "render",
    value: function render() {
      // stairs, walls and doors
      // 1. hallway walls
      draw_rect_outline({
        x: this.start_x,
        y: this.start_y - this.height - grass.height / 2
      }, this.hallway_length, this.height, "black", "white"); // 2. doors --> rendered separately in draw_all (unique list)
      // 3. stairs (only if not top story)

      if (this.floor_n < this.n_floors - 1) {
        this.stairs1.render();
        this.stairs2.render();
      }
    }
  }]);

  return Story;
}(Building);

var Door =
/*#__PURE__*/
function (_Building3) {
  _inherits(Door, _Building3);

  // "extends Story" leads to recursion problems unfortunately
  function Door(door_n, start_x, start_y, ind, floor) {
    var _this7;

    _classCallCheck(this, Door);

    _this7 = _possibleConstructorReturn(this, _getPrototypeOf(Door).call(this));
    _this7.door_n = door_n; // number of door on this floor

    _this7.door_width = _this7.hallway_length / (n_offices_per_floor * 3); //24;

    _this7.door_height = 0.6 * floor_height;
    _this7.start_x = start_x; // hallway, not door!

    _this7.start_y = start_y - _this7.door_height;
    _this7.working_color = "orange";
    _this7.color = _this7.working_color;
    _this7.ind = ind; // index of door in list of all doors

    _this7.floor = floor; // initialize state variables

    _this7.labelled = false; // initialize state variables

    _this7.coworkers_in_room = []; // derived vars - left x coordinate

    var door_dist = _this7.hallway_length / (n_offices_per_floor + 1);
    var start_pos = door_dist + start_x - 0.5 * _this7.door_width;
    _this7.door_x_pos = start_pos + _this7.door_n * door_dist; // edge coordinates

    _this7.x1 = _this7.door_x_pos;
    _this7.x2 = _this7.x1 + _this7.door_width;
    _this7.y1 = _this7.start_y;
    _this7.y2 = _this7.y1 + _this7.door_height;
    _this7.goal = {
      x: _this7.x1 + _this7.door_width / 2,
      y: _this7.y2
    }; // feet center coordinate

    _this7.center = {
      x: _this7.x1 + _this7.door_width / 2,
      y: _this7.y1 + _this7.height / 2
    }; // for rendering

    _this7.z = new SleepText({
      x: _this7.center.x,
      y: _this7.center.y - 0.25 * _this7.door_height
    }); // for rendering sleeping

    _this7.bla = new TalkText(_assertThisInitialized(_this7)); // for rendering talking

    return _this7;
  }

  _createClass(Door, [{
    key: "clicked_on",
    value: function clicked_on(pos) {
      // returns bool
      if (pos.x >= this.x1 && pos.x <= this.x2 && pos.y >= this.y1 && pos.y <= this.y2) {
        return true;
      } // else


      return false;
    }
  }, {
    key: "same_door",
    value: function same_door(other) {
      // returns true if the two are the same doors
      if (this.x1 != other.x1 || this.y1 != other.y1) {
        return false;
      } // else


      return true;
    }
  }, {
    key: "label",
    value: function label(num) {
      // sets number value and switch to render label true
      this.labelled = true;
      this.num = num;
    }
  }, {
    key: "update",
    value: function update(seconds_elapsed) {
      // if any coworkers in door are sleeping: step forward sleeping animation
      for (var index = 0; index < this.coworkers_in_room.length; index++) {
        if (this.coworkers_in_room[index].sleeping) {
          this.z.update();
          break;
        }
      } // if any coworkers in door are talking: step forward talking animation


      for (var _index3 = 0; _index3 < this.coworkers_in_room.length; _index3++) {
        if (this.coworkers_in_room[_index3].talking) {
          this.bla.update(seconds_elapsed);
          break;
        }
      }
    }
  }, {
    key: "render",
    value: function render() {
      draw_rect_outline({
        x: this.door_x_pos,
        y: this.start_y
      }, this.door_width, this.door_height, "black", this.color);
    }
  }, {
    key: "render_text",
    value: function render_text() {
      // separate function so that no doors occlude sleep Zs
      // if any coworkers in door are talking: show talking animation
      for (var index = 0; index < this.coworkers_in_room.length; index++) {
        if (this.coworkers_in_room[index].talking) {
          this.bla.render();
          break;
        }
      } // if any coworkers in door are sleeping: show sleeping animation


      for (var _index4 = 0; _index4 < this.coworkers_in_room.length; _index4++) {
        if (this.coworkers_in_room[_index4].sleeping) {
          this.z.render(); // set color to grey

          this.color = "lightgrey";
          break;
        } else if (this.coworkers_in_room[_index4].talking) {
          this.color = "lightgrey";
        } else {
          // coworkers are actually working 
          this.color = this.working_color;
        }
      }
    }
  }, {
    key: "render_walk_path",
    value: function render_walk_path() {
      if (this.labelled) {
        var padding = (floor_height - this.door_height - canv_h / 15) / 2;
        draw_canvas_text_flex(this.num, {
          x: this.x1 + this.door_width / 2,
          y: this.y1 - padding
        }, "red", canv_h / 15, "center");
      }
    } // render_path_doors() { // delete, only debugging...
    //     draw_rect_outline({x: this.door_x_pos, y: this.start_y},
    //         this.door_width, this.door_height, "black", "yellow");
    //     draw_circ(10, this.goal, "red");
    // }

  }]);

  return Door;
}(Building);

var Person =
/*#__PURE__*/
function (_Mover) {
  _inherits(Person, _Mover);

  function Person() {
    var _this8;

    _classCallCheck(this, Person);

    _this8 = _possibleConstructorReturn(this, _getPrototypeOf(Person).call(this));
    _this8.pos = {
      x: canv_w / 2 - 60,
      y: canv_h / 2
    };
    _this8.head_r = floor_height / 20;
    _this8.height = floor_height / 2.5 - floor_height / 2.5 / 5;
    _this8.width = 2.75 * _this8.head_r;
    _this8.body_l = floor_height / 8;
    _this8.arm_rel_pos_body = 0.2; // percentage on body line where arms start

    _this8.head_color = "white";
    _this8.walk_speed = walk_speed; // derived vars

    _this8.decap_height = _this8.height - 2 * _this8.head_r;
    _this8.leg_height = _this8.decap_height - _this8.body_l;
    _this8.arm_joint_height = _this8.leg_height + (1 - _this8.arm_rel_pos_body) * _this8.body_l;
    _this8.goal_tolerance = _this8.walk_speed / 2; // state variables

    _this8.in_stairway = false;
    _this8.middle_stairs_reached = false;
    _this8.stairway_points = [{
      x: 0,
      y: 0
    }, {
      x: 0,
      y: 0
    }, {
      x: 0,
      y: 0
    }];
    _this8.stairway_step_1 = {
      x: 0,
      y: 0
    };
    _this8.stairway_step_2 = {
      x: 0,
      y: 0
    };
    _this8.stairs1_len = 0;
    _this8.stairs2_len = 0; // initialization values

    _this8.working = true;
    _this8.in_office = true;
    _this8.sleeping = false;
    _this8.talking = false;
    _this8.scared = false;
    _this8.dest = new Door(-1, 0, 0, -1, -1);
    _this8.side = 0; // middle

    return _this8;
  }

  _createClass(Person, [{
    key: "get_story",
    value: function get_story() {
      // mostly when in stairway
      for (var index = 0; index < stories.length; index++) {
        if (this.pos.y <= stories[index].start_y && this.pos.y > stories[index].start_y - stories[index].height) {
          // stories[index].highlight = true;
          return index;
        } // else {
        //     stories[index].highlight = false;
        // }

      }
    }
  }, {
    key: "get_story_y",
    value: function get_story_y(building) {
      var story = this.get_story();
      return canv_h - building.height * story - 0.5 * grass.height;
    }
  }, {
    key: "stairway_turn",
    value: function stairway_turn() {
      // just switch p1 and p3
      var p3_buffer = this.stairway_points[2];
      this.stairway_points[2] = this.stairway_points[0];
      this.stairway_points[0] = p3_buffer; // in this case: switch whether middle was reached or not

      this.middle_stairs_reached = !this.middle_stairs_reached; // reverse y direction of steps

      this.stairway_step_1.y = -this.stairway_step_1.y;
      this.stairway_step_2.y = -this.stairway_step_2.y;
    }
  }, {
    key: "set_stairway_points",
    value: function set_stairway_points(vert_dir, side, building) {
      if (side == -1) {
        var x_init = building.stairway1_start_x + building.stairway_width;
      } else {
        var x_init = building.stairway2_start_x;
      } // y dependent on whether in stairway or not


      var y_init = this.get_story_y(building);
      var p1 = {
        x: x_init,
        y: y_init
      };
      var p2 = {
        x: x_init + side * building.stairway_width - side * this.width * 0.5,
        y: y_init + vert_dir * building.height / 2
      };
      var p3 = {
        x: x_init,
        y: y_init + vert_dir * building.height
      };
      this.stairway_points[0] = p1;
      this.stairway_points[1] = p2;
      this.stairway_points[2] = p3; // set the steps
      // create vectors

      var vec1 = {
        x: this.stairway_points[1].x - this.stairway_points[0].x,
        y: this.stairway_points[1].y - this.stairway_points[0].y
      };
      var vec2 = {
        x: this.stairway_points[2].x - this.stairway_points[1].x,
        y: this.stairway_points[2].y - this.stairway_points[1].y
      }; // normalize and scale vector by walking speed to get new position add

      this.stairs1_len = Math.sqrt(vec1.x * vec1.x + vec1.y * vec1.y);
      this.stairs2_len = Math.sqrt(vec2.x * vec2.x + vec2.y * vec2.y);
      var vec1_norm = {
        x: vec1.x / this.stairs1_len,
        y: vec1.y / this.stairs1_len
      };
      var vec2_norm = {
        x: vec2.x / this.stairs2_len,
        y: vec2.y / this.stairs2_len
      }; // get next step position

      this.stairway_step_1 = {
        x: vec1_norm.x * this.walk_speed,
        y: vec1_norm.y * this.walk_speed
      };
      this.stairway_step_2 = {
        x: vec2_norm.x * this.walk_speed,
        y: vec2_norm.y * this.walk_speed
      };
      this.in_stairway = true;
    }
  }, {
    key: "stairway_walking",
    value: function stairway_walking() {
      // maybe person needs to take a turn...
      // necessary if y of third stairway point not closer to dest than first stairway point
      if (Math.abs(this.stairway_points[0].y - this.dest.goal.y) < Math.abs(this.stairway_points[2].y - this.dest.goal.y)) {
        this.stairway_turn();
      } // keep walking on first vec as long as distance is less than stairs


      if (!this.middle_stairs_reached) {
        // first half
        if (this.distance(this.pos, this.stairway_points[0]) <= this.stairs1_len) {
          this.pos.x += this.stairway_step_1.x;
          this.pos.y += this.stairway_step_1.y;
        } else {
          this.middle_stairs_reached = true;
        }
      } else {
        // second half
        if (this.distance(this.pos, this.stairway_points[1]) <= this.stairs2_len) {
          this.pos.x += this.stairway_step_2.x;
          this.pos.y += this.stairway_step_2.y;
        } else {
          // when finished: reset variables
          this.middle_stairs_reached = false;
          this.in_stairway = false;
          this.pos.y = this.stairway_points[2].y;
        }
      }
    }
  }, {
    key: "choose_closest_stairs",
    value: function choose_closest_stairs(start_x, end_x) {
      // left or right given doors are not in same floor
      // note: building coordinates neglected because everything is centered
      var left = start_x + end_x;
      var right = canv_w - start_x + (canv_w - end_x);

      if (!this.scared) {
        // only rational navigation decision when calmed down
        if (left < right) {
          return -1; // left
        } // else


        return 1; // right
      } else if (this.scared && boss.pos.y == this.pos.y) {
        // same floor
        // if scared: choose stairs that are away from boss
        if (boss.pos.x < this.pos.x) {
          return 1; // right
        } else if (boss.pos.x > this.pos.x) {
          return -1; // left
        } else {
          // same position (i.e. when forced out of door) -->
          // head start anyway, go to logical direction
          if (left < right) {
            return -1; // left
          } // else


          return 1; // right
        }
      } else {
        // scared & not on same floor as boss --> logical direction
        if (left < right) {
          return -1; // left
        } // else


        return 1; // right
      }
    }
  }, {
    key: "walk_route",
    value: function walk_route(building, dest) {
      this.dest = dest; // note: in overall update function already checked this there are doors in path list
      // choose the direction where boss should walk
      // choose closest flight of stairs

      var dir = this.choose_closest_stairs(this.pos.x, this.dest.goal.x); // get vertical direction

      var vert_dir = 0;

      if (this.dest.goal.y > this.pos.y) {
        vert_dir = 1;
      } else if (this.dest.goal.y < this.pos.y) {
        vert_dir = -1;
      } // first check whether in stairway; if yes, finish walking program


      if (this.in_stairway) {
        this.stairway_walking();
      } else if (Math.round(this.dest.goal.y) != Math.round(this.pos.y)) {
        // needs to go to stairs
        // walk to stairs or up the stairs
        if (this.pos.x >= building.stairway1_start_x + building.stairway_width && this.pos.x <= building.stairway2_start_x) {
          // in hallway
          this.pos.x += dir * this.walk_speed;
        } else {
          // in stairway
          this.set_stairway_points(vert_dir, dir, building); // this.start_stairway_animation(vert_dir, dir, building);
        }
      } else if (this.dest.goal.x + this.goal_tolerance > this.pos.x) {
        // needs to walk right
        this.pos.x += this.walk_speed;
      } else if (this.dest.goal.x - this.goal_tolerance < this.pos.x) {
        // needs to walk left
        this.pos.x -= this.walk_speed;
      } // exact match (within tolerance) of position


      if (this.pos.x >= this.dest.goal.x - this.goal_tolerance && this.pos.x <= this.dest.goal.x + this.goal_tolerance && Math.round(this.pos.y) == Math.round(this.dest.goal.y)) {
        this.door_reached(this.dest);
      }
    }
  }, {
    key: "rescale",
    value: function rescale(new_w, new_h) {
      // appearance adjustment
      this.head_r = floor_height / 20;
      this.height = floor_height / 2.5 - floor_height / 2.5 / 5;
      this.width = 2.75 * this.head_r;
      this.body_l = floor_height / 8;
      this.arm_rel_pos_body = 0.2; // percentage on body line where arms start

      this.walk_speed = walk_speed; // derived vars

      this.decap_height = this.height - 2 * this.head_r;
      this.leg_height = this.decap_height - this.body_l;
      this.arm_joint_height = this.leg_height + (1 - this.arm_rel_pos_body) * this.body_l;
      this.goal_tolerance = this.walk_speed / 2; // position rescale
      // gradual y adjustment if in stairway
      // gradual x adjustment if not in office
      // preparation

      var old_hallway_w = 5 * canv_w / 8;
      var old_hallway_start_x = (canv_w - old_hallway_w) / 2;
      var old_hallway_end_x = old_hallway_start_x + old_hallway_w;
      var new_hallway_start = (new_w - hallway_w) / 2;
      var old_stairway_w = canv_w / 8; // TODO check if this.dest.goal adjusted already

      var dir = this.choose_closest_stairs(this.pos.x, this.dest.goal.x); // distinction based on dir

      if (dir < 0) {
        var old_stairway_start_x = old_hallway_start_x + dir * old_stairway_w;
      } else {
        var old_stairway_start_x = old_hallway_end_x;
      }

      if (dir < 0) {
        var new_stairway_start_x = new_hallway_start + dir * stairway_w;
      } else {
        var new_stairway_start_x = new_hallway_start + hallway_w;
      }

      if (this.in_office) {
        this.pos = {
          x: this.door.goal.x,
          y: this.door.goal.y
        };
      } else if (!this.stairway_walking) {
        this.pos.y = this.get_story_y(building); // x derivation

        var subtr_x = this.pos.x - old_hallway_start_x;
        var new_rel_x = subtr_x / old_hallway_w * hallway_w;
        this.pos.x = new_rel_x + new_hallway_start;
      } else {
        // y derivation
        var new_y = this.pos.y / canv_h * new_h;
        this.pos.y = new_y; // x derivation

        var subtr_x = this.pos.x - old_stairway_start_x;
        var new_rel_x = subtr_x / old_stairway_w * stairway_w;
        this.pos.x = new_rel_x + new_stairway_start_x;
        var vert_dir = 0; // set the new stairway points

        if (this.dest.goal.y > this.pos.y) {
          vert_dir = 1;
        } else if (this.dest.goal.y < this.pos.y) {
          vert_dir = -1;
        }

        this.set_stairway_points(vert_dir, dir, building);
      }
    }
  }, {
    key: "render",
    value: function render(label) {
      var label = label || ""; // placeholder: strichmaennchen
      // head

      draw_circ_outline(this.head_r, {
        x: this.pos.x,
        y: this.pos.y - (this.height - this.head_r)
      }, "black", this.head_color);
      draw_canvas_text_flex(label, {
        x: this.pos.x,
        y: this.pos.y - (this.height - this.head_r)
      }, "red", 20); // body

      draw_line([{
        x: this.pos.x,
        y: this.pos.y - this.leg_height
      }, {
        x: this.pos.x,
        y: this.pos.y - this.decap_height
      }], "black"); // legs

      draw_line([{
        x: this.pos.x,
        y: this.pos.y - this.leg_height
      }, {
        x: this.pos.x - this.width / 2,
        y: this.pos.y
      }], "black");
      draw_line([{
        x: this.pos.x,
        y: this.pos.y - this.leg_height
      }, {
        x: this.pos.x + this.width / 2,
        y: this.pos.y
      }], "black"); // arms

      draw_line([{
        x: this.pos.x,
        y: this.pos.y - this.arm_joint_height
      }, {
        x: this.pos.x - this.width / 2,
        y: this.pos.y - this.arm_joint_height + this.leg_height
      }], "black");
      draw_line([{
        x: this.pos.x,
        y: this.pos.y - this.arm_joint_height
      }, {
        x: this.pos.x + this.width / 2,
        y: this.pos.y - this.arm_joint_height + this.leg_height
      }], "black");
    }
  }]);

  return Person;
}(Mover);

var CoWorker =
/*#__PURE__*/
function (_Person) {
  _inherits(CoWorker, _Person);

  function CoWorker(door, after_upgrade) {
    var _this9;

    _classCallCheck(this, CoWorker);

    var after_upgrade = after_upgrade || false;
    _this9 = _possibleConstructorReturn(this, _getPrototypeOf(CoWorker).call(this));

    if (!after_upgrade) {
      _this9.ind = coworkers.length;
    } else {
      _this9.ind = new_coworkers.length;
    }

    _this9.door = door;
    _this9.door_ind = door.ind; // check if in own office
    // this.home = door.goal; // to find back to correct door

    _this9.pos = {
      x: door.goal.x,
      y: door.goal.y
    }; // init at "home" --> linked? try to make copy

    _this9.floor = door.floor; // state variables

    _this9.base_speed = _this9.walk_speed; // for resetting it later
    // add to list of coworkers --> only if not upgraded, i.e. first initialization

    if (!after_upgrade) {
      coworkers.push(_assertThisInitialized(_this9));
    } else {
      // keep the old coworker list, add to new list
      new_coworkers.push(_assertThisInitialized(_this9));
    }

    return _this9;
  }

  _createClass(CoWorker, [{
    key: "controlled",
    value: function controlled() {
      // always by boss when he knocks on door where this coworker currently is in
      // reset awake time and focus time
      this.awake_time_left = this.awake_time;
      this.focus_time_left = this.focus_time;

      if (this.sleeping) {
        this.sleeping = false;
      }

      if (this.talking && !this.in_own_office()) {
        // run from office --> reduce numbers of coworkers in room
        var new_cw_list = [];

        for (var index = 0; index < doors[this.door_ind].coworkers_in_room.length; index++) {
          var cw = doors[this.door_ind].coworkers_in_room[index]; // only reappend coworker if not this

          if (cw.ind != this.ind) {
            new_cw_list.push(cw);
          }
        }

        doors[this.door_ind].coworkers_in_room = new_cw_list; // set flags

        this.scared = true;
        this.talking = false;
        this.in_office = false;
      } else if (this.talking) {
        this.talking = false;
      } else if (!this.in_office) {
        this.scared = true;
      }
    }
  }, {
    key: "in_own_office",
    value: function in_own_office() {
      if (!this.in_office) {
        return false;
      } else {
        if (this.door_ind == this.door.ind) {
          return true;
        } else {
          return false;
        }
      }
    }
  }, {
    key: "door_reached",
    value: function door_reached(dest) {
      // calm down no matter what office
      this.scared = false;
      this.in_office = true;
      this.pos = {
        x: dest.goal.x,
        y: dest.goal.y
      }; // make copy, otherwise linked?
      // set current door

      this.door_ind = dest.ind;

      if (!this.in_own_office()) {
        // reached a co-worker's door
        // go into room
        doors[dest.ind].coworkers_in_room.push(this); // coworkers that are already in room: wake up

        for (var index = 0; index < doors[dest.ind].coworkers_in_room.length; index++) {
          coworkers[dest.coworkers_in_room[index].ind].talking = true;
          coworkers[dest.coworkers_in_room[index].ind].sleeping = false;
        }
      } else {
        // walked back to office
        this.working = true;
        doors[this.door.ind].coworkers_in_room = [this];
      }
    }
  }, {
    key: "escape",
    value: function escape() {
      // function called when coworker too close to boss
      // is scared, runs away from boss (1) and back to his/her office (2)
      this.scared = true;
    }
  }, {
    key: "update",
    value: function update(seconds_elapsed) {
      // debug
      // if (this.scared) {
      //     this.head_color = "lightblue";
      // } else {
      //     this.head_color = "white";
      // }
      // set current story
      this.floor = this.get_story(); // set walking speed and adjust tolerance

      if (this.scared && this.walk_speed == this.base_speed) {
        this.walk_speed *= 1.5;
        this.goal_tolerance = this.walk_speed / 2;
      } else if (!this.scared && this.walk_speed > this.base_speed) {
        this.walk_speed /= 1.5;
        this.goal_tolerance = this.walk_speed / 2;
      } // check state
      // working if in own office and alone and not sleeping


      if (this.in_office && !this.sleeping && !this.talking && this.in_own_office()) {
        this.working = true;
      } else {
        // at least one condition is not met
        this.working = false;
      } // if working --> set the other flags to false (TODO: check if necessary...)


      if (this.working) {
        this.sleeping = false;
        this.talking = false;
      } // grow tiredness over time if awake & in office


      if (this.working) {
        this.awake_time_left -= seconds_elapsed;

        if (this.type == 1) {
          // ADHD type... walkers
          this.focus_time_left -= seconds_elapsed;

          if (this.focus_time_left <= 0) {
            this.working = false;
            this.in_office = false;
            this.scared = false; // to distinguish what caused walking outside the office

            doors[this.door.ind].coworkers_in_room = [];
          }
        }

        if (this.awake_time_left <= 0) {
          // set asleep
          this.working = false;
          this.sleeping = true;
        }
      } // can't be sleeping and talking at the same time... well my roommate can


      if (this.sleeping) {
        this.talking = false;
      }

      if (this.talking) {
        this.sleeping = false;
      } // step forward route


      if (!this.in_office) {
        if (this.scared) {
          // = woken up by boss
          this.walk_route(building, this.door);
        } else {
          // = walking out of boredom to other coworker's door
          this.walk_route(building, this.match_coworker.door);
        }
      }
    }
  }, {
    key: "render",
    value: function render() {
      if (!this.in_office) {
        Person.prototype.render.call(this);
      }
    } // debug_render() {
    //     if (this.type == 1) {
    //         draw_rect_outline({x: this.match_coworker.door.door_x_pos, y: this.match_coworker.door.start_y},
    //             this.match_coworker.door.door_width, this.match_coworker.door.door_height, "black", "yellow");
    //         draw_circ(10, this.match_coworker.door.goal, "red");
    //     }
    // }

  }]);

  return CoWorker;
}(Person);

var DaBoss =
/*#__PURE__*/
function (_Person2) {
  _inherits(DaBoss, _Person2);

  function DaBoss(pos, door) {
    var _this10;

    _classCallCheck(this, DaBoss);

    _this10 = _possibleConstructorReturn(this, _getPrototypeOf(DaBoss).call(this));
    _this10.pos = pos;
    _this10.head_color = "red";
    _this10.floor = door.floor;
    _this10.door = door; // initialize state variables

    _this10.working = true;
    _this10.checking = false; // small time to wait in front of door

    _this10.check_timer = door_check_dur;
    _this10.check_door = door; // when checking, keeps track which door is checked

    _this10.cursing = false; // speech bubble

    _this10.cursing_text = "";
    _this10.cursing_time_remaining = curse_dur;
    return _this10;
  }

  _createClass(DaBoss, [{
    key: "door_reached",
    value: function door_reached(dest) {
      this.pos = {
        x: dest.goal.x,
        y: dest.goal.y
      }; // make copy, otherwise linked?

      this.check_door = dest;

      if (doors_path.length > 0) {
        // reached a co-worker's door
        doors[doors_path[0].ind].labelled = false;
        doors_path.shift(); // removes first element
        // redraw the labels

        for (var index = 0; index < doors.length; index++) {
          if (doors[index].labelled) {
            doors[index].num -= 1;
          }
        } // wait a few moments in front of each door


        this.checking = true;
      } else {
        // walked back to office
        this.working = true;
        this.in_office = true;
        this.cursing = false;
      }
    }
  }, {
    key: "set_bubble_text",
    value: function set_bubble_text() {
      var rand_ind = Math.floor(Math.random() * slogans.length);
      this.cursing_text = slogans[rand_ind];
      this.cursing = true;
      this.cursing_time_remaining = curse_dur;
    }
  }, {
    key: "update",
    value: function update(building, doors_path, boss_door, seconds_elapsed) {
      // set current story
      this.floor = this.get_story(); // count down speech bubble visibility

      if (this.cursing) {
        this.cursing_time_remaining -= seconds_elapsed;

        if (this.cursing_time_remaining <= 0) {
          this.cursing = false;
        }
      } // if in checking mode, wait a few moments in front of each door


      if (this.checking) {
        // count down timer --> if time up, set checking to false
        this.check_timer -= seconds_elapsed;

        if (this.check_timer <= 0) {
          // continue walking
          this.checking = false;
          this.check_timer = door_check_dur; // control coworkers if they are in office

          for (var index = 0; index < this.check_door.coworkers_in_room.length; index++) {
            // set up speech bubble
            if (coworkers[this.check_door.coworkers_in_room[index].ind].talking && !this.cursing) {
              this.set_bubble_text();
            }

            coworkers[this.check_door.coworkers_in_room[index].ind].controlled();
          }
        }
      } else {
        if (doors_path.length > 0) {
          this.working = false;
          this.in_office = false;
          this.walk_route(building, doors_path[0]);
        } else {
          // no doors left --> walk back to office
          this.walk_route(building, boss_door);
        }
      } // scare coworkers in hallway


      if (!this.in_office) {
        for (var _index5 = 0; _index5 < coworkers.length; _index5++) {
          // given that meeting outside office
          if (!coworkers[_index5].in_office) {
            if (get_distance(this.pos, coworkers[_index5].pos) < scare_tolerance) {
              coworkers[_index5].controlled();
            }
          } // if (this.pos.y == coworkers[index].pos.y && !coworkers[index].in_office) {
          //     if (Math.abs(this.pos.x - coworkers[index].pos.x) < scare_tolerance) {
          //         coworkers[index].controlled();
          //     }
          // }

        } // // otherwise, check in stairway
        // if (this.in_stairway) {
        //     var boss_stairway_side = this.choose_closest_stairs(this.pos.x, this.pos.x);
        //     for (let index = 0; index < coworkers.length; index++) {
        //         const cw = coworkers[index];
        //         // given that on same floor and meeting outside office
        //         var cw_stairway_side = cw.choose_closest_stairs(cw.pos.x, cw.pos.x);
        //         if (cw_stairway_side == boss_stairway_side && cw.in_stairway) {
        //             coworkers[index].controlled();
        //         }
        //     }
        // }

      }
    }
  }, {
    key: "render",
    value: function render() {
      // only render boss when he is not working
      if (!this.working) {
        Person.prototype.render.call(this);
      } // render speech bubble


      if (this.cursing) {
        draw_speech_bubble(this.cursing_text, {
          x: this.pos.x,
          y: this.pos.y - this.height
        });
      }
    }
  }]);

  return DaBoss;
}(Person);

var Grass =
/*#__PURE__*/
function () {
  function Grass() {
    _classCallCheck(this, Grass);

    this.width = canv_w;
    this.height = canv_h / 6;
  }

  _createClass(Grass, [{
    key: "rescale",
    value: function rescale(new_w, new_h) {
      this.width = new_w;
      this.height = new_h / 6;
    }
  }, {
    key: "render",
    value: function render() {
      draw_rect({
        x: 0,
        y: canv_h - this.height
      }, this.width, this.height, "green");
    }
  }]);

  return Grass;
}(); // re_init_all_vars(true);
// main update function


function update() {
  // only update if ingame
  if (game_state == "game") {
    // keep track of time in seconds
    endTime = new Date();
    secondsElapsed = (endTime - startTime) / 1000;
    startTime = new Date(); // set state of boss and update

    boss.update(building, doors_path, boss_door, secondsElapsed); // set state of coworkers (dependent on seconds passed)

    for (var index = 0; index < coworkers.length; index++) {
      coworkers[index].update(secondsElapsed);
    } // set state of doors (i.e. sleeping or talking text animations step forward)


    for (var _index6 = 0; _index6 < doors.length; _index6++) {
      doors[_index6].update(secondsElapsed);
    } // update bank account and timer


    bank_account.update();
    timer.update(secondsElapsed);
  } // after all updates: draw everything


  draw_all(); // keep simulation going

  requestAnimationFrame(update);
} // main draw function


function draw_all() {
  if (game_state == "choose_mode") {
    start_screen(hover_arrows_menu);
  }

  if (game_state == "instructions1") {
    show_instructions1();
  }

  if (game_state == "instructions2") {
    show_instructions2();
  }

  if (game_state == "game") {
    // sky
    set_canvas_bg(skycolor); // score bar on top of screen

    draw_rect({
      x: 0,
      y: 0
    }, canv_w, canv_h / 6, "black");
    timer.render(); // grass

    grass.render(); // building

    building.render();

    for (var i = 0; i < stories.length; i++) {
      var story = stories[i];
      story.render();
    }

    boss_door.render();

    for (var _i = 0; _i < doors.length; _i++) {
      doors[_i].render();
    }

    for (var _i2 = 0; _i2 < doors.length; _i2++) {
      doors[_i2].render_text();
    }

    for (var _i3 = 0; _i3 < doors.length; _i3++) {
      doors[_i3].render_walk_path();
    }

    boss.render();

    for (var _i4 = 0; _i4 < coworkers.length; _i4++) {
      var coworker = coworkers[_i4];
      coworker.render();
    }

    bank_account.render();
  }

  if (game_state == "highscores") {
    // display highscores
    draw_highscores(best_five_array);
  }
} // event listener functions


function mousedown(e) {
  if (game_state == "choose_mode") {
    current_pos = getXY_exact(e, xscale, yscale); // if (e.which == 1) { // LMB
    // check at which height --> which menu option is clicked

    var ypos = canv_h / 5 + canv_h / 20;
    var step = canv_h / 7;

    if (current_pos.x >= 0 && current_pos.x <= canv_w) {
      if (current_pos.y >= ypos + 1 * step && current_pos.y <= ypos + 2 * step) {
        game_state = "instructions1";
      }

      if (current_pos.y >= ypos + 2 * step && current_pos.y <= ypos + 3 * step) {
        re_init_all_vars();
        game_state = "game";
      }
    } // }

  } else if (game_state == "instructions1") {
    game_state = "instructions2";
  } else if (game_state == "instructions2") {
    game_state = "choose_mode";
  } else if (game_state == "game") {
    current_pos = getXY_exact(e, xscale, yscale); // if (e.which == 1) { // LMB
    // check whether clicked in doors

    for (var index = 0; index < doors.length; index++) {
      if (doors[index].clicked_on(current_pos)) {
        // first make sure the same door was not clicked on twice.
        var next_door = false;

        for (var index2 = 0; index2 < doors_path.length; index2++) {
          if (doors[index].same_door(doors_path[index2])) {
            next_door = true;
          }
        }

        if (next_door) {
          continue;
        } // not clicked on twice --> label the door


        doors_path.push(doors[index]);
        doors[index].label(doors_path.length);
      }
    } // checked whether clicked on opportunities
    // check if clicked on opportunities


    for (var _index7 = 0; _index7 < bank_account.opportunities.length; _index7++) {
      var opp = bank_account.opportunities[_index7];

      if (opp.clicked_on(current_pos)) {
        if (opp.type == "door") {
          upgrade(bank_account.balance - opp.worth, true, false);
        }

        if (opp.type == "floor") {
          upgrade(bank_account.balance - opp.worth, false, true);
        }
      }
    } // }

  } else if (game_state == "highscores") {
    // re-init all vars
    re_init_all_vars();
    game_state = "game";
  }
}

function tapped(e) {
  console.log("he3re");
  mousedown(e.changedTouches[0]);
}

function mousemove(e) {
  if (game_state == "choose_mode") {
    current_pos = getXY_exact(e, xscale, yscale); // check at which height --> which menu option is clicked

    var ypos = canv_h / 5 + canv_h / 20;
    var step = canv_h / 7;
    hover_arrows_menu = [];

    if (current_pos.x >= 0 && current_pos.x <= canv_w) {
      if (current_pos.y >= ypos + 1 * step && current_pos.y <= ypos + 2 * step) {
        hover_arrows_menu.push({
          x: canv_w / 4,
          y: ypos + 1.75 * step
        });
      }

      if (current_pos.y >= ypos + 2 * step && current_pos.y <= ypos + 3 * step) {
        hover_arrows_menu.push({
          x: canv_w / 4,
          y: ypos + 2.75 * step
        });
      }
    }
  }
}

update();