/*
**************************************
**************************************
**************************************
* Kronos Simple Mode Dashboard Controller
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

//Get information
//Get information
exports.simpleindex = (req, res) => {

    const ip = require('ip');
    const ipaddy = ip.address();
    
    res.locals.lanip = ipaddy;
    
    const scripthasharray = [];
    const transactionhistoryarray = [];
    const utxoarray = [];
    const promises = [];
  
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
    });
    
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

    var mnemonic;
    var ps;
    let seedaddresses = [];
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

        //Convert our mnemonic seed phrase to BIP39 Seed Buffer 
        const seed = bip39.mnemonicToSeedSync(mnemonic, ps);
        
        // BIP32 From BIP39 Seed
        const root = bip32.fromSeed(seed);

        // Get XPUB from BIP32
        const xpub = root.neutered().toBase58();

        const addresscount = 21; // 20 Addresses Generated

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

        //Get 10 Addresses from the derived mnemonic
        const addressPath0 = `m/44'/116'/0'/0/0`;

        // Get the keypair from the address derivation path
        const addressKeypair0 = root.derivePath(addressPath0);

        // Get the p2pkh base58 public address of the keypair
        const p2pkhaddy0 = denarius.payments.p2pkh({ pubkey: addressKeypair0.publicKey, network }).address;
        
        Storage.set('mainaddress', p2pkhaddy0);

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

        //console.log(seedaddresses);

        var mainaddy = Storage.get('mainaddress');

        QRCode.toDataURL(mainaddy, { color: { dark: '#000000FF', light:"#777777FF" } }, function(err, qrcode) {

        //console.log(mainaddy);

        seedaddresses.forEach(function (item, index) {

            var daddress0 = item.address;

            //console.log(xpub);

            //var xprivkk = root.toBase58();

            //var xpubkk = xpub;

            //NEED TO GET ADDRESSES

            //Convert P2PKH Address to Scripthash for ElectrumX Balance Fetching
            const bytes = bs58.decode(daddress0);
            const byteshex = bytes.toString('hex');
            const remove00 = byteshex.substring(2);
            const removechecksum = remove00.substring(0, remove00.length-8);
            const HASH160 = "76A914" + removechecksum.toUpperCase() + "88AC";
            const BUFFHASH160 = Buffer.from(HASH160, "hex");
            const shaaddress = sha256(BUFFHASH160);

            //Convert P2PK Address to Scripthash for ElectrumX Balance Fetching
            //Convert XPUB to Compressed Pubkey
            // const XPUBTOBASE = bs58.decode(xpubkk);
            // const XPUBBYTESTOHEX = XPUBTOBASE.toString('hex');
            // //console.log(XPUBBYTESTOHEX); // 164
            // const xpubtopub = XPUBBYTESTOHEX.substring(90, XPUBBYTESTOHEX.length - 8); // Decoded Base58 XPub to last 33 bytes (privkey 32 bytes)
            //console.log("IS THIS THE COMPRESSED PUBKEY?" + xpubtopub);
            const xpubtopub = item.p2pk;
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

            //End P2PKH and P2PK Scripthash calculations for Electrum and start Electrum

            const scripthasha = async () => {
                // Initialize an electrum cluster where 1 out of 2 out of the 4 needs to be consistent, polled randomly with fail-over.
                const electrum = new ElectrumCluster('Kronos Simple Mode Balances', '1.4.1', 1, 2, ElectrumCluster.ORDER.RANDOM);
                
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

                const balanceformatted = balancescripthash.confirmed;

                const p2pkbalanceformatted = p2pkbalancescripthash.confirmed;

                const balancefinal = balanceformatted / 100000000;

                const p2pkbalancefinal = p2pkbalanceformatted / 100000000;

                const addedbalance = balancefinal + p2pkbalancefinal;

                //await electrum.disconnect();
                await electrum.shutdown();

                return addedbalance;
            }

            const scripthashb = async () => {
                // Initialize an electrum cluster where 1 out of 2 out of the 4 needs to be consistent, polled randomly with fail-over.
                const electrum = new ElectrumCluster('Kronos Simple Mode Unconfirmed Balances', '1.4.1', 1, 2, ElectrumCluster.ORDER.RANDOM);
                
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
                const electrum = new ElectrumCluster('Kronos Simple Mode TX History', '1.4.1', 1, 2, ElectrumCluster.ORDER.RANDOM);
                
                // Add some servers to the cluster.
                electrum.addServer(delectrumxhost1);
                electrum.addServer(delectrumxhost2);
                electrum.addServer(delectrumxhost3);
                electrum.addServer(delectrumxhost4);
                
                // Wait for enough connections to be available.
                await electrum.ready();
                
                // Request the balance of the requested Scripthash D address

                const txs = [];

                const gethistory1 = await electrum.request('blockchain.scripthash.get_history', scripthash);

                const gethistory2 = await electrum.request('blockchain.scripthash.get_history', scripthashp2pk);

                //console.log(gethistory1);
                //console.log(gethistory2);

                // const history1formatted = gethistory1[0].tx_hash;

                // const histoy2formatted = gethistory2[0].tx_hash;

                // const history1height = gethistory1[0].height;

                // const histoy2height = gethistory2[0].height;

                const fullhistory = txs.push({p2pkhtxs: gethistory1, p2pktxs: gethistory2, });

                //const p2pkbalancefinal = p2pkbalanceformatted / 100000000;

                //const addedbalance = balancefinal + p2pkbalancefinal;

                //await electrum.disconnect();
                await electrum.shutdown();

                return txs;
            }

            //Grab UTXO Transaction History from D ElectrumX
            const utxohistory = async () => {
                // Initialize an electrum cluster where 1 out of 2 out of the 4 needs to be consistent, polled randomly with fail-over.
                const electrum = new ElectrumCluster('Kronos Simple Mode UTXO History', '1.4.1', 1, 2, ElectrumCluster.ORDER.RANDOM);
                
                // Add some servers to the cluster.
                electrum.addServer(delectrumxhost1);
                electrum.addServer(delectrumxhost2);
                electrum.addServer(delectrumxhost3);
                electrum.addServer(delectrumxhost4);
                
                // Wait for enough connections to be available.
                await electrum.ready();
                
                // Request the balance of the requested Scripthash D address

                const utxos = [];

                const getuhistory1 = await electrum.request('blockchain.scripthash.listunspent', scripthash);

                const getuhistory2 = await electrum.request('blockchain.scripthash.listunspent', scripthashp2pk);

                //console.log(getuhistory1);
                //console.log(getuhistory2);

                // const history1formatted = gethistory1[0].tx_hash;

                // const histoy2formatted = gethistory2[0].tx_hash;

                // const history1height = gethistory1[0].height;

                // const histoy2height = gethistory2[0].height;

                const fullutxohistory = utxos.push({p2pkhutxos: getuhistory1, p2pkutxos: getuhistory2, });

                //const p2pkbalancefinal = p2pkbalanceformatted / 100000000;

                //const addedbalance = balancefinal + p2pkbalancefinal;

                //await electrum.disconnect();
                await electrum.shutdown();

                return utxos;
            }

            const qrcodeasync = async () => {
                const qrcoded = await QRCode.toDataURL(daddress0, { color: { dark: '#000000FF', light:"#333333FF" } });

                //console.log(qrcoded)

                return qrcoded;
            }

            promises.push(new Promise((res, rej) => {
                qrcodeasync().then(qrcodedata => {
                    scripthasha().then(globalData => {
                    scripthashb().then(globalData2 => {
                    txhistoryfull().then(TXHistory => {
                    utxohistory().then(UTXOHistory => {
                    
                    scripthasharray.push({address: daddress0, qr: qrcodedata, p2pkh: removechecksum, p2pk: xpubtopub, balance: globalData, unconfirmedbal: globalData2, txs: TXHistory, utxos: UTXOHistory});
                    res({daddress0, qrcodedata, removechecksum, xpubtopub, globalData, TXHistory, UTXOHistory});

                });
            });
            });
            });
            });
            }) );
        });
        
    
        //QRCode.toDataURL(qr, { color: { dark: '#000000FF', light:"#777777FF" } }, function(err, qrcode) {
    
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
    
            // if (blockheight >= 0 && cryptoidblocks >= 0) {
            //     var blockpercent = blockheight / cryptoidblocks;
            //     var blockpercc = blockheight / cryptoidblocks * 100;
            //     var blockperc = blockpercc.toFixed(2);
            // }

            Promise.all(promises).then((values) => {

                // Get Total Balances of all derived addresses
                var totalbal = 0;
                scripthasharray.forEach(function (item, index) {
                    totalbal += item.balance;
                });
                //console.log(totalbal);
                Storage.set('totalbal', totalbal);

                // Get Total Unconfirmed Balances of all derived addresses
                var totalunbal = 0;
                scripthasharray.forEach(function (itemun, index) {
                    totalunbal += itemun.unconfirmedbal;
                });
                //console.log(totalunbal);

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
        
                            var usdbalance = result.body['market_data']['current_price']['usd'] * totalbal; //* balance;
                            var currentprice = result.body['market_data']['current_price']['usd'];
                            
                            res.locals.usdbalance = usdbalance;
                            res.locals.currentprice = currentprice;
                            res.locals.dbalance = totalbal;
        
                            socket.emit("usdinfo", {dbalance: totalbal, unbal: totalunbal, usdbalance: usdbalance, currentprice: currentprice});
                        } else { 
                            console.log("Error occured on price refresh before interval", result.error);
                            var usdbalance = '~';
                            var currentprice = '~';
                            res.locals.usdbalance = usdbalance;
                            res.locals.currentprice = currentprice;
                            socket.emit("usdinfo", {dbalance: totalbal, unbal: totalunbal, usdbalance: usdbalance, currentprice: currentprice});
                        }
                    });
                });
                
                //console.log(scripthasharray);

            //Render the page with the dynamic variables
            res.render('simple/dashboard', {
                title: 'Simple Mode Dashboard',
                qrcode: qrcode,
                totalbal: totalbal,
                seedphrase: store,
                balancearray: scripthasharray
                //balance: balance
                });
            });
        });
        });
    });
    });
    };