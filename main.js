'use strict';

const koa = require('koa');
const _ = require('koa-route');
var app = koa();

app.use(function *(next) {
    const start = new Date;
    yield next;
    console.log('%s %s %s', this.method, this.url, this.status);
});

app.use(_.get('/', function *() {
    this.body = "<h1>It works!</h1>";
}));

app.use(_.get('/:name', function *(name) {
    this.headers['Content-Type'] = 'text/plain';
    const result = {
        name
    };
    this.body = JSON.stringify(result);
}));

app.listen(3000);
