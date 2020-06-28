/**
 * Kronos by Carsen Klock 2020, Main app.js
 * Module dependencies.
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
const WAValidator = require('wallet-address-validator');
const QRCode = require('qrcode');
const base32 = require('thirty-two');
const sprintf = require('sprintf-js');
const unirest = require('unirest');
const tribus = require('tribus-hashjs');
const si = require('systeminformation');
const ProgressBar = require('progressbar.js');
const cookieParser = require('cookie-parser');
const toastr = require('express-toastr');
const upload = multer({ dest: path.join(__dirname, 'uploads') });
const ip = require('ip');
const shell = require('shelljs');
const fs = require('fs');
const dbr = require('./db.js');
const appRoot = require('app-root-path');
const files = require('fs');
const db = dbr.db;
const gritty = require('gritty');


//Print in console your LAN IP
console.log('Your LAN', ip.address());

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
//dotenv.load({ path: '.env' });

dotenv.config({ path: '.env' });

/**
 * Controllers (route handlers).
 */
const homeController = require('./controllers/home');
const walletController = require('./controllers/wallet');

/**
 * Create Express server.
 */
const app = express();

const server = require('http').Server(app);
const io = require('socket.io')(server);
const sharedsession = require("express-socket.io-session");
//io.setMaxListeners(33);

//const socket = io.listen(server);
io.setMaxListeners(33);

// const iot = require('socket.io');
// const servert = require('http').createServer(app);
// const sockett = iot.listen(servert);
 
const port = 3000;
// const portt = 3337;
// const ipt = '0.0.0.0';

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

app.use(gritty());

app.use(lusca.xframe('SAMEORIGIN'));

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

app.use(cookieParser('secret'));

app.use(flashc());

const sess = session({
  secret: process.env.SESSION_SECRET,
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

app.set('trust proxy',1);
 
// Load express-toastr
// You can pass an object of default options to toastr(), see example/index.coffee
app.use(toastr());

app.use(function (req, res, next)
{
    res.locals.toasts = req.toastr.render()
    next()
});

//app.use(gritty());

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

//Damn Terminal Sockets running on port 3300
gritty.listen(io, {
  prefix: '/gritty',
});

//server.listen(portt, ipt);

/**
 * Kronos Auth Login
 */
app.get('/login', homeController.login);
app.post('/login', homeController.postlogin);
app.post('/create', homeController.create);
app.get('/auth', auth, homeController.auth);
app.post('/auth', auth, homeController.postAuth);

app.get('/terminal', auth, homeController.terminal);

app.get('/logout', homeController.logout);

/**
 * Primary app routes.
 */
app.get('/', auth, homeController.index);
app.post('/', auth, homeController.index);

app.get('/ddebug', auth, homeController.getDebugLog);

app.post('/walletnotify', homeController.notification);

// D Explorer Routes
app.get('/tx/:tx', auth, walletController.gettx);
app.get('/block/:block', auth, walletController.getblock);
app.get('/address/:addr', auth, walletController.getaddress);

//POST Routes for HomeController
app.post('/unlock', auth, homeController.unlock);
app.post('/unlockstaking', auth, homeController.unlockstaking);
app.post('/lock', auth, homeController.lock);
app.post('/encrypt', auth, homeController.encrypt);
app.post('/reboot', auth, homeController.reboot);
app.post('/privkey', auth, homeController.privkey);

//POST Routes for WalletController
app.post('/newaddress', auth, walletController.address);
app.post('/startfs', auth, walletController.startfs);
app.post('/getnewaddress', auth, walletController.address);
app.post('/getgenkey', auth, walletController.genkey);
app.post('/withdraw/send', auth, walletController.withdraw);
app.post('/sendrawtx', auth, walletController.sendRaw);
app.post('/search', auth, walletController.search);

//GET Routes for WalletController
app.get('/addresses', auth, walletController.addresses);
app.get('/transactions', auth, walletController.transactions);
app.get('/peers', auth, walletController.peers);
app.get('/fs', auth, walletController.fs);
app.get('/withdraw', auth, walletController.getWithdraw);
app.get('/rawtx', auth, walletController.getRaw);
app.get('/seed', auth, authseed, walletController.getSeed);

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

//server.listen(port, ip.address());

// var http = require('http');
// http.createServer(function (req, res) {
//   // var data = '';
//   res.writeHead(200, {'Content-Type': 'text/plain'});
//   res.write('Got your notify!');

//   req.on('data', chunk => {

//     // data += chunk;
//     console.log('Transaction Notify Received:', chunk.toString());

//     db.put('txid', chunk.toString(), function (err) {
// 			if (err) return console.log('Ooops!', err) // some kind of I/O error if so
//     });
    
//     // fs.writeFile('notifies.txt', chunk.toString(), function (err) {
//     //   if (err) throw err;
//     //   //console.log('Loaded, Written to File');
//     // });

//   });

//   // console.log(data.toString());

//   res.end();

// }).listen(3333);
// console.log('✓ Started Kronos Wallet Notify Server on Port 3333');

module.exports = {app: app, server: server};

//The 404 Route (ALWAYS Keep this as the last route)
app.get('*', function (req, res) {
    res.status(404).render('404_error');
});
