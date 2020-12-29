const {
	app,
	BrowserWindow,
	globalShortcut,
	clipboard,
	dialog,
} = require("electron");
const path = require("path");
const isDev = require("electron-is-dev");
const robotjs = require("robotjs");
const log = require("electron-log");
const { createWindow } = require("./window");
const { watchProtocol, setDefaultProtocol } = require("./protocol");
const mainIpc = require("./mainIpc");
const FileSystem = require("./file-system");

Object.assign(console, log.functions);
const nfs = new FileSystem(path.resolve(app.getPath("documents"),'./neuron'));
console.log("🚀 ~ file: electron.js ~ line 21 ~ ", app.getPath("documents"))

async function initLocalData() {
  const filelist = await nfs.loadFileList();
  mainIpc.sendToRenderer('update-file-list',filelist);
}

app.whenReady().then(() => {
  require("./server");
  setDefaultProtocol();
  initLocalData();
  // ===
	const win = createWindow();
	const ret = globalShortcut.register("Alt+X", async () => {
		const oldString = clipboard.readText();
		robotjs.keyTap("c", "command"); // ‎当没有选择文本时无效‎
		await new Promise((resolve) => setTimeout(resolve, 100));
		win.webContents.send("clipboard-text", oldString);
	});
	if (!ret) {
		console.log("registration failed");
	}

	// 检查快捷键是否注册成功
	// console.log(globalShortcut.isRegistered("Alt+X"));

});
app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});
app.on("activate", () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow();
	}
});
mainIpc.receiveFromRenderer.addListener('new-page',(event,title)=>{
  console.log("🚀 ~ file: electron.js ~ line 56 ~ mainIpc.receiveFromRenderer.addListener ~ title", title)
  nfs.newPage(title)
})
