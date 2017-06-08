const {app, BrowserWindow, tray, dialog, Tray, Menu, clipboard} = require('electron');
const path = require('path');
const url = require('url');

let mainWindow = null;

function createWindow () {

    const tray = new Tray(path.join(__dirname, 'image/logo_sm.png'));

    let bounds = tray.getBounds();


    mainWindow = new BrowserWindow({
        width : 2000,
        height : 1000,
        x : Math.round(bounds.x - 200 + (bounds.width / 2)),
        y : (process.platform === 'darwin' ) ? bounds.y + bounds.height + 10 : bounds.y - 400 - 10,
    });

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }));

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {

    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow();
    }
});
