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
const Storage = require('json-storage-fs');

const SECRET_KEY = Storage.get('key'); //process.env.SECRET_KEY

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