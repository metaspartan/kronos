/*
**************************************
**************************************
**************************************
* Kronos Core Mode Dashboard Controller
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
const { ElectrumClient } = require('electrum-cash');
const { ElectrumCluster } = require('electrum-cash');
const bs58 = require('bs58');
const randomstring = require("randomstring");
const Storage = require('json-storage-fs');
const PromiseLoadingSpinner = require('promise-loading-spinner');
const main = require('progressbar.js');
const ethers = require('ethers');
const { combinedDisposable } = require('custom-electron-titlebar/lib/common/lifecycle');


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

//Get information
exports.simpleindex = (req, res) => {

    const ip = require('ip');
    const ipaddy = ip.address();
    
    res.locals.lanip = ipaddy;
    
    let scripthasharray = [];
    let ethereumarray = [];
    let promises = [];
    let promises2 = [];
  
    //ElectrumX Hosts for Denarius
    const delectrumxhost1 = 'electrumx1.denarius.pro';
    const delectrumxhost2 = 'electrumx2.denarius.pro';
    const delectrumxhost3 = 'electrumx3.denarius.pro';
    const delectrumxhost4 = 'electrumx4.denarius.pro';

    //ElectrumX Hosts for Bitcoin
    const btcelectrumhost1 = 'bitcoin.lukechilds.co';
    const btcelectrumhost2 = 'fortress.qtornado.com';
    const btcelectrumhost3 = 'electrumx.erbium.eu';
    const btcelectrumhost4 = 'electrum.acinq.co';
    const btcelectrumhost5 = 'alviss.coinjoined.com';
    const btcelectrumhost6 = 'hodlers.beer';
    const btcelectrumhost7 = 'electrum.blockstream.info'; //lol
    
    let socket_id = [];
    let socket_id2 = [];
    let socket_id3 = [];
    let socket_id4 = [];
    let socket_id5 = [];
    let socket_id6 = [];
    let socket_id7 = [];
    let socket_id33 = [];
    let socket_id34 = [];
    let socket_id35 = [];
    let socket_id36 = [];
    let socket_id37 = [];
    let socket_idbtc = [];
    let socket_idbb = [];
    let socket_idbtcb = [];
    let socket_idftm = [];

    var mnemonic;
    var ps;
    let seedaddresses = [];
    let store = [];

    var passsworddb = Storage.get('password');
    var seedphrasedb = Storage.get('seed');

    let ethnetworktype = 'homestead'; //homestead is mainnet, ropsten for testing, choice for UI selection eventually

    let bscnetworktype = 'mainnet';

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
    let provider2 = new ethers.providers.CloudflareProvider();

    var decryptedmnemonic = decrypt(seedphrasedb);
    mnemonic = decryptedmnemonic;
    const ethwallet = ethers.Wallet.fromMnemonic(mnemonic); //Generate wallet from our Kronos seed
    let ethwalletp = ethwallet.connect(provider); //Set wallet provider

    const Web3 = require('web3');

    const web3 = new Web3('https://bsc-dataseed1.binance.org:443'); //bsc

    const web3ftm = new Web3('https://rpcapi.fantom.network/'); //ftm

    //console.log('BSC WEB3:', web3account);

    const usdtAddress = "0xdAC17F958D2ee523a2206206994597C13D831ec7"; // 0xdAC17F958D2ee523a2206206994597C13D831ec7 USDT (Tether USD ERC20)
    const ercAbi = [
    // Some details about ERC20 ABI
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function balanceOf(address) view returns (uint)",
    "function transfer(address to, uint amount)",
    "event Transfer(address indexed from, address indexed to, uint amount)"
    ];
    const usdtContract = new ethers.Contract(usdtAddress, ercAbi, provider);


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

    res.io.on('connection', function (socket) {
        socket_id33.push(socket.id);
        if (socket_id33[0] === socket.id) {
        // remove the connection listener for any subsequent 
        // connections with the same ID
        res.io.removeAllListeners('connection'); 
        }
        try {
            provider2.on('block', (blockNumber) => {
                let ethblock = blockNumber;
                socket.emit("newblocketh", {ethblock: ethblock});
                // try {
                //     provider2.getBlock(blockNumber).then((block) => {
                //         let blockhash = block.hash;
                //         //console.log(blockhash);
                //         socket.emit("newblocketh", {ethblock: ethblock, ethhash: blockhash});
                //     }).catch((e) => {
                //         console.log(e);
                //     });
                // }
                // catch(e) {
                //     console.log('Catch an error: ', e)
                // }
            }, (error) => {
                console.log('Caught Error: ', error);
                });
        } catch(e) {
            console.log('Caught Error: ', e);
        }
        // usdtContract.on(ethwalletp.address, (balance) => {
        //     console.log('New ARI Balance: ' + balance);
        //     socket.emit("newaribal", {aribal: balance});
        // });
    });

    // Grab BSC Block Height in realtime (every 15s)
    res.io.on('connection', function (socket) {
        socket_idbb.push(socket.id);
        if (socket_idbb[0] === socket.id) {
        res.io.removeAllListeners('connection'); 
        }
        const bscBlock = async () => {
            let bscblock = await web3.eth.getBlockNumber();
            //console.log('BSC Block: ', bscblock);
            socket.emit("newblockbsc", {bscblock: bscblock});
        }
        bscBlock();
        setInterval(function(){ 
            bscBlock();
        }, 15000);
    });

    // Grab FTM Block Height in realtime (every 15s)
    res.io.on('connection', function (socket) {
        socket_idftm.push(socket.id);
        if (socket_idftm[0] === socket.id) {
        res.io.removeAllListeners('connection'); 
        }
        const ftmBlock = async () => {
            let ftmblock = await web3ftm.eth.getBlockNumber();
            //console.log('ftm Block: ', ftmblock);
            socket.emit("newblockftm", {ftmblock: ftmblock});
        }
        ftmBlock();
        setInterval(function(){ 
            ftmBlock();
        }, 15000);
    });

    // Grab ETH in realtime (every 15s)
    res.io.on('connection', function (socket) {
        socket_id34.push(socket.id);
        if (socket_id34[0] === socket.id) {
        res.io.removeAllListeners('connection'); 
        }
        const ethWalletBal = async () => {
            let ethbalance = await provider.getBalance(ethwalletp.address);
            let ethbalformatted = ethers.utils.formatEther(ethbalance);
            Storage.set('totalethbal', JSON.parse(ethbalformatted).toString());
            socket.emit("newethbal", {ethbal: JSON.parse(ethbalformatted)});
        }
        ethWalletBal();
        setInterval(function(){ 
            ethWalletBal();
        }, 15000);
    });

    // Grab BSC balances in realtime (every 15s)
    res.io.on('connection', function (socket) {
        socket_id35.push(socket.id);
        if (socket_id35[0] === socket.id) {
        res.io.removeAllListeners('connection'); 
        }
        const bscWalletBal = async () => {
            let bscbalance = await web3.eth.getBalance(ethwallet.address);
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

    // GET USDT ERC20
    res.io.on('connection', function (socket) {
        socket_id5.push(socket.id);
        if (socket_id5[0] === socket.id) {
        res.io.removeAllListeners('connection'); 
        }
        const usdtWalletBal = async () => {
            let usdtbalance = await usdtContract.balanceOf(ethwalletp.address);
            let usdtbalformatted = ethers.utils.formatEther(usdtbalance);
            Storage.set('totalusdtbal', JSON.parse(usdtbalformatted).toString());
            socket.emit("newusdtbal", {usdtbal: parseFloat(usdtbalformatted)});
        }
        usdtWalletBal();
        setInterval(function(){ 
            usdtWalletBal();
        }, 15000);
    });

    //GET BUSD BEP20 Bal
    res.io.on('connection', function (socket) {
        socket_id37.push(socket.id);
        if (socket_id37[0] === socket.id) {
        res.io.removeAllListeners('connection'); 
        }
        const busdWalletBal = async () => {
            //let busdbalance = await usdtContract.balanceOf(ethwalletp.address);
            let busdbalance = await busdContract.methods.balanceOf(ethwallet.address).call();
            let busdbalformatted = ethers.utils.formatEther(busdbalance);
            Storage.set('totalbusdbal', JSON.parse(busdbalformatted).toString());
            socket.emit("newbusdbal", {busdbal: parseFloat(busdbalformatted)});
        }
        busdWalletBal();
        setInterval(function(){ 
            busdWalletBal();
        }, 15000);
    });


    // Grab FTM balances in realtime (every 15s)
    res.io.on('connection', function (socket) {
        socket_id36.push(socket.id);
        if (socket_id36[0] === socket.id) {
        res.io.removeAllListeners('connection'); 
        }
        const ftmWalletBal = async () => {
            let ftmbalance = await web3ftm.eth.getBalance(ethwallet.address);
            let ftmbalformatted = ftmbalance / 1e18; //ethers.utils.formatEther(bscbalance); Total BSC:  10000000000000000 = 0.01
            //console.log('Total ftm: ', ftmbalformatted);
            Storage.set('totalftmbal', ftmbalformatted);
            socket.emit("newftmbal", {ftmbal: ftmbalformatted});
        }
        ftmWalletBal();
        setInterval(function(){ 
            ftmWalletBal();
        }, 15000);
    });
    
    // si.cpuCurrentspeed(function (data2) {
    
    //     var min = data2.min;
    //     var avg = data2.avg;
    //     var max = data2.max;
    
    //     //Emit to our Socket.io Server
    //     res.io.on('connection', function (socket) {
    //         socket_id2.push(socket.id);
    //         if (socket_id2[0] === socket.id) {
    //           // remove the connection listener for any subsequent 
    //           // connections with the same ID
    //           res.io.removeAllListeners('connection'); 
    //         }
    //         socket.emit("cpuspeed", {min: min, avg: avg, max: max});
    //         setInterval(() => {
    //             socket.emit("cpuspeed", {min: min, avg: avg, max: max});
    //         }, 90000);
    //     });
    // });
    
    // si.cpuTemperature(function (data3) {
    //     var tempp = data3.main;
    //     var temppp = tempp.toFixed(0);
    
    //     if (temppp == -1) {
    //         var temp = 'N/A';
    //     } else {
    //         var temp = temppp;
    //     }
    
    //     //Emit to our Socket.io Server
    //     res.io.on('connection', function (socket) {
    //         socket_id3.push(socket.id);
    //         if (socket_id3[0] === socket.id) {
    //           // remove the connection listener for any subsequent 
    //           // connections with the same ID
    //           res.io.removeAllListeners('connection'); 
    //         }
    //         socket.emit("temp", {temp: temp, temppp: temppp});
    //         setInterval(() => {
    //             si.cpuTemperature(function (data3) {
    //                 var tempp = data3.main;
    //                 var temppp = tempp.toFixed(0);
                
    //                 if (temppp == -1) {
    //                     var temp = 'N/A';
    //                 } else {
    //                     var temp = temppp;
    //                 }
    
    //                 socket.emit("temp", {temp: temp, temppp: temppp});
    //             });
    //         }, 60000);
    //     });
    // });
    
    // si.mem(function (data1) {
    
    //     var bytes = 1073741824;
    //     var memtt = data1.total;
    //     var memuu = data1.active;
    //     var memff = data1.free;
    //     var mema = data1.available;
    
    //     var memttt = memtt / bytes;
    //     var memt = memttt.toFixed(2);
    
    //     var memffff = memtt - memuu;
    //     var memfff = memffff / bytes;
    //     var memf = memfff.toFixed(2);
    
    //     var memuuu = memuu / bytes;
    //     var memu = memuuu.toFixed(2);
    
    
    //     var memp = memu / memt * 100;
    //     var memppp = memp / 100;
    //     var mempp = memppp;
    
    //     //Emit to our Socket.io Server
    //     res.io.on('connection', function (socket) {
    //         socket_id4.push(socket.id);
    //         if (socket_id4[0] === socket.id) {
    //           // remove the connection listener for any subsequent 
    //           // connections with the same ID
    //           res.io.removeAllListeners('connection'); 
    //         }
    //         socket.emit("memory", {mema: mema, memt: memt, memf: memf, memu: memu, memp: memp, mempp: mempp});
    //         setInterval(() => {
    //             si.mem(function (data1) {
    
    //                 var bytes = 1073741824;
    //                 var memtt = data1.total;
    //                 var memuu = data1.active;
    //                 var memff = data1.free;
    //                 var mema = data1.available;
                
    //                 var memttt = memtt / bytes;
    //                 var memt = memttt.toFixed(2);
                
    //                 var memffff = memtt - memuu;
    //                 var memfff = memffff / bytes;
    //                 var memf = memfff.toFixed(2);
                
    //                 var memuuu = memuu / bytes;
    //                 var memu = memuuu.toFixed(2);			
                
    //                 var memp = memu / memt * 100;
    //                 var memppp = memp / 100;
    //                 var mempp = memppp;
    
    //                 socket.emit("memory", {mema: mema, memt: memt, memf: memf, memu: memu, memp: memp, mempp: mempp});
    //             });
    //         }, 5000);
    //     });
    // });
    
    
    // si.osInfo().then(data4 => {
    
    //     var osname = data4.distro;
    //     var kernel = data4.kernel;
    //     var platform = data4.platform;
    //     var release = data4.release;
    //     var hostname = data4.hostname;
    //     var arch = data4.arch;
    
    //     res.locals.osname = osname;
    //     res.locals.kernel = kernel;
    //     res.locals.platform = platform;
    //     res.locals.release = release;
    //     res.locals.hostname = hostname;
    //     res.locals.arch = arch;

    //     Storage.set('osname', osname);
    //     Storage.set('kernel', kernel);
    //     Storage.set('platform', platform);
    //     Storage.set('release', release);
    //     Storage.set('hostname', hostname);
    //     Storage.set('arch', arch);

    // });
    
    // si.currentLoad().then(data6 => {
    
    //     var avgload = data6.avgload;
    //     var currentload = data6.currentload;
    
    //     var cpu = currentload / 100;
    
    //     //Emit to our Socket.io Server
    //     res.io.on('connection', function (socket) {
    //         socket_id7.push(socket.id);
    //         if (socket_id7[0] === socket.id) {
    //           // remove the connection listener for any subsequent 
    //           // connections with the same ID
    //           res.io.removeAllListeners('connection'); 
    //         }
    //         socket.emit("cpuload", {avgload: avgload, cpu: cpu});
    //         setInterval(() => {
    //             si.currentLoad().then(data6 => {
    
    //                 var avgload = data6.avgload;
    //                 var currentload = data6.currentload;
                
    //                 var cpu = currentload / 100;
    
    //                 socket.emit("cpuload", {avgload: avgload, cpu: cpu});
    
    //             });
    //         }, 5000);
    //     });
    
    // });
    
    //Testing out realtime Electrumx Block Header Subscribe
    //Emit to our Socket.io Server
    res.io.on('connection', function (socket) {
        socket_id.push(socket.id);
        if (socket_id[0] === socket.id) {
        // remove the connection listener for any subsequent 
        // connections with the same ID
        res.io.removeAllListeners('connection'); 
        }
        const latestblocks = async () => {
            // Initialize an electrum cluster where 1 out of 2 out of the 4 needs to be consistent, polled randomly with fail-over.
            const electrum = new ElectrumCluster('Kronos ElectrumX Cluster', '1.4', 1, 2);
            
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
                //Storage.set('newblock', data);
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

    //Get Bitcoin Blocks
    res.io.on('connection', function (socket) {
        socket_idbtc.push(socket.idbtc);
        if (socket_idbtc[0] === socket.id) {
        // remove the connection listener for any subsequent 
        // connections with the same ID
        res.io.removeAllListeners('connection'); 
        }
        const latestBTCblocks = async () => {
            // Initialize an electrum cluster where 1 out of 2 out of the 4 needs to be consistent, polled randomly with fail-over.
            const electrum = new ElectrumCluster('Kronos ElectrumX Cluster', '1.4', 1, 2);
            
            // Add some servers to the cluster.
            electrum.addServer(btcelectrumhost1);
            electrum.addServer(btcelectrumhost2);
            electrum.addServer(btcelectrumhost3);
            electrum.addServer(btcelectrumhost4);
            electrum.addServer(btcelectrumhost5);
            electrum.addServer(btcelectrumhost6);
            electrum.addServer(btcelectrumhost7);
            
            // Wait for enough connections to be available.
            await electrum.ready();
    
            // Set up a callback function to handle new blocks.
            const handleNewBlocks = function(data)
            {
                socket.emit("newbtcblock", {block: data});
                //Storage.set('newblock', data);
                //console.log("Got New Denarius Block Height");
            }
            //TODO: NEED TO SETUP CLUSTERING AND ALSO ERROR SANITY CHECKING IF SERVER(S) OFFLINE
            // Set up a subscription for new block headers and handle events with our callback function.
            await electrum.subscribe(handleNewBlocks, 'blockchain.headers.subscribe');

            //await electrum.disconnect();
    
            //return handleNewBlocks();
        }
        latestBTCblocks();
    });

        var decryptedpass = decrypt(passsworddb);
        ps = decryptedpass;

        var decryptedmnemonic = decrypt(seedphrasedb);
        mnemonic = decryptedmnemonic;


        //Convert our mnemonic seed phrase to BIP39 Seed Buffer 
        const seed = bip39.mnemonicToSeedSync(mnemonic); //No pass included to keep Coinomi styled seed
        
        // BIP32 From BIP39 Seed
        const root = bip32.fromSeed(seed);

        const rootbtc = bip32b.fromSeed(seed);

        // Get XPUB from BIP32
        const xpub = root.neutered().toBase58();

        const addresscount = 4; // 3 Addresses Generated

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

        //Get 1 Address from the derived mnemonic
        const addressPath0 = `m/44'/116'/0'/0/0`;

        const btcaddressPath0 = `m/49'/0'/0'/0/0`; //const btcaddressPath0 = `m/44'/0'/0'/0/0`; Previous deriviation

        // Get the keypair from the address derivation path
        const addressKeypair0 = root.derivePath(addressPath0);

        const btcaddressKeypair0 = rootbtc.derivePath(btcaddressPath0);

        // Get the p2pkh base58 public address of the keypair
        const p2pkhaddy0 = denarius.payments.p2pkh({ pubkey: addressKeypair0.publicKey, network }).address;

        const p2pkaddy = denarius.payments.p2pkh({ pubkey: addressKeypair0.publicKey, network }).pubkey.toString('hex');

        const btcp2pkhaddy0 = bitcoinjs.payments.p2pkh({ pubkey: btcaddressKeypair0.publicKey, bitcoinnetwork }).address; //Legacy 1

        const btcp2pkaddy = bitcoinjs.payments.p2pkh({ pubkey: btcaddressKeypair0.publicKey, bitcoinnetwork }).pubkey.toString('hex');

        const btcsegwitbech32 = bitcoinjs.payments.p2wpkh({ pubkey: btcaddressKeypair0.publicKey, bitcoinnetwork }).address; //Segwit Bech32 bc1

        const btcsegwitp2shaddy = bitcoinjs.payments.p2sh({ redeem: bitcoinjs.payments.p2wpkh({ pubkey: btcaddressKeypair0.publicKey, bitcoinnetwork }), }).address; //Segwit P2SH 3
        
        Storage.set('mainaddress', p2pkhaddy0);
        Storage.set('p2pkaddress', p2pkaddy);

        Storage.set('btcaddress', btcp2pkhaddy0); // 1
        Storage.set('btcp2pkaddress', btcp2pkaddy);
        Storage.set('btcbechaddy', btcsegwitbech32); // bc1
        Storage.set('btcsegwitaddy', btcsegwitp2shaddy); // 3

        // console.log(btcp2pkhaddy0);
        // console.log(btcp2pkaddy);
        // console.log(btcsegwitbech32);
        // console.log(btcsegwitp2shaddy);

        //Denarius Scripthashes
        const bytes = bs58.decode(p2pkhaddy0);
        const byteshex = bytes.toString('hex');
        const remove00 = byteshex.substring(2);
        const removechecksum = remove00.substring(0, remove00.length-8);
        const HASH160 = "76A914" + removechecksum.toUpperCase() + "88AC";
        const BUFFHASH160 = Buffer.from(HASH160, "hex");
        const shaaddress = sha256(BUFFHASH160);

        const xpubtopub = p2pkaddy;
        const HASH1601 =  "21" + xpubtopub + "ac"; // 21 + COMPRESSED PUBKEY + OP_CHECKSIG = P2PK
        const BUFFHASH1601 = Buffer.from(HASH1601, "hex");
        const shaaddress1 = sha256(BUFFHASH1601);

        const scripthash = changeEndianness(shaaddress);
        const scripthashp2pk = changeEndianness(shaaddress1);

        //Bitcoin Scripthashes
        const bbytes = bs58.decode(btcsegwitp2shaddy);
        const bbyteshex = bbytes.toString('hex');
        const bremove00 = bbyteshex.substring(2);
        const bremovechecksum = bremove00.substring(0, bremove00.length-8);
        const bHASH160 = "A914" + bremovechecksum.toUpperCase() + "87"; // OP_HASH160 and OP_EQUAL
        const bBUFFHASH160 = Buffer.from(bHASH160, "hex");
        const shaaddressbtc = sha256(bBUFFHASH160);

        const bxpubtopub = btcp2pkaddy;
        const bHASH1601 =  "21" + bxpubtopub + "ac"; // 21 + COMPRESSED PUBKEY + OP_CHECKSIG = P2PK
        const bBUFFHASH1601 = Buffer.from(bHASH1601, "hex");
        const shaaddressbtc1 = sha256(bBUFFHASH1601);

        const scripthashbtc = changeEndianness(shaaddressbtc);
        const scripthashp2pkbtc = changeEndianness(shaaddressbtc1);

        res.io.on('connection', function (socket) {
            socket_id6.push(socket.id);
            if (socket_id6[0] === socket.id) {
            res.io.removeAllListeners('connection'); 
            }
            const dWalletBal = async () => {
                // Initialize an electrum cluster where 1 out of 2 out of the 4 needs to be consistent, polled randomly with fail-over.
                const electrum = new ElectrumCluster('Kronos Core Mode D Balance', '1.4', 1, 2);
                
                // Add some servers to the cluster.
                electrum.addServer(delectrumxhost1);
                electrum.addServer(delectrumxhost2);
                electrum.addServer(delectrumxhost3);
                electrum.addServer(delectrumxhost4);
                try {
                    // Wait for enough connections to be available.
                    await electrum.ready();
                    
                    // Request the balance of the requested Scripthash D address

                    const balancescripthash = await electrum.request('blockchain.scripthash.get_balance', scripthash);

                    const p2pkbalancescripthash = await electrum.request('blockchain.scripthash.get_balance', scripthashp2pk);

                    const balanceformatted = balancescripthash.confirmed;

                    const p2pkbalanceformatted = p2pkbalancescripthash.confirmed;

                    const balancefinal = balanceformatted / 100000000;

                    const p2pkbalancefinal = p2pkbalanceformatted / 100000000;

                    const addedbalance = balancefinal + p2pkbalancefinal;

                    const addedbalance2 = balanceformatted + p2pkbalanceformatted;

                    //await electrum.disconnect();
                    await electrum.shutdown();
                    Storage.set('totalbal', addedbalance);
                    socket.emit("newdbal", {dbal: addedbalance});

                } catch (e) {
                    console.log(e);
                }
            }
            dWalletBal();
            setInterval(function(){ 
                dWalletBal();
            }, 15000);
        });


        res.io.on('connection', function (socket) {
            socket_idbtcb.push(socket.id);
            if (socket_idbtcb[0] === socket.id) {
            res.io.removeAllListeners('connection'); 
            }
            const btcWalletBal = async () => {
                // Initialize an electrum cluster where 1 out of 2 out of the 4 needs to be consistent, polled randomly with fail-over.
                const electrum = new ElectrumCluster('Kronos Core Mode BTC Balance', '1.4', 1, 2);
                
                // Add some servers to the cluster.
                electrum.addServer(btcelectrumhost1);
                electrum.addServer(btcelectrumhost2);
                electrum.addServer(btcelectrumhost3);
                electrum.addServer(btcelectrumhost4);
                electrum.addServer(btcelectrumhost5);
                electrum.addServer(btcelectrumhost6);
                try {
                    // Wait for enough connections to be available.
                    await electrum.ready();
                    
                    // Request the balance of the requested Scripthash BTC address

                    const balancescripthash = await electrum.request('blockchain.scripthash.get_balance', scripthashbtc);

                    const p2pkbalancescripthash = await electrum.request('blockchain.scripthash.get_balance', scripthashp2pkbtc);

                    const balanceformatted = balancescripthash.confirmed;

                    const p2pkbalanceformatted = p2pkbalancescripthash.confirmed;

                    const balancefinal = balanceformatted / 100000000;

                    const p2pkbalancefinal = p2pkbalanceformatted / 100000000;

                    const addedbalance = balancefinal + p2pkbalancefinal;

                    const addedbalance2 = balanceformatted + p2pkbalanceformatted;

                    //await electrum.disconnect();
                    await electrum.shutdown();
                    //console.log('BTC TOTAL BEING SET: ', addedbalance);
                    Storage.set('totalbtcbal', addedbalance);
                    socket.emit("newbtcbal", {btcbal: addedbalance});

                } catch (e) {
                    console.log(e);
                }
            }
            btcWalletBal();
            setInterval(function(){ 
                btcWalletBal();
            }, 15000);
        });

        // A for loop for how many addresses we want from the derivation path of the seed phrase
        for (let i = 0; i < addresscount; i++) { //20

          //Get 10 Addresses from the derived mnemonic
          const addressPath = `m/44'/116'/0'/0/${i}`;

          // Get the keypair from the address derivation path
          const addressKeypair = root.derivePath(addressPath);

          // Get the p2pkh base58 public address of the keypair
          const p2pkhaddy = denarius.payments.p2pkh({ pubkey: addressKeypair.publicKey, network }).address;

          // Get the compressed pubkey p2pk
          const p2pkaddy = denarius.payments.p2pkh({ pubkey: addressKeypair.publicKey, network }).pubkey.toString('hex');

          //console.log(addressKeypair);

          const privatekey = addressKeypair.toWIF();
        
          //New Array called seedaddresses that is filled with address and path data currently
          seedaddresses.push({ address: p2pkhaddy, privkey: privatekey, path: addressPath, p2pk: p2pkaddy });
        }

        store.push({mnemonic: mnemonic, seedaddresses: seedaddresses});

        res.locals.seedphrase = store;

        var mainaddy = Storage.get('mainaddress');
        var btcaddy = Storage.get('btcsegwitaddy');

        //const ethwallet = ethers.Wallet.fromMnemonic(mnemonic); //Generate wallet from our Kronos seed
        //let ethwalletp = ethwallet.connect(provider); //Set wallet provider

        QRCode.toDataURL(mainaddy, { color: { dark: '#000000FF', light:"#777777FF" } }, function(err, qrcode) {
                if (err) {
                    console.log('Error Generating QR for Main Address');
                }
                //Store the qrcode for rendering retrieval
                Storage.set('qrcode', qrcode);
        });

        QRCode.toDataURL(ethwalletp.address, { color: { dark: '#000000FF', light:"#777777FF" } }, function(err, ethqrcode) {
            if (err) {
                console.log('Error Generating QR for ETH Address');
            }
            //Store the qrcode for rendering retrieval
            Storage.set('ethqrcode', ethqrcode);
        });

        QRCode.toDataURL(ethwallet.address, { color: { dark: '#000000FF', light:"#777777FF" } }, function(err, bscqrcode) {
            if (err) {
                console.log('Error Generating QR for BSC Address');
            }
            //Store the qrcode for rendering retrieval
            Storage.set('bscqrcode', bscqrcode);
        });

        QRCode.toDataURL(ethwallet.address, { color: { dark: '#000000FF', light:"#777777FF" } }, function(err, ftmqrcode) {
            if (err) {
                console.log('Error Generating QR for FTM Address');
            }
            //Store the qrcode for rendering retrieval
            Storage.set('ftmqrcode', ftmqrcode);
        });

        QRCode.toDataURL(btcaddy, { color: { dark: '#000000FF', light:"#777777FF" } }, function(err, btcqrcode) {
            if (err) {
                console.log('Error Generating QR for BTC Address');
            }
            //Store the qrcode for rendering retrieval
            Storage.set('btcqrcode', btcqrcode);
        });
        Storage.set('ethaddy', ethwalletp.address);
        Storage.set('bscaddy', ethwallet.address);
        Storage.set('ftmaddy', ethwallet.address);

        //Grab Full Transaction History from BTC ElectrumX
        const btctxhistoryfull = async () => {
            // Initialize an electrum cluster where 1 out of 2 out of the 4 needs to be consistent, polled randomly with fail-over.
            const electrum = new ElectrumCluster('Kronos Core Mode BTC TX History', '1.4', 1, 2);
            
            // Add some servers to the cluster.
            electrum.addServer(btcelectrumhost1);
            electrum.addServer(btcelectrumhost2);
            electrum.addServer(btcelectrumhost3);
            electrum.addServer(btcelectrumhost4);
            electrum.addServer(btcelectrumhost5);
            electrum.addServer(btcelectrumhost6);
            electrum.addServer(btcelectrumhost7);
            
            try {
            // Wait for enough connections to be available.
            await electrum.ready();
            
            // Request the balance of the requested Scripthash D address

            //const txs = [];
            var gethistory1 = await electrum.request('blockchain.scripthash.get_history', scripthashbtc);

            const gethistory2 = await electrum.request('blockchain.scripthash.get_history', scripthashp2pkbtc);

            if (typeof gethistory1 == 'undefined') {
                gethistory1 = [];
            }

            const txs = gethistory1.concat(gethistory2);

            const txscount = txs.length;

            const btcfulltx = [];

            for(i=0; i<txscount; i++) {
                if (typeof txs[i].tx_hash != 'undefined') {
                    var transactionID = txs[i].tx_hash;
                    var transactionBlock = txs[i].height;
                    const transactionHex = await electrum.request('blockchain.transaction.get', transactionID, true);
                    //transactionHex.push(transactionBlock);
                    //console.log(transactionHex);
                    btcfulltx.push({transactionBlock, transactionHex});
                }
            }

            await electrum.shutdown();

            return btcfulltx;
            } catch (e) {
                console.log('BTC TX History Error', e);
            }
        };

        //Grab Full Transaction History from BTC ElectrumX
        const btcmemtxhistoryfull = async () => {
            // Initialize an electrum cluster where 1 out of 2 out of the 4 needs to be consistent, polled randomly with fail-over.
            const electrum = new ElectrumCluster('Kronos Core Mode BTC TX History', '1.4', 1, 2);
            
            // Add some servers to the cluster.
            electrum.addServer(btcelectrumhost1);
            electrum.addServer(btcelectrumhost2);
            electrum.addServer(btcelectrumhost3);
            electrum.addServer(btcelectrumhost4);
            electrum.addServer(btcelectrumhost5);
            electrum.addServer(btcelectrumhost6);
            electrum.addServer(btcelectrumhost7);
            
            try {
            // Wait for enough connections to be available.
            await electrum.ready();
            
            // Request the balance of the requested Scripthash D address

            //const txs = [];

            var gethistory1 = [];
            var gethistory1 = await electrum.request('blockchain.scripthash.get_mempool', scripthashbtc);

            console.log(gethistory1);

            var gethistory2 = await electrum.request('blockchain.scripthash.get_mempool', scripthashp2pkbtc);

            if (typeof gethistory1 == 'undefined') {
                gethistory1 = [];
            }

            const txs = gethistory1.concat(gethistory2);

            const txscount = txs.length;

            const btcfulltx = [];

            for(i=0; i<txscount; i++) {
                if (typeof txs[i].tx_hash != 'undefined') {
                    var transactionID = txs[i].tx_hash;
                    var transactionBlock = txs[i].height;
                    const transactionHex = await electrum.request('blockchain.transaction.get', transactionID, true);
                    //transactionHex.push(transactionBlock);
                    //console.log(transactionHex);
                    btcfulltx.push({transactionBlock, transactionHex});
                }
            }

            await electrum.shutdown();

            return btcfulltx;
            } catch (e) {
                console.log('BTC TX Mempool History Error', e);
            }
        };

        //Grab Full Transaction History from BTC ElectrumX
        const btcutxoHistory = async () => {
            // Initialize an electrum cluster where 1 out of 2 out of the 4 needs to be consistent, polled randomly with fail-over.
            const electrum = new ElectrumCluster('Kronos Core Mode BTC UTXO History', '1.4', 1, 2);
            
            // Add some servers to the cluster.
            electrum.addServer(btcelectrumhost1);
            electrum.addServer(btcelectrumhost2);
            electrum.addServer(btcelectrumhost3);
            electrum.addServer(btcelectrumhost4);
            electrum.addServer(btcelectrumhost5);
            electrum.addServer(btcelectrumhost6);
            electrum.addServer(btcelectrumhost7);
            
            try {
            // Wait for enough connections to be available.
            await electrum.ready();
            
            // Request the balance of the requested Scripthash D address

            //const txs = [];
            var gethistory1 = await electrum.request('blockchain.scripthash.listunspent', scripthashbtc);

            const gethistory2 = await electrum.request('blockchain.scripthash.listunspent', scripthashp2pkbtc);

            if (typeof gethistory1 == 'undefined') {
                gethistory1 = [];
            }

            const utxs = gethistory1.concat(gethistory2);

            const utxscount = utxs.length;

            const ubtcfulltx = [];

            for(i=0; i<utxscount; i++) {
                if (typeof utxs[i].tx_hash != 'undefined') {
                    var transactionID = utxs[i].tx_hash;
                    var transactionBlock = utxs[i].height;
                    const transactionHex = await electrum.request('blockchain.transaction.get', transactionID, true);
                    //transactionHex.push(transactionBlock);
                    //console.log(transactionHex);
                    ubtcfulltx.push({transactionBlock, transactionHex});
                }
            }

            await electrum.shutdown();

            return ubtcfulltx;
            } catch (e) {
                console.log('BTC UTXO History Error', e);
            }
        };

        //seedaddresses.forEach(function (item, index) {

            //var daddress0 = item.address;

            //console.log(xpub);

            //var xprivkk = root.toBase58();

            //var xpubkk = xpub;

            //NEED TO GET ADDRESSES

            //Convert P2PKH Address to Scripthash for ElectrumX Balance Fetching
            // const bytes = bs58.decode(p2pkhaddy0);
            // const byteshex = bytes.toString('hex');
            // const remove00 = byteshex.substring(2);
            // const removechecksum = remove00.substring(0, remove00.length-8);
            // const HASH160 = "76A914" + removechecksum.toUpperCase() + "88AC";
            // const BUFFHASH160 = Buffer.from(HASH160, "hex");
            // const shaaddress = sha256(BUFFHASH160);

            // //Convert P2PK Address to Scripthash for ElectrumX Balance Fetching
            // //Convert XPUB to Compressed Pubkey
            // // const XPUBTOBASE = bs58.decode(xpubkk);
            // // const XPUBBYTESTOHEX = XPUBTOBASE.toString('hex');
            // // //console.log(XPUBBYTESTOHEX); // 164
            // // const xpubtopub = XPUBBYTESTOHEX.substring(90, XPUBBYTESTOHEX.length - 8); // Decoded Base58 XPub to last 33 bytes (privkey 32 bytes)
            // //console.log("IS THIS THE COMPRESSED PUBKEY?" + xpubtopub);
            // const xpubtopub = p2pkaddy;
            // const HASH1601 =  "21" + xpubtopub + "ac"; // 21 + COMPRESSED PUBKEY + OP_CHECKSIG = P2PK
            // //console.log(HASH1601);
            // const BUFFHASH1601 = Buffer.from(HASH1601, "hex");
            // const shaaddress1 = sha256(BUFFHASH1601);

            const scripthasha = async () => {
                // Initialize an electrum cluster where 1 out of 2 out of the 4 needs to be consistent, polled randomly with fail-over.
                const electrums = new ElectrumCluster('Kronos Core Mode Bal', '1.4', 1, 2);
                
                // Add some servers to the cluster.
                electrums.addServer(delectrumxhost1);
                electrums.addServer(delectrumxhost2);
                electrums.addServer(delectrumxhost3);
                electrums.addServer(delectrumxhost4);
                
                // Wait for enough connections to be available.
                await electrums.ready();
                
                // Request the balance of the requested Scripthash D address

                const balancescripthash = await electrums.request('blockchain.scripthash.get_balance', scripthash);

                const p2pkbalancescripthash = await electrums.request('blockchain.scripthash.get_balance', scripthashp2pk);

                const balanceformatted = balancescripthash.confirmed;

                const p2pkbalanceformatted = p2pkbalancescripthash.confirmed;

                const balancefinal = balanceformatted / 100000000;

                const p2pkbalancefinal = p2pkbalanceformatted / 100000000;

                const addedbalance = balancefinal + p2pkbalancefinal;

                //await electrum.disconnect();
                await electrums.shutdown();

                return addedbalance;
            }

            const scripthashb = async () => {
                // Initialize an electrum cluster where 1 out of 2 out of the 4 needs to be consistent, polled randomly with fail-over.
                const electrum = new ElectrumCluster('Kronos Core Mode Unconfirmed Balances', '1.4', 1, 2);
                
                // Add some servers to the cluster.
                electrum.addServer(delectrumxhost1);
                electrum.addServer(delectrumxhost2);
                electrum.addServer(delectrumxhost3);
                electrum.addServer(delectrumxhost4);
                
                // Wait for enough connections to be available.
                await electrum.ready();
                
                // Request the balance of the requested Scripthash D address

                const balancescripthash = await electrum.request('blockchain.scripthash.get_balance', scripthash);

                const p2pkbalancescripthash = await electrum.request('blockchain.scripthash.get_balance', scripthashp2pk);

                const balanceformatted = balancescripthash.unconfirmed;

                const p2pkbalanceformatted = p2pkbalancescripthash.unconfirmed;

                const balancefinal = balanceformatted / 100000000;

                const p2pkbalancefinal = p2pkbalanceformatted / 100000000;

                const addedunbalance = balancefinal + p2pkbalancefinal;

                //await electrum.disconnect();
                await electrum.shutdown();

                return addedunbalance;
            }

            //Grab Full Transaction History from D ElectrumX
            const txhistoryfull = async () => {
                // Initialize an electrum cluster where 1 out of 2 out of the 4 needs to be consistent, polled randomly with fail-over.
                const electrum = new ElectrumCluster('Kronos Core Mode TX History', '1.4', 1, 2);
                
                // Add some servers to the cluster.
                electrum.addServer(delectrumxhost1);
                electrum.addServer(delectrumxhost2);
                electrum.addServer(delectrumxhost3);
                electrum.addServer(delectrumxhost4);
                
                try {
                // Wait for enough connections to be available.
                await electrum.ready();
                
                // Request the balance of the requested Scripthash D address

                //const txs = [];
                var gethistory1 = await electrum.request('blockchain.scripthash.get_history', scripthash);

                const gethistory2 = await electrum.request('blockchain.scripthash.get_history', scripthashp2pk);

                if (typeof gethistory1 == 'undefined') {
                    gethistory1 = [];
                }

                const txs = gethistory1.concat(gethistory2);

                const txscount = txs.length;

                const fulltx = [];

                for(i=0; i<txscount; i++) {
                    if (typeof txs[i].tx_hash != 'undefined') {
                        var transactionID = txs[i].tx_hash;
                        var transactionBlock = txs[i].height;
                        const transactionHex = await electrum.request('blockchain.transaction.get', transactionID, true);
                        //transactionHex.push(transactionBlock);
                        //console.log(transactionHex);
                        fulltx.push({transactionBlock, transactionHex});
                    }
                }

                await electrum.shutdown();

                return fulltx; //txs //fulltx
                } catch (e) {
                    console.log('TX Error', e);
                }
            }

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

                //const utxos = [];

                var getuhistory1 = await electrum.request('blockchain.scripthash.listunspent', scripthash);

                const getuhistory2 = await electrum.request('blockchain.scripthash.listunspent', scripthashp2pk);

                if (typeof gethistory1 == 'undefined') {
                    gethistory1 = [];
                }

                const utxos = getuhistory1.concat(getuhistory2);

                const utxoscount = utxos.length;

                const udfulltx = [];

                for(i=0; i<utxoscount; i++) {
                    if (typeof utxos[i].tx_hash != 'undefined') {
                        var transactionID = utxos[i].tx_hash;
                        var transactionBlock = utxos[i].height;
                        const transactionHex = await electrum.request('blockchain.transaction.get', transactionID, true);
                        //transactionHex.push(transactionBlock);
                        //console.log(transactionHex);
                        udfulltx.push({transactionBlock, transactionHex});
                    }
                }

                //await electrum.disconnect();
                await electrum.shutdown();

                return udfulltx;
                } catch (e) {
                    console.log('D UTXO History Error', e);
                }
            }

            promises.push(new Promise((res, rej) => {
                    scripthasha().then(globalData => {
                    scripthashb().then(globalData2 => {
                    btcmemtxhistoryfull().then(btcmemTXHistory => {
                    btctxhistoryfull().then(btcTXHistory => {
                    btcutxoHistory().then(btcutxoHistory => {
                    txhistoryfull().then(TXHistory => {
                    utxohistory().then(UTXOHistory => {

                        scripthasharray.push({balance: globalData, unconfirmedbal: globalData2, txs: TXHistory, utxos: UTXOHistory, btctxs: btcTXHistory, btcmemtxs: btcmemTXHistory, btcutxos: btcutxoHistory});
                        res({globalData, globalData2, TXHistory, UTXOHistory, btcTXHistory, btcmemTXHistory, btcutxoHistory});

                    });
                    });
                    });
                    });
                    });
                    });
                });
            }));

        //});

        //Grab Denarii and Ethereum Data
        const ethWalletBal = async () => {        
            //let signer = provider.getSigner(0);
    
            const ethwallet = ethers.Wallet.fromMnemonic(mnemonic); //Generate wallet from our Kronos seed
    
            // provider.getBlockNumber().then((blockNumber) => {
            //     console.log("Current ETH block number: " + blockNumber);
            // });
    
            let ethwalletp = ethwallet.connect(provider2); //Set wallet provider

            //Storage.set('ethaddy', ethwalletp.address);

            let ethbalance = await provider2.getBalance(ethwalletp.address);

            let ethbalformatted = ethers.utils.formatEther(ethbalance); //ethers.utils.formatUnits(ethbalance, 18);

            // provider.getBalance(ethwalletp.address).then((result) => {
            //      console.log("ETH Balance: " + result);
            // });

            return JSON.parse(ethbalformatted);
        }

        const bscWalletBal = async () => {        
            //let signer = provider.getSigner(0);
    
            const ethwallet = ethers.Wallet.fromMnemonic(mnemonic); //Generate wallet from our Kronos seed
    
            // provider.getBlockNumber().then((blockNumber) => {
            //     console.log("Current ETH block number: " + blockNumber);
            // });
    
            //let bscwalletp = ethwallet.connect(provider2); //Set wallet provider

            //Storage.set('ethaddy', ethwalletp.address);

            //let bscbalance = await provider2.getBalance(ethwalletp.address);


            let bscbalance = await web3.eth.getBalance(ethwallet.address);
            let bscbalformatted = bscbalance / 1e18;

            //let bscbalformatted = ethers.utils.formatEther(ethbalance); //ethers.utils.formatUnits(ethbalance, 18);

            // provider.getBalance(ethwalletp.address).then((result) => {
            //      console.log("ETH Balance: " + result);
            // });

            return bscbalformatted;
        }

        const usdtWalletBal = async () => {        
            //let signer = provider.getSigner(0);
    
            const ethwallet = ethers.Wallet.fromMnemonic(mnemonic); //Generate wallet from our Kronos seed
    
            // provider.getBlockNumber().then((blockNumber) => {
            //     console.log("Current ETH block number: " + blockNumber);
            // });
    
            let ethwalletp = ethwallet.connect(provider2); //Set wallet provider

            //let ethbalance = await provider.getBalance(ethwalletp.address);
    
            // You can also use an ENS name for the contract address
            const usdtAddress = "0xdAC17F958D2ee523a2206206994597C13D831ec7"; // 0xdAC17F958D2ee523a2206206994597C13D831ec7 USDT (Tether USD)
            const ercAbi = [
            // Some details about the token
            "function name() view returns (string)",
            "function symbol() view returns (string)",
    
            // Get the account balance
            "function balanceOf(address) view returns (uint)",
    
            // Send some of your tokens to someone else
            "function transfer(address to, uint amount)",
    
            // An event triggered whenever anyone transfers to someone else
            "event Transfer(address indexed from, address indexed to, uint amount)"
            ];
    
            // The Contract object
            const usdtContract = new ethers.Contract(usdtAddress, ercAbi, provider2);
    
            // // // Get the ERC-20 token name
            // usdtContract.name().then((result) => {
            //     console.log("Name: " + result);
            // });
    
            // // Get the ERC-20 token symbol (for tickers and UIs)
            // usdtContract.symbol()
    
            // Get the balance of an address
            let usdtbalance = await usdtContract.balanceOf(ethwalletp.address)
            // ethers.utils.formatUnits(aribalance, 8); // 8 decimals for ARI

            let usdtbalformatted = ethers.utils.formatEther(usdtbalance);
    
            //console.log(formattedethbal);
            //console.log("ARI Address: ", ethwalletp.address);

            return parseFloat(usdtbalformatted);
        }

        const busdWalletBal = async () => {    
            const ethwallet = ethers.Wallet.fromMnemonic(mnemonic); //Generate wallet from our Kronos seed

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
        
            let busdbalance = await busdContract.methods.balanceOf(ethwallet.address).call();

            let busdbalformatted = ethers.utils.formatEther(busdbalance);

            //Storage.set('totalbusdbal', JSON.parse(busdbalformatted).toString());
            //socket.emit("newbusdbal", {busdbal: parseFloat(busdbalformatted)});

            return parseFloat(busdbalformatted);
        }

        const ftmWalletBal = async () => {   
            const ethwallet = ethers.Wallet.fromMnemonic(mnemonic); //Generate wallet from our Kronos seed

            let ftmbalance = await web3ftm.eth.getBalance(ethwallet.address);
            let ftmbalformatted = ftmbalance / 1e18;

            return ftmbalformatted;
        }

        promises2.push(new Promise((res, rej) => {
            ethWalletBal().then(ethWalletBal => {
            bscWalletBal().then(bscWalletBal => {
            usdtWalletBal().then(usdtWalletBal => {
            busdWalletBal().then(busdWalletBal => {
            ftmWalletBal().then(ftmWalletBal => {
            // BoxProfile().then(threeboxprofile => {

                ethereumarray.push({ethbal: ethWalletBal, usdtbal: usdtWalletBal, bscbal: bscWalletBal, busdbal: busdWalletBal, ftmbal: ftmWalletBal});
                res({ethWalletBal, usdtWalletBal, bscWalletBal, busdWalletBal, ftmWalletBal});

            // });
            });
            });
            });
            });
            });
        }));

        res.render('simple/loading', (err, html) => {
            res.write(html + '\n');
            Promise.all(promises).then((values) => {

                // Storage.set('threebox', threebox);
                //Storage.set('boxspace', boxspace);

                var totalbal = 0;
                scripthasharray.forEach(function (item, index) {
                    totalbal += item.balance;
                });                
                Storage.set('totalbal', totalbal);
                Storage.set('accountarray', scripthasharray);
                let denariusutxos = scripthasharray[0].utxos;
                let denariustxs = scripthasharray[0].txs;
                let bitcointxs = scripthasharray[0].btctxs;
                let bitcoinmem = scripthasharray[0].btcmemtxs;
                let bitcoinutxos = scripthasharray[0].btcutxos;
                //scripthasharray = scripthasharray.filter(item => item);
                //console.log(scripthasharray)
                //console.log('----- ', scripthasharray);
                //.log(bitcoinmem);
                //Storage.set('dutxo', denariusutxos);

                // Get Total Unconfirmed Balances of all derived addresses
                var totalunbal;
                scripthasharray.forEach(function (itemun, index) {
                    totalunbal += itemun.unconfirmedbal;
                });

                Storage.set('unconf', totalunbal.toString());

                Promise.all(promises2).then((values) => {

                    // Get Total Balances of all derived addresses
                    var totalethbal = 0;
                    var totalbscbal = 0;
                    var totalusdtbal = 0;
                    var totalbusdbal = 0;
                    var totalftmbal = 0;
                    // var threebox;
                    //var boxspace;

                    totalethbal = ethereumarray[0].ethbal;
                    totalbscbal = ethereumarray[0].bscbal;
                    totalusdtbal = ethereumarray[0].usdtbal;
                    totalbusdbal = ethereumarray[0].busdbal;
                    totalftmbal = ethereumarray[0].ftmbal;
                    // threebox = ethereumarray[0].boxprofile;
                    //boxspace = ethereumarray[0].boxspace;

                    //console.log(boxspace);

                    Storage.set('totaleth', totalethbal.toString());
                    Storage.set('totalbsc', totalbscbal.toString());
                    Storage.set('totalusdtbal', totalusdtbal.toString());
                    Storage.set('totalbusd', totalbusdbal.toString());
                    Storage.set('totalftm', totalftmbal.toString());

                    //Start Sockets for USD and Balance Info
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
                                var totalbals = Storage.get('totalbal');
                                var usdbalance = result.body['market_data']['current_price']['usd'] * totalbals; //* balance;
                                var currentprice = result.body['market_data']['current_price']['usd'];

                                var usdformatted = usdbalance.toFixed(3);
            
                                socket.emit("usdinfo", {dbalance: totalbals, usdbalance: usdformatted, currentprice: currentprice});

                                Storage.set('usdbal', usdformatted.toString());
                                Storage.set('currentprice', currentprice.toString());
                            } else { 
                                console.log("Error occured on price refresh before interval", result.error);
                                var usdbalance = '~';
                                var currentprice = '~';

                                Storage.set('usdbal', '~');
                                Storage.set('currentprice', '~');

                            }
                        });
                        //Get Current ETH/USD price from CoinGecko
                        unirest.get("https://api.coingecko.com/api/v3/coins/ethereum?tickers=true&market_data=true&community_data=false&developer_data=true")
                        .headers({'Accept': 'application/json'})
                        .end(function (result) {
                            if (!result.error) {
                                var totaleth = Storage.get('totaleth');
                                var ethusdbalance = result.body['market_data']['current_price']['usd'] * totaleth; //* balance;
                                var currentethprice = result.body['market_data']['current_price']['usd'];

                                var ethformatted = ethusdbalance.toFixed(3);

                                socket.emit("ethinfo", {ethbalance: totaleth, ethusdbalance: ethformatted, currentprice: currentethprice});
                                
                                Storage.set('ethbal', ethformatted.toString());
                                Storage.set('currentethprice', currentethprice.toString());
                            } else { 
                                console.log("Error occured on price refresh before interval", result.error);
                                var ethusdbalance = '~';
                                var currentethprice = '~';

                                Storage.set('ethbal', '~');
                                Storage.set('currentethprice', '~');
                            }
                        });
                        //Get Current BTC/USD price from CoinGecko
                        unirest.get("https://api.coingecko.com/api/v3/coins/bitcoin?tickers=true&market_data=true&community_data=false&developer_data=true")
                        .headers({'Accept': 'application/json'})
                        .end(function (result) {
                            if (!result.error) {
                                var totalbtc = Storage.get('totalbtcbal');
                                var btcusdbalance = result.body['market_data']['current_price']['usd'] * totalbtc; //* balance;
                                var currentbtcprice = result.body['market_data']['current_price']['usd'];

                                var btcformatted = btcusdbalance.toFixed(3);

                                socket.emit("btcinfo", {btcbalance: totalbtc, btcusdbalance: btcformatted, currentprice: currentbtcprice});
                                
                                Storage.set('usdbtcbal', btcformatted.toString());
                                Storage.set('currentbtcprice', currentbtcprice.toString());
                            } else { 
                                console.log("Error occured on price refresh before interval for BTC price", result.error);
                                var btcusdbalance = '~';
                                var currentbtcprice = '~';

                                Storage.set('usdbtcbal', '~');
                                Storage.set('currentbtcprice', '~');
                            }
                        });
                        //Get Current BSC/USD price from CoinGecko
                        unirest.get("https://api.coingecko.com/api/v3/coins/binancecoin?tickers=true&market_data=true&community_data=false&developer_data=true")
                        .headers({'Accept': 'application/json'})
                        .end(function (result) {
                            if (!result.error) {
                                var totalbsc = Storage.get('totalbsc');
                                var bscusdbalance = result.body['market_data']['current_price']['usd'] * totalbsc; //* balance;
                                var currentbscprice = result.body['market_data']['current_price']['usd'];

                                var bscformatted = bscusdbalance.toFixed(3);

                                socket.emit("bscinfo", {bscbalance: totalbsc, bscusdbalance: bscformatted, currentprice: currentbscprice});
                                
                                Storage.set('bscbal', bscformatted.toString());
                                Storage.set('currentbscprice', currentbscprice.toString());
                            } else { 
                                console.log("Error occured on price refresh before interval", result.error);
                                var bscusdbalance = '~';
                                var currentbscprice = '~';

                                Storage.set('bscbal', '~');
                                Storage.set('currentbscprice', '~');
                            }
                        });
                        //Get Current FTM/USD price from CoinGecko
                        unirest.get("https://api.coingecko.com/api/v3/coins/fantom?tickers=true&market_data=true&community_data=false&developer_data=true")
                        .headers({'Accept': 'application/json'})
                        .end(function (result) {
                            if (!result.error) {
                                var totalftm = Storage.get('totalftm');
                                var ftmusdbalance = result.body['market_data']['current_price']['usd'] * totalftm; //* balance;
                                var currentftmprice = result.body['market_data']['current_price']['usd'];

                                var ftmformatted = ftmusdbalance.toFixed(3);

                                socket.emit("ftminfo", {ftmbalance: totalftm, ftmusdbalance: ftmformatted, currentprice: currentftmprice});
                                
                                Storage.set('ftmbal', ftmformatted.toString());
                                Storage.set('currentftmprice', currentftmprice.toString());
                            } else { 
                                console.log("Error occured on price refresh before interval", result.error);
                                var ftmusdbalance = '~';
                                var currentftmprice = '~';

                                Storage.set('ftmbal', '~');
                                Storage.set('currentftmprice', '~');
                            }
                        });
                        //Get Current USDT/USD ERC20 price from 0x Uniswap
                        unirest.get("https://api.0x.org/swap/v1/quote?sellAmount=10000000&buyToken=USDC&sellToken=0xdAC17F958D2ee523a2206206994597C13D831ec7")
                        .headers({'Accept': 'application/json'})
                        .end(function (result) {
                            if (!result.error) {
                                var totalusdt = Storage.get('totalusdtbal');

                                var usdtusdbalance = result.body['price'] * totalusdt; //* balance;
                                var currentusdtprice = result.body['price'];

                                var usdtformatted = usdtusdbalance.toFixed(3);

                                socket.emit("usdtinfo", {usdtbalance: totalusdt, usdtusdbalance: usdtformatted, currentprice: currentusdtprice});
                                
                                Storage.set('usdtbal', usdtformatted.toString());
                                Storage.set('currentusdtprice', currentusdtprice.toString());

                            } else { 
                                console.log("Error occured on price refresh before interval", result.error);
                                var usdtusdbalance = '~';
                                var currentusdtprice = '~';

                                Storage.set('usdtbal', '~');
                                Storage.set('currentusdtprice', '~');
                            }
                        });
                        //Get Current BUSD/USD price from CoinGecko
                        unirest.get("https://api.coingecko.com/api/v3/coins/binance-usd?tickers=true&market_data=true&community_data=false&developer_data=true")
                        .headers({'Accept': 'application/json'})
                        .end(function (result) {
                            if (!result.error) {
                                var totalbusd = Storage.get('totalbusd');
                                var busdusdbalance = result.body['market_data']['current_price']['usd'] * totalbusd; //* balance;
                                var currentbusdprice = result.body['market_data']['current_price']['usd'];

                                var busdformatted = busdusdbalance.toFixed(3);

                                socket.emit("busdinfo", {busdbalance: totalbusd, busdusdbalance: busdformatted, currentprice: currentbusdprice});
                                
                                Storage.set('busdbal', busdformatted.toString());
                                Storage.set('currentbusdprice', currentbusdprice.toString());
                            } else { 
                                console.log("Error occured on price refresh before interval", result.error);
                                var busdusdbalance = '~';
                                var currentbusdprice = '~';

                                Storage.set('busdbal', '~');
                                Storage.set('currentbusdprice', '~');
                            }
                        });
                        var ethaddress = Storage.get('ethaddy');
                        //Get Current ERC20 TX History - ethersjs not patched yet
                        unirest.get("https://api.etherscan.io/api?module=account&action=tokentx&address="+ethaddress+"&startblock=0&endblock=999999999&sort=asc&apikey=D2Y3BZ6RNGDC3ZIGZQV3E36WVQHMXW6E8I")
                        .headers({'Accept': 'application/json'})
                        .end(function (result) {
                            if (!result.error) {
                                var erctxs = result.body.result; //* balance;

                                Storage.set('erctxs', erctxs);

                            } else { 
                                console.log("Error occured on fetching etherscan tx history", result.error);
                            }
                        });
                        //Get Current ETH TX History - ethersjs
                        unirest.get("https://api.etherscan.io/api?module=account&action=txlist&address="+ethaddress+"&startblock=0&endblock=999999999&sort=asc&apikey=YTQADVIX59Q81I873Q6ND8WVFYYQGJ7HZJ")
                        .headers({'Accept': 'application/json'})
                        .end(function (result) {
                            if (!result.error) {
                                var ethtxs = result.body.result; //* balance;
                                
                                Storage.set('ethtxs', ethtxs);

                            } else { 
                                console.log("Error occured on fetching etherscan tx history", result.error);
                            }
                        });

                        //Get Current BSC TX History
                        unirest.get("https://api.bscscan.com/api?module=account&action=txlist&address="+ethaddress+"&startblock=0&endblock=999999999&sort=asc&apikey=33KY2A4NJQN8FCSMKY2K2S3UGEPCKXTK12")
                        .headers({'Accept': 'application/json'})
                        .end(function (result) {
                            if (!result.error) {
                                var bsctxs = result.body.result; //* balance;
                                
                                Storage.set('bsctxs', bsctxs);

                            } else { 
                                console.log("Error occured on fetching etherscan tx history", result.error);
                            }
                        });
                        //Get Current BEP20 TX History - ethersjs not patched yet
                        unirest.get("https://api.bscscan.com/api?module=account&action=tokentx&address="+ethaddress+"&startblock=0&endblock=999999999&sort=asc&apikey=33KY2A4NJQN8FCSMKY2K2S3UGEPCKXTK12")
                        .headers({'Accept': 'application/json'})
                        .end(function (result) {
                            if (!result.error) {
                                var beptxs = result.body.result; //* balance;

                                Storage.set('beptxs', beptxs);

                                //console.log(beptxs);

                            } else { 
                                console.log("Error occured on fetching bscscan bep20 tx history", result.error);
                            }
                        });
                        //Get Current FTM TX History
                        unirest.get("https://api.ftmscan.com/api?module=account&action=txlist&address="+ethaddress+"&startblock=0&endblock=999999999&sort=asc&apikey=PYN2IQDF2NUKFH62I6FVEEE19DNDP3TNNW")
                        .headers({'Accept': 'application/json'})
                        .end(function (result) {
                            if (!result.error) {
                                var ftmtxs = result.body.result; //* balance;
                                
                                Storage.set('ftmtxs', ftmtxs);

                            } else { 
                                console.log("Error occured on fetching ftmscan tx history", result.error);
                            }
                        });
                        // var btcaddress = Storage.get('btcsegwitaddy');
                        // //Get BTC Balance and TX History
                        // unirest.get("https://blockchain.info/rawaddr/"+btcaddress)
                        // .headers({'Accept': 'application/json'})
                        // .end(function (result) {
                        //     if (!result.error) {
                        //         var info = result.body; // results

                        //         console.log(info);
                                
                        //         //var bal = info['final_balance'] / 1e8; //total BTC bal

                        //         var txs = info['txs']; //tx history array

                        //         //Storage.set('btctotalbal', bal);
                        //         Storage.set('btctxs', txs);

                        //     } else { 
                        //         console.log("Error occured on fetching Blockchain.info Address Data", result.error);
                        //     }
                        // });
                    });
                });

                //var totalbal1 = Storage.get('totalbal');
                var totalethbal1 = Storage.get('totaleth');
                var totalbscbal1 = Storage.get('totalbsc');
                var totalusdtbal1 = Storage.get('totalusdtbal');
                var totalbusdbal1 = Storage.get('totalbusdbal');
                var totalftmbal1 = Storage.get('totalftmbal');
                var totalbtcbal = Storage.get('totalbtcbal');
                var btctxs = Storage.get('btctxs');
                // var threebox = Storage.get('threebox');
                var qrcode1 = Storage.get('qrcode');
                var ethqrcode1 = Storage.get('ethqrcode');
                var bscqrcode1 = Storage.get('bscqrcode');
                var btcqrcode1 = Storage.get('btcqrcode');
                var ftmqrcode1 = Storage.get('ftmqrcode');
                var scripthasharray1 = Storage.get('accountarray');
                var ethaddress = Storage.get('ethaddy');
                var bscaddress = Storage.get('ethaddy');
                var ftmaddress = Storage.get('ethaddy');
                var btcaddress = Storage.get('btcsegwitaddy');
                var usdbalance = Storage.get('usdbal');
                var usdbtcbalance = Storage.get('usdbtcbal');
                var currentprice = Storage.get('currentprice');
                var ethbal = Storage.get('ethbal');
                var bscbal = Storage.get('bscbal');
                var usdtbal = Storage.get('usdtbal');
                var busdbal = Storage.get('busdbal');
                var ftmbal = Storage.get('ftmbal');
                var currentethprice = Storage.get('currentethprice');
                var currentbscprice = Storage.get('currentbscprice');
                var currentusdtprice = Storage.get('currentusdtprice');
                var currentbusdprice = Storage.get('currentbusdprice');
                var currentftmprice = Storage.get('currentftmprice');
                var currentbtcprice = Storage.get('currentbtcprice');
                var unbalance = Storage.get('unconf');
                var newblock = Storage.get('newblock');
                // var osname = Storage.get('osname');
                // var arch = Storage.get('arch');
                // var kernel = Storage.get('kernel');
                // var platform = Storage.get('platform');
                // var hostname = Storage.get('hostname');
                // var release = Storage.get('release');
                var erctxs = Storage.get('erctxs');
                var ethtxs = Storage.get('ethtxs');
                var bsctxs = Storage.get('bsctxs');
                var beptxs = Storage.get('beptxs');
                var ftmtxs = Storage.get('ftmtxs');


                //Render the page with the dynamic variables
                res.render('simple/dashboard', {
                    title: 'Core Mode Dashboard',
                    qrcode: qrcode1,
                    ethqrcode: ethqrcode1,
                    bscqrcode: bscqrcode1,
                    btcqrcode: btcqrcode1,
                    ftmqrcode: ftmqrcode1,
                    totalbal: totalbal,
                    totalbtcbal: totalbtcbal,
                    totalethbal: totalethbal1,
                    totalbscbal: totalbscbal1,
                    totalusdtbal: totalusdtbal1,
                    totalbusdbal: totalbusdbal1,
                    totalftmbal: totalftmbal1,
                    mainaddy: mainaddy,
                    btcaddress: btcaddress,
                    ethaddress: ethaddress,
                    usdbalance: usdbalance,
                    usdbtcbalance: usdbtcbalance,
                    ethbalance: ethbal,
                    usdtbalance: usdtbal,
                    bscbalance: bscbal,
                    busdbalance: busdbal,
                    ftmbalance: ftmbal,
                    currentprice: currentprice,
                    currentethprice: currentethprice,
                    currentbscprice: currentbscprice,
                    currentusdtprice: currentusdtprice,
                    currentbtcprice: currentbtcprice,
                    currentbusdprice: currentbusdprice,
                    currentftmprice: currentftmprice,
                    newblock: newblock,
                    unbalance: unbalance,
                    balancearray: scripthasharray,
                    dtxs: denariustxs,
                    utxos: denariusutxos,
                    erctxs: erctxs,
                    ethtxs: ethtxs,
                    bsctxs: bsctxs,
                    beptxs: beptxs,
                    ftmtxs: ftmtxs,
                    btctxs: bitcointxs,
                    btcutxos: bitcoinutxos,
                    btcmemtxs: bitcoinmem,
                    ethaddy: ethaddress,
                    ftmaddy: ftmaddress,
                    bscaddy: bscaddress
                }, (err, html) => {
                    res.end(html + '\n');
                });
            });
        });
};
    