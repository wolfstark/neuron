const { app, BrowserWindow } = require("electron");
const path = require("path");
const isDev = require("electron-is-dev");

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
            ? "http://localhost:3000"
            : `file://${path.join(__dirname, "../build/index.html")}`
    );
    mainWindow.on("closed", () => (mainWindow = null));
}
app.whenReady().then(createWindow);
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
