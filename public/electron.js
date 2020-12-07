const { app, BrowserWindow, globalShortcut, clipboard } = require("electron");
const path = require("path");
const isDev = require("electron-is-dev");
const robotjs = require("robotjs");

let mainWindow;
function createWindow() {
	mainWindow = new BrowserWindow({
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
	mainWindow.on("closed", () => (mainWindow = null));
	return mainWindow;
}
app.whenReady().then(() => {
	const mw = createWindow();
	const ret = globalShortcut.register("Alt+X", async () => {
		console.log("Alt+X is pressed");
		const oldString = clipboard.readText();
		robotjs.keyTap("c", "command"); // ‎当没有选择文本时无效‎
		await new Promise((resolve) => setTimeout(resolve, 100));
		const newString = clipboard.readText();
		console.log(
			"🚀 ~ file: electron.js ~ line 31 ~ ret ~ newString",
			newString
		);
		clipboard.writeText(oldString);
		// mb.showWindow();
		// webContents.send("translate-clipboard-text", newString.trim());
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
