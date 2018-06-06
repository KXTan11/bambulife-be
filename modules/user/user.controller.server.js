var User = require('./user.model.server.js');

module.exports.get = function(req, res) {
    User.get(req.params.id, req.query.projection, function(err, ret) {
        if (!err) {
            res.json(ret);
        } else {
            res.status(500);
            res.send(err);
        }
    });
};

module.exports.list = function(req, res) {
    User.list(req.query.query, req.query.projection, req.query.options, function(err, ret) {
        if (!err) {
            res.json(ret);
        } else {
            res.status(500);
            res.send(err);
        }
    });
};

module.exports.update = function(req, res) {
    User.update(req.params.id, req.body, function(err, ret) {
        if (!err) {
            res.json(ret);
        } else {
            res.status(500);
            res.send(err);
        }
    });
};

module.exports.insert = function(req, res) {
    User.insert(req.body, function(err, ret) {
        if (!err) {
            res.json(ret);
        } else {
            res.status(500);
            res.send(err);
        }
    });
};

module.exports.remove = function(req, res) {
    User.remove(req.params.id, function(err, ret) {
        if (!err) {
            res.json(ret);
        } else {
            res.status(500);
            res.send(err);
        }
    });
};