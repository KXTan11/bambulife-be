var db = require(global.__dirname + '/app/db.js');

var Answer = function() {
    // Table name
    this.name = 'answers';
    // Table definition
    this.fields = {
        id: {
            type: 'INT',
            options: 'AUTO_INCREMENT PRIMARY KEY'
        },
        questionId: {
            type: 'INT',
            options: 'NOT NULL'
        },
        value: {
            type: 'VARCHAR',
            length: 255
        },
        score: {
            type: 'INT'
        }
    };
};
module.exports = new Answer();

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

function removeAll(questionId, callback) {
    return db.removeQuery(this, {questionId: questionId}, callback);
}

/**
 * Module API
 */
Answer.prototype.get = get;
Answer.prototype.list = list;
Answer.prototype.update = update;
Answer.prototype.insert = insert;
Answer.prototype.remove = remove;
Answer.prototype.removeAll = removeAll;


