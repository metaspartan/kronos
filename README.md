dPi - Denarius Node Dashboard and AIO Interface
=======================

[![Dependency Status](https://david-dm.org/carsenk/dpi/status.svg?style=flat)](https://david-dm.org/carsenk/dpi) [![Build Status](https://travis-ci.org/carsenk/dpi.svg?branch=master)](https://travis-ci.org/carsenk/dpi) [![Thinkful Pair on Node](https://tf-assets-staging.s3.amazonaws.com/badges/thinkful_repo_badge.svg)](http://start.thinkful.com/node/)

![DesktopWallet](https://user-images.githubusercontent.com/10162347/27821646-3b31105c-6060-11e7-8c82-cbbbb5b1e663.png)
![MobileWallet](https://user-images.githubusercontent.com/10162347/27821566-f807334c-605f-11e7-8bec-805fe433237f.png)

**Live Demo**: Currently unavailable

dPi - A NodeJS/MongoDB powered denariusd Web Wallet Dashboard with Statistics of your device. This is a major work in progress and this repo will be updated in time.

Send and Receive Funds, Create new addresses, View Transactions, Unlock/Lock Wallet, Stake D, Reboot your node, and more!

This was built for the Raspberry Pi in mind and one with at least 2GB of RAM, 4GB and 8GB models are recommended! dPi will run on any Linux distro (at your own risk).

Swap between your D Balance in USD and BTC prices calculated from CoinGecko http://coinmarketcap.com/currencies/denarius-d/

2FA Authentication is included as well as QR Codes for addresses and 2FA!

Install dPi with Denarius Now!
-----------------

```bash
wget https://raw.githubusercontent.com/carsenk/dpi/master/installdpi.sh | bash
```

Features
--------

- Send and Receive D
- Wallet Addresses
- View all transactions
- Stake your Denarius
- Unlock/Lock your wallet
- Easy to install
- Auto Updates for Denarius via Snap
- Mobile Ready Responsive Design
- Flash and Toastr notifications
- MVC Project Structure
- Node.js clusters support
- Sass stylesheets (auto-compiled via middleware)
- Bootstrap 3 + Theme
- CSRF protection
- XSS protection

-More features will be coming!

Prerequisites
-------------

- [denariusd](https://github.com/carsenk/denarius)
- [MongoDB](https://www.mongodb.org/downloads)
- [Node.js 6.0+](http://nodejs.org)

Getting Started
---------------

The easiest way to get started is to run the following bash command:

```bash
wget https://raw.githubusercontent.com/carsenk/dpi/master/installdpi.sh | bash
```

```bash
# Get the latest snapshot
git clone --depth=1 https://github.com/carsenk/dpi.git dpi

# Change directory
cd dpi

# Install NPM dependencies
npm install

# Or, if you prefer to use `yarn` instead of `npm`
yarn install

# Then simply start your app
node app.js

# Or, if you are using nodemon
nodemon app.js

#Or, if you are using forever
forever start app.js
```

License
-------

The MIT License (MIT)

Copyright (c) 2017 Carsen Klock

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
