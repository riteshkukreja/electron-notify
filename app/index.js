const { app, BrowserWindow, globalShortcut } = require("electron");
const path = require("path");
const url = require("url");
const eNotify = require("../electron-notify");

let win = null;

eNotify.notify({
    title: "Hello World",
    body: "This is body"
});


var shouldQuit = app.makeSingleInstance(function(commandLine, workingDirectory) {
  // Someone tried to run a second instance, we should focus our window.
  if (win) {
    win.show();
  }
});

if (shouldQuit) {
  app.quit();
  return;
}

app.on("ready", () => {

    win = new BrowserWindow({
        width: 400,
        height: 300,
        transparent: true,
        frame: false
    });

    win.on("close", () => {
        win = null;
    });

    win.loadURL(
        url.format({
            pathname: path.join(__dirname, "index.html"),
            protocol: "file",
            slashes: true
        })
    );

    win.on('ready-to-show', () => {
        win.show()
    });

    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
            app.quit()
        }
    });

    app.on('before-quit', () => {
        if(win) {
            win.removeAllListeners('close');
            win.close();  
        }
    });
});

