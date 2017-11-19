const { app, BrowserWindow, globalShortcut, ipcMain } = require("electron");
const path = require("path");
const url = require("url");

var config = {};

config.dimension = {
	width: 0,
	height: 0
};

config.position = {
	LEFT_TOP: 1,
	RIGHT_TOP: 2,
	LEFT_BOTTOM: 3,
	RIGHT_BOTTOM: 4,
	CENTER: 5
};

var _cwin = null;
var alerts = [];
var appready = false;
var loading = false;

var buildWindow = function() {
	loading = true;
	app.on("ready", () => {
		_cwin = new BrowserWindow({
			width: config.dimension.width,
			height: config.dimension.height,
			transparent: true,
			frame: false,
			skipTaskbar: true
		});

		_cwin.loadURL(
			url.format({
	            pathname: path.join(__dirname, "app", "templates", "notification.html"),
	            protocol: "file",
	            slashes: true
	        })
		);

		_cwin.alerts = alerts;

		ipcMain.on("loaded", (event, args) => {
			appready = true;
			loading = false;
			// loop through and show all notifications
			for(var i = alerts.length-1; i >= 0; i--) {
				var item = alerts[i];
				_cwin.webContents.send('notify', item);
			}
			alerts = [];
		});
	});
}

module.exports = function(title, config) {
	if(_cwin == null && !loading)
		buildWindow();
	if(appready) {
		_cwin.webContents.send('notify', {
			title: title,
			config: config
		});
	} else {
		alerts.push({
			title: title,
			config: config
		});
	}
};