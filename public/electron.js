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

function createWindow() {
	const mainWindow = new BrowserWindow({
		width: 900,
		height: 680,
		webPreferences: {
			nodeIntegration: true,
		},
	});
	mainWindow.loadURL(
		isDev
			? "http://localhost:3002"
			: `file://${path.join(__dirname, "../build/index.html")}`
	);
	// mainWindow.on("closed", () => (mainWindow = null));
	return mainWindow;
}
app.whenReady().then(() => {
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
	console.log(globalShortcut.isRegistered("Alt+X"));
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
