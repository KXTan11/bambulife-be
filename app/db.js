var mysql = require('mysql'),
    config = require('./config.js'),
    Promise = require('bluebird');

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
    var promise = Promise
        .fromCallback(function(pCb) {
            pool.getConnection(pCb);
        })
        .catch(function(err) {
            return Promise.reject(err);
        });

    if (callback && typeof callback === 'function') {
        promise.asCallback(callback);
    } else {
        return promise;
    }
};

db.prototype.releaseConnection = function(connection) {
    connection.release();
};

db.prototype.query = function(connection, query, args, callback) {
    var _this = this;
    var queryArguments = [query];
    if (args && args.length > 0) {
        queryArguments.push(args);
    }
    var promise = Promise
        .fromCallback(function(pCb) {
            queryArguments.push(pCb);
            connection.query.apply(connection, queryArguments);
        })
        .catch(function(err) {
            return Promise.reject(err);
        });

    if (callback && typeof callback === 'function') {
        promise.asCallback(callback);
    } else {
        return promise;
    }
};

db.prototype.list = function(table, query, projection, options, callback) {
    var _this = this;
    var promise;
    if (table && table.name) {
        var queryParams = [];
        var projectionString = '*';
        if (projection && projection.length > 0) {
            projectionString = projection.join(',');
        }
        var queryString = 'SELECT ' + projectionString + ' FROM ' + table.name;
        if (query && Object.keys(query).length > 0) {
            var queryS = [];
            Object.keys(query).forEach(function(q) {
                queryS.push(q + '=?');
                queryParams.push(query[q]);
            });
            queryString += ' WHERE ' + queryS.join(' AND ');
        }
        if (options && options.sort && options.sort.length > 0) {
            var sortString = [];
            options.sort.forEach(function(s) {
                sortString.push(s.field + ' ' + s.sort > 0 ? 'ASC' : 'DESC');
            });
            queryString += 'ORDER BY ' + sortString.join(',');
        }

        if (options.limit) {
            queryString += ' LIMIT ' + options.limit;
        }

        if (options.offset) {
            queryString += ' OFFSET ' + options.offset;
        }

        promise = _this.getConnection()
            .then(function(connection) {
                return _this.query(connection, queryString, queryParams)
                    .then(function(results) {
                        _this.releaseConnection(connection);
                        return Promise.resolve(results && results.length && results);
                    })
                    .catch(function(err) {
                        return Promise.reject(err);
                    });
            }, function() {
                return Promise.reject(new Error('Unable to connect to MySql database '))
            })
            .catch(function(err) {
                return Promise.reject(err);
            });

    } else {
        promise = Promise.reject(new Error('Target table information not given.'));
    }

    if (callback && typeof callback === 'function') {
        promise.asCallback(callback);
    } else {
        return promise;
    }
};

db.prototype.get = function(table, id, projection, callback) {
    var _this = this;
    var promise;
    if (table && table.name) {
        var projectionString = '*';
        if (projection && projection.length > 0) {
            projectionString = projection.join(',');
        }
        var queryString = 'SELECT ' + projectionString + ' FROM ' + table.name + ' WHERE id=?';
        promise = _this.getConnection()
            .then(function(connection) {
                return _this.query(connection, queryString, [id])
                    .then(function(results) {
                        _this.releaseConnection(connection);
                        return Promise.resolve(results && results.length && results[0]);
                    })
                    .catch(function(err) {
                        return Promise.reject(err);
                    });
            }, function() {
                return Promise.reject(new Error('Unable to connect to MySql database '))
            })
            .catch(function(err) {
                return Promise.reject(err);
            });
    } else {
        promise = Promise.reject(new Error('Target table information not given.'));
    }

    if (callback && typeof callback === 'function') {
        promise.asCallback(callback);
    } else {
        return promise;
    }
};

db.prototype.insert = function(table, data, callback) {
    var _this = this;
    var promise;


    if (table && table.name && data && Object.keys(data).length > 0) {
        promise = _this.getConnection()
            .then(function(connection) {
                var insertPromise = Promise.resolve(data);
                var transaction = table.preSave || table.postSave;
                if (transaction) {
                    insertPromise = insertPromise.then(function (data) {
                        return Promise.fromCallback(function (pCb) {
                            connection.beginTransaction(function (err) {
                                pCb(err, data);
                            });
                        });
                    });
                }
                if (table.preSave) {
                    insertPromise = insertPromise.then(function(data) {
                        return table.preSave(connection, data);
                    });
                }
                insertPromise = insertPromise.then(function(data) {
                    return _this.query(connection, 'INSERT INTO ' + table.name + ' SET ?', [data])
                        .then(function(result) {
                            data.id = result.insertId;
                            return Promise.resolve(data);
                        })
                });
                if (table.postSave) {
                    insertPromise = insertPromise.then(function(data) {
                        return table.postSave(connection, data);
                    });
                }
                insertPromise = insertPromise.then(function(data) {
                    if (transaction) {
                        return Promise.fromCallback(function(pCb) {
                            connection.commit(function () {
                                _this.releaseConnection(connection);
                                pCb(null, data);
                            });
                        });
                    } else {
                        _this.releaseConnection(connection);
                        return Promise.resolve(data);
                    }
                });

                return insertPromise.catch(function(err) {
                    if (transaction) {
                        return Promise.fromCallback(function(pCb) {
                            connection.rollback(function () {
                                _this.releaseConnection(connection);
                                pCb(err);
                            });
                        });
                    } else {
                        _this.releaseConnection(connection);
                        return Promise.reject(err);
                    }
                })
            }, function() {
                return Promise.reject(new Error('Unable to connect to MySql database '))
            })
            .catch(function(err) {
                return Promise.reject(err);
            });
    } else {
        promise = Promise.reject(new Error('Target table information not given.'));
    }

    if (callback && typeof callback === 'function') {
        promise.asCallback(callback);
    } else {
        return promise;
    }
};

db.prototype.update = function(table, id, data, callback) {
    var _this = this;
    var promise;

    if (table && table.name && data && Object.keys(data).length > 0) {
        data.id = id;
        promise = _this.getConnection()
            .then(function(connection) {
                var updatePromise = Promise.resolve(data);
                var transaction = table.preSave || table.postSave;
                if (transaction) {
                    updatePromise = updatePromise.then(function (data) {
                        return Promise.fromCallback(function (pCb) {
                            connection.beginTransaction(function (err) {
                                pCb(err, data);
                            });
                        });
                    });
                }
                if (table.preSave) {
                    updatePromise = updatePromise.then(function(data) {
                        return table.preSave(connection, data);
                    });
                }
                updatePromise = updatePromise.then(function(data) {
                    var queryFields = [];
                    var queryParams = [];
                    var queryString = 'UPDATE ' + table.name + ' SET ';
                    Object.keys(data).forEach(function(field) {
                        queryFields.push(field + '=?');
                        queryParams.push(data[field]);
                    });
                    queryString += queryFields.join(',') + ' WHERE id=?';
                    queryParams.push(id);
                    return _this.query(connection, queryString, queryParams)
                        .then(function() {
                            return Promise.resolve(data);
                        })
                });
                if (table.postSave) {
                    updatePromise = updatePromise.then(function(data) {
                        return table.postSave(connection, data);
                    });
                }
                updatePromise = updatePromise.then(function(data) {
                    if (transaction) {
                        return Promise.fromCallback(function(pCb) {
                            connection.commit(function () {
                                _this.releaseConnection(connection);
                                pCb(null, data);
                            });
                        });
                    } else {
                        _this.releaseConnection(connection);
                        return Promise.resolve(data);
                    }
                });

                return updatePromise.catch(function(err) {
                    if (transaction) {
                        return Promise.fromCallback(function(pCb) {
                            connection.rollback(function () {
                                _this.releaseConnection(connection);
                                pCb(err);
                            });
                        });
                    } else {
                        _this.releaseConnection(connection);
                        return Promise.reject(err);
                    }
                })
            }, function() {
                return Promise.reject(new Error('Unable to connect to MySql database '))
            })
            .catch(function(err) {
                return Promise.reject(err);
            });
    } else {
        promise = Promise.reject(new Error('Target table information not given.'));
    }

    if (callback && typeof callback === 'function') {
        promise.asCallback(callback);
    } else {
        return promise;
    }
};

db.prototype.remove = function(table, id, callback) {
    var _this = this;
    var promise;
    if (table && table.name) {
        promise = _this.getConnection()
            .then(function(connection) {
                return _this.query(connection, 'DELETE FROM ' + table.name + ' WHERE id=?', [id])
                        .then(function() {
                            _this.releaseConnection(connection);
                            return Promise.resolve(id);
                        })
                    .catch(function(err) {
                        return Promise.reject(err);
                    });
            }, function() {
                return Promise.reject(new Error('Unable to connect to MySql database '))
            })
            .catch(function(err) {
                return Promise.reject(err);
            });
    } else {
        promise = Promise.reject(new Error('Target table information not given.'));
    }

    if (callback && typeof callback === 'function') {
        promise.asCallback(callback);
    } else {
        return promise;
    }
};

db.prototype.removeQuery = function(table, query, callback) {
    var _this = this;
    var promise;
    if (table && table.name) {
        promise = _this.getConnection()
            .then(function(connection) {
                return _this.query(connection, 'DELETE FROM ' + table.name + ' WHERE ?', [query])
                    .then(function(results) {
                        _this.releaseConnection(connection);
                        return Promise.resolve(results && results.length && results[0]);
                    })
                    .catch(function(err) {
                        return Promise.reject(err);
                    });
            }, function() {
                return Promise.reject(new Error('Unable to connect to MySql database '))
            })
            .catch(function(err) {
                return Promise.reject(err);
            });
    } else {
        promise = Promise.reject(new Error('Target table information not given.'));
    }

    if (callback && typeof callback === 'function') {
        promise.asCallback(callback);
    } else {
        return promise;
    }
};

db.prototype.end = function() {
    pool.end();
};