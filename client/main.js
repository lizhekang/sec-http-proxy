/**
 * Created by Sam on 2015/10/30.
 */
var app = require('app');  // Module to control application life.
var BrowserWindow = require('browser-window');  // Module to create native browser window.
var ipc = require('ipc');   // Module to communicate with.
var http_proxy = require('./http_proxy');  // Main method module.

// Report crashes to our server.
require('crash-reporter').start();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow = null;

// Quit when all windows are closed.
app.on('window-all-closed', function() {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform != 'darwin') {
        app.quit();
    }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        title: 'Proxy',
        width: 200,
        height: 250,
        'use-content-size': true,
        resizable: true
    });

    // and load the index.html of the app.
    mainWindow.loadUrl('file://' + __dirname + '/ui/index.html');

    // Visibility for menu bar
    mainWindow.setMenuBarVisibility(false);
    //mainWindow.setResizable(false);

    // Open the DevTools.
    //mainWindow.openDevTools();

    // Emitted when the window is closed.
    mainWindow.on('closed', function() {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });

    // Do some init
    init();
});

// init function, do some prepare work.
function init() {
    var jsonfile = require('jsonfile');   // Module to read config file.
    // read config file
    var file = './config.json';
    var config = jsonfile.readFileSync(file);

    // Init http_proxy
    http_proxy.init(config);

    initEvent();
}

// init event handler
function initEvent() {
    ipc.on('query_server_status', function(event, arg) {
        event.returnValue = http_proxy.getServerStatus();
    });

    ipc.on('start_server', function(event, arg) {
        http_proxy.getKey();
        http_proxy.start_local_server();
    });

    ipc.on('stop_server', function(event, arg) {
        http_proxy.stop_local_server();
    });
}