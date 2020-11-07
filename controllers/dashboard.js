/*
**************************************
**************************************
**************************************
* Kronos Dashboard Controller
* Copyright (c) 2020 Carsen Klock
**************************************
**************************************
**************************************
*/
/* eslint-disable no-tabs */
/* eslint-disable no-mixed-spaces-and-tabs */
const si = require('systeminformation');
const bitcoin = require('bitcoin');
const WAValidator = require('wallet-address-validatord');
const QRCode = require('qrcode');
const unirest = require('unirest');
const ProgressBar = require('progressbar.js');
const cpuu = require('cputilization');
const toastr = require('express-toastr');
const exec = require('child_process').exec;
const shell = require('shelljs');
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
const randomstring = require("randomstring");
const Storage = require('json-storage-fs');

var currentOS = os.platform(); 

if (currentOS === 'linux') {
    let SECRET_KEY = process.env.KEY;

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

} else {
    let SECRET_KEY = process.env.KEY; //keytar.getPasswordSync('Kronos', 'localkey');

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
}

if (typeof Storage.get('rpchost') == 'undefined') {
	Storage.set('rpchost', '127.0.0.1');
	Storage.set('rpcport', '32369');
	Storage.set('rpcuser', 'null');
	Storage.set('rpcpass', 'null');
}

//Get information
exports.index = (req, res) => {

const ip = require('ip');
const ipaddy = ip.address();

res.locals.lanip = ipaddy;

//Connect to our D node 
//process.env.DUSER
const client = new bitcoin.Client({
	host: decrypt(Storage.get('rpchost')),
	port: decrypt(Storage.get('rpcport')),
	user: decrypt(Storage.get('rpcuser')),
	pass: decrypt(Storage.get('rpcpass')),
	timeout: 30000
});

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

	res.locals.osname = osname;
	res.locals.kernel = kernel;
	res.locals.platform = platform;
	res.locals.release = release;
	res.locals.hostname = hostname;
	res.locals.arch = arch;

	//Emit to our Socket.io Server
// 	res.io.on('connection', function (socket) {
// 		socket_id5.push(socket.id);
// 		if (socket_id5[0] === socket.id) {
// 		  // remove the connection listener for any subsequent 
// 		  // connections with the same ID
// 		  res.io.removeAllListeners('connection'); 
// 		}
// 		res.locals.osname = osname;
// 		res.locals.kernel = kernel;
// 		res.locals.platform = platform;
// 		res.locals.release = release;
// 		res.locals.hostname = hostname;
// 		res.locals.arch = arch;
// 		socket.emit("osinfo", {osname: osname, kernel: kernel, platform: platform, release: release, hostname: hostname, arch: arch});

// });
});

// si.system(function (data9) {

// 	var manu = data9.manufacturer;
// 	var model = data9.model;

// 	//Emit to our Socket.io Server
// 	res.io.on('connection', function (socket) {
// 		socket_id6.push(socket.id);
// 		if (socket_id6[0] === socket.id) {
// 		  // remove the connection listener for any subsequent 
// 		  // connections with the same ID
// 		  res.io.removeAllListeners('connection'); 
// 		}
// 		socket.emit("sysmodel", {manu: manu, model: model});
// 	});

// });

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

			res.locals.peers = peers;

			var nethash = nethashh.toFixed(2);

			res.locals.nethash = nethash;
			res.locals.diff = diff;
			res.locals.stakediff = stakediff;
			res.locals.netweight = netweight;
			res.locals.yourweight = yourweight;

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
		});

		// let cpustatarray = [];
		// si.cpu(async function (data) {

		// 	var cores = data.physicalCores;
		// 	var threads = data.cores;

		// 	cpustatarray.push({cores: cores, threads: threads});

		// 	res.locals.cores = cores;
		// 	res.locals.threads = threads;

		// });

		// console.log(cpustatarray);
		
		//Render the page with the dynamic variables
        res.render('dashboard', {
			title: 'Dashboard',
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
			peers: peers,
			datasent: datasent,
			datareceived: datareceived,
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
// });
};