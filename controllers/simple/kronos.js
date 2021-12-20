/*
**************************************
**************************************
**************************************
* Kronos Core Mode Controller
* Copyright (c) 2022 MetaSpartan
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
const axios = require('axios');
const HDKey = require('hdkey');
const EC = require('elliptic').ec;
const bs58check = require('bs58check');
const isPortReachable = require('is-port-reachable');

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
	
    let KEY = process.env.KEY;

    function shahash(key) {
        key = CryptoJS.SHA256(key, KEY);
        return key.toString();
    }

    function encrypt(data) {
        data = CryptoJS.AES.encrypt(data, KEY);
        data = data.toString();
        return data;
    }

    function decrypt(data) {
        data = CryptoJS.AES.decrypt(data, KEY);
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

    let delectrum = Storage.get('delectrums');
    let belectrum = Storage.get('belectrums');

    var online0 = false;
    var online1 = false;
    var online2 = false;
    var online3 = false;
    var online4 = false;
    var online5 = false;
    var online6 = false;
    var online7 = false;

    var dx0 = isPortReachable(50002, {host: delectrum[0]});
    var dx1 = isPortReachable(50002, {host: delectrum[1]});
    var dx2 = isPortReachable(50002, {host: delectrum[2]});
    var dx3 = isPortReachable(50002, {host: delectrum[3]});

    var bx0 = isPortReachable(50002, {host: belectrum[0]});
    var bx1 = isPortReachable(50002, {host: belectrum[1]});
    var bx2 = isPortReachable(50002, {host: belectrum[2]});
    var bx3 = isPortReachable(50002, {host: belectrum[3]});

    Promise.all([dx0, dx1, dx2, dx3, bx0, bx1, bx2, bx3]).then(function(results) {
        if (results[0] === true) {
            online0 = true;
        }
        if (results[1] === true) {
            online1 = true;
        }
        if (results[2] === true) {
            online2 = true;
        }
        if (results[3] === true) {
            online3 = true;
        }
        if (results[4] === true) {
            online4 = true;
        }
        if (results[5] === true) {
            online5 = true;
        }
        if (results[6] === true) {
            online6 = true;
        }
        if (results[7] === true) {
            online7 = true;
        }

        var donlinearray = [online0, online1, online2, online3];
        var bonlinearray = [online4, online5, online6, online7];

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
            userexists: userexists,
            delectrum: delectrum,
            belectrum: belectrum,
            donlinearray: donlinearray,
            bonlinearray: bonlinearray
        });

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
        .then(response => {
            let username = response.data.Profile.Username;
            let description = response.data.Profile.Description;
            let FR = response.data.Profile.CoinEntry.CreatorBasisPoints / 100;
            
            Storage.set('cloutuser', username);
            Storage.set('cloutdesc', description);
            Storage.set('FR', FR);

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
        })
        .catch(error => {
            console.error(error);
            let username = '';
            let description = '';
            let FR = 10000 / 100;

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
        });
};

// POST the Decentralized Profiles to BitClout (CLOUT)
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

    const seedc = bip39.mnemonicToSeedSync(mnemonic); //No pass included to keep Coinomi styled seed

    // Generate BitClout Pubkey and Privkey from BIP39 Seed
    // By MetaSpartan @metaspartan and @kronoswallet
    const cloutkeychain = HDKey.fromMasterSeed(seedc).derive('m/44\'/0\'/0\'/0/0', false);
    const cloutseedhex = cloutkeychain.privateKey.toString('hex');

    const ecc = new EC('secp256k1');
    const eckeyfrompriv = ecc.keyFromPrivate(cloutseedhex);
    const prefixc = [0xcd, 0x14, 0x0]; // BC for Clout Pub
    const keyc = eckeyfrompriv.getPublic().encode('array', true);
    const prefixAndKey = Uint8Array.from([...prefixc, ...keyc]);
    const cloutpub = bs58check.encode(prefixAndKey);

    const prefixp = [0x35, 0x0, 0x0]; // bc for Clout Priv
    const keyp = cloutkeychain.privateKey;
    const pAndKey = Uint8Array.from([...prefixp, ...keyp]);
    const cloutpriv = bs58check.encode(pAndKey);

    function uvarint64ToBuf(uint) {
        var result = [];
        while (uint >= 0x80) {
            result.push((uint & 0xFF) | 0x80);
            uint >>>= 7;
        }
        result.push(uint | 0);
        return new Buffer.from(result);
    };
	
	if (avatar) {
        if (name && bio && founder) {          
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

                const seedHex = cloutkeychain.privateKey.toString('hex');
                const ec = new EC('secp256k1');
                const privateKey = ec.keyFromPrivate(seedHex);
            
                const transactionBytes = new Buffer.from(txhex, 'hex');
                const transactionHash = new Buffer.from(sha256.x2(transactionBytes), 'hex');
                const signature = privateKey.sign(transactionHash);
                const signatureBytes = new Buffer.from(signature.toDER());
                const signatureLength = uvarint64ToBuf(signatureBytes.length);
            
                const signedTransactionBytes = Buffer.concat([
                    // This slice is bad. We need to remove the existing signature length field prior to appending the new one.
                    // Once we have frontend transaction construction we won't need to do this.
                    transactionBytes.slice(0, -1),
                    signatureLength,
                    signatureBytes,
                ]);
            
                const finaltxhex = signedTransactionBytes.toString('hex');

                // console.log('Signed TX', finaltxhex);              

                // POST the Update TX
                axios
                .post('https://bitclout.com/api/v0/submit-transaction', 
                {
                    TransactionHex: finaltxhex,
                }, {    
                    headers: {
                    'Content-Type': 'application/json'
                    }
                })
                .then(res => {
                    let hash = res.data.TxnHashHex;
                    // console.log(res.data);
                    
                    request.toastr.success('Updated your profile! TX Hash Hex: '+hash+'', 'Success!', { positionClass: 'toast-bottom-left' });                    
                    response.redirect('http://'+ip.address()+':3000/profile');
                    response.end();
                    
                })
                .catch(error => {
                    if (error.response) {
                        if (error.response.status === 400 && error.response.data != 'undefined') {
                            console.log(error.response.data.error);
                            request.toastr.error('Update Signed TX Error: '+error.response.data.error+'', 'Error!', { positionClass: 'toast-bottom-left' });
                            response.redirect('http://'+ip.address()+':3000/profile');
                            response.end();
                        }
                    }
                });

            })
            .catch(error => {
                if (error.response) {
                    if (error.response.status === 400 && error.response.data != 'undefined') {
                        console.log(error.response.data.error);
                        request.toastr.error('Update Error: '+error.response.data.error+'', 'Error!', { positionClass: 'toast-bottom-left' });
                        response.redirect('http://'+ip.address()+':3000/profile');
                        response.end();
                    }
                }
            });        
	
        } else {
            request.toastr.error('Please ensure you fill out all fields!', 'Error!', { positionClass: 'toast-bottom-left' });
            response.redirect('http://'+ip.address()+':3000/profile');
            response.end();
        }
    } else {
        request.toastr.error('Please ensure you select an avatar!', 'Error!', { positionClass: 'toast-bottom-left' });
        response.redirect('http://'+ip.address()+':3000/profile');
        response.end();
    }
};