# electron-notify
Notification library for electron application. It allows showing desktop application in electron main code without a BrowserWindow setup. It uses HTML5 native `Notification` to show notifications.

## Using module
### Import the module
```js
const electronNotify = require('electron-notify');
```

### Simple notification example
```js
electronNotify.notify({
    title: "Hello World",
    body: "This is body"
});
```

## Running the application
### Install the npm dependencies.
```s
npm install
```

### Start application
```s
npm run make
```

### Make a build
```s
npm run build
```
