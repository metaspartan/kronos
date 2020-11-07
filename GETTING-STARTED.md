# KRONOS GETTING STARTED

KRONOS INFORMATION
-----------------
Kronos creates a `/data` and a `/kronosleveldb` folder directories for storing your data and local databases. Kronos data is encrypted using a randomly generated secret key upon the first launch of Kronos and securely stored in your OS's Keychain (Keychain on macOS, Credential Manager on Windows, and libsecret on Linux).

If you wish to start fresh with Kronos and get back to the selection screen, delete the `/data` and `/kronosleveldb` folders after shutting down Kronos. Then enter the keychain manager in your OS and search for `Kronos/localkey` & `Kronos/localses` remove them as well. After removing all folders and keychain data listed you can boot Kronos.

Helpful Commands
-----------------
`nohup npm run headless &` To run Kronos in a headless mode on your LAN (typically ran from Raspberry Pi) (Outputs log to nohup.out)
`node -r esm ./bin/kronos` Alternative command to the `npm run headless` command, no log output
`electron-forge start` To run Kronos in app mode with Electron, also outputs LAN server (can be ran from OS of choice with GUI)

KRONOS BASH INSTALLER SCRIPT
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

RUN KRONOS HEADLESS MODE (Raspberry Pi, etc.):
-----------------
Install NodeJS v12.x via NodeSource or Installer from https://nodejs.org

```
# Using Ubuntu
sudo apt install -y curl
curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
sudo apt-get install -y nodejs

# Using Debian, as root
apt install -y curl
curl -sL https://deb.nodesource.com/setup_12.x | bash -
apt-get install -y nodejs
```
Run `sudo apt-get install -y nodejs` to install Node.js 12.x and npm

You may also need development tools to build native addons:
`sudo apt-get install gcc g++ make`

To install the Yarn package manager, run:
```
     curl -sL https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
     echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
     sudo apt-get update && sudo apt-get install yarn
```

Install and Run Kronos
```
sudo apt install build-essential gcc g++ make

sudo mkdir -p ~/Kronos/DATA/storage

sudo mkdir -p ~/Kronos/DATA/kronosleveldb

git clone https://github.com/carsenk/kronos.git

cd kronos

sudo su

npm install -g electron electron-forge electron-rebuild node-gyp

npm install

cd node_modules/node-pty-prebuilt-multiarch

node-gyp configure

node-gyp build

cd ../..

nohup npm run headless &
```


RUNNING THE KRONOS ELECTRON APP (Windows, macOS, etc.):
-----------------
Install NodeJS v12.16.3 via NVM or Installer from https://nodejs.org
```
git clone https://github.com/carsenk/kronos.git

cd kronos

npm install -g electron electron-forge electron-rebuild electron-builder node-gyp windows-build-tools

npm install

cd node_modules/node-pty-prebuilt-multiarch

node-gyp configure

node-gyp build

cd ../..

npm run kronos
```

BUILDING THE KRONOS ELECTRON APP (If you want to build your own binaries):
-----------------
Install NodeJS v12.16.3 via NVM or Installer from https://nodejs.org
```
git clone https://github.com/carsenk/kronos.git

cd kronos

npm install -g electron electron-forge electron-rebuild electron-builder node-gyp windows-build-tools

npm install

cd node_modules/node-pty-prebuilt-multiarch

node-gyp configure

node-gyp build

cd ../..

npm run buildwin
```