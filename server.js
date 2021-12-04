// server.js


// Imports

const http = require("http");
const express = require("express");
const WebSocket = require("ws");
const Backend = require("sharedb");
const WebSocketJSONStream = require("@teamwork/websocket-json-stream");


// App

const app = express();
app.use(express.static('static'));


// Server and connections

const server = http.createServer(app);
const webSocketServer = new WebSocket.Server({server: server});
const backend = new Backend({doNotForwardSendPresenceErrorsToClient: true});
const connection = backend.connect();

webSocketServer.on('connection', (socket) => {
	console.log('a user connected');
	const stream = new WebSocketJSONStream(socket);
	backend.listen(stream);
});


// Shared data : initialization

let samples = connection.get('instruments', 'samples');
let samples_data = {
	'kick': "samples/kick_00.wav", 
	'snare': "samples/snare_00.wav", 
	'hihat': "samples/closed_hat_00.wav"
};
samples.create(samples_data);

let panvols = connection.get('instruments', 'panvols');
let panvols_data = {};
for (let key in samples_data) {
	panvols_data[key] = {
		pan: 0, 
		volume: 0
	};
}
panvols.create(panvols_data);

let rythm = connection.get('tracks', 'rythm');
let rythm_data = {
	bpm: 90, 
	loop_size: 4, 
	time_signature: 4
};
rythm.create(rythm_data);

let n_slots = rythm_data.loop_size * rythm_data.time_signature;

let patterns = connection.get('tracks', 'patterns');
let patterns_data = {};
for (let key in samples_data) {
	patterns_data[key] = [];
	for (let i = 0; i < n_slots; i++) {
		patterns_data[key].push(false);
	}
}
patterns.create(patterns_data);


// Launch

server.listen(8080, '0.0.0.0', () => {
	console.log('listening on *:8080');
});	
