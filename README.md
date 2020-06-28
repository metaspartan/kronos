# Kronos
#### Denarius Dashboard and AIO Interface
=======================
![Kronos Logo](https://user-images.githubusercontent.com/10162347/85915874-88a53900-b808-11ea-9a0f-1b68b7a2e61e.png)

[![Build Status](https://travis-ci.org/carsenk/kronos.svg?branch=master)](https://travis-ci.org/carsenk/kronos) [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/carsenk/kronos) [![Dependency Status](https://david-dm.org/carsenk/kronos/status.svg?style=flat)](https://david-dm.org/carsenk/kronos) [![devDependencies Status](https://david-dm.org/carsenk/kronos/dev-status.svg)](https://david-dm.org/carsenk/kronos?type=dev) [![Join the chat at https://discord.gg/UPpQy3n](https://img.shields.io/badge/Discord-Chat-blue.svg?logo=discord)](https://discord.gg/UPpQy3n)

[![HitCount](http://hits.dwyl.io/carsenk/kronos.svg)](http://hits.dwyl.io/carsenk/kronos)
<a href="https://discord.gg/UPpQy3n"><img src="https://discordapp.com/api/guilds/334361453320732673/embed.png" alt="Discord server" /></a>

Kronos - A secondary layer NodeJS/Socket.io/Express/Denarius powered Web Wallet Dashboard with Statistics of your device typically on your LAN by default, though can be setup to be accessed remotely. This is a major project with active development in progress and this repo will be updated in time, be warned, things can break and always always backup backup backup!

Send and Receive Funds, Create new addresses, View Transactions, Unlock/Lock Wallet, Stake D, Reboot your node, Import Private Keys, View Private Keys, Encrypt your wallet, Broadcast raw transactions, Sign and Verify Denarius messages, and much more!

This was built for the Raspberry Pi in mind and one with at least 2GB of RAM, 4GB and 8GB models are recommended! Kronos will run on any Linux distro.

Running the installer script below installs denarius via snap install and then modifies your .env in Kronos and denarius.conf to a random rpcuser and rpcpass, Kronos then generates you a password to login into Kronos with, so be on the look out for that when the installer finishes. (Default Username is kronos). Kronos will then be running on your LAN (192.168.x.x:3000) on port 3000.

Install Kronos with Denarius Now!
-----------------

Simply run the single command below in your Terminal or via SSH, then choose one of the options if you want to Install Kronos with or without Denarius chaindata or if you want to just update!:

```bash
wget -qO- https://raw.githubusercontent.com/carsenk/kronos/master/installkronos.sh | bash
```
or
```bash
curl -o- https://raw.githubusercontent.com/carsenk/kronos/master/installkronos.sh | bash
```

You can choose an option 1-3 from the installer script above to either install Kronos, install Kronos with Denarius chaindata, or Update Kronos!

Recommended Devices and OS
-----------------
* Raspberry Pi 4 4GB - Ubuntu 20.04 Server Image
* Raspberry Pi 4 8GB - Ubuntu 20.04 Server Image
* Ubuntu 20.04
* Ubuntu 19.10
* Ubuntu 19.04
* Ubuntu 18.04
* Ubuntu 16.04
* Raspberry Pi OS

* Linux Mint
* Debian
* Arch Linux
* Fedora
* Red Hat
* Manjaro
* ZorinOS
* elementaryOS
* CentOS
* openSUSE

![ss](https://user-images.githubusercontent.com/10162347/85916042-00c02e80-b80a-11ea-859f-7f82d17353c9.png)

![ss2](https://user-images.githubusercontent.com/10162347/85649248-e64a5180-b65f-11ea-9efc-91d2d03d6adc.png)


Features
--------

- Send and Receive D
- Wallet Addresses
- Address Balances Powered by Scripthash and ElectrumX (denarius.pro)
- View all transactions
- Stake your Denarius
- Block Explorer for Addresses, Blocks, and Transactions
- Realtime Denarius Block Height on Dashboard
- Realtime CPU and Memory Usage Gauges
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
- Easy installer to install Kronos
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
wget -qO- https://raw.githubusercontent.com/carsenk/kronos/master/installkronos.sh | bash
```
or
```bash
curl -o- https://raw.githubusercontent.com/carsenk/kronos/master/installkronos.sh | bash
```

```bash
# Get the latest snapshot
git clone --depth=1 https://github.com/carsenk/kronos.git kronos

# Change directory
cd kronos

# Install NPM dependencies
npm install

# Then simply start Kronos
node ./bin/kronos

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

Copyright (c) 2020 Carsen Klock

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
