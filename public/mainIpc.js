const electron = require('electron');


exports.receiveFromRenderer = {
  addListener(eventName, fn) {
    electron.ipcMain.addListener(eventName, fn);
  },
  removeListener(eventName, fn) {
    electron.ipcMain.removeListener(eventName, fn);
  },
};

function sendToRenderer(eventName, ...args) {
  electron.BrowserWindow.getAllWindows().forEach((window) => {
    sendToRendererWindow(window, eventName, ...args);
  });
}
function sendToRendererWindow(window, eventName, ...args) {
  window.webContents.send(eventName, ...args);
}
exports.sendMainToNotion = sendToRenderer;
