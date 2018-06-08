var db = require(global.__dirname + '/app/db.js'),
    Promise = require('bluebird');

var Answer = require(global.__dirname + '/modules/answer/answer.model.server.js');
var Profile = require(global.__dirname + '/modules/profile/profile.model.server.js');

var User = function() {
    // Table name
    this.name = 'users';
    // Table definition
    this.fields = {
        id: {
            type: 'INT',
            options: 'AUTO_INCREMENT PRIMARY KEY'
        },
        name: {
            type: 'VARCHAR',
            length: 255
        },
        profileId: {
            type: 'INT'
        }
    };
};
module.exports = new User();

/**
 * Helper functions
 */
function getUserProfile(answers, callback) {
    var promise = Promise.map(answers, function(answer) {
        return Answer.list({questionId: answer.id, value: String(answer.value)}, ['score'], {limit:1})
            .then(function(results) {
                return Promise.resolve((results && results.length > 0 && results[0].score) || 0)
            })
            .catch(function(err) {
                return Promise.reject(err);
            });
        });
    promise = promise
        .then(function(scores) {
            var total = scores.reduce(function(total, score) {
                return total + score;
            });
            return Profile.getProfile(total);
        })
    .catch(function(err) {
        return Promise.reject(err);
    });

    promise = promise.catch(function(err) {
        return Promise.reject(err);
    });

    if (callback && typeof callback === 'function') {
        promise.asCallback(callback);
    } else {
        return promise;
    }

}

/**
 * API Functions
 */
function get(id, projection, callback) {
    return db.get(this, id, projection, callback);
}

function list(query, projection, options, callback) {
    return db.list(this, query || {} , projection || {} , options || {}, callback);
}

function preSave(connection, data) {
    var promise = Promise.resolve(data);
    if (data && data.answers) {
        promise = getUserProfile(data.answers)
            .then(function(profile) {
                data.profileId = profile;
                delete data.answers;
                return Promise.resolve(data);
            });
    }
    return promise;
}


function insert(data, callback) {
    var promise = db.insert(this, data)
        .then(function(data) {
            return Profile.get(data.profileId);
        })
        .then(function(result) {
            return Promise.resolve(result && result.type);
        });
    promise = promise.catch(function(err) {
        return Promise.reject(err);
    });

    if (callback && typeof callback === 'function') {
        promise.asCallback(callback);
    } else {
        return promise;
    }

}

function update(id, data, callback) {
    var promise = db.update(this, id, data)
        .then(function() {
            return Profile.get(data.profileId);
        })
        .then(function(result) {
            return Promise.resolve(result && result.type);
        });
    promise = promise.catch(function(err) {
        return Promise.reject(err);
    });

    if (callback && typeof callback === 'function') {
        promise.asCallback(callback);
    } else {
        return promise;
    }
}

function remove(id, callback) {
    return db.remove(this, id, callback);
}


/**
 * Module API
 */
User.prototype.get = get;
User.prototype.list = list;
User.prototype.preSave = preSave;
User.prototype.update = update;
User.prototype.insert = insert;
User.prototype.remove = remove;


