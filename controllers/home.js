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

/**
 * GET /
 * Home page.
 */

 //Connect to our D node
var client = new bitcoin.Client({
    host: process.env.DNRHOST,
    port: process.env.DNRPORT,
    user: process.env.DNRUSER,
    pass: process.env.DNRPASS,
    timeout: 30000
});

//Get information
exports.index = (req, res) => {
si.cpu(function (data) {	  

	var brand1 = JSON.stringify(data.brand);
	var brand = brand1;

	var cores = data.physicalCores;
	var threads = data.cores;

	si.cpuCurrentspeed(function (data2) {

	var min = data2.min;
	var avg = data2.avg;
	var max = data2.max;

	si.cpuTemperature(function (data3) {
	var tempp = data3.main;
	var temppp = tempp.toFixed(0);

	if (temppp == -1) {
		var temp = 'N/A';
	} else {
		var temp = temppp;
	}

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

si.osInfo(function (data4) {

	var osname = data4.distro;
	var kernel = data4.kernel;
	var platform = data4.platform;
	var release = data4.release;
	var hostname = data4.hostname;
	var arch = data4.arch;

si.system(function (data9) {

	var manu = data9.manufacturer;
	var model = data9.model;

si.currentLoad().then(data6 => {

	var avgload = data6.avgload;
	var currentload = data6.currentload;

	var cpu = currentload / 100;


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

	client.dumpPrivKey(`${address}`, function (err, privkey, resHeaders) {
		if (err) {
			console.log(err);
		}

		var privatekey = privkey;

	QRCode.toDataURL(qr, function(err, qrcode) {

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
				enabletoggle = 'Enabled';
			} else {
				enabletoggle = 'Disabled';
			}

			if (staking == true) {
				staketoggle = 'Staking';
			} else {
				staketoggle = 'Not Staking';
			}
		}

	client.getMiningInfo(function (error, mineinfo, resHeaders) {

		if (error) {
			var diff = 'Node Offline';
			var nethash = 'Node Offline';
			var stakediff = 'Node Offline';

			var offline = 'offlineoverlay';

			var offlinebtn = 'offlinebutton';

			console.log(error);

		} else {
			var diff = mineinfo.difficulty['proof-of-work'];
			var stakediff = mineinfo.difficulty['proof-of-stake'];
			var nethashh = mineinfo.netmhashps;

			var nethash = nethashh.toFixed(2);

			var offline = 'onlineoverlay';
			var offlinebtn = 'onlinebutton';

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
		}

		//Get Current Block Count from Chainz Explorer
		unirest.get("https://chainz.cryptoid.info/d/api.dws?q=getblockcount")
		.headers({'Accept': 'application/json'})
		.end(function (result) {
			var cryptoidblocks = result.body;

		//Get Current D/BTC and D/USD price from CoinGecko
		unirest.get("https://api.coingecko.com/api/v3/coins/denarius?tickers=true&market_data=true&community_data=false&developer_data=true")
			.headers({'Accept': 'application/json'})
			.end(function (result) {
				var usdbalance = result.body['market_data']['current_price']['usd'] * balance;
				var currentprice = result.body['market_data']['current_price']['usd'];

		if (blockheight >= 0 && cryptoidblocks >= 0) {
			var blockpercent = blockheight / cryptoidblocks;
			var blockpercc = blockheight / cryptoidblocks * 100;
			var blockperc = blockpercc.toFixed(2);
		}
		
		//Render the page with the dynamic variables
        res.render('home', {
			title: 'Home',
			brand: brand,
			data1: data1,
			cores: cores,
			threads: threads,
			min: min,
			avg: avg,
			max: max,
			temp: temp,
			memt: memt,
			memu: memu,
			memf: memf,
			mema: mema,
			osname: osname,
			kernel: kernel,
			platform: platform,
			release: release,
			arch: arch,
			hostname: hostname,
			manu: manu,
			model: model,
			blockheight: blockheight,
			balance: balance,
			unbalance: unbalance,
			instake: instake,
			version: version,
			protocol: protocol,
			peers: peers,
			ip: ip,
			datadir: datadir,
			syncing: syncing,
			fs: fs,
			tor: tor,
			moneysupply: moneysupply,
			memp: memp,
			mempp: mempp,
			cpu: cpu,
			avgload: avgload,
			nethash: nethash,
			timeframe: timeframe,
			target: target,
			diff: diff,
			stakediff: stakediff,
			stakebal: stakebal,
			enabled: enabled,
			staking: staking,
			yourweight: yourweight,
			netweight: netweight,
			expected: expected,
			stakediff: stakediff,
			staketoggle: staketoggle,
			enabletoggle: enabletoggle,
			datareceived: datareceived,
			datasent: datasent,
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
			privatekey: privatekey,
			chaindl: chaindl,
			chaindlbtn: chaindlbtn,
			cryptoidblocks: cryptoidblocks,
			blockpercent: blockpercent,
			blockperc: blockperc,
			sendicon: sendicon,
			fscount: fscount,
			currentprice: currentprice.toFixed(2),
			usdbalance: usdbalance.toFixed(2)
        	});
		});
	});
});
});
});
});
});
});
});
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

	return res.redirect('/');

  };


  //Get private key
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

				req.flash('success', { msg: `Your private key for address <strong>${addi}</strong> is <strong>${unlocked}</strong>` });
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