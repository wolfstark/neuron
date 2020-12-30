const { BrowserWindow } = require('electron');
const electronIsDev = require('electron-is-dev');
const path = require('path');
const FileSystem = require('./file-system');
const mainIpc = require('./mainIpc');

let win = null;
const nfs = FileSystem.getInstance();

// async function initLocalData() {
//   const filelist = await nfs.loadFileList();
//   console.log('🚀 ~ file: electron.js ~ line 22 ~ initLocalData ~ filelist', filelist);
//   mainIpc.sendToRenderer('update-file-list', filelist);
// }

function createWindow() {
  if (win) return win;
  win = new BrowserWindow({
    width: 900,
    height: 680,
    show: false,
    backgroundColor: '#ffffff',
    webPreferences: {
      nodeIntegration: true,
    },
  });
  win.once('ready-to-show', () => {
    win.show();
  });
  win.loadURL(
    electronIsDev
      ? 'http://localhost:3002'
      : `file://${path.join(__dirname, '../build/index.html')}`,
  );
  // mainWindow.on("closed", () => (mainWindow = null));
  return win;
}
module.exports = {
  createWindow,
};
