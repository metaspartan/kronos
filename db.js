// Copyright (c) 2020 Carsen Klock
// Kronos LevelDB Data Store using Level
const level = require('level');
  
//console.log(`Kronos Data Directory: ` + getUserHome()+`\\Kronos\\DATA`); 

function getUserHome() {
    // From process.env 
    return process.env[(process.platform == 'win32') ? 'APPDATA' : 'HOME']; 
}

const database = level(getUserHome()+`\\Kronos\\DATA\\kronosleveldb`);

module.exports = database;