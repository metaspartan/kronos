/*
**************************************
**************************************
**************************************
* Kronos Explorer Controller
* Copyright (c) 2020 Carsen Klock
**************************************
**************************************
**************************************
*/
'use esversion:6';

const bitcoin = require('bitcoin');
const WAValidator = require('wallet-address-validatord');
const QRCode = require('qrcode');
const unirest = require('unirest');
const toastr = require('express-toastr');
const ElectrumClient = require('electrum-cash').Client;
const ElectrumCluster = require('electrum-cash').Cluster;
const bs58 = require('bs58');
const sha256 = require('sha256');
//const instantiateSecp256k1 = require('@bitauth/libauth'); Unused
const appRoot = require('app-root-path');
const files = require('fs');
const dbr = require('../db.js');
const db = dbr.db;
const CryptoJS = require("crypto-js");
const bip39 = require("bip39");
const bip32 = require("bip32d");
const denarius = require('denariusjs');
const Storage = require('json-storage-fs');
const os = require('os');

var sendJSONResponse = function (res, status, content) {
    res.status(status);
    res.json(content);
};

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

if (typeof Storage.get('rpchost') == 'undefined') {
	Storage.set('rpchost', '127.0.0.1');
	Storage.set('rpcport', '32369');
	Storage.set('rpcuser', 'null');
	Storage.set('rpcpass', 'null');
}

//GET Get Address Information
exports.getaddress = function (req, res) {
  var urladdy = req.params.addr;
  //console.log('PASSED ADDRESS: ', urladdy);

  //Connect to our D node 
//process.env.DUSER
const client = new bitcoin.Client({
	host: decrypt(Storage.get('rpchost')),
	port: decrypt(Storage.get('rpcport')),
	user: decrypt(Storage.get('rpcuser')),
	pass: decrypt(Storage.get('rpcpass')),
	timeout: 30000
});

  const ip = require('ip');
  const ipaddy = ip.address();

  res.locals.lanip = ipaddy;

  //The used Electrumx Hosts for our Kronos ElectrumX Cluster
  const delectrumxhost1 = 'electrumx1.denarius.pro';
  const delectrumxhost2 = 'electrumx2.denarius.pro';
  const delectrumxhost3 = 'electrumx3.denarius.pro';
  const delectrumxhost4 = 'electrumx4.denarius.pro';

  //Global Vars
  var scripthasharray = [];
  var txhistoryarray = [];
  var promises = [];

  client.getBalance(function (error, info, resHeaders) {
    if (error) {
      var offline = 'offlineoverlay';
      var offlinebtn = 'offlinebutton';
      var balance = '0';
      console.log(error);
    } else {
      var offline = 'onlineoverlay';
      var offlinebtn = 'onlinebutton';
    }

    var chaindl = 'nooverlay';
    var chaindlbtn = 'nobtn';

    var balance = info;

    if (balance <= 0) {
      balance = 0;
    }



  client.walletStatus(function (err, ws, resHeaders) {
    if (err) {
      console.log(err);
      var offline = 'offlineoverlay';
      var offlinebtn = 'offlinebutton';
      var ws = '';
      var walletstatuss = 'locked';
      var sendicon = 'display: none !important';
    } else {
      var offline = 'onlineoverlay';
      var offlinebtn = 'onlinebutton';

      var walletstatuss = ws.wallet_status;
      var sendicon;
      
      if (walletstatuss == 'stakingonly') {
        sendicon = 'display: none !important';
      } else if (walletstatuss == 'unlocked') {
        sendicon = 'display: visible !important;';
      } else if (walletstatuss == 'unencrypted') {
        sendicon = 'display: visible !important';
      } else if (walletstatuss == 'locked') {
        sendicon = 'display: none !important';
      }
    }

  client.getStakingInfo(function (error, stakeinfo, resHeaders) {

        if (error) {
          var enabled = 'Node Offline';
          var staking = 'Node Offline';
          var yourweight = 'Node Offline';
          var netweight = 'Node Offline';
          var expected = 'Node Offline';
          var stakediff = 'Node Offline';
    
          var offline = 'offlineoverlay';
    
          var offlinebtn = 'offlinebutton';
    
          console.log(error);
    
        } else {
          var enabled = stakeinfo.enabled;
          var staking = stakeinfo.staking;
          var yourweight = stakeinfo.weight;
          var netweight = stakeinfo.netstakeweight;
          var expected = stakeinfo.expectedtime;
          var stakediff = stakeinfo.difficulty;
    
          var offline = 'onlineoverlay';
          var offlinebtn = 'onlinebutton';
    
          var staketoggle;
          var enabletoggle;
    
          if (enabled == true) {
            enabletoggle = 'Configured';
          } else {
            enabletoggle = 'Disabled';
          }
    
          if (staking == true) {
            staketoggle = 'Staking';
          } else {
            staketoggle = 'Not Yet Staking';
          }
        }

        client.validateAddress(urladdy, function (error, returnedaddi, resHeaders) {
          if (error) {
            var offline = 'offlineoverlay';
            var offlinebtn = 'offlinebutton';
            var returnedaddi = 'Offline';
            console.log(error);
          } else {
            var offline = 'onlineoverlay';
            var offlinebtn = 'onlinebutton';
          }
      
          var chaindl = 'nooverlay';
          var chaindlbtn = 'nobtn';
      
          var validationdata = returnedaddi.ismine;

          if (validationdata == true) {
            urladdy = returnedaddi.address;              
            var compressedpubkey = returnedaddi.pubkey;
          } else {
            //urladdy = '';
            var compressedpubkey = 'NOT AVAILABLE';
          }


          //Convert P2PKH Address to Scripthash for ElectrumX Balance Fetching
          const bytes = bs58.decode(urladdy);
          const byteshex = bytes.toString('hex');
          const remove00 = byteshex.substring(2);
          const removechecksum = remove00.substring(0, remove00.length-8);
          const HASH160 = "76A914" + removechecksum.toUpperCase() + "88AC";
          const BUFFHASH160 = Buffer.from(HASH160, "hex");
          const shaaddress = sha256(BUFFHASH160);

          //Convert P2PK Address to Scripthash for ElectrumX Balance Fetching
          //Convert Compressed Pub Key
          const HASH1601p = "21" + compressedpubkey.toUpperCase() + "AC"; // 21 + COMPRESSED PUBKEY + OP_CHECKSIG = P2PK
          const BUFFHASH1601p = Buffer.from(HASH1601p, "hex");
          const shaaddress1p = sha256(BUFFHASH1601p);

          const changeEndianness = (string) => {
                  const result = [];
                  let len = string.length - 2;
                  while (len >= 0) {
                    result.push(string.substr(len, 2));
                    len -= 2;
                  }
                  return result.join('');
          }

          if (validationdata == true) {
            var p2pkraw = "21  "+compressedpubkey.toUpperCase()+"  OP_CHECKSIG";
            var p2pkhraw = "OP_DUP OP_HASH160  "+removechecksum.toUpperCase()+"  OP_EQUALVERIFY OP_CHECKSIG";
          } else {
            var p2pkraw = "";       
            var p2pkhraw = "OP_DUP OP_HASH160  "+removechecksum.toUpperCase()+"  OP_EQUALVERIFY OP_CHECKSIG";
          }

          const scripthash = changeEndianness(shaaddress);

          var p2pkscripthash = changeEndianness(shaaddress1p);

          const scripthashf = async () => {
            // Initialize an electrum cluster where 1 out of 2 out of the 4 needs to be consistent, polled randomly with fail-over.
            const electrum = new ElectrumCluster('Kronos ElectrumX Cluster', '1.4.1', 1, 2, ElectrumCluster.ORDER.RANDOM);
            
            // Add some servers to the cluster.
            electrum.addServer(delectrumxhost1);
            electrum.addServer(delectrumxhost2);
            electrum.addServer(delectrumxhost3);
            electrum.addServer(delectrumxhost4);
            
            // Wait for enough connections to be available.
            await electrum.ready();

            // Request the balance of the requested Scripthash D address
            const balancescripthash1 = await electrum.request('blockchain.scripthash.get_balance', scripthash);

            const p2pkbalancescripthash1 = await electrum.request('blockchain.scripthash.get_balance', p2pkscripthash);

            // const scripthashhistory = await electrum.request('blockchain.scripthash.get_history', scripthash);

            // const p2pkhistory = await electrum.request('blockchain.scripthash.get_history', p2pkscripthash);

            const balanceformatted1 = balancescripthash1.confirmed;

            const p2pkbalanceformatted1 = p2pkbalancescripthash1.confirmed;

            const balancefinal1 = balanceformatted1 / 100000000;

            const p2pkbalancefinal1 = p2pkbalanceformatted1 / 100000000;

            const addedbalance1 = balancefinal1 + p2pkbalancefinal1;

            //await electrum.disconnect();
            await electrum.shutdown();
    
            return addedbalance1;
          }

          unirest.get("https://chainz.cryptoid.info/d/api.dws?q=getbalance&a="+urladdy)
            .headers({'Accept': 'application/json'})
            .end(function (result) {
              if (!result.error) {

                res.locals.explorerbalance = result.body;
                var eebalance = result.body;

              } else { 

                res.locals.explorerbalance = '~';
                var eebalance = '~';

              }      

          const scripthashtx = async () => {
            // Initialize an electrum cluster where 1 out of 2 out of the 4 needs to be consistent, polled randomly with fail-over.
            const electrum = new ElectrumCluster('Kronos ElectrumX Cluster', '1.4.1', 1, 2, ElectrumCluster.ORDER.RANDOM);
            
            // Add some servers to the cluster.
            electrum.addServer(delectrumxhost1);
            electrum.addServer(delectrumxhost2);
            electrum.addServer(delectrumxhost3);
            electrum.addServer(delectrumxhost4);
            
            // Wait for enough connections to be available.
            await electrum.ready();

            const scripthashhistory = await electrum.request('blockchain.scripthash.get_history', scripthash);

            const p2pkhistory = await electrum.request('blockchain.scripthash.get_history', p2pkscripthash);

            const txs = scripthashhistory + p2pkhistory;

            const numTx = scripthashhistory.length + p2pkhistory.length;

            //console.log(numTx);

            res.locals.numTx = numTx;

            txhistoryarray.push({scripthashtxhistory: scripthashhistory, p2pktxhistory: p2pkhistory});

            //console.log(txhistoryarray)            

            //await electrum.disconnect();
            await electrum.shutdown();
    
            return txhistoryarray;
          }

          const qrcodeasync = async () => {
            if (urladdy != '') {
              const qrcoded1 = await QRCode.toDataURL(urladdy, { color: { dark: '#000000FF', light:"#333333FF" } });

              return qrcoded1;
            } else {
              const qrcoded1 = '';

              return qrcoded1;
            }
          }

          var ebalance = eebalance;

          promises.push(new Promise((res, rej) => {
            qrcodeasync().then(qrcodedata1 => {
              scripthashf().then(globalData1 => {
                scripthashtx().then(txData => {

                  if (validationdata == true) {
                    globalData1 = globalData1;
                  } else {
                    p2pkscripthash = "";
                    globalData1 = ebalance;
                  }
              
              scripthasharray.push({address: urladdy, qr: qrcodedata1, ismine: validationdata, p2pkhscripthash: scripthash, p2pkhraw: p2pkhraw, p2pkscripthash: p2pkscripthash, p2pkraw: p2pkraw, balance: globalData1, txs: txData});
              
              res({urladdy, qrcodedata1, scripthash, globalData1, txData});

            }).catch(function(err) {
              console.log("Error", err);
          });
            });  
          });
          }) );

          Promise.all(promises).then((values) => {

          //console.log(scripthasharray);
        

    res.render('explore/getaddress', { title: 'Address View', scripthasharray: scripthasharray, staketoggle: staketoggle, sendicon: sendicon, balance: balance, offline: offline, offlinebtn: offlinebtn, chaindl: chaindl, chaindlbtn: chaindlbtn });
    });

  });
  });
  });      
  });
});    
  //}); 
};

//GET Get Transaction Information
exports.gettx = function (req, res) {
      var urltx = req.params.tx;
      //console.log('PASSED TXID: ', urltx);

      //Connect to our D node 
      //process.env.DUSER
      const client = new bitcoin.Client({
        host: decrypt(Storage.get('rpchost')),
        port: decrypt(Storage.get('rpcport')),
        user: decrypt(Storage.get('rpcuser')),
        pass: decrypt(Storage.get('rpcpass')),
        timeout: 30000
      });

      const ip = require('ip');
      const ipaddy = ip.address();

      res.locals.lanip = ipaddy;

      client.getBalance(function (error, info, resHeaders) {
        if (error) {
          var offline = 'offlineoverlay';
          var offlinebtn = 'offlinebutton';
          var balance = '0';
          console.log(error);
        } else {
          var offline = 'onlineoverlay';
          var offlinebtn = 'onlinebutton';
        }
    
        var chaindl = 'nooverlay';
        var chaindlbtn = 'nobtn';
    
        var balance = info;
    
        if (balance <= 0) {
          balance = 0;
        }
    
      client.getTransaction(`${urltx}`, function (err, txinfo, resHeaders) {
        if (err) {
          console.log(err);
          var offline = 'offlineoverlay';
          var offlinebtn = 'offlinebutton';
          var txinfo = '';
          var blockhash = '';
        } else {
          var offline = 'onlineoverlay';
          var offlinebtn = 'onlinebutton';
          
          blockhash = txinfo.blockhash;

        }

        //var blockhash = txinfo.blockhash;

        client.getBlock(`${blockhash}`, function (err, blockinfo, resHeaders) {
          if (err) {
            console.log(err);
            var offline = 'offlineoverlay';
            var offlinebtn = 'offlinebutton';
            var blockinfo = '';
          } else {
            var offline = 'onlineoverlay';
            var offlinebtn = 'onlinebutton';        
          }  

    
      client.walletStatus(function (err, ws, resHeaders) {
        if (err) {
          console.log(err);
          var offline = 'offlineoverlay';
          var offlinebtn = 'offlinebutton';
          var ws = '';
          var walletstatuss = 'locked';
          var sendicon = 'display: none !important';
        } else {
          var offline = 'onlineoverlay';
          var offlinebtn = 'onlinebutton';
    
          var walletstatuss = ws.wallet_status;
          var sendicon;
          
          if (walletstatuss == 'stakingonly') {
            sendicon = 'display: none !important';
          } else if (walletstatuss == 'unlocked') {
            sendicon = 'display: visible !important;';
          } else if (walletstatuss == 'unencrypted') {
            sendicon = 'display: visible !important';
          } else if (walletstatuss == 'locked') {
            sendicon = 'display: none !important';
          }
        }
    
      client.getStakingInfo(function (error, stakeinfo, resHeaders) {
    
            if (error) {
              var enabled = 'Node Offline';
              var staking = 'Node Offline';
              var yourweight = 'Node Offline';
              var netweight = 'Node Offline';
              var expected = 'Node Offline';
              var stakediff = 'Node Offline';
        
              var offline = 'offlineoverlay';
        
              var offlinebtn = 'offlinebutton';
        
              console.log(error);
        
            } else {
              var enabled = stakeinfo.enabled;
              var staking = stakeinfo.staking;
              var yourweight = stakeinfo.weight;
              var netweight = stakeinfo.netstakeweight;
              var expected = stakeinfo.expectedtime;
              var stakediff = stakeinfo.difficulty;
        
              var offline = 'onlineoverlay';
              var offlinebtn = 'onlinebutton';
        
              var staketoggle;
              var enabletoggle;
        
              if (enabled == true) {
                enabletoggle = 'Configured';
              } else {
                enabletoggle = 'Disabled';
              }
        
              if (staking == true) {
                staketoggle = 'Staking';
              } else {
                staketoggle = 'Not Yet Staking';
              }
            }
    
        res.render('explore/gettx', { title: 'Transaction View', txinfo: txinfo, blockinfo: blockinfo, staketoggle: staketoggle, sendicon: sendicon, balance: balance, offline: offline, offlinebtn: offlinebtn, chaindl: chaindl, chaindlbtn: chaindlbtn });
        });
    
      });
      });
      }); 
    });
};

//GET Get Block Information
exports.getblock = function (req, res) {

  const ip = require('ip');
  const ipaddy = ip.address();

  //Connect to our D node 
  //process.env.DUSER
  const client = new bitcoin.Client({
    host: decrypt(Storage.get('rpchost')),
    port: decrypt(Storage.get('rpcport')),
    user: decrypt(Storage.get('rpcuser')),
    pass: decrypt(Storage.get('rpcpass')),
    timeout: 30000
  });

  res.locals.lanip = ipaddy;

  if (isNaN(req.params.block) != true) {
    var blocknumber = req.params.block;

    //console.log('GOT BLOCK #: ', blocknumber);

  client.getBalance(function (error, info, resHeaders) {
    if (error) {
      var offline = 'offlineoverlay';
      var offlinebtn = 'offlinebutton';
      var balance = '0';
      console.log(error);
    } else {
      var offline = 'onlineoverlay';
      var offlinebtn = 'onlinebutton';
    }

    var chaindl = 'nooverlay';
    var chaindlbtn = 'nobtn';

    var balance = info;

    if (balance <= 0) {
      balance = 0;
    }

    client.getBlockByNumber(parseInt(blocknumber), function (err, blockinfo, resHeaders) {
      if (err) {
        console.log(err);
        var offline = 'offlineoverlay';
        var offlinebtn = 'offlinebutton';
        var blockinfo = '';
      } else {
        var offline = 'onlineoverlay';
        var offlinebtn = 'onlinebutton';        
      } 

  client.walletStatus(function (err, ws, resHeaders) {
    if (err) {
      console.log(err);
      var offline = 'offlineoverlay';
      var offlinebtn = 'offlinebutton';
      var ws = '';
      var walletstatuss = 'locked';
      var sendicon = 'display: none !important';
    } else {
      var offline = 'onlineoverlay';
      var offlinebtn = 'onlinebutton';

      var walletstatuss = ws.wallet_status;
      var sendicon;
      
      if (walletstatuss == 'stakingonly') {
        sendicon = 'display: none !important';
      } else if (walletstatuss == 'unlocked') {
        sendicon = 'display: visible !important;';
      } else if (walletstatuss == 'unencrypted') {
        sendicon = 'display: visible !important';
      } else if (walletstatuss == 'locked') {
        sendicon = 'display: none !important';
      }
    }

  client.getStakingInfo(function (error, stakeinfo, resHeaders) {

        if (error) {
          var enabled = 'Node Offline';
          var staking = 'Node Offline';
          var yourweight = 'Node Offline';
          var netweight = 'Node Offline';
          var expected = 'Node Offline';
          var stakediff = 'Node Offline';
    
          var offline = 'offlineoverlay';
    
          var offlinebtn = 'offlinebutton';
    
          console.log(error);
    
        } else {
          var enabled = stakeinfo.enabled;
          var staking = stakeinfo.staking;
          var yourweight = stakeinfo.weight;
          var netweight = stakeinfo.netstakeweight;
          var expected = stakeinfo.expectedtime;
          var stakediff = stakeinfo.difficulty;
    
          var offline = 'onlineoverlay';
          var offlinebtn = 'onlinebutton';
    
          var staketoggle;
          var enabletoggle;
    
          if (enabled == true) {
            enabletoggle = 'Configured';
          } else {
            enabletoggle = 'Disabled';
          }
    
          if (staking == true) {
            staketoggle = 'Staking';
          } else {
            staketoggle = 'Not Yet Staking';
          }
        }

    res.render('explore/block', { title: 'Block View', blockinfo: blockinfo, staketoggle: staketoggle, sendicon: sendicon, balance: balance, offline: offline, offlinebtn: offlinebtn, chaindl: chaindl, chaindlbtn: chaindlbtn });
    });

  });
  });
  });
    
  } else {
    var blockhash = req.params.block;
    //console.log('GOT BLOCK: ', blockhash);

    client.getBalance(function (error, info, resHeaders) {
      if (error) {
        var offline = 'offlineoverlay';
        var offlinebtn = 'offlinebutton';
        var balance = '0';
        console.log(error);
      } else {
        var offline = 'onlineoverlay';
        var offlinebtn = 'onlinebutton';
      }
  
      var chaindl = 'nooverlay';
      var chaindlbtn = 'nobtn';
  
      var balance = info;
  
      if (balance <= 0) {
        balance = 0;
      }
  
      client.getBlock(`${blockhash}`, function (err, blockinfo, resHeaders) {
        if (err) {
          console.log(err);
          var offline = 'offlineoverlay';
          var offlinebtn = 'offlinebutton';
          var blockinfo = '';
        } else {
          var offline = 'onlineoverlay';
          var offlinebtn = 'onlinebutton';        
        }  
  
  
    client.walletStatus(function (err, ws, resHeaders) {
      if (err) {
        console.log(err);
        var offline = 'offlineoverlay';
        var offlinebtn = 'offlinebutton';
        var ws = '';
        var walletstatuss = 'locked';
        var sendicon = 'display: none !important';
      } else {
        var offline = 'onlineoverlay';
        var offlinebtn = 'onlinebutton';
  
        var walletstatuss = ws.wallet_status;
        var sendicon;
        
        if (walletstatuss == 'stakingonly') {
          sendicon = 'display: none !important';
        } else if (walletstatuss == 'unlocked') {
          sendicon = 'display: visible !important;';
        } else if (walletstatuss == 'unencrypted') {
          sendicon = 'display: visible !important';
        } else if (walletstatuss == 'locked') {
          sendicon = 'display: none !important';
        }
      }
  
    client.getStakingInfo(function (error, stakeinfo, resHeaders) {
  
          if (error) {
            var enabled = 'Node Offline';
            var staking = 'Node Offline';
            var yourweight = 'Node Offline';
            var netweight = 'Node Offline';
            var expected = 'Node Offline';
            var stakediff = 'Node Offline';
      
            var offline = 'offlineoverlay';
      
            var offlinebtn = 'offlinebutton';
      
            console.log(error);
      
          } else {
            var enabled = stakeinfo.enabled;
            var staking = stakeinfo.staking;
            var yourweight = stakeinfo.weight;
            var netweight = stakeinfo.netstakeweight;
            var expected = stakeinfo.expectedtime;
            var stakediff = stakeinfo.difficulty;
      
            var offline = 'onlineoverlay';
            var offlinebtn = 'onlinebutton';
      
            var staketoggle;
            var enabletoggle;
      
            if (enabled == true) {
              enabletoggle = 'Configured';
            } else {
              enabletoggle = 'Disabled';
            }
      
            if (staking == true) {
              staketoggle = 'Staking';
            } else {
              staketoggle = 'Not Yet Staking';
            }
          }
  
      res.render('explore/block', { title: 'Block View', blockinfo: blockinfo, staketoggle: staketoggle, sendicon: sendicon, balance: balance, offline: offline, offlinebtn: offlinebtn, chaindl: chaindl, chaindlbtn: chaindlbtn });
      });
  
    });
    });
    });
  }
};


/**
 * POST /search
 * Search Denarius Blockchain
 */
exports.search = (req, res, next) => {
  var searchreq = req.body.explorersearch;

  console.log('Search Request', searchreq)

  var regexpTx = new RegExp('[0-9a-zA-Z]{64}?');
  var regexpAddr = new RegExp('^(D)?[0-9a-zA-Z]{34}$'); //D Regular Expression for Addresses
  var scripthashregex = new RegExp('^(d)?[0-9a-zA-Z]{34}$'); // d Scripthash Addresses
  var regexpBlockNum = new RegExp('[0-9]{1,7}?'); // Blocks have same hash regex as TX...hmmm
  var regexpBlock = new RegExp('^[0][0-9a-zA-Z]{64}?'); // Blocks have same hash regex as TX...hmmm

  if (regexpAddr.test(searchreq) || scripthashregex.test(searchreq)) {
    //console.log("State of Address Test ", regexpAddr.test(searchreq))
    return res.redirect('/address/'+searchreq);
  } else if (regexpTx.test(searchreq)) {
    //console.log("State of TX Test ", regexpTx.test(searchreq))
    return res.redirect('/tx/'+searchreq);
  } else if (regexpBlockNum.test(searchreq)) {
    //console.log("State of Block Test ", regexpBlockNum.test(searchreq))
    return res.redirect('/block/'+searchreq);
  } else {
    req.toastr.error('Invalid Block #, Address, or Transaction Hash', 'Error!', { positionClass: 'toast-bottom-left' });
    return res.redirect('/')
  }

};