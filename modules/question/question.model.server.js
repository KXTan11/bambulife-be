var db = require(global.__dirname + '/app/db.js'),
    Promise = require('bluebird');

var Question = function() {
    // Table name
    this.name = 'questions';
    // Table definition
    this.fields = {
        id: {
            type: 'INT',
            options: 'AUTO_INCREMENT PRIMARY KEY'
        },
        question: {
            type: 'VARCHAR',
            length: 255
        }
    };
};
module.exports = new Question();

/**
 * API Functions
 */

function get(id, projection, callback) {
    return db.get(this, id, projection, callback);
}

function list(query, projection, options, callback) {
    return db.list(this, query, projection, options, callback);
}

function postSave(data, callback) {
    var Answer = require('../answers/answers.model.server.js');
    var promise = Promise.resolve(data);
    if (data && data.id) {
        promise = promise.then(function(data) {
            return Answer.removeAll(data.id)
                .then(function() {
                    return Promise.resolve(data);
                })
                .catch(function(err) {
                    return Promise.reject(err);
                });
        })
    }
    if (data && data.answers) {
        promise = promise.then(function(data) {
           return Promise.map(data.answers, function(a) {
               a.questionId = data.id;
               return Answer.insert(a);
           }).then(function() {
               return Promise.resolve(data);
           })
           .catch(function(err) {
               return Promise.reject(err);
           });
        });
    }
    promise = promise.catch(function(err) {
        return Promise.reject(err);
    });

    if (callback && typeof callback === 'function') {
        promise.asCallback(callback);
    } else {
        return promise;
    }
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

/**
 * Module API
 */
Question.prototype.list = list;
Question.prototype.get = get;
Question.prototype.postSave = postSave;
Question.prototype.update = update;
Question.prototype.insert = insert;
Question.prototype.remove = remove;


