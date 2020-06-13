dPi - Denarius Node Dashboard and AIO Interface
=======================

[![Build Status](https://travis-ci.org/carsenk/dpi.svg?branch=master)](https://travis-ci.org/carsenk/dpi) [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/carsenk/dpi) [![Dependency Status](https://david-dm.org/carsenk/dpi/status.svg?style=flat)](https://david-dm.org/carsenk/dpi) [![devDependencies Status](https://david-dm.org/carsenk/dpi/dev-status.svg)](https://david-dm.org/carsenk/dpi?type=dev) [![Join the chat at https://discord.gg/UPpQy3n](https://img.shields.io/badge/Discord-Chat-blue.svg?logo=discord)](https://discord.gg/UPpQy3n)

[![HitCount](http://hits.dwyl.io/carsenk/dpi.svg)](http://hits.dwyl.io/carsenk/dpi)
<a href="https://discord.gg/UPpQy3n"><img src="https://discordapp.com/api/guilds/334361453320732673/embed.png" alt="Discord server" /></a>

dPi - A secondary layer NodeJS powered denariusd Web Wallet Dashboard with Statistics of your device. This is a major work in progress and this repo will be updated in time.

Send and Receive Funds, Create new addresses, View Transactions, Unlock/Lock Wallet, Stake D, Reboot your node, Import Private Keys, View Private Keys, Encrypt your wallet, Broadcast raw transactions, Sign and Verify Denarius messages, and much more!

This was built for the Raspberry Pi in mind and one with at least 2GB of RAM, 4GB and 8GB models are recommended! dPi will run on any Linux distro.

Running the installer script below installs denarius via snap install and then modifies your .env in dPi and denarius.conf to a random rpcuser and rpcpass, dPi then generates you a password to login into dPi with, so be on the look out for that when the installer finishes. (Default Username is dpiadmin). dPi will then be running on your LAN (192.168.x.x:3000) on port 3000.

Recommended Devices and OS
-----------------
Raspberry Pi 4 4GB - Ubuntu 20.04 Server Image
Raspberry Pi 4 8GB - Ubuntu 20.04 Server Image
Ubuntu 20.04
Ubuntu 19.10
Ubuntu 19.04
Ubuntu 18.04
Ubuntu 16.04
Raspberry Pi OS

Linux Mint
Debian
Arch Linux
Fedora
Red Hat
Manjaro
ZorinOS
elementaryOS
CentOS
openSUSE


Install dPi with Denarius Now!
-----------------

Simply run this one command, then choose if you want to Install dPi with or without chaindata or if you want to just update!:

```bash
wget -qO- https://raw.githubusercontent.com/carsenk/dpi/master/installdpi.sh | bash
```

![image](https://user-images.githubusercontent.com/10162347/84561876-38f54680-ad0d-11ea-9be8-554c148a86c2.png)

![image](https://user-images.githubusercontent.com/10162347/84561886-45799f00-ad0d-11ea-9f7f-0ed9c8b21375.png)

Features
--------

- Send and Receive D
- Wallet Addresses
- Address Balances Powered by Scripthash and ElectrumX (denarius.pro)
- View all transactions
- Stake your Denarius
- Unlock/Lock/Encrypt your wallet
- Backup Wallet
- Sign/Verify Denarius Messages
- Import Private Keys
- Export Private Keys
- Broadcast Raw Transaction
- View FortunaStake Nodes
- Generate FS Key
- Easy to install
- Auto Updates for Denarius via Snap
- Easy installer to install Denarius via Snap and dPi
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
- [Node.js 6.0+](http://nodejs.org)

Getting Started
---------------

The easiest way to get started is to run the following bash command:

```bash
wget -qO- https://raw.githubusercontent.com/carsenk/dpi/master/installdpi.sh | bash
```

```bash
# Get the latest snapshot
git clone --depth=1 https://github.com/carsenk/dpi.git dpi

# Change directory
cd dpi

# Install NPM dependencies
npm install

# Then simply start dPi
node app.js

or

npm start

# Or, if you are using nodemon
nodemon app.js

#Or, if you are using forever
forever start app.js
```

License
-------

The MIT License (MIT)

Copyright (c) 2017-2020 Carsen Klock

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
