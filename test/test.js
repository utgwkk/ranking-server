const app = require('../main');
const request = require('supertest').agent(app.listen());
const assert = require('assert');

describe('ranking server', function () {
    before(function () {
        require('../init-db');
    });

    describe('without token', function () {
        describe('GET /', function () {
            it('should say <h1>It works!</h1>', function (done) {
                request
                .get('/')
                .expect(200)
                .expect('<h1>It works!</h1>', done);
            });
        });

        describe('POST /', function () {
            it('should be 404', function (done) {
                request
                .post('/')
                .expect(404, done);
            });
        });

        describe('GET /hoge', function () {
            it('should be 400', function (done) {
                request
                .get('/hoge')
                .expect(400, done);
            });
        });

        describe('POST /hoge', function () {
            it('should be 415 without any parameters', function (done) {
                request
                .post('/hoge')
                .expect(415, done);
            });
        });

        describe('DELETE /hoge', function () {
            it('should be 400 without any parameters', function (done) {
                request
                .delete('/hoge')
                .expect(400, done);
            });
        });

        describe('POST /register/hoge', function () {
            it('should be 201 and returns token', function (done) {
                request
                .post('/register/hoge')
                .expect(201)
                .expect(/"token":"[0-9a-z]+"/, done);
            });
        });
    });

    after(function () {
        require('fs').unlink('./test.db');
    });
});
