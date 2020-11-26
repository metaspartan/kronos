/*
**************************************
**************************************
**************************************
* Kronos Core Mode D Transaction Controller
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

//ElectrumX Hosts for Denarius
const delectrumxhost1 = 'electrumx1.denarius.pro';
const delectrumxhost2 = 'electrumx2.denarius.pro';
const delectrumxhost3 = 'electrumx3.denarius.pro';
const delectrumxhost4 = 'electrumx4.denarius.pro';

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
    var totalaribal = Storage.get('totalaribal');
    var ethaddress = Storage.get('ethaddy');

    res.render('simple/getethsend', {
        totalethbal: totalethbal,
        totalbal: totalbal,
        totalaribal: totalaribal,
        ethaddress: ethaddress
    });

};

//Get Send ARI
exports.getarisend = (req, res) => {

    const ip = require('ip');
    const ipaddy = ip.address();
  
    res.locals.lanip = ipaddy;

    var totalethbal = Storage.get('totaleth');
    var totalbal = Storage.get('totalbal');
    var totalaribal = Storage.get('totalaribal');
    var ethaddress = Storage.get('ethaddy');

    res.render('simple/getarisend', {
        totalethbal: totalethbal,
        totalbal: totalbal,
        totalaribal: totalaribal,
        ethaddress: ethaddress
    });

};

//Get UTXOs to be able to send from and render UI
exports.getsend = (req, res) => {

    const ip = require('ip');
    const ipaddy = ip.address();
  
    res.locals.lanip = ipaddy;

    let totalethbal = Storage.get('totaleth');
    let totalbal = Storage.get('totalbal');
    let totalaribal = Storage.get('totalaribal');
    //let utxos = Storage.get('dutxo');
    var ethaddress = Storage.get('ethaddy');
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
        const getuhistory1 = await electrum.request('blockchain.scripthash.listunspent', scripthash);

        const getuhistory2 = await electrum.request('blockchain.scripthash.listunspent', scripthashp2pk);

        const utxos = getuhistory1.concat(getuhistory2);

        await electrum.shutdown();

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
        
            res.render('simple/getsend', {
                utxos: utxos,
                utxocount: utxocount,
                totalsendable: totalVal,
                totalethbal: totalethbal,
                totalbal: totalbal,
                totalaribal: totalaribal,
                ethaddress: ethaddress,
                mainaddress: mainaddress
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
    var totalaribal = Storage.get('totalaribal');
    var ethaddress = Storage.get('ethaddy');
    var mainaddress = Storage.get('mainaddress');

    res.render('simple/chat', {
        totalethbal: totalethbal,
        totalbal: totalbal,
        totalaribal: totalaribal,
        ethaddress: ethaddress,
        mainaddress: mainaddress
    });

};

//POST the UTXO selected and create and sign raw transaction for sending
exports.postcreate = (req, res) => {
    var selectedutxo = req.body.UTXO;
    var fee = 0.00001;
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
            const electrum = new ElectrumCluster('Kronos Core Mode Transaction', '1.4.1', 1, 2, ElectrumCluster.ORDER.RANDOM);
            
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
    var fee = 0.00001;
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
    var thefees = numutxo * 10000;
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
        var denariifees = numutxo * 10000;
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
            const electrum = new ElectrumCluster('Kronos Core Mode Transaction', '1.4.1', 1, 2, ElectrumCluster.ORDER.RANDOM);
            
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

exports.postethsend = (req, res) => {
    var gasfee = req.body.gasfeer; //21000 Gas Limit * 31 Gwei Fee = 0.000651 ETH
    var sendtoaddress = req.body.sendaddress;
    var amount = req.body.amount;
    var totalethbal = Storage.get('totaleth');
    var transferamount = ethers.utils.parseEther(amount);

    var gasandamount = amount + gasfee;

    let totalcalcbale = totalethbal - gasandamount;

    var valid = ETHValidator.validate(`${sendtoaddress}`, 'ETH');

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

    if (valid) {

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


exports.postarisend = (req, res) => {
    var gasfee = req.body.gasfeer; //21000 Gas Limit * 31 Gwei Fee = 0.000651 ETH
    var gwei = req.body.gasfeeg;
    var sendtoaddress = req.body.sendaddress;
    var amount = req.body.amount;
    var totalethbal = Storage.get('totaleth');
    var totalaribal = Storage.get('totalaribal');
    var transferamount = ethers.utils.parseUnits(amount, 8);
    const ariAddress = "0x8A8b5318d3A59fa6D1d0A83A1B0506f2796b5670"; // 0x8A8b5318d3A59fa6D1d0A83A1B0506f2796b5670 Denarii (ARI)

    var valid = ETHValidator.validate(`${sendtoaddress}`, 'ETH');

    var seedphrasedb = Storage.get('seed');
    var decryptedmnemonic = decrypt(seedphrasedb);
    mnemonic = decryptedmnemonic;
    let ethwallet = ethers.Wallet.fromMnemonic(mnemonic); //Generate wallet from our Kronos seed
    let ethwalletp = ethwallet.connect(provider); //Set wallet provider

    let totalcalcbal = parseFloat(totalaribal) - parseFloat(amount);
    let totalcalcgas = parseFloat(totalethbal) - parseFloat(gasfee);

    if (parseFloat(gasfee) > parseFloat(totalethbal)) {

        req.toastr.error(`Gas fee (`+gasfee+` ETH) exceeds your ETH balance!`, 'Gas Balance Error!', { positionClass: 'toast-bottom-left' });
        return res.redirect('/sendari');

    } else if (parseFloat(amount) > parseFloat(totalaribal)) {

        req.toastr.error(`Withdrawal amount (`+amount+` ARI) exceeds your ARI balance!`, 'Balance Error!', { positionClass: 'toast-bottom-left' });
        return res.redirect('/sendari');

    } else {

    if (valid) {
        const ariAbi = [
        // Some details about the token
        "function name() view returns (string)",
        "function symbol() view returns (string)",
        "function balanceOf(address) view returns (uint)",
        "function transfer(address to, uint amount)",
        "event Transfer(address indexed from, address indexed to, uint amount)"
        ];

        // The Contract object
        const ariContract = new ethers.Contract(ariAddress, ariAbi, ethwalletp);
        
        var options = {
            gasLimit: 60000,
            gasPrice: ethers.utils.parseUnits(gwei, 'gwei')
        };

        let promises = [];
        let txarray = [];

        const ariTX = async () => {
            let aritransfer = await ariContract.transfer(sendtoaddress, transferamount, options);
            return aritransfer;
        }
        //ariTX();

        promises.push(new Promise((res, rej) => {
            ariTX().then(globalData => {
                txarray.push({aritx: globalData});
                res({globalData});
            });
        }));

        Promise.all(promises).then((values) => {

            console.log(values);
            console.log(txarray);

            req.toastr.success(`${amount} ARI was sent successfully! ${txarray[0].aritx.hash}`, 'Success!', { positionClass: 'toast-bottom-left' });
            req.flash('success', { msg: `Your <strong>${amount} ARI</strong> was sent successfully! (${gasfee} ETH gas fee) <a href="https://etherscan.io/tx/${txarray[0].aritx.hash}" target="_blank"><strong>${txarray[0].aritx.hash}</strong></a>` });
            Storage.set('totalaribal', totalcalcbal);
            Storage.set('totaleth', totalcalcgas);
            return res.redirect('/sendari'); // ????

        });

    } else {
        req.toastr.error('You entered an invalid Denarii (ARI) Address!', 'Invalid Address!', { positionClass: 'toast-bottom-left' });
        //req.flash('errors', { msg: 'You entered an invalid Ethereum (ETH) Address!' });
        return res.redirect('/sendari');
    }
  }


};


exports.getSimpleSeed = (req, res) => {
    const ip = require('ip');
    const ipaddy = ip.address();
  
    res.locals.lanip = ipaddy;
  
    req.session.loggedin2 = false;
  
    var totalbal = Storage.get('totalbal');
    var totalethbal = Storage.get('totaleth');
    var totalaribal = Storage.get('totalaribal');
    var seedphrasedb = Storage.get('seed');
  
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

        // ETH and ARI
        let ethwallet = ethers.Wallet.fromMnemonic(mnemonic); //Generate wallet from our Kronos seed
        let ethwalletp = ethwallet.connect(provider); //Set wallet provider
  
        //Convert our mnemonic seed phrase to BIP39 Seed Buffer 
        const seed = bip39.mnemonicToSeedSync(mnemonic);
        
        // BIP32 From BIP39 Seed
        const root = bip32.fromSeed(seed);
  
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
  
        // A for loop for how many addresses we want from the derivation path of the seed phrase
        for (let i = 0; i < 1; i++) { //1 (21 = 20 addresses)
  
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
  
        store.push({mnemonic: mnemonic, seedaddresses: seedaddresses});
  
        res.locals.seedphrase = store;
        let ethprivkey = ethwallet.privateKey;
        let ethaddress = ethwalletp.address;
    
      res.render('simple/getseed', {
          title: 'Kronos Seed Phrase',
          totalbal: totalbal,
          totalethbal: totalethbal,
          totalaribal: totalaribal,
          ethaddress: ethaddress,
          ethprivkey: ethprivkey,
          seedphrase: store
      });
    });
  });
  };