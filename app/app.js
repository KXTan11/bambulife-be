
var express = require('express'),
    bodyParser = require('body-parser'),
    path = require('path'),
    glob = require('glob'),
    config = require('./config.js');

global.__dirname = path.resolve(__dirname+'/../');
module.exports.start = function (callback) {
    var app = express();

    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());

    var routePaths = glob.sync('modules/**/*.routes.server.js');
    routePaths.forEach(function(r) {
        require('../' + r)(app);
    });
    // Start the app by listening on <port>
    app.listen(config.app.port, function () {
        // Logging initialization
        console.log('--');
        console.log(config.app.title);
        console.log('Environment:\t\t\t' + (process.env.NODE_ENV || 'development'));
        console.log('Port:\t\t\t\t' + config.app.port);
        console.log('Database:\t\t\t' + config.db.user + '@' + config.db.host);
        console.log('Date:\t\t\t\t' + new Date());
        console.log('--');
        if (callback) callback(app);
    });
};