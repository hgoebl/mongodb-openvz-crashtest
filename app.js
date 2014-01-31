"use strict";

var config = require('./config.json'),
    async = require('async'),
    crypto = require('crypto'),
    Db = require('mongodb').Db,
    Server = require('mongodb').Server,
    ObjectID = require('mongodb').ObjectID;

async.waterfall([
    function openDb(callback) {
        var db = new Db(
            config.mongo.db_name,
            new Server(config.mongo.host, config.mongo.port, {auto_reconnect: true}, {}), {safe: true}),
            context = {};

        db.open(function (error, db) {
            if (error) {
                console.error(error);
                callback('unable to open mongodb');
                return;
            }
            context.dbConnection = db;

            process.on('exit', function () {
                db.close(function (error) {
                    if (error) {
                        console.error(error, 'error closing database');
                    }
                });
            });

            callback(null, context);
        });
    },
    function getCollection(context, callback) {
        context.dbConnection.collection(config.crashtest.col_name, function (error, coll) {
            if (error) {
                console.error(error, 'unable to get collection');
                callback(error);
            }
            else {
                context.dbCollection = coll;
                callback(null, context);
            }
        });
    },
    function createHugeString(context, callback) {
        var byteCount = 10 + Math.floor(config.crashtest.docSize * 3 / 4);
        crypto.randomBytes(byteCount, function (ex, buf) {
            if (ex) {
                callback(ex);
            } else {
                context.hugeString = buf.toString('base64').substring(0, config.crashtest.docSize);
                callback(null, context);
            }
        });
    },
    function insertDocuments(context, callback) {
        async.timesSeries(config.crashtest.docCount, function (n, next) {

            createAndQueryDoc(n, context, next);

        }, function (err, results) {
            if (err) {
                callback(err);
            } else {
                callback(null, context);
            }
        });
    },
    function closeDb(context, callback) {
        context.dbConnection.close(callback);
    }
], function (err) {
    if (err) {
        console.error('an error occurred', err);
    }
    process.exit(1);
});

function createAndQueryDoc(counter, context, callback) {
    var doc = {
        _id: new ObjectID(),
        counter: counter,
        content: context.hugeString
    };

    if ((counter + 1) % 100 === 0) {
        console.log('create doc ' + counter);
    }

    context.dbCollection.insert(doc, {safe: true}, function (error, result) {
        if (error) {
            callback(error);
            return;
        }
        var insertedDoc = result[0];

        context.dbCollection.findOne({_id: insertedDoc._id}, function (err, doc) {
            if (err) {
                console.log('couldn\'t find doc ' + insertedDoc._id);
                callback(err);
                return;
            }
            if (insertedDoc._id.toHexString() !== doc._id.toHexString()) {
                callback('something wrong with insert/find');
                return;
            }
            callback(null);
        });
    });
}