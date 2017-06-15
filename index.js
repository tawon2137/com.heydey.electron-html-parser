const {app, BrowserWindow, tray, dialog, Tray, Menu, clipboard} = require('electron');
const path = require('path');
const url = require('url');
const iconPath = path.join(__dirname, 'image/tray-icon3.png');

let mainWindow = null;

let contextMenu = Menu.buildFromTemplate([
    { label: 'Quit',
        accelerator: 'Command+Q',
        selector: 'terminate:',
        click : () => app.quit()
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
        show : false,
        acceptFirstMouse : true
    });

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }));
    mainWindow.setMenu(null);


    if (process.platform === 'darwin') {
        mainWindow.on('blur', () => mainWindow.hide());
        tray.on('right-click', () => toggle());
    }else{
        tray.on('click', () => toggle());
    }
}

app.on('ready', createWindow);

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


function toggle() {
    if ( mainWindow.isVisible() ){
        mainWindow.hide();
    } else {
        mainWindow.show();
    }
}
