/*
**************************************
**************************************
**************************************
* Kronos Controller
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
const files = require('fs');
const appRoot = require('app-root-path');
const split = require('split');
const os = require('os');
const dbr = require('../db.js');
const db = dbr.db;
const { isNullOrUndefined } = require('util');
const ElectrumClient = require('electrum-cash').Client;
const ElectrumCluster = require('electrum-cash').Cluster;
const bs58 = require('bs58');
const envfile = require('envfile');
const sourcePath = '.env';
const randomstring = require("randomstring");

const SECRET_KEY = files.readFileSync('./.senv', 'utf-8'); //process.env.SECRET_KEY

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

//Connect to our D node
const client = new bitcoin.Client({
	host: decrypt(process.env.DHOST),
	port: decrypt(process.env.DPORT),
	user: decrypt(process.env.DUSER),
	pass: decrypt(process.env.DPASS),
	timeout: 30000
});

//Unlock Wallet
exports.unlock = (req, res, next) => {
  var password = req.body.password;
  //var sendtoaddress = req.body.sendaddress;
  //var amount = req.body.amount;

  client.walletPassphrase(`${password}`, 9999999, function (error, unlocked, resHeaders) {
	//if (error) return console.log(error);

	if (error) {
		//req.flash('errors', { msg: 'Incorrect password!'});
		req.toastr.error('Wallet Unlock Error', 'Incorrect Password!', { positionClass: 'toast-bottom-right' });
		return res.redirect('/');
	} else {
		//req.flash('success', { msg: `Wallet Unlocked!` });
		req.toastr.success('Success!', 'Wallet Unlocked', { positionClass: 'toast-bottom-right' });
		return res.redirect('/');
	}

});
};

//Unlock for Staking Only Wallet
exports.unlockstaking = (req, res, next) => {
	var password = req.body.password;
	//var sendtoaddress = req.body.sendaddress;
	//var amount = req.body.amount;
  
	client.walletPassphrase(`${password}`, 9999999, true, function (error, unlocked, resHeaders) {
	  //if (error) return console.log(error);
  
	  if (error) {
		  //req.flash('errors', { msg: 'Incorrect password!'});
		  req.toastr.error('Wallet Unlock Error', 'Incorrect Password!', { positionClass: 'toast-bottom-right' });
		  return res.redirect('/');
	  } else {
		  //req.flash('success', { msg: `Wallet Unlocked!` });
		  req.toastr.success('Success!', 'Wallet Unlocked for Staking Only', { positionClass: 'toast-bottom-right' });
		  return res.redirect('/');
	  }
  
  });
  };

//Lock Wallet
exports.lock = (req, res, next) => {
	//var password = req.body.password;
	//var sendtoaddress = req.body.sendaddress;
	//var amount = req.body.amount;
  
	client.walletLock(function (error, lock, resHeaders) {
	  //if (error) return console.log(error);
  
	  if (error) {
		  //req.flash('errors', { msg: 'Incorrect password!'});
		  req.toastr.error('Wallet Lock Error', 'Error!', { positionClass: 'toast-bottom-right' });
		  return res.redirect('/');
	  } else {
		  //req.flash('success', { msg: `Wallet Unlocked!` });
		  req.toastr.success('Success!', 'Wallet Locked', { positionClass: 'toast-bottom-right' });
		  return res.redirect('/');
	  }
  
  });
  };

  //Encrypt Wallet
  exports.encrypt = (req, res, next) => {
	var password = req.body.passphrase;
	var password2 = req.body.passphrase2;
	//var sendtoaddress = req.body.sendaddress;
	//var amount = req.body.amount;

	//req.assert('password2', 'Passwords do not match').equals(req.body.passphrase);

	if (password == password2) {
		var passworded = password;
	} else {
		req.toastr.error('Passwords do not match', 'Passphrase Error!', { positionClass: 'toast-bottom-right' });
		return res.redirect('/');
	}
  
	client.encryptWallet(`${passworded}`, function (error, encrypt, resHeaders) {
	  //if (error) return console.log(error);
  
	  if (error) {
		  req.toastr.error('Wallet Encryption Error', 'Encryption Error!', { positionClass: 'toast-bottom-right' });
		  return res.redirect('/');
	  } else {
		  req.toastr.success('Success!', 'Wallet Encrypted', { positionClass: 'toast-bottom-right' });
		  return res.redirect('/');
	  }
  
  });
  };

  //Reboot Wallet
  exports.reboot = (req, res, next) => {

	//Execute denarius.daemon stop command
	shell.exec(`bash restartnode.sh`, function(err){
		if(err){
		  console.log(err);
		  req.toastr.error('Something went wrong!', 'Reboot Error!', { positionClass: 'toast-bottom-right' });
		  process.exit(0);
		  //return res.redirect('/');
		}
	});

	//req.toastr.success('Success!', 'Stopping Denarius...Please wait', { positionClass: 'toast-bottom-right' });

	//sleep(120000); // sleep for 120 seconds

	//req.toastr.success('Success!', 'Starting Denarius...Please wait', { positionClass: 'toast-bottom-right' });

	//sleep(120000); // sleep for 120 seconds

	//return res.redirect('/');

  };


  //POST Get private key
  exports.privkey = (req, res, next) => {
	var addi = req.body.addi;
	//var sendtoaddress = req.body.sendaddress;
	//var amount = req.body.amount;

	var valid = WAValidator.validate(`${addi}`, 'DNR'); //Need to update to D still

	if (valid) {

		client.dumpPrivKey(`${addi}`, function (error, unlocked, resHeaders) {
			//if (error) return console.log(error);
		
			if (error) {
				//req.flash('errors', { msg: 'Incorrect password!'});
				req.toastr.error('Your wallet is locked or you do not own that address!', 'Error!', { positionClass: 'toast-bottom-right' });
				return res.redirect('/addresses');

			} else {

				req.flash('success', { msg: `Your private key is <strong>${unlocked}</strong> for address ${addi}` });
				req.toastr.success(`Successfully obtained the private key! ${unlocked}`, 'Success!', { positionClass: 'toast-bottom-right' });
				return res.redirect('/addresses');

			}

		});

	} else {

        req.toastr.error('You entered an invalid Denarius (D) Address!', 'Invalid Address!', { positionClass: 'toast-bottom-right' });
        //req.flash('errors', { msg: 'You entered an invalid Denarius (D) Address!' });
		return res.redirect('/addresses');
		
    }
  
  };



/**
 * GET /login
 * Kronos Auth Login
 */
exports.login = (req, res) => {
	db.get('rpcuser', function (err, value) {
		if (err) {
		
		// If rpcuser does not exist in levelDB then go to page to create one
		res.render('setup', {title: 'Setup Kronos'});

		} else {
		
		// res.render('login', {title: 'Kronos Login'});

		db.get('username', function (err, value) {
			if (err) {
			  
			  // If username does not exist in levelDB then go to page to create one
			  res.render('create', {title: 'Create Kronos Login'});
	
			} else {
			  
			  res.render('login', {title: 'Kronos Login'});
	
			}
		});

		}
	});
};

/**
 * GET /auth
 * Kronos Auth Login
 */
exports.auth = (req, res) => {
	db.get('rpcuser', function (err, value) {
        if (err) {
          
          // If rpcuser does not exist in levelDB then go to page to create one
          res.render('setup', {title: 'Setup Kronos'});

        } else {
		  
		  
		db.get('username', function (err, value) {
			if (err) {
			
			// If username does not exist in levelDB then go to page to create one
			res.render('create', {title: 'Create Kronos Login'});

			} else {
			
			res.render('auth', {title: 'Kronos Authorization'});

			}
		});

		}
	});
};

/**
 * GET /autht
 * Kronos Terminal Auth Login
 */
exports.autht = (req, res) => {
	db.get('rpcuser', function (err, value) {
        if (err) {
          
          // If rpcuser does not exist in levelDB then go to page to create one
          res.render('setup', {title: 'Setup Kronos'});

        } else {
		  
			db.get('username', function (err, value) {
				if (err) {
				  
				  // If username does not exist in levelDB then go to page to create one
				  res.render('create', {title: 'Create Kronos Login'});
		
				} else {
				  
				  res.render('autht', {title: 'Kronos Authorization'});
		
				}
			});

		}
	});

};

/**
 * GET /authk
 * Kronos Terminal Pop Auth Login
 */
exports.authk = (req, res) => {
	db.get('rpcuser', function (err, value) {
        if (err) {
          
          // If rpcuser does not exist in levelDB then go to page to create one
          res.render('setup', {title: 'Setup Kronos'});

        } else {
		  
			db.get('username', function (err, value) {
				if (err) {
				  
				  // If username does not exist in levelDB then go to page to create one
				  res.render('create', {title: 'Create Kronos Login'});
		
				} else {
				  
				  res.render('authk', {title: 'Kronos Authorization'});
		
				}
			});

		}
	});

};

/**
 * POST /setup
 * Kronos Setup Configuration Post
 */
exports.setup = (request, response) => {
	var rpcuser = request.body.USER;
	var rpcpass = request.body.PASS;
	var rpchost = request.body.HOST;
	var rpcport = request.body.PORT;

	//var secretkey = request.body.SECRET;
	
	if (rpcuser && rpcpass && rpchost && rpcport) {

		const newclient = new bitcoin.Client({
			host: rpchost,
			port: rpcport,
			user: rpcuser,
			pass: rpcpass,
			timeout: 30000
		});

		newclient.getBalance(function(err, balance, resHeaders) {
			if (err) {
				// request.toastr.error('Connection to Denarius Failed, Retry configuration', 'Error!', { positionClass: 'toast-bottom-right' });
				// response.redirect('/login');
				// response.end();
				console.log('Denarius Connection Error, Check your configuration...');
			}

			//console.log('Balance:', balance);

			if (request.body && balance >= 0 && typeof balance != 'undefined') {

				console.log('Denarius Connected Successfully!');

				db.get('rpcpass', function (err, value) {
					if (err) {
					  
						// If rpc password does not exist in levelDB then go to page to create one
						// Encrypt the rpc user and pass for storing in the DB
						var encryptedrpcpass = encrypt(rpcpass);
						var encryptedrpcuser = encrypt(rpcuser);
						var encryptedrpchost = encrypt(rpchost);
						var encryptedrpcport = encrypt(rpcport);
	
						// Put the encrypted rpc username in the DB
						db.put('rpcuser', encryptedrpcuser, function (err) {
							if (err) console.log('Ooops!', err) // some kind of I/O error if so
							console.log('Encrypted RPC Username to DB');
						});
				
						// Put the encrypted rpc password in the DB
						db.put('rpcpass', encryptedrpcpass, function (err) {
							if (err) console.log('Ooops!', err) // some kind of I/O error if so
							console.log('Encrypted RPC Password to DB');
						});
	
						// Put the encrypted rpc host in the DB
						db.put('rpchost', encryptedrpchost, function (err) {
							if (err) console.log('Ooops!', err) // some kind of I/O error if so
							console.log('Encrypted RPC Host to DB');
						});
	
						// Put the encrypted rpc port in the DB
						db.put('rpcport', encryptedrpcport, function (err) {
							if (err) console.log('Ooops!', err) // some kind of I/O error if so
							console.log('Encrypted RPC Port to DB');
						});
	
						let parsedFile = envfile.parse(sourcePath);

						//console.log(envfile.parse(sourcePath));

						parsedFile.DHOST = encryptedrpchost;
						parsedFile.DPORT = encryptedrpcport;
						parsedFile.DUSER = encryptedrpcuser;
						parsedFile.DPASS = encryptedrpcpass;
						// parsedFile.SECRET_KEY = randomstring.generate(33);
						// parsedFile.SESSION_KEY = randomstring.generate(33);

						files.writeFileSync('./.env', envfile.stringify(parsedFile));

						//console.log(envfile.stringify(parsedFile));

						request.toastr.success('Kronos Denarius Configuration Successful', 'Success!', { positionClass: 'toast-bottom-right' });
						response.redirect('/login');
						response.end();
			
					} else {
	
					  //Found rpcpass in DB so redirecting back to login
					  response.render('login', {title: 'Kronos Login'});
					  response.end();
					}
				});			
	
			} else {
				// request.toastr.error('Error!', 'Error!', { positionClass: 'toast-bottom-right' });
				// response.redirect('/login');
				// response.end();
				request.toastr.error('Connection to Denarius Failed, Retry your configuration!', 'Error!', { positionClass: 'toast-bottom-right' });
				response.redirect('/login');
				response.end();
			}
		});
		
		//response.end();
	
	} else {
		//response.send('Please enter Username and Password!');
		request.toastr.error('Please enter your Denarius RPC User, Pass, Host, and Port!', 'Error!', { positionClass: 'toast-bottom-right' });
		response.redirect('/login');
		response.end();
	}
};

/**
 * POST /create
 * Kronos Auth Creation
 */
exports.create = (request, response) => {
	var username = request.body.PPU1;
	var password = request.body.PPP1;
	var password2 = request.body.PPP2;
	
	if (username && password) {

		if (request.body && password == password2) {

			db.get('password', function (err, value) {
				if (err) {
				  
					// If password does not exist in levelDB then go to page to create one
					// Encrypt the user and pass for storing in the DB
					var encryptedpass = encrypt(password);
					var encrypteduser = encrypt(username);

					// Put the encrypted username in the DB
					db.put('username', encrypteduser, function (err) {
						if (err) console.log('Ooops!', err) // some kind of I/O error if so
						console.log('Encrypted Username to DB');
					});
			
					// Put the encrypted password in the DB
					db.put('password', encryptedpass, function (err) {
						if (err) console.log('Ooops!', err) // some kind of I/O error if so
						console.log('Encrypted Password to DB');
					});

					var mnemonic;
					// Fetch the Kronos LevelDB Seedphrase
					db.get('seedphrase', function (err, value) {
						if (err) {
							
							// If seedphrase does not exist in levelDB then generate one with the password
							mnemonic = bip39.generateMnemonic(256);

							// Encrypt the seedphrase for storing in the DB
							var encryptedmnemonic = encrypt(mnemonic);
							//console.log("Encrypted Mnemonic", encryptedmnemonic);

							// Put the encrypted passworded seedphrase in the DB
							db.put('seedphrase', encryptedmnemonic, function (err) {
								if (err) return console.log('Ooops!', err) // some kind of I/O error if so
								console.log('Encrypted Seed Phrase to DB');
							});

						} else {
							var decryptedmnemonic = decrypt(value);
							mnemonic = decryptedmnemonic;
						}

					});
					
					// //Stored User/Pass to DB successfully now setup the session
					request.session.loggedin = false;
					request.session.username = username;
					request.toastr.success('Created Kronos User', 'Success!', { positionClass: 'toast-bottom-right' });
					response.redirect('/login');
					response.end();
		
				} else {

				  //Found password in DB so redirecting back to login
				  response.render('login', {title: 'Kronos Login'});
				  response.end();
				}
			});			

		} else {
			request.toastr.error('Passwords do not match!', 'Error!', { positionClass: 'toast-bottom-right' });
			response.redirect('/login');
			response.end();
		}
		
		//response.end();
	
	} else {
		//response.send('Please enter Username and Password!');
		request.toastr.error('Please enter Username and Password!', 'Error!', { positionClass: 'toast-bottom-right' });
		response.redirect('/login');
		response.end();
	}
};

/**
 * GET /logout
 * Kronos Auth Logout
 */
exports.logout = (req, res) => {
	req.session.loggedin = false;
	req.session.loggedin2 = false;
	req.session.username = '';
	req.toastr.error('Logged Out of Kronos', 'Logged Out!', { positionClass: 'toast-bottom-right' });
	res.redirect('/login');
};

/**
 * POST /login
 * Kronos Auth Login
 */
exports.postlogin = (request, response) => {
	var username = request.body.PPU1;
	var password = request.body.PPP1;
	
	if (username && password) {

		db.get('username', function (err, value) {
			if (err) {
			  // If username does not exist in levelDB then go to page to create one
			  //response.render('create', {title: 'Create Kronos Login'});
			  //request.toastr.error('Username does not exist!', 'Error!', { positionClass: 'toast-bottom-right' });
			} else {
				//If it does exist
				var decrypteduser = decrypt(value);

				db.get('password', function (err, value) {
					if (err) {
						// If password does not exist in levelDB then go to page to create one
						//request.toastr.error('Password does not exist!', 'Error!', { positionClass: 'toast-bottom-right' });
					  } else {

						//If it does exist
						var decryptedpass = decrypt(value);

						if (request.body && (username == decrypteduser) && (password == decryptedpass)) {
							request.session.loggedin = true;
							request.session.username = username;
							request.toastr.success('Logged into Kronos', 'Success!', { positionClass: 'toast-bottom-right' });
							response.redirect('/');
							response.end();
						} else {
							//response.send('Incorrect Username and/or Password!');
							//request.flash('success', { msg: 'TEST' });
							request.toastr.error('Incorrect Username and/or Password!', 'Error!', { positionClass: 'toast-bottom-right' });
							response.redirect('/login');
							response.end();
						}
					}

				});
	
			}
		});
		
		//response.end();
	
	} else {
		//response.send('Please enter Username and Password!');
		request.toastr.error('Please enter a Username and Password!', 'Error!', { positionClass: 'toast-bottom-right' });
		response.redirect('/login');
		response.end();
	}
};

/**
 * POST /auth
 * Kronos Auth Login
 */
exports.postAuth = (request, response) => {
	var username = request.body.PPU1;
	var password = request.body.PPP1;
	
	if (username && password) {

		db.get('username', function (err, value) {
			if (err) {
			  // If username does not exist in levelDB then go to page to create one
			  //response.render('create', {title: 'Create Kronos Login'});
			  //request.toastr.error('Username does not exist!', 'Error!', { positionClass: 'toast-bottom-right' });
			} else {
				//If it does exist
				var decrypteduser = decrypt(value);

				db.get('password', function (err, value) {
					if (err) {
						// If password does not exist in levelDB then go to page to create one
						//request.toastr.error('Password does not exist!', 'Error!', { positionClass: 'toast-bottom-right' });
					  } else {

						//If it does exist
						var decryptedpass = decrypt(value);

						if (request.body && (username == decrypteduser) && (password == decryptedpass)) {
							request.session.loggedin = true;
							request.session.loggedin2 = true;
							request.session.username = username;
							request.toastr.success('Authed Kronos', 'Success!', { positionClass: 'toast-bottom-right' });
							response.redirect('/seed');
							response.end();
						} else {
							//response.send('Incorrect Username and/or Password!');
							//request.flash('success', { msg: 'TEST' });
							request.toastr.error('Incorrect Username and/or Password!', 'Error!', { positionClass: 'toast-bottom-right' });
							response.redirect('/auth');
							response.end();
						}
					}

				});
	
			}
		});
		
		//response.end();
	
	} else {
		//response.send('Please enter Username and Password!');
		request.toastr.error('Please enter a Username and Password!', 'Error!', { positionClass: 'toast-bottom-right' });
		response.redirect('/auth');
		response.end();
	}
};

/**
 * POST /autht
 * Kronos Terminal Auth Login
 */
exports.postAutht = (request, response) => {
	var username = request.body.PPU1;
	var password = request.body.PPP1;

	const ip = require('ip');
	const ipaddy = ip.address();
  
	response.locals.lanip = ipaddy;
	
	if (username && password) {

		db.get('username', function (err, value) {
			if (err) {
			  // If username does not exist in levelDB then go to page to create one
			  //response.render('create', {title: 'Create Kronos Login'});
			  //request.toastr.error('Username does not exist!', 'Error!', { positionClass: 'toast-bottom-right' });
			} else {
				//If it does exist
				var decrypteduser = decrypt(value);

				db.get('password', function (err, value) {
					if (err) {
						// If password does not exist in levelDB then go to page to create one
						//request.toastr.error('Password does not exist!', 'Error!', { positionClass: 'toast-bottom-right' });
					  } else {

						//If it does exist
						var decryptedpass = decrypt(value);

						if (request.body && (username == decrypteduser) && (password == decryptedpass)) {
							request.session.loggedin = true;
							request.session.loggedin3 = true;
							request.session.username = username;
							request.toastr.success('Authed Kronos', 'Success!', { positionClass: 'toast-bottom-right' });
							response.redirect('http://'+ip.address()+':3300/terminal');
							response.end();
						} else {
							//response.send('Incorrect Username and/or Password!');
							//request.flash('success', { msg: 'TEST' });
							request.toastr.error('Incorrect Username and/or Password!', 'Error!', { positionClass: 'toast-bottom-right' });
							response.redirect('http://'+ip.address()+':3000/autht');
							response.end();
						}
					}

				});
	
			}
		});
		
		//response.end();
	
	} else {
		//response.send('Please enter Username and Password!');
		request.toastr.error('Please enter a Username and Password!', 'Error!', { positionClass: 'toast-bottom-right' });
		response.redirect('http://'+ip.address()+':3000/autht');
		response.end();
	}
};

/**
 * POST /authk
 * Kronos Terminal Popout Auth Login
 */
exports.postAuthk = (request, response) => {
	var username = request.body.PPU1;
	var password = request.body.PPP1;

	const ip = require('ip');
	const ipaddy = ip.address();
  
	response.locals.lanip = ipaddy;
	
	if (username && password) {

		db.get('username', function (err, value) {
			if (err) {
			  // If username does not exist in levelDB then go to page to create one
			  //response.render('create', {title: 'Create Kronos Login'});
			  //request.toastr.error('Username does not exist!', 'Error!', { positionClass: 'toast-bottom-right' });
			} else {
				//If it does exist
				var decrypteduser = decrypt(value);

				db.get('password', function (err, value) {
					if (err) {
						// If password does not exist in levelDB then go to page to create one
						//request.toastr.error('Password does not exist!', 'Error!', { positionClass: 'toast-bottom-right' });
					  } else {

						//If it does exist
						var decryptedpass = decrypt(value);

						if (request.body && (username == decrypteduser) && (password == decryptedpass)) {
							request.session.loggedin = true;
							request.session.loggedin4 = true;
							request.session.username = username;
							request.toastr.success('Authed Kronos', 'Success!', { positionClass: 'toast-bottom-right' });
							response.redirect('http://'+ip.address()+':3300/termpop');
							response.end();
						} else {
							//response.send('Incorrect Username and/or Password!');
							//request.flash('success', { msg: 'TEST' });
							request.toastr.error('Incorrect Username and/or Password!', 'Error!', { positionClass: 'toast-bottom-right' });
							response.redirect('http://'+ip.address()+':3000/authk');
							response.end();
						}
					}

				});
	
			}
		});
		
		//response.end();
	
	} else {
		//response.send('Please enter Username and Password!');
		request.toastr.error('Please enter a Username and Password!', 'Error!', { positionClass: 'toast-bottom-right' });
		response.redirect('http://'+ip.address()+':3000/authk');
		response.end();
	}
};


//POST Wallet Notify
exports.notification = (req, res, next) => {
var notifydata = req.body.txid;

console.log("Transaction Notify Received: ", notifydata);

files.writeFile('notifies.txt', notifydata, function (err) {
	if (err) throw err;
	console.log('TXID Written to File');
});

res.send('Got your notify!');
next();

};