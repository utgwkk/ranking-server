const app = require('../main');
const request = require('supertest').agent(app.listen());
const assert = require('assert');

describe('ranking server', function () {
    describe('GET /', function () {
        it('should say <h1>It works!</h1>', function (done) {
            request
            .get('/')
            .expect(200)
            .expect('<h1>It works!</h1>', done);
        });
    });
});
