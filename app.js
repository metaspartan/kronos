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
const passwordProtected = require('express-password-protect');
const upload = multer({ dest: path.join(__dirname, 'uploads') });
const ip = require('ip');
const shell = require('shelljs');
const fs = require('fs');
const dbr = require('./db.js');
const appRoot = require('app-root-path');
const files = require('fs');
const db = dbr.db;


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
io.setMaxListeners(33);

/**
 * Express configuration.
 */
app.set('port', process.env.PORT || 3000);

app.set('views', path.join(__dirname, 'views'));

app.set('view engine', 'pug');

app.use(expressStatusMonitor());

app.use(compression());

app.use(logger('dev'));

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

app.use(flash());

app.use(lusca.xframe('SAMEORIGIN'));

app.use(lusca.xssProtection(true));

app.use((req, res, next) => {
  res.io = io;
  //Emit to our Socket.io Server for Notifications
  let socket_id10 = [];
  res.io.on('connection', function (socket) {
    // console.log(socket.clients().length);
    socket_id10.push(socket.id);
    //console.log(socket.id);
    if (socket_id10[0] === socket.id) {
      // remove the connection listener for any subsequent 
      // connections with the same ID
      res.io.removeAllListeners('connection'); 
    }
    setInterval(() => {
      var notifydb;
      var thedir = appRoot + '/notifies.txt';
      var thedb = files.readFileSync(thedir).toString();
      if (thedb == '') {
        notifydb = '';
      } else {
        notifydb = thedb;        
        socket.emit("notifications", {notifydb: notifydb});
        files.writeFile('notifies.txt', '', function (err) {
          if (err) throw err;
          console.log('Notification Cleared!');
        });
        //socket.disconnect();
      }
      //socket.emit("notifications", {notifydb: notifydb});
    }, 300);
  });
  next();
});

app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

app.use(cookieParser('secret'));

app.use(flashc());

const config = {
username: process.env.DPIUSER,
password: process.env.DPIPASS,
maxAge: 10800000 // 3 hours
}

app.use(passwordProtected(config));

app.set('trust proxy',1);
 
// Load express-toastr
// You can pass an object of default options to toastr(), see example/index.coffee
app.use(toastr());

app.use(function (req, res, next)
{
    res.locals.toasts = req.toastr.render()
    next()
});

app.use(express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));

/**
 * Primary app routes.
 */
app.get('/', homeController.index);
app.post('/', homeController.index);

app.get('/ddebug', homeController.getDebugLog);

// D Explorer Routes
app.get('/tx/:tx', walletController.gettx);
app.get('/block/:block', walletController.getblock);

//POST Routes for HomeController
app.post('/unlock', homeController.unlock);
app.post('/unlockstaking', homeController.unlockstaking);
app.post('/lock', homeController.lock);
app.post('/encrypt', homeController.encrypt);
app.post('/reboot', homeController.reboot);
app.post('/privkey', homeController.privkey);

//POST Routes for WalletController
app.post('/newaddress', walletController.address);
app.post('/startfs', walletController.startfs);
app.post('/getnewaddress', walletController.address);
app.post('/getgenkey', walletController.genkey);
app.post('/withdraw/send', walletController.withdraw);
app.post('/sendrawtx', walletController.sendRaw);
app.post('/search', walletController.search);

//GET Routes for WalletController
app.get('/addresses', walletController.addresses);
app.get('/transactions', walletController.transactions);
app.get('/peers', walletController.peers);
app.get('/fs', walletController.fs);
app.get('/withdraw', walletController.getWithdraw);
app.get('/rawtx', walletController.getRaw);

//Other POST and GET Routes for WalletController
app.get('/import', walletController.getPriv);
app.post('/importpriv', walletController.importPriv);

app.get('/sign', walletController.getSign);
app.post('/signmsg', walletController.signMsg);

app.get('/verify', walletController.getVerify);
app.post('/verifymsg', walletController.verifyMsg);

app.get('/backup', walletController.getBackup);
app.post('/backupwallet', walletController.backupWallet);

/**
 * Error Handler.
 */
app.use(errorHandler());

/**
 * Start Express server.
 */
app.listen(3000, '0.0.0.0', () => {
  var tri = tribus.digest('Denarius');
  console.log('✓ Tribus Hash of "Denarius"', tri);
  console.log('✓ Kronos Interface is running at http://' + ip.address() + ':%d in %s mode', '3000', app.get('env'));
  console.log('✓ Open the URL above in your web browser on your local network to use Kronos!\n');
});

var http = require('http');
http.createServer(function (req, res) {
  var data = '';
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.write('Got your notify!');

  req.on('data', chunk => {

    data += chunk;
    console.log('Transaction Notify Received:', chunk.toString());

    db.put('txid', chunk.toString(), function (err) {
			if (err) return console.log('Ooops!', err) // some kind of I/O error if so
    });
    
    fs.writeFile('notifies.txt', chunk.toString(), function (err) {
      if (err) throw err;
      //console.log('Loaded, Written to File');
    });

  });

  console.log(data.toString());

  res.end();

}).listen(3333);
console.log('✓ Started Kronos Wallet Notify Server on Port 3333');

module.exports = {app: app, server: server};

//The 404 Route (ALWAYS Keep this as the last route)
app.get('*', function (req, res) {
    res.status(404).render('404_error');
});
