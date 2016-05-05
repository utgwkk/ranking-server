'use strict';

const config = require('./config');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(config.database_path);

db.serialize(function () {
    db.run('CREATE TABLE games (name TEXT, token TEXT)');
    db.run('CREATE INDEX index_by_name on games(name)');
    db.run('CREATE TABLE scores (point INTEGER, game_name TEXT, player_name TEXT)');
    db.run('CREATE INDEX index_by_game_name on scores(game_name)');
});

db.close();
