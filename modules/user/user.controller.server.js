var User = require('./user.model.server.js');

module.exports.get = function(req, res) {
    User.get(req.param.id, function(err, ret) {
        if (!err) {
            res.jsonp(ret);
        } else {

        }
    });
};

module.exports.update = function(req, res) {
    User.update(req.param.id, req.body, function(err, ret) {
        if (!err) {
            res.jsonp(ret);
        } else {

        }
    });
};

module.exports.insert = function(req, res) {
    User.insert(req.body, function(err, ret) {
        if (!err) {
            res.jsonp(ret);
        } else {

        }
    });
};

module.exports.remove = function(req, res) {
    User.remove(req.param.id, function(err, ret) {
        if (!err) {
            res.jsonp(ret);
        } else {

        }
    });
};