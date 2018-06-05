var db = require('../app/db.js');

var profileEnum = ['A', 'B', 'C', 'D'];
var User = function() {
    // Table name
    this.name = 'users';
    // Table definition
    this.fields = {
        id: {
            type: Number,
            options: {

            }
        },
        name: {
            type: String,
            options: {

            }
        },
        profile: {
            type: String,
            enum: profileEnum,
            options: {

            }
        }
    };
};
module.exports = new User();

/**
 * Helper functions
 */
var profileQuestionMap = [
    [0, 2000, 4000, 6000, 8000, 10000],
    [10000, 8000, 6000, 4000, 2000, 0]
];
function getUserProfile(answers) {
    var score = 0;
    for (var i=0; i<answers.length; i++) {
        var result = profileQuestionMap[i].findIndex(answers[i]);
        if (result >= 0) {
            score += result + 1;
        }
    }

    var profile;
    if (score >= 8) {
        profile = profileEnum[0];
    } else if (score >= 6) {
        profile = profileEnum[1];
    } else if (score >= 4) {
        profile = profileEnum[2];
    } else {
        profile = profileEnum[3];
    }
    return profile;
}

/**
 * API Functions
 */
function get(id, callback) {
    db.get(this, id, null, callback);
}

function preSave(data, callback) {
    try {
        if (data && data.answers) {
            data.profile = getUserProfile(data.answers);
        }
        callback(null, data);
    } catch(err) {
        callback(err);
    }
}


function insert(data, callback) {
    db.insert(this, data, function(err, row) {
        callback(err, row.profile);
    });
}

function update(id, data, callback) {
    db.update(this, id, data, callback);
}

function remove(id, callback) {
    db.remove(this, id, callback);
}


/**
 * Module API
 */
User.prototype.get = get;
User.prototype.preSave = preSave;
User.prototype.update = update;
User.prototype.insert = insert;
User.prototype.remove = remove;


