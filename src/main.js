const electron = require("electron"),
  app = electron.app,
  BrowserWindow = electron.BrowserWindow;

const path = require('path');
const url = require('url');
const fs = require('fs');
const randomstring = require("randomstring");
const Storage = require('json-storage-fs');

const { shell, session, Menu, protocol, nativeTheme, ipcMain} = require('electron');

const contextMenu = require('electron-context-menu');

app.setAppUserModelId("com.metaspartan.kronos");
app.setAsDefaultProtocolClient('Kronos');

const log = require('electron-log');
const updater = require("electron-updater");
const autoUpdater = updater.autoUpdater;

// require('update-electron-app')();

// const version = app.getVersion();

// const server = 'https://update.electronjs.org';
// const feed = `${server}/OWNER/REPO/${process.platform}-${process.arch}/${app.getVersion()}`;

// autoUpdater.setFeedURL(feed);
// //https://github.com/metaspartan/kronos/releases/download/v1.7.2-Beta/Kronos-Setup-1.7.2-Beta.exe

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
      nativeWindowOpen: true,
      webSecurity: true,
      spellcheck: true,
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

  contextMenu({
    showInspectElement: false,
    prepend: (defaultActions, params) => [
        {
            label: 'Rainbow',
            // Only show it when right-clicking images
            showInspectElement: false,
            visible: params.mediaType === 'image'
        },
        {
            label: 'Search Google for “{selection}”',
            // Only show it when right-clicking text
            showInspectElement: false,
            visible: params.selectionText.trim().length > 0,
            click: () => {
                shell.openExternal(`https://google.com/search?q=${encodeURIComponent(params.selectionText)}`);
            }
        }
    ]
  });

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

  let wc = mainWindow.webContents;
  wc.on('will-navigate', function (e, url) {
    if (url != wc.getURL()) {
      e.preventDefault()
      electron.shell.openExternal(url)
    }
  });

  //Possibly maybe removed for releases
  mainWindow.webContents.session.clearCache();
}

app.on("ready", createWindow);

app.on("browser-window-created", function(e, window) {
  window.setMenu(null);
});

// Listen for web contents being created
app.on('web-contents-created', (e, contents) => {

  // Check for a webview
  if (contents.getType() == 'webview') {
    contextMenu({ window: contents, }); 
    // Listen for any new window events
    contents.on('new-window', (e, url) => {
      e.preventDefault()
      shell.openExternal(url)
    })
  }
})

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