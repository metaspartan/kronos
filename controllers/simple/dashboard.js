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
const PromiseLoadingSpinner = require('promise-loading-spinner');
const main = require('progressbar.js');
const ethers = require('ethers');


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
//Get information
exports.simpleindex = (req, res) => {

    // //Promises Loading Indicator
    // const loader = new PromiseLoadingSpinner({
    //     // options
    //     loaderElement: '#js-page-loader',
    // });

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
    
    let socket_id = [];
    let socket_id2 = [];
    let socket_id3 = [];
    let socket_id4 = [];
    let socket_id5 = [];
    let socket_id6 = [];
    let socket_id7 = [];
    let socket_id33 = [];
    let socket_id34 = [];

    var mnemonic;
    var ps;
    let seedaddresses = [];
    let store = [];

    var passsworddb = Storage.get('password');
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

    let provider2 = new ethers.providers.CloudflareProvider();

    var decryptedmnemonic = decrypt(seedphrasedb);
    mnemonic = decryptedmnemonic;
    const ethwallet = ethers.Wallet.fromMnemonic(mnemonic); //Generate wallet from our Kronos seed
    let ethwalletp = ethwallet.connect(provider); //Set wallet provider
    const ariAddress = "0x8A8b5318d3A59fa6D1d0A83A1B0506f2796b5670"; // 0x8A8b5318d3A59fa6D1d0A83A1B0506f2796b5670 Denarii (ARI)
    const ariAbi = [
    // Some details about Denarii ERC20 ABI
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function balanceOf(address) view returns (uint)",
    "function transfer(address to, uint amount)",
    "event Transfer(address indexed from, address indexed to, uint amount)"
    ];
    const ariContract = new ethers.Contract(ariAddress, ariAbi, provider);

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
                try {
                    provider2.getBlock(blockNumber).then((block) => {
                        let blockhash = block.hash;
                        //console.log(blockhash);
                        socket.emit("newblocketh", {ethblock: ethblock, ethhash: blockhash});
                    }).catch((e) => {
                        console.log(e);
                    });
                }
                catch(e) {
                    console.log('Catch an error: ', e)
                }
            });
        } catch(e) {
            console.log(e);
        }
        // ariContract.on(ethwalletp.address, (balance) => {
        //     console.log('New ARI Balance: ' + balance);
        //     socket.emit("newaribal", {aribal: balance});
        // });
    });

    // Grab ETH and ARI balances in realtime (every 15s)
    res.io.on('connection', function (socket) {
        socket_id34.push(socket.id);
        if (socket_id34[0] === socket.id) {
        res.io.removeAllListeners('connection'); 
        }
        const ethWalletBal = async () => {
            let ethbalance = await provider.getBalance(ethwalletp.address);
            let ethbalformatted = ethers.utils.formatEther(ethbalance); //ethers.utils.formatUnits(ethbalance, 18);
            Storage.set('totalethbal', JSON.parse(ethbalformatted).toString());
            socket.emit("newethbal", {ethbal: JSON.parse(ethbalformatted)});
        }
        ethWalletBal();
        setInterval(function(){ 
            ethWalletBal();
        }, 15000);
    });

    res.io.on('connection', function (socket) {
        socket_id5.push(socket.id);
        if (socket_id5[0] === socket.id) {
        res.io.removeAllListeners('connection'); 
        }
        const ariWalletBal = async () => {
            let aribalance = await ariContract.balanceOf(ethwalletp.address);
            let aribalformatted = ethers.utils.formatUnits(aribalance, 8);
            Storage.set('totalaribal', JSON.parse(aribalformatted).toString());
            socket.emit("newaribal", {aribal: parseFloat(aribalformatted)});
        }
        ariWalletBal();
        setInterval(function(){ 
            ariWalletBal();
        }, 15000);
    });
    
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

        Storage.set('osname', osname);
        Storage.set('kernel', kernel);
        Storage.set('platform', platform);
        Storage.set('release', release);
        Storage.set('hostname', hostname);
        Storage.set('arch', arch);

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

        var decryptedpass = decrypt(passsworddb);
        ps = decryptedpass;

        var decryptedmnemonic = decrypt(seedphrasedb);
        mnemonic = decryptedmnemonic;


        //Convert our mnemonic seed phrase to BIP39 Seed Buffer 
        const seed = bip39.mnemonicToSeedSync(mnemonic); //No pass included to keep Coinomi styled seed
        
        // BIP32 From BIP39 Seed
        const root = bip32.fromSeed(seed);

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

        //Get 1 Address from the derived mnemonic
        const addressPath0 = `m/44'/116'/0'/0/0`;

        // Get the keypair from the address derivation path
        const addressKeypair0 = root.derivePath(addressPath0);

        // Get the p2pkh base58 public address of the keypair
        const p2pkhaddy0 = denarius.payments.p2pkh({ pubkey: addressKeypair0.publicKey, network }).address;

        const p2pkaddy = denarius.payments.p2pkh({ pubkey: addressKeypair0.publicKey, network }).pubkey.toString('hex');
        
        Storage.set('mainaddress', p2pkhaddy0);
        Storage.set('p2pkaddress', p2pkaddy);

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

        res.io.on('connection', function (socket) {
            socket_id6.push(socket.id);
            if (socket_id6[0] === socket.id) {
            res.io.removeAllListeners('connection'); 
            }
            const dWalletBal = async () => {
                // Initialize an electrum cluster where 1 out of 2 out of the 4 needs to be consistent, polled randomly with fail-over.
                const electrum = new ElectrumCluster('Kronos Core Mode D Balance', '1.4.1', 1, 2, ElectrumCluster.ORDER.RANDOM);
                
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
                console.log('Error Generating QR for Main Address');
            }
            //Store the qrcode for rendering retrieval
            Storage.set('ethqrcode', ethqrcode);
        });
        Storage.set('ethaddy', ethwalletp.address);

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
                const electrum = new ElectrumCluster('Kronos Core Mode Balances', '1.4.1', 1, 2, ElectrumCluster.ORDER.RANDOM);
                
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
                const electrum = new ElectrumCluster('Kronos Core Mode Unconfirmed Balances', '1.4.1', 1, 2, ElectrumCluster.ORDER.RANDOM);
                
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
                const electrum = new ElectrumCluster('Kronos Core Mode TX History', '1.4.1', 1, 2, ElectrumCluster.ORDER.RANDOM);
                
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
                const gethistory1 = await electrum.request('blockchain.scripthash.get_history', scripthash);

                const gethistory2 = await electrum.request('blockchain.scripthash.get_history', scripthashp2pk);

                const txs = gethistory1.concat(gethistory2);

                //console.log('Transactions', txs);

                //await electrum.disconnect();
                await electrum.shutdown();

                return txs;
                } catch (e) {
                    console.log('TX Error', e);
                }

                //await electrum.disconnect();
                // await electrum.shutdown();

                // return txs;
            }

            //Grab UTXO Transaction History from D ElectrumX
            const utxohistory = async () => {
                // Initialize an electrum cluster where 1 out of 2 out of the 4 needs to be consistent, polled randomly with fail-over.
                const electrum = new ElectrumCluster('Kronos Core Mode UTXO History', '1.4.1', 1, 2, ElectrumCluster.ORDER.RANDOM);
                
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

                const getuhistory1 = await electrum.request('blockchain.scripthash.listunspent', scripthash);

                const getuhistory2 = await electrum.request('blockchain.scripthash.listunspent', scripthashp2pk);

                const utxos = getuhistory1.concat(getuhistory2);

                //await electrum.disconnect();
                await electrum.shutdown();

                return utxos;
                } catch (e) {
                    console.log('UTXO Error', e);
                }
            }

            promises.push(new Promise((res, rej) => {
                    scripthasha().then(globalData => {
                    scripthashb().then(globalData2 => {
                    txhistoryfull().then(TXHistory => {
                    utxohistory().then(UTXOHistory => {

                        scripthasharray.push({balance: globalData, unconfirmedbal: globalData2, txs: TXHistory, utxos: UTXOHistory});
                        res({globalData, globalData2, TXHistory, UTXOHistory});

                    });
                    });
                    });
                    });
            }));

        });

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

        const ariWalletBal = async () => {        
            //let signer = provider.getSigner(0);
    
            const ethwallet = ethers.Wallet.fromMnemonic(mnemonic); //Generate wallet from our Kronos seed
    
            // provider.getBlockNumber().then((blockNumber) => {
            //     console.log("Current ETH block number: " + blockNumber);
            // });
    
            let ethwalletp = ethwallet.connect(provider2); //Set wallet provider

            //let ethbalance = await provider.getBalance(ethwalletp.address);
    
            // You can also use an ENS name for the contract address
            const ariAddress = "0x8A8b5318d3A59fa6D1d0A83A1B0506f2796b5670"; // 0x8A8b5318d3A59fa6D1d0A83A1B0506f2796b5670 Denarii (ARI)
            const ariAbi = [
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
            const ariContract = new ethers.Contract(ariAddress, ariAbi, provider2);
    
            // // // Get the ERC-20 token name
            // ariContract.name().then((result) => {
            //     console.log("Name: " + result);
            // });
    
            // // Get the ERC-20 token symbol (for tickers and UIs)
            // ariContract.symbol()
    
            // Get the balance of an address
            let aribalance = await ariContract.balanceOf(ethwalletp.address)
            // ethers.utils.formatUnits(aribalance, 8); // 8 decimals for ARI

            let aribalformatted = ethers.utils.formatUnits(aribalance, 8);
    
            //console.log(formattedethbal);
            //console.log("ARI Address: ", ethwalletp.address);

            return parseFloat(aribalformatted);
        }

        // const ethWalletTX = async () => {
        //     const ethwallet = ethers.Wallet.fromMnemonic(mnemonic); //Generate wallet from our Kronos seed
    
        //     let ethwalletp = ethwallet.connect(provider); //Set wallet provider

        //     let etherscanProvider = new ethers.providers.EtherscanProvider(ethnetworktype);

        //     let transactionhistory = await etherscanProvider.getHistory(ethwalletp.address);
        //     let ethtxarray = [];

        //     transactionhistory.forEach((tx) => {
        //         ethtxarray.push(tx);
        //     });

        //     return ethtxarray;
        // }

        // const ariWalletTX = async () => {
        //     const ethwallet = ethers.Wallet.fromMnemonic(mnemonic); //Generate wallet from our Kronos seed
    
        //     let ethwalletp = ethwallet.connect(provider); //Set wallet provider

        //     let etherscanProvider = new ethers.providers.EtherscanProvider(ethnetworktype);

        //     const ariAddress = "0x8A8b5318d3A59fa6D1d0A83A1B0506f2796b5670"; // 0x8A8b5318d3A59fa6D1d0A83A1B0506f2796b5670 Denarii (ARI)
        //     const ariAbi = [
        //     // Some details about the token
        //     "function name() view returns (string)",
        //     "function symbol() view returns (string)",
        //     "function balanceOf(address) view returns (uint)",
        //     "function transfer(address to, uint amount)",
        //     "event Transfer(address indexed from, address indexed to, uint amount)"
        //     ];
        //     const ariContract = new ethers.Contract(ariAddress, ariAbi, ethwalletp);

        //     let transactionhistory = await etherscanProvider.tokenTx(ethwalletp.address); //WIP Alpha
        //     //http://api.etherscan.io/api?module=account&action=tokentx&address=0x8A8b5318d3A59fa6D1d0A83A1B0506f2796b5670&startblock=0&endblock=999999999&sort=asc&apikey=JMBXKNZRZYDD439WT95P2JYI72827M4HHR

        //     let aritxarray = [];

        //     transactionhistory.forEach((tx) => {
        //         aritxarray.push(tx);
        //     });

        //     return aritxarray;
        // }

        // const BoxProfile = async () => {
        //     const ethwallet = ethers.Wallet.fromMnemonic(mnemonic); //Wallet from our Kronos seed        
        //     let ethwalletp = ethwallet.connect(provider); //Set wallet provider

        //     //3Box Profile
        //     const profile = await ThreeBox.getProfile(ethwalletp.address);
        //     var profileimage;

        //     //console.log(profileimage);

        //     if (typeof profile.image == 'undefined') {
        //         profileimage = profile.image;
        //         console.log(profileimage);
        //         var boximage = '';
        //         if (typeof profileimage == 'undefined') {
        //             boximage = '../img/avatar.png'; //IPFS Default Avatar Hash
        //         } else {
        //             profileimage = profile.image[0].contentUrl['/'];
        //             boximage = 'https://cloudflare-ipfs.com/ipfs/' + profileimage;
        //         }
        //         //console.log(boximage);

        //         return boximage;

        //     } else {
        //         profileimage = profile.image[0].contentUrl['/'];
        //         console.log(profileimage);
        //         var boximage = '';
        //         if (typeof profileimage == 'undefined') {
        //             boximage = '../img/avatar.png'; //IPFS Default Avatar Hash
        //         } else {
        //             profileimage = profile.image[0].contentUrl['/'];
        //             boximage = 'https://cloudflare-ipfs.com/ipfs/' + profileimage;
        //         }
        //         //console.log(boximage);

        //         return boximage;
        //     }
        // }

        // const SetupBoxSpace = async () => {
        //     const ethwallet = ethers.Wallet.fromMnemonic(mnemonic); //Wallet from our Kronos seed        
        //     let ethwalletp = ethwallet.connect(provider); //Set wallet provider

        //     var thebox = await ThreeBox.openBox(ethwalletp.address, provider);

        //     //await thebox.syncDone;

        //     //const chatSpace = await thebox.openSpace('Kronos');

        //     //const thread = await chatSpace.joinThread('Kronos v1.7.0');

        //     return thebox;
        // }

        promises2.push(new Promise((res, rej) => {
            ethWalletBal().then(ethWalletBal => {
            ariWalletBal().then(ariWalletBal => {
            // BoxProfile().then(threeboxprofile => {

                ethereumarray.push({ethbal: ethWalletBal, aribal: ariWalletBal});
                res({ethWalletBal, ariWalletBal});

            // });
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
                Storage.set('totalbal', totalbal.toString());
                Storage.set('accountarray', scripthasharray);
                let denariusutxos = scripthasharray[0].utxos;
                let denariustxs = scripthasharray[0].txs;
                Storage.set('dutxo', denariusutxos);

                // Get Total Unconfirmed Balances of all derived addresses
                var totalunbal;
                scripthasharray.forEach(function (itemun, index) {
                    totalunbal += itemun.unconfirmedbal;
                });

                Storage.set('unconf', totalunbal.toString());

                Promise.all(promises2).then((values) => {

                    // Get Total Balances of all derived addresses
                    var totalethbal = 0;
                    var totalaribal = 0;
                    // var threebox;
                    //var boxspace;

                    totalethbal = ethereumarray[0].ethbal;
                    totalaribal = ethereumarray[0].aribal;
                    // threebox = ethereumarray[0].boxprofile;
                    //boxspace = ethereumarray[0].boxspace;

                    //console.log(boxspace);

                    Storage.set('totaleth', totalethbal.toString());
                    Storage.set('totalaribal', totalaribal.toString());

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
                        //Get Current ARI/USD price from 0x Uniswap
                        unirest.get("https://api.0x.org/swap/v1/quote?sellAmount=10000000&buyToken=USDC&sellToken=0x8a8b5318d3a59fa6d1d0a83a1b0506f2796b5670")
                        .headers({'Accept': 'application/json'})
                        .end(function (result) {
                            if (!result.error) {
                                var totalari = Storage.get('totalaribal');
                                var ariusdbalance = result.body['price'] * totalari; //* balance;
                                var currentariprice = result.body['price'];

                                var ariformatted = ariusdbalance.toFixed(3);

                                socket.emit("ariinfo", {aribalance: totalari, ariusdbalance: ariformatted, currentprice: currentariprice});
                                
                                Storage.set('aribal', ariformatted.toString());
                                Storage.set('currentariprice', currentariprice.toString());

                            } else { 
                                console.log("Error occured on price refresh before interval", result.error);
                                var ariusdbalance = '~';
                                var currentariprice = '~';

                                Storage.set('aribal', '~');
                                Storage.set('currentariprice', '~');
                            }
                        });
                        var ethaddress = Storage.get('ethaddy');
                        //Get Current ERC20 TX History - ethersjs not patched yet
                        unirest.get("http://api.etherscan.io/api?module=account&action=tokentx&address="+ethaddress+"&startblock=0&endblock=999999999&sort=asc&apikey=D2Y3BZ6RNGDC3ZIGZQV3E36WVQHMXW6E8I")
                        .headers({'Accept': 'application/json'})
                        .end(function (result) {
                            if (!result.error) {
                                //var totalari = Storage.get('totalaribal');
                                var erctxs = result.body.result; //* balance;

                                Storage.set('erctxs', erctxs.toString());
                                //Storage.set('currentariprice', currentariprice);

                            } else { 
                                console.log("Error occured on fetching etherscan tx history", result.error);
                                //var ariusdbalance = '~';
                                //var currentariprice = '~';

                                //Storage.set('aribal', '~');
                                //Storage.set('currentariprice', '~');
                            }
                        });
                        //Get Current ETH TX History - ethersjs
                        unirest.get("http://api.etherscan.io/api?module=account&action=txlist&address="+ethaddress+"&startblock=0&endblock=999999999&sort=asc&apikey=YTQADVIX59Q81I873Q6ND8WVFYYQGJ7HZJ")
                        .headers({'Accept': 'application/json'})
                        .end(function (result) {
                            if (!result.error) {
                                //var totalari = Storage.get('totalaribal');
                                var ethtxs = result.body.result; //* balance;
                                
                                Storage.set('ethtxs', ethtxs.toString());
                                //Storage.set('currentariprice', currentariprice);

                            } else { 
                                console.log("Error occured on fetching etherscan tx history", result.error);
                                //var ariusdbalance = '~';
                                //var currentariprice = '~';

                                //Storage.set('aribal', '~');
                                //Storage.set('currentariprice', '~');
                            }
                        });
                    });
                });

                //var totalbal1 = Storage.get('totalbal');
                var totalethbal1 = Storage.get('totaleth');
                var totalaribal1 = Storage.get('totalaribal');
                // var threebox = Storage.get('threebox');
                var qrcode1 = Storage.get('qrcode');
                var ethqrcode1 = Storage.get('ethqrcode');
                var scripthasharray1 = Storage.get('accountarray');
                var ethaddress = Storage.get('ethaddy');
                var usdbalance = Storage.get('usdbal');
                var currentprice = Storage.get('currentprice');
                var ethbal = Storage.get('ethbal');
                var aribal = Storage.get('aribal');
                var currentethprice = Storage.get('currentethprice');
                var currentariprice = Storage.get('currentariprice');
                var unbalance = Storage.get('unconf');
                var newblock = Storage.get('newblock');
                var osname = Storage.get('osname');
                var arch = Storage.get('arch');
                var kernel = Storage.get('kernel');
                var platform = Storage.get('platform');
                var hostname = Storage.get('hostname');
                var release = Storage.get('release');
                var erctxs = Storage.get('erctxs');
                var ethtxs = Storage.get('ethtxs');


                //Render the page with the dynamic variables
                res.render('simple/dashboard', {
                    title: 'Core Mode Dashboard',
                    qrcode: qrcode1,
                    ethqrcode: ethqrcode1,
                    totalbal: totalbal,
                    totalethbal: totalethbal1,
                    totalaribal: totalaribal1,
                    mainaddy: mainaddy,
                    ethaddress: ethaddress,
                    usdbalance: usdbalance,
                    ethbalance: ethbal,
                    aribalance: aribal,
                    currentprice: currentprice,
                    currentethprice: currentethprice,
                    currentariprice: currentariprice,
                    newblock: newblock,
                    unbalance: unbalance,
                    balancearray: scripthasharray,
                    dtxs: denariustxs,
                    utxos: denariusutxos,
                    erctxs: erctxs,
                    ethtxs: ethtxs,
                    ethaddy: ethaddress,
                    osname: osname,
                    arch: arch,
                    kernel: kernel,
                    platform: platform,
                    hostname: hostname,
                    release: release
                }, (err, html) => {
                    res.end(html + '\n');
                });
            });
        });
};
    