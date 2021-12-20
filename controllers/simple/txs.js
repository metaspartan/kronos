/*
**************************************
**************************************
**************************************
* Kronos Core Mode D Transaction Controller
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
const ETHValidator = require('wallet-address-validator');
const QRCode = require('qrcode');
const unirest = require('unirest');
const ProgressBar = require('progressbar.js');
const cpuu = require('cputilization');
const toastr = require('express-toastr');
const exec = require('child_process').exec;
const shell = require('shelljs');
const denarius = require('denariusjs');
const dbitcoin = require('bitcoinjs-d-lib');
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
const axios = require('axios');
const HDKey = require('hdkey');
const EC = require('elliptic').ec;
const bs58check = require('bs58check');

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

let delectrums = Storage.get('delectrums');
let belectrums = Storage.get('belectrums');

//ElectrumX Hosts for Denarius
const delectrumxhost1 = delectrums[0];
const delectrumxhost2 = delectrums[1];
const delectrumxhost3 = delectrums[2];
const delectrumxhost4 = delectrums[3];

//ElectrumX Hosts for Bitcoin
const btcelectrumhost1 = belectrums[0];
const btcelectrumhost2 = belectrums[1];
const btcelectrumhost3 = belectrums[2];
const btcelectrumhost4 = belectrums[3];

var mnemonic;
let ethnetworktype = 'homestead'; //homestead is mainnet, ropsten for testing, choice for UI selection eventually
let provider = ethers.getDefaultProvider(ethnetworktype, {
    etherscan: 'JMBXKNZRZYDD439WT95P2JYI72827M4HHR',
    // Or if using a project secret:
    infura: {
        projectId: 'f95db0ef78244281a226aad15788b4ae',
        projectSecret: '6a2d027562de4857a1536774d6e65667',
    },
    alchemy: 'W5yjuu3Ade1lsIn3Od8rTqJsYiFJszVY'
});


//Get Send ETH
exports.getethsend = (req, res) => {

    const ip = require('ip');
    const ipaddy = ip.address();
  
    res.locals.lanip = ipaddy;

    var totalethbal = Storage.get('totaleth');
    var totalbal = Storage.get('totalbal');
    var totalusdtbal = Storage.get('totalusdtbal');
    var ethaddress = Storage.get('ethaddy');
    var cloutaddress = Storage.get('cloutaddy');

    res.render('simple/getethsend', {
        totalethbal: totalethbal,
        totalbal: totalbal,
        totalusdtbal: totalusdtbal,
        ethaddress: ethaddress,
        cloutaddress: cloutaddress
    });

};

//Get Send USDT
exports.getusdtsend = (req, res) => {

    const ip = require('ip');
    const ipaddy = ip.address();
  
    res.locals.lanip = ipaddy;

    var totalethbal = Storage.get('totaleth');
    var totalbal = Storage.get('totalbal');
    var totalusdtbal = Storage.get('totalusdtbal');
    var ethaddress = Storage.get('ethaddy');
    var cloutaddress = Storage.get('cloutaddy');

    res.render('simple/getusdtsend', {
        totalethbal: totalethbal,
        totalbal: totalbal,
        totalusdtbal: totalusdtbal,
        ethaddress: ethaddress,
        cloutaddress: cloutaddress
    });

};

//Get Send BUSD
exports.getbusdsend = (req, res) => {

    const ip = require('ip');
    const ipaddy = ip.address();
  
    res.locals.lanip = ipaddy;

    let socket_id0 = [];

    const Web3 = require('web3');
    const web3 = new Web3('https://bsc-dataseed1.binance.org:443'); //bsc

    const busdAddress = "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56";
    const bepAbi = [
        // balanceOf
        {
          "constant":true,
          "inputs":[{"name":"_owner","type":"address"}],
          "name":"balanceOf",
          "outputs":[{"name":"balance","type":"uint256"}],
          "type":"function"
        },
        // decimals
        {
          "constant":true,
          "inputs":[],
          "name":"decimals",
          "outputs":[{"name":"","type":"uint8"}],
          "type":"function"
        }
    ];

    const busdContract = new web3.eth.Contract(bepAbi, busdAddress);

    var totalbsc = Storage.get('totalbsc');
    var totalbusdbal = Storage.get('totalbusdbal');
    var bscaddress = Storage.get('bscaddy');
    var cloutaddress = Storage.get('cloutaddy');

    // Grab BUSD balances in realtime (every 15s)
    res.io.on('connection', function (socket) {
        socket_id0.push(socket.id);
        if (socket_id0[0] === socket.id) {
        res.io.removeAllListeners('connection'); 
        }
        const busdWalletBal = async () => {
            //let busdbalance = await usdtContract.balanceOf(ethwalletp.address);
            let busdbalance = await busdContract.methods.balanceOf(bscaddress).call();
            let busdbalformatted = ethers.utils.formatEther(busdbalance);
            console.log(busdbalformatted);
            Storage.set('totalbusdbal', JSON.parse(busdbalformatted).toString());
            socket.emit("newbusdbal", {busdbal: parseFloat(busdbalformatted)});
        }
        busdWalletBal();
        setInterval(function(){ 
            busdWalletBal();
        }, 15000);
    });

    var totalbusdbal = Storage.get('totalbusdbal');

    res.render('simple/getbusdsend', {
        totalbscbal: totalbsc,
        totalbal: totalbsc,
        totalbusdbal: totalbusdbal,
        cloutaddress: cloutaddress,
        bscaddress: bscaddress
    });

};

//Get Send BSC
exports.getbscsend = (req, res) => {

    const ip = require('ip');
    const ipaddy = ip.address();
  
    res.locals.lanip = ipaddy;

    let socket_id0 = [];

    const Web3 = require('web3');
    const web3 = new Web3('https://bsc-dataseed1.binance.org:443'); //bsc

    var totalbal = Storage.get('totalbal');
    var totalusdtbal = Storage.get('totalusdtbal');
    var bscaddress = Storage.get('bscaddy');
    var cloutaddress = Storage.get('cloutaddy');

    // Grab BSC balances in realtime (every 15s)
    res.io.on('connection', function (socket) {
        socket_id0.push(socket.id);
        if (socket_id0[0] === socket.id) {
        res.io.removeAllListeners('connection'); 
        }
        const bscWalletBal = async () => {
            let bscbalance = await web3.eth.getBalance(bscaddress);
            let bscbalformatted = bscbalance / 1e18; //ethers.utils.formatEther(bscbalance); Total BSC:  10000000000000000 = 0.01
            //console.log('Total BSC: ', bscbalformatted);
            Storage.set('totalbscbal', bscbalformatted);
            socket.emit("newbscbal", {bscbal: bscbalformatted});
        }
        bscWalletBal();
        setInterval(function(){ 
            bscWalletBal();
        }, 15000);
    });

    var totalbscbal = Storage.get('totalbsc');

    res.render('simple/getbscsend', {
        totalbscbal: totalbscbal,
        totalbal: totalbal,
        totalusdtbal: totalusdtbal,
        cloutaddress: cloutaddress,
        bscaddress: bscaddress
    });

};

//Get Send CLOUT
exports.getcloutsend = (req, res) => {

    const ip = require('ip');
    const ipaddy = ip.address();
  
    res.locals.lanip = ipaddy;

    let socket_id0 = [];

    var cloutaddress = Storage.get('cloutaddy');

    // Grab FTM balances in realtime (every 15s)
    res.io.on('connection', function (socket) {
        socket_id0.push(socket.id);
        if (socket_id0[0] === socket.id) {
        res.io.removeAllListeners('connection'); 
        }
        const cloutWalletBal = async () => {
            axios
            .post('https://api.bitclout.com/api/v1/balance', {PublicKeyBase58Check: cloutaddress}, {    
                headers: {
                'Content-Type': 'application/json'
                }
            })
            .then(res => {
                let cloutbal = res.data.ConfirmedBalanceNanos;
                let formattedclout = cloutbal / 1e9; //Clout Nanos are 1e9
                Storage.set('totalcloutbal', formattedclout);
                socket.emit("newcloutbal", {cloutbal: formattedclout});
            })
            .catch(error => {
                console.error(error)
            });
        }
        cloutWalletBal();
        setInterval(function(){ 
            cloutWalletBal();
        }, 15000);
    });

    var totalcloutbal = Storage.get('totalcloutbal');

    res.render('simple/getcloutsend', {
        totalcloutbal: totalcloutbal,
        cloutaddress: cloutaddress
    });

};

//Get Send FTM
exports.getftmsend = (req, res) => {

    const ip = require('ip');
    const ipaddy = ip.address();
  
    res.locals.lanip = ipaddy;

    let socket_id0 = [];

    const Web3 = require('web3');
    const web3 = new Web3('https://rpcapi.fantom.network/'); //ftm

    var totalbal = Storage.get('totalbal');
    var ftmaddress = Storage.get('ftmaddy');
    var cloutaddress = Storage.get('cloutaddy');

    // Grab FTM balances in realtime (every 15s)
    res.io.on('connection', function (socket) {
        socket_id0.push(socket.id);
        if (socket_id0[0] === socket.id) {
        res.io.removeAllListeners('connection'); 
        }
        const ftmWalletBal = async () => {
            let ftmbalance = await web3.eth.getBalance(ftmaddress);
            let ftmbalformatted = ftmbalance / 1e18; //ethers.utils.formatEther(bscbalance); Total FTM
            Storage.set('totalftmbal', ftmbalformatted);
            socket.emit("newftmbal", {ftmbal: ftmbalformatted});
        }
        ftmWalletBal();
        setInterval(function(){ 
            ftmWalletBal();
        }, 15000);
    });

    var totalftmbal = Storage.get('totalftm');

    res.render('simple/getftmsend', {
        totalftmbal: totalftmbal,
        totalbal: totalbal,
        cloutaddress: cloutaddress,
        ftmaddress: ftmaddress
    });

};

//Get UTXOs to be able to send from and render UI
exports.getsend = (req, res) => {

    const ip = require('ip');
    const ipaddy = ip.address();
  
    res.locals.lanip = ipaddy;

    let totalethbal = Storage.get('totaleth');
    let totalbal = Storage.get('totalbal');
    let totalusdtbal = Storage.get('totalusdtbal');
    //let utxos = Storage.get('dutxo');
    var ethaddress = Storage.get('ethaddy');
    var cloutaddress = Storage.get('cloutaddy');
    var mainaddress = Storage.get('mainaddress');
    var p2pkaddress = Storage.get('p2pkaddress');
    //res.locals.utxos = utxos;

    //Convert P2PKH Address to Scripthash for ElectrumX Balance Fetching
    const bytes = bs58.decode(mainaddress);
    const byteshex = bytes.toString('hex');
    const remove00 = byteshex.substring(2);
    const removechecksum = remove00.substring(0, remove00.length-8);
    const HASH160 = "76A914" + removechecksum.toUpperCase() + "88AC";
    const BUFFHASH160 = Buffer.from(HASH160, "hex");
    const shaaddress = sha256(BUFFHASH160);

    //Convert P2PK Address to Scripthash for ElectrumX Balance Fetching
    const xpubtopub = p2pkaddress;
    const HASH1601 =  "21" + xpubtopub + "ac"; // 21 + COMPRESSED PUBKEY + OP_CHECKSIG = P2PK
    //console.log(HASH1601);
    const BUFFHASH1601 = Buffer.from(HASH1601, "hex");
    const shaaddress1 = sha256(BUFFHASH1601);

    const changeEndianness = (string) => {
            const result = [];
            let len = string.length - 2;
            while (len >= 0) {
            result.push(string.substr(len, 2));
            len -= 2;
            }
            return result.join('');
    }

    const scripthash = changeEndianness(shaaddress);
    const scripthashp2pk = changeEndianness(shaaddress1);

    //Grab UTXO Transaction History from D ElectrumX
    const utxohistory = async () => {
        // Initialize an electrum cluster where 1 out of 2 out of the 4 needs to be consistent, polled randomly with fail-over.
        const electrum = new ElectrumCluster('Kronos Core Mode UTXO History', '1.4', 1, 2);
        
        // Add some servers to the cluster.
        electrum.addServer(delectrumxhost1);
        electrum.addServer(delectrumxhost2);
        electrum.addServer(delectrumxhost3);
        electrum.addServer(delectrumxhost4);
        try {
        // Wait for enough connections to be available.
        await electrum.ready();
        
        // Request the balance of the requested Scripthash D address
        const getuhistory1 = await electrum.request('blockchain.scripthash.listunspent', scripthash);

        const getuhistory2 = await electrum.request('blockchain.scripthash.listunspent', scripthashp2pk);

        const utxos = getuhistory1.concat(getuhistory2);

        await electrum.shutdown();

        //Storage.set('dutxo', utxos);

        return utxos;

        } catch (e) {
            console.log('UTXO Error', e);
        }
    }

    let promises = [];
    let sendarray = [];
    promises.push(new Promise((res, rej) => {
        utxohistory().then(UTXOHistory => {
            sendarray.push({utxos: UTXOHistory});
            res({UTXOHistory});
        });
    }));

    res.render('simple/loading', (err, html) => {
        res.write(html + '\n');
        Promise.all(promises).then((values) => {
            var utxos = sendarray[0].utxos;
            Storage.set('dutxo', utxos);

            var numutxo = utxos.length;
            var utxocount = Number(numutxo);
        
            var totalVal = 0;
            for(i=0; i<numutxo; i++) {  
                totalVal += utxos[i].value;
            }
        
            res.render('simple/getsend', {
                utxos: utxos,
                utxocount: utxocount,
                totalsendable: totalVal,
                totalethbal: totalethbal,
                totalbal: totalbal,
                totalusdtbal: totalusdtbal,
                ethaddress: ethaddress,
                cloutaddress: cloutaddress,
                mainaddress: mainaddress
            }, (err, html) => {
                res.end(html + '\n');
            });
        });
    });
};

//Get BTC UTXOs to be able to send from and render UI
exports.getbtcsend = (req, res) => {

    const ip = require('ip');
    const ipaddy = ip.address();
  
    res.locals.lanip = ipaddy;

    let totalethbal = Storage.get('totaleth');
    let totalbal = Storage.get('totalbal');
    let totalbtcbal = Storage.get('totalbtcbal');
    let totalusdtbal = Storage.get('totalusdtbal');
    //let utxos = Storage.get('dutxo');
    var ethaddress = Storage.get('ethaddy');
    var cloutaddress = Storage.get('cloutaddy');
    var mainaddress = Storage.get('mainaddress');
    var p2pkaddress = Storage.get('p2pkaddress');
    var btcaddress = Storage.get('btcsegwitaddy');
    var btcp2pkaddress = Storage.get('btcsegwitaddy');
    //res.locals.utxos = utxos;

    //Convert P2SH Address to Scripthash for ElectrumX Balance Fetching
    const bytes = bs58.decode(btcaddress);
    const byteshex = bytes.toString('hex');
    const remove00 = byteshex.substring(2);
    const removechecksum = remove00.substring(0, remove00.length-8);
    const HASH160 = "A914" + removechecksum.toUpperCase() + "87"; //OP_HASH160 | | OP_EQUAL
    const BUFFHASH160 = Buffer.from(HASH160, "hex");
    const shaaddress = sha256(BUFFHASH160);

    //Convert P2PK Address to Scripthash for ElectrumX Balance Fetching
    const xpubtopub = btcp2pkaddress;
    const HASH1601 =  "21" + xpubtopub + "ac"; // 21 + COMPRESSED PUBKEY + OP_CHECKSIG = P2PK
    //console.log(HASH1601);
    const BUFFHASH1601 = Buffer.from(HASH1601, "hex");
    const shaaddress1 = sha256(BUFFHASH1601);

    const changeEndianness = (string) => {
            const result = [];
            let len = string.length - 2;
            while (len >= 0) {
            result.push(string.substr(len, 2));
            len -= 2;
            }
            return result.join('');
    }

    const scripthash = changeEndianness(shaaddress);
    const scripthashp2pk = changeEndianness(shaaddress1);

    //Grab UTXO Transaction History from D ElectrumX
    const utxohistory = async () => {
        // Initialize an electrum cluster where 1 out of 2 out of the 4 needs to be consistent, polled randomly with fail-over.
        const electrum = new ElectrumCluster('Kronos Core Mode BTC UTXO History', '1.4', 1, 2);
        
        // Add some servers to the cluster.
        electrum.addServer(btcelectrumhost1);
        electrum.addServer(btcelectrumhost2);
        electrum.addServer(btcelectrumhost3);
        electrum.addServer(btcelectrumhost4);
        try {
        // Wait for enough connections to be available.
        await electrum.ready();
        
        // Request the balance of the requested Scripthash D address
        const getuhistory1 = await electrum.request('blockchain.scripthash.listunspent', scripthash);

        const getuhistory2 = await electrum.request('blockchain.scripthash.listunspent', scripthashp2pk);

        const utxos = getuhistory1.concat(getuhistory2);

        await electrum.shutdown();

        Storage.set('btcutxo', utxos);

        return utxos;

        } catch (e) {
            console.log('UTXO Error', e);
        }
    }

    let promises = [];
    let sendarray = [];
    promises.push(new Promise((res, rej) => {
        utxohistory().then(UTXOHistory => {
            sendarray.push({utxos: UTXOHistory});
            res({UTXOHistory});
        });
    }));

    res.render('simple/loading', (err, html) => {
        res.write(html + '\n');
        Promise.all(promises).then((values) => {
            var utxos = sendarray[0].utxos;

            var numutxo = utxos.length;
            var utxocount = Number(numutxo);
        
            var totalVal = 0;
            for(i=0; i<numutxo; i++) {  
                totalVal += utxos[i].value;
            }
        
            res.render('simple/sendbtc', {
                utxos: utxos,
                utxocount: utxocount,
                totalsendable: totalVal,
                totalethbal: totalethbal,
                totalbal: totalbal,
                totalbtcbal: totalbtcbal,
                totalusdtbal: totalusdtbal,
                ethaddress: ethaddress,
                cloutaddress: cloutaddress,
                mainaddress: btcaddress
            }, (err, html) => {
                res.end(html + '\n');
            });
        });
    });
};


//Get Kronos Chat
exports.getchat = (req, res) => {

    const ip = require('ip');
    const ipaddy = ip.address();
  
    res.locals.lanip = ipaddy;

    var totalethbal = Storage.get('totaleth');
    var totalbal = Storage.get('totalbal');
    var totalusdtbal = Storage.get('totalusdtbal');
    var ethaddress = Storage.get('ethaddy');
    var cloutaddress = Storage.get('cloutaddy');
    var mainaddress = Storage.get('mainaddress');
    var btcaddress = Storage.get('btcsegwitaddy');

    res.render('simple/chat', {
        totalethbal: totalethbal,
        totalbal: totalbal,
        totalusdtbal: totalusdtbal,
        ethaddress: ethaddress,
        cloutaddress: cloutaddress,
        mainaddress: mainaddress,
        btcaddress: btcaddress
    });

};

//POST API for D send
exports.postapisend = (req, res) => {

    let totalethbal = Storage.get('totaleth');
    let totalbal = Storage.get('totalbal');
    let totalusdtbal = Storage.get('totalusdtbal');
    //let utxos = Storage.get('dutxo');
    var ethaddress = Storage.get('ethaddy');
    var mainaddress = Storage.get('mainaddress');
    var p2pkaddress = Storage.get('p2pkaddress');
    var cloutaddress = Storage.get('cloutaddy');
    //res.locals.utxos = utxos;

    //Convert P2PKH Address to Scripthash for ElectrumX Balance Fetching
    const bytes = bs58.decode(mainaddress);
    const byteshex = bytes.toString('hex');
    const remove00 = byteshex.substring(2);
    const removechecksum = remove00.substring(0, remove00.length-8);
    const HASH160 = "76A914" + removechecksum.toUpperCase() + "88AC";
    const BUFFHASH160 = Buffer.from(HASH160, "hex");
    const shaaddress = sha256(BUFFHASH160);

    //Convert P2PK Address to Scripthash for ElectrumX Balance Fetching
    const xpubtopub = p2pkaddress;
    const HASH1601 =  "21" + xpubtopub + "ac"; // 21 + COMPRESSED PUBKEY + OP_CHECKSIG = P2PK
    //console.log(HASH1601);
    const BUFFHASH1601 = Buffer.from(HASH1601, "hex");
    const shaaddress1 = sha256(BUFFHASH1601);

    const changeEndianness = (string) => {
            const result = [];
            let len = string.length - 2;
            while (len >= 0) {
            result.push(string.substr(len, 2));
            len -= 2;
            }
            return result.join('');
    }

    const scripthash = changeEndianness(shaaddress);
    const scripthashp2pk = changeEndianness(shaaddress1);

    //Grab UTXO Transaction History from D ElectrumX
    const utxohistory = async () => {
        // Initialize an electrum cluster where 1 out of 2 out of the 4 needs to be consistent, polled randomly with fail-over.
        const electrum = new ElectrumCluster('Kronos Core Mode UTXO History', '1.4', 1, 2);
        
        // Add some servers to the cluster.
        electrum.addServer(delectrumxhost1);
        electrum.addServer(delectrumxhost2);
        electrum.addServer(delectrumxhost3);
        electrum.addServer(delectrumxhost4);
        try {
        // Wait for enough connections to be available.
        await electrum.ready();
        
        // Request the balance of the requested Scripthash D address
        const getuhistory1 = await electrum.request('blockchain.scripthash.listunspent', scripthash);

        const getuhistory2 = await electrum.request('blockchain.scripthash.listunspent', scripthashp2pk);

        const utxos = getuhistory1.concat(getuhistory2);

        await electrum.shutdown();

        //Storage.set('dutxo', utxos);

        return utxos;

        } catch (e) {
            console.log('UTXO Error', e);
        }
    }

    let promises = [];
    let sendarray = [];
    promises.push(new Promise((res, rej) => {
        utxohistory().then(UTXOHistory => {
            sendarray.push({utxos: UTXOHistory});
            res({UTXOHistory});
        });
    }));

    // res.render('simple/loading', (err, html) => {
        // res.write(html + '\n');
        Promise.all(promises).then((values) => {
            var utxos = sendarray[0].utxos;
            //Storage.set('dutxo', utxos);

            var numutxo = utxos.length;
            var utxocount = Number(numutxo);
        
            // var totalVal = 0;
            // for(i=0; i<numutxo; i++) {  
            //     totalVal += utxos[i].value;
            // }
        
            // res.render('simple/getsend', {
            //     utxos: utxos,
            //     utxocount: utxocount,
            //     totalsendable: totalVal,
            //     totalethbal: totalethbal,
            //     totalbal: totalbal,
            //     totalusdtbal: totalusdtbal,
            //     ethaddress: ethaddress,
            //     mainaddress: mainaddress
            // }, (err, html) => {
                // res.end(html + '\n');
            // });

            var fee = 0.00003; // 0.00003 Default Fee for Denarius API Send
            var sendtoaddress = req.body.sendtoaddress;
            var amount = req.body.amount;
        
            //Get our UTXO data from storage
            //let utxos = utxos;
            // var numutxo = utxos.length;
            console.log('UTXO Count: ', numutxo);
        
            var convertedamount = parseInt(amount * 1e8); //3
        
            var totaluVal = 0;
            for(i=0; i<numutxo; i++) {  
                totaluVal += utxos[i].value;
                //txb.addInput(utxos[i].tx_hash, parseInt(utxos[i].tx_pos));
            }
            //calc fee and add output address
            var thefees = numutxo * parseInt(fee * 1e8); //10000;
            var amountTo = totaluVal - thefees; // 100 D total inputs - 30 D converted amount - 70 D to be sent back to change address
            var changeTotal = amountTo - convertedamount; // 70 D
        
            if (changeTotal < 0 || changeTotal == 0) {
                changeTotal = '';
                // req.toastr.error('Withdrawal change amount cannot be a negative amount, you must send some D to your change address!', 'Balance Error!', { positionClass: 'toast-bottom-left' });
                // return res.redirect('/createtx');
                return res.send('Withdrawal change amount cannot be a negative amount, you must send some D to your address!');
            }
        
            var valid = WAValidator.validate(`${sendtoaddress}`, 'DNR');
        
            if (parseFloat(amount) - fee > amountTo) {
                // req.toastr.error('Withdrawal amount + network fees exceeds your D balance!', 'Balance Error!', { positionClass: 'toast-bottom-left' });
                // return res.redirect('/createtx');
                return res.send('Withdrawal amount + network fees exceeds your D balance!');
        
            } else {
        
            if (valid) {
        
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
        
                console.log(convertedamount);
                console.log(sendtoaddress);
        
                // Initialize a private key using WIF
        
                //Get our password and seed to get a privkey
                var passsworddb = Storage.get('password');
                var seedphrasedb = Storage.get('seed');
        
                var decryptedpass = decrypt(passsworddb);
                ps = decryptedpass;
        
                var decryptedmnemonic = decrypt(seedphrasedb);
                mnemonic = decryptedmnemonic;
        
                //Convert our mnemonic seed phrase to BIP39 Seed Buffer 
                const seed = bip39.mnemonicToSeedSync(mnemonic); //No pass to keep Coniomi styled seed
                
                // BIP32 From BIP39 Seed
                const root = bip32.fromSeed(seed);
        
                // Get XPUB from BIP32
                const xpub = root.neutered().toBase58();
        
                const addresscount = 4; // 3 Addresses Generated
        
                //Get 1 Address from the derived mnemonic
                const addressPath0 = `m/44'/116'/0'/0/0`;
        
                // Get the keypair from the address derivation path
                const addressKeypair0 = root.derivePath(addressPath0);
        
                const privkey = addressKeypair0.toWIF();
        
                // Get the p2pkh base58 public address of the keypair
                const p2pkhaddy0 = denarius.payments.p2pkh({ pubkey: addressKeypair0.publicKey, network }).address;
        
                var key = dbitcoin.ECPair.fromWIF(privkey);
        
                //CREATE A RAW TRANSACTION AND SIGN IT FOR DENARIUS! THIS IS DENARIUS!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                var txb = new dbitcoin.TransactionBuilder(dbitcoin.networks.denarius);
        
                var totalVal = 0;
                for(i=0; i<numutxo; i++) {  
                    totalVal += utxos[i].value;
                    txb.addInput(utxos[i].tx_hash, parseInt(utxos[i].tx_pos));
                }
                //calc fee and add output address
                var denariifees = numutxo * parseInt(fee * 1e8); //10000;
                var amountToSend = totalVal - denariifees; // 100 D total inputs - 30 D converted amount - 70 D to be sent back to change address
                var changeAmnt = amountToSend - convertedamount; // 70 D
        
                //Add Raw TX Outputs (One for the actual TX and one for the change address of remaining funds) 15000 need to take amount * 100000000
                txb.addOutput(sendtoaddress, convertedamount, dbitcoin.networks.denarius);
                txb.addOutput(p2pkhaddy0, changeAmnt, dbitcoin.networks.denarius);
        
                //Sign each of our privkey utxo inputs
                for(i=0; i<numutxo; i++){  
                    txb.sign(dbitcoin.networks.denarius, i, key);
                }
        
                // Print transaction serialized as hex
                console.log('D Raw Transaction Built and Broadcast: ' + txb.build().toHex());
        
                // => 020000000110fd2be85bba0e8a7a694158fa27819f898def003d2f63b668d9d19084b76820000000006b48304502210097897de69a0bd7a30c50a4b343b7471d1c9cd56aee613cf5abf52d62db1acf6202203866a719620273a4e550c30068fb297133bceee82c58f5f4501b55e6164292b30121022f0c09e8f639ae355c462d7a641897bd9022ae39b28e6ec621cea0a4bf35d66cffffffff0140420f000000000001d600000000
                
                let promises = [];
                let broadcastarray = [];
        
                const broadcastTX = async () => {
                    // Initialize an electrum cluster where 1 out of 2 out of the 4 needs to be consistent, polled randomly with fail-over.
                    const electrum = new ElectrumCluster('Kronos Core Mode Transaction', '1.4', 1, 2);
                    
                    // Add some servers to the cluster.
                    electrum.addServer(delectrumxhost1);
                    electrum.addServer(delectrumxhost2);
                    electrum.addServer(delectrumxhost3);
                    electrum.addServer(delectrumxhost4);
                    
                    // Wait for enough connections to be available.
                    await electrum.ready();
                    
                    // Request the balance of the requested Scripthash D address
        
                    const broadcast = await electrum.request('blockchain.transaction.broadcast', txb.build().toHex());
                    
                    //console.log(broadcast);
        
                    //await electrum.disconnect();
                    await electrum.shutdown();
        
                    return broadcast;
                };
        
                //var broadcasted = broadcastTX();
        
                promises.push(new Promise((res, rej) => {
                    broadcastTX().then(broadcastedTX => {
                        broadcastarray.push({tx: broadcastedTX});
                        res({broadcastedTX});
                    });
                }));
                    
                Promise.all(promises).then((values) => {
                    var broadcasted = broadcastarray[0].tx;
                    console.log(broadcastarray[0].tx);
        
                    if (!broadcasted.message) {
                        // req.toastr.success(`Your ${amount} D was sent successfully! TXID: ${broadcasted}`, 'Success!', { positionClass: 'toast-bottom-left' });
                        // req.flash('success', { msg: `Your <strong>${amount} D</strong> was sent successfully! TXID: <a href='https://chainz.cryptoid.info/d/tx.dws?${broadcasted}' target='_blank'>${broadcasted}</a>` });
                        // return res.redirect('/createtx');
                        return res.send('Your Denarius (D) was sent successfully! TXID: '+broadcasted);
                    } else {
                        // req.toastr.error(`Error sending D! Broadcast Error: ${broadcasted.message}`, 'Error!', { positionClass: 'toast-bottom-left' });
                        // //req.flash('errors', { msg: `Error sending D! Broadcast - Error: Something went wrong, please go to your dashboard and refresh.` });
                        // return res.redirect('/createtx');
                        return res.send('Error Sending D! Broadcasting Error: '+broadcasted.message);
                    }
        
                });        
        
            } else {
                // req.toastr.error('You entered an invalid Denarius (D) Address!', 'Invalid Address!', { positionClass: 'toast-bottom-left' });
                // //req.flash('errors', { msg: 'You entered an invalid Denarius (D) Address!' });
                // return res.redirect('/createtx');
                return res.send('You entered an invalid Denarius (D) Address!');
            }
          }
         });
    // });
};

//POST the UTXO selected and create and sign raw transaction for sending
exports.postcreate = (req, res) => {
    var selectedutxo = req.body.UTXO;
    var fee = req.body.fee; //0.00001 Default
    var sendtoaddress = req.body.sendaddress;
    var amount = req.body.amount;

    var sortedsplit = selectedutxo.split(',');

    //Selected UTXO to create transaction from
    var sutxo = sortedsplit[0];
    var sindex = sortedsplit[1];
    var samnt = sortedsplit[2];

    //Converted Available Amount from UTXO
    var csamnt = samnt / 100000000; // / 1e8 10
    var convertedamount = parseInt(amount * 1e8); //6
    var outp = csamnt - amount - fee;
    var outputamount = parseInt(outp * 1e8); // 0.6669 - 0.0001 = 0.6668 - 0.6669 = -0.0001

    console.log(outputamount);

    if (outputamount < 0 || outputamount == 0) {
        outputamount = '';
        req.toastr.error('Withdrawal change amount cannot be a negative amount, you must send some D to your change address!', 'Balance Error!', { positionClass: 'toast-bottom-left' });
        return res.redirect('/createtx');
    }

    var valid = WAValidator.validate(`${sendtoaddress}`, 'DNR');

    if (parseFloat(amount) - fee > csamnt) {
        req.toastr.error('Withdrawal amount + network fees exceeds your select D balance for the selected UTXO!', 'Balance Error!', { positionClass: 'toast-bottom-left' });
        return res.redirect('/createtx');

    } else {

    if (valid) {

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

        console.log(convertedamount);
        console.log(sutxo);
        console.log(sendtoaddress);

        // Initialize a private key using WIF

        //Get our password and seed to get a privkey
        var passsworddb = Storage.get('password');
        var seedphrasedb = Storage.get('seed');

        var decryptedpass = decrypt(passsworddb);
        ps = decryptedpass;

        var decryptedmnemonic = decrypt(seedphrasedb);
        mnemonic = decryptedmnemonic;

        //Convert our mnemonic seed phrase to BIP39 Seed Buffer 
        const seed = bip39.mnemonicToSeedSync(mnemonic); //No pass to keep Coniomi styled seed
        
        // BIP32 From BIP39 Seed
        const root = bip32.fromSeed(seed);

        // Get XPUB from BIP32
        const xpub = root.neutered().toBase58();

        const addresscount = 4; // 3 Addresses Generated

        //Get 1 Address from the derived mnemonic
        const addressPath0 = `m/44'/116'/0'/0/0`;

        // Get the keypair from the address derivation path
        const addressKeypair0 = root.derivePath(addressPath0);

        const privkey = addressKeypair0.toWIF();

        // Get the p2pkh base58 public address of the keypair
        const p2pkhaddy0 = denarius.payments.p2pkh({ pubkey: addressKeypair0.publicKey, network }).address;

        var key2 = dbitcoin.ECPair.fromWIF(privkey);

        //CREATE A RAW TRANSACTION AND SIGN IT FOR DENARIUS!
        var txb = new dbitcoin.TransactionBuilder(dbitcoin.networks.denarius);

        txb.addInput(sutxo, parseInt(sindex));

        //Add Raw TX Outputs (One for the actual TX and one for the change address of remaining funds) 15000 need to take amount * 100000000
        txb.addOutput(sendtoaddress, convertedamount, dbitcoin.networks.denarius);
        txb.addOutput(p2pkhaddy0, outputamount, dbitcoin.networks.denarius);

        //SIGN THE TRANSACTION
        // Sign the first input with the new key
        txb.sign(dbitcoin.networks.denarius, 0, key2);

        // Print transaction serialized as hex
        console.log('D Raw Transaction Built and Broadcast: ' + txb.build().toHex());

        // => 020000000110fd2be85bba0e8a7a694158fa27819f898def003d2f63b668d9d19084b76820000000006b48304502210097897de69a0bd7a30c50a4b343b7471d1c9cd56aee613cf5abf52d62db1acf6202203866a719620273a4e550c30068fb297133bceee82c58f5f4501b55e6164292b30121022f0c09e8f639ae355c462d7a641897bd9022ae39b28e6ec621cea0a4bf35d66cffffffff0140420f000000000001d600000000
        
        let promises = [];
        let broadcastarray = [];

        const broadcastTX = async () => {
            // Initialize an electrum cluster where 1 out of 2 out of the 4 needs to be consistent, polled randomly with fail-over.
            const electrum = new ElectrumCluster('Kronos Core Mode Transaction', '1.4', 1, 2);
            
            // Add some servers to the cluster.
            electrum.addServer(delectrumxhost1);
            electrum.addServer(delectrumxhost2);
            electrum.addServer(delectrumxhost3);
            electrum.addServer(delectrumxhost4);
            
            // Wait for enough connections to be available.
            await electrum.ready();
            
            // Request the balance of the requested Scripthash D address

            const broadcast = await electrum.request('blockchain.transaction.broadcast', txb.build().toHex());
            
            //console.log(broadcast);

            //await electrum.disconnect();
            await electrum.shutdown();

            return broadcast;
        };

        //var broadcasted = broadcastTX();

        promises.push(new Promise((res, rej) => {
            broadcastTX().then(broadcastedTX => {
                broadcastarray.push({tx: broadcastedTX});
                res({broadcastedTX});
            });
        }));
            
        Promise.all(promises).then((values) => {
            var broadcasted = broadcastarray[0].tx;
            console.log(broadcastarray[0].tx);

            if (!broadcasted.message) {
                req.toastr.success(`Your ${amount} D was sent successfully! TXID: ${broadcasted}`, 'Success!', { positionClass: 'toast-bottom-left' });
                req.flash('success', { msg: `Your <strong>${amount} D</strong> was sent successfully! TXID: <a href='https://chainz.cryptoid.info/d/tx.dws?${broadcasted}' target='_blank'>${broadcasted}</a>` });
                return res.redirect('/createtx');
            } else {
                req.toastr.error(`Error sending D! Broadcast Error: ${broadcasted.message}`, 'Error!', { positionClass: 'toast-bottom-left' });
                //req.flash('errors', { msg: `Error sending D! Broadcast - Error: Something went wrong, please go to your dashboard and refresh.` });
                return res.redirect('/createtx');
            }

        });

        // req.toastr.success(`D was sent successfully! ${broadcasted}`, 'Success!', { positionClass: 'toast-bottom-left' });
        // req.flash('success', { msg: `Your <strong>D</strong> was sent successfully! Please wait 10 confirms for it show up! TXID: ${broadcasted}` });
        // return res.redirect('/createtx');


    } else {
        req.toastr.error('You entered an invalid Denarius (D) Address!', 'Invalid Address!', { positionClass: 'toast-bottom-left' });
        //req.flash('errors', { msg: 'You entered an invalid Denarius (D) Address!' });
        return res.redirect('/createtx');
    }
  }
};

//POST the UTXO inputs automatically and create and sign a raw Denarius transaction for sending
exports.postauto = (req, res) => {
    var fee = 0.00001; // 0.00001 Default Fee
    var sendtoaddress = req.body.sendaddressauto;
    var amount = req.body.amountauto;

    //Get our UTXO data from storage
    let utxos = Storage.get('dutxo');
    var numutxo = utxos.length;
    console.log('UTXO Count: ', numutxo);

    var convertedamount = parseInt(amount * 1e8); //3

    var totaluVal = 0;
    for(i=0; i<numutxo; i++) {  
        totaluVal += utxos[i].value;
        //txb.addInput(utxos[i].tx_hash, parseInt(utxos[i].tx_pos));
    }
    //calc fee and add output address
    var thefees = numutxo * parseInt(fee * 1e8); //10000;
    var amountTo = totaluVal - thefees; // 100 D total inputs - 30 D converted amount - 70 D to be sent back to change address
    var changeTotal = amountTo - convertedamount; // 70 D

    if (changeTotal < 0 || changeTotal == 0) {
        changeTotal = '';
        req.toastr.error('Withdrawal change amount cannot be a negative amount, you must send some D to your change address!', 'Balance Error!', { positionClass: 'toast-bottom-left' });
        return res.redirect('/createtx');
    }

    var valid = WAValidator.validate(`${sendtoaddress}`, 'DNR');

    if (parseFloat(amount) - fee > amountTo) {
        req.toastr.error('Withdrawal amount + network fees exceeds your D balance!', 'Balance Error!', { positionClass: 'toast-bottom-left' });
        return res.redirect('/createtx');

    } else {

    if (valid) {

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

        console.log(convertedamount);
        console.log(sendtoaddress);

        // Initialize a private key using WIF

        //Get our password and seed to get a privkey
        var passsworddb = Storage.get('password');
        var seedphrasedb = Storage.get('seed');

        var decryptedpass = decrypt(passsworddb);
        ps = decryptedpass;

        var decryptedmnemonic = decrypt(seedphrasedb);
        mnemonic = decryptedmnemonic;

        //Convert our mnemonic seed phrase to BIP39 Seed Buffer 
        const seed = bip39.mnemonicToSeedSync(mnemonic); //No pass to keep Coniomi styled seed
        
        // BIP32 From BIP39 Seed
        const root = bip32.fromSeed(seed);

        // Get XPUB from BIP32
        const xpub = root.neutered().toBase58();

        const addresscount = 4; // 3 Addresses Generated

        //Get 1 Address from the derived mnemonic
        const addressPath0 = `m/44'/116'/0'/0/0`;

        // Get the keypair from the address derivation path
        const addressKeypair0 = root.derivePath(addressPath0);

        const privkey = addressKeypair0.toWIF();

        // Get the p2pkh base58 public address of the keypair
        const p2pkhaddy0 = denarius.payments.p2pkh({ pubkey: addressKeypair0.publicKey, network }).address;

        var key = dbitcoin.ECPair.fromWIF(privkey);

        //CREATE A RAW TRANSACTION AND SIGN IT FOR DENARIUS! THIS IS DENARIUS!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        var txb = new dbitcoin.TransactionBuilder(dbitcoin.networks.denarius);

        var totalVal = 0;
        for(i=0; i<numutxo; i++) {  
            totalVal += utxos[i].value;
            txb.addInput(utxos[i].tx_hash, parseInt(utxos[i].tx_pos));
        }
        //calc fee and add output address
        var denariifees = numutxo * parseInt(fee * 1e8); //10000;
        var amountToSend = totalVal - denariifees; // 100 D total inputs - 30 D converted amount - 70 D to be sent back to change address
        var changeAmnt = amountToSend - convertedamount; // 70 D

        //Add Raw TX Outputs (One for the actual TX and one for the change address of remaining funds) 15000 need to take amount * 100000000
        txb.addOutput(sendtoaddress, convertedamount, dbitcoin.networks.denarius);
        txb.addOutput(p2pkhaddy0, changeAmnt, dbitcoin.networks.denarius);

        //Sign each of our privkey utxo inputs
        for(i=0; i<numutxo; i++){  
            txb.sign(dbitcoin.networks.denarius, i, key);
        }

        // Print transaction serialized as hex
        console.log('D Raw Transaction Built and Broadcast: ' + txb.build().toHex());

        // => 020000000110fd2be85bba0e8a7a694158fa27819f898def003d2f63b668d9d19084b76820000000006b48304502210097897de69a0bd7a30c50a4b343b7471d1c9cd56aee613cf5abf52d62db1acf6202203866a719620273a4e550c30068fb297133bceee82c58f5f4501b55e6164292b30121022f0c09e8f639ae355c462d7a641897bd9022ae39b28e6ec621cea0a4bf35d66cffffffff0140420f000000000001d600000000
        
        let promises = [];
        let broadcastarray = [];

        const broadcastTX = async () => {
            // Initialize an electrum cluster where 1 out of 2 out of the 4 needs to be consistent, polled randomly with fail-over.
            const electrum = new ElectrumCluster('Kronos Core Mode Transaction', '1.4', 1, 2);
            
            // Add some servers to the cluster.
            electrum.addServer(delectrumxhost1);
            electrum.addServer(delectrumxhost2);
            electrum.addServer(delectrumxhost3);
            electrum.addServer(delectrumxhost4);
            
            // Wait for enough connections to be available.
            await electrum.ready();
            
            // Request the balance of the requested Scripthash D address

            const broadcast = await electrum.request('blockchain.transaction.broadcast', txb.build().toHex());
            
            //console.log(broadcast);

            //await electrum.disconnect();
            await electrum.shutdown();

            return broadcast;
        };

        //var broadcasted = broadcastTX();

        promises.push(new Promise((res, rej) => {
            broadcastTX().then(broadcastedTX => {
                broadcastarray.push({tx: broadcastedTX});
                res({broadcastedTX});
            });
        }));
            
        Promise.all(promises).then((values) => {
            var broadcasted = broadcastarray[0].tx;
            console.log(broadcastarray[0].tx);

            if (!broadcasted.message) {
                req.toastr.success(`Your ${amount} D was sent successfully! TXID: ${broadcasted}`, 'Success!', { positionClass: 'toast-bottom-left' });
                req.flash('success', { msg: `Your <strong>${amount} D</strong> was sent successfully! TXID: <a href='https://chainz.cryptoid.info/d/tx.dws?${broadcasted}' target='_blank'>${broadcasted}</a>` });
                return res.redirect('/createtx');
            } else {
                req.toastr.error(`Error sending D! Broadcast Error: ${broadcasted.message}`, 'Error!', { positionClass: 'toast-bottom-left' });
                //req.flash('errors', { msg: `Error sending D! Broadcast - Error: Something went wrong, please go to your dashboard and refresh.` });
                return res.redirect('/createtx');
            }

        });

        // req.toastr.success(`D was sent successfully! ${broadcasted}`, 'Success!', { positionClass: 'toast-bottom-left' });
        // req.flash('success', { msg: `Your <strong>D</strong> was sent successfully! Please wait 10 confirms for it show up! TXID: ${broadcasted}` });
        // return res.redirect('/createtx');


    } else {
        req.toastr.error('You entered an invalid Denarius (D) Address!', 'Invalid Address!', { positionClass: 'toast-bottom-left' });
        //req.flash('errors', { msg: 'You entered an invalid Denarius (D) Address!' });
        return res.redirect('/createtx');
    }
  }
};

//POST the BTC UTXO selected and create and sign raw transaction for sending
exports.postbtcsend = (req, res) => {
    var selectedutxo = req.body.UTXO;
    var fee = req.body.fee;
    var sendtoaddress = req.body.sendaddress;
    var amount = req.body.amount;

    var sortedsplit = selectedutxo.split(',');

    //Selected UTXO to create transaction from
    var sutxo = sortedsplit[0];
    var sindex = sortedsplit[1];
    var samnt = sortedsplit[2];

    //Converted Available Amount from UTXO
    var csamnt = samnt / 100000000; // / 1e8 10
    var convertedamount = parseInt(amount * 1e8); //6
    var outp = csamnt - amount - fee;
    var outputamount = parseInt(outp * 1e8); // 0.6669 - 0.0001 = 0.6668 - 0.6669 = -0.0001

    console.log(outputamount);

    if (outputamount < 0 || outputamount == 0) {
        outputamount = '';
        req.toastr.error('Withdrawal change amount cannot be a negative amount, you must send some BTC to your change address!', 'Balance Error!', { positionClass: 'toast-bottom-left' });
        return res.redirect('/sendbtc');
    }

    var valid = ETHValidator.validate(`${sendtoaddress}`, 'BTC');

    if (parseFloat(amount) - fee > csamnt) {
        req.toastr.error('Withdrawal amount + network fees exceeds your select BTC balance for the selected UTXO!', 'Balance Error!', { positionClass: 'toast-bottom-left' });
        return res.redirect('/sendbtc');

    } else {

    if (valid) {

        // Bitcoin Network Params Object
        const bitcoinnetwork = {
            messagePrefix: '\x18Bitcoin Signed Message:\n',
            bech32: 'bc',
            bip32: {
                public: 0x0488b21e,
                private: 0x0488ade4
            },
            pubKeyHash: 0x00,
            scriptHash: 0x05,
            wif: 0x80
        };

        console.log(convertedamount);
        console.log(sutxo);
        console.log(sendtoaddress);

        // Initialize a private key using WIF

        //Get our password and seed to get a privkey
        var passsworddb = Storage.get('password');
        var seedphrasedb = Storage.get('seed');

        var decryptedpass = decrypt(passsworddb);
        ps = decryptedpass;

        var decryptedmnemonic = decrypt(seedphrasedb);
        mnemonic = decryptedmnemonic;

        //Convert our mnemonic seed phrase to BIP39 Seed Buffer 
        const seed = bip39.mnemonicToSeedSync(mnemonic); //No pass to keep Coniomi styled seed
        
        // BIP32 From BIP39 Seed
        const root = bip32b.fromSeed(seed);

        // Get XPUB from BIP32
        const xpub = root.neutered().toBase58();

        const addresscount = 4; // 3 Addresses Generated

        //Get 1 Segwit Address from the derived mnemonic
        const addressPath0 = `m/49'/0'/0'/0/0`;

        // Get the keypair from the address derivation path
        const addressKeypair0 = root.derivePath(addressPath0);

        const privkey = addressKeypair0.toWIF();

        // Get the p2sh base58 public address of the keypair
        const btcaddy = bitcoinjs.payments.p2sh({ redeem: bitcoinjs.payments.p2wpkh({ pubkey: addressKeypair0.publicKey, network: bitcoinnetwork }), }).address; //Segwit P2SH 3

        //const ecpair = bitcoinjs.ECPair.fromPublicKey(node.publicKey, { network: NETWORK });
        const p2wpkhredeem = bitcoinjs.payments.p2wpkh({ pubkey: addressKeypair0.publicKey, network: bitcoinnetwork });

        //var key2 = dbitcoin.ECPair.fromWIF(privkey);

        //CREATE A RAW TRANSACTION AND SIGN IT FOR BITCOIN!

        const key = bitcoinjs.ECPair.fromWIF(privkey);

        const psbt = new bitcoinjs.Psbt();

        const bytes = bs58.decode(btcaddy);
        const byteshex = bytes.toString('hex');
        const remove00 = byteshex.substring(2);
        const removechecksum = remove00.substring(0, remove00.length-8);
        const HASH160 = "A914" + removechecksum.toUpperCase() + "87"; //OP_HASH160 | | OP_EQUAL

        psbt.addInput({hash: sutxo, index: parseInt(sindex),
      
            // non-segwit inputs now require passing the whole previous tx as Buffer
            // nonWitnessUtxo: Buffer.from(
            //   '0200000001f9f34e95b9d5c8abcd20fc5bd4a825d1517be62f0f775e5f36da944d9' +
            //     '452e550000000006b483045022100c86e9a111afc90f64b4904bd609e9eaed80d48' +
            //     'ca17c162b1aca0a788ac3526f002207bb79b60d4fc6526329bf18a77135dc566020' +
            //     '9e761da46e1c2f1152ec013215801210211755115eabf846720f5cb18f248666fec' +
            //     '631e5e1e66009ce3710ceea5b1ad13ffffffff01' +
            //     // value in satoshis (Int64LE) = 0x015f90 = 90000
            //     '905f010000000000' +
            //     // scriptPubkey length
            //     '19' +
            //     // scriptPubkey
            //     '76a9148bbc95d2709c71607c60ee3f097c1217482f518d88ac' +
            //     // locktime
            //     '00000000',
            //   'hex',
            // ),
      
            // // If this input was segwit, instead of nonWitnessUtxo, you would add
            // // a witnessUtxo as follows. The scriptPubkey and the value only are needed.
            witnessUtxo: {
              script: Buffer.from(HASH160,'hex'), value: parseInt(samnt),
            },

            redeemScript: p2wpkhredeem.output
      
            // Not featured here:
            //   redeemScript. A Buffer of the redeemScript for P2SH
            //   witnessScript. A Buffer of the witnessScript for P2WSH
          });
        psbt.addOutput({address: sendtoaddress, value: convertedamount,  });
        psbt.addOutput({address: btcaddy, value: outputamount,  });
        psbt.signInput(0, key);
        psbt.validateSignaturesOfInput(0);
        psbt.finalizeAllInputs();

        // Print transaction serialized as hex
        console.log('BTC Raw Transaction Built and Broadcast: ' + psbt.extractTransaction().toHex());

        // => 020000000110fd2be85bba0e8a7a694158fa27819f898def003d2f63b668d9d19084b76820000000006b48304502210097897de69a0bd7a30c50a4b343b7471d1c9cd56aee613cf5abf52d62db1acf6202203866a719620273a4e550c30068fb297133bceee82c58f5f4501b55e6164292b30121022f0c09e8f639ae355c462d7a641897bd9022ae39b28e6ec621cea0a4bf35d66cffffffff0140420f000000000001d600000000
        
        let promises = [];
        let broadcastarray = [];

        const broadcastTX = async () => {
            // Initialize an electrum cluster where 1 out of 2 out of the 4 needs to be consistent, polled randomly with fail-over.
            const electrum = new ElectrumCluster('Kronos Core Mode Transaction', '1.4', 1, 2);
            
            // Add some servers to the cluster.
            electrum.addServer(btcelectrumhost1);
            electrum.addServer(btcelectrumhost2);
            electrum.addServer(btcelectrumhost3);
            electrum.addServer(btcelectrumhost4);
            
            // Wait for enough connections to be available.
            await electrum.ready();

            const broadcast = await electrum.request('blockchain.transaction.broadcast', psbt.extractTransaction().toHex());
            
            //console.log(broadcast);

            //await electrum.disconnect();
            await electrum.shutdown();

            return broadcast;
        };

        //var broadcasted = broadcastTX();

        promises.push(new Promise((res, rej) => {
            broadcastTX().then(broadcastedTX => {
                broadcastarray.push({tx: broadcastedTX});
                res({broadcastedTX});
            });
        }));
            
        Promise.all(promises).then((values) => {
            var broadcasted = broadcastarray[0].tx;
            console.log(broadcastarray[0].tx);

            if (!broadcasted.message) {
                req.toastr.success(`Your ${amount} BTC was sent successfully! TXID: ${broadcasted}`, 'Success!', { positionClass: 'toast-bottom-left' });
                req.flash('success', { msg: `Your <strong>${amount} BTC</strong> was sent successfully! TXID: <a href='https://chainz.cryptoid.info/btc/tx.dws?${broadcasted}' target='_blank'>${broadcasted}</a>` });
                return res.redirect('/sendbtc');
            } else {
                req.toastr.error(`Error sending BTC! Broadcast Error: ${broadcasted.message}`, 'Error!', { positionClass: 'toast-bottom-left' });
                //req.flash('errors', { msg: `Error sending D! Broadcast - Error: Something went wrong, please go to your dashboard and refresh.` });
                return res.redirect('/sendbtc');
            }

        });

        // req.toastr.success(`D was sent successfully! ${broadcasted}`, 'Success!', { positionClass: 'toast-bottom-left' });
        // req.flash('success', { msg: `Your <strong>D</strong> was sent successfully! Please wait 10 confirms for it show up! TXID: ${broadcasted}` });
        // return res.redirect('/createtx');


    } else {
        req.toastr.error('You entered an invalid Bitcoin (BTC) Address!', 'Invalid Address!', { positionClass: 'toast-bottom-left' });
        //req.flash('errors', { msg: 'You entered an invalid Denarius (D) Address!' });
        return res.redirect('/sendbtc');
    }
  }
};

//POST the BTC UTXO inputs automatically and create and sign a raw Bitcoin transaction for sending
exports.postbtcauto = (req, res) => {
    var fee = 0.00001;
    var sendtoaddress = req.body.sendaddressauto;
    var amount = req.body.amountauto;

    //Get our UTXO data from storage
    let utxos = Storage.get('btcutxo');
    var numutxo = utxos.length;
    console.log('UTXO Count: ', numutxo);

    var convertedamount = parseInt(amount * 1e8); //3

    var totaluVal = 0;
    for(i=0; i<numutxo; i++) {  
        totaluVal += utxos[i].value;
        //txb.addInput(utxos[i].tx_hash, parseInt(utxos[i].tx_pos));
    }
    //calc fee and add output address
    var thefees = numutxo * parseInt(fee * 1e8); //10000;
    var amountTo = totaluVal - thefees; // 100 D total inputs - 30 D converted amount - 70 D to be sent back to change address
    var changeTotal = amountTo - convertedamount; // 70 D

    if (changeTotal < 0 || changeTotal == 0) {
        changeTotal = '';
        req.toastr.error('Withdrawal change amount cannot be a negative amount, you must send some BTC to your change address!', 'Balance Error!', { positionClass: 'toast-bottom-left' });
        return res.redirect('/sendbtc');
    }

    var valid = ETHValidator.validate(`${sendtoaddress}`, 'BTC');

    if (parseFloat(amount) - fee > amountTo) {
        req.toastr.error('Withdrawal amount + network fees exceeds your BTC balance!', 'Balance Error!', { positionClass: 'toast-bottom-left' });
        return res.redirect('/sendbtc');

    } else {

    if (valid) {

        // Bitcoin Network Params Object
        const bitcoinnetwork = {
            messagePrefix: '\x18Bitcoin Signed Message:\n',
            bech32: 'bc',
            bip32: {
                public: 0x0488b21e,
                private: 0x0488ade4
            },
            pubKeyHash: 0x00,
            scriptHash: 0x05,
            wif: 0x80
        };

        console.log(convertedamount);
        console.log(sendtoaddress);

        // Initialize a private key using WIF

        //Get our password and seed to get a privkey
        var passsworddb = Storage.get('password');
        var seedphrasedb = Storage.get('seed');

        var decryptedpass = decrypt(passsworddb);
        ps = decryptedpass;

        var decryptedmnemonic = decrypt(seedphrasedb);
        mnemonic = decryptedmnemonic;

        //Convert our mnemonic seed phrase to BIP39 Seed Buffer 
        const seed = bip39.mnemonicToSeedSync(mnemonic); //No pass to keep Coniomi styled seed
        
        // BIP32 From BIP39 Seed
        const root = bip32b.fromSeed(seed);

        // Get XPUB from BIP32
        const xpub = root.neutered().toBase58();

        const addresscount = 4; // 3 Addresses Generated

        //Get 1 Segwit Address from the derived mnemonic
        const addressPath0 = `m/49'/0'/0'/0/0`;

        // Get the keypair from the address derivation path
        const addressKeypair0 = root.derivePath(addressPath0);

        const privkey = addressKeypair0.toWIF();

        // Get the p2sh base58 public address of the keypair
        const btcaddy = bitcoinjs.payments.p2sh({ redeem: bitcoinjs.payments.p2wpkh({ pubkey: addressKeypair0.publicKey, network: bitcoinnetwork }), }).address; //Segwit P2SH 3

        //const ecpair = bitcoinjs.ECPair.fromPublicKey(node.publicKey, { network: NETWORK });
        const p2wpkhredeem = bitcoinjs.payments.p2wpkh({ pubkey: addressKeypair0.publicKey, network: bitcoinnetwork });

        //var key2 = dbitcoin.ECPair.fromWIF(privkey);

        //CREATE A RAW TRANSACTION AND SIGN IT FOR BITCOIN!

        const key = bitcoinjs.ECPair.fromWIF(privkey);

        const psbt = new bitcoinjs.Psbt();

        const bytes = bs58.decode(btcaddy);
        const byteshex = bytes.toString('hex');
        const remove00 = byteshex.substring(2);
        const removechecksum = remove00.substring(0, remove00.length-8);
        const HASH160 = "A914" + removechecksum.toUpperCase() + "87"; //OP_HASH160 | | OP_EQUAL

        var totalVal = 0;
        for(i=0; i<numutxo; i++) {  
            totalVal += utxos[i].value;
            psbt.addInput({hash: utxos[i].tx_hash, index: parseInt(utxos[i].tx_pos),       
                // // If this input was segwit, instead of nonWitnessUtxo, you would add
                // // a witnessUtxo as follows. The scriptPubkey and the value only are needed.
                witnessUtxo: {
                    script: Buffer.from(HASH160,'hex'), value: parseInt(utxos[i].value),
                },
    
                redeemScript: p2wpkhredeem.output
            
                // Not featured here:
                //   redeemScript. A Buffer of the redeemScript for P2SH
                //   witnessScript. A Buffer of the witnessScript for P2WSH
                });
        }
        //calc fee and add output address
        var btcfees = numutxo * parseInt(fee * 1e8); //10000;
        var amountToSend = totalVal - btcfees; // 100 BTC total inputs - 30 BTC converted amount - 70 BTC to be sent back to change address
        var changeAmnt = amountToSend - convertedamount; // 70 BTC

        psbt.addOutput({address: sendtoaddress, value: convertedamount,  });
        psbt.addOutput({address: btcaddy, value: changeAmnt,  });

        //Sign each of our privkey utxo inputs
        for(i=0; i<numutxo; i++){  
            psbt.signInput(i, key);
            psbt.validateSignaturesOfInput(i);
        }
        //psbt.validateSignaturesOfInput(0);
        psbt.finalizeAllInputs();

        // Print transaction serialized as hex
        console.log('BTC Raw Transaction Built and Broadcast: ' + psbt.extractTransaction().toHex());

        // => 020000000110fd2be85bba0e8a7a694158fa27819f898def003d2f63b668d9d19084b76820000000006b48304502210097897de69a0bd7a30c50a4b343b7471d1c9cd56aee613cf5abf52d62db1acf6202203866a719620273a4e550c30068fb297133bceee82c58f5f4501b55e6164292b30121022f0c09e8f639ae355c462d7a641897bd9022ae39b28e6ec621cea0a4bf35d66cffffffff0140420f000000000001d600000000
        
        let promises = [];
        let broadcastarray = [];

        const broadcastTX = async () => {
            // Initialize an electrum cluster where 1 out of 2 out of the 4 needs to be consistent, polled randomly with fail-over.
            const electrum = new ElectrumCluster('Kronos Core Mode BTC Transaction', '1.4', 1, 2);
            
            // Add some servers to the cluster.
            electrum.addServer(btcelectrumhost1);
            electrum.addServer(btcelectrumhost2);
            electrum.addServer(btcelectrumhost3);
            electrum.addServer(btcelectrumhost4);
            
            // Wait for enough connections to be available.
            await electrum.ready();

            const broadcast = await electrum.request('blockchain.transaction.broadcast', psbt.extractTransaction().toHex());
            
            //console.log(broadcast);

            //await electrum.disconnect();
            await electrum.shutdown();

            return broadcast;
        };

        //var broadcasted = broadcastTX();

        promises.push(new Promise((res, rej) => {
            broadcastTX().then(broadcastedTX => {
                broadcastarray.push({tx: broadcastedTX});
                res({broadcastedTX});
            });
        }));
            
        Promise.all(promises).then((values) => {
            var broadcasted = broadcastarray[0].tx;
            console.log(broadcastarray[0].tx);

            if (!broadcasted.message) {
                req.toastr.success(`Your ${amount} BTC was sent successfully! TXID: ${broadcasted}`, 'Success!', { positionClass: 'toast-bottom-left' });
                req.flash('success', { msg: `Your <strong>${amount} BTC</strong> was sent successfully! TXID: <a href='https://chainz.cryptoid.info/btc/tx.dws?${broadcasted}' target='_blank'>${broadcasted}</a>` });
                return res.redirect('/sendbtc');
            } else {
                req.toastr.error(`Error sending BTC! Broadcast Error: ${broadcasted.message}`, 'Error!', { positionClass: 'toast-bottom-left' });
                //req.flash('errors', { msg: `Error sending D! Broadcast - Error: Something went wrong, please go to your dashboard and refresh.` });
                return res.redirect('/sendbtc');
            }

        });


    } else {
        req.toastr.error('You entered an invalid Bitcoin (BTC) Address!', 'Invalid Address!', { positionClass: 'toast-bottom-left' });
        return res.redirect('/sendbtc');
    }
  }
};

exports.postethsend = (req, res) => {
    var gasfee = req.body.gasfeer; //21000 Gas Limit * 31 Gwei Fee = 0.000651 ETH
    var sendtoaddress = req.body.sendaddress;
    var amount = req.body.amount;
    var totalethbal = Storage.get('totaleth');
    var transferamount = ethers.utils.parseEther(amount);

    var gasandamount = amount + gasfee;

    let totalcalcbale = totalethbal - gasandamount;

    var valid = ETHValidator.validate(`${sendtoaddress}`, 'ETH');
    var ensregex = new RegExp('^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{3}$'); //ENS Name Regex for .eth domains

    var seedphrasedb = Storage.get('seed');
    var decryptedmnemonic = decrypt(seedphrasedb);
    mnemonic = decryptedmnemonic;
    let ethwallet = ethers.Wallet.fromMnemonic(mnemonic); //Generate wallet from our Kronos seed
    let ethwalletp = ethwallet.connect(provider); //Set wallet provider

    console.log(gasfee);

    if (parseFloat(amount) + parseFloat(gasfee) > parseFloat(totalethbal)) {
        req.toastr.error(`Withdrawal amount (`+amount+` ETH) and gas fee (`+gasfee+` ETH) exceeds your ETH balance!`, 'Balance Error!', { positionClass: 'toast-bottom-left' });
        return res.redirect('/sendeth');

    } else {

    if (valid || ensregex.test(sendtoaddress)) {

        var transaction = {
            gasLimit: 21000,
            //from: `${ethwalletp.address}`,
            to: `${sendtoaddress}`,
            // Optional
            //data: "0x",
            value: transferamount,
        };
            
        console.log(transaction);
        
        provider.estimateGas(transaction).then(function (estimate) {
    
            transaction.gasLimit = estimate; //Set Transaction Gas Limit
            console.log('Gas Limit Estimate: ' + estimate);
            
            ethwalletp.sendTransaction(transaction).then(function (hash) {
                //console.log('Sent ETH Success: ' + JSON.stringify(hash));
                req.toastr.success(`${amount} ETH was sent successfully! ${hash.hash}`, 'Success!', { positionClass: 'toast-bottom-left' });
                req.flash('success', { msg: `Your <strong>${amount} ETH</strong> was sent successfully! <a href="https://etherscan.io/tx/${hash.hash}" target="_blank">${hash.hash}</a>` });
                Storage.set('totaleth', totalcalcbale);
                return res.redirect('/sendeth');
            });    
        });

    } else {
        req.toastr.error('You entered an invalid Ethereum (ETH) Address!', 'Invalid Address!', { positionClass: 'toast-bottom-left' });
        //req.flash('errors', { msg: 'You entered an invalid Ethereum (ETH) Address!' });
        return res.redirect('/sendeth');
    }
  }


};


exports.postusdtsend = (req, res) => {
    var gasfee = req.body.gasfeer; //21000 Gas Limit * 31 Gwei Fee = 0.000651 ETH
    var gwei = req.body.gasfeeg;
    var sendtoaddress = req.body.sendaddress;
    var amount = req.body.amount;
    var totalethbal = Storage.get('totaleth');
    var totalusdtbal = Storage.get('totalusdtbal');
    var transferamount = ethers.utils.parseEther(amount);
    const usdtAddress = "0xdAC17F958D2ee523a2206206994597C13D831ec7"; //0xdAC17F958D2ee523a2206206994597C13D831ec7

    var valid = ETHValidator.validate(`${sendtoaddress}`, 'ETH');
    var ensregex = new RegExp('^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{3}$'); //ENS Name Regex for .eth domains

    var seedphrasedb = Storage.get('seed');
    var decryptedmnemonic = decrypt(seedphrasedb);
    mnemonic = decryptedmnemonic;
    let ethwallet = ethers.Wallet.fromMnemonic(mnemonic); //Generate wallet from our Kronos seed
    let ethwalletp = ethwallet.connect(provider); //Set wallet provider

    let totalcalcbal = parseFloat(totalusdtbal) - parseFloat(amount);
    let totalcalcgas = parseFloat(totalethbal) - parseFloat(gasfee);

    if (parseFloat(gasfee) > parseFloat(totalethbal)) {

        req.toastr.error(`Gas fee (`+gasfee+` ETH) exceeds your ETH balance!`, 'Gas Balance Error!', { positionClass: 'toast-bottom-left' });
        return res.redirect('/sendusdt');

    } else if (parseFloat(amount) > parseFloat(totalusdtbal)) {

        req.toastr.error(`Withdrawal amount (`+amount+` USDT) exceeds your USDT balance!`, 'Balance Error!', { positionClass: 'toast-bottom-left' });
        return res.redirect('/sendusdt');

    } else {

    if (valid || ensregex.test(sendtoaddress)) {
        const ercAbi = [
        // Some details about the token
        "function name() view returns (string)",
        "function symbol() view returns (string)",
        "function balanceOf(address) view returns (uint)",
        "function transfer(address to, uint amount)",
        "event Transfer(address indexed from, address indexed to, uint amount)"
        ];

        // The Contract object
        const usdtContract = new ethers.Contract(usdtAddress, ercAbi, ethwalletp);
        
        var options = {
            gasLimit: 60000,
            gasPrice: ethers.utils.parseUnits(gwei, 'gwei')
        };

        let promises = [];
        let txarray = [];

        const usdtTX = async () => {
            let usdttransfer = await usdtContract.transfer(sendtoaddress, transferamount, options);
            return usdttransfer;
        }

        promises.push(new Promise((res, rej) => {
            usdtTX().then(globalData => {
                txarray.push({usdttx: globalData});
                res({globalData});
            });
        }));

        Promise.all(promises).then((values) => {

            console.log(values);
            console.log(txarray);

            req.toastr.success(`${amount} USDT was sent successfully! ${txarray[0].usdttx.hash}`, 'Success!', { positionClass: 'toast-bottom-left' });
            req.flash('success', { msg: `Your <strong>${amount} USDT</strong> was sent successfully! (${gasfee} ETH gas fee) <a href="https://etherscan.io/tx/${txarray[0].usdttx.hash}" target="_blank"><strong>${txarray[0].usdttx.hash}</strong></a>` });
            Storage.set('totalusdtbal', totalcalcbal);
            Storage.set('totaleth', totalcalcgas);
            return res.redirect('/sendusdt'); // ????

        });

    } else {
        req.toastr.error('You entered an invalid Tether USD ERC20 (USDT) Address!', 'Invalid Address!', { positionClass: 'toast-bottom-left' });
        //req.flash('errors', { msg: 'You entered an invalid Ethereum (ETH) Address!' });
        return res.redirect('/sendusdt');
    }
  }


};

exports.postbscsend = (req, res) => {
    var gasfee = req.body.gasfeer; //21000 Gas Limit * 5 Gwei Fee = 0.000651 ETH
    var sendtoaddress = req.body.sendaddress;
    var amount = req.body.amount;
    var totalbscbal = Storage.get('totalbsc');
    var transferamount = ethers.utils.parseEther(amount);

    var gasandamount = amount + gasfee;

    let totalcalcbale = totalbscbal - gasandamount;

    var valid = ETHValidator.validate(`${sendtoaddress}`, 'ETH');
    var ensregex = new RegExp('^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{3}$'); //ENS Name Regex for .eth domains

    var seedphrasedb = Storage.get('seed');
    var decryptedmnemonic = decrypt(seedphrasedb);
    mnemonic = decryptedmnemonic;
    let ethwallet = ethers.Wallet.fromMnemonic(mnemonic); //Generate wallet from our Kronos seed
    let ethwalletp = ethwallet.connect(provider); //Set wallet provider

    const Web3 = require('web3');

    const web3 = new Web3('https://bsc-dataseed1.binance.org:443'); //bsc

    const web3account = web3.eth.accounts.privateKeyToAccount(ethwallet.privateKey);

    // const keystore = "Contents of keystore file";
    // const decryptedAccount = web3.eth.accounts.decrypt(keystore, 'PASSWORD');
    // const rawTransaction = {
    // "from": "Keystore account id",
    // "to": "Account you want to transfer to",
    // "value": web3.utils.toHex(web3.utils.toWei("0.001", "ether")),
    // "gas": 2000,
    // "chainId": 3
    // };
    // decryptedAccount.signTransaction(rawTransaction)
    // .then(signedTx => web3.eth.sendSignedTransaction(signedTx.rawTransaction))
    // .then(receipt => console.log("Transaction receipt: ", receipt))
    // .catch(err => console.error(err));

    console.log(gasfee);

    if (parseFloat(amount) + parseFloat(gasfee) > parseFloat(totalbscbal)) {
        req.toastr.error(`Withdrawal amount (`+amount+` BSC) and gas fee (`+gasfee+` BSC) exceeds your BSC balance!`, 'Balance Error!', { positionClass: 'toast-bottom-left' });
        return res.redirect('/sendbsc');

    } else {

    if (valid || ensregex.test(sendtoaddress)) {

        // var transaction = {
        //     gasLimit: 21000,
        //     //from: `${ethwalletp.address}`,
        //     to: `${sendtoaddress}`,
        //     // Optional
        //     //data: "0x",
        //     value: transferamount,
        // };
            
        // console.log(transaction);

        const gwei = 5;

        var tx = {
            from: ethwallet.address,
            to: `${sendtoaddress}`,
            gasPrice: gwei * 1e9,
            gas: 21000,
            value: transferamount
        }

        console.log(tx);
    
        // web3.eth.sendTransaction({
        //     from: ethwallet.address,
        //     to: sendtoaddress, 
        //     value: web3.toWei(transferamount, "ether"), 
        // }, function(err, transactionHash) {
        //     if (err) { 
        //         console.log(err); 
        //     } else {
        //         console.log(transactionHash);
        //     }
        // });

        web3.eth.accounts.signTransaction(tx, ethwallet.privateKey)
        .catch((e) => console.log(e.message))
        .then((signedTX) => {
            console.log(`Signed BSC TX!`)
            web3.eth.sendSignedTransaction(signedTX.raw || signedTX.rawTransaction)
                .catch((error) => console.log(`[${Math.floor(Date.now() / 1000)}] broadcast tx failed ${error.message}`))
                .then(function (hash) {
                    console.log(hash);
                    req.toastr.success(`${amount} BSC was sent successfully! ${hash.transactionHash}`, 'Success!', { positionClass: 'toast-bottom-left' });
                    req.flash('success', { msg: `Your <strong>${amount} BSC</strong> was sent successfully! <a href="https://bscscan.com/tx/${hash.transactionHash}" target="_blank">${hash.transactionHash}</a>` });
                    //Storage.set('totalbsc', totalcalcbale);
                    return res.redirect('/sendbsc');
                });
        });
        
        // provider.estimateGas(transaction).then(function (estimate) {
    
        //     transaction.gasLimit = estimate; //Set Transaction Gas Limit
        //     console.log('Gas Limit Estimate: ' + estimate);
            
        //     ethwalletp.sendTransaction(transaction).then(function (hash) {
        //         req.toastr.success(`${amount} BSC was sent successfully! ${hash.hash}`, 'Success!', { positionClass: 'toast-bottom-left' });
        //         req.flash('success', { msg: `Your <strong>${amount} BSC</strong> was sent successfully! <a href="https://bscscan.com/tx/${hash.hash}" target="_blank">${hash.hash}</a>` });
        //         Storage.set('totalbsc', totalcalcbale);
        //         return res.redirect('/sendbsc');
        //     });    
        // });

    } else {
        req.toastr.error('You entered an invalid Binance Smart Chain (BSC) Address!', 'Invalid Address!', { positionClass: 'toast-bottom-left' });
        return res.redirect('/sendbsc');
    }
  }
};


exports.postbusdsend = (req, res) => {
    var gasfee = req.body.gasfeer; //21000 Gas Limit * 5 Gwei Fee = 0.000651 BSC
    var gwei = req.body.gasfeeg;
    var sendtoaddress = req.body.sendaddress;
    var amount = req.body.amount;
    var totalbscbal = Storage.get('totalbsc');
    var totalbusdbal = Storage.get('totalbusdbal');
    var transferamount = ethers.utils.parseEther(amount);

    var valid = ETHValidator.validate(`${sendtoaddress}`, 'ETH');
    var ensregex = new RegExp('^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{3}$'); //ENS Name Regex for .eth domains
    const Web3 = require('web3');
    const web3 = new Web3('https://bsc-dataseed1.binance.org:443'); //bsc
    const busdAddress = "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56";
    const bepAbi = [
        // balanceOf
        {
          "constant":true,
          "inputs":[{"name":"_owner","type":"address"}],
          "name":"balanceOf",
          "outputs":[{"name":"balance","type":"uint256"}],
          "type":"function"
        },
        // decimals
        {
          "constant":true,
          "inputs":[],
          "name":"decimals",
          "outputs":[{"name":"","type":"uint8"}],
          "type":"function"
        },
        // transfer
        {
            "constant": false,
            "inputs": [
                {
                    "name": "_to",
                    "type": "address"
                },
                {
                    "name": "_value",
                    "type": "uint256"
                }
            ],
            "name": "transfer",
            "outputs": [
                {
                    "name": "success",
                    "type": "bool"
                }
            ],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        }
    ];

    const busdContract = new web3.eth.Contract(bepAbi, busdAddress);

    var seedphrasedb = Storage.get('seed');
    var decryptedmnemonic = decrypt(seedphrasedb);
    mnemonic = decryptedmnemonic;
    let ethwallet = ethers.Wallet.fromMnemonic(mnemonic); //Generate wallet from our Kronos seed
    let ethwalletp = ethwallet.connect(provider); //Set wallet provider

    let totalcalcbal = parseFloat(totalbusdbal) - parseFloat(amount);
    let totalcalcgas = parseFloat(totalbscbal) - parseFloat(gasfee);

    if (parseFloat(gasfee) > parseFloat(totalbscbal)) {

        req.toastr.error(`Gas fee (`+gasfee+` BSC) exceeds your BSC balance!`, 'Gas Balance Error!', { positionClass: 'toast-bottom-left' });
        return res.redirect('/sendbusd');

    } else if (parseFloat(amount) > parseFloat(totalbusdbal)) {

        req.toastr.error(`Withdrawal amount (`+amount+` BUSD) exceeds your BUSD balance!`, 'Balance Error!', { positionClass: 'toast-bottom-left' });
        return res.redirect('/sendbusd');

    } else {

    if (valid || ensregex.test(sendtoaddress)) {

        const gwei = 5;

        var tx = {
            from: ethwallet.address,
            gasPrice: 5 * 1e9,
            gas: 80000,
            to: busdAddress,
            value: "0x0",
            data: busdContract.methods.transfer(sendtoaddress, transferamount).encodeABI()
        };

        console.log(tx);

        web3.eth.accounts.signTransaction(tx, ethwallet.privateKey)
        .catch((e) => console.log(e.message))
        .then((signedTX) => {
            console.log(`Signed BUSD TX!`)
            web3.eth.sendSignedTransaction(signedTX.raw || signedTX.rawTransaction)
                .catch((error) => console.log(`[${Math.floor(Date.now() / 1000)}] broadcast tx failed ${error.message}`))
                .then(function (hash) {
                    console.log(hash);
                    req.toastr.success(`${amount} BUSD was sent successfully! ${hash.transactionHash}`, 'Success!', { positionClass: 'toast-bottom-left' });
                    req.flash('success', { msg: `Your <strong>${amount} BUSD</strong> was sent successfully! <a href="https://bscscan.com/tx/${hash.transactionHash}" target="_blank">${hash.transactionHash}</a>` });
                    //Storage.set('totalbsc', totalcalcbale);
                    //Storage.set('totalbusdbal', totalcalcbal);
                    Storage.set('totalbsc', totalcalcgas);
                    return res.redirect('/sendbusd');
                });
        });

    } else {
        req.toastr.error('You entered an invalid Binance USD BEP20 (BUSD) Address!', 'Invalid Address!', { positionClass: 'toast-bottom-left' });
        return res.redirect('/sendbusd');
    }
  }


};

exports.postftmsend = (req, res) => {
    var gasfee = req.body.gasfeer; //21000 Gas Limit * 1 Gwei Fee = 0.0000021 FTM
    var sendtoaddress = req.body.sendaddress;
    var amount = req.body.amount;
    var totalftmbal = Storage.get('totalftm');
    var transferamount = ethers.utils.parseEther(amount);

    var gasandamount = amount + gasfee;

    let totalcalcbale = totalftmbal - gasandamount;

    var valid = ETHValidator.validate(`${sendtoaddress}`, 'ETH');
    var ensregex = new RegExp('^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{3}$'); //ENS Name Regex for .eth domains

    var seedphrasedb = Storage.get('seed');
    var decryptedmnemonic = decrypt(seedphrasedb);
    mnemonic = decryptedmnemonic;
    let ethwallet = ethers.Wallet.fromMnemonic(mnemonic); //Generate wallet from our Kronos seed
    let ethwalletp = ethwallet.connect(provider); //Set wallet provider

    const Web3 = require('web3');
    const web3 = new Web3('https://rpcapi.fantom.network/'); //ftm

    console.log(gasfee);

    if (parseFloat(amount) + parseFloat(gasfee) > parseFloat(totalftmbal)) {
        req.toastr.error(`Withdrawal amount (`+amount+` FTM) and gas fee (`+gasfee+` FTM) exceeds your FTM balance!`, 'Balance Error!', { positionClass: 'toast-bottom-left' });
        return res.redirect('/sendftm');

    } else {

    if (valid || ensregex.test(sendtoaddress)) {

        // var transaction = {
        //     gasLimit: 21000,
        //     //from: `${ethwalletp.address}`,
        //     to: `${sendtoaddress}`,
        //     // Optional
        //     //data: "0x",
        //     value: transferamount,
        // };
            
        // console.log(transaction);

        const gwei = 1;

        var tx = {
            from: ethwallet.address,
            to: `${sendtoaddress}`,
            gasPrice: gwei * 1e9,
            gas: 21000,
            value: transferamount
        }

        console.log(tx);

        web3.eth.accounts.signTransaction(tx, ethwallet.privateKey)
        .catch((e) => console.log(e.message))
        .then((signedTX) => {
            console.log(`Signed FTM TX!`)
            web3.eth.sendSignedTransaction(signedTX.raw || signedTX.rawTransaction)
                .catch((error) => console.log(`[${Math.floor(Date.now() / 1000)}] broadcast tx failed ${error.message}`))
                .then(function (hash) {
                    console.log(hash);
                    req.toastr.success(`${amount} FTM was sent successfully! ${hash.transactionHash}`, 'Success!', { positionClass: 'toast-bottom-left' });
                    req.flash('success', { msg: `Your <strong>${amount} FTM</strong> was sent successfully! <a href="https://ftmscan.com/tx/${hash.transactionHash}" target="_blank">${hash.transactionHash}</a>` });
                    return res.redirect('/sendftm');
                });
        });

    } else {
        req.toastr.error('You entered an invalid Fantom Opera (FTM) Address!', 'Invalid Address!', { positionClass: 'toast-bottom-left' });
        return res.redirect('/sendftm');
    }
  }
};

exports.postcloutsend = (request, response) => {
    var sendtoaddress = request.body.sendaddress;
    var amount = request.body.amount;
    var totalcloutbal = Storage.get('totalcloutbal');
    var transferamount = amount * 1e9; // Nanos are 1e9

    var formatclout = totalcloutbal * 1e9; // Nanos are 1e9

    // This needs work
    // var valid = CLOUTValidator.validate(`${sendtoaddress}`, 'CLOUT');

    var seedphrasedb = Storage.get('seed');
    var decryptedmnemonic = decrypt(seedphrasedb);
    mnemonic = decryptedmnemonic;

    //Convert our mnemonic seed phrase to BIP39 Seed Buffer 
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

    if (transferamount >= formatclout) {
        request.toastr.error(`CLOUT Transfer Failed: The CLOUT to send is greater than the amount in your balance`, 'CLOUT Transfer Failed!', { positionClass: 'toast-bottom-left' });
        request.flash('error', { msg: `CLOUT Transfer Failed: The CLOUT to send is greater than the amount in your balance` });
        return response.redirect('/sendclout');
    } else {

        // POST the transaction data, get a transaction hex and then sign the transaction locally
        // By @metaspartan for @kronoswallet
        axios
            .post('https://api.bitclout.com/api/v0/send-bitclout', 
            {
                SenderPublicKeyBase58Check: cloutpub,
                RecipientPublicKeyOrUsername: sendtoaddress,
                AmountNanos: parseInt(transferamount),
                MinFeeRateNanosPerKB: 1000
            }, {    
                headers: {
                'Content-Type': 'application/json'
                }
            })
            .then(resy => {
                let txhex = resy.data.TransactionHex;
                
                console.log('RAW TRANSACTION HEX ', txhex);

                const seedHex = cloutkeychain.privateKey.toString('hex');
                const ecs = new EC('secp256k1');
                const privateKey = ecs.keyFromPrivate(seedHex);
            
                const transactionBytes = new Buffer.from(txhex, 'hex');
                const transactionHash = new Buffer.from(sha256.x2(transactionBytes), 'hex');
                const signature = privateKey.sign(transactionHash);
                const signatureBytes = new Buffer.from(signature.toDER());
                const signatureLength = uvarint64ToBuf(signatureBytes.length);
            
                const signedTransactionBytes = Buffer.concat([
                    transactionBytes.slice(0, -1),
                    signatureLength,
                    signatureBytes,
                ]);
            
                let finaltxhex = signedTransactionBytes.toString('hex');

                console.log('SiGNED TX', finaltxhex);              

                // POST the Update TX
            axios
                .post('https://api.bitclout.com/api/v0/submit-transaction', 
                {
                    TransactionHex: finaltxhex
                }, {    
                    headers: {
                    'Content-Type': 'application/json'
                    }
                })
                .then(ress => {
                    let hash = ress.data.TxnHashHex;

                    console.log('SENT THE TX! ', hash);
                    
                    request.toastr.success(`${amount} CLOUT was sent successfully! ${hash}`, 'Success!', { positionClass: 'toast-bottom-left' });
                    request.flash('success', { msg: `Your <strong>${amount} CLOUT</strong> was sent successfully! <a href="https://bitcloutseek.com/tx/${hash}" target="_blank">${hash}</a>` });
                    return response.redirect('/sendclout');
                    
                })
                .catch(error => {
                    console.log('Broadcast Error', error);
                    if (error.response) {
                        if (error.response.status === 400 && error.response.data != 'undefined') {
                            console.log(error.response.data.error);
                            request.toastr.error('Signed TX Broadcast Error: '+error.response.data.error+'', 'Error!', { positionClass: 'toast-bottom-left' });
                            return response.redirect('/sendclout');
                        }
                    }
                });

            })
            .catch(error => {
                console.log('Broadcast Error', error);
                if (error.response) {
                    if (error.response.status === 400 && error.response.data != 'undefined') {
                        console.log(error.response.data.error);
                        request.toastr.error('TX Creation Error: '+error.response.data.error+'', 'Error!', { positionClass: 'toast-bottom-left' });
                        return response.redirect('/sendclout');
                    }
                }
            });
    }
};


exports.getSimpleSeed = (req, res) => {
    const ip = require('ip');
    const ipaddy = ip.address();
  
    res.locals.lanip = ipaddy;
  
    req.session.loggedin2 = false;
  
    var totalbal = Storage.get('totalbal');
    var totalethbal = Storage.get('totaleth');
    var totalusdtbal = Storage.get('totalusdtbal');
    var seedphrasedb = Storage.get('seed');
  
    var mnemonic;
    var ps;
    let seedaddresses = [];
    let btcaddresses = [];
    let store = [];
  
    db.get('password', function(err, value) {
      if (err) {
  
      } else {
        var decryptedpass = decrypt(value);
        ps = decryptedpass;
      }
  
      // Fetch the Kronos LevelDB
      db.get('seedphrase', function (err, value) {
        if (err) {
  
        } else {
          var decryptedmnemonic = decrypt(value);
          mnemonic = decryptedmnemonic;
        }

        // ETH
        let ethwallet = ethers.Wallet.fromMnemonic(mnemonic); //Generate wallet from our Kronos seed
        let ethwalletp = ethwallet.connect(provider); //Set wallet provider
  
        //Convert our mnemonic seed phrase to BIP39 Seed Buffer 
        const seed = bip39.mnemonicToSeedSync(mnemonic);

        // Generate BitClout Pubkey and Privkey from BIP39 Seed
        // By MetaSpartan @metaspartan and @kronoswallet
        const cloutkeychain = HDKey.fromMasterSeed(seed).derive('m/44\'/0\'/0\'/0/0', false);
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
        
        // BIP32 From BIP39 Seed
        const root = bip32.fromSeed(seed);

        const rootbtc = bip32b.fromSeed(seed);
  
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

        // Bitcoin Network Params Object
        const bitcoinnetwork = {
            messagePrefix: '\x18Bitcoin Signed Message:\n',
            bech32: 'bc',
            bip32: {
                public: 0x0488b21e,
                private: 0x0488ade4
            },
            pubKeyHash: 0x00,
            scriptHash: 0x05,
            wif: 0x80
        };
  
        // A for loop for how many addresses we want from the derivation path of the seed phrase
        for (let i = 0; i < 4; i++) { //1 (21 = 20 addresses)
  
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

        // A for loop for how many addresses we want from the derivation path of the seed phrase
        for (let i = 0; i < 4; i++) { //1 (21 = 20 addresses)

            //Get 10 Addresses from the derived mnemonic
            const btcaddressPath = `m/49'/0'/0'/0/${i}`;
    
            // Get the keypair from the address derivation path
            const btcaddressKeypair = rootbtc.derivePath(btcaddressPath);
    
            // Get the p2pkh base58 public address of the keypair
            const btcp2pkhaddy = bitcoinjs.payments.p2sh({ redeem: bitcoinjs.payments.p2wpkh({ pubkey: btcaddressKeypair.publicKey, bitcoinnetwork }), }).address;
    
            const btcprivatekey = btcaddressKeypair.toWIF();
            
            //New Array called seedaddresses that is filled with address and path data currently, WIP and TODO
            btcaddresses.push({ address: btcp2pkhaddy, privkey: btcprivatekey, path: btcaddressPath });
        }
  
        store.push({mnemonic: mnemonic, seedaddresses: seedaddresses, btcaddresses: btcaddresses});
  
        res.locals.seedphrase = store;
        let ethprivkey = ethwallet.privateKey;
        let ethaddress = ethwalletp.address;
    
      res.render('simple/getseed', {
          title: 'Kronos Seed Phrase',
          totalbal: totalbal,
          totalethbal: totalethbal,
          totalusdtbal: totalusdtbal,
          ethaddress: ethaddress,
          cloutaddress: cloutpub,
          ethprivkey: ethprivkey,
          cloutpub: cloutpub,
          cloutpriv: cloutpriv,
          seedphrase: store
      });
    });
  });
  };