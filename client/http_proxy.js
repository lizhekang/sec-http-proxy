/**
 * Created by Sam on 2015/10/30.
 */

var util = require('util'),
    net = require("net"),
    crypto = require('crypto'),
    request = require('request');

// Config
var config;

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

var server;

function stop_local_server() {
    if(server)
        server.close();
}

function start_local_server() {
    var proxyPort = config['proxy_port'] ? config['proxy_port'] : 8888;
    var serviceHost = config['service_host'] ? config['proxy_port'] : "127.0.0.1";
    var servicePort = config['service_port'] ? config['proxy_port'] : 9999;

    server = net.createServer(function (proxySocket) {
        var connected = false;
        var buffers = new Array();
        var serviceSocket = new net.Socket();
        serviceSocket.connect(parseInt(servicePort), serviceHost, function() {
            connected = true;
            if (buffers.length > 0) {
                for (i = 0; i < buffers.length; i++) {
                    var d = cipher('aes-256-ctr', 'test123', buffers[i]);   //buffers[i].toString();
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
                + serviceHost + ', port ' + servicePort);
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

function getServerStatus() {
    var serverStatus = server ? (server._handle ? true : false) : false;
    return {serverStatus: serverStatus, proxyPort: config.proxy_port};
}

function getKey() {
    var serviceHost = config['service_host'] ? config['proxy_port'] : "127.0.0.1";
    var httpPort = config['http_port'] ? config['http_port'] : 8080;
    var url = 'http://' + serviceHost + ':' + httpPort;

    request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(body);
        }else {
            console.log(error);
        }
    })
}

function init(cfg) {
    config = cfg;
}

module.exports = {
    getServerStatus: getServerStatus,
    stop_local_server: stop_local_server,
    start_local_server: start_local_server,
    getKey: getKey,
    init: init
};