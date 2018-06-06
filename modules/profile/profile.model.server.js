var db = require(global.__dirname + '/app/db.js'),
    Promise = require('bluebird');

var Profile = function() {
    // Table name
    this.name = 'profiles';
    // Table definition
    this.fields = {
        id: {
            type: 'INT',
            options: 'AUTO_INCREMENT PRIMARY KEY'
        },
        type: {
            type: 'ENUM',
            enum: ['A', 'B', 'C', 'D']
        },
        minScore: {
            type: 'INT',
            options: 'UNIQUE'
        }
    };
};
module.exports = new Profile();

/**
 * API Functions
 */
function get(id, projection, callback) {
    return db.get(this, id, projection, callback);
}

function list(query, projection, options, callback) {
    return db.list(this, query, projection, options, callback);
}

function insert(data, callback) {
    return db.insert(this, data, callback);
}

function update(id, data, callback) {
    return db.update(this, id, data, callback);
}

function remove(id, callback) {
    return db.remove(this, id, callback);
}

function getProfile(score, callback) {
    var sqlString = 'SELECT * FROM ' + this.name + ' WHERE minScore <=? ORDER BY minScore DESC LIMIT 1';
    var promise = db.getConnection()
        .then(function(connection) {
            return db.query(connection, sqlString, [score])
                .then(function(results) {
                    db.releaseConnection(connection);
                    if (results && results.length > 0) {
                        return Promise.resolve(results[0].id);
                    } else {
                        return Promise.reject(new Error('Unable to find related user profile'));
                    }
                })
                .catch(function(err) {
                    return Promise.reject(err);
                });
        })
        .catch(function(err) {
            return Promise.reject(err);
        });

    if (callback && typeof callback === 'function') {
        promise.asCallback(callback);
    } else {
        return promise;
    }
}



/**
 * Module API
 */
Profile.prototype.get = get;
Profile.prototype.list = list;
Profile.prototype.update = update;
Profile.prototype.insert = insert;
Profile.prototype.remove = remove;
Profile.prototype.getProfile = getProfile;

