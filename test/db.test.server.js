var mocha = require('mocha'),
    should = require('should'),
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
        preSave: function(data, cb) {
            if (data.profile === 'D') {
                data.profile = 'A';
            }
            cb(null, data);
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
        db.query('SELECT * FROM ' + table.name, function(err, rows) {
            should(err).be.not.ok();
            rows.should.be.ok();
            rows.length.should.equal(1);
            done();
        });
    });

    it('should be able to run a get query', function(done) {
        var id = 1;
        db.get(table, id, function(err, rows) {
            should(err).be.not.ok();
            rows.should.be.ok();
            rows.length.should.equal(1);
            rows[0].id.should.equal(id);
            done();
        });
    });

    it('should be able to run a update query', function(done) {
        var id = 1;
        var data = {
            profile: 'C',
            name: 'test user 2'
        };
        db.update(table, id, data,function(err) {
            should(err).be.not.ok();
            db.get(table, id, function(err, rows) {
                should(err).be.not.ok();
                rows.should.be.ok();
                rows.length.should.equal(1);
                rows[0].id.should.equal(id);
                rows[0].profile.should.equal(data.profile);
                rows[0].name.should.equal(data.name);
                done();
            });
        });
    });


    it('should be able to run a update query adn run preSave function', function(done) {
        var id = 1;
        var data = {
            profile: 'D',
            name: 'test user 3'
        };
        db.update(table, id, data,function(err) {
            should(err).be.not.ok();
            db.get(table, id, function(err, rows) {
                should(err).be.not.ok();
                rows.should.be.ok();
                rows.length.should.equal(1);
                rows[0].id.should.equal(id);
                rows[0].profile.should.equal('A');
                rows[0].name.should.equal(data.name);
                done();
            });
        });
    });

    it('should be able to run a insert query', function(done) {
        var data = {
            profile: 'A',
            name: 'test user 4'
        };
        db.insert(table, data,function(err, result) {
            should(err).be.not.ok();
            db.get(table, result.insertId, function(err, rows) {
                should(err).be.not.ok();
                rows.should.be.ok();
                rows.length.should.equal(1);
                rows[0].profile.should.equal(data.profile);
                rows[0].name.should.equal(data.name);
                done();
            });
        });
    });

    it('should be able to run a insert query and run preSave function', function(done) {
        var data = {
            profile: 'D',
            name: 'test user 5'
        };
        db.insert(table, data,function(err, result) {
            should(err).be.not.ok();
            db.get(table, result.insertId, function(err, rows) {
                should(err).be.not.ok();
                rows.should.be.ok();
                rows.length.should.equal(1);
                rows[0].profile.should.equal('A');
                rows[0].name.should.equal(data.name);
                done();
            });
        });
    });


    it('should be able to run a get delete query', function(done) {
        var id = 1;
        db.remove(table, id, function(err) {
            should(err).be.not.ok();
            db.get(table, id, function(err, rows) {
                should(err).be.not.ok();
                rows.should.be.ok();
                rows.length.should.equal(0);
                done();
            });

        });
    });
});