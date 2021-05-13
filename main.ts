import { app, BrowserWindow, screen, Menu, globalShortcut } from 'electron';
import * as path from 'path';
import * as url from 'url';

// const InputMenu = Menu.buildFromTemplate([{
//         label: 'Undo',
//         role: 'undo',
//     }, {
//         label: 'Redo',
//         role: 'redo',
//     }, {
//         type: 'separator',
//     }, {
//         label: 'Cut',
//         role: 'cut',
//     }, {
//         label: 'Copy',
//         role: 'copy',
//     }, {
//         label: 'Paste',
//         role: 'paste',
//     }, {
//         type: 'separator',
//     },
// ]);

let win: BrowserWindow = null;

const args = process.argv.slice(1);
const serve = args.some(val => val === '--serve');

const createWindow = (): BrowserWindow => {

  const electronScreen = screen;
  const size = electronScreen.getPrimaryDisplay().workAreaSize;

  Menu.setApplicationMenu(null);

  // Create the browser window.
  win = new BrowserWindow({
    x: 0,
    y: 0,
    width: size.width,
    height: size.height,
    title: "Unilist",
    webPreferences: {
      nodeIntegration: true,
      allowRunningInsecureContent: (serve) ? true : false,
      webSecurity: (serve) ? false : true
    }
    //frame: false
  });


  if (serve) {

    require('devtron').install();
    win.webContents.openDevTools();

    require('electron-reload')(__dirname, {
      electron: require(`${__dirname}/node_modules/electron`)
    });
    win.loadURL('http://localhost:4002');

  } else {

    let p = path.join(__dirname, 'dist/unilist/index.html');
    win.loadURL(url.format({
      pathname: p,
      protocol: 'file:',
      slashes: true
    }));
  }

  //win.webContents.toggleDevTools();


  // win.on('close', (e) => {
  //   console.log('I do not want to be closed')
  //   e.preventDefault();
  //   setTimeout(() => {
  //     win.close();
  //   })
  // });

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });





  win.webContents.on('context-menu', (e, props) => {
    const InputMenu = Menu.buildFromTemplate([{
        label: 'Undo',
        role: 'undo',
    }, {
        label: 'Redo',
        role: 'redo',
    }, {
        type: 'separator',
    }, {
        label: 'Cut',
        role: 'cut',
    }, {
        label: 'Copy',
        role: 'copy',
    }, {
        label: 'Paste',
        role: 'paste',
    },
    ]);
    const { inputFieldType } = props;
    if (inputFieldType === 'plainText') {
      InputMenu.popup();
    }
  });


















  return win;
}

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit();
} else {

  //try {

  app.allowRendererProcessReuse = true;

  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (win) {
      if (win.isMinimized()) {
        win.restore();
      };
      win.focus();
    }
  })


  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  // Added 400 ms to fix the black background issue while using transparent window. More detais at https://github.com/electron/electron/issues/15947
  app.on('ready', () => {
    setTimeout(createWindow, 400);
    globalShortcut.register('CommandOrControl+F12', () => {
//      console.log('F12 is pressed');
      win.webContents.toggleDevTools();
    });
  });

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });

  // } catch (e) {
  //   // Catch Error
  //   // throw e;
  // }
}

