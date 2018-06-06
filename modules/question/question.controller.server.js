var Question = require('./question.model.server.js');

module.exports.get = function(req, res) {
    Question.get(req.params.id, req.query.projection, function(err, ret) {
        if (!err) {
            res.json(ret);
        } else {
            res.status(500);
            res.send(err);
        }
    });
};


module.exports.list = function(req, res) {
    Question.list(req.query.query, req.query.projection, req.query.options, function(err, ret) {
        if (!err) {
            res.json(ret);
        } else {
            res.status(500);
            res.send(err);
        }
    });
};

module.exports.update = function(req, res) {
    Question.update(req.params.id, req.body, function(err, ret) {
        if (!err) {
            res.json(ret);
        } else {
            res.status(500);
            res.send(err);
        }
    });
};

module.exports.insert = function(req, res) {
    Question.insert(req.body, function(err, ret) {
        if (!err) {
            res.json(ret);
        } else {
            res.status(500);
            res.send(err);
        }
    });
};

module.exports.remove = function(req, res) {
    Question.remove(req.params.id, function(err, ret) {
        if (!err) {
            res.json(ret);
        } else {
            res.status(500);
            res.send(err);
        }
    });
};