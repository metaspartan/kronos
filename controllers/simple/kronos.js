/*
**************************************
**************************************
**************************************
* Kronos Core Mode Controller
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
const bitcoinjs = require('bitcoinjs-lib');
const CryptoJS = require("crypto-js");
const bip39 = require("bip39");
const bip32 = require("bip32d");
const bip32b = require("bip32");
const sha256 = require('sha256');
const files = require('fs');
const appRoot = require('app-root-path');
const split = require('split');
const os = require('os');
const dbr = require('../../db.js');
const db = dbr.db;
const { isNullOrUndefined } = require('util');
const { ElectrumCluster } = require('electrum-cash');
const bs58 = require('bs58');
const randomstring = require("randomstring");
const Storage = require('json-storage-fs');
const PromiseLoadingSpinner = require('promise-loading-spinner');
const main = require('progressbar.js');
const ethers = require('ethers');
const { triggerAsyncId } = require('async_hooks');
//const ThreeBox = require('3box');
const IdentityWallet = require('identity-wallet');
const axios = require('axios');

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

// console.log('Opening 3Box');
// async function ThreeBoxSetup() {
//     const box = await ThreeBox.create();
// }
// ThreeBoxSetup();

const changeEndianness = (string) => {
    const result = [];
    let len = string.length - 2;
    while (len >= 0) {
    result.push(string.substr(len, 2));
    len -= 2;
    }
    return result.join('');
}

//Get Core Mode Settings
exports.getcoresettings = (req, res) => {

    const ip = require('ip');
    const ipaddy = ip.address();
  
    res.locals.lanip = ipaddy;

    var totalethbal = Storage.get('totaleth');
    var totalbal = Storage.get('totalbal');
    var totalusdtbal = Storage.get('totalusdtbal');
    var ethaddress = Storage.get('ethaddy');
    var cloutaddress = Storage.get('cloutaddy');
    var twofaenable = Storage.get('2fa');
    var u2fdevices = Storage.get("u2fdevices");

    axios
        .post('https://bitclout.com/api/v0/get-single-profile', {PublicKeyBase58Check: cloutaddress}, {    
            headers: {
            'Content-Type': 'application/json'
            }
        })
        .then(res => {
            let username = res.data.Profile.Username;
            
            Storage.set('cloutuser', username);
        })
        .catch(error => {
            console.error(error)
        });

    let userexists = Storage.get('cloutuser');

    res.render('simple/settings', {
        totalethbal: totalethbal,
        twofaenable: twofaenable,
        totalbal: totalbal,
        totalusdtbal: totalusdtbal,
        u2fdevices: u2fdevices,
        ethaddress: ethaddress,
        cloutaddress: cloutaddress,
        userexists: userexists
    });
};

//Get Core Mode Profile
exports.getprofile = (req, res) => {

    const ip = require('ip');
    const ipaddy = ip.address();
  
    res.locals.lanip = ipaddy;

    var totalethbal = Storage.get('totaleth');
    var totalbal = Storage.get('totalbal');
    var totalusdtbal = Storage.get('totalusdtbal');
    var ethaddress = Storage.get('ethaddy');
    var cloutaddress = Storage.get('cloutaddy');
    var twofaenable = Storage.get('2fa');

    axios
        .post('https://bitclout.com/api/v0/get-single-profile', {PublicKeyBase58Check: cloutaddress}, {    
            headers: {
            'Content-Type': 'application/json'
            }
        })
        .then(res => {
            let username = res.data.Profile.Username;
            let biog = res.data.Profile.Description;
            let FR = res.data.Profile.CoinEntry.CreatorBasisPoints / 100;
            
            Storage.set('cloutuser', username);
            Storage.set('cloutdesc', biog);
            Storage.set('FR', FR);
        })
        .catch(error => {
            console.error(error)
        });

        let username = Storage.get('cloutuser');
        let description = Storage.get('cloutdesc');
        let FR = Storage.get('FR');

    res.render('simple/profile', {
        totalethbal: totalethbal,
        twofaenable: twofaenable,
        totalbal: totalbal,
        totalusdtbal: totalusdtbal,
        ethaddress: ethaddress,
        cloutaddress: cloutaddress,
        username: username,
        description: description,
        FR: FR
    });
};

// POST the Decentralized Profiles to BitClout - WORK IN PROGRESS
exports.postprofile = (request, response) => {
	var name = request.body.NAMEBOX;
	var founder = request.body.founder * 100; // In Nanos for Founder Reward
    var bio = request.body.BIOBOX;
    var avatar = request.body.AVATAR;

	const ip = require('ip');
	const ipaddy = ip.address();
  
    response.locals.lanip = ipaddy;

    let promises = [];
    let array = [];

    var cloutaddress = Storage.get('cloutaddy');
    var seedphrasedb = Storage.get('seed');

    console.log(avatar);
    console.log(name);
    console.log(bio);
    console.log(founder);
    
    var decryptedmnemonic = decrypt(seedphrasedb);
    mnemonic = decryptedmnemonic;
	
	if (avatar && name && bio && founder) {        
        axios
        .post('https://bitclout.com/api/v0/update-profile', 
        {
            UpdaterPublicKeyBase58Check: cloutaddress,
            NewUsername: name,
            NewDescription: bio,
            NewProfilePic: avatar,
            NewCreatorBasisPoints: parseInt(founder),
            NewStakeMultipleBasisPoints: 12500,
            IsHidden: false,
            MinFeeRateNanosPerKB: 1000
        }, {    
            headers: {
            'Content-Type': 'application/json'
            }
        })
        .then(res => {
            let txhex = res.data.TransactionHex;
            
            console.log(txhex);

            //POST Submit-Transaction needs signing finished

            axios
            .post('https://bitclout.com/api/v0/submit-transaction', 
            {
                TransactionHex: txhex,
            }, {    
                headers: {
                'Content-Type': 'application/json'
                }
            })
            .then(res => {
                let hash = res.data.TransactionHex;

                    
                request.toastr.success('Updated your profile!', 'Success!', { positionClass: 'toast-bottom-left' });
                response.redirect('http://'+ip.address()+':3000/profile');
                response.end();
                
            })
            .catch(error => {
                console.error(error)
            });

        })
        .catch(error => {
            console.error(error)
        });        
	
	} else {
		//response.send('Please enter Username and Password!');
		request.toastr.error('Please ensure you fill out all fields!', 'Error!', { positionClass: 'toast-bottom-left' });
		response.redirect('http://'+ip.address()+':3000/profile');
		response.end();
	}
};