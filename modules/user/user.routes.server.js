var users = require('./user.controller.server.js');
var express = require('express');
module.exports = function (app) {
    // Accounts collection routes
    app.route('/api/user')
        .post(users.insert)
        .get(users.list);
    app.route('/api/user/:id')
        .get(users.get)
        .post(users.update)
        .delete(users.remove);
};