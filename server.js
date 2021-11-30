// server.js


const http = require("http");
const express = require("express");
const WebSocket = require("ws");
const Backend = require("sharedb");
const WebSocketJSONStream = require("@teamwork/websocket-json-stream");

const app = express();
app.use(express.static('static'));

const server = http.createServer(app);
const webSocketServer = new WebSocket.Server({server: server});

const backend = new Backend({doNotForwardSendPresenceErrorsToClient: true});

webSocketServer.on('connection', (socket) => {
	console.log('a user connected');
	const stream = new WebSocketJSONStream(socket);
	backend.listen(stream);
});

server.listen(8080, '0.0.0.0', () => {
	console.log('listening on *:8080');
});	
