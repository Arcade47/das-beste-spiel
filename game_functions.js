// functions

function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
  
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
  
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
  
      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
  
    return array;
}

function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}  

function init_coworker_types(min_dur, max_dur) {

    // shuffle coworker inds
    var cw_inds = [...Array(coworkers.length).keys()];
    shuffle(cw_inds); // TODO make sure that no output is needed

    // set the types and corresponding matches
    for (let index = 0; index < Math.floor(cw_inds.length/2); index++) {
        var cw_ind = cw_inds[index];
        var mirror_ind = cw_inds[cw_inds.length - 1 - index];
        coworkers[cw_ind].type = 0;
        coworkers[mirror_ind].type = 1;
        coworkers[mirror_ind].match_coworker = coworkers[cw_ind];
    }
    if (coworkers.length%2 != 0) { // odd number --> add extra talker
        coworkers[cw_inds[cw_inds.length-1]].type = 0;
    }

    // apply durs
    var step = (max_dur - min_dur)/cw_inds.length;
    var dur = min_dur;
    for (let index = 0; index < cw_inds.length; index++) {
        coworkers[cw_inds[index]].awake_time = dur;
        coworkers[cw_inds[index]].awake_time_left = dur;
        dur += step;
    }

    shuffle(cw_inds);

    var dur = min_dur;
    for (let index = 0; index < cw_inds.length; index++) {
        coworkers[cw_inds[index]].focus_time = dur;
        coworkers[cw_inds[index]].focus_time_left = dur;
        dur += step;
    }

}

function reinit_new_coworker_types(min_dur, max_dur, new_door, new_floor) {
    // goal: keep the ones that are already included and place them in the list of coworkers
    // place them correctly in matrix

    // get the new members from whole list of coworkers
    var new_members = [];
    if (new_floor) {
        new_members = new_coworkers.slice(1, n_offices_per_floor - 1);
    }
    if (new_door) {
        for (let floor_n = 0; index < building.n_floors; floor_n++) {
            door_n = (n_offices_per_floor - 1) + floor_n*n_offices_per_floor;
            new_members.push(new_coworkers[door_n]);
        }
    }

    // randomly set them as talkers or sleepers
    var rand_type_order = [];
    for (let index = 0; index < Math.floor(new_members.length/2); index++) {
        rand_type_order.push(0);
        rand_type_order.push(1);
    }
    if (rand_type_order.length%2 != 0) { // odd number --> add extra talker
        rand_type_order.push(0);
    }
    shuffle(rand_type_order);
    for (let index = 0; index < new_members.length; index++) {
        new_members[index].type = rand_type_order[index];
    }

    // append them to old array in correct places
    if (new_floor) {
        coworkers.unshift(new_members);
    }
    if (new_door) {
        var coworkers_buffer = [];
        var cw_ind = 0;
        var ncw_ind = 0;
        for (let index = 0; index < coworkers.length; index++) {
            coworkers_buffer.push(coworkers[index]);
            // test if last door
            if ((index + 1)%(n_offices_per_floor - 1) == 0) {
                coworkers_buffer.push(new_coworkers[ncw_ind]);
                ncw_ind += 1;
            }
        }
        coworkers = coworkers_buffer;
    }

    // set new matching people
    // get indices of talkers
    var talkers = [];
    for (let index = 0; index < coworkers.length; index++) {
        if (coworkers[index].type == 0) {
            talkers.push(index);
        }
    }

    for (let index = 0; index < coworkers.length; index++) {
        if (coworkers[index].type == 1) {
            
        }
        var cw_ind = cw_inds[index];
        var mirror_ind = cw_inds[cw_inds.length - 1 - index];
        coworkers[cw_ind].type = 0;
        coworkers[mirror_ind].type = 1;
        coworkers[mirror_ind].match_coworker = coworkers[cw_ind];
    }

}

function init_stories(n_floors, upgrade=false) {
    for (let index = 0; index < n_floors; index++) {
        stories.push(new Story(index, upgrade));
    }
}

function sendMail(score) {
    var link = "mailto:nico.adelhoefer@ukdd.de"
             + "&subject=" + escape("BestGameScore")
             + "&body=" + escape(score)
    ;
    window.location.href = link;
}

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
}

function delete_cookie(cname) {
    document.cookie = cname + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/';
  }

function highscore_list_to_cookie_format(hs_list) {
    return hs_list.join('|');
}

function highscore_list_from_cookie_format(hs_list, tonum) {
    var hs_array = hs_list.split('|');
    if (tonum) {
        var output = [];
        for (let index = 0; index < hs_array.length; index++) {
            const val = hs_array[index];
            var num = parseInt(val);
            if (!isNaN(num)) {
                output.push(num);
            }
        }
        return output;
    } else {
        if (hs_array.length == 1) {
            if (hs_array[0].length == "") {
                return [];
            }
        }
        return hs_array;
    }
}

function get_scores(pairs) {
    var scores = [];
    for (let index = 0; index < pairs.length; index++) {
        const pair = pairs[index];
        scores.push(pair.split("|a|")[1]);
    }
    return scores;
}

function get_ind_of_highscore(value, scores) {
    // gets index of already ordered list

    // for (let index = 0; index < scores.length; index++) {
    //     const score = scores[index];
    //     if (index > 4) {
    //         break;
    //     }
    //     if (value > score) {
    //         return index;
    //     }
    // }

    if (value <= 0) {
        return "no highscore";
    } else if (scores.length < 5) { // worst score but still room on the list
        return "append";
    } else if (scores[4] >= value) {
        return "no highscore";
    } else {
        return "append";
    }

}

function re_init_all_vars() {

    // gameplay-relevant parameters
    cost_per_door = 15000;
    time_left = 300; // 3.5 minutes seem realistic
    n_floors = 1;
    n_offices_per_floor = 4;
    floor_height = (canv_h - 1/6)/(n_floors+2);
    money = 100000; // realistic start: 500000
    min_awake_dur = 0.05*time_left;
    max_awake_dur = 1.0*time_left;
    walk_speed = canv_w/500;
    cost_of_sleep_per_person_per_frame = 20; // careful: time in frames, not seconds
    boss_productivity_per_person_per_frame = 12; // gain of money
    scare_tolerance = 0.0625*canv_w; // how near can coworkers come to boss to not be scared?
    door_check_dur = 0.1 // seconds to wait in front of each door
    stairway_w = canv_w/(11);//(13 - n_offices_per_floor); 
    hallway_w = n_offices_per_floor*canv_w/10;

    // physics
    goal_tolerance = walk_speed/2

    // containers
    coworkers = [];
    stories = [];
    doors = [];
    doors_path = []; // gets emptied when a door is reached

    // vars that keep track of game states
    current_pos = {x: 0, y: 0};
    startTime = new Date(); // initialization

    // fill containers with initial values
    // create stories
    building = new Building(); // also initializes people
    // instantiate text displays after building because building changes canvas width
    bank_account = new BankAccount(money);
    timer = new Timer(time_left);
    grass = new Grass();
    init_stories(n_floors); // seperate function because Story extends Building --> too much recursion otherwise
    init_coworker_types(min_awake_dur, max_awake_dur); // initialize properties of coworkers
}

function upgrade(new_n_floors, new_n_doors, new_money) {
    bank_account.balance = new_money;
    n_floors = new_n_floors;
    n_offices_per_floor = new_n_doors;
    floor_height = (canv_h - 1/6)/(n_floors+2);
    stairway_w = canv_w/(11);//(13 - n_offices_per_floor); 
    hallway_w = n_offices_per_floor*canv_w/10;

    // containers
    coworkers = [];
    stories = [];
    doors = [];
    doors_path = []; // gets emptied when a door is reached

    building = new Building(); // also initializes people
    init_stories(n_floors, true); // seperate function because Story extends Building --> infinite recursion otherwise
    reinit_coworker_types(min_awake_dur, max_awake_dur); // initialize properties of coworkers
}

function show_start_screen() {
    set_canvas_bg("black");
    draw_canvas_text_flex("Ready", {x: canv_w/2, y: canv_h/2}, "white", canv_w/40, align="center");
}