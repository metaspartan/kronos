const request = require('supertest');
const app = require('../app.js');

describe('GET /', () => {
  it('should return 200 OK', (done) => {
    request(app)
      .get('/')
      .expect(200, done);
  });
});

describe('GET /backup', () => {
    it('should return 200 OK', (done) => {
      request(app)
        .get('/backup')
        .expect(200, done);
    });
  });

  describe('GET /transactions', () => {
    it('should return 200 OK', (done) => {
      request(app)
        .get('/transactions')
        .expect(200, done);
    });
  });

  describe('GET /addresses', () => {
    it('should return 200 OK', (done) => {
      request(app)
        .get('/addresses')
        .expect(200, done);
    });
  });

  describe('GET /sign', () => {
    it('should return 200 OK', (done) => {
      request(app)
        .get('/sign')
        .expect(200, done);
    });
  });

  describe('GET /verify', () => {
    it('should return 200 OK', (done) => {
      request(app)
        .get('/verify')
        .expect(200, done);
    });
  });

  describe('GET /rawtx', () => {
    it('should return 200 OK', (done) => {
      request(app)
        .get('/rawtx')
        .expect(200, done);
    });
  });

  describe('GET /import', () => {
    it('should return 200 OK', (done) => {
      request(app)
        .get('/import')
        .expect(200, done);
    });
  });

  describe('GET /withdraw', () => {
    it('should return 200 OK', (done) => {
      request(app)
        .get('/withdraw')
        .expect(200, done);
    });
  });