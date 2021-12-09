// index.js
// server side entry point


// Imports

const http = require("http");
const express = require("express");
const WebSocket = require("ws");
const Backend = require("sharedb");
const WebSocketJSONStream = require("@teamwork/websocket-json-stream");
const Notes = require('./utils/notes.js');


// App

const app = express();
app.use(express.static('static'));


// Server and connections

const server = http.createServer(app);
const webSocketServer = new WebSocket.Server({server: server});
const backend = new Backend({doNotForwardSendPresenceErrorsToClient: true});
const connection = backend.connect();

let conductor_chosen = false;

webSocketServer.on('connection', (socket) => {
	console.log('a user connected');
	const stream = new WebSocketJSONStream(socket);
	backend.listen(stream);
	if (conductor_chosen) {
		socket.send("not conductor");
	} else {
		conductor_chosen = true;
		socket.send("conductor");
	}
});


// Shared data : document creation and initialization


let participants = connection.get('general', 'participants');
participants.create({});

// instruments

// samples
let samples = connection.get('instruments', 'samples');
let samples_data = {
	'kick': "samples/kick_00.wav", 
	'snare': "samples/snare_00.wav", 
	'hihat': "samples/closed_hat_00.wav"
};
samples.create(samples_data);

// synths
let synths = connection.get('instruments', 'synths');
let synths_data = {
	'synth': {}, 
	'FM synth': {}, 
	'AM synth': {}
};
synths.create(synths_data);

let instruments = Object.keys(samples_data).concat(Object.keys(synths_data));

// geom
let geom = connection.get('instruments', 'geom');
let geom_data = {};
instruments.forEach((key, idx) => {
	geom_data[key] = {
		x: 0, 
		y: 1 - 2 * ((idx+1) / (instruments.length+2)), 
		size: 1, 
		active: true
	};
});
geom.create(geom_data);


// tracks

// rythm
let rythm = connection.get('tracks', 'rythm');
let rythm_data = {
	bpm: 90, 
	time_signature_top: 4, 
	time_signature_bottom: 4, 
	loop_size: 4, 
	resolution: 2
};
rythm.create(rythm_data);

let n_slots = rythm_data.loop_size * rythm_data.time_signature;

// patterns
let patterns = connection.get('tracks', 'patterns');
let patterns_data = {};
for (let key in samples_data) {
	patterns_data[key] = [];
	for (let i = 0; i < n_slots; i++) {
		patterns_data[key].push(false);
	}
}
patterns.create(patterns_data);

// scores
let scores = connection.get('tracks', 'scores');
let scores_data = {};
for (let key in synths_data) {
	scores_data[key] = {};
	for (let i = 0; i < 12; i++) {
		let freq = Notes.freq(i);
		scores_data[key][freq] = [];
		for (let j = 0; j < n_slots; j++) {
			scores_data[key][freq].push(false);
		}
	}
}
scores.create(scores_data);


// Launch

server.listen(8080, '0.0.0.0', () => {
	console.log('listening on *:8080');
});	
