const level = require('level');

const database = level('kronosleveldb');

module.exports = database;