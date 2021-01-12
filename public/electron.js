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
  // const filelist = await nfs.loadFileList();
  // mainIpc.sendToRenderer('update-file-list', filelist);
});
mainIpc.receiveFromRenderer.addListener('getLocalfile', async (event, title) => {
  console.log(
    '🚀 ~ file: electron.js ~ line 53 ~ mainIpc.receiveFromRenderer.addListener ~ getLocalfile',
  );
  const filelist = await nfs.loadFileList();
  mainIpc.sendToRenderer('update-file-list', filelist);
});
nfs.event.on('afterCreateFile', (filelist) => {
  mainIpc.sendToRenderer('update-file-list', filelist);
});

mainIpc.receiveFromRenderer.addListener('loadFileJson', async (event, title) => {
  const json = await nfs.loadFileJson(title);
  mainIpc.sendToRenderer('loadFileJson', json);
});

mainIpc.receiveFromRenderer.addListener('modifyFileJson', async (event, title, json) => {
  await nfs.modifyFileJson(title, json);
});

mainIpc.receiveFromRenderer.addListener('installPlugin', async (event, title, json) => {
  const res = dialog.showOpenDialogSync({
    // title: '对话框窗口的标题',
    // 默认打开的路径，比如这里默认打开下载文件夹
    defaultPath: app.getPath('downloads'),
    buttonLabel: '安装',
    // 限制能够选择的文件类型
    filters: [
      // { name: 'Images', extensions: ['jpg', 'png', 'gif'] },
      // { name: 'Movies', extensions: ['mkv', 'avi', 'mp4'] },
      // { name: 'Custom File Type', extensions: ['as'] },
      // { name: 'All Files', extensions: ['*'] },
    ],
    properties: ['openDirectory'],
    // message: 'mac文件选择器title',
  });
  console.log('🚀 ~ file: index.tsx ~ line 61 ~ installHandle ~ res', res);
});
