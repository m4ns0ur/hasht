const {app, BrowserWindow, ipcMain} = require('electron')
const path = require('path')
const url = require('url')
const hasht = require('./hasht.js')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

function createWindow() {
  win = new BrowserWindow({
    width: 900,
    height: 600,
    show: false,
    backgroundColor: '#8aba87',
    // frame:false,
    // toolbar: false,
    // 'accept-first-mouse': true,
    // transparent: true,
    // left:d.workArea.x,
    // top:d.workArea.y,
    // 'skip-taskbar': true,
    // 'auto-hide-menu-bar': true,
    // 'enable-larger-than-screen': true,
    // width:size.width,
    // height:size.height
  })

  win.setMenuBarVisibility(false)
  // win.openDevTools()

  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  win.webContents.on('crashed', () => {
    const options = {
      type: 'info',
      title: 'Renderer Process Crashed',
      message: 'This process has crashed.',
      buttons: ['Reload', 'Close']
    }
    dialog.showMessageBox(options, function (index) {
      if (index === 0) win.reload()
      else win.close()
    })
  })

  win.once('ready-to-show', () => {
    win.show()
  })

  win.on('unresponsive', function () {
    const options = {
      type: 'info',
      title: 'Renderer Process Hanging',
      message: 'This process is hanging.',
      buttons: ['Reload', 'Close']
    }
    dialog.showMessageBox(options, function (index) {
      if (index === 0) win.reload()
      else win.close()
    })
  })

  win.on('responsive', function () {
    // Do something when the window is responsive again
  })

  win.on('closed', () => {
    win = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
})

ipcMain.on('file-selected', (event, name) => {
  hasht.hash(name, (percentage, transferred, size) => {
    event.sender.send('hash-prog', percentage, transferred, size)
  }, (hashes) => {
    event.sender.send('hash-ready', hashes)
  })
})
