'use strict';

const koa = require('koa');
const _ = require('koa-route');
const sqlite3 = require('sqlite3');
const config = require('./config');
var app = koa();

app.use(function *(next) {
    const start = new Date;
    yield next;
    console.log('%s %s %s', this.method, this.url, this.status);
});

app.use(_.get('/', function *() {
    this.body = "<h1>It works!</h1>";
}));

function *rankingQuery (name) {
    return new Promise(function (resolve, reject) {
        const db = new sqlite3.Database(config.database_path);
        db.serialize(function () {
            db.all('SELECT player_name AS name, point FROM scores WHERE game_name = $name ORDER BY point DESC', {$name: name}, function (err, rows) {
                db.close();
                resolve(rows || []);
            });
        });
    });
}

function tokenQuery (name) {
    return new Promise(function (resolve, reject) {
        const db = new sqlite3.Database(config.database_path);
        db.serialize(function () {
            db.get('SELECT token FROM games WHERE name = $name', {$name: name}, function (err, row) {
                db.close();
                resolve(row && row.token || '');
            });
        });
    });
}

app.use(_.get('/:name', function *(name) {
    const token = this.request.query.token || '';
    const validToken = yield tokenQuery(name);
    this.headers['Content-Type'] = 'text/plain';
    let result;
    if (validToken != '' && token == validToken) {
        let ranking = [];
        result = {
            name,
            ranking: yield rankingQuery(name),
        };
    } else {
        let errorMessage;
        if (validToken == '') {
            errorMessage = 'The game ' + name + ' is not registered.';
        } else if (token != validToken) {
            errorMessage = 'Invalid token';
        }
        result = {
            error: errorMessage
        };
        this.status = 400;
    }
    this.body = result;
}));

app.listen(3000);
