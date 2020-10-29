const fs = require('fs');
const path = require('path');
const { ipcMain, BrowserWindow } = require('electron');

//import { ExtensibleSession } from ('electron-extensions');

//const extension = new ExtensibleSession();

const METAMASK_ID = 'nkbihfbeogaeaoehlefnkodbefgpgknn';
const METAMASK_KEY = 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAlcgI4VVL4JUvo6hlSgeCZp9mGltZrzFvc2Asqzb1dDGO9baoYOe+QRoh27/YyVXugxni480Q/R147INhBOyQZVMhZOD5pFMVutia9MHMaZhgRXzrK3BHtNSkKLL1c5mhutQNwiLqLtFkMSGvka91LoMEC8WTI0wi4tACnJ5FyFZQYzvtqy5sXo3VS3gzfOBluLKi7BxYcaUJjNrhOIxl1xL2qgK5lDrDOLKcbaurDiwqofVtAFOL5sM3uJ6D8nOO9tG+T7hoobRFN+nxk43PHgCv4poicOv+NMZQEk3da1m/xfuzXV88NcE/YRbRLwAS82m3gsJZKc6mLqm4wZHzBwIDAQAB';

// const getMetamaskPath = (isDev) => {
//   if (isDev) {
//     return path.join(__dirname,`extensions/metamask/`);
//   }
//   return path.resolve(__dirname,`../../app.asar.unpacked/dist/src/extensions/metamask/`);
// };

const loadMetamaskFromManifest = (session, metamaskPath) => {
  fs.readFile(path.join(metamaskPath,'manifest.json'), 'utf8', function (err, data) {
    if (err) console.log(err);
    let manifest;
    manifest = JSON.parse(data);
    manifest.content_scripts[0].matches = ['chrome://brave/**/*'];
    manifest.key = METAMASK_KEY;
    session.defaultSession.extensions.load(metamaskPath, manifest, 'component');
    //session.defaultSession.loadExtension('C:\Users\carse\Desktop\kronos\src\extensions\metamask');
     //extension.loadExtension(metamaskPath);
  });
};

const createPopup = (file) => {
  return new BrowserWindow({
    title: 'MetaMask',
    width: 360,
    height: 520,
    type: 'popup',
    resizable: false
  });
};

const closePopup = (popup) => {
  if(popup && !popup.isDestroyed()) popup.close();
};

const loadMetamask = (session, window) => {
  let manifest;
  let metamaskPopup;
  let metamaskNotification;
  let mainWindow = window;

  const metamaskPath = path.join(__dirname,`extensions/metamask/`); // getMetamaskPath(isDev);
  loadMetamaskFromManifest(session, metamaskPath);

  ipcMain.on('open-metamask-popup', (event, arg) => {
    if(metamaskPopup && !metamaskPopup.isDestroyed()) metamaskPopup.close();

    metamaskPopup = createPopup();
    metamaskPopup.loadURL(`chrome-extension://${METAMASK_ID}/popup.html`);
  });

  ipcMain.on('open-metamask-notification', (event, arg) => {
    if(metamaskNotification && !metamaskNotification.isDestroyed()) metamaskNotification.close();

    metamaskNotification = createPopup();
    metamaskNotification.loadURL(`chrome-extension://${METAMASK_ID}/notification.html`);
  });

  ipcMain.on('close-metamask-popup', (event, arg) => {
    closePopup(metamaskPopup);
  });

  ipcMain.on('close-metamask-notification', (event, arg) => {
    closePopup(metamaskNotification);
  });
};

module.exports = {
  loadMetamask
};