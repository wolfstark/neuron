const electron = window.require('electron');

const rendererIpc = {
  receiveFromMain: {
    addListener(eventName, fn) {
      electron.ipcRenderer.addListener(eventName, fn);
    },
    removeListener(eventName, fn) {
      electron.ipcRenderer.removeListener(eventName, fn);
    },
  },
  sendToMain(eventName, ...args) {
    electron.ipcRenderer.send(eventName, ...args);
  },
};
export default rendererIpc;
