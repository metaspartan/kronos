/*
**************************************
**************************************
**************************************
* Kronos Auth Controller
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
const randomstring = require("randomstring");
const Storage = require('json-storage-fs');
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

if (typeof Storage.get('rpchost') == 'undefined') {
	Storage.set('rpchost', '127.0.0.1');
	Storage.set('rpcport', '32369');
	Storage.set('rpcuser', 'null');
	Storage.set('rpcpass', 'null');
}

//Connect to our D node 
//process.env.DUSER
const client = new bitcoin.Client({
	host: decrypt(Storage.get('rpchost')),
	port: decrypt(Storage.get('rpcport')),
	user: decrypt(Storage.get('rpcuser')),
	pass: decrypt(Storage.get('rpcpass')),
	timeout: 30000
});

/**
 * GET /login
 * Kronos Auth Login
 */
exports.login = (req, res) => {
	db.get('created', function (err, value) { //Change from rpcuser to created and give bool for when done with setup
		if (err) {

		// if (Storage.get('mode') != 'simple') {
		// 	res.render('login', {title: 'Kronos Login'});
		// } else if (Storage.get('mode') != 'advanced') {
		// 	res.render('login', {title: 'Kronos Login'});
		// }

		res.render('select', {title: 'Setup Kronos'}); //Other Setup
		
		// If rpcuser does not exist in levelDB then go to page to create one
		//res.render('setup', {title: 'Setup Kronos'}); //Other Setup

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
	db.get('created', function (err, value) {
        if (err) {
          
          // If created does not exist in levelDB then go to page to create one
          res.render('select', {title: 'Setup Kronos'});

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
	db.get('created', function (err, value) {
        if (err) {
          
          // If rpcuser does not exist in levelDB then go to page to create one
          res.render('select', {title: 'Setup Kronos'});

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
	db.get('created', function (err, value) {
        if (err) {
          
          // If rpcuser does not exist in levelDB then go to page to create one
          res.render('select', {title: 'Setup Kronos'});

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
 * POST /setup 2/3
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

						// var createdinfo = "true";

						// // Put created true into DB
						// db.put('created', createdinfo, function (err) {
						// 	if (err) console.log('Ooops!', err) // some kind of I/O error if so
						// 	console.log('New Setup: True');
						// });
	
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

						//Store into localStorage for dynamic pulling upon login
						Storage.set('rpchost', encryptedrpchost);
						Storage.set('rpcport', encryptedrpcport);
						Storage.set('rpcuser', encryptedrpcuser);
						Storage.set('rpcpass', encryptedrpcpass);
						Storage.set('mode', 'advanced');

						//console.log(envfile.stringify(parsedFile));

						request.toastr.success('Kronos Advanced Denarius Configuration Successful', 'Success!', { positionClass: 'toast-bottom-right' });
						response.render('create', {title: 'Kronos Login Creation'});
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

					var createdinfo = "true";

					// Put created true into DB
					db.put('created', createdinfo, function (err) {
						if (err) console.log('Ooops!', err) // some kind of I/O error if so
						console.log('New Setup: True');
					});

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

					Storage.set('created', createdinfo);
					Storage.set('username', encrypteduser);
					Storage.set('password', encryptedpass);

					// var mnemonic;
					// // Fetch the Kronos LevelDB Seedphrase
					// db.get('seedphrase', function (err, value) {
					// 	if (err) {
							
					// 		// If seedphrase does not exist in levelDB then generate one with the password
					// 		mnemonic = bip39.generateMnemonic(256);

					// 		// Encrypt the seedphrase for storing in the DB
					// 		var encryptedmnemonic = encrypt(mnemonic);
					// 		//console.log("Encrypted Mnemonic", encryptedmnemonic);

					// 		// Put the encrypted passworded seedphrase in the DB
					// 		db.put('seedphrase', encryptedmnemonic, function (err) {
					// 			if (err) return console.log('Ooops!', err) // some kind of I/O error if so
					// 			console.log('Encrypted Seed Phrase to DB');
					// 		});

					// 	} else {
					// 		var decryptedmnemonic = decrypt(value);
					// 		mnemonic = decryptedmnemonic;
					// 	}

					// });
					
					// //Stored User/Pass to DB successfully now setup the session
					request.session.loggedin = false; //Make them sign in again after setup
					request.session.username = username;
					request.toastr.success('Created Kronos User, Setup Successful, Please login!', 'Success!', { positionClass: 'toast-bottom-right' });
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

//POST
exports.simple = (request, response) => {
	var seedphrase = request.body.SEED;

	//var secretkey = request.body.SECRET;
	
	if (seedphrase) {
			//console.log('Balance:', balance);

			if (request.body) {

						db.get('seedphrase', function (err, value) {
							if (err) {

								var encryptedseed = encrypt(seedphrase);

								// Put the encrypted passworded seedphrase in the DB
								db.put('seedphrase', encryptedseed, function (err) {
									if (err) return console.log('Ooops!', err) // some kind of I/O error if so
									console.log('Encrypted Seed Phrase to DB');
								});

								Storage.set('seed', encryptedseed);

							} else {
								var decryptedmnemonic = decrypt(value);
								seedphrase = decryptedmnemonic;
							}

						});

						Storage.set('mode', 'simple');

						//console.log(envfile.stringify(parsedFile));

						request.toastr.success('Kronos Simple Configuration Successful', 'Success!', { positionClass: 'toast-bottom-right' });
						response.render('create', {title: 'Kronos Login Creation'});
						response.end();	
	
			} else {
				request.toastr.error('Failed!', 'Error!', { positionClass: 'toast-bottom-right' });
				response.redirect('/login');
				response.end();
			}
	
	} else {
		request.toastr.error('Please select a seed phrase!', 'Error!', { positionClass: 'toast-bottom-right' });
		response.redirect('/login');
		response.end();
	}
};

//GET IMPORT SEED
exports.getimport = (req, res) => {
	//utils.HDNode.isValidMnemonic("action glow era all liquid critic achieve lawsuit era anger loud slight"); // returns true

	// Generate Seed Phrase and pass it to our rendered view
	mnemonic = bip39.generateMnemonic(256);

	res.render('import', {
        title: 'Core Mode Import', genseed: mnemonic
    });
}

//POST IMPORT SEED
exports.importseed = (request, response) => {
	var seedphrase = request.body.SEEDPHRASE;
	
	if (seedphrase && request.body) {

			if (ethers.utils.isValidMnemonic(seedphrase)) {

				//Import the new seedphrase and erase the previous no matter what if valid.
				db.get('seedphrase', function (err, value) {
					if (err) {

						var encryptedseed = encrypt(seedphrase);

						// Put the encrypted passworded seedphrase in the DB
						db.put('seedphrase', encryptedseed, function (err) {
							if (err) return console.log('Ooops!', err) // some kind of I/O error if so
							console.log('Encrypted Seed Phrase to DB');
						});
						Storage.set('seed', encryptedseed);

					} else {
						var encryptedseed = encrypt(seedphrase);

						// Put the encrypted passworded seedphrase in the DB
						db.put('seedphrase', encryptedseed, function (err) {
							if (err) return console.log('Ooops!', err) // some kind of I/O error if so
							console.log('Encrypted Seed Phrase to DB');
						});

						Storage.set('seed', encryptedseed);
					}
				});

				request.toastr.success('Kronos Seed Import Successful!', 'Success!', { positionClass: 'toast-bottom-right' });
				response.redirect('/login');
				response.end();	
	
			} else {
				request.toastr.error('Invalid seed phrase! Try something else!', 'Error!', { positionClass: 'toast-bottom-right' });
				response.redirect('/import');
				response.end();
			}
	
	} else {
		request.toastr.error('Please enter a seed phrase!', 'Error!', { positionClass: 'toast-bottom-right' });
		response.redirect('/import');
		response.end();
	}
};

//GET Core MODE
exports.getsimple = (req, res) => {

	var mnemonic;
			
	// Generate Seed Phrase and pass it to our rendered view
	mnemonic = bip39.generateMnemonic(256);

	res.render('simple', {
        title: 'Core Mode Setup', seedphrase: mnemonic
    });

};

//GET ADVANCED MODE
exports.getsetup = (req, res) => {

	res.render('setup', {
        title: 'Advanced Mode Setup'
    });

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

							if (Storage.get('mode') == 'simple') {
								//Storage.set('mode', 'simple');
								response.redirect('/dashsimple');
								response.end();
							} else if (Storage.get('mode') == 'advanced') {
								response.redirect('/');
								response.end();
							}
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
							response.redirect('/sseed');
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


//GET Sweeping privkey
exports.getsweep = (req, res) => {
	//utils.HDNode.isValidMnemonic("action glow era all liquid critic achieve lawsuit era anger loud slight"); // returns true

	// Generate Seed Phrase and pass it to our rendered view
	//mnemonic = bip39.generateMnemonic(256);

	res.render('import', {
        title: 'Core Mode Sweep Private Key'
    });
}

//POST Sweeping privkey
exports.sweepkey = (request, response) => {
	var seedphrase = request.body.SEEDPHRASE;
	
	if (seedphrase && request.body) {

			if (ethers.utils.isValidMnemonic(seedphrase)) {

				//Import the new seedphrase and erase the previous no matter what if valid.
				db.get('seedphrase', function (err, value) {
					if (err) {

						var encryptedseed = encrypt(seedphrase);

						// Put the encrypted passworded seedphrase in the DB
						db.put('seedphrase', encryptedseed, function (err) {
							if (err) return console.log('Ooops!', err) // some kind of I/O error if so
							console.log('Encrypted Seed Phrase to DB');
						});
						Storage.set('seed', encryptedseed);

					} else {
						var encryptedseed = encrypt(seedphrase);

						// Put the encrypted passworded seedphrase in the DB
						db.put('seedphrase', encryptedseed, function (err) {
							if (err) return console.log('Ooops!', err) // some kind of I/O error if so
							console.log('Encrypted Seed Phrase to DB');
						});

						Storage.set('seed', encryptedseed);
					}
				});

				request.toastr.success('Kronos Seed Import Successful!', 'Success!', { positionClass: 'toast-bottom-right' });
				response.redirect('/login');
				response.end();	
	
			} else {
				request.toastr.error('Invalid seed phrase! Try something else!', 'Error!', { positionClass: 'toast-bottom-right' });
				response.redirect('/sweep');
				response.end();
			}
	
	} else {
		request.toastr.error('Please enter a seed phrase!', 'Error!', { positionClass: 'toast-bottom-right' });
		response.redirect('/sweep');
		response.end();
	}
};