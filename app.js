/**
 * 
 * 
 * 
 * Kronos by Carsen Klock 2020, Main app.js
 * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * * KRONOS - DECENTRALIZED APPLICATION AND LAN SERVER
 * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * 
 *  _        _______  _______  _        _______  _______ 
 * | \    /\(  ____ )(  ___  )( (    /|(  ___  )(  ____ \
 * |  \  / /| (    )|| (   ) ||  \  ( || (   ) || (    \/
 * |  (_/ / | (____)|| |   | ||   \ | || |   | || (_____ 
 * |   _ (  |     __)| |   | || (\ \) || |   | |(_____  )
 * |  ( \ \ | (\ (   | |   | || | \   || |   | |      ) |
 * |  /  \ \| ) \ \__| (___) || )  \  || (___) |/\____) |
 * |_/    \/|/   \__/(_______)|/    )_)(_______)\_______)
 *
 *
 * Kronos Module dependencies.
 * 
 * 
 * 
 */
const express = require('express');
const compression = require('compression');
const session = require('express-session');
const bodyParser = require('body-parser');
const logger = require('morgan');
const errorHandler = require('errorhandler');
const lusca = require('lusca');
const dotenv = require('dotenv');
const flash = require('express-flash');
const flashc = require('connect-flash');
const path = require('path');
const expressStatusMonitor = require('express-status-monitor');
const multer = require('multer');
const bitcoin = require('bitcoin');
const WAValidator = require('wallet-address-validatord');
const QRCode = require('qrcode');
const base32 = require('thirty-two');
const sprintf = require('sprintf-js');
const unirest = require('unirest');
const tribus = require('tribus-hashjs');
const si = require('systeminformation');
const ProgressBar = require('progressbar.js');
const toastr = require('express-toastr');
const upload = multer({ dest: path.join(__dirname, 'uploads') });
const ip = require('ip');
const shell = require('shelljs');
const fs = require('fs');
const os = require('os');
const appRoot = require('app-root-path');
const files = require('fs');
const gritty = require('gritty');
const rateLimit = require("express-rate-limit");
const randomstring = require("randomstring");
const Storage = require('json-storage-fs');
const mkdirp = require('mkdirp');


const crypto = require('crypto')
const Swarm = require('discovery-swarm')
const defaults = require('dat-swarm-defaults')
const getPort = require('get-port')
const readline = require('readline')

// /**
//  * Here we will save our TCP peer connections
//  * using the peer id as key: { peer_id: TCP_Connection }
//  */
// const peers = {}
// // Counter for connections, used for identify connections
// let connSeq = 0

// // Peer Identity, a random hash for identify your peer
// const myId = crypto.randomBytes(32)
// console.log('Your Kronos Peer identity: ' + myId.toString('hex'))

// // reference to redline interface
// let rl
// /**
//  * Function for safely call console.log with readline interface active
//  */
// function log () {
//   if (rl) {
//     rl.clearLine()    
//     rl.close()
//     rl = undefined
//   }
//   for (let i = 0, len = arguments.length; i < len; i++) {
//     console.log(arguments[i])
//   }
//   askUser()
// }

// /*
// * Function to get text input from user and send it to other peers
// */
// const askUser = async () => {
//   rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout
//   })

//   rl.question('Send message: ', message => {
//     // Broadcast to peers
//     for (let id in peers) {
//       peers[id].conn.write(message)
//     }
//     rl.close()
//     rl = undefined
//     askUser()
//   });
// }

// /** 
//  * Default DNS and DHT servers
//  * This servers are used for peer discovery and establishing connection
//  */
// const config = defaults({
//   // peer-id
//   id: myId,
// })

// /**
//  * discovery-swarm library establishes a TCP p2p connection and uses
//  * discovery-channel library for peer discovery
//  */
// const sw = Swarm(config)


// ;(async () => {

//   // Choose a random unused port for listening TCP peer connections
//   const port = await getPort()

//   sw.listen('33337') //P2P Port 33337
//   console.log('Listening to port: ' + port)

//   /**
//    * The channel we are connecting to.
//    * Peers should discover other peers in this channel
//    */
//   sw.join('kronos')

//   sw.on('connection', (conn, info) => {
//     // Connection id
//     const seq = connSeq

//     const peerId = info.id.toString('hex')
//     log(`Connected #${seq} to peer: ${peerId}`)

//     // Keep alive TCP connection with peer
//     if (info.initiator) {
//       try {
//         conn.setKeepAlive(true, 600)
//       } catch (exception) {
//         log('exception', exception)
//       }
//     }

//     conn.on('data', data => {
//       // Here we handle incomming messages
//       log(
//         'Received Message from peer ' + peerId,
//         '----> ' + data.toString()
//       )
//     })

//     conn.on('close', () => {
//       // Here we handle peer disconnection
//       log(`Connection ${seq} closed, peer id: ${peerId}`)
//       // If the closing connection is the last connection with the peer, removes the peer
//       if (peers[peerId].seq === seq) {
//         delete peers[peerId]
//       }
//     })

//     // Save the connection
//     if (!peers[peerId]) {
//       peers[peerId] = {}
//     }
//     peers[peerId].conn = conn
//     peers[peerId].seq = seq
//     connSeq++

//   })

//   // Read user message from command line
//   askUser()  

// })()
var currentOS = os.platform();

function getUserHome() {
  // From process.env 
  if (process.platform == 'win32') {
    if (!mkdirp.sync(process.env.APPDATA+'\\Kronos\\DATA\\')) {
      mkdirp.sync(process.env.APPDATA+'\\Kronos\\DATA\\kronosleveldb\\');
      return process.env.APPDATA+'\\Kronos\\DATA\\'; 
    }
    return process.env.APPDATA+'\\Kronos\\DATA\\'; 
  } else {
    if (!mkdirp.sync(process.env.HOME+'/Kronos/DATA/')) {
      mkdirp.sync(process.env.HOME+'/Kronos/DATA/kronosleveldb/');
      return process.env.HOME+'/Kronos/DATA/'; 
    }
    return process.env.HOME+'/Kronos/DATA/'; 
  }
}

var dir = getUserHome();

// if (!mkdirp.sync(dir)){
//     //fs.mkdirSync(dir);
//     if (process.platform == 'win32') {
//       mkdirp.sync(dir);
//       mkdirp.sync(process.env.APPDATA+'\\Kronos\\DATA\\kronosleveldb');
//     } else {
//       mkdirp.sync(dir);
//       mkdirp.sync(process.env.HOME+'/Kronos/DATA/kronosleveldb/');
//     }
// }

if (currentOS === 'linux') {
  const randosecret = randomstring.generate(42);
  const randosess = randomstring.generate(42);
  //let linkey = files.readFileSync('.env', 'utf-8');
  //console.log(`Kronos Data Directory: ` + getUserHome()+`\\Kronos\\DATA`); 
  
  if (!fs.existsSync(getUserHome()+'.env')) {
    fs.writeFileSync(getUserHome()+'.env', `KEY=${randosecret}\nSESS_KEY=${randosess}`);
  }

} else {
  // const randosecret = randomstring.generate(42);
  // const randosess = randomstring.generate(42);
  // let keytary = keytar.getPasswordSync('Kronos', 'localkey');

  // // console.log('Keytar: ' + keytary);

  // if (keytary == null) {
  //   keytar.setPasswordSync('Kronos', 'localkey', randosecret);
  //   keytar.setPasswordSync('Kronos', 'localses', randosess);
  // }
  const randosecret = randomstring.generate(42);
  const randosess = randomstring.generate(42);

  //console.log(`Kronos Data Directory: ` + getUserHome()+`\\Kronos\\DATA`); 
  
  if (!fs.existsSync(getUserHome()+`.env`)) {
    fs.writeFileSync(getUserHome()+`.env`, `KEY=${randosecret}\nSESS_KEY=${randosess}`);
  }
}

//Print in console your LAN IP
console.log(`Kronos running on your LAN: ${ip.address()} on platform ${currentOS}`);

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
//dotenv.load({ path: '.env' });

dotenv.config({ path: getUserHome()+`.env` });

// var privateKey  = fs.readFileSync('./ssl/kronos.key', 'utf8');
// var certificate = fs.readFileSync('./ssl/kronos.crt', 'utf8');

// var credentials = {key: privateKey, cert: certificate};

/**
 * Controllers (route handlers).
 */
const kronosController = require('./controllers/kronos');
const authController = require('./controllers/auth');
const dashController = require('./controllers/dashboard');
const sDashController = require('./controllers/simple/dashboard');
const sTXController = require('./controllers/simple/txs.js');
const toolsController = require('./controllers/tools');
const walletController = require('./controllers/wallet');
const explorerController = require('./controllers/explorer');

/**
 * Create Express server.
 */
const app = express();

const server = require('http').Server(app);
//const httpsserver = require('https').createServer(credentials, app);
const io = require('socket.io')(server);
const sharedsession = require("express-socket.io-session");
io.setMaxListeners(69); 
const port = 3000;

/**
 * Express configuration.
 */
//app.set('port', port);

app.set('views', path.join(__dirname, 'views'));

app.set('view engine', 'pug');

app.use(expressStatusMonitor());

app.use(compression());

app.use(logger('dev'));

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

app.use(flash());

//app.use(lusca.xframe('ALLOW-FROM 127.0.0.1'));

app.use(lusca.xssProtection(true));

app.use((req, res, next) => {
  res.io = io;
  //Emit to our Socket.io Server for Notifications
  let socket_idx = [];
  res.io.on('connection', function (socket) {

    socket_idx.push(socket.id);

    if (socket_idx[0] === socket.id) {
      // remove the connection listener for any subsequent 
      // connections with the same ID
      res.io.removeAllListeners('connection');
    }

    //socket.emit("notifications", {notifydb: notifydata});

    var notifydb;
    var thedir = appRoot + '/notifies.txt';
    var thedb = files.readFileSync(thedir).toString();
    
    if (thedb == '') {
      notifydb = '';
    } else {
      notifydb = thedb;      

      console.log("IM EMITTING WEEFEEEE");

      socket.emit("notifications", {notifydb: notifydb});

      files.writeFile('notifies.txt', '', function (err) {
        if (err) throw err;
        console.log('Notification Cleared!');
      });

    }

    const asyncFun = async() => {
      var notifydb;
      var thedir = appRoot + '/notifies.txt';
      var thedb = await files.readFileSync(thedir).toString();
      
      if (thedb == '') {
        notifydb = '';
      } else {
        notifydb = thedb;   
    
        console.log("INTERVAL RUNNING ON SOCKET EMIT");
      
        socket.emit("notifications", {notifydb: notifydb});
      
        files.writeFile('notifies.txt', '', function (err) {
          if (err) throw err;
          console.log('Notification Cleared!');
        });

      }   

    }

    setInterval(() => {asyncFun();}, 3000);
  });
  next();
});

app.use(flashc());

if (currentOS === 'linux') {
  const SESSION_SECRET = process.env.SESS_KEY;

  const sess = session({
    secret: SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    unset: 'destroy',
    name: 'KronosAuth',
    cookie: {
        maxAge: (1000 * 60 * 60 * 24) // default is 1 day
    }
  });
  
  //New Auth Sharing Session with Sockets.io
  app.use(sess);
  
  io.use(sharedsession(sess));
} else {

  const SESSION_SECRET = process.env.SESS_KEY; //process.env.SESSION_SECRET

  const sess = session({
    secret: SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    unset: 'destroy',
    name: 'KronosAuth',
    cookie: {
        maxAge: (1000 * 60 * 60 * 24) // default is 1 day
    }
  });

  //New Auth Sharing Session with Sockets.io
  app.use(sess);

  io.use(sharedsession(sess));
}

app.set('trust proxy',1);
 
// Load express-toastr
// You can pass an object of default options to toastr(), see example/index.coffee
app.use(toastr());

app.use(function (req, res, next)
{
    res.locals.toasts = req.toastr.render()
    next()
});

app.use(gritty()); //Gritty...

app.use(express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));

var auth = function(req,res,next){
  if (!req.session.loggedin){
      //console.log('You are NOT AUTHED');
      return res.redirect("/login");
      //return res.render('login', { title: 'Kronos Login'});
  } else {
      //console.log('You are AUTHED');
      return next();
  }
};

var authseed = function(req,res,next){
  if (!req.session.loggedin2){
      //console.log('You are NOT AUTHED');
      return res.redirect("/auth");
      //return res.render('login', { title: 'Kronos Login'});
  } else {
      //console.log('You are AUTHED');
      return next();
  }
};

var authterm = function(req,res,next){
  if (!req.session.loggedin3){
      //console.log('You are NOT AUTHED');
      return res.redirect("http://" + ip.address() + ":3000/autht");
      //return res.render('login', { title: 'Kronos Login'});
  } else {
      //console.log('You are AUTHED');
      return next();
  }
};

var authtermpop = function(req,res,next){
  if (!req.session.loggedin4){
      //console.log('You are NOT AUTHED');
      return res.redirect("http://" + ip.address() + ":3000/authk");
      //return res.render('login', { title: 'Kronos Login'});
  } else {
      //console.log('You are AUTHED');
      return next();
  }
};

//Damn Terminal Sockets running on port 3300
gritty.listen(io, {
  prefix: '/gritty',
});
 
const Limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 50 // Max 50 Requests
});

const TXLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 100 // Max 100 Requests
});

/**
 * Primary app routes.
 */

//Kronos Auth Controller
app.get('/login', Limiter, authController.login);
app.get('/auth', auth, Limiter, authController.auth);
app.get('/autht', auth, Limiter, authController.autht);
app.get('/authk', auth, Limiter, authController.authk);
app.get('/logout', authController.logout);

//Core Mode
app.get('/simplesetup', authController.getsimple);
app.post('/simplesetup', Limiter, authController.simple);
app.get('/dashsimple', auth, sDashController.simpleindex);

app.get('/createtx', auth, Limiter, sTXController.getsend);
app.post('/simplesend', Limiter, sTXController.postcreate);
app.post('/autosend', Limiter, sTXController.postauto);

app.get('/sendeth', auth, Limiter, sTXController.getethsend);
app.post('/ethsend', Limiter, sTXController.postethsend);

app.get('/sendari', auth, Limiter, sTXController.getarisend);
app.post('/arisend', Limiter, sTXController.postarisend);

app.get('/sseed', auth, authseed, sTXController.getSimpleSeed);

app.get('/chat', auth, sTXController.getchat);

//Import Seed
app.get('/import', auth, Limiter, authController.getimport);
app.post('/import', auth, Limiter, authController.importseed);

//Sweep key
app.get('/sweep', auth, Limiter, authController.getsweep);
app.post('/sweep', auth, Limiter, authController.sweepkey);

//Advanced Mode
app.get('/setup', authController.getsetup);

//POST Auth Routes
app.post('/login', Limiter, authController.postlogin);
app.post('/create', Limiter, authController.create);
app.post('/setup', Limiter, authController.setup);
app.post('/auth', auth, Limiter, authController.postAuth);
app.post('/autht', auth, Limiter, authController.postAutht);
app.post('/authk', auth, Limiter, authController.postAuthk);


//POST Routes for kronosController
app.post('/unlock', auth, kronosController.unlock);
app.post('/unlockstaking', auth, kronosController.unlockstaking);
app.post('/lock', auth, kronosController.lock);
app.post('/encrypt', auth, kronosController.encrypt);
app.post('/reboot', auth, kronosController.reboot);
app.post('/privkey', auth, kronosController.privkey);
app.post('/walletnotify', TXLimiter, kronosController.notification);

app.get('/advchat', auth, kronosController.getchat);

//Tools Controller
app.get('/ddebug', auth, toolsController.getDebugLog);
app.get('/settings', auth, Limiter, toolsController.getSettings);
app.get('/terminal', auth, authterm, Limiter, toolsController.terminal);
app.get('/termpop', auth, authtermpop, Limiter, toolsController.termPop);

//DashBoard Controller
app.get('/', auth, dashController.index);
app.post('/', auth, dashController.index);


// Kronos Explorer Controller
app.get('/tx/:tx', auth, explorerController.gettx);
app.get('/block/:block', auth, explorerController.getblock);
app.get('/address/:addr', auth, explorerController.getaddress);
app.post('/search', auth, explorerController.search);


// Wallet Controller
/////////////////////

//POST Routes for WalletController
app.post('/newaddress', auth, walletController.address);
app.post('/startfs', auth, walletController.startfs);
app.post('/getnewaddress', auth, walletController.address);
app.post('/getgenkey', auth, walletController.genkey);
app.post('/withdraw/send', auth, walletController.withdraw);
app.post('/sendrawtx', auth, walletController.sendRaw);

//GET Routes for WalletController
app.get('/addresses', auth, walletController.addresses);
app.get('/transactions', auth, walletController.transactions);
app.get('/peers', auth, walletController.peers);
app.get('/fs', auth, walletController.fs);
app.get('/withdraw', auth, walletController.getWithdraw);
app.get('/rawtx', auth, walletController.getRaw);
app.get('/seed', auth, authseed, walletController.getSeed);

app.get('/genmini', auth, walletController.genMini);
app.get('/convertmini', auth, walletController.convertMini);

//KeepKey Routes
app.get('/keepkey', auth, walletController.keepkey);
app.post('/keepkeyaddr', auth, walletController.xpub);

//Other POST and GET Routes for WalletController
app.get('/import', auth, walletController.getPriv);
app.post('/importpriv', auth, walletController.importPriv);

app.get('/sign', auth, walletController.getSign);
app.post('/signmsg', auth, walletController.signMsg);

app.get('/verify', auth, walletController.getVerify);
app.post('/verifymsg', auth, walletController.verifyMsg);

app.get('/backup', auth, walletController.getBackup);
app.post('/backupwallet', auth, walletController.backupWallet);

/**
 * Error Handler.
 */
app.use(errorHandler());

/**
 * Start Express server.
 */
app.listen(port, '0.0.0.0', () => {
  var tri = tribus.digest('Denarius');
  console.log('✓ Tribus Hash of "Denarius"', tri);
  console.log('✓ Kronos Interface is running at http://' + ip.address() + ':%d', '3000', app.get('env'));
  console.log('✓ Open the URL above in your web browser on your local network to start using Kronos!\n');
});


module.exports = {app: app, server: server};

//The 404 Route (ALWAYS Keep this as the last route)
app.get('*', function (req, res) {
    res.status(404).render('404_error');
});
