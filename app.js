/**
 * 
 * 
 * 
 * Kronos by MetaSpartan 2020, Main app.js
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
const csrf = require('csurf');
//const gritty = require('gritty');
const rateLimit = require("express-rate-limit");
const randomstring = require("randomstring");
const Storage = require('json-storage-fs');
const mkdirp = require('mkdirp');

const crypto = require('crypto')
const Swarm = require('discovery-swarm')
const defaults = require('dat-swarm-defaults')
const getPort = require('get-port')
const readline = require('readline')


let denariusearray = ['electrumx1.denarius.pro', 'electrumx2.denarius.pro', 'electrumx3.denarius.pro', 'electrumx4.denarius.pro'];
let bitcoinearray = ['bitcoin.lukechilds.co', 'alviss.coinjoined.com', 'hodlers.beer', 'electrum.blockstream.info']; // 'electrumx.erbium.eu', 'fortress.qtornado.com', 

let delectrums = Storage.get('delectrums');
let belectrums = Storage.get('belectrums');

if (typeof delectrums == 'undefined') {
  Storage.set('delectrums', denariusearray);
}
if (typeof belectrums == 'undefined') {
  Storage.set('belectrums', bitcoinearray);
}

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
// ;(async () => {
//   try {
//     const options = {
//       EXPERIMENTAL: {
//         pubsub: true,
//         namesys: true
//       },
//       // repo: 'ipfs-' + Math.random(),
//       config: {
//         Addresses: {
//           //Swarm: ['/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star']
//           Swarm: [
//             "/ip4/0.0.0.0/tcp/4002",
//             "/ip4/127.0.0.1/tcp/4003/ws"
//             // "/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star"
//           ],
//           API: ["/ip4/127.0.0.1/tcp/5001"],
//           Gateway: "/ip4/127.0.0.1/tcp/9090"
//         }
//       }
//     }
//     const node = await IPFS.create(options);
//     const id = await node.id();
//     const Gateway = require('ipfs-http-gateway');
//     const IPFSAPI = require('ipfs-http-server');
//     const gateway = new Gateway(node);
//     await gateway.start();
//     const ipfsa = new IPFSAPI(node);
//     await ipfsa.start();
//     console.log('Kronos IPFS Gateway Started: 127.0.0.1:9090')
//     console.log('Kronos IPFS Node Started: ', id);
//     Storage.set('ipfs', id);
//   } catch (err) {
//     console.error(err);
//   }
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
  // const keytar = require('keytar-sync');
  const randosecret = randomstring.generate(42);
  const randosess = randomstring.generate(42);

  // getPassword('Kronos', 'localkey') from promise from keytar and check if value is null and if it is, setPassword()
  // keytar.getPassword('Kronos', 'localkey').then(function(wkey) {
  //   console.log(wkey);
  //   if (wkey === null) {
  //     keytar.setPasswordSync('Kronos', 'localkey', randosecret);
  //     keytar.setPasswordSync('Kronos', 'localses', randosess);      
  //   }
  // });
  // // console.log('Keytar: ' + keytary);

  // if (keytary == null) {
  //   keytar.setPasswordSync('Kronos', 'localkey', randosecret);
  //   keytar.setPasswordSync('Kronos', 'localses', randosess);
  // }
  // const randosecret = randomstring.generate(42);
  // const randosess = randomstring.generate(42);

  //console.log(`Kronos Data Directory: ` + getUserHome()+`\\Kronos\\DATA`); 
  
  if (!fs.existsSync(getUserHome()+`.env`)) {
    fs.writeFileSync(getUserHome()+`.env`, `KEY=${randosecret}\nSESS_KEY=${randosess}`);
  }
}

//Print in console your LAN IP
console.log(`Kronos running on your LAN: ${ip.address()} on platform ${currentOS}`);

const logpath = getUserHome()+`/kronos.log`;

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
const sTXController = require('./controllers/simple/txs');
const coreController = require('./controllers/simple/kronos');
const toolsController = require('./controllers/tools');
const walletController = require('./controllers/wallet');
const explorerController = require('./controllers/explorer');

// pem.createCertificate({ days: 365, selfSigned: true }, function (err, keys) {
//   if (err) {
//     throw err
//   }
//   Storage.set('serviceKey', keys.serviceKey);
//   Storage.set('certificate', keys.certificate);
// }); //End PEM
/**
 * Create Express server.
 */
const app = express();

const server = require('http').Server(app);
//const httpsserver = require('https').createServer(credentials, app);
const io = require('socket.io')(server);
//const iohttps = require('socket.io')(httpsserver);
const sharedsession = require("express-socket.io-session");
io.setMaxListeners(69);
//iohttps.setMaxListeners(69);
const port = 3000;

/**
 * Express configuration.
 */
//app.set('port', port);

app.set('views', path.join(__dirname, 'views'));

app.set('view engine', 'pug');

app.use(expressStatusMonitor());

// New Middleware for Compression to not compress our ch0nked data
const shouldCompress = (req, res) => {
  // don't compress responses explicitly asking not
  if (req.headers["x-no-compression"] || res.getHeader('Content-Type') === 'text/event-stream') {
    return false;
  }

  // use compression filter function
  return compression.filter(req, res);
};

app.use(compression({ filter: shouldCompress }));

app.use(logger('dev'));

// app.use(logger({stream: logpath}));

app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));

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
  // res.locals.csrftoken = req.csrfToken(); 
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
  // // For Windows and macOS
  //const keytar = require('keytar');

  // let SEC;
  // let seckey = keytar.getPassword('Kronos', 'localses');

  // Promise.resolve(seckey).then(function (res) {
  //   SEC = res;
  // }).catch(function (err) {
  //   console.log('Error: ', err);
  // });

  const sess = session({
    secret: randomstring.generate(42),
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

app.use(csrf());

var csrfProtection = csrf({ cookie: true })

app.use(function (req, res, next)
{
    res.locals.csrftoken = req.csrfToken(); 
    res.locals.toasts = req.toastr.render()
    // res.header("Access-Control-Allow-Origin", "*"); // Maybe in future?
    // res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next()
});

//app.use(gritty()); //Gritty...

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

//Gritty Terminal Sockets running on port 3300
// gritty.listen(io, {
//   prefix: '/gritty',
// });
 
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

app.get('/passchange', auth, authController.change);
app.post('/changepass', Limiter, authController.changepass);

//Core Mode
app.get('/simplesetup', authController.getsimple);
app.post('/simplesetup', Limiter, authController.simple);
app.get('/dashsimple', auth, sDashController.simpleindex);

app.get('/core', auth, Limiter, coreController.getcoresettings);
app.get('/profile', auth, Limiter, coreController.getprofile);
app.post('/updateprofile', Limiter, coreController.postprofile);

app.get('/u2f', auth, authController.u2fsetup);
app.post('/u2fadd', Limiter, authController.u2fadd);
app.post('/u2fremove', Limiter, authController.u2fremove);

//D Send
app.get('/createtx', auth, Limiter, sTXController.getsend);
app.post('/simplesend', Limiter, sTXController.postcreate);
app.post('/autosend', Limiter, sTXController.postauto);

//D Send API
app.post('/dapisend', Limiter, sTXController.postapisend);

//BTC Send
app.get('/sendbtc', auth, Limiter, sTXController.getbtcsend);
app.post('/btcsend', Limiter, sTXController.postbtcsend);
app.post('/btcautosend', Limiter, sTXController.postbtcauto);

app.get('/sendeth', auth, Limiter, sTXController.getethsend);
app.post('/ethsend', Limiter, sTXController.postethsend);

app.get('/sendbsc', auth, Limiter, sTXController.getbscsend);
app.post('/bscsend', Limiter, sTXController.postbscsend);

app.get('/sendftm', auth, Limiter, sTXController.getftmsend);
app.post('/ftmsend', Limiter, sTXController.postftmsend);

app.get('/sendclout', auth, Limiter, sTXController.getcloutsend);
app.post('/cloutsend', Limiter, sTXController.postcloutsend);

app.get('/sendusdt', auth, Limiter, sTXController.getusdtsend);
app.post('/usdtsend', Limiter, sTXController.postusdtsend);

app.get('/sendbusd', auth, Limiter, sTXController.getbusdsend);
app.post('/busdsend', Limiter, sTXController.postbusdsend);

app.get('/sseed', auth, authseed, sTXController.getSimpleSeed);

app.get('/chat', auth, sTXController.getchat);

//Import Seed
app.get('/import', auth, Limiter, authController.getimport);
app.post('/import', auth, Limiter, authController.importseed);

//Sweep key
app.get('/sweep', auth, Limiter, authController.getsweep);
app.post('/sweep', auth, Limiter, authController.sweepkey);

//BTC Sweep key
app.get('/sweepbtc', auth, Limiter, authController.getbtcsweep);
app.post('/btcsweep', auth, Limiter, authController.btcsweepkey);

//BTC Sweep key
app.get('/2fasetting', auth, Limiter, authController.twofasetting);
app.post('/2fa', auth, Limiter, authController.twofapost);
app.post('/2favalid', auth, Limiter, authController.twofavalidate);

// Electrum Settings
app.post('/update-electrumx', auth, Limiter, authController.postelectrum);


//Advanced Mode--------------------------------------------------
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


// Event Streams

// Event Block Subscriber
app.get('/newblock', Limiter, sDashController.getnewblock);
// BTC Block Subscriber
// app.get('/btcblock', Limiter, sDashController.getbtcblock);
// // ETH Block Subscriber
// app.get('/ethblock', Limiter, sDashController.getethblock);
// // BSC Block Subscriber
// app.get('/bscblock', Limiter, sDashController.getbscblock);
// // FTM Block Subscriber
// app.get('/ftmblock', Limiter, sDashController.getftmblock);
// // CLOUT Block Subscriber
// app.get('/cloutblock', Limiter, sDashController.getcloutblock);

// Event Balance Subscriber
app.get('/balances', Limiter, sDashController.getbalance);
// BTC Balance Subscriber
// app.get('/btcbalance', Limiter, sDashController.getbtcbalance);
// // ETH Balance Subscriber
// app.get('/ethbalance', Limiter, sDashController.getethbalance);
// // BSC Balance Subscriber
// app.get('/bscbalance', Limiter, sDashController.getbscbalance);
// // FTM Balance Subscriber
// app.get('/ftmbalance', Limiter, sDashController.getftmbalance);
// // CLOUT Balance Subscriber
// app.get('/cloutbalance', Limiter, sDashController.getcloutbalance);
// // USDT Balance Subscriber
// app.get('/usdtbalance', Limiter, sDashController.getusdtbalance);
// // BUSD Balance Subscriber
// app.get('/busdbalance', Limiter, sDashController.getbusdbalance);

/**
 * Error Handler.
 */
app.use(errorHandler());

/**
 * Start Express server.
 */
app.listen(port, '0.0.0.0', () => {
  var tri = tribus.digest('Denarius');
  console.log('Tribus Hash of "Denarius"', tri);
  console.log('Kronos Interface is running at http://' + ip.address() + ':%d', '3000', app.get('env'));
  console.log('Open the URL above in your web browser on your local network to start using the browser version of Kronos!\n');
});

module.exports = {app: app, server: server};

//The 404 Route (ALWAYS Keep this as the last route)
app.get('*', function (req, res) {
    res.status(404).render('404_error');
});