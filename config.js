'use strict';

let database_path;

if (process.env.NODE_ENV == 'test')
    database_path = './test.db'
else
    database_path = './ranking.db'

const config = {
    database_path
}

module.exports = config;
