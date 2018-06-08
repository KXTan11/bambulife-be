var mocha = require('mocha'),
    should = require('should'),
    path = require('path');
global.__dirname = path.resolve(__dirname+'/../');
var db = require(global.__dirname + '/app/db.js');
var UserModel = require(global.__dirname + '/modules/user/user.model.server.js');




describe('User model unit test', function() {

    beforeEach(function populateSingleData(done) {
        var path = require('path');
        global.__dirname = path.resolve(__dirname+'/../');
        require('../scripts/initialiseDb.js')()
            .then(function() {
                return require('../scripts/populateDb.js')(require('../scripts/data.js'));
            })
            .asCallback(done);
    });

    afterEach(function dropTestTable(done) {
        require('../scripts/dropTables.js')(done);
    });

    after(function endConnection(done) {
        db.end();
        done();
    });
    describe('GET', function() {
        it('should be able to get user', function (done) {
            var id = 1;
            UserModel.get(id, null, function (err, ret) {
                should(err).not.be.ok();
                done();
            });
        });
    });

    describe('LIST', function() {
        it('should be able to list users', function (done) {
            var id = 1;
            UserModel.list({}, {}, {}, function (err, ret) {
                should(err).not.be.ok();
                done();
            });
        });
    });

    describe('INSERT', function() {
        it('should be able to insert new user and return profile', function(done) {
            var data = {
                name: 'test user',
                answers: [{id: 1, value:2000}, {id:2, value: 4000}]
            };
            var expected = 'C';
            UserModel.insert(data, function(err, ret) {
                should(err).not.be.ok();
                ret.should.be.ok();
                ret.should.equal(expected);
                done();
            });
        });

        it('should be able to insert new user and return profile 2', function(done) {
            var data = {
                name: 'test user',
                answers: [{id: 1, value:4000}, {id:2, value: 4000}]
            };
            var expected = 'B';
            UserModel.insert(data, function(err, ret) {
                should(err).not.be.ok();
                ret.should.be.ok();
                ret.should.equal(expected);
                done();
            });
        });
    });


    describe('UPDATE', function() {
        it('should be able to update user and return profile', function(done) {
            var data = {
                answers: [{id: 1, value:6000}, {id:2, value: 0}]
            };
            var id = 1;
            var expected = 'A';
            UserModel.update(id, data, function(err, ret) {
                should(err).not.be.ok();
                ret.should.be.ok();
                ret.should.equal(expected);
                done();
            });
        });
    });


    describe('DELETE', function() {
        it('should be able to delete user', function(done) {
            var id = 1;
            UserModel.remove(id, function(err, ret) {
                done();
            });
        });
    });

});