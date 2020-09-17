/*
**************************************
**************************************
**************************************
* Kronos Tools Controller
* Copyright (c) 2020 Carsen Klock
**************************************
**************************************
**************************************
*/
/* eslint-disable no-tabs */
/* eslint-disable no-mixed-spaces-and-tabs */
const si = require('systeminformation');
const bitcoin = require('bitcoin');
const WAValidator = require('wallet-address-validator');
const QRCode = require('qrcode');
const unirest = require('unirest');
const ProgressBar = require('progressbar.js');
const cpuu = require('cputilization');
const toastr = require('express-toastr');
const exec = require('child_process').exec;
const shell = require('shelljs');
const sleep = require('system-sleep');
const denarius = require('denariusjs');
const CryptoJS = require("crypto-js");
const bip39 = require("bip39");
const bip32 = require("bip32d");
const files = require('fs');
const appRoot = require('app-root-path');
const split = require('split');
const os = require('os');
const dbr = require('../db.js');
const db = dbr.db;
const { isNullOrUndefined } = require('util');
const ElectrumClient = require('electrum-cash').Client;
const ElectrumCluster = require('electrum-cash').Cluster;
const bs58 = require('bs58');
const envfile = require('envfile');
const sourcePath = '.env';
const randomstring = require("randomstring");

const SECRET_KEY = files.readFileSync('./.senv', 'utf-8'); //process.env.SECRET_KEY

function shahash(key) {
	key = CryptoJS.SHA256(key, SECRET_KEY);
	return key.toString();
}

function encrypt(data) {
	data = CryptoJS.AES.encrypt(data, SECRET_KEY);
	data = data.toString();
	return data;
}

function decrypt(data) {
	data = CryptoJS.AES.decrypt(data, SECRET_KEY);
	data = data.toString(CryptoJS.enc.Utf8);
	return data;
}

//Connect to our D node
const client = new bitcoin.Client({
	host: decrypt(process.env.DHOST),
	port: decrypt(process.env.DPORT),
	user: decrypt(process.env.DUSER),
	pass: decrypt(process.env.DPASS),
	timeout: 30000
});

// GET Kronos Settings
exports.getSettings = (req, res) => {
	const ip = require('ip');
	const ipaddy = ip.address();

	res.locals.lanip = ipaddy;

		client.walletStatus(function (err, ws, resHeaders) {
			if (err) {
			  console.log(err);
			  var offline = 'offlineoverlay';
			  var offlinebtn = 'offlinebutton';
			  var ws = '';
			  var walletstatuss = 'locked';
			  var sendicon = 'display: none !important';
			} else {
			  var offline = 'onlineoverlay';
			  var offlinebtn = 'onlinebutton';
		
			  var walletstatuss = ws.wallet_status;
			  var sendicon;
			  
			  if (walletstatuss == 'stakingonly') {
						sendicon = 'display: none !important';
					} else if (walletstatuss == 'unlocked') {
						sendicon = 'display: visible !important;';
					} else if (walletstatuss == 'unencrypted') {
						sendicon = 'display: visible !important';
					} else if (walletstatuss == 'locked') {
						sendicon = 'display: none !important';
					}
			}
		  client.getBalance(function (error, info, resHeaders) {
			  if (error) {
				var offline = 'offlineoverlay';
				var offlinebtn = 'offlinebutton';
				var balance = '0';
				console.log(error);
			  } else {
				var offline = 'onlineoverlay';
						var offlinebtn = 'onlinebutton';
			  }
		
			  var chaindl = 'nooverlay';
			  var chaindlbtn = 'nobtn';
		
			  var balance = info;
		
			  if (balance <= 0) {
				balance = 0;
			  }

			  client.getStakingInfo(function (error, stakeinfo, resHeaders) {

				if (error) {
					var enabled = 'Node Offline';
					var staking = 'Node Offline';
					var yourweight = 'Node Offline';
					var netweight = 'Node Offline';
					var expected = 'Node Offline';
					var stakediff = 'Node Offline';
		
					var offline = 'offlineoverlay';
		
					var offlinebtn = 'offlinebutton';
		
					console.log(error);
		
				} else {
					var enabled = stakeinfo.enabled;
					var staking = stakeinfo.staking;
					var yourweight = stakeinfo.weight;
					var netweight = stakeinfo.netstakeweight;
					var expected = stakeinfo.expectedtime;
					var stakediff = stakeinfo.difficulty;
		
					var offline = 'onlineoverlay';
					var offlinebtn = 'onlinebutton';
		
					var staketoggle;
					var enabletoggle;
		
					if (enabled == true) {
						enabletoggle = 'Configured';
					} else {
						enabletoggle = 'Disabled';
					}
		
					if (staking == true) {
						staketoggle = 'Staking';
					} else {
						staketoggle = 'Not Yet Staking';
					}
				}
		
		res.render('settings', {title: 'Kronos Settings', staketoggle: staketoggle, balance: balance, chaindl: chaindl, chaindlbtn: chaindlbtn, offline: offline, offlinebtn: offlinebtn, sendicon: sendicon});
	});
});
});
};

// GET Denarius Debug Log File
exports.getDebugLog = (req, res) => {
	const ip = require('ip');
	const ipaddy = ip.address();

	res.locals.lanip = ipaddy;

	console.log("HOME DIRECTORY:", os.homedir());

	// if (os.platform() == 'win32') {
	// 	var debugloc = os.homedir() + '\AppData\Roaming\Denarius\debug.log';
	// } else {
	// 	var debugloc = os.homedir() + '\snap\denarius\common\.denarius\debug.log';
	// }
	
	var debugloc = ((os.platform() == 'win32') ? os.homedir() + '/AppData/Roaming/Denarius/debug.log' : os.homedir() + '/snap/denarius/common/.denarius/debug.log');

	console.log("FULL DIRECTORY", debugloc);

	files.readFile(debugloc, (e, debuglog) => {

		//console.log("Debug Log Error", e);

		client.walletStatus(function (err, ws, resHeaders) {
			if (err) {
			  console.log(err);
			  var offline = 'offlineoverlay';
			  var offlinebtn = 'offlinebutton';
			  var ws = '';
			  var walletstatuss = 'locked';
			  var sendicon = 'display: none !important';
			} else {
			  var offline = 'onlineoverlay';
			  var offlinebtn = 'onlinebutton';
		
			  var walletstatuss = ws.wallet_status;
			  var sendicon;
			  
			  if (walletstatuss == 'stakingonly') {
						sendicon = 'display: none !important';
					} else if (walletstatuss == 'unlocked') {
						sendicon = 'display: visible !important;';
					} else if (walletstatuss == 'unencrypted') {
						sendicon = 'display: visible !important';
					} else if (walletstatuss == 'locked') {
						sendicon = 'display: none !important';
					}
			}
		  client.getBalance(function (error, info, resHeaders) {
			  if (error) {
				var offline = 'offlineoverlay';
				var offlinebtn = 'offlinebutton';
				var balance = '0';
				console.log(error);
			  } else {
				var offline = 'onlineoverlay';
						var offlinebtn = 'onlinebutton';
			  }
		
			  var chaindl = 'nooverlay';
			  var chaindlbtn = 'nobtn';
		
			  var balance = info;
		
			  if (balance <= 0) {
				balance = 0;
			  }

			  client.getStakingInfo(function (error, stakeinfo, resHeaders) {

				if (error) {
					var enabled = 'Node Offline';
					var staking = 'Node Offline';
					var yourweight = 'Node Offline';
					var netweight = 'Node Offline';
					var expected = 'Node Offline';
					var stakediff = 'Node Offline';
		
					var offline = 'offlineoverlay';
		
					var offlinebtn = 'offlinebutton';
		
					console.log(error);
		
				} else {
					var enabled = stakeinfo.enabled;
					var staking = stakeinfo.staking;
					var yourweight = stakeinfo.weight;
					var netweight = stakeinfo.netstakeweight;
					var expected = stakeinfo.expectedtime;
					var stakediff = stakeinfo.difficulty;
		
					var offline = 'onlineoverlay';
					var offlinebtn = 'onlinebutton';
		
					var staketoggle;
					var enabletoggle;
		
					if (enabled == true) {
						enabletoggle = 'Configured';
					} else {
						enabletoggle = 'Disabled';
					}
		
					if (staking == true) {
						staketoggle = 'Staking';
					} else {
						staketoggle = 'Not Yet Staking';
					}
				}

		if (debuglog == null) {
			var file = 'Cant find debug log';
		} else {
			var file = debuglog.toString();
		}

		const lines = file.split('\n');
		
		res.render('debug', {title: 'Denarius Debug Log', lines: lines, debugloc: debugloc, staketoggle: staketoggle, balance: balance, chaindl: chaindl, chaindlbtn: chaindlbtn, offline: offline, offlinebtn: offlinebtn, sendicon: sendicon});
	});
});
});
});
};

// GET Terminal
exports.terminal = (req, res) => {
	const ip = require('ip');
	const ipaddy = ip.address();

	res.locals.lanip = ipaddy;

	req.session.loggedin3 = false;

		client.walletStatus(function (err, ws, resHeaders) {
			if (err) {
			  console.log(err);
			  var offline = 'onlineoverlay';
			  var offlinebtn = 'onlinebutton';
			  var ws = '';
			  var walletstatuss = 'locked';
			  var sendicon = 'display: none !important';
			} else {
			  var offline = 'onlineoverlay';
			  var offlinebtn = 'onlinebutton';
		
			  var walletstatuss = ws.wallet_status;
			  var sendicon;
			  
			  if (walletstatuss == 'stakingonly') {
						sendicon = 'display: none !important';
					} else if (walletstatuss == 'unlocked') {
						sendicon = 'display: visible !important;';
					} else if (walletstatuss == 'unencrypted') {
						sendicon = 'display: visible !important';
					} else if (walletstatuss == 'locked') {
						sendicon = 'display: none !important';
					}
			}
		  client.getBalance(function (error, info, resHeaders) {
			  if (error) {
				var offline = 'onlineoverlay';
				var offlinebtn = 'onlinebutton';
				var balance = '~';
				console.log(error);
			  } else {
				var offline = 'onlineoverlay';
						var offlinebtn = 'onlinebutton';
			  }
		
			  var chaindl = 'nooverlay';
			  var chaindlbtn = 'nobtn';
		
			  var balance = info;
		
			  if (balance && balance <= 0) {
				balance = 0;
			  }

			  client.getStakingInfo(function (error, stakeinfo, resHeaders) {

				if (error) {
					var enabled = 'Node Offline';
					var staking = 'Node Offline';
					var yourweight = 'Node Offline';
					var netweight = 'Node Offline';
					var expected = 'Node Offline';
					var stakediff = 'Node Offline';
		
					var offline = 'onlineoverlay';
		
					var offlinebtn = 'onlineoverlay';
		
					console.log(error);
		
				} else {
					var enabled = stakeinfo.enabled;
					var staking = stakeinfo.staking;
					var yourweight = stakeinfo.weight;
					var netweight = stakeinfo.netstakeweight;
					var expected = stakeinfo.expectedtime;
					var stakediff = stakeinfo.difficulty;
		
					var offline = 'onlineoverlay';
					var offlinebtn = 'onlinebutton';
		
					var staketoggle;
					var enabletoggle;
		
					if (enabled && enabled == true) {
						enabletoggle = 'Configured';
					} else {
						enabletoggle = 'Disabled';
					}
		
					if (staking && staking == true) {
						staketoggle = 'Staking';
					} else {
						staketoggle = 'Not Yet Staking';
					}
				}
				var os = require('os');

				// Initialize node-pty with an appropriate shell
				var shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';
		
		res.render('account/terminal', {title: 'Kronos Terminal', staketoggle: staketoggle, balance: balance, chaindl: chaindl, chaindlbtn: chaindlbtn, offline: offline, offlinebtn: offlinebtn, sendicon: sendicon});
	});
});
});
};

// GET Terminal
exports.termPop = (req, res) => {
	const ip = require('ip');
	const ipaddy = ip.address();

	res.locals.lanip = ipaddy;

	req.session.loggedin4 = false;

		client.walletStatus(function (err, ws, resHeaders) {
			if (err) {
			  console.log(err);
			  var offline = 'onlineoverlay';
			  var offlinebtn = 'onlinebutton';
			  var ws = '';
			  var walletstatuss = 'locked';
			  var sendicon = 'display: none !important';
			} else {
			  var offline = 'onlineoverlay';
			  var offlinebtn = 'onlinebutton';
		
			  var walletstatuss = ws.wallet_status;
			  var sendicon;
			  
			  if (walletstatuss == 'stakingonly') {
						sendicon = 'display: none !important';
					} else if (walletstatuss == 'unlocked') {
						sendicon = 'display: visible !important;';
					} else if (walletstatuss == 'unencrypted') {
						sendicon = 'display: visible !important';
					} else if (walletstatuss == 'locked') {
						sendicon = 'display: none !important';
					}
			}
		  client.getBalance(function (error, info, resHeaders) {
			  if (error) {
				var offline = 'onlineoverlay';
				var offlinebtn = 'onlinebutton';
				var balance = '~';
				console.log(error);
			  } else {
				var offline = 'onlineoverlay';
						var offlinebtn = 'onlinebutton';
			  }
		
			  var chaindl = 'nooverlay';
			  var chaindlbtn = 'nobtn';
		
			  var balance = info;
		
			  if (balance && balance <= 0) {
				balance = 0;
			  }

			  client.getStakingInfo(function (error, stakeinfo, resHeaders) {

				if (error) {
					var enabled = 'Node Offline';
					var staking = 'Node Offline';
					var yourweight = 'Node Offline';
					var netweight = 'Node Offline';
					var expected = 'Node Offline';
					var stakediff = 'Node Offline';
		
					var offline = 'onlineoverlay';
		
					var offlinebtn = 'onlineoverlay';
		
					console.log(error);
		
				} else {
					var enabled = stakeinfo.enabled;
					var staking = stakeinfo.staking;
					var yourweight = stakeinfo.weight;
					var netweight = stakeinfo.netstakeweight;
					var expected = stakeinfo.expectedtime;
					var stakediff = stakeinfo.difficulty;
		
					var offline = 'onlineoverlay';
					var offlinebtn = 'onlinebutton';
		
					var staketoggle;
					var enabletoggle;
		
					if (enabled && enabled == true) {
						enabletoggle = 'Configured';
					} else {
						enabletoggle = 'Disabled';
					}
		
					if (staking && staking == true) {
						staketoggle = 'Staking';
					} else {
						staketoggle = 'Not Yet Staking';
					}
				}
				var os = require('os');

				// Initialize node-pty with an appropriate shell
				var shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';
		
		res.render('account/termpop', {title: 'Kronos Terminal', staketoggle: staketoggle, balance: balance, chaindl: chaindl, chaindlbtn: chaindlbtn, offline: offline, offlinebtn: offlinebtn, sendicon: sendicon});
	});
});
});
};