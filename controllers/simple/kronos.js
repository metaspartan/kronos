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
const ElectrumClient = require('electrum-cash').Client;
const ElectrumCluster = require('electrum-cash').Cluster;
const bs58 = require('bs58');
const randomstring = require("randomstring");
const Storage = require('json-storage-fs');
const PromiseLoadingSpinner = require('promise-loading-spinner');
const main = require('progressbar.js');
const ethers = require('ethers');
const { triggerAsyncId } = require('async_hooks');
const ThreeBox = require('3box');
const IdentityWallet = require('identity-wallet');
const prompt = require('async-prompt');

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
    var totalaribal = Storage.get('totalaribal');
    var ethaddress = Storage.get('ethaddy');
    var twofaenable = Storage.get('2fa');

    res.render('simple/settings', {
        totalethbal: totalethbal,
        twofaenable: twofaenable,
        totalbal: totalbal,
        totalaribal: totalaribal,
        ethaddress: ethaddress
    });
};

//Get Core Mode Profile
exports.getprofile = (req, res) => {

    const ip = require('ip');
    const ipaddy = ip.address();
  
    res.locals.lanip = ipaddy;

    var totalethbal = Storage.get('totaleth');
    var totalbal = Storage.get('totalbal');
    var totalaribal = Storage.get('totalaribal');
    var ethaddress = Storage.get('ethaddy');
    var twofaenable = Storage.get('2fa');    

    res.render('simple/profile', {
        totalethbal: totalethbal,
        twofaenable: twofaenable,
        totalbal: totalbal,
        totalaribal: totalaribal,
        ethaddress: ethaddress
    });
};

// POST the Decentralized Profile - WORK IN PROGRESS
exports.postprofile = (request, response) => {
	var name = request.body.NAMEBOX;
	var website = request.body.WEBBOX;
    var bio = request.body.BIOBOX;
    var privy = request.body.EMOJI;
    var avatar = request.body.AVATAR;

	const ip = require('ip');
	const ipaddy = ip.address();
  
    response.locals.lanip = ipaddy;

    let promises = [];
    let array = [];
    
    var ethaddress = Storage.get('ethaddy');
    var seedphrasedb = Storage.get('seed');
    let ethnetworktype = 'homestead'; //homestead is mainnet, ropsten for testing, choice for UI selection eventually

    let provider = ethers.getDefaultProvider(ethnetworktype, {
        etherscan: 'JMBXKNZRZYDD439WT95P2JYI72827M4HHR',
        // Or if using a project secret:
        infura: {
            projectId: 'f95db0ef78244281a226aad15788b4ae',
            projectSecret: '6a2d027562de4857a1536774d6e65667',
        },
        alchemy: 'W5yjuu3Ade1lsIn3Od8rTqJsYiFJszVY',
        cloudflare: ''
    });

    console.log(avatar);
    console.log(name);
    console.log(bio);
    console.log(privy);
    console.log(website);

    
    var decryptedmnemonic = decrypt(seedphrasedb);
    mnemonic = decryptedmnemonic;      
    // ETH and ARI
    let ethwallet = ethers.Wallet.fromMnemonic(mnemonic); //Generate wallet from our Kronos seed
    let ethprivkey = ethwallet.privateKey;
	
	if (avatar) {
        const Box3 = async() => {
            try {
                //const ceramic = new Ceramic(); // An instance of Ceramic (either @ceramicnetwork/core, or @ceramicnetwork/http-client)
                //const threeId = await ThreeIdProvider.create({ consent, ethprivkey, ceramic });
                //MASSIVE WIP CURRENTLY NOT WORKING
                async function consent (req) {
                    console.log('\n ------ ')
                    console.log('App with origin:', req.origin)
                    if (req.spaces.length > 0) {
                        console.log('is requesting access to spaces:', req.spaces)
                    } else {
                        console.log('is requesting access to your 3box')
                    }
                    console.log('Auto Consent? Then return true');
                    return true;
                }

                const idw = new IdentityWallet.default(consent, { seed: ethprivkey}); //.create(consent, { seed: ethprivkey });
                console.log('idw created');

                const provider = idw.get3idProvider();
                //const provider = threeId.getDidProvider();
                console.log('Opening 3Box');
                const box = await ThreeBox.openBox(ethaddress, provider);
                console.log('openBox');
                await box.syncDone;
                console.log('syncDone');

                // const space = await box.openSpace('3Box');
                // console.log('space opened');
                // await space.syncDone;
                // console.log('space synced');

                const fields = ['name', 'website', 'description', 'image', 'emoji'];
                const values = [name, website, bio, avatar, privy];

                const setProfile = await box.public.setMultiple(fields, values);

                //await space.public.set('foo', 'bar')
                //console.log('get', await space.public.get('foo'))
                
            } catch(e) {
                console.log(e);
            }
        }

        promises.push(new Promise((res, rej) => {
            Box3().then(globalData => {

                array.push({info: globalData});
                res({globalData});

            });
        }));

        Promise.all(promises).then((values) => {           
            let info = array[0].info;
            //console.log(info);
            request.toastr.success('Updated your profile!', 'Success!', { positionClass: 'toast-bottom-left' });
            response.redirect('http://'+ip.address()+':3000/profile');
            response.end();
        });
        
	
	} else {
		//response.send('Please enter Username and Password!');
		request.toastr.error('Please ensure you fill out all fields!', 'Error!', { positionClass: 'toast-bottom-left' });
		response.redirect('http://'+ip.address()+':3000/profile');
		response.end();
	}
};