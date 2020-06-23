const level = require('level');

const database = level('dpileveldb');

module.exports = database;