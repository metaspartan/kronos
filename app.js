/**
 * dPi by Carsen Klock 2020, Main app.js
 * Module dependencies.
 */
const express = require('express');
const compression = require('compression');
const session = require('express-session');
const bodyParser = require('body-parser');
const logger = require('morgan');
const chalk = require('chalk');
const errorHandler = require('errorhandler');
const lusca = require('lusca');
const dotenv = require('dotenv');
const MongoStore = require('connect-mongo')(session);
const flash = require('express-flash');
const flashc = require('connect-flash');
const path = require('path');
const mongoose = require('mongoose');
const passport = require('passport');
const expressValidator = require('express-validator');
const expressStatusMonitor = require('express-status-monitor');
const sass = require('node-sass-middleware');
const multer = require('multer');
const bitcoin = require('bitcoin');
const WAValidator = require('wallet-address-validator');
const recaptcha = require('express-recaptcha');
const QRCode = require('qrcode');
const base32 = require('thirty-two');
const sprintf = require('sprintf');
const speakeasy = require('speakeasy');
const unirest = require('unirest');
const tribus = require('tribus-hashjs');
const si = require('systeminformation');
const ProgressBar = require('progressbar.js');
const cookieParser = require('cookie-parser');
const toastr = require('express-toastr');
const passwordProtected = require('express-password-protect');
const upload = multer({ dest: path.join(__dirname, 'uploads') });
const ip = require('ip');

console.log(ip.address());

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.load({ path: '.env' });

/**
 * Controllers (route handlers).
 */
const homeController = require('./controllers/home');
const userController = require('./controllers/user');
const walletController = require('./controllers/wallet');
const contactController = require('./controllers/contact');

/**
 * API keys and Passport configuration.
 */
const passportConfig = require('./config/passport');

/**
 * Create Express server.
 */
const app = express();

/**
 * Connect to MongoDB.
 */
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI || process.env.MONGOLAB_URI);
mongoose.connection.on('error', (err) => {
  console.error(err);
  console.log('%s MongoDB connection error. Please make sure MongoDB is running.', chalk.red('✗'));
  process.exit();
});

/**
 * Express configuration.
 */
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(expressStatusMonitor());
app.use(compression());
app.use(sass({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public')
}));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
recaptcha.init(process.env.RECAPTCHA_PUBLIC, process.env.RECAPTCHA_PRIVATE);
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET,
  store: new MongoStore({
    url: process.env.MONGODB_URI || process.env.MONGOLAB_URI,
    autoReconnect: true,
    clear_interval: 3600
  })
}));
app.use(passport.initialize());
app.use(passport.session());
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
username: "dpiadmin",
password: "testing123",
maxAge: 60000 // 1 minute
}

app.use(passwordProtected(config));
 
// Load express-toastr
// You can pass an object of default options to toastr(), see example/index.coffee
app.use(toastr());

app.use(function (req, res, next)
{
    res.locals.toasts = req.toastr.render()
    next()
});

//Needs some work
/*
app.use((req, res, next) => {
   // After successful login, redirect back to the intended page
   if (!req.user &&
       req.path !== '/login' &&
       req.path !== '/signup' &&
       !req.path.match(/^\/auth/) &&
       !req.path.match(/\./)) {
     req.session.returnTo = req.path;
   } else if (req.user &&
       req.path == '/account') {
     req.session.returnTo = req.path;
   }
   next();
 });
 */
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

//Needs securing


app.get('/login', userController.getLogin);
app.post('/login', function (req, res, next) {
        recaptcha.verify(req, function (error) {
            if (!error)
                return next();
            else
                req.flash('errors', { msg: 'Recaptcha is invalid!' });
                return res.redirect('/login');
        });
    }, userController.postLogin
);
app.get('/2fa', passportConfig.isAuthenticated, userController.get2FA);
app.post('/2fa', passportConfig.isAuthenticated, userController.post2FA);
app.get('/logout', userController.logout);
app.get('/forgot', userController.getForgot);
app.post('/forgot', userController.postForgot);
app.get('/reset/:token', userController.getReset);
app.post('/reset/:token', userController.postReset);
app.get('/signup', userController.getSignup);
app.post('/signup', function (req, res, next) {
        recaptcha.verify(req, function (error) {
            if (!error)
                return next();
            else
                req.flash('errors', { msg: 'Recaptcha is invalid!' });
                return res.redirect('/signup');
        });
    }, userController.postSignup
);
app.get('/contact', contactController.getContact);
app.post('/contact', contactController.postContact);
app.get('/account', passportConfig.isAuthenticated, passportConfig.ensureTotp, userController.getAccount);
app.post('/account/profile', passportConfig.isAuthenticated, passportConfig.ensureTotp, userController.postUpdateProfile);
app.post('/account/2fa', passportConfig.isAuthenticated, passportConfig.ensureTotp, userController.postTwoFactor);
app.post('/account/password', passportConfig.isAuthenticated, passportConfig.ensureTotp, userController.postUpdatePassword);
app.post('/account/delete', passportConfig.isAuthenticated, passportConfig.ensureTotp, userController.postDeleteAccount);
app.get('/account/unlink/:provider', passportConfig.isAuthenticated, passportConfig.ensureTotp, userController.getOauthUnlink);

/**
 * Wallet app routes.
 */
app.get('/wallet', passportConfig.isAuthenticated, passportConfig.ensureTotp, walletController.wallet);
app.get('/addresses', walletController.addresses);
app.get('/transactions', walletController.transactions);
app.post('/newaddress', passportConfig.isAuthenticated, passportConfig.ensureTotp, walletController.address);
app.post('/withdraw/send', walletController.withdraw);
app.get('/withdraw', walletController.getWithdraw);

/**
 * OAuth authentication routes. (Sign in)
 */
app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email', 'public_profile'] }));
app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }), (req, res) => {
  res.redirect(req.session.returnTo || '/wallet');
});
app.get('/auth/github', passport.authenticate('github'));
app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/login' }), (req, res) => {
  res.redirect(req.session.returnTo || '/wallet');
});
app.get('/auth/google', passport.authenticate('google', { scope: 'profile email' }));
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
  res.redirect(req.session.returnTo || '/wallet');
});
app.get('/auth/twitter', passport.authenticate('twitter'));
app.get('/auth/twitter/callback', passport.authenticate('twitter', { failureRedirect: '/login' }), (req, res) => {
  res.redirect(req.session.returnTo || '/wallet');
});

/**
 * Error Handler.
 */
app.use(errorHandler());

/**
 * Start Express server.
 */
app.listen(app.get('port'), ip.address(), () => {
  var tri = tribus.digest('Denarius');
  console.log('Tribus Hash of "Denarius"', tri);
  console.log('%s dPi Interface is running at http://' + ip.address() + ':%d in %s mode', chalk.green('✓'), app.get('port'), app.get('env')); 
  console.log('  Open the URL above in your web browser on your local network to use dPi!\n');
});

module.exports = app;

//The 404 Route (ALWAYS Keep this as the last route)
app.get('*', function (req, res) {
    res.status(404).render('404_error');
});
