
var CustomNotification = require("./CustomNotification");

var app = {};

/** Configurations **/
// force native notification
// if true, it will not show any notification is isNativeSupported is false
app.forceNative = false;

// force custom notification
// if true, no native notification will be shown
app.forceCustom = false;

// maximum notification can be shown simultaneoulsy
app.maximumShown = 5;

// maximum queue size of notification pool
// negative for infinite pool size
app.poolSize = 10;

// default timeout for a notification
// default is 30s
// not supported for native notifications
// negative for infinite time (not recommended)
app.notificationTimeout = 30;

// notification pool
app.pool = [];

// current shown pool
app.visiblePool = [];

// should iterate for notification pooler
var shouldIterate = false;

// notification constructor
var _Notification = function(config) {

	// heading of notifition
	var title = config.title || "";
	
	// sub heading of notification (supported only on custom notification or Mac OSX)
	var subTitle = config.subTitle || "";

	// description of notification
	var body = config.body || "";

	// timeout for which the notification will be visible
	var timeout = config.timeout || app.notificationTimeout;

	// icon of the notification
	var icon = config.icon || undefined;

	// is silent ( doesnt make sound)
	var isSilent = config.isSilent || false;

	// is native notification
	var isNative = config.isNative && app.isNativeSupported() || false;

	// has reply option (only supported on MacOSX)
	var replyPlaceholder = config.replyPlaceholder || undefined;

	// buttons with actions
	// only supported on custom notifications
	var buttons = config.buttons || [];

	// start time
	var startedAt = null;

	// is completed
	var completed = false;

	// click event
	var onClick = function(event) {
		console.log("Notification Clicked");

		if(typeof config.onClick == "function")
			config.onClick();
	};

	// close event
	var onClose = function(event) {
		console.log("Notification Closed");

		completed = true;

		if(typeof config.onClose == "function")
			config.onClose();
	};

	// reply event
	var onReply = function(event) {
		console.log("Notification Replied");

		if(typeof config.onReply == "function")
			config.onReply();
	};

	// notification object
	var myNotification = null;

	// draw native notification method
	var drawNative = function() {
		myNotification = new Notification(title, {
			body: body,
			icon: icon,
			subtitle: subTitle,
			silent: isSilent,
			replyPlaceholder: replyPlaceholder,
			hasReply: replyPlaceholder !== undefined
		});

		myNotification.addEventListener("click", onClick);
		myNotification.addEventListener("close", onClose);
		myNotification.addEventListener("reply", onReply);
	};

	// draw custom notification
	var drawCustom = function() {
		myNotification = new CustomNotification(title, {
			body: body,
			icon: icon,
			subtitle: subTitle,
			silent: isSilent,
			replyPlaceholder: replyPlaceholder,
			hasReply: replyPlaceholder !== undefined,
			onClick: onClick,
			onClose: onClose,
			onReply: onReply
		});
	};

	var show = function() {
		if(isNative) {
			// show native notification
			drawNative();
		} else {
			// show custom notification
			drawCustom();
		}

		startedAt = (new Date()).getTime();
	};

	var isRunning = function() {
		return startedAt && !completed;
	};

	var isCompleted = function() {
		return completed;
	};

	return {
		show: show,
		isRunning: isRunning,
		isCompleted: isCompleted
	};
};

/**
 *	check if native notifications is supported or not (require a window for native notifications)
**/
app.isNativeSupported = function() {
	return typeof Notification != "undefined" && Notification != null;
};

/**
 *	Configure the application
**/
app.configure = function(config) {
	app.forceNative = config.forceNative && app.isNativeSupported() || app.forceNative;
	app.forceCustom = config.forceCustom && !app.forceNative || app.forceCustom;
	app.maximumShown = config.maximumShown || app.maximumShown;
	app.poolSize = config.poolSize || app.poolSize;
	app.notificationTimeout = config.notificationTimeout || app.notificationTimeout;
};

/**
 *	All Notification to the pool
**/
app.notify = function(config) {
	if(app.poolSize <= app.pool.length)
		throw "Excedded pool size; skipping notifications";

	// check for force configurations
	config.isNative = config.isNative || app.forceNative || !app.forceCustom;

	app.pool.push(_Notification(config));

	if(!shouldIterate)
		notificationPooler();
};

/**
 *	Close all notifications (only works for custom notification)
**/
app.closeAll = function() {
	for(var _notification of app.pool) {
		if(typeof _notification.close == "function")
			_notification.close();
	}

	app.pool = [];

	for(var _notification of app.visiblePool) {
		if(typeof _notification.close == "function")
			_notification.close();
	}

	app.visiblePool = [];
};

/**
 *	Close all notifications (only works for custom notification)
**/
var notificationPooler = function() {
	// iterate through all the notifications and remove all closed
	for(var i = app.visiblePool.length-1; i >= 0; i--) {
		if(app.visiblePool[i].isCompleted) {
			app.visiblePool.splice(i, 1);
		}
	}

	if(app.visiblePool.length < app.maximumShown && app.pool.length > 0) {
		// show notifications
		while(app.visiblePool.length < app.maximumShown && app.pool.length > 0) {
			var _N = app.pool[0];
			app.pool.splice(0, 1);

			app.visiblePool.push(_N);
			_N.show();
		}
	}

	if(app.visiblePool.length != 0 && app.pool.length != 0) {
		shouldIterate = true;
		requestAnimationFrame(notificationPooler);
	} else {
		shouldIterate = false;
	}
};

module.exports = app;