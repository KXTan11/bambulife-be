var mysql = require('mysql'),
    config = require('./config.js');


var pool = mysql.createPool({
    connectionLimit : config.db.limit,
    host: config.db.host,
    user: config.db.user,
    password: config.db.password,
    database: config.db.name
});
var db = function() {};
module.exports = new db();

db.prototype.getConnection = function(callback) {
    pool.getConnection(function(err, connection) {
        callback(err, connection);
    });
};

db.prototype.releaseConnection = function(connection) {
    connection.release();
};

db.prototype.query = function(query, args, callback) {
    var _this = this;
    _this.getConnection(function (err, connection) {
        if (!err && connection) {
            var queryArguments = [query];
            if (args && args.length > 0) {
                queryArguments.push(args);
            }
            queryArguments.push(function (err, rows) {
                _this.releaseConnection(connection);
                callback(err, err ? null : rows);
            });
            connection.query.apply(connection, queryArguments);
        } else {
            callback(err ? err : new Error('Unable to connect to MySQL server.'));
        }
    });
};

db.prototype.get = function(table, id, projection, callback) {
    if (callback === undefined && typeof projection === 'function') {
        callback = projection;
        projection = null;
    }
    var _this = this;
    if (table && table.name) {
        var projectionString = '*';
        if (projection && projection.length > 0) {
            projectionString = projection.join(',');
        }
        var queryString = 'SELECT ' + projectionString + ' FROM ' + table.name + ' WHERE id=?';
        _this.query(queryString, [id], callback);
    } else {
        callback(new Error('Target table information not given.'));
    }
};


db.prototype.insert = function(table, data, callback) {
    var _this = this;
    var insertFunc = function(d) {
        var queryString = 'INSERT INTO ' + table.name + ' SET ?';
        _this.query(queryString, [d], callback);
    };

    if (table && table.name && data && Object.keys(data).length > 0) {
        if (table.hasOwnProperty('preSave')) {
            table.preSave(data, function(err, data) {
                if (!err) {
                    insertFunc(data);
                } else {
                    callback(err);
                }
            });
        } else {
            insertFunc(data);
        }
    } else {
        callback(new Error('Target table information not given.'));
    }
};

db.prototype.update = function(table, id, data, callback) {
    var _this = this;
    var updateFunc = function(d) {
        var queryFields = [];
        var queryParams = [];
        var queryString = 'UPDATE ' + table.name + ' SET ';
        Object.keys(d).forEach(function(field) {
            queryFields.push(field + '=?');
            queryParams.push(d[field]);
        });
        queryString += queryFields.join(',') + ' WHERE id=?';
        queryParams.push(id);
        _this.query(queryString, queryParams, callback);
    };
    if (table && table.name && data && Object.keys(data).length > 0) {
        if (table.hasOwnProperty('preSave')) {
            table.preSave(data, function(err, data) {
                if (!err) {
                    updateFunc(data);
                } else {
                    callback(err);
                }
            });
        } else {
            updateFunc(data);
        }

    } else {
        callback(new Error('Target table information not given.'));
    }
};

db.prototype.remove = function(table, id, callback) {
    var _this = this;
    if (table && table.name) {
        var queryString = 'DELETE FROM ' + table.name + ' WHERE id=?';
        _this.query(queryString, [id], callback);
    } else {
        callback(new Error('Target table information not given.'));
    }
};

db.prototype.end = function() {
    pool.end();
};