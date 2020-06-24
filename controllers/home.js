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

// Testing Denarius (D) Mnemonic Seed Phrases - Major WIP
//
//
//
//

var mnemonic;
let seedaddresses = [];
// const db = level('dpileveldb'); // LevelDB dPi Init Directory

// Fetch the dPi LevelDB
db.get('seedphrase', function (err, value) {
	if (err) {
		
		// If seedphrase does not exist in levelDB then generate one
		mnemonic = bip39.generateMnemonic();
		console.log("~Generated Denarius Mnemonic~ ", mnemonic);

		// Encrypt the seedphrase for storing in the DB
		var encryptedmnemonic = encrypt(mnemonic);
		console.log("Encrypted Mnemonic", encryptedmnemonic);

		// Put the encrypted seedphrase in the DB
		db.put('seedphrase', encryptedmnemonic, function (err) {
			if (err) return console.log('Ooops!', err) // some kind of I/O error if so
			//console.log('Inserted Encrypted Seed Phrase to DB');
		});

		//return mnemonic;

	} else {

		var decryptedmnemonic = decrypt(value);
		console.log("Decrypted Mnemonic", decryptedmnemonic);

		mnemonic = decryptedmnemonic;

		//return mnemonic;

	}


	console.log("Stored Denarius Mnemonic: ", mnemonic);

	//Convert our mnemonic seed phrase to BIP39 Seed Buffer 
	const seed = bip39.mnemonicToSeedSync(mnemonic);
	console.log("BIP39 Seed Phrase to Hex", seed.toString('hex'));
	
	// BIP32 From BIP39 Seed
	const root = bip32.fromSeed(seed);

	// Denarius Network Params Object
	const network = {
			messagePrefix: '\x19Denarius Signed Message:\n',
			bech32: 'd',
			bip32: {
				public: 0x0488b21e,
				private: 0x0488ade4
			},
			pubKeyHash: 0x1e,
			scriptHash: 0x5a,
			wif: 0x9e
	};

	// A for loop for how many addresses we want from the derivation path of the seed phrase
	//
	for (let i = 0; i < 10; i++) {

		//Get 10 Addresses from the derived mnemonic
		const addressPath = `m/44'/116'/0'/0/${i}`;

		// Get the keypair from the address derivation path
		const addressKeypair = root.derivePath(addressPath);

		// Get the p2pkh base58 public address of the keypair
		const p2pkhaddy = denarius.payments.p2pkh({ pubkey: addressKeypair.publicKey, network }).address;

		const privatekey = addressKeypair.toWIF();
	
		//New Array called seedaddresses that is filled with address and path data currently, WIP and TODO
		seedaddresses.push({ address: p2pkhaddy, privkey: privatekey, path: addressPath });
	}

	// Console Log the full array - want to eventually push these into scripthash hashing and retrieve balances and then send from them
	console.log("Seed Address Array", seedaddresses);

	//Emit to our Socket.io Server
	// io.on('connection', function (socket) {
	// 	socket.emit("seed", {seedaddresses: seedaddresses});
	// 	// setInterval(() => {
	// 	// 	socket.emit("seed", {seedaddresses: seedaddresses});
	// 	// }, 60000);		
	// });

});

console.log("Seed Address Array 2", seedaddresses);
// //Wait under a half second to ensure the seedphrase to be grabbed from the LevelDB above
// setTimeout(function bip39seed() {

// 	console.log("Stored Denarius Mnemonic: ", mnemonic);

// 	//Convert our mnemonic seed phrase to BIP39 Seed Buffer 
// 	const seed = bip39.mnemonicToSeedSync(mnemonic);
// 	console.log("BIP39 Seed Phrase to Hex", seed.toString('hex'));
	
// 	// BIP32 From BIP39 Seed
// 	const root = bip32.fromSeed(seed);

// 	// Denarius Network Params Object
// 	const network = {
// 			messagePrefix: '\x19Denarius Signed Message:\n',
// 			bech32: 'd',
// 			bip32: {
// 				public: 0x0488b21e,
// 				private: 0x0488ade4
// 			},
// 			pubKeyHash: 0x1e,
// 			scriptHash: 0x5a,
// 			wif: 0x9e
// 	};

// 	// A for loop for how many addresses we want from the derivation path of the seed phrase
// 	//
// 	for (let i = 0; i < 10; i++) {

// 		//Get 10 Addresses from the derived mnemonic
// 		const addressPath = `m/44'/116'/0'/0/${i}`;

// 		// Get the keypair from the address derivation path
// 		const addressKeypair = root.derivePath(addressPath);

// 		// Get the p2pkh base58 public address of the keypair
// 		const p2pkhaddy = denarius.payments.p2pkh({ pubkey: addressKeypair.publicKey, network }).address;

// 		const privatekey = addressKeypair.toWIF();
	
// 		//New Array called seedaddresses that is filled with address and path data currently, WIP and TODO
// 		seedaddresses.push({ address: p2pkhaddy, privkey: privatekey, path: addressPath });
// 	}

// 	// Console Log the full array - want to eventually push these into scripthash hashing and retrieve balances and then send from them
// 	console.log("Seed Address Array", seedaddresses);

// }, 1000);

// GET Denarius Debug Log File
exports.getDebugLog = (req, res) => {

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

//Get information
exports.index = (req, res) => {

	const ip = require('ip');
	const ipaddy = ip.address();

	res.locals.lanip = ipaddy;

// WIP for getInfo Realtime Calls
// var delay = 30000;
// res.io.on('connection', function (socket) {
// 				clearInterval(intervalset);
// 				var intervalset = setInterval(() => {

// 					client.getInfo(function (error, info, resHeaders) {
// 						if (error) { 
// 							console.log(error);
// 						} else {
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
// 						}
// 					});

// 				}, delay);

// 				socket.on('disconnect', () => {
// 					clearInterval(intervalset);
// 				});
// });	

let socket_id = [];
let socket_id2 = [];
let socket_id3 = [];
let socket_id4 = [];
let socket_id5 = [];
let socket_id6 = [];
let socket_id7 = [];

si.cpu(function (data) {	  

	var brand1 = JSON.stringify(data.brand);
	var brand = brand1;

	var cores = data.physicalCores;
	var threads = data.cores;
	res.locals.cores = cores;
	res.locals.threads = threads;
	res.locals.brand = brand;
	//Emit to our Socket.io Server
	res.io.on('connection', function (socket) {
		socket_id.push(socket.id);
		//console.log(socket.id);
		if (socket_id[0] === socket.id) {
		  // remove the connection listener for any subsequent 
		  // connections with the same ID
		  res.io.removeAllListeners('connection'); 
		}
		socket.emit("cpudata", {cores: cores, brand: brand, threads: threads});
		setInterval(() => {
			socket.emit("cpudata", {cores: cores, brand: brand, threads: threads});
		}, 60000);		
	});
});

si.cpuCurrentspeed(async function (data2) {

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
		}, 60000);
	});
});

si.cpuTemperature(async function (data3) {
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

si.mem(async function (data1) {

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

si.osInfo(async function (data4) {

	var osname = data4.distro;
	var kernel = data4.kernel;
	var platform = data4.platform;
	var release = data4.release;
	var hostname = data4.hostname;
	var arch = data4.arch;

	//Emit to our Socket.io Server
	res.io.on('connection', function (socket) {
		socket_id5.push(socket.id);
		if (socket_id5[0] === socket.id) {
		  // remove the connection listener for any subsequent 
		  // connections with the same ID
		  res.io.removeAllListeners('connection'); 
		}
		socket.emit("osinfo", {osname: osname, kernel: kernel, platform: platform, release: release, hostname: hostname, arch: arch});
		setInterval(() => {
			socket.emit("osinfo", {osname: osname, kernel: kernel, platform: platform, release: release, hostname: hostname, arch: arch});
		}, 60000);
	});

});

si.system(async function (data9) {

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
		setInterval(() => {
			socket.emit("sysmodel", {manu: manu, model: model});
		}, 60000);
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
				if (result.body != undefined) {

					var usdbalance = result.body['market_data']['current_price']['usd'] * balance;
					var currentprice = result.body['market_data']['current_price']['usd'];

					socket.emit("usdinfo", {usdbalance: result.body['market_data']['current_price']['usd'] * balance, currentprice: result.body['market_data']['current_price']['usd']});
				} else { 
					usdbalance = '~';
					currentprice = '~';
					socket.emit("usdinfo", {usdbalance: usdbalance, currentprice: currentprice});
				}
			});
			setTimeout(() => {
				setInterval(() => {
						//Get Current D/BTC and D/USD price from CoinGecko
						unirest.get("https://api.coingecko.com/api/v3/coins/denarius?tickers=true&market_data=true&community_data=false&developer_data=true")
						.headers({'Accept': 'application/json'})
						.end(function (result) {
							if (result.body != undefined) {

								var usdbalance = result.body['market_data']['current_price']['usd'] * balance;
								var currentprice = result.body['market_data']['current_price']['usd'];

								socket.emit("usdinfo", {usdbalance: result.body['market_data']['current_price']['usd'] * balance, currentprice: result.body['market_data']['current_price']['usd']});
							} else { 
								usdbalance = '~';
								currentprice = '~';
								socket.emit("usdinfo", {usdbalance: usdbalance, currentprice: currentprice});
							}
						});
				}, 20000);
			}, 30000);
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