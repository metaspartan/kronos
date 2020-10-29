const electron = require("electron"),
  app = electron.app,
  BrowserWindow = electron.BrowserWindow;

const path = require('path');
const url = require('url');
const fs = require('fs');

const { shell, session, Menu, ipcMain } = require('electron');

require('update-electron-app')();

const extensions = require('./extensions');

//require('@treverix/remote/main').initialize();
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    autoHideMenuBar: true,
    width: 1450,
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

  //extensions.loadMetamask(session, mainWindow);

  mainWindow.loadURL(`file://${__dirname}/index.html`);

  let indexPath;
  indexPath = path.join(`brave/${__dirname}`, 'index.html');

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

  ipcMain.on('open-link', (evt, link) => {
    shell.openExternal(link);
  });
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