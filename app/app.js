
var express = require('express'),
    config = require('./config.js');

module.exports.start = function (callback) {
    var app = express();
    // Start the app by listening on <port>
    app.listen(config.port, function () {
        // Logging initialization
        console.log('--');
        console.log(config.app.title);
        console.log('Environment:\t\t\t' + process.env.NODE_ENV);
        console.log('Port:\t\t\t\t' + config.port);
        console.log('Database:\t\t\t\t' + config.db.user + '@' + config.db.hostname);
        console.log('Date:\t\t\t\t' + new Date());
        console.log('--');
        if (callback) callback(app);
    });
};