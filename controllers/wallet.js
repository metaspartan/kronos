/*
**************************************
**************************************
**************************************
* Kronos Wallet Controller
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

/**
 * GET /withdraw
 * Withdraw page.
 */
exports.getWithdraw = (req, res) => {
  //var username = req.user.email;
  const ip = require('ip');
  const ipaddy = ip.address();

  res.locals.lanip = ipaddy;

  //Connect to our D node 
  //process.env.DUSER
  const client = new bitcoin.Client({
    host: decrypt(Storage.get('rpchost')),
    port: decrypt(Storage.get('rpcport')),
    user: decrypt(Storage.get('rpcuser')),
    pass: decrypt(Storage.get('rpcpass')),
    timeout: 30000
  });

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
  client.getBalance(function (error, info, resHeaders) {
      if (error) {
        var offline = 'offlineoverlay';
				var offlinebtn = 'offlinebutton';
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
    res.render('account/withdraw', {
        title: 'Send D',
        balance: balance,
        sendicon: sendicon,
        offline: offline,
        offlinebtn: offlinebtn,
        staketoggle: staketoggle,
        chaindl: chaindl,
        chaindlbtn: chaindlbtn
    });
  });
});
});
};

exports.getRaw = (req, res) => {
  //var username = req.user.email;
  const ip = require('ip');
  const ipaddy = ip.address();

  res.locals.lanip = ipaddy;

  //Connect to our D node 
  //process.env.DUSER
  const client = new bitcoin.Client({
    host: decrypt(Storage.get('rpchost')),
    port: decrypt(Storage.get('rpcport')),
    user: decrypt(Storage.get('rpcuser')),
    pass: decrypt(Storage.get('rpcpass')),
    timeout: 30000
  });

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
    res.render('account/sendraw', {
        title: 'Broadcast Raw TX',
        balance: balance,
        offline: offline,
        sendicon: sendicon,
        offlinebtn: offlinebtn,
        staketoggle: staketoggle,
        chaindl: chaindl,
        chaindlbtn: chaindlbtn
    });
  });
});
});
};

exports.getPriv = (req, res) => {
  //var username = req.user.email;

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
  client.getBalance(function (error, info, resHeaders) {
      if (error) {
        var offline = 'offlineoverlay';
        var offlinebtn = 'offlinebutton';
        var balance = '0';
        var info = 'Node is importing private key...Please wait...';
        console.log(error);
      } else {
        var offline = 'onlineoverlay';
        var offlinebtn = 'onlinebutton';
        var balance = info;
        var info = '';
      }

      var chaindl = 'nooverlay';
      var chaindlbtn = 'nobtn';

      //var balance = info.balance;

      if (balance <= 0) {
        balance = 0;
      }
    res.render('account/import', {
        title: 'Import Private Key',
        balance: balance,
        offline: offline,
        sendicon: sendicon,
        offlinebtn: offlinebtn,
        staketoggle: staketoggle,
        chaindl: chaindl,
        chaindlbtn: chaindlbtn,
        info: info
    });
  });
});
});
};

exports.getSign = (req, res) => {
  //var username = req.user.email;
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
    res.render('account/sign', {
        title: 'Sign a Denarius Message',
        balance: balance,
        offline: offline,
        sendicon: sendicon,
        offlinebtn: offlinebtn,
        staketoggle: staketoggle,
        chaindl: chaindl,
        chaindlbtn: chaindlbtn
    });
  });
});
});
};

exports.getVerify = (req, res) => {
  //var username = req.user.email;
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
    res.render('account/verify', {
        title: 'Verify a Denarius Message',
        balance: balance,
        offline: offline,
        sendicon: sendicon,
        offlinebtn: offlinebtn,
        staketoggle: staketoggle,
        chaindl: chaindl,
        chaindlbtn: chaindlbtn
    });
  });
});
});
};

exports.getBackup = (req, res) => {
  //var username = req.user.email;
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
    res.render('account/backup', {
        title: 'Backup your D Wallet',
        balance: balance,
        offline: offline,
        sendicon: sendicon,
        offlinebtn: offlinebtn,
        staketoggle: staketoggle,
        chaindl: chaindl,
        chaindlbtn: chaindlbtn
    });
  });
});
});
};

//GET Addresses Page
//Fetches unspent and account addresses and then scripthashes them for ElectrumX Balance fetching
// By Carsen Klock
exports.addresses = function (req, res) {
  //var username = req.user.email;

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

  //The used Electrumx Hosts for our Kronos ElectrumX Cluster
  const delectrumxhost1 = 'electrumx1.denarius.pro';
  const delectrumxhost2 = 'electrumx2.denarius.pro';
  const delectrumxhost3 = 'electrumx3.denarius.pro';
  const delectrumxhost4 = 'electrumx4.denarius.pro';

  //Global Vars
  var addressed;
  var scripthasharray = [];
  var promises = [];
  var qr;

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

  //List All Addresses
  client.listUnspent(function (err, addresses, resHeaders) {
      if (err) {
        console.log(err);
        var offline = 'offlineoverlay';
        var offlinebtn = 'offlinebutton';
        var addresses = 'Offline';
      }

      var offline = 'onlineoverlay';
      var offlinebtn = 'onlinebutton';

      addresses.forEach(address => {
        var addressed = address.address;

        client.validateAddress(addressed, function (error, returnedaddi, resHeaders) {
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
            addressed = address.address;              
            var compressedpubkey = returnedaddi.pubkey;
          } else {
            addressed = '';
          }

        //Convert P2PKH Address to Scripthash for ElectrumX Balance Fetching
        const bytes = bs58.decode(addressed)
        const byteshex = bytes.toString('hex');
        const remove00 = byteshex.substring(2);
        const removechecksum = remove00.substring(0, remove00.length-8);
        const HASH160 = "76A914" + removechecksum.toUpperCase() + "88AC";
        const BUFFHASH160 = Buffer.from(HASH160, "hex");
        const shaaddress = sha256(BUFFHASH160);

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

        const scripthasha = async () => {
          // Initialize an electrum cluster where 1 out of 2 out of the 4 needs to be consistent, polled randomly with fail-over.
          const electrum = new ElectrumCluster('Kronos ElectrumX Cluster', '1.4.1', 1, 2, ElectrumCluster.ORDER.RANDOM);
          
          // Add some servers to the cluster.
          electrum.addServer(delectrumxhost1);
          electrum.addServer(delectrumxhost2);
          electrum.addServer(delectrumxhost3);
          //electrum.addServer(delectrumxhost4);
          
          // Wait for enough connections to be available.
          await electrum.ready();

          //Convert P2PK Address to Scripthash for ElectrumX Balance Fetching
          //Convert Compressed Pub Key to Uncompressed
          const HASH1601 =  "21" + compressedpubkey.toUpperCase() + "AC"; // 21 + COMPRESSED PUBKEY + OP_CHECKSIG = P2PK
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
          
          const scripthashp2pk = changeEndianness(shaaddress1);
          
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

        const qrcodeasync = async () => {
          const qrcoded = await QRCode.toDataURL(address.address, { color: { dark: '#000000FF', light:"#333333FF" } });

          //console.log(qrcoded)

          return qrcoded;
        }

        promises.push(new Promise((res, rej) => {
          qrcodeasync().then(qrcodedata => {
            scripthasha().then(globalData => {
            
            scripthasharray.push({address: addressed, qr: qrcodedata, scripthash: scripthash, balance: globalData});
            res({addressed, qrcodedata, scripthash, globalData});

          });
          });  
        }) );
      });

      });

      client.listReceivedByAddress(0, true, false, function (err, listaddresses, resHeaders) {
        if (err) {
          console.log(err);
          var offline = 'offlineoverlay';
          var offlinebtn = 'offlinebutton';
          var addresses = 'Offline';
        }
  
        var offline = 'onlineoverlay';
        var offlinebtn = 'onlinebutton';

        listaddresses.forEach(addi => {
          var addressedd = addi.address;

          client.validateAddress(addressedd, function (error, returnedaddy, resHeaders) {
            if (error) {
              var offline = 'offlineoverlay';
              var offlinebtn = 'offlinebutton';
              var returnedaddy = 'Offline';
              console.log(error);
            } else {
              var offline = 'onlineoverlay';
              var offlinebtn = 'onlinebutton';
            }
        
            var chaindl = 'nooverlay';
            var chaindlbtn = 'nobtn';
        
            var validationdata = returnedaddy.ismine;

            if (validationdata == true) {
              addressedd = addi.address;              
              var compressedpubkey = returnedaddy.pubkey;
            } else {
              addressedd = '';
            }       


          if (addressedd != '') {

            //Convert P2PKH Address to Scripthash for ElectrumX Balance Fetching
            const bytes1 = bs58.decode(addressedd)
            const byteshex1 = bytes1.toString('hex');
            const remove001 = byteshex1.substring(2);
            const removechecksum1 = remove001.substring(0, remove001.length-8);
            const HASH1601 = "76A914" + removechecksum1.toUpperCase() + "88AC";
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

            const scripthash1 = changeEndianness(shaaddress1);

            const scripthashb = async () => {
              // Initialize an electrum cluster where 1 out of 2 out of the 4 needs to be consistent, polled randomly with fail-over.
              const electrum = new ElectrumCluster('Kronos ElectrumX Cluster', '1.4.1', 1, 2, ElectrumCluster.ORDER.RANDOM);
              
              // Add some servers to the cluster.
              electrum.addServer(delectrumxhost1);
              electrum.addServer(delectrumxhost2);
              electrum.addServer(delectrumxhost3);
              electrum.addServer(delectrumxhost4);
              
              // Wait for enough connections to be available.
              await electrum.ready();

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
              
              const p2pkscripthash1 = changeEndianness(shaaddress1p);

              // Request the balance of the requested Scripthash D address
              const balancescripthash1 = await electrum.request('blockchain.scripthash.get_balance', scripthash1);
              
              const p2pkbalancescripthash1 = await electrum.request('blockchain.scripthash.get_balance', p2pkscripthash1);

              const balanceformatted1 = balancescripthash1.confirmed;

              const p2pkbalanceformatted1 = p2pkbalancescripthash1.confirmed;

              const balancefinal1 = balanceformatted1 / 100000000;

              const p2pkbalancefinal1 = p2pkbalanceformatted1 / 100000000;

              const addedbalance1 = balancefinal1 + p2pkbalancefinal1;

              //await electrum.disconnect();
              await electrum.shutdown();
      
              return addedbalance1;
            }

            const qrcodeasync = async () => {
              if (addressedd != '') {
                const qrcoded1 = await QRCode.toDataURL(addressedd, { color: { dark: '#000000FF', light:"#333333FF" } });

                return qrcoded1;
              } else {
                const qrcoded1 = '';

                return qrcoded1;
              }
            }

            promises.push(new Promise((res, rej) => {
              qrcodeasync().then(qrcodedata1 => {
                scripthashb().then(globalData1 => {
                
                scripthasharray.push({address: addressedd, qr: qrcodedata1, scripthash: scripthash1, balance: globalData1});
                res({addressed, qrcodedata1, scripthash1, globalData1});

              }).catch(function(err) {
                console.log("Error", err);
            });
              });  
            }) );
          }
        });
        

        });

      var account = '333D'; //Needs work

		  client.getAddressesByAccount(`dpi(${account})`, async function (err, addressess, resHeaders) { //this isnt used by the foreach below
        if (err) {

          console.log(err);
          var addyy = 'Node Offline';
          var qrcode = 'Node Offline';        
          var offline = 'offlineoverlay';
          var offlinebtn = 'offlinebutton';
          var qr = 'Offline';

        } else {

          var offline = 'onlineoverlay';
          var offlinebtn = 'onlinebutton';

          var addyy = addressess.slice(-1)[0];

          if (typeof addyy == 'undefined') {
            client.getNewAddress(`dpi(${account})`, function (error, addr, resHeaders) {
            if (error) {
              console.log(error);
            }
            addyy = addr;
            });
          }

          var qr = 'denarius:'+addyy;

        }
      
        
        QRCode.toDataURL(addyy, { color: { dark: '#000000FF', light:"#333333FF" } }, function(err, addyqr) {

        //Start ForEach Loops of Addresses to Scripthashes

        addressess.forEach(addii => {
          var addressed2 = addii;

          client.validateAddress(addressed2, function (error, returnedaddii, resHeaders) {
            if (error) {
              var offline = 'offlineoverlay';
              var offlinebtn = 'offlinebutton';
              var returnedaddii = 'Offline';
              console.log(error);
            } else {
              var offline = 'onlineoverlay';
              var offlinebtn = 'onlinebutton';
            }
        
            var chaindl = 'nooverlay';
            var chaindlbtn = 'nobtn';
        
            var validationdata = returnedaddii.ismine;
  
            if (validationdata == true) {
              addressed2 = addii;              
              var compressedpubkey2 = returnedaddii.pubkey;
            } else {
              addressed2 = '';
            }

          //Convert P2PKH Address to Scripthash for ElectrumX Balance Fetching
          const bytes2 = bs58.decode(addressed2)
          const byteshex2 = bytes2.toString('hex');
          const remove002 = byteshex2.substring(2);
          const removechecksum2 = remove002.substring(0, remove002.length-8);
          const HASH1602 = "76A914" + removechecksum2.toUpperCase() + "88AC";
          const BUFFHASH1602 = Buffer.from(HASH1602, "hex");
          const shaaddress2 = sha256(BUFFHASH1602);

          const changeEndianness = (string) => {
                  const result = [];
                  let len = string.length - 2;
                  while (len >= 0) {
                    result.push(string.substr(len, 2));
                    len -= 2;
                  }
                  return result.join('');
          }

          const scripthash2 = changeEndianness(shaaddress2);

          // const p2pkscripthash2 = changeEndianness(shaaddress2p);

          const scripthashe = async () => {
            // Initialize an electrum cluster where 1 out of 2 out of the 4 needs to be consistent, polled randomly with fail-over.
            const electrum = new ElectrumCluster('Kronos ElectrumX Cluster', '1.4.1', 1, 2, ElectrumCluster.ORDER.RANDOM);
            
            // Add some servers to the cluster.
            electrum.addServer(delectrumxhost1);
            electrum.addServer(delectrumxhost2);
            electrum.addServer(delectrumxhost3);
            electrum.addServer(delectrumxhost4);
            
            // Wait for enough connections to be available.
            await electrum.ready();

            //Convert P2PK Address to Scripthash for ElectrumX Balance Fetching
            //Convert Compressed Pub Key to Uncompressed
            const HASH1602p = "21" + compressedpubkey2.toUpperCase() + "AC"; // "21" + COMPRESSED PUB KEY + OP_CHECKSIG
            const BUFFHASH1602p = Buffer.from(HASH1602p, "hex");
            const shaaddress2p = sha256(BUFFHASH1602p);

            const changeEndianness = (string) => {
                    const result = [];
                    let len = string.length - 2;
                    while (len >= 0) {
                      result.push(string.substr(len, 2));
                      len -= 2;
                    }
                    return result.join('');
            }
            
            const p2pkscripthash2 = changeEndianness(shaaddress2p);
            
            // Request the balance of the requested Scripthash D address
            const balancescripthash2 = await electrum.request('blockchain.scripthash.get_balance', scripthash2);
              
            const p2pkbalancescripthash2 = await electrum.request('blockchain.scripthash.get_balance', p2pkscripthash2);

            const balanceformatted2 = balancescripthash2.confirmed;

            const p2pkbalanceformatted2 = p2pkbalancescripthash2.confirmed;

            const balancefinal2 = balanceformatted2 / 100000000;

            const p2pkbalancefinal2 = p2pkbalanceformatted2 / 100000000;

            const addedbalance2 = balancefinal2 + p2pkbalancefinal2;

            //await electrum.disconnect();
            await electrum.shutdown();
    
            return addedbalance2;
          }

          const qrcodeasync = async () => {
            const qrcoded2 = await QRCode.toDataURL(addii, { color: { dark: '#000000FF', light:"#333333FF" } });

            //console.log(qrcoded)

            return qrcoded2;
          }


          promises.push(new Promise((res, rej) => {
            qrcodeasync().then(qrcodedata2 => {
              scripthashe().then(globalData2 => {
              
              scripthasharray.push({address: addressed2, qr: qrcodedata2, scripthash: scripthash2, balance: globalData2});
              res({addressed2, qrcodedata2, scripthash2, globalData2});

            }).catch(function(err) {
              console.log("Error", err);
          });
            });  
          }) );

        });

        });

        var chaindl = 'nooverlay';
        var chaindlbtn = 'nobtn';

        Promise.all(promises).then((values) => {

          function uniqByKeepLast(data, key) {
            return [
                ...new Map(
                    data.map(x => [key(x), x])
                ).values()
            ]
          }

          //Filter out all duplicate addresses from the combined scripthasharray
          var filteredscripthasharray = uniqByKeepLast(scripthasharray, it => it.address);

          //console.log(filteredscripthasharray);

          res.render('account/addresses', { title: 'My Addresses', addyy: addyy, addyqr: addyqr, addresses: addresses, scripthasharray: filteredscripthasharray, sendicon: sendicon, staketoggle: staketoggle, balance: balance, offline: offline, offlinebtn: offlinebtn, chaindl: chaindl, chaindlbtn: chaindlbtn });
        });
      
    });
      });
});
});
});
});
});
}


//POST GET NEW ADDRESS

exports.address = function (req, res) {
    //var username = req.user.email;
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

    client.getNewAddress(`dpi(333D)`, function (error, address, resHeaders) {
        if (error) {
          var offline = 'offlineoverlay';
          var offlinebtn = 'offlinebutton';
          var address = 'Offline';
          console.log(error);
        } else {
          var offline = 'onlineoverlay';
          var offlinebtn = 'onlinebutton';
        }
    
        var chaindl = 'nooverlay';
        var chaindlbtn = 'nobtn';

        var qr = 'denarius:'+address

        QRCode.toDataURL(qr, function(err, data_url) {

        res.render('account/newaddress', { title: 'New D Address', user: req.user, offline: offline, sendicon: sendicon, staketoggle: staketoggle, balance: balance, offlinebtn: offlinebtn, chaindl: chaindl, chaindlbtn: chaindlbtn, address: address, data_url: data_url });
    });
  });
  });
});
});
};


//POST GET FS GEN KEY

exports.genkey = function (req, res) {
  //var username = req.user.email;

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

  client.fortunaStake('genkey', function (error, genkey, resHeaders) {
      if (error) {
        var offline = 'offlineoverlay';
        var offlinebtn = 'offlinebutton';
        var genkey = 'Offline';
        console.log(error);
      } else {
        var offline = 'onlineoverlay';
        var offlinebtn = 'onlinebutton';
      }
  
      var chaindl = 'nooverlay';
      var chaindlbtn = 'nobtn';

      var qr = 'denarius:'+genkey

      QRCode.toDataURL(qr, function(err, data_url) {

      res.render('account/genkey', { title: 'New D FS Key', user: req.user, offline: offline, staketoggle: staketoggle, sendicon: sendicon, balance: balance, offlinebtn: offlinebtn, chaindl: chaindl, chaindlbtn: chaindlbtn, genkey: genkey, data_url: data_url });
  });
});
});
  });
  });
};

/**
 * POST /withdraw
 * Send Denarius funds
 */
exports.withdraw = (req, res, next) => {
	  var fee = 0.0001;
    //var username = req.user.email;
    var sendtoaddress = req.body.sendaddress;
    var amount = req.body.amount;

    //Connect to our D node 
    //process.env.DUSER
    const client = new bitcoin.Client({
      host: decrypt(Storage.get('rpchost')),
      port: decrypt(Storage.get('rpcport')),
      user: decrypt(Storage.get('rpcuser')),
      pass: decrypt(Storage.get('rpcpass')),
      timeout: 30000
    });

    client.getBalance(function (error, info, resHeaders) {
        if (error) {
          console.log(error);
        }

        var balance = info;

    var valid = WAValidator.validate(`${sendtoaddress}`, 'DNR'); //Need to update to D still

    if (parseFloat(amount) - fee > balance) {
        req.toastr.error('Withdrawal amount exceeds your D balance!', 'Balance Error!', { positionClass: 'toast-bottom-left' });
        //req.flash('errors', { msg: 'Withdrawal amount exceeds your D balance'});
        return res.redirect('/withdraw');

    } else {

    if (valid) {

        client.sendToAddress(`${sendtoaddress}`, parseFloat(`${amount}`), function (error, sendFromtx, resHeaders) {
            if (error) {
                req.toastr.error('Insufficient Funds or Invalid Amount!', 'Invalid!', { positionClass: 'toast-bottom-left' });
                //req.flash('errors', { msg: 'Insufficient Funds or Invalid Amount!' });
                return res.redirect('/withdraw');

            } else {

                var sendtx = sendFromtx;
                var vamount = parseFloat(`${amount}`);

                req.toastr.success(`${vamount} D was sent successfully!`, 'Success!', { positionClass: 'toast-bottom-left' });
                req.flash('success', { msg: `Your <strong>${vamount} D</strong> was sent successfully! TX ID: <a href="https://coinexplorer.net/D/transaction/${sendtx}" target="_blank">${sendtx}</a>` });
                return res.redirect('/withdraw');
            }
        });

    } else {
        req.toastr.error('You entered an invalid Denarius (D) Address!', 'Invalid Address!', { positionClass: 'toast-bottom-left' });
        //req.flash('errors', { msg: 'You entered an invalid Denarius (D) Address!' });
        return res.redirect('/withdraw');
    }
  }
  });
};

exports.transactions = function (req, res) {
  //var username = req.user.email;

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

  //List Transactions
  client.listTransactions('*', 300, function (err, transactions, resHeaders) {
      if (err) {
        console.log(err);
        var offline = 'offlineoverlay';
        var offlinebtn = 'offlinebutton';
        var transactions = [];
      } else {
        
        var offline = 'onlineoverlay';
        var offlinebtn = 'onlinebutton';
      }

      var chaindl = 'nooverlay';
      var chaindlbtn = 'nobtn';
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

    res.render('account/tx', { title: 'Transactions', transactions: transactions, sendicon: sendicon, staketoggle: staketoggle, balance: balance, offline: offline, offlinebtn: offlinebtn, chaindl: chaindl, chaindlbtn: chaindlbtn });
    });

  });
});
});
};


//POST for Starting FS from FS Page
exports.startfs = (req, res, next) => {

    var alias = req.body.alias;

    //Connect to our D node 
    //process.env.DUSER
    const client = new bitcoin.Client({
      host: decrypt(Storage.get('rpchost')),
      port: decrypt(Storage.get('rpcport')),
      user: decrypt(Storage.get('rpcuser')),
      pass: decrypt(Storage.get('rpcpass')),
      timeout: 30000
    });

    client.fortunaStake('start-alias', `${alias}`, function (error, result, resHeaders) {
      //if (error) return console.log(error);

      if (error) {
        req.toastr.error(`Something went wrong trying to start the FS ${alias} - ${error}`, 'Error!', { positionClass: 'toast-bottom-left' });
        return res.redirect('/fs');
      } else {

        if (result.result == 'failed')
        {
          var resultfinal = 'FAILED'
        } else {
          var resultfinal = 'SUCCEEDED'
        }

        req.flash('success', { msg: `Ran start-alias on FS <strong>${alias}</strong> and it ${resultfinal}` });
        req.toastr.success(`Ran start-alias on FS ${alias} and it ${resultfinal}`, 'Ran start-alias on FS', { positionClass: 'toast-bottom-left' });
        return res.redirect('/fs');

      }

    });
  
};

//GET for FS Page
exports.fs = function (req, res) {
  //var username = req.user.email;

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

  client.fortunaStake('count', function (err, count, resHeaders) {
    if (err) {
      console.log(err);
      var offline = 'offlineoverlay';
      var offlinebtn = 'offlinebutton';
      var count = 0;
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

  client.fortunaStake('status', function (err, statuss, resHeaders) {
    if (err) {
      console.log(err);
      var offline = 'offlineoverlay';
      var offlinebtn = 'offlinebutton';
      var statuss = [];
    } else {
      var offline = 'onlineoverlay';
      var offlinebtn = 'onlinebutton';
    }

  //List FortunaStakes
  client.fortunaStake('list', 'full', function (err, fss, resHeaders) {
      if (err) {
        console.log(err);
        var offline = 'offlineoverlay';
        var offlinebtn = 'offlinebutton';
        var fss = [];
      } else {
        
        var offline = 'onlineoverlay';
        var offlinebtn = 'onlinebutton';
      }

      var chaindl = 'nooverlay';
      var chaindlbtn = 'nobtn';

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

    res.render('account/fs', { title: 'FortunaStakes', fss: fss, count: count, staketoggle: staketoggle, statuss: statuss, sendicon: sendicon, balance: balance, offline: offline, offlinebtn: offlinebtn, chaindl: chaindl, chaindlbtn: chaindlbtn });
    });

  });
  });
  });
  });
  });
};

//GET for Peers Page
exports.peers = function (req, res) {
  //var username = req.user.email;

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

  client.getPeerInfo(function (err, peers, resHeaders) {
    if (err) {
      console.log(err);
      var offline = 'offlineoverlay';
      var offlinebtn = 'offlinebutton';
      var peers = '';
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

  client.getInfo(function (err, info, resHeaders) {
    if (err) {
      console.log(err);
      var offline = 'offlineoverlay';
      var offlinebtn = 'offlinebutton';
      var info = '';
    } else {
      var offline = 'onlineoverlay';
      var offlinebtn = 'onlinebutton';
    }

      var chaindl = 'nooverlay';
      var chaindlbtn = 'nobtn';
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

    res.render('account/peers', { title: 'Peers', peers: peers, info: info, staketoggle: staketoggle, sendicon: sendicon, balance: balance, offline: offline, offlinebtn: offlinebtn, chaindl: chaindl, chaindlbtn: chaindlbtn });
    });

  });
});
  });
  });
};

/**
 * POST /sendraw
 * Send Raw Transaction to D network
 */
exports.sendRaw = (req, res, next) => {
  var rawtx = req.body.rawtx;

  //Connect to our D node 
  //process.env.DUSER
  const client = new bitcoin.Client({
    host: decrypt(Storage.get('rpchost')),
    port: decrypt(Storage.get('rpcport')),
    user: decrypt(Storage.get('rpcuser')),
    pass: decrypt(Storage.get('rpcpass')),
    timeout: 30000
  });

  client.getBalance(function (error, info, resHeaders) {
      if (error) {
        console.log(error);
      }

      var balance = info;

      client.sendRawTransaction(`${rawtx}`, function (error, tx, resHeaders) {
          if (error) {
              req.toastr.error('Insufficient Funds, Invalid Amount, or Transaction already exists!', 'Invalid!', { positionClass: 'toast-bottom-left' });
              //req.flash('errors', { msg: 'Insufficient Funds or Invalid Amount!' });
              return res.redirect('/rawtx');

          } else {

              var sendtx = tx;

              req.toastr.success(`Raw Transaction was sent successfully!`, 'Success!', { positionClass: 'toast-bottom-left' });
              req.flash('success', { msg: `Your raw transaction was sent successfully! TX ID: <a href="https://coinexplorer.net/D/transaction/${sendtx}" target="_blank">${sendtx}</a>` });
              return res.redirect('/rawtx');
          }
      });
})
};

/**
 * POST /importpriv
 * Import private key
 */
exports.importPriv = (req, res, next) => {
  var privkey = req.body.privkey;

  //Connect to our D node 
  //process.env.DUSER
  const client = new bitcoin.Client({
    host: decrypt(Storage.get('rpchost')),
    port: decrypt(Storage.get('rpcport')),
    user: decrypt(Storage.get('rpcuser')),
    pass: decrypt(Storage.get('rpcpass')),
    timeout: 30000
  });

  client.getBalance(function (error, info, resHeaders) {
      if (error) {
        console.log(error);
      }

      var balance = info;

      client.importPrivKey(`${privkey}`, 'imported', false, function (error, success, resHeaders) {
          if (error) {
              req.toastr.error('Invalid Private Key or Wrong Format!', 'Invalid!', { positionClass: 'toast-bottom-left' });
              //req.flash('errors', { msg: 'Insufficient Funds or Invalid Amount!' });
              return res.redirect('/import');

          } else {

              req.toastr.success(`Imported private key successfully!`, 'Success!', { positionClass: 'toast-bottom-left' });
              return res.redirect('/import');
          }
      });
})
};

/**
 * POST /signmsg
 * Sign Denarius Message
 */
exports.signMsg = (req, res, next) => {
  //var username = req.user.email;
  var sendtoaddress = req.body.sendaddress;
  var msg = req.body.unsignedmsg;

  //Connect to our D node 
  //process.env.DUSER
  const client = new bitcoin.Client({
    host: decrypt(Storage.get('rpchost')),
    port: decrypt(Storage.get('rpcport')),
    user: decrypt(Storage.get('rpcuser')),
    pass: decrypt(Storage.get('rpcpass')),
    timeout: 30000
  });

  client.getBalance(function (error, info, resHeaders) {
      if (error) {
        console.log(error);
      }

      var balance = info;

  var valid = WAValidator.validate(`${sendtoaddress}`, 'DNR'); //Need to update to D still

  if (valid) {

      client.signMessage(`${sendtoaddress}`, `${msg}`, function (error, signedmsghex, resHeaders) {
          if (error) {
              req.toastr.error('You dont own this address or an error occured!', 'Error!', { positionClass: 'toast-bottom-left' });
              //req.flash('errors', { msg: 'Insufficient Funds or Invalid Amount!' });
              return res.redirect('/sign');

          } else {

              var signed = signedmsghex;

              req.toastr.success(`Signed message successfully`, 'Success!', { positionClass: 'toast-bottom-left' });
              req.flash('success', { msg: `Your signed message <strong>${msg}</strong> is: <strong>${signed}</strong> signed with the address: <strong>${sendtoaddress}</strong>` });
              return res.redirect('/sign');
          }
      });

  } else {
      req.toastr.error('You entered an invalid Denarius (D) Address!', 'Invalid Address!', { positionClass: 'toast-bottom-left' });
      //req.flash('errors', { msg: 'You entered an invalid Denarius (D) Address!' });
      return res.redirect('/sign');
  }

});
};


/**
 * POST /verifymsg
 * Verify Denarius Message
 */
exports.verifyMsg = (req, res, next) => {
  //var username = req.user.email;
  var sendtoaddress = req.body.sendaddress;
  var msg = req.body.unsignedmsg;
  var signature = req.body.signature;

  //Connect to our D node 
  //process.env.DUSER
  const client = new bitcoin.Client({
    host: decrypt(Storage.get('rpchost')),
    port: decrypt(Storage.get('rpcport')),
    user: decrypt(Storage.get('rpcuser')),
    pass: decrypt(Storage.get('rpcpass')),
    timeout: 30000
  });

  client.getBalance(function (error, info, resHeaders) {
      if (error) {
        console.log(error);
      }

      var balance = info;

  var valid = WAValidator.validate(`${sendtoaddress}`, 'DNR'); //Need to update to D still

  if (valid) {

      client.verifyMessage(`${sendtoaddress}`, `${signature}`, `${msg}`, function (error, signedmsghex, resHeaders) {
          if (error) {
              req.toastr.error('You dont own this address or an error occured!', 'Error!', { positionClass: 'toast-bottom-left' });
              //req.flash('errors', { msg: 'Insufficient Funds or Invalid Amount!' });
              return res.redirect('/verify');

          } else {

              var signed = signedmsghex;

              if (signed == true) {

                req.toastr.success(`Message is valid!`, 'Success!', { positionClass: 'toast-bottom-left' });
                req.flash('success', { msg: `Your message <strong>${msg}</strong> with signature: <strong>${signature}</strong> and the address: <strong>${sendtoaddress}</strong> is valid!` });
                return res.redirect('/verify');

              } else if (signed == false) {
                req.toastr.error('Message unable to be validated!', 'Message not verified!', { positionClass: 'toast-bottom-left' });
                return res.redirect('/verify');
              }
          }
      });

  } else {
      req.toastr.error('You entered an invalid Denarius (D) Address!', 'Invalid Address!', { positionClass: 'toast-bottom-left' });
      //req.flash('errors', { msg: 'You entered an invalid Denarius (D) Address!' });
      return res.redirect('/verify');
  }

});
};

/**
 * POST /backupwallet
 * Backup Denarius Wallet
 */
exports.backupWallet = (req, res, next) => {
  var location = req.body.backuploc;

  //Connect to our D node 
  //process.env.DUSER
  const client = new bitcoin.Client({
    host: decrypt(Storage.get('rpchost')),
    port: decrypt(Storage.get('rpcport')),
    user: decrypt(Storage.get('rpcuser')),
    pass: decrypt(Storage.get('rpcpass')),
    timeout: 30000
  });

  client.getBalance(function (error, info, resHeaders) {
      if (error) {
        console.log(error);
      }

      var balance = info;

      client.backupWallet(`${location}`, function (error, success, resHeaders) {
          if (error) {
              req.toastr.error('Invalid Location or Permission issue!', 'Error!', { positionClass: 'toast-bottom-left' });
              //req.flash('errors', { msg: 'Insufficient Funds or Invalid Amount!' });
              return res.redirect('/backup');

          } else {
              req.flash('success', { msg: `Your wallet was backed up successfully to <strong>${location}</strong>` });
              req.toastr.success(`Backup completed successfully!`, 'Success!', { positionClass: 'toast-bottom-left' });
              return res.redirect('/backup');
          }
      });
})
};

// exports.getseed = (req, res, next) => {
// var mnemonic;
// let seedaddresses = [];

// // Fetch the Kronos LevelDB
// db.get('seedphrase', function (err, value) {
// 	if (err) {
		
// 		// If seedphrase does not exist in levelDB then generate one
// 		mnemonic = bip39.generateMnemonic();
// 		console.log("~Generated Denarius Mnemonic~ ", mnemonic);

// 		// Encrypt the seedphrase for storing in the DB
// 		var encryptedmnemonic = encrypt(mnemonic);
// 		console.log("Encrypted Mnemonic", encryptedmnemonic);

// 		// Put the encrypted seedphrase in the DB
// 		db.put('seedphrase', encryptedmnemonic, function (err) {
// 			if (err) return console.log('Ooops!', err) // some kind of I/O error if so
// 			//console.log('Inserted Encrypted Seed Phrase to DB');
// 		});

// 		//return mnemonic;

// 	} else {

// 		var decryptedmnemonic = decrypt(value);
// 		console.log("Decrypted Mnemonic", decryptedmnemonic);

// 		mnemonic = decryptedmnemonic;

// 		//return mnemonic;

// 	}


// 	console.log("Stored Denarius Mnemonic: ", mnemonic);

// 	//Convert our mnemonic seed phrase to BIP39 Seed Buffer 
// 	const seed = bip39.mnemonicToSeedSync(mnemonic);
// 	console.log("BIP39 Seed Phrase to Hex", seed.toString('hex'));
	
// 	// BIP32 From BIP39 Seed
// 	const root = bip32.fromSeed(seed);

// 	// Denarius Network Params Object
// 	const network = {
// 			messagePrefix: '\x19Denarius Signed Message:\n',
// 			bech32: 'd',
// 			bip32: {
// 				public: 0x0488b21e,
// 				private: 0x0488ade4
// 			},
// 			pubKeyHash: 0x1e,
// 			scriptHash: 0x5a,
// 			wif: 0x9e
// 	};

// 	// A for loop for how many addresses we want from the derivation path of the seed phrase
// 	//
// 	for (let i = 0; i < 10; i++) {

// 		//Get 10 Addresses from the derived mnemonic
// 		const addressPath = `m/44'/116'/0'/0/${i}`;

// 		// Get the keypair from the address derivation path
// 		const addressKeypair = root.derivePath(addressPath);

// 		// Get the p2pkh base58 public address of the keypair
// 		const p2pkhaddy = denarius.payments.p2pkh({ pubkey: addressKeypair.publicKey, network }).address;

// 		const privatekey = addressKeypair.toWIF();
	
// 		//New Array called seedaddresses that is filled with address and path data currently, WIP and TODO
// 		seedaddresses.push({ address: p2pkhaddy, privkey: privatekey, path: addressPath });
// 	}

// 	// Console Log the full array - want to eventually push these into scripthash hashing and retrieve balances and then send from them
// 	console.log("Seed Address Array", seedaddresses);

// 	//Emit to our Socket.io Server
// 	// io.on('connection', function (socket) {
// 	// 	socket.emit("seed", {seedaddresses: seedaddresses});
// 	// 	// setInterval(() => {
// 	// 	// 	socket.emit("seed", {seedaddresses: seedaddresses});
// 	// 	// }, 60000);		
// 	// });

// });
// };

exports.getSeed = (req, res) => {
  const ip = require('ip');
  const ipaddy = ip.address();

  res.locals.lanip = ipaddy;

  req.session.loggedin2 = false;

  var totalbal = Storage.get('totalbal');

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
      for (let i = 0; i < 21; i++) { //20

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
  
    res.render('account/getseed', {
        title: 'Denarius Seed Phrase',
        totalbal: totalbal,
        seedphrase: store
    });
  });
});
};

//GET for Generate Mini Key Page
exports.genMini = function (req, res) {
  //var username = req.user.email;

  const ip = require('ip');
  const ipaddy = ip.address();

  res.locals.lanip = ipaddy;

  //Connect to our D node 
  //process.env.DUSER
  const client = new bitcoin.Client({
    host: decrypt(Storage.get('rpchost')),
    port: decrypt(Storage.get('rpcport')),
    user: decrypt(Storage.get('rpcuser')),
    pass: decrypt(Storage.get('rpcpass')),
    timeout: 30000
  });

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

    res.render('account/genmini', { title: 'Generate MiniKey', staketoggle: staketoggle, sendicon: sendicon, balance: balance, offline: offline, offlinebtn: offlinebtn, chaindl: chaindl, chaindlbtn: chaindlbtn });
    });

  });
});
};

//GET for Convert Mini Key Page
exports.convertMini = function (req, res) {
  //var username = req.user.email;

  const ip = require('ip');
  const ipaddy = ip.address();

  res.locals.lanip = ipaddy;

  //Connect to our D node 
  //process.env.DUSER
  const client = new bitcoin.Client({
    host: decrypt(Storage.get('rpchost')),
    port: decrypt(Storage.get('rpcport')),
    user: decrypt(Storage.get('rpcuser')),
    pass: decrypt(Storage.get('rpcpass')),
    timeout: 30000
  });

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

    res.render('account/convertmini', { title: 'Convert MiniKey', staketoggle: staketoggle, sendicon: sendicon, balance: balance, offline: offline, offlinebtn: offlinebtn, chaindl: chaindl, chaindlbtn: chaindlbtn });
    });

  });
});
};


//POST for KeepKey XPUBS
exports.xpub = (req, res) => {
  var xpubkk = req.body.xpubin;
  var daddress0 = req.body.addrin;

  const ip = require('ip');
  const ipaddy = ip.address();

  res.locals.lanip = ipaddy;

  //Connect to our D node 
  //process.env.DUSER
  const client = new bitcoin.Client({
    host: decrypt(Storage.get('rpchost')),
    port: decrypt(Storage.get('rpcport')),
    user: decrypt(Storage.get('rpcuser')),
    pass: decrypt(Storage.get('rpcpass')),
    timeout: 30000
  });

  const scripthasharray = [];
  const transactionhistoryarray = [];
  const utxoarray = [];
  const promises = [];

  //ElectrumX Hosts for Denarius
  const delectrumxhost1 = 'electrumx1.denarius.pro';
  const delectrumxhost2 = 'electrumx2.denarius.pro';
  const delectrumxhost3 = 'electrumx3.denarius.pro';
  const delectrumxhost4 = 'electrumx4.denarius.pro';

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
  
  if (xpubkk && daddress0) {
    //console.log("XPUB KEEPKEY Received: ", xpubkk);
    //req.locals.xpub = xpubkk;
    //req.locals.daddress = daddress0;

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
    const XPUBTOBASE = bs58.decode(xpubkk);
    const XPUBBYTESTOHEX = XPUBTOBASE.toString('hex');
    //console.log(XPUBBYTESTOHEX); // 164
    const xpubtopub = XPUBBYTESTOHEX.substring(90, XPUBBYTESTOHEX.length - 8); // Decoded Base58 XPub to last 33 bytes (privkey 32 bytes)
    //console.log("IS THIS THE COMPRESSED PUBKEY?" + xpubtopub);
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
      const electrum = new ElectrumCluster('Kronos ElectrumX Cluster', '1.4.1', 1, 2, ElectrumCluster.ORDER.RANDOM);
      
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

    //Grab Full Transaction History from D ElectrumX
    const txhistoryfull = async () => {
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

      const txs = [];

      const gethistory1 = await electrum.request('blockchain.scripthash.get_history', scripthash);

      const gethistory2 = await electrum.request('blockchain.scripthash.get_history', scripthashp2pk);

      console.log(gethistory1);
      console.log(gethistory2);

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
      const electrum = new ElectrumCluster('Kronos ElectrumX Cluster', '1.4.1', 1, 2, ElectrumCluster.ORDER.RANDOM);
      
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

      console.log(getuhistory1);
      console.log(getuhistory2);

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
          txhistoryfull().then(TXHistory => {
            utxohistory().then(UTXOHistory => {
        
        scripthasharray.push({address: daddress0, qr: qrcodedata, p2pkh: removechecksum, p2pk: xpubtopub, balance: globalData, txs: TXHistory, utxos: UTXOHistory});
        res({daddress0, qrcodedata, removechecksum, xpubtopub, globalData, TXHistory, UTXOHistory});

      });
    });
    });
      });
    }) );

    Promise.all(promises).then((values) => {

          //req.locals.balancearray = scripthasharray;
          //console.log(scripthasharray);

          // var socket_id33 = [];
          // //Emit to our Socket.io Server
          // res.io.on('connection', function (socket) {
          //   socket_id33.push(socket.id);
          //   if (socket_id33[0] === socket.id) {
          //     // remove the connection listener for any subsequent 
          //     // connections with the same ID
          //     res.io.removeAllListeners('connection'); 
          //   }
          //   socket.emit("kkbalance", {balancearray: scripthasharray,});
          //   console.log("EMITTED BALANCE");
          // });

        res.render('account/keepkeybal', { title: 'Kronos KeepKey Balance', balancearray: scripthasharray, staketoggle: staketoggle, sendicon: sendicon, balance: balance, offline: offline, offlinebtn: offlinebtn, chaindl: chaindl, chaindlbtn: chaindlbtn });
    });
  } else {
    console.log('ERROR DIDNT GET XPUB');
  }

});
});
});
};

//GET for KeepKey Denarius Client Page
exports.keepkey = function (req, res) {

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

    res.render('account/keepkey', { title: 'Kronos KeepKey', staketoggle: staketoggle, sendicon: sendicon, balance: balance, offline: offline, offlinebtn: offlinebtn, chaindl: chaindl, chaindlbtn: chaindlbtn });
    });

  });
});
};