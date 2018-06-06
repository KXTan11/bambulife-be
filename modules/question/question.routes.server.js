var questions = require('./question.controller.server.js');

module.exports = function (app) {
    // Accounts collection routes
    app.route('/api/question')
        .post(questions.insert)
        .get(questions.list);
    app.route('/api/question/:id')
        .get(questions.get)
        .post(questions.update)
        .delete(questions.remove);
};