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
const ThreeBox = require('3box');
const { triggerAsyncId } = require('async_hooks');


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
	
	if (avatar) {
        const Box3 = async() => {
            try {
                //const box = await ThreeBox.create();

                var decryptedmnemonic = decrypt(seedphrasedb);
                mnemonic = decryptedmnemonic;
                const ethwallet = ethers.Wallet.fromMnemonic(mnemonic); //Generate wallet from our Kronos seed
                let ethwalletp = ethwallet.connect(provider); //Set wallet provider

                const IPFS = require('ipfs');
                const OrbitDB = require('orbit-db');

                // For js-ipfs >= 0.38

                // Create IPFS instance
                const initIPFSInstance = async () => {
                    return await IPFS.create({ repo: "./path-for-js-ipfs-repo" }); //WIP
                };

                initIPFSInstance().then(async ipfs => {
                    const orbitdb = await OrbitDB.createInstance(ipfs);

                    // Create / Open a database
                    const db = await orbitdb.log("hello");
                    await db.load();

                    // Listen for updates from peers
                    db.events.on("replicated", address => {
                        console.log(db.iterator({ limit: -1 }).collect());
                    });

                    // Add an entry
                    const hash = await db.add("world");
                    console.log(hash);

                    // Query
                    const result = db.iterator({ limit: -1 }).collect();
                    console.log(JSON.stringify(result, null, 2));
                });


                // For js-ipfs < 0.38

                // // Create IPFS instance
                // const ipfsOptions = {
                //     EXPERIMENTAL: {
                //     pubsub: true
                //     }
                // };

                // ipfs = new IPFS(ipfsOptions);

                // initIPFSInstance().then(ipfs => {
                // ipfs.on("error", e => console.error(e));
                // ipfs.on("ready", async () => {
                //     const orbitdb = await OrbitDB.createInstance(ipfs);

                //     // Create / Open a database
                //     const db = await orbitdb.log("hello");
                //     await db.load();

                //     // Listen for updates from peers
                //     db.events.on("replicated", address => {
                //     console.log(db.iterator({ limit: -1 }).collect());
                //     });

                //     // Add an entry
                //     const hash = await db.add("world");
                //     console.log(hash);

                //     // Query
                //     const result = db.iterator({ limit: -1 }).collect();
                //     console.log(JSON.stringify(result, null, 2));
                // });
                // });

                // const address = ethaddress;
                // const spaces = ['3Box']
                // //await box.auth(spaces, { address, ethwalletp });
                // const box = await ThreeBox.openBox(address, ethwalletp);
                // //OrbitDB?
                // //await box.syncDone;

                // const fields = ['name', 'website', 'description', 'image', 'emoji']
                // const values = [name, website, bio, avatar, privy]

                //const setProfile = await box.public.setMultiple(fields, values);

                //return setProfile;
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