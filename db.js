// Copyright (c) 2020 Carsen Klock
// Kronos LevelDB Data Store using Level
const level = require('level');
  
//console.log(`Kronos Data Directory: ` + getUserHome()+`\\Kronos\\DATA`); 

function getUserHome() {
    // From process.env 
    if (process.platform == 'win32') {
      return process.env.APPDATA+'\\Kronos\\DATA\\'; 
    } else {
      return process.env.HOME+'/Kronos/DATA/'; 
    }
} 

const database = level(getUserHome()+'kronosleveldb');

module.exports = database;