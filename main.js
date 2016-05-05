'use strict';

const koa = require('koa');
const _ = require('koa-route');
const sqlite3 = require('sqlite3');
const config = require('./config');
const sha256 = require('crypto').createHash('sha256');
const parse = require('co-body');
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

function *tokenQuery (name) {
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

function *validateGameName (name) {
    return new Promise(function (resolve, reject) {
        if (!name.match(/^[a-zA-Z0-9_]{2,63}$/))
            reject('Invalid name');
        const db = new sqlite3.Database(config.database_path);
        db.serialize(function () {
            db.get('SELECT * FROM games WHERE name = $name', {$name: name}, function (err, row) {
                db.close();
                if (row) {
                    reject('The name ' + name + " has already registered");
                } else {
                    resolve();
                }
            });
        });
    });
}

function *registerGame (name, token) {
    return new Promise(function (resolve, reject) {
        const db = new sqlite3.Database(config.database_path);
        db.serialize(function () {
            db.run('INSERT INTO games VALUES(?,?)', [name, token]);
        });
        db.close();
        resolve();
    });
}

function *submitScore (gameName, playerName, point) {
    return new Promise(function (resolve, reject) {
        const db = new sqlite3.Database(config.database_path);
        db.serialize(function () {
            db.run('INSERT INTO scores VALUES(?,?,?)', [point, gameName, playerName]);
        });
        db.close();
        resolve();
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
            ok: true,
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
            ok: false,
            error: errorMessage
        };
        this.status = 400;
    }
    this.body = result;
}));

app.use(_.post('/:name', function *(name) {
    const data = yield parse(this);
    const token = data.token;
    const validToken = yield tokenQuery(name);
    this.headers['Content-Type'] = 'text/plain';
    let result;
    const playerName = data.player_name;
    const point = data.point && Number(data.point);
    try {
        if (validToken != '' && token == validToken && point && playerName) {
            yield submitScore(name, playerName, point);
            result = {
                ok: true,
                player_name: playerName,
                game_name: name,
                point
            };
            this.status = 201;
        } else {
            let errorMessage;
            if (validToken == '') {
                errorMessage = 'The game ' + name + ' is not registered.';
            } else if (token != validToken) {
                errorMessage = 'Invalid token';
            } else {
                errorMessage = 'The required parameter is missing.';
            }
            result = {
                ok: false,
                error: errorMessage
            };
            this.status = 400;
        }
    } catch (e) {
        result = {
            ok: false,
            error: e
        }
        this.status = 400;
    } finally {
        this.body = JSON.stringify(result);
    }
}));

app.use(_.post('/register/:name', function *(name) {
    this.headers['Content-Type'] = 'text/plain';
    let result;
    try {
        yield validateGameName(name);
        sha256.update(Math.random() * 1000000007 + name);
        const token = sha256.digest('hex');
        yield registerGame(name, token);
        result = {
            ok: true,
            name,
            token
        }
    } catch (e) {
        result = {
            ok: false,
            error: e
        }
    }
    this.body = JSON.stringify(result);
}));

app.listen(3000);
