const electron = require("electron"),
  app = electron.app,
  BrowserWindow = electron.BrowserWindow;

const path = require('path');
const url = require('url');
const fs = require('fs');
const randomstring = require("randomstring");
const Storage = require('json-storage-fs');

const { shell, session, Menu, protocol, nativeTheme, ipcMain } = require('electron');

app.setAppUserModelId("com.carsenk.kronos");
app.setAsDefaultProtocolClient('Kronos');

const log = require('electron-log');
const updater = require("electron-updater");
const autoUpdater = updater.autoUpdater;

// require('update-electron-app')();

// const version = app.getVersion();

// const server = 'https://update.electronjs.org';
// const feed = `${server}/OWNER/REPO/${process.platform}-${process.arch}/${app.getVersion()}`;

// autoUpdater.setFeedURL(feed);
// //https://github.com/carsenk/kronos/releases/download/v1.7.2-Beta/Kronos-Setup-1.7.2-Beta.exe

// autoUpdater.setFeedURL({ urlF });

const extensions = require('./extensions');

//require('@treverix/remote/main').initialize();
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    autoHideMenuBar: true,
    width: 1550,
    height: 900,
    frame: false,
    titleBarStyle: 'hidden',
    icon: __dirname + '../public/img/caesarsmall.png',
    webPreferences: {
      nodeIntegration: true,
      webSecurity: true,
      enableRemoteModule: true,
      webviewTag: true
    }
  });

  // const randosecret = randomstring.generate(42);
  // const randosess = randomstring.generate(42);

  // if (typeof Storage.get('key') == 'undefined') {
  //   Storage.set('key', randosecret);
  //   Storage.set('session', randosess);
  // }

  //extensions.loadMetamask(session, mainWindow);

  mainWindow.loadURL(`file://${__dirname}/index.html`);

  let indexPath;
  indexPath = path.join(`brave/${__dirname}`, 'index.html');

  nativeTheme.themeSource = 'dark';

  // mainWindow.loadURL(url.format({
  //   pathname: indexPath,
  //   protocol: 'chrome',
  //   slashes: true
  // }));

  var template = [{
    label: "Edit",
      submenu: [
        { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
        { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
        { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" }
    ]}
  ];

  // Menu.setApplicationMenu(Menu.buildFromTemplate(template));

  mainWindow.once('ready-to-show', () => {
    autoUpdater.checkForUpdatesAndNotify();
  });

  //mainWindow.webContents.openDevTools();
  mainWindow.on("close", () => {
    mainWindow.webContents.send("stop-server");
  });
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
  mainWindow.webContents.on('new-window', function(e, url) {
    e.preventDefault();
    electron.shell.openExternal(url);
  });

  //Possibly maybe removed for releases
  mainWindow.webContents.session.clearCache();
}

app.on("ready", createWindow);

app.on("browser-window-created", function(e, window) {
  window.setMenu(null);
});

app.on("window-all-closed", function() {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", function() {
  if (mainWindow === null) {
    createWindow();
  }
});

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('Kronos starting...');

// if (fs.existsSync(path.resolve(path.dirname(process.execPath), '..', 'update.exe'))) {
//   setInterval(() => {
//     autoUpdater.checkForUpdates();
//   }, 60000);
// } else {
//   log.info('Started Kronos via Electron instead of exe, Disabling Auto-Updates...');
// }


//autoUpdater.checkForUpdates();
// autoUpdater.checkForUpdatesAndNotify();
log.info('Kronos checking for updates...');


ipcMain.on('open-link', (evt, link) => {
  shell.openExternal(link);
});

ipcMain.on('app_version', (event) => {
  event.sender.send('app_version', { version: app.getVersion() });
});

autoUpdater.on('update-available', () => {
  mainWindow.webContents.send('update_available');
  log.info('Kronos Update is available!');
});
autoUpdater.on('update-downloaded', () => {
  mainWindow.webContents.send('update_downloaded');
  log.info('Kronos Update was downloaded!');
});

// autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
//   const dialogOpts = {
//     type: 'info',
//     buttons: ['Restart', 'Later'],
//     title: 'Application Update',
//     message: process.platform === 'win32' ? releaseNotes : releaseName,
//     detail: 'A new version of Kronos has been downloaded. Restart the application to apply the updates.'
//   };

//   dialog.showMessageBox(dialogOpts).then((returnValue) => {
//     if (returnValue.response === 0) autoUpdater.quitAndInstall();
//   });
// });

ipcMain.on('restart_app', () => {
  autoUpdater.quitAndInstall();
});