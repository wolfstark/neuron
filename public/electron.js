const { app, BrowserWindow, globalShortcut, clipboard, dialog } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const robotjs = require('robotjs');
const log = require('electron-log');
const { createWindow } = require('./window');
const { watchProtocol, setDefaultProtocol } = require('./protocol');
const mainIpc = require('./mainIpc');
const FileSystem = require('./file-system');
const { serialize } = require('remark-slate');

Object.assign(console, log.functions);
const nfs = FileSystem.getInstance();

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
mainIpc.receiveFromRenderer.addHandler('new-page', async (event, title) => {
  await nfs.newPage(title);
});
mainIpc.receiveFromRenderer.addListener('getLocalConfig', (event, title) => {
  nfs.loadConfigJson().then((settingStr) => {
    mainIpc.sendToRenderer('update-setting', settingStr);
  });
  //TODO: event name的语义有点问题
  nfs.loadFileList().then((list) => {
    mainIpc.sendToRenderer('update-file-list', list);
  });
});

mainIpc.receiveFromRenderer.addListener('getKeyboardStr', (event, title) => {
  nfs.loadKeyboardJson().then((settingStr) => {
    mainIpc.sendToRenderer('update-keyboard', settingStr);
  });
});

mainIpc.receiveFromRenderer.addListener('getLocalfile', (event, title) => {
  nfs.loadPluginList().then((list) => {
    mainIpc.sendToRenderer('update-plugin-list', list);
  });
});
nfs.event.on('afterCreateFile', (filelist) => {
  mainIpc.sendToRenderer('update-file-list', filelist);
});

nfs.event.on('afterInstallPlugin', (filelist) => {
  mainIpc.sendToRenderer('update-plugin-list', filelist);
});

nfs.event.on('afterUpdateConfig', (settingStr) => {
  mainIpc.sendToRenderer('update-setting', settingStr);
});

nfs.event.on('afterUpdateKeyboard', (settingStr) => {
  mainIpc.sendToRenderer('update-keyboard', settingStr);
});

mainIpc.receiveFromRenderer.addListener('loadFileJson', async (event, title) => {
  const json = await nfs.loadFileJson(title);
  mainIpc.sendToRenderer('loadFileJson', json);
});

mainIpc.receiveFromRenderer.addListener('modifyFileJson', async (event, title, json) => {
  await nfs.modifyFileJson(title, json);
});

mainIpc.receiveFromRenderer.addListener('updateConfigJson', async (event, jsonstr) => {
  await nfs.updateConfigJson(jsonstr);
});

mainIpc.receiveFromRenderer.addHandler('updateKeyboard', async (event, jsonstr) => {
  return await nfs.updateKeyboard(jsonstr);
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
  if (res) {
    nfs.installPlugin(res[0]);
  }
  // console.log('🚀 ~ file: index.tsx ~ line 61 ~ installHandle ~ res', res);
});
mainIpc.receiveFromRenderer.addListener('updatePlugin', async (event, plugin) => {
  await nfs.updatePlugin(plugin);
  // const json = await nfs.loadFileJson(title);
  // mainIpc.sendToRenderer('update-plugin-list', filelist);
});
mainIpc.receiveFromRenderer.addListener('exportMD', async (event, filename) => {
  const filepath = dialog.showSaveDialogSync({
    defaultPath: filename + '.md',
  });
  if (filepath) {
    const fileJson = await nfs.loadFileJson(filename);
    const mdstr = fileJson.block.map((v) => serialize(v)).join('');
    console.log(
      '🚀 ~ file: electron.js ~ line 105 ~ mainIpc.receiveFromRenderer.addListener ~ mdstr',
      mdstr,
    );
  }
  // const json = await nfs.loadFileJson(title);
  // mainIpc.sendToRenderer('update-plugin-list', filelist);
});
