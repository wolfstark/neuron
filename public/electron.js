const { app, BrowserWindow, globalShortcut, clipboard, dialog } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const robotjs = require('robotjs');
const log = require('electron-log');
const { createWindow } = require('./window');
const { watchProtocol, setDefaultProtocol } = require('./protocol');
const mainIpc = require('./mainIpc');
const FileSystem = require('./file-system');

Object.assign(console, log.functions);
const nfs = FileSystem.getInstance();

// async function initLocalData() {
//   const filelist = await nfs.loadFileList();
//   console.log('🚀 ~ file: electron.js ~ line 22 ~ initLocalData ~ filelist', filelist);
//   mainIpc.sendToRenderer('update-file-list', filelist);
// }

app.whenReady().then(() => {
  require('./server');
  setDefaultProtocol();
  // ===
  const win = createWindow();
  // initLocalData();
  const ret = globalShortcut.register('Alt+X', async () => {
    const oldString = clipboard.readText();
    robotjs.keyTap('c', 'command'); // ‎当没有选择文本时无效‎
    await new Promise((resolve) => setTimeout(resolve, 100));
    win.webContents.send('clipboard-text', oldString);
  });
  if (!ret) {
    console.log('registration failed');
  }

  // 检查快捷键是否注册成功
  // console.log(globalShortcut.isRegistered("Alt+X"));
});
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
mainIpc.receiveFromRenderer.addListener('new-page', async (event, title) => {
  await nfs.newPage(title);
  const filelist = await nfs.loadFileList();
  mainIpc.sendToRenderer('update-file-list', filelist);
});
mainIpc.receiveFromRenderer.addListener('getLocalfile', async (event, title) => {
  console.log(
    '🚀 ~ file: electron.js ~ line 53 ~ mainIpc.receiveFromRenderer.addListener ~ getLocalfile',
  );
  const filelist = await nfs.loadFileList();
  mainIpc.sendToRenderer('update-file-list', filelist);
});
