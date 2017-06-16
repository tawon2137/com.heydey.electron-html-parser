const {app, BrowserWindow, tray, dialog, Tray, Menu, clipboard} = require('electron');
const path = require('path');
const url = require('url');
const iconPath = path.join(__dirname, 'image/tray-icon3.png');

let mainWindow = null;

let contextMenu = Menu.buildFromTemplate([
    {
      label: 'hide',
      click : () => mainWindow ? mainWindow.hide() : ''
    },
    {
      label: 'Quit',
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

    let width = 1400,height = 1000;
    mainWindow = new BrowserWindow({
        width : width,
        height : height,
        x : Math.round(bounds.x - width + (bounds.width / 2)),
        y : (process.platform === 'darwin' ) ? bounds.y + bounds.height + 10 : bounds.y - height - 10,
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
