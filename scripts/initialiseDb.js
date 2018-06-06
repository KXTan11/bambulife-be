var db = require('../app/db.js'),
    Promise = require('bluebird'),
    glob = require('glob');

module.exports= function initialise(callback) {
    var promise = db.getConnection()
        .then(function(conn) {
            var modelPaths = glob.sync('modules/**/*.model.server.js');
            if (modelPaths && modelPaths.length > 0) {
                return Promise
                    .mapSeries(modelPaths, function(modelPath) {
                        return createTable(conn, require('../' + modelPath))
                    })
                    .then(function() {
                        db.releaseConnection(conn);
                        return Promise.resolve();
                    });
            } else {
                return Promise.resolve();
            }
        })
        .catch(function(err) {
            return Promise.reject(err);
        });

    if (callback && typeof callback === 'function') {
        promise.asCallback(callback);
    } else {
        return promise;
    }

    function createTable(connection, table) {
        var createTableString = 'CREATE TABLE IF NOT EXISTS ' + table.name + ' (';
        var fieldStrings = [];
        Object.keys(table.fields).forEach(function(f) {
            var field = table.fields[f];
            var fieldString = f + ' ' + field.type;
            if (field.type === 'ENUM' && field.enum && field.enum.length > 0) {
                fieldString += '("' + field.enum.join('","') + '")';
            } else {
                if (field.length) {
                    fieldString += '(' + field.length + ')';
                }
            }
            if (field.options) {
                fieldString += ' ' + field.options;
            }
            fieldStrings.push(fieldString)
        });

        createTableString += fieldStrings.join(',') + ')';
        return connection.query(createTableString, null);
    }
};
