/**
 * Created by HeydonFaber on 15-06-08.
 */

function randInt (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

var gen_imp_qualities = function(){

    var genNature = function(){
        var roll = randInt(1, 100)
        //A 'Mischievous' pet has higher than average speed but is likelier to have negative events occur to it and be
        //in a 'negative' mood
        if (roll >= 0 && roll <= 50){ return 'Mischievous' }
        //A 'Playful' pet has higher than average defence and is likelier to have positive events occur to it, however
        //it will not always listen to you
        else if (roll >= 51 && roll <= 75){ return 'Playful' }
        //A 'Evil' pet has higher than average attack, is likelier to have negative events occur to it however these
        //events have a chance to benefit the pet or you
        else if (roll >= 76 && roll <= 95){ return 'Evil' }
        //A 'Kind' pet tends to have a better mood, which means it will listen to you more often (Including in battle),
        //also likelier to have positive events occur to it, which are always beneficial
        else if (roll >= 96 && roll <= 100){ return 'Kind' }
    }

    var genAppearance = function(){
        var weight = randInt(50, 70).toString() + ' lbs';
        var height = randInt(70, 90).toString() + ' cm';
        var color, prefix = '';
        switch (randInt(1, 3)){
            case(1): prefix = ''; break;
            case(2): prefix = 'Light '; break;
            case(3): prefix = 'Dark '; break;
        }
        switch (randInt(1, 6)){
            case(1): color = prefix + 'Blue'; break;
            case(2): color = prefix + 'Green'; break;
            case(3): color = prefix + 'Red'; break;
            case(4): color = prefix + 'Orange'; break;
            case(5): color = prefix + 'Purple'; break;
            case(6): color = 'Black';
        }
        return {
            weight: weight,
            height: height,
            color: color
        }
    }

    var genStats = function(){
        var attack = randInt (6, 9);
        var defence = randInt (6, 9);
        var speed = randInt(10, 15);
        return {
            attack: attack,
            defence: defence,
            speed: speed
        }
    }

    var genGender = function(){
        switch(randInt(1,2)){
            case(1): return 'Male'; break;
            case(2): return 'Female'; break;
        }
    }

    return {
        nature: genNature(),
        gender: genGender(),
        appearance: genAppearance(),
        attack: genStats().attack,
        defence: genStats().defence,
        speed: genStats().speed,
        special_attributes: 'None'
    }
}

exports.IMP = function(owner_id, petname){
        var qualities_imp = gen_imp_qualities();
        petObject = {
            owner: owner_id,
            name: petname,
            type: 'Imp',
            lvl: 1,
            exp: 0,
            health: 100,
            status: 'Normal',
            mood: 'Temperate',
            hunger: 'Full',
            nature: qualities_imp.nature,
            gender: qualities_imp.gender,
            appearance: qualities_imp.appearance,
            attack: qualities_imp.attack,
            defence: qualities_imp.defence,
            speed: qualities_imp.speed,
            special_attributes: qualities_imp.special_attributes,
            message_action: ""
    }
    return petObject;
}

exports.petIntro = function (petObj, conn, stanza, ret_msg) {
    conn.send(ret_msg('A wild ' + newImp.appearance.color + ' ' + petObj.gender + ' ' + petObj.type + ' appears!', stanza));
    conn.send(ret_msg('it has the following stats...\nAttack: ' + petObj.attack + '\nDefence: '
        + newImp.defence + '\nSpeed: ' + petObj.speed, stanza));
    conn.send(ret_msg('and the following physical qualities...\n' + 'Height: ' + newImp.appearance.height
        + '\nWeight: ' + newImp.appearance.weight + '\nNature: ' + petObj.nature, stanza));
    conn.send(ret_msg('Type "name" to give the Imp a name or "reroll" to generate a new Imp', stanza));
}

