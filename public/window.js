const { BrowserWindow } = require("electron");
const electronIsDev = require("electron-is-dev");
const path = require("path");

let win = null;

function createWindow() {
	if (win) return win;
	win = new BrowserWindow({
		width: 900,
		height: 680,
		webPreferences: {
			nodeIntegration: true,
		},
	});
	win.loadURL(
		electronIsDev
			? "http://localhost:3002"
			: `file://${path.join(__dirname, "../build/index.html")}`
	);
	// mainWindow.on("closed", () => (mainWindow = null));
	return win;
}
module.exports = {
	createWindow,
};
