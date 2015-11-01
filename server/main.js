/**
 * Created by Sam on 2015/10/30.
 */
var crypto = require('crypto'),
    events  = require('events'),
    emitter = new events.EventEmitter;

var key_pool = [];
var key;

// Read config file
var config;
function read_config() {
    var jsonfile = require('jsonfile');
    var util = require('util');

    var file = './config.json';
    jsonfile.readFile(file, function(err, obj) {
        if(err === null) {
            config = obj;
            emitter.emit('read_config_finished');
        }else {
            console.log(" There are something wrong in your config.json.")
            console.log(" Please check your config file.");
            process.exit();
        }
    });
}

// Http server, exchange key
function start_http_server() {
    var http = require('http');
    var url = require('url');
    var qs = require('querystring');
    var shasum = crypto.createHash('sha1');
    var randomstring = require('randomstring');

    var server_host = config['server_host']
    var http_proxy = config['http_proxy'] | 8080;
    console.log(' Begin to start a http server at http://%s:%d', server_host, http_proxy);

    http.createServer(function(req, res) {
        res.writeHead(200, {"Content-Type": "text/plain"});
        var query = url.parse(req.url).query;
        var ip = req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;
        var data = JSON.stringify(qs.parse(query));

        // Do Hash
        shasum = crypto.createHash('sha1');
        shasum.update(ip);
        var sha1_ip = shasum.digest('hex');

        //TODO: using key pool
        // Check whether ip had been saved, or not save.
        var random = randomstring.generate();
        key_pool[sha1_ip] = key_pool[sha1_ip] ? key_pool[sha1_ip] : random;
        key = key_pool[sha1_ip];

        res.end(key_pool[sha1_ip]);
    }).listen(http_proxy);

    process.on("uncaughtException", function(e) {
        console.log(e);
    });
}

// Proxy modules
function start_proxy() {
    var net = require("net");
    var proxyPort = config['proxy_port'] ? config['proxy_port'] : 8888;
    var serverHost = config['server_host'] ? config['server_host'] : '127.0.0.1';
    var serverPort = config['server_port'] ? config['server_port'] : 7777;

    console.log(' Begin to start a proxy server at http://%s:%d', serverHost, proxyPort);

    net.createServer(function (proxySocket) {
        var connected = false;
        var buffers = new Array();
        var serviceSocket = new net.Socket();

        serviceSocket.connect(parseInt(serverPort), serverHost, function() {

            connected = true;
            if (buffers.length > 0) {
                for (i = 0; i < buffers.length; i++) {
                    // aes-256-ctr
                    var d = decipher('rc4', key, buffers[i]);
                    //serviceSocket.write(buffers[i]);
                    serviceSocket.write(d);
                }
            }
        });
        proxySocket.on("error", function (e) {
            serviceSocket.end();
        });
        serviceSocket.on("error", function (e) {
            console.log("Could not connect to service at host "
                + serverHost + ', port ' + serverPort);
            proxySocket.end();
        });
        proxySocket.on("data", function (data) {
            if (connected) {
                serviceSocket.write(data);
            } else {
                buffers[buffers.length] = data;
            }
        });
        serviceSocket.on("data", function(data) {
            proxySocket.write(data);
        });
        proxySocket.on("close", function(had_error) {
            serviceSocket.end();
        });
        serviceSocket.on("close", function(had_error) {
            proxySocket.end();
        });
    }).listen(proxyPort);

}

function cipher(algorithm, key, buf ){
    var cip = crypto.createCipher(algorithm, key);
    var encrypted = cip.update(buf);
    return encrypted;
}

function decipher(algorithm, key, encrypted){
    var decipher = crypto.createDecipher(algorithm, key);
    var decrypted = decipher.update(encrypted);
    return decrypted;
}

(function init() {
    // Init event handler
    initEvent();

    // Going to read config file
    read_config();
}());

function initEvent() {
    emitter.on('read_config_finished', function() {
        start_http_server();
        start_proxy();
    });
}