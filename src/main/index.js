'use strict'

import {
  app,
  BrowserWindow,
  ipcMain
} from 'electron'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 563,
    useContentSize: true,
    width: 1000,
    webPreferences: {
      webSecurity: false
    }
  })

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */

// eslint-disable-next-line no-unused-vars
let folderpath = ''
ipcMain.on('download', function (event, args) {
  console.log(args, 'main')
  var arr = args.split('+')
  let downloadpath = arr[0]
  folderpath = arr[1]
  event.sender.send('tips', downloadpath)
  mainWindow.webContents.downloadURL(downloadpath)

  // event.sender.send('asynchronous-reply', 'clearCookies')
})

// mainWindow.webContents.session.on('will-download', (event, item, webContents) => {
// console.log(item, 'item')
// 设置文件存放位置
// item.setSavePath('./img/' + `\\${item.getFilename()}`)
// item.on('updated', (event, state) => {
//   if (state === 'interrupted') {
//     console.log('Download is interrupted but can be resumed')
//   } else if (state === 'progressing') {
//     if (item.isPaused()) {
//       console.log('Download is paused')
//     } else {
//       console.log(`Received bytes: ${item.getReceivedBytes()}`)
//     }
//   }
// })
// item.once('done', (event, state) => {
//   if (state === 'completed') {
//     console.log('Download successfully')
//   } else {
//     console.log(`Download failed: ${state}`)
//   }
// })
// })
