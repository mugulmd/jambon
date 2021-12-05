// index.js
// client side entry point

const ReconnectingWebSocket = require('reconnecting-websocket');
const sharedb = require('sharedb/lib/client');
const SessionController = require('./session_controller.js');

let socket = new ReconnectingWebSocket('ws://' + window.location.host);
let connection = new sharedb.Connection(socket);
let session = new SessionController(connection);
session.join();
