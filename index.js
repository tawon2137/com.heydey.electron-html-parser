const {app, BrowserWindow, tray, dialog, Tray, Menu, clipboard} = require('electron');
const path = require('path');
const url = require('url');
const iconPath = path.join(__dirname, 'image/tray-icon3.png');

let mainWindow = null;

let contextMenu = Menu.buildFromTemplate([
    {
        label: 'Open',
        accelerator: 'Alt+Command+I',
        click: () => {
            if(mainWindow) {
                mainWindow.show();
            }
        }
    },
    { label: 'Quit',
        accelerator: 'Command+Q',
        selector: 'terminate:',
    }
]);



function createWindow () {


    const tray = new Tray(iconPath);

    tray.setToolTip('템플릿 변환 프로그램');
    tray.setContextMenu(contextMenu);


    let bounds = tray.getBounds();


    mainWindow = new BrowserWindow({
        width : 1400,
        height : 1000,
        x : Math.round(bounds.x - 200 + (bounds.width / 2)),
        y : (process.platform === 'darwin' ) ? bounds.y + bounds.height + 10 : bounds.y - 400 - 10,
        show : false
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
