# Kronos Wallet

Official Website: https://kronoswallet.com


Official BitClout (CLOUT) @kronoswallet https://bitclout.com/u/kronoswallet by https://bitclout.com/u/carsenk

#### A Dashboard Interface and Wallet for Denarius (D), Bitcoin (BTC), Ethereum (ETH), Binance Smart Chain (BSC), BitClout (CLOUT) and Fantom Opera (FTM) written in NodeJS and Electron
=======================
![Kronos Logo](https://user-images.githubusercontent.com/10162347/93870495-8bd68680-fc8a-11ea-85f7-a5ca7b52d1ba.png)

[![GitHub version](https://img.shields.io/github/release/carsenk/kronos.svg)](https://badge.fury.io/gh/carsenk%2Fkronos)
[![Build Status](https://travis-ci.org/carsenk/kronos.svg?branch=master)](https://travis-ci.org/carsenk/kronos) [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/carsenk/kronos) [![Dependency Status](https://david-dm.org/carsenk/kronos/status.svg?style=flat)](https://david-dm.org/carsenk/kronos) [![devDependencies Status](https://david-dm.org/carsenk/kronos/dev-status.svg)](https://david-dm.org/carsenk/kronos?type=dev) [![Join the chat at https://discord.gg/UPpQy3n](https://img.shields.io/badge/Discord-Chat-blue.svg?logo=discord)](https://discord.gg/UPpQy3n)

[![Kronos downloads](https://img.shields.io/github/downloads/carsenk/kronos/total.svg)](https://github.com/carsenk/kronos/releases)
<a href="https://discord.gg/UPpQy3n"><img src="https://discordapp.com/api/guilds/334361453320732673/embed.png" alt="Discord server" /></a>
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/carsenk/kronos.svg) ![GitHub repo size in bytes](https://img.shields.io/github/repo-size/carsenk/kronos.svg)

[![Build history](https://buildstats.info/travisci/chart/carsenk/kronos?branch=master)](https://travis-ci.org/carsenk/kronos?branch=master)

This is a massive project with active development in progress and this repo will be updated in time, be warned, things can break and always always backup backup backup!

Kronos is a Dashboard Interface and Wallet for Denarius (D), Bitcoin (BTC), Ethereum (ETH), Binance Smart Chain (BSC), BitClout (CLOUT) and Fantom Opera (FTM) as an app written in NodeJS and Electron. The Kronos Wallet is also now available on Windows, macOS, and Linux platforms. (You can also access it on mobile from your local network).

Send and Receive D, BTC, ETH, USDT, BSC, BUSD, CLOUT, and FTM Funds in Core Mode!

In Advanced Mode create new Denarius addresses, view transactions, unlock/lock wallet, stake D, reboot your node, import private keys, encrypt your wallet, broadcast raw transactions, sign and verify Denarius messages, and much more!

This was built for the Raspberry Pi in mind and one with at least 2GB of RAM. 4GB and 8GB models are recommended! Kronos will run on any Linux distro with a minimal amount of 2GB of RAM.

Running the Kronos headless installer script below installs denarius via snap install and then modifies your .env in Kronos and denarius.conf to a random rpcuser and rpcpass, Kronos will then be running on your LAN (192.168.x.x:3000) on port 3000.

# [GET STARTED USING KRONOS](https://github.com/carsenk/kronos/blob/master/GETTING-STARTED.md)

Recommended Devices and OS
-----------------
* Windows 10
* macOS 10.11 or greater
* Linux (Any modern distro, Ubuntu preferred)
* 4GB RAM recommended for Advanced Mode with Denarius running
* 2GB RAM recommended for Core Mode without Denarius running

Screenshots
-----------------

![Kronos](https://user-images.githubusercontent.com/10162347/122498442-5b6b1100-cfac-11eb-8e91-589ab947bedb.png)

Older Screenshots:
![Kronos Chat](https://user-images.githubusercontent.com/10162347/101270126-5131a580-3733-11eb-93e2-56f6f77ff9d8.png)

![Kronos](https://user-images.githubusercontent.com/10162347/101270092-ee400e80-3732-11eb-97a8-36cf76db37ee.png)


Features
--------

-----This list needs some updating soon...
- Send and Receive D, BTC, ETH, BSC, USDT, BUSD, CLOUT, and FTM in Core Mode (Multi Crypto Wallets)
- Decentralized Bitclout.com CLOUT Profile Creation and Updating
- Decentralized Chat with private encrypted messaging
- Core Mode and Advanced Mode
- Send and Receive D
- Wallet Addresses
- Address Balances Powered by Scripthash and ElectrumX (denarius.pro)
- View all transactions
- Stake your Denarius in Advanced Mode
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
- KeepKey Client (View Denarius Address and Balance and TX History) (No TX Signing Yet)
- Easy to install
- Auto Updates for Denarius via Snap
- Easy installer to install Kronos
- Mobile Ready Responsive Design
- Flash and Toastr notifications
- MVC Project Structure
- CSRF protection
- XSS protection

-More features will be coming!

Changes
-------------
As of v1.5.0 Beta of Kronos it is now built with Electron for Windows, macOS, and Linux as an AIO app to use alongside a Denarius node.

As of v1.5.5 Beta of Kronos it now features multi modes "Core" which only relays on ElectrumX SPV Servers and a more "Pro" mode where you can configure the RPC details to your Denarius node.

As of v1.6.0 Beta of Kronos it now features ETH and BSC support fully, you can send and receive BSC or ETH in Core Mode in Kronos

As of v1.6.3 Beta of Kronos it now features using OS built keychain security for storing randomly generated secret keys for use with Kronos encryption.

As of v1.7.5 Beta of Kronos it now has binaries built and auto updating for the binaries along with a dedicated data directory for Kronos data.

As of v1.7.7 Beta of Kronos it now has decentralized encrypted chat between both Core and Advanced Modes. Importing of seed phrases in Core Mode is now available!

As of v2.0.0 Beta of Kronos it now has support for Binance Smart Chain (BSC), Binance USD (BEP20 BUSD), FTM (Fantom Opera), and Tether USD (ERC20 USDT) including many other small UI updates and optimization improvements

As of v2.0.1 Beta of Kronos it now has support for BitClout (CLOUT). Further integration is a WIP, Send and Receiving CLOUT works!

As of v2.0.2 Beta of Kronos it now has more support for CLOUT profiles, your avatar throughout Kronos will now reflect what your BitClout PubKey has set!

As of v2.0.3 Beta of Kronos it now fully supports CLOUT profiles, allowing profile creation and updating directly in Kronos for the BitClout network, You can now input/import your own seed phrase during Kronos setup. CLOUT Explorer updated to using explorer.cloutangel.com

Prerequisites
-------------

- [denariusd](https://github.com/carsenk/denarius)
- [Node.js 12+](http://nodejs.org)

Getting Started
---------------
[GET STARTED USING KRONOS](https://github.com/carsenk/kronos/blob/master/GETTING-STARTED.md)


License
-------

The MIT License (MIT)

Copyright (c) 2020-2021 Carsen Klock

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
