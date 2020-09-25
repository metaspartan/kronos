# KRONOS GETTING STARTED


KRONOS HEADLESS MODE:
-----------------
Install NodeJS v12.16.3 via NVM or Installer from https://nodejs.org
```
git clone https://github.com/carsenk/kronos.git

cd kronos

npm install -g electron electron-forge electron-rebuild node-gyp

npm install

cd node_modules/node-pty-prebuilt-multiarch

node-gyp configure

node-gyp build

cd ../..

nohup npm run headless &
```


RUNNING THE KRONOS ELECTRON APP:
-----------------
Install NodeJS v12.16.3 via NVM or Installer from https://nodejs.org
```
git clone https://github.com/carsenk/kronos.git

cd kronos

npm install -g electron electron-forge electron-rebuild node-gyp

npm install

cd node_modules/node-pty-prebuilt-multiarch

node-gyp configure

node-gyp build

cd ../..

electron-forge start or electron .
```

BUILDING THE KRONOS ELECTRON APP:
-----------------
Install NodeJS v12.16.3 via NVM or Installer from https://nodejs.org
```
git clone https://github.com/carsenk/kronos.git

cd kronos

npm install -g electron electron-forge electron-rebuild node-gyp

npm install

cd node_modules/node-pty-prebuilt-multiarch

node-gyp configure

node-gyp build

cd ../..

electron-forge make
```