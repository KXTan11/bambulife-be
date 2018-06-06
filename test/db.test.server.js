var mocha = require('mocha'),
    should = require('should'),
    Promise = require('bluebird'),
    db = require('../app/db.js');


describe('MySQL DB wrapper unit test', function() {
    var table = {
        name: 'testUserTable',
        fields: {
            id: {
                type: 'INT',
                options: 'AUTO_INCREMENT PRIMARY KEY'
            },
            name: {
                type: 'VARCHAR',
                length: 255
            },
            profile: {
                type: 'ENUM',
                enum: ['A', 'B', 'C', 'D']
            }
        },
        preSave: function(connection, data) {
            if (data.profile === 'D') {
                data.profile = 'A';
            }
            return Promise.resolve(data);
        },
        postSave: function(connection, data) {
            if (data.name === 'post user') {
                data.post = 1;
            }
            return Promise.resolve(data);
        }
    };

    beforeEach(function populateSingleData(done) {
        db.getConnection(function(err, conn) {
            if (!err) {
                conn.should.be.ok();
                var createTableString = 'CREATE TABLE IF NOT EXISTS ' + table.name + ' (';
                var fieldStrings = [];
                Object.keys(table.fields).forEach(function(f) {
                    var field = table.fields[f];
                    var fieldString = f + ' ' + field.type;
                    if (field.type === 'ENUM' && field.enum && field.enum.length > 0) {
                        fieldString += '("' + field.enum.join('","') + '")';
                    } else {
                        if (field.length) {
                            fieldString += '(' + field.length + ')';
                        }
                    }
                    if (field.options) {
                        fieldString += ' ' + field.options;
                    }
                    fieldStrings.push(fieldString)
                });

                createTableString += fieldStrings.join(',') + ')';

                conn.query(createTableString, function (err, result) {
                    if (!err) {
                        conn.query('INSERT INTO ' + table.name + ' SET ? ON DUPLICATE KEY UPDATE profile="B"', {
                            id:1,
                            name: 'test user',
                            profile: 'B'
                        }, function (err) {
                            conn.release();
                            done(err);
                        });
                    } else {
                        done(err);
                    }
                });
            } else {
                done(err);
            }
        });
    });

    afterEach(function dropTestTable(done) {
        db.getConnection(function(err, conn) {
            if (!err) {
                conn.should.be.ok();
                conn.query('DROP TABLE ' + table.name, function (err) {
                    conn.release();
                    done(err);
                });
            } else {
                done(err);
            }
        })
    });
    after(function endConnection(done) {
       db.end();
       done();
    });

    it('should be able to run a query', function(done) {
        db.getConnection(function(err, connection) {
            should(err).be.not.ok();
            db.query(connection, 'SELECT * FROM ' + table.name, function(err, rows) {
                connection.release();
                should(err).be.not.ok();
                rows.should.be.ok();
                rows.length.should.equal(1);
                done();
            });
        });

    });

    it('should be able to run a get query', function(done) {
        var id = 1;
        db.get(table, id, null, function(err, result) {
            should(err).be.not.ok();
            result.should.be.ok();
            result.id.should.equal(id);
            done();
        });
    });


    it('should be able to run a list query', function(done) {
        db.list(table, {name: 'test user'}, ['profile'], {limit:1}, function(err, results) {
            should(err).be.not.ok();
            results.should.be.ok();
            results.length.should.be.equal(1);
            results[0].should.have.property('profile');
            results[0].should.not.have.property('name');
            results[0].should.not.have.property('id');
            done();
        });
    });

    it('should be able to run a update query', function(done) {
        var id = 1;
        var data = {
            profile: 'C',
            name: 'test user 2'
        };
        db.update(table, id, data,function(err, data) {
            should(err).be.not.ok();
            db.get(table, data.id, null, function(err, result) {
                should(err).be.not.ok();
                result.should.be.ok();
                result.id.should.equal(id);
                result.profile.should.equal(data.profile);
                result.name.should.equal(data.name);
                done();
            });
        });
    });


    it('should be able to run a update query and run preSave function', function(done) {
        var id = 1;
        var data = {
            profile: 'D',
            name: 'test user 3'
        };
        db.update(table, id, data,function(err, data) {
            should(err).be.not.ok();
            db.get(table, data.id, null, function(err, result) {
                should(err).be.not.ok();
                result.should.be.ok();
                result.id.should.equal(id);
                result.profile.should.equal('A');
                result.name.should.equal(data.name);
                done();
            });
        });
    });

    it('should be able to run a update query and run postSave function', function(done) {
        var id = 1;
        var data = {
            profile: 'D',
            name: 'post user'
        };
        db.update(table, id, data,function(err, data) {
            should(err).be.not.ok();
            data.post.should.equal(1);
            done();
        });
    });

    it('should be able to run a insert query', function(done) {
        var data = {
            profile: 'A',
            name: 'test user 4'
        };
        db.insert(table, data,function(err, data) {
            should(err).be.not.ok();
            db.get(table, data.id, null, function(err, result) {
                should(err).be.not.ok();
                result.should.be.ok();
                result.profile.should.equal(data.profile);
                result.name.should.equal(data.name);
                done();
            });
        });
    });

    it('should be able to run a insert query and run preSave function', function(done) {
        var data = {
            profile: 'D',
            name: 'test user 5'
        };
        db.insert(table, data,function(err, data) {
            should(err).be.not.ok();
            db.get(table, data.id, null, function(err, result) {
                should(err).be.not.ok();
                result.should.be.ok();
                result.profile.should.equal('A');
                result.name.should.equal(data.name);
                done();
            });
        });
    });


    it('should be able to run a insert query and run postSave function', function(done) {
        var data = {
            profile: 'D',
            name: 'post user'
        };
        db.insert(table, data,function(err, data) {
            should(err).be.not.ok();
            data.post.should.equal(1);
            done();
        });
    });


    it('should be able to run a get delete query using id only', function(done) {
        var id = 1;
        db.remove(table, id, function(err) {
            should(err).be.not.ok();
            db.get(table, id, null, function(err, result) {
                should(err).be.not.ok();
                result.should.be.not.ok();
                done();
            });

        });
    });


    it('should be able to run a get delete query', function(done) {
        var id = 1;
        db.removeQuery(table, {name: 'test user'}, function(err) {
            should(err).be.not.ok();
            db.get(table, id, null, function(err, result) {
                should(err).be.not.ok();
                result.should.be.not.ok();
                done();
            });

        });
    });
});