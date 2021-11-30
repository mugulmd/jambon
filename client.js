// client.js


// Imports

const ReconnectingWebSocket = require('reconnecting-websocket');
const sharedb = require('sharedb/lib/client');
const Tone = require('tone');


// Connection to server

const socket = new ReconnectingWebSocket('ws://' + window.location.host);
const connection = new sharedb.Connection(socket);


// Rythm

let rythm = {
	bpm: 90, 
	loop_size: 4, 
	time_signature: 4
};


// Intruments (players only here)

let samples = {
	'kick': "samples/kick_00.wav", 
	'snare': "samples/snare_00.wav", 
	'hihat': "samples/closed_hat_00.wav"
};

let players = {};
for (let key in samples) {
	players[key] = new Tone.Player(samples[key]).toDestination();
}


// Sequencer : local event ids + shared patterns + UI

let n = rythm.loop_size * rythm.time_signature;

let play_event_ids = {};
for (let key in samples) {
	play_event_ids[key] = [];
	for (let i = 0; i < n; i++) {
		play_event_ids[key].push(0);
	}
}

let doc = connection.get('tracks', 'patterns');

for (let key in samples) {
	let row = document.createElement("div");
	row.classList.add("row");
	row.id = key;
	document.getElementById("sequencer").appendChild(row);
	for (let i = 0; i < n; i++) {
		let cell = document.createElement("input");
		cell.type = "checkbox";
		cell.onclick = function() {
			let old = doc.data[key][i];
			doc.submitOp([{p: [key, i], ld: old, li: cell.checked}]);
		};
		cell.classList.add("cell");
		row.appendChild(cell);
	}
}

let updateLocalPattern = function(key, idx) {
	let cell = document.getElementById(key).getElementsByClassName("cell")[idx];
	cell.checked = doc.data[key][idx];
	if(cell.checked) {
		play_event_ids[key][idx] = Tone.Transport.scheduleRepeat(
			(time) => {
				players[key].start(time);
			}, 
			{"4n": rythm.loop_size}, 
			{"16n": idx});
	} else {
		Tone.Transport.clear(play_event_ids[key][idx]);
	}
};

doc.subscribe(() => {
	if (!doc.type) {
		let patterns = {};
		for (let key in samples) {
			patterns[key] = [];
			for (let i = 0; i < n; i++) {
				patterns[key].push(false);
			}
		}
		doc.create(patterns);
	}
	for (let key in samples) {
		for (let i = 0; i < n; i++) {
			updateLocalPattern(key, i);
		}
	}
});
doc.on('op', (op, source) => {
	let key = op[0].p[0];
	let idx = op[0].p[1];
	updateLocalPattern(key, idx);
});


// Play-pause

document.getElementById("buttonPlay").onclick = function() {
	console.log("play");
	Tone.Transport.bpm.value = rythm.bpm;
	Tone.Transport.toggle();
};


// Initialization

window.onload = async function() {
	await Tone.start();
	console.log("audio is ready");
}
