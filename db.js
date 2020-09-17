// Copyright (c) 2020 Carsen Klock
// Kronos LevelDB Data Store using Level
const level = require('level');

const database = level('kronosleveldb');

module.exports = database;