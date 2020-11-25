/*
**************************************
**************************************
**************************************
* Kronos Controller
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
const sourcePath = '.env';
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

//Connect to our D node 
//process.env.DUSER
const client = new bitcoin.Client({
	host: decrypt(Storage.get('rpchost')),
	port: decrypt(Storage.get('rpcport')),
	user: decrypt(Storage.get('rpcuser')),
	pass: decrypt(Storage.get('rpcpass')),
	timeout: 30000
});

//Unlock Wallet
exports.unlock = (req, res, next) => {
  var password = req.body.password;
  //var sendtoaddress = req.body.sendaddress;
  //var amount = req.body.amount;

  client.walletPassphrase(`${password}`, 9999999, function (error, unlocked, resHeaders) {
	//if (error) return console.log(error);

	if (error) {
		//req.flash('errors', { msg: 'Incorrect password!'});
		req.toastr.error('Wallet Unlock Error', 'Incorrect Password!', { positionClass: 'toast-bottom-left' });
		return res.redirect('/');
	} else {
		//req.flash('success', { msg: `Wallet Unlocked!` });
		req.toastr.success('Success!', 'Wallet Unlocked', { positionClass: 'toast-bottom-left' });
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
		  req.toastr.error('Wallet Unlock Error', 'Incorrect Password!', { positionClass: 'toast-bottom-left' });
		  return res.redirect('/');
	  } else {
		  //req.flash('success', { msg: `Wallet Unlocked!` });
		  req.toastr.success('Success!', 'Wallet Unlocked for Staking Only', { positionClass: 'toast-bottom-left' });
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
		  req.toastr.error('Wallet Lock Error', 'Error!', { positionClass: 'toast-bottom-left' });
		  return res.redirect('/');
	  } else {
		  //req.flash('success', { msg: `Wallet Unlocked!` });
		  req.toastr.success('Success!', 'Wallet Locked', { positionClass: 'toast-bottom-left' });
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
		req.toastr.error('Passwords do not match', 'Passphrase Error!', { positionClass: 'toast-bottom-left' });
		return res.redirect('/');
	}
  
	client.encryptWallet(`${passworded}`, function (error, encrypt, resHeaders) {
	  //if (error) return console.log(error);
  
	  if (error) {
		  req.toastr.error('Wallet Encryption Error', 'Encryption Error!', { positionClass: 'toast-bottom-left' });
		  return res.redirect('/');
	  } else {
		  req.toastr.success('Success!', 'Wallet Encrypted', { positionClass: 'toast-bottom-left' });
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
		  req.toastr.error('Something went wrong!', 'Reboot Error!', { positionClass: 'toast-bottom-left' });
		  process.exit(0);
		  //return res.redirect('/');
		}
	});

	//req.toastr.success('Success!', 'Stopping Denarius...Please wait', { positionClass: 'toast-bottom-left' });

	//sleep(120000); // sleep for 120 seconds

	//req.toastr.success('Success!', 'Starting Denarius...Please wait', { positionClass: 'toast-bottom-left' });

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
				req.toastr.error('Your wallet is locked or you do not own that address!', 'Error!', { positionClass: 'toast-bottom-left' });
				return res.redirect('/addresses');

			} else {

				req.flash('success', { msg: `Your private key is <strong>${unlocked}</strong> for address ${addi}` });
				req.toastr.success(`Successfully obtained the private key! ${unlocked}`, 'Success!', { positionClass: 'toast-bottom-left' });
				return res.redirect('/addresses');

			}

		});

	} else {

        req.toastr.error('You entered an invalid Denarius (D) Address!', 'Invalid Address!', { positionClass: 'toast-bottom-left' });
        //req.flash('errors', { msg: 'You entered an invalid Denarius (D) Address!' });
		return res.redirect('/addresses');
		
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

// //Get Kronos Chat
// exports.getchat = (req, res) => {

//     const ip = require('ip');
//     const ipaddy = ip.address();
  
//     res.locals.lanip = ipaddy;

//     var totalethbal = Storage.get('totaleth');
//     var totalbal = Storage.get('totalbal');
//     var totalaribal = Storage.get('totalaribal');
//     //var ethaddress = Storage.get('ethaddy');
//     var mainaddress = Storage.get('mainaddress');

//     res.render('simple/chat', {
//         totalethbal: totalethbal,
//         totalbal: totalbal,
//         totalaribal: totalaribal,
//         ethaddress: ethaddress,
//         mainaddress: mainaddress
//     });

// };

// GET Kronos Chat for Advanced Mode
exports.getchat = (req, res) => {
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
    })

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
		
		res.render('advchat', {title: 'Kronos Chat', mainaddress: address, staketoggle: staketoggle, balance: balance, chaindl: chaindl, chaindlbtn: chaindlbtn, offline: offline, offlinebtn: offlinebtn, sendicon: sendicon});
	});
});
});
});
};