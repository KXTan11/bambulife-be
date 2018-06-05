var mocha = require('mocha');
var userModel = require('../modules/user/user.model.server.js');

describe('User model unit test', function() {

    describe('GET', function() {
        it('should be able to get user', function (done) {
            var id = 1;
            userModel.get(id, function (err, ret) {
                (err).should.not.be.ok();
                done();
            });
        });
    });

    describe('INSERT', function() {
        it('should be able to insert new user and return profile', function(done) {
            var data = {
                name: 'test user',
                answers: [2000, 4000]
            };
            var expected = 'B';
            userModel.insert(data, function(err, ret) {
                (err).should.not.be.ok();
                ret.should.be.ok();
                ret.profile.should.equal(expected);
                done();
            });
        });

        it('should be able to insert new user and return profile 2', function(done) {
            var data = {
                name: 'test user',
                answers: [0, 0]
            };
            var expected = 'D';
            userModel.insert(data, function(err, ret) {
                (err).should.not.be.ok();
                ret.should.be.ok();
                ret.profile.should.equal(expected);
                done();
            });
        });
    });


    describe('UPDATE', function() {
        it('should be able to update user and return profile', function(done) {
            var data = {
                answers: [6000, 4000]
            };
            var id = 1;
            var expected = 'A';
            userModel.update(id, data, function(err, ret) {
                (err).should.not.be.ok();
                ret.should.be.ok();
                ret.profile.should.equal(expected);
                done();
            });
        });
    });


    describe('DELETE', function() {
        it('should be able to delete user', function(done) {
            var id = 1;
            userModel.remove(id, function(err, ret) {
                done();
            });
        });
    });

});