var db = require('../app/db.js'),
    Promise = require('bluebird');
module.exports = function populateDb(populateData, callback) {
    return db.getConnection().then(function(conn) {
        return Promise
            .mapSeries(Object.keys(populateData), function(tablename) {
                return populateTable(conn, tablename, populateData[tablename])
            })
            .then(function() {
                db.releaseConnection(conn);
                return Promise.resolve();
            });
    });

    if (callback && typeof callback === 'function') {
        promise.asCallback(callback);
    } else {
        return promise;
    }

    function populateTable(connection, table, data) {
        table = {name: table};
        return Promise.mapSeries(data, function(d) {
            return db.insert(table, d)
                .catch(function(err) {
                    return Promise.resolve();
                });
        });
    }
};
