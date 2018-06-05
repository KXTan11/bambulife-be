var users = require('./user.controller.server.js');

module.exports = function (app) {
    // Accounts collection routes
    app.post('/api/user/', users.insert);
    app.get('/api/user/:id', users.get);
    app.post('/api/user/:id', users.update);
    app.delete('/api/user/:id', users.remove);
};