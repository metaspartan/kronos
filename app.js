/**
 * dPi by Carsen Klock 2020, Main app.js
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

//POST Routes
app.post('/unlock', homeController.unlock);
app.post('/lock', homeController.lock);
app.post('/encrypt', homeController.encrypt);
app.post('/reboot', homeController.reboot);
app.post('/privkey', homeController.privkey);


app.post('/newaddress', walletController.address);
app.get('/addresses', walletController.addresses);
app.get('/transactions', walletController.transactions);

app.get('/fs', walletController.fs);
app.post('/startfs', walletController.startfs);

app.post('/getnewaddress', walletController.address);

app.post('/getgenkey', walletController.genkey);

app.post('/withdraw/send', walletController.withdraw);
app.get('/withdraw', walletController.getWithdraw);
app.get('/rawtx', walletController.getRaw);
app.post('/sendrawtx', walletController.sendRaw);

app.get('/import', walletController.getPriv);
app.post('/importpriv', walletController.importPriv);

app.get('/sign', walletController.getSign);
app.post('/signmsg', walletController.signMsg);

app.get('/verify', walletController.getVerify);
app.post('/verifymsg', walletController.verifyMsg);

app.get('/backup', walletController.getBackup);
app.post('/backupwallet', walletController.backupWallet);

app.get('/ddebug', homeController.getDebugLog);

/**
 * Error Handler.
 */
app.use(errorHandler());

/**
 * Start Express server.
 */
app.listen(app.get('port'), '0.0.0.0', () => {
  var tri = tribus.digest('Denarius');
  console.log('✓ Tribus Hash of "Denarius"', tri);
  console.log('✓ dPi Interface is running at http://' + ip.address() + ':%d in %s mode', app.get('port'), app.get('env'));
  console.log('✓ Open the URL above in your web browser on your local network to use dPi!\n');
});

module.exports = app;

//The 404 Route (ALWAYS Keep this as the last route)
app.get('*', function (req, res) {
    res.status(404).render('404_error');
});
