'use strict';

const passport = require('passport');
const User = require('../models/User');
const bitcoin = require('bitcoin');
const WAValidator = require('wallet-address-validator');
const QRCode = require('qrcode');
const unirest = require('unirest');
const toastr = require('express-toastr');

var sendJSONResponse = function (res, status, content) {
    res.status(status);
    res.json(content);
};

// all config options are optional
var client = new bitcoin.Client({
    host: process.env.DNRHOST,
    port: process.env.DNRPORT,
    user: process.env.DNRUSER,
    pass: process.env.DNRPASS,
    timeout: 30000
});

/**
 * GET /withdraw
 * Withdraw page.
 */
exports.getWithdraw = (req, res) => {
  //var username = req.user.email;
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
        offline: offline,
        offlinebtn: offlinebtn,
        chaindl: chaindl,
        chaindlbtn: chaindlbtn
    });
  });
};

exports.getRaw = (req, res) => {
  //var username = req.user.email;
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
        offlinebtn: offlinebtn,
        chaindl: chaindl,
        chaindlbtn: chaindlbtn
    });
  });
};

exports.getPriv = (req, res) => {
  //var username = req.user.email;
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
        offlinebtn: offlinebtn,
        chaindl: chaindl,
        chaindlbtn: chaindlbtn,
        info: info
    });
  });
};

exports.getSign = (req, res) => {
  //var username = req.user.email;
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
        offlinebtn: offlinebtn,
        chaindl: chaindl,
        chaindlbtn: chaindlbtn
    });
  });
};

exports.getVerify = (req, res) => {
  //var username = req.user.email;
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
        offlinebtn: offlinebtn,
        chaindl: chaindl,
        chaindlbtn: chaindlbtn
    });
  });
};

exports.getBackup = (req, res) => {
  //var username = req.user.email;
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
        offlinebtn: offlinebtn,
        chaindl: chaindl,
        chaindlbtn: chaindlbtn
    });
  });
};


exports.addresses = function (req, res) {
  //var username = req.user.email;

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

  //List All Addresses
  client.listAddressGroupings(function (err, addresses, resHeaders) {
      if (err) {
        console.log(err);
        var offline = 'offlineoverlay';
        var offlinebtn = 'offlinebutton';
        var addresses = 'Offline';
      }

      var offline = 'onlineoverlay';
      var offlinebtn = 'onlinebutton';

      //var addy1 = addresses.slice(-1)[0];

      //var addy = addy1[0][0];

      var addresses = addresses[0];

      //console.log(addy);

      var account = '333D'; //Needs work

		client.getAddressesByAccount(`dpi(${account})`, function (err, addressess, resHeaders) {
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

      client.dumpPrivKey(`${addyy}`, function (err, privkey, resHeaders) {
        if (err) {
          console.log(err);
        }

        var chaindl = 'nooverlay';
        var chaindlbtn = 'nobtn';

      res.render('account/addresses', { title: 'My Addresses', addyy: addyy, addresses: addresses, balance: balance, privkey: privkey, offline: offline, offlinebtn: offlinebtn, chaindl: chaindl, chaindlbtn: chaindlbtn });

  });
});
});
});

}

exports.wallet = function (req, res) {
    var username = req.user.email;

    //List Balances
    client.getBalance(`dnrw(${username})`, 10, function (error, balance, resHeaders) {
        if (error) return console.log(error);

        if (balance <= 0) {
          balance = 0;
        }

        //List Transactions
        client.listTransactions(`dnrw(${username})`, 5, function (err, transactions, resHeaders) {
            if (err) return console.log(err);

        //List Account Address
        //client.getAccountAddress(`dnrw(${username})`, function (error, address, resHeaders) {
        client.getAddressesByAccount(`dnrw(${username})`, function (err, addresses, resHeaders) {
            if (error) return console.log(error);

            var address = addresses.slice(-1)[0];

            if (typeof address == 'undefined') {
                client.getNewAddress(`dnrw(${username})`, function (error, addr, resHeaders) {
                  if (error) return console.log(error);
                  address = addr;
                });
            }

            var qr = 'denarius:'+address;

            unirest.get("https://api.coinmarketcap.com/v1/ticker/denarius-d/")
              .headers({'Accept': 'application/json'})
              .end(function (result) {
                var usdprice = result.body[0]['price_usd'] * balance;
                var btcprice = result.body[0]['price_btc'] * balance;

            QRCode.toDataURL(qr, function(err, qrcode) {

            res.render('account/wallet', { title: 'My Wallet', user: req.user, usd: usdprice.toFixed(2), btc: btcprice.toFixed(8), address: address, qrcode: qrcode, balance: balance.toFixed(8), transactions: transactions });

            });
          });
          });
        });
    });
    /**
    var batch = [];
    for (var i = 0; i < 10; ++i) {
        batch.push({
            method: 'getbalance',
            params: [`dnrw(${username})`],
            method: 'getaddressesbyaccount',
            params: [`dnrw(${username})`]
        });
    }
    client.cmd(batch, function (err, balance, addresses, resHeaders) {
        if (err) return console.log(err);

        console.log(`${username}`, 'Addresses:', addresses, 'Balance:', balance);
    });
    */
};

//POST GET NEW ADDRESS

exports.address = function (req, res) {
    var username = req.user.email;

    client.getNewAddress(`dnrw(${username})`, function (error, address, resHeaders) {
        if (error) return console.log(error);

        var qr = 'denarius:'+address

        QRCode.toDataURL(qr, function(err, data_url) {

        res.render('account/newaddress', { title: 'New DNR Address', user: req.user, address: address, data_url: data_url });
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

    client.getBalance(function (error, info, resHeaders) {
        if (error) {
          console.log(error);
        }

        var balance = info;

    var valid = WAValidator.validate(`${sendtoaddress}`, 'DNR'); //Need to update to D still

    if (parseFloat(amount) - fee > balance) {
        req.toastr.error('Withdrawal amount exceeds your D balance!', 'Balance Error!', { positionClass: 'toast-bottom-right' });
        //req.flash('errors', { msg: 'Withdrawal amount exceeds your D balance'});
        return res.redirect('/withdraw');

    } else {

    if (valid) {

        client.sendToAddress(`${sendtoaddress}`, parseFloat(`${amount}`), function (error, sendFromtx, resHeaders) {
            if (error) {
                req.toastr.error('Insufficient Funds or Invalid Amount!', 'Invalid!', { positionClass: 'toast-bottom-right' });
                //req.flash('errors', { msg: 'Insufficient Funds or Invalid Amount!' });
                return res.redirect('/withdraw');

            } else {

                var sendtx = sendFromtx;
                var vamount = parseFloat(`${amount}`);

                req.toastr.success(`${vamount} D was sent successfully!`, 'Success!', { positionClass: 'toast-bottom-right' });
                req.flash('success', { msg: `Your <strong>${vamount} D</strong> was sent successfully! TX ID: <a href="https://coinexplorer.net/D/transaction/${sendtx}" target="_blank">${sendtx}</a>` });
                return res.redirect('/withdraw');
            }
        });

    } else {
        req.toastr.error('You entered an invalid Denarius (D) Address!', 'Invalid Address!', { positionClass: 'toast-bottom-right' });
        //req.flash('errors', { msg: 'You entered an invalid Denarius (D) Address!' });
        return res.redirect('/withdraw');
    }
  }
  });
};

exports.transactions = function (req, res) {
  //var username = req.user.email;

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

    res.render('account/tx', { title: 'Transactions', transactions: transactions, balance: balance, offline: offline, offlinebtn: offlinebtn, chaindl: chaindl, chaindlbtn: chaindlbtn });
    });

  });
};

/**
 * POST /sendraw
 * Send Raw Transaction to D network
 */
exports.sendRaw = (req, res, next) => {
  var rawtx = req.body.rawtx;

  client.getBalance(function (error, info, resHeaders) {
      if (error) {
        console.log(error);
      }

      var balance = info;

      client.sendRawTransaction(`${rawtx}`, function (error, tx, resHeaders) {
          if (error) {
              req.toastr.error('Insufficient Funds, Invalid Amount, or Transaction already exists!', 'Invalid!', { positionClass: 'toast-bottom-right' });
              //req.flash('errors', { msg: 'Insufficient Funds or Invalid Amount!' });
              return res.redirect('/rawtx');

          } else {

              var sendtx = tx;

              req.toastr.success(`Raw Transaction was sent successfully!`, 'Success!', { positionClass: 'toast-bottom-right' });
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

  client.getBalance(function (error, info, resHeaders) {
      if (error) {
        console.log(error);
      }

      var balance = info;

      client.importPrivKey(`${privkey}`, 'imported', 'false', function (error, success, resHeaders) {
          if (error) {
              req.toastr.error('Invalid Private Key or Wrong Format!', 'Invalid!', { positionClass: 'toast-bottom-right' });
              //req.flash('errors', { msg: 'Insufficient Funds or Invalid Amount!' });
              return res.redirect('/import');

          } else {

              req.toastr.success(`Imported private key successfully!`, 'Success!', { positionClass: 'toast-bottom-right' });
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

  client.getBalance(function (error, info, resHeaders) {
      if (error) {
        console.log(error);
      }

      var balance = info;

  var valid = WAValidator.validate(`${sendtoaddress}`, 'DNR'); //Need to update to D still

  if (valid) {

      client.signMessage(`${sendtoaddress}`, `${msg}`, function (error, signedmsghex, resHeaders) {
          if (error) {
              req.toastr.error('You dont own this address or an error occured!', 'Error!', { positionClass: 'toast-bottom-right' });
              //req.flash('errors', { msg: 'Insufficient Funds or Invalid Amount!' });
              return res.redirect('/sign');

          } else {

              var signed = signedmsghex;

              req.toastr.success(`Signed message successfully`, 'Success!', { positionClass: 'toast-bottom-right' });
              req.flash('success', { msg: `Your signed message <strong>${msg}</strong> is: <strong>${signed}</strong> signed with the address: <strong>${sendtoaddress}</strong>` });
              return res.redirect('/sign');
          }
      });

  } else {
      req.toastr.error('You entered an invalid Denarius (D) Address!', 'Invalid Address!', { positionClass: 'toast-bottom-right' });
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

  client.getBalance(function (error, info, resHeaders) {
      if (error) {
        console.log(error);
      }

      var balance = info;

  var valid = WAValidator.validate(`${sendtoaddress}`, 'DNR'); //Need to update to D still

  if (valid) {

      client.verifyMessage(`${sendtoaddress}`, `${signature}`, `${msg}`, function (error, signedmsghex, resHeaders) {
          if (error) {
              req.toastr.error('You dont own this address or an error occured!', 'Error!', { positionClass: 'toast-bottom-right' });
              //req.flash('errors', { msg: 'Insufficient Funds or Invalid Amount!' });
              return res.redirect('/verify');

          } else {

              var signed = signedmsghex;

              if (signed == true) {

                req.toastr.success(`Message is valid!`, 'Success!', { positionClass: 'toast-bottom-right' });
                req.flash('success', { msg: `Your message <strong>${msg}</strong> with signature: <strong>${signature}</strong> and the address: <strong>${sendtoaddress}</strong> is valid!` });
                return res.redirect('/verify');

              } else if (signed == false) {
                req.toastr.error('Message unable to be validated!', 'Message not verified!', { positionClass: 'toast-bottom-right' });
                return res.redirect('/verify');
              }
          }
      });

  } else {
      req.toastr.error('You entered an invalid Denarius (D) Address!', 'Invalid Address!', { positionClass: 'toast-bottom-right' });
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

  client.getBalance(function (error, info, resHeaders) {
      if (error) {
        console.log(error);
      }

      var balance = info;

      client.backupWallet(`${location}`, function (error, success, resHeaders) {
          if (error) {
              req.toastr.error('Invalid Location or Permission issue!', 'Error!', { positionClass: 'toast-bottom-right' });
              //req.flash('errors', { msg: 'Insufficient Funds or Invalid Amount!' });
              return res.redirect('/backup');

          } else {
              req.flash('success', { msg: `Your wallet was backed up successfully to <strong>${location}</strong>` });
              req.toastr.success(`Backup completed successfully!`, 'Success!', { positionClass: 'toast-bottom-right' });
              return res.redirect('/backup');
          }
      });
})
};

