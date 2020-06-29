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

const SECRET_KEY = process.env.SECRET_KEY;


 //Connect to our D node
const client = new bitcoin.Client({
    host: process.env.DNRHOST,
    port: process.env.DNRPORT,
    user: process.env.DNRUSER,
    pass: process.env.DNRPASS,
    timeout: 30000
});

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

//Get information
exports.index = (req, res) => {

const ip = require('ip');
const ipaddy = ip.address();

res.locals.lanip = ipaddy;

//ElectrumX Hosts for Denarius
const delectrumxhost1 = 'electrumx1.denarius.pro';
const delectrumxhost2 = 'electrumx2.denarius.pro';
const delectrumxhost3 = 'electrumx3.denarius.pro';
const delectrumxhost4 = 'electrumx4.denarius.pro';

let socket_id = [];
let socket_id2 = [];
let socket_id3 = [];
let socket_id4 = [];
let socket_id5 = [];
let socket_id6 = [];
let socket_id7 = [];
let socket_idg = [];

// WIP for getInfo Realtime Calls
// var delay = 60000;
// var delay2 = 60000;
// res.io.on('connection', function (socket) {
// 					socket_idg.push(socket.id);
// 					if (socket_idg[0] === socket.id) {
// 						// remove the connection listener for any subsequent 
// 						// connections with the same ID
// 						res.io.removeAllListeners('connection'); 
// 					}
// 					console.log("IM HERE CONNECTION!");
// 					setInterval(() => {
// 					setTimeout(() => {
// 					client.getInfo(function (error, info, resHeaders) {
// 						if (error) { 
// 							console.log(error);
// 							console.log("ERROR IM HERE!");
// 						} else {
// 								console.log("IM HERE!");
// 								socket.emit("dchain", {
// 									blockheight: info.blocks, 
// 									balance: info.balance, 
// 									diff: info.difficulty['proof-of-work'], 
// 									stakediff: info.difficulty['proof-of-stake'], 
// 									nethash: info.netmhashps.toFixed(2), 
// 									unbalance: info.unconfirmed, 
// 									stakebal: info.stake, 
// 									peers: info.connections, 
// 									datareceived: info.datareceived, 
// 									datasent: info.datasent,
// 									yourweight: info.weight,
// 									netweight: info.netstakeweight
// 								});
// 								console.log("IM HERE FINALLY!");
// 						}
// 					});
					
// 				}, delay);
// 			}, delay2);

// });	

si.cpu(async function (data) {
	//Emit to our Socket.io Server
	res.io.on('connection', async function (socket) {
		var cores = data.physicalCores;
		var threads = data.cores;
		//console.log(data)
		socket_id.push(socket.id);
		//console.log(socket.id);
		if (socket_id[0] === socket.id) {
		  // remove the connection listener for any subsequent 
		  // connections with the same ID
		  res.io.removeAllListeners('connection'); 
		}
		// res.locals.cores1 = cores;
		// res.locals.threads1 = threads;
		//console.log(cores+ "/" +threads)
		socket.emit("cpudata", {cores: cores, threads: threads});	
	});
});

si.cpuCurrentspeed(function (data2) {

	var min = data2.min;
	var avg = data2.avg;
	var max = data2.max;

	//Emit to our Socket.io Server
	res.io.on('connection', function (socket) {
		socket_id2.push(socket.id);
		if (socket_id2[0] === socket.id) {
		  // remove the connection listener for any subsequent 
		  // connections with the same ID
		  res.io.removeAllListeners('connection'); 
		}
		socket.emit("cpuspeed", {min: min, avg: avg, max: max});
		setInterval(() => {
			socket.emit("cpuspeed", {min: min, avg: avg, max: max});
		}, 90000);
	});
});

si.cpuTemperature(function (data3) {
	var tempp = data3.main;
	var temppp = tempp.toFixed(0);

	if (temppp == -1) {
		var temp = 'N/A';
	} else {
		var temp = temppp;
	}

	//Emit to our Socket.io Server
	res.io.on('connection', function (socket) {
		socket_id3.push(socket.id);
		if (socket_id3[0] === socket.id) {
		  // remove the connection listener for any subsequent 
		  // connections with the same ID
		  res.io.removeAllListeners('connection'); 
		}
		socket.emit("temp", {temp: temp, temppp: temppp});
		setInterval(() => {
			si.cpuTemperature(function (data3) {
				var tempp = data3.main;
				var temppp = tempp.toFixed(0);
			
				if (temppp == -1) {
					var temp = 'N/A';
				} else {
					var temp = temppp;
				}

				socket.emit("temp", {temp: temp, temppp: temppp});
			});
		}, 60000);
	});
});

si.mem(function (data1) {

	var bytes = 1073741824;
	var memtt = data1.total;
	var memuu = data1.active;
	var memff = data1.free;
	var mema = data1.available;

	var memttt = memtt / bytes;
	var memt = memttt.toFixed(2);

	var memffff = memtt - memuu;
	var memfff = memffff / bytes;
	var memf = memfff.toFixed(2);

	var memuuu = memuu / bytes;
	var memu = memuuu.toFixed(2);


	var memp = memu / memt * 100;
	var memppp = memp / 100;
	var mempp = memppp;

	//Emit to our Socket.io Server
	res.io.on('connection', function (socket) {
		socket_id4.push(socket.id);
		if (socket_id4[0] === socket.id) {
		  // remove the connection listener for any subsequent 
		  // connections with the same ID
		  res.io.removeAllListeners('connection'); 
		}
		socket.emit("memory", {mema: mema, memt: memt, memf: memf, memu: memu, memp: memp, mempp: mempp});
		setInterval(() => {
			si.mem(function (data1) {

				var bytes = 1073741824;
				var memtt = data1.total;
				var memuu = data1.active;
				var memff = data1.free;
				var mema = data1.available;
			
				var memttt = memtt / bytes;
				var memt = memttt.toFixed(2);
			
				var memffff = memtt - memuu;
				var memfff = memffff / bytes;
				var memf = memfff.toFixed(2);
			
				var memuuu = memuu / bytes;
				var memu = memuuu.toFixed(2);			
			
				var memp = memu / memt * 100;
				var memppp = memp / 100;
				var mempp = memppp;

				socket.emit("memory", {mema: mema, memt: memt, memf: memf, memu: memu, memp: memp, mempp: mempp});
			});
		}, 5000);
	});
});


si.osInfo().then(data4 => {

	var osname = data4.distro;
	var kernel = data4.kernel;
	var platform = data4.platform;
	var release = data4.release;
	var hostname = data4.hostname;
	var arch = data4.arch;

	// res.locals.osname = osname;
	// res.locals.kernel = kernel;
	// res.locals.platform = platform;
	// res.locals.release = release;
	// res.locals.hostname = hostname;
	// res.locals.arch = arch;

	//Emit to our Socket.io Server
	res.io.on('connection', function (socket) {
		socket_id5.push(socket.id);
		if (socket_id5[0] === socket.id) {
		  // remove the connection listener for any subsequent 
		  // connections with the same ID
		  res.io.removeAllListeners('connection'); 
		}
		res.locals.osname = osname;
		res.locals.kernel = kernel;
		res.locals.platform = platform;
		res.locals.release = release;
		res.locals.hostname = hostname;
		res.locals.arch = arch;
		socket.emit("osinfo", {osname: osname, kernel: kernel, platform: platform, release: release, hostname: hostname, arch: arch});

});
});

si.system(function (data9) {

	var manu = data9.manufacturer;
	var model = data9.model;

	//Emit to our Socket.io Server
	res.io.on('connection', function (socket) {
		socket_id6.push(socket.id);
		if (socket_id6[0] === socket.id) {
		  // remove the connection listener for any subsequent 
		  // connections with the same ID
		  res.io.removeAllListeners('connection'); 
		}
		socket.emit("sysmodel", {manu: manu, model: model});
	});

});

si.currentLoad().then(data6 => {

	var avgload = data6.avgload;
	var currentload = data6.currentload;

	var cpu = currentload / 100;

	//Emit to our Socket.io Server
	res.io.on('connection', function (socket) {
		socket_id7.push(socket.id);
		if (socket_id7[0] === socket.id) {
		  // remove the connection listener for any subsequent 
		  // connections with the same ID
		  res.io.removeAllListeners('connection'); 
		}
		socket.emit("cpuload", {avgload: avgload, cpu: cpu});
		setInterval(() => {
			si.currentLoad().then(data6 => {

				var avgload = data6.avgload;
				var currentload = data6.currentload;
			
				var cpu = currentload / 100;

				socket.emit("cpuload", {avgload: avgload, cpu: cpu});

			});
		}, 5000);
	});

});

//Testing out realtime Electrumx Block Header Subscribe
let socket_id10 = [];
//Emit to our Socket.io Server
res.io.on('connection', function (socket) {
	socket_id10.push(socket.id);
	if (socket_id10[0] === socket.id) {
	// remove the connection listener for any subsequent 
	// connections with the same ID
	res.io.removeAllListeners('connection'); 
	}
	const latestblocks = async () => {
		// Initialize an electrum cluster where 1 out of 2 out of the 4 needs to be consistent, polled randomly with fail-over.
		const electrum = new ElectrumCluster('Kronos ElectrumX Cluster', '1.4.1', 1, 2, ElectrumCluster.ORDER.RANDOM);
		
		// Add some servers to the cluster.
		electrum.addServer(delectrumxhost1);
		electrum.addServer(delectrumxhost2);
		electrum.addServer(delectrumxhost3);
		electrum.addServer(delectrumxhost4);
		
		// Wait for enough connections to be available.
		await electrum.ready();

		// Set up a callback function to handle new blocks.
		const handleNewBlocks = function(data)
		{
			socket.emit("newblock", {block: data});
			//console.log("Got New Denarius Block Height");
		}
		//TODO: NEED TO SETUP CLUSTERING AND ALSO ERROR SANITY CHECKING IF SERVER(S) OFFLINE
		// Set up a subscription for new block headers and handle events with our callback function.
		await electrum.subscribe(handleNewBlocks, 'blockchain.headers.subscribe');

		//await electrum.disconnect();

		//return handleNewBlocks();
	}
	latestblocks();
});

	//Denarius Main Account to go off of
	var account = '333D'; //Needs work

	client.getAddressesByAccount(`dpi(${account})`, function (err, addresses, resHeaders) {
		if (err) {

			console.log(err);
			var address = 'Node Offline';
			var qrcode = 'Node Offline';
			var qr = 'Offline';

		} else {

			var address = addresses.slice(-1)[0];

			if (typeof address == 'undefined') {
				client.getNewAddress(`dpi(${account})`, function (error, addr, resHeaders) {
				if (error) {
					console.log(error);
				}
				address = addr;
				});
			}

			var qr = 'denarius:'+address;

		}


	QRCode.toDataURL(qr, { color: { dark: '#000000FF', light:"#777777FF" } }, function(err, qrcode) {

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

	client.getNetTotals(function (error, netinfo, resHeaders) {

			if (error) {
				var timeframe = 'Node Offline';
				var target = 'Node Offline';

				var offline = 'offlineoverlay';

				var offlinebtn = 'offlinebutton';

				console.log(error);

			} else {
				var timeframe = netinfo.uploadtarget['timeframe'];
				var target = netinfo.uploadtarget['target'];

				var offline = 'onlineoverlay';
				var offlinebtn = 'onlinebutton';

			}

				
	client.fortunaStake('count', function (error, fscountt, resHeaders) {

		if (error) {
			var fscount = 'Node Offline';	
			var offline = 'offlineoverlay';	
			var offlinebtn = 'offlinebutton';	
			console.log(error);

		} else {
			var fscount = fscountt;

			var offline = 'onlineoverlay';
			var offlinebtn = 'onlinebutton';

		}
	


	client.getInfo(function (error, info, resHeaders) {

		if (error) {
			var balance = '0';
			var unbalance = '0';
			var currentprice = '0';
			var usdbalance = '0';
			var instake = 'Node Offline';
			var stakebal = 'Node Offline';
			var version = 'Node Offline';
			var protocol = 'Node Offline';
			var blockheight = '0';
			res.locals.blockheight = '0';
			var moneysupply = 'Node Offline';
			var peers = 'Node Offline';
			var ip = 'Node Offline';
			var datadir = 'Node Offline';
			var syncing = 'Node Offline';
			var fs = 'Node Offline';
			var tor =' Node Offline';
			var datareceived = 'Node Offline';
			var datasent = 'Node Offline';
			var nativetor = 'Node Offline';
			var fslocked = 'Node Offline';
			var testnet = 'Node Offline';
			var walletstatuss = 'Node Offline';
			var cryptoidblocks = '0';

			var offline = 'offlineoverlay';
			var offlinebtn = 'offlinebutton';

			var walletstatus;
			var walleticon;
			var walletlink;
			var sending;
			var sendicon;

			if (walletstatuss == 'Node Offline') {
				walleticon = 'fa fa-5x fa-key colorr';
				walletstatus = 'Offline';
				walletlink = '#';
				sending = '';
			}

			console.log(error);
			
		} else {
			var balance = info.balance;
			var unbalance = info.unconfirmed;
			var instake = info.stake;
			var stakebal = info.stake;
			var version = info.version;
			var protocol = info.protocolversion;
			var blockheight = info.blocks;
			res.locals.blockheight = info.blocks;
			var moneysupply = info.moneysupply;
			var peers = info.connections;
			var ip = info.ip;
			var datadir = info.datadir;
			var syncing = info.initialblockdownload;
			var fs = info.fortunastake;
			var tor = info.nativetor;
			var datareceived = info.datareceived;
			var datasent = info.datasent;
			var nativetor = info.nativetor;
			var fslocked = info.fslock;
			var testnet = info.testnet;
			var walletstatuss = info.wallet_status;
			var diff = info.difficulty['proof-of-work'];
			var stakediff = info.difficulty['proof-of-stake'];
			var netweight = info.netstakeweight;
			var yourweight = info.weight;
			var nethashh = info.netmhashps;

			var nethash = nethashh.toFixed(2);

			var offline = 'onlineoverlay';
			var offlinebtn = 'onlinebutton';

			var walletstatus;
			var walleticon;
			var walletlink;
			var sending;
			var sendicon;

			if (syncing == true) {
				var chaindl = 'syncingoverlay';
				var chaindlbtn = 'syncingbtn';
			} else if (syncing == false) {
				var chaindl = 'nooverlay';
				var chaindlbtn = 'nobtn';
			}

			if (walletstatuss == 'stakingonly') {
				walleticon = 'fa fa-5x fa-unlock-alt colory';
				walletstatus = 'Unlocked for Staking Only';
				walletlink = '#DisplayModalLock';
				sendicon = 'display: none !important';
			} else if (walletstatuss == 'unlocked') {
				walleticon = 'fa fa-5x fa-unlock coloru';
				walletstatus = 'Unlocked';
				walletlink = '#DisplayModalLock';
				sending = '<p align="center" style="margin-top:55px;"><a class="btn btn-gold" href="/withdraw" style="  background-color: #222 !important;	border: none !important;border-radius:90px !important;padding:30px !important;"><i class="fa fa-5x fa-paper-plane"></i></a><br /><br />Send Denarius</p>';
				sendicon = 'display: visible !important;';
			} else if (walletstatuss == 'unencrypted') {
				walleticon = 'fa fa-5x fa-key'
				walletstatus = 'Unencrypted';
				walletlink = '#DisplayModalEncrypt';
				sending = '<p align="center" style="margin-top:55px;"><a class="btn btn-gold" href="/withdraw" style="  background-color: #222 !important;	border: none !important;border-radius:90px !important;padding:30px !important;"><i class="fa fa-5x fa-paper-plane"></i></a><br /><br />Send Denarius</p>';
				sendicon = 'display: visible !important';
			} else if (walletstatuss == 'locked') {
				walleticon = 'fa fa-5x fa-lock colorr';
				walletstatus = 'Locked';
				walletlink = '#DisplayModalUnlock';
				sending = '';
				sendicon = 'display: none !important';
				privatekey = 'Wallet Locked';
			}

			var socket_id8 = [];
			//Emit to our Socket.io Server
			res.io.on('connection', function (socket) {
				socket_id8.push(socket.id);
				//console.log(socket.id);
				if (socket_id8[0] === socket.id) {
				  // remove the connection listener for any subsequent 
				  // connections with the same ID
				  res.io.removeAllListeners('connection'); 
				}
				socket.emit("dchain", {blockheight: blockheight, 
					balance: balance, 
					unbalance: unbalance, 
					instake: instake,
					stakebal: stakebal, 
					peers: peers, 
					datareceived: datareceived, 
					datasent: datasent,
					diff: diff,
					stakediff: stakediff,
					netweight: netweight,
					yourweight: yourweight,
					nethash: nethash,

				});
			});
		}

		//Get Current Block Count from Chainz Explorer
		unirest.get("https://chainz.cryptoid.info/d/api.dws?q=getblockcount")
		.headers({'Accept': 'application/json'})
		.end(function (result) {
			var cryptoidblocks = result.body;

		//Get Current D/BTC and D/USD price from CoinGecko
		// unirest.get("https://api.coingecko.com/api/v3/coins/denarius?tickers=true&market_data=true&community_data=false&developer_data=true")
		// 	.headers({'Accept': 'application/json'})
		// 	.end(function (result) {
		// 		if (result.body['market_data']['current_price'] != undefined) {
		// 			var usdbalance = result.body['market_data']['current_price']['usd'] * balance;
		// 			var currentprice = result.body['market_data']['current_price']['usd'];
		// 		} else {
		// 			usdbalance = '~';
		// 			currentprice = '~';
		// 		}

		if (blockheight >= 0 && cryptoidblocks >= 0) {
			var blockpercent = blockheight / cryptoidblocks;
			var blockpercc = blockheight / cryptoidblocks * 100;
			var blockperc = blockpercc.toFixed(2);
		}

		let socket_id9 = [];
		//Emit to our Socket.io Server for USD Balance Information
		res.io.on('connection', function (socket) {
			socket_id9.push(socket.id);
			//console.log(socket.id);
			if (socket_id9[0] === socket.id) {
			  // remove the connection listener for any subsequent 
			  // connections with the same ID
			  res.io.removeAllListeners('connection'); 
			}
			//Get Current D/BTC and D/USD price from CoinGecko
			unirest.get("https://api.coingecko.com/api/v3/coins/denarius?tickers=true&market_data=true&community_data=false&developer_data=true")
			.headers({'Accept': 'application/json'})
			.end(function (result) {
				if (!result.error) {

					var usdbalance = result.body['market_data']['current_price']['usd'] * balance;
					var currentprice = result.body['market_data']['current_price']['usd'];
					
					res.locals.usdbalance = usdbalance;
					res.locals.currentprice = currentprice;

					socket.emit("usdinfo", {usdbalance: usdbalance, currentprice: currentprice});
				} else { 
					console.log("Error occured on price refresh before interval", result.error);
					var usdbalance = '~';
					var currentprice = '~';
					res.locals.usdbalance = usdbalance;
					res.locals.currentprice = currentprice;
					socket.emit("usdinfo", {usdbalance: usdbalance, currentprice: currentprice});
				}
			});
			// setTimeout(() => {
			// 	setInterval(() => {
			// 			//Get Current D/BTC and D/USD price from CoinGecko
			// 			unirest.get("https://api.coingecko.com/api/v3/coins/denarius?tickers=true&market_data=true&community_data=false&developer_data=true")
			// 			.headers({'Accept': 'application/json'})
			// 			.end(function (result) {
			// 				if (!result.error) {

			// 					var usdbalance = result.body['market_data']['current_price']['usd'] * balance;
			// 					var currentprice = result.body['market_data']['current_price']['usd'];

			// 					res.locals.usdbalance = usdbalance;
			// 					res.locals.currentprice = currentprice;

			// 					socket.emit("usdinfo", {usdbalance: usdbalance, currentprice: currentprice});
			// 				} else { 
			// 					console.log("Error occured on price refresh", result.error);
			// 					var usdbalance = '~';
			// 					var currentprice = '~';
			// 					res.locals.usdbalance = usdbalance;
			// 					res.locals.currentprice = currentprice;
			// 					socket.emit("usdinfo", {usdbalance: usdbalance, currentprice: currentprice});
			// 				}
			// 			});
			// 	}, 60000);
			// }, 80000);
		});
		
		//Render the page with the dynamic variables
        res.render('home', {
			title: 'Home',
			balance: balance,
			version: version,
			protocol: protocol,
			ip: ip,
			datadir: datadir,
			syncing: syncing,
			fs: fs,
			tor: tor,
			moneysupply: moneysupply,
			timeframe: timeframe,
			target: target,
			stakebal: stakebal,
			enabled: enabled,
			staking: staking,
			expected: expected,
			staketoggle: staketoggle,
			enabletoggle: enabletoggle,
			nativetor: nativetor,
			fslocked: fslocked,
			testnet: testnet,
			walletstatus: walletstatus,
			walleticon: walleticon,
			walletlink: walletlink,
			offline: offline,
			offlinebtn: offlinebtn,
			address: address, 
			qrcode: qrcode,
			sending: sending,
			chaindl: chaindl,
			chaindlbtn: chaindlbtn,
			cryptoidblocks: cryptoidblocks,
			blockpercent: blockpercent,
			blockperc: blockperc,
			sendicon: sendicon,
			fscount: fscount
        	});
		});
	});
});
});
});
});
});
};


//Unlock Wallet
exports.unlock = (req, res, next) => {
  var password = req.body.password;
  //var sendtoaddress = req.body.sendaddress;
  //var amount = req.body.amount;

  client.walletPassphrase(`${password}`, 9999999, function (error, unlocked, resHeaders) {
	//if (error) return console.log(error);

	if (error) {
		//req.flash('errors', { msg: 'Incorrect password!'});
		req.toastr.error('Wallet Unlock Error', 'Incorrect Password!', { positionClass: 'toast-bottom-right' });
		return res.redirect('/');
	} else {
		//req.flash('success', { msg: `Wallet Unlocked!` });
		req.toastr.success('Success!', 'Wallet Unlocked', { positionClass: 'toast-bottom-right' });
		return res.redirect('/');
	}

});
};

//Unlock for Staking Only Wallet
exports.unlockstaking = (req, res, next) => {
	var password = req.body.password;
	//var sendtoaddress = req.body.sendaddress;
	//var amount = req.body.amount;
  
	client.walletPassphrase(`${password}`, 9999999, true, function (error, unlocked, resHeaders) {
	  //if (error) return console.log(error);
  
	  if (error) {
		  //req.flash('errors', { msg: 'Incorrect password!'});
		  req.toastr.error('Wallet Unlock Error', 'Incorrect Password!', { positionClass: 'toast-bottom-right' });
		  return res.redirect('/');
	  } else {
		  //req.flash('success', { msg: `Wallet Unlocked!` });
		  req.toastr.success('Success!', 'Wallet Unlocked for Staking Only', { positionClass: 'toast-bottom-right' });
		  return res.redirect('/');
	  }
  
  });
  };

//Lock Wallet
exports.lock = (req, res, next) => {
	//var password = req.body.password;
	//var sendtoaddress = req.body.sendaddress;
	//var amount = req.body.amount;
  
	client.walletLock(function (error, lock, resHeaders) {
	  //if (error) return console.log(error);
  
	  if (error) {
		  //req.flash('errors', { msg: 'Incorrect password!'});
		  req.toastr.error('Wallet Lock Error', 'Error!', { positionClass: 'toast-bottom-right' });
		  return res.redirect('/');
	  } else {
		  //req.flash('success', { msg: `Wallet Unlocked!` });
		  req.toastr.success('Success!', 'Wallet Locked', { positionClass: 'toast-bottom-right' });
		  return res.redirect('/');
	  }
  
  });
  };

  //Encrypt Wallet
  exports.encrypt = (req, res, next) => {
	var password = req.body.passphrase;
	var password2 = req.body.passphrase2;
	//var sendtoaddress = req.body.sendaddress;
	//var amount = req.body.amount;

	//req.assert('password2', 'Passwords do not match').equals(req.body.passphrase);

	if (password == password2) {
		var passworded = password;
	} else {
		req.toastr.error('Passwords do not match', 'Passphrase Error!', { positionClass: 'toast-bottom-right' });
		return res.redirect('/');
	}
  
	client.encryptWallet(`${passworded}`, function (error, encrypt, resHeaders) {
	  //if (error) return console.log(error);
  
	  if (error) {
		  req.toastr.error('Wallet Encryption Error', 'Encryption Error!', { positionClass: 'toast-bottom-right' });
		  return res.redirect('/');
	  } else {
		  req.toastr.success('Success!', 'Wallet Encrypted', { positionClass: 'toast-bottom-right' });
		  return res.redirect('/');
	  }
  
  });
  };

  //Reboot Wallet
  exports.reboot = (req, res, next) => {

	//Execute denarius.daemon stop command
	shell.exec(`bash restartnode.sh`, function(err){
		if(err){
		  console.log(err);
		  req.toastr.error('Something went wrong!', 'Reboot Error!', { positionClass: 'toast-bottom-right' });
		  process.exit(0);
		  //return res.redirect('/');
		}
	});

	//req.toastr.success('Success!', 'Stopping Denarius...Please wait', { positionClass: 'toast-bottom-right' });

	//sleep(120000); // sleep for 120 seconds

	//req.toastr.success('Success!', 'Starting Denarius...Please wait', { positionClass: 'toast-bottom-right' });

	//sleep(120000); // sleep for 120 seconds

	//return res.redirect('/');

  };


  //POST Get private key
  exports.privkey = (req, res, next) => {
	var addi = req.body.addi;
	//var sendtoaddress = req.body.sendaddress;
	//var amount = req.body.amount;

	var valid = WAValidator.validate(`${addi}`, 'DNR'); //Need to update to D still

	if (valid) {

		client.dumpPrivKey(`${addi}`, function (error, unlocked, resHeaders) {
			//if (error) return console.log(error);
		
			if (error) {
				//req.flash('errors', { msg: 'Incorrect password!'});
				req.toastr.error('Your wallet is locked or you do not own that address!', 'Error!', { positionClass: 'toast-bottom-right' });
				return res.redirect('/addresses');

			} else {

				req.flash('success', { msg: `Your private key is <strong>${unlocked}</strong> for address ${addi}` });
				req.toastr.success(`Successfully obtained the private key! ${unlocked}`, 'Success!', { positionClass: 'toast-bottom-right' });
				return res.redirect('/addresses');

			}

		});

	} else {

        req.toastr.error('You entered an invalid Denarius (D) Address!', 'Invalid Address!', { positionClass: 'toast-bottom-right' });
        //req.flash('errors', { msg: 'You entered an invalid Denarius (D) Address!' });
		return res.redirect('/addresses');
		
    }
  
  };



/**
 * GET /login
 * Kronos Auth Login
 */
exports.login = (req, res) => {
	db.get('username', function (err, value) {
        if (err) {
          
          // If username does not exist in levelDB then go to page to create one
          res.render('create', {title: 'Create Kronos Login'});

        } else {
		  
		  res.render('login', {title: 'Kronos Login'});

		}
	});
};

/**
 * GET /auth
 * Kronos Auth Login
 */
exports.auth = (req, res) => {
	db.get('username', function (err, value) {
        if (err) {
          
          // If username does not exist in levelDB then go to page to create one
          res.render('create', {title: 'Create Kronos Login'});

        } else {
		  
		  res.render('auth', {title: 'Kronos Authorization'});

		}
	});
};

/**
 * GET /autht
 * Kronos Terminal Auth Login
 */
exports.autht = (req, res) => {
	db.get('username', function (err, value) {
        if (err) {
          
          // If username does not exist in levelDB then go to page to create one
          res.render('create', {title: 'Create Kronos Login'});

        } else {
		  
		  res.render('autht', {title: 'Kronos Authorization'});

		}
	});
};

/**
 * GET /authk
 * Kronos Terminal Pop Auth Login
 */
exports.authk = (req, res) => {
	db.get('username', function (err, value) {
        if (err) {
          
          // If username does not exist in levelDB then go to page to create one
          res.render('create', {title: 'Create Kronos Login'});

        } else {
		  
		  res.render('authk', {title: 'Kronos Authorization'});

		}
	});
};

/**
 * POST /create
 * Kronos Auth Creation
 */
exports.create = (request, response) => {
	var username = request.body.PPU1;
	var password = request.body.PPP1;
	var password2 = request.body.PPP2;
	
	if (username && password) {

		if (request.body && password == password2) {

			db.get('password', function (err, value) {
				if (err) {
				  
					// If password does not exist in levelDB then go to page to create one
					// Encrypt the user and pass for storing in the DB
					var encryptedpass = encrypt(password);
					var encrypteduser = encrypt(username);

					// Put the encrypted username in the DB
					db.put('username', encrypteduser, function (err) {
						if (err) console.log('Ooops!', err) // some kind of I/O error if so
						console.log('Encrypted Username to DB');
					});
			
					// Put the encrypted password in the DB
					db.put('password', encryptedpass, function (err) {
						if (err) console.log('Ooops!', err) // some kind of I/O error if so
						console.log('Encrypted Password to DB');
					});

					var mnemonic;
					// Fetch the Kronos LevelDB Seedphrase
					db.get('seedphrase', function (err, value) {
						if (err) {
							
							// If seedphrase does not exist in levelDB then generate one with the password
							mnemonic = bip39.generateMnemonic(256);

							// Encrypt the seedphrase for storing in the DB
							var encryptedmnemonic = encrypt(mnemonic);
							//console.log("Encrypted Mnemonic", encryptedmnemonic);

							// Put the encrypted passworded seedphrase in the DB
							db.put('seedphrase', encryptedmnemonic, function (err) {
								if (err) return console.log('Ooops!', err) // some kind of I/O error if so
								console.log('Encrypted Seed Phrase to DB');
							});

						} else {
							var decryptedmnemonic = decrypt(value);
							mnemonic = decryptedmnemonic;
						}

					});
					
					// //Stored User/Pass to DB successfully now setup the session
					request.session.loggedin = true;
					request.session.username = username;
					request.toastr.success('Logged into Kronos', 'Success!', { positionClass: 'toast-bottom-right' });
					response.redirect('/');
					response.end();
		
				} else {

				  //Found password in DB so redirecting back to login
				  response.render('login', {title: 'Kronos Login'});
				  response.end();
				}
			});			

		} else {
			request.toastr.error('Passwords do not match!', 'Error!', { positionClass: 'toast-bottom-right' });
			response.redirect('/login');
			response.end();
		}
		
		//response.end();
	
	} else {
		//response.send('Please enter Username and Password!');
		request.toastr.error('Please enter Username and Password!', 'Error!', { positionClass: 'toast-bottom-right' });
		response.redirect('/login');
		response.end();
	}
};

/**
 * GET /logout
 * Kronos Auth Logout
 */
exports.logout = (req, res) => {
	req.session.loggedin = false;
	req.session.loggedin2 = false;
	req.session.username = '';
	req.toastr.error('Logged Out of Kronos', 'Logged Out!', { positionClass: 'toast-bottom-right' });
	res.redirect('/login');
};

/**
 * POST /login
 * Kronos Auth Login
 */
exports.postlogin = (request, response) => {
	var username = request.body.PPU1;
	var password = request.body.PPP1;
	
	if (username && password) {

		db.get('username', function (err, value) {
			if (err) {
			  // If username does not exist in levelDB then go to page to create one
			  //response.render('create', {title: 'Create Kronos Login'});
			  //request.toastr.error('Username does not exist!', 'Error!', { positionClass: 'toast-bottom-right' });
			} else {
				//If it does exist
				var decrypteduser = decrypt(value);

				db.get('password', function (err, value) {
					if (err) {
						// If password does not exist in levelDB then go to page to create one
						//request.toastr.error('Password does not exist!', 'Error!', { positionClass: 'toast-bottom-right' });
					  } else {

						//If it does exist
						var decryptedpass = decrypt(value);

						if (request.body && (username == decrypteduser) && (password == decryptedpass)) {
							request.session.loggedin = true;
							request.session.username = username;
							request.toastr.success('Logged into Kronos', 'Success!', { positionClass: 'toast-bottom-right' });
							response.redirect('/');
							response.end();
						} else {
							//response.send('Incorrect Username and/or Password!');
							//request.flash('success', { msg: 'TEST' });
							request.toastr.error('Incorrect Username and/or Password!', 'Error!', { positionClass: 'toast-bottom-right' });
							response.redirect('/login');
							response.end();
						}
					}

				});
	
			}
		});
		
		//response.end();
	
	} else {
		//response.send('Please enter Username and Password!');
		request.toastr.error('Please enter a Username and Password!', 'Error!', { positionClass: 'toast-bottom-right' });
		response.redirect('/login');
		response.end();
	}
};

/**
 * POST /auth
 * Kronos Auth Login
 */
exports.postAuth = (request, response) => {
	var username = request.body.PPU1;
	var password = request.body.PPP1;
	
	if (username && password) {

		db.get('username', function (err, value) {
			if (err) {
			  // If username does not exist in levelDB then go to page to create one
			  //response.render('create', {title: 'Create Kronos Login'});
			  //request.toastr.error('Username does not exist!', 'Error!', { positionClass: 'toast-bottom-right' });
			} else {
				//If it does exist
				var decrypteduser = decrypt(value);

				db.get('password', function (err, value) {
					if (err) {
						// If password does not exist in levelDB then go to page to create one
						//request.toastr.error('Password does not exist!', 'Error!', { positionClass: 'toast-bottom-right' });
					  } else {

						//If it does exist
						var decryptedpass = decrypt(value);

						if (request.body && (username == decrypteduser) && (password == decryptedpass)) {
							request.session.loggedin = true;
							request.session.loggedin2 = true;
							request.session.username = username;
							request.toastr.success('Authed Kronos', 'Success!', { positionClass: 'toast-bottom-right' });
							response.redirect('/seed');
							response.end();
						} else {
							//response.send('Incorrect Username and/or Password!');
							//request.flash('success', { msg: 'TEST' });
							request.toastr.error('Incorrect Username and/or Password!', 'Error!', { positionClass: 'toast-bottom-right' });
							response.redirect('/auth');
							response.end();
						}
					}

				});
	
			}
		});
		
		//response.end();
	
	} else {
		//response.send('Please enter Username and Password!');
		request.toastr.error('Please enter a Username and Password!', 'Error!', { positionClass: 'toast-bottom-right' });
		response.redirect('/auth');
		response.end();
	}
};

/**
 * POST /autht
 * Kronos Terminal Auth Login
 */
exports.postAutht = (request, response) => {
	var username = request.body.PPU1;
	var password = request.body.PPP1;

	const ip = require('ip');
	const ipaddy = ip.address();
  
	response.locals.lanip = ipaddy;
	
	if (username && password) {

		db.get('username', function (err, value) {
			if (err) {
			  // If username does not exist in levelDB then go to page to create one
			  //response.render('create', {title: 'Create Kronos Login'});
			  //request.toastr.error('Username does not exist!', 'Error!', { positionClass: 'toast-bottom-right' });
			} else {
				//If it does exist
				var decrypteduser = decrypt(value);

				db.get('password', function (err, value) {
					if (err) {
						// If password does not exist in levelDB then go to page to create one
						//request.toastr.error('Password does not exist!', 'Error!', { positionClass: 'toast-bottom-right' });
					  } else {

						//If it does exist
						var decryptedpass = decrypt(value);

						if (request.body && (username == decrypteduser) && (password == decryptedpass)) {
							request.session.loggedin = true;
							request.session.loggedin3 = true;
							request.session.username = username;
							request.toastr.success('Authed Kronos', 'Success!', { positionClass: 'toast-bottom-right' });
							response.redirect('http://'+ip.address()+':3300/terminal');
							response.end();
						} else {
							//response.send('Incorrect Username and/or Password!');
							//request.flash('success', { msg: 'TEST' });
							request.toastr.error('Incorrect Username and/or Password!', 'Error!', { positionClass: 'toast-bottom-right' });
							response.redirect('http://'+ip.address()+':3000/autht');
							response.end();
						}
					}

				});
	
			}
		});
		
		//response.end();
	
	} else {
		//response.send('Please enter Username and Password!');
		request.toastr.error('Please enter a Username and Password!', 'Error!', { positionClass: 'toast-bottom-right' });
		response.redirect('http://'+ip.address()+':3000/autht');
		response.end();
	}
};

/**
 * POST /authk
 * Kronos Terminal Popout Auth Login
 */
exports.postAuthk = (request, response) => {
	var username = request.body.PPU1;
	var password = request.body.PPP1;

	const ip = require('ip');
	const ipaddy = ip.address();
  
	response.locals.lanip = ipaddy;
	
	if (username && password) {

		db.get('username', function (err, value) {
			if (err) {
			  // If username does not exist in levelDB then go to page to create one
			  //response.render('create', {title: 'Create Kronos Login'});
			  //request.toastr.error('Username does not exist!', 'Error!', { positionClass: 'toast-bottom-right' });
			} else {
				//If it does exist
				var decrypteduser = decrypt(value);

				db.get('password', function (err, value) {
					if (err) {
						// If password does not exist in levelDB then go to page to create one
						//request.toastr.error('Password does not exist!', 'Error!', { positionClass: 'toast-bottom-right' });
					  } else {

						//If it does exist
						var decryptedpass = decrypt(value);

						if (request.body && (username == decrypteduser) && (password == decryptedpass)) {
							request.session.loggedin = true;
							request.session.loggedin4 = true;
							request.session.username = username;
							request.toastr.success('Authed Kronos', 'Success!', { positionClass: 'toast-bottom-right' });
							response.redirect('http://'+ip.address()+':3300/termpop');
							response.end();
						} else {
							//response.send('Incorrect Username and/or Password!');
							//request.flash('success', { msg: 'TEST' });
							request.toastr.error('Incorrect Username and/or Password!', 'Error!', { positionClass: 'toast-bottom-right' });
							response.redirect('http://'+ip.address()+':3000/authk');
							response.end();
						}
					}

				});
	
			}
		});
		
		//response.end();
	
	} else {
		//response.send('Please enter Username and Password!');
		request.toastr.error('Please enter a Username and Password!', 'Error!', { positionClass: 'toast-bottom-right' });
		response.redirect('http://'+ip.address()+':3000/authk');
		response.end();
	}
};



//POST Wallet Notify
exports.notification = (req, res, next) => {
var notifydata = req.body.txid;

console.log("Transaction Notify Received: ", notifydata);

files.writeFile('notifies.txt', notifydata, function (err) {
	if (err) throw err;
	console.log('TXID Written to File');
});

res.send('Got your notify!');
next();

};