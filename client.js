// client.js


// Imports

const ReconnectingWebSocket = require('reconnecting-websocket');
const sharedb = require('sharedb/lib/client');
const Tone = require('tone');
const Konva = require('konva/cmj').default;


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

let shared_panvols = connection.get('instruments', 'panvols');

let players = {};
for (let key in samples) {
	let panvol = new Tone.PanVol(0, 0).toDestination();
	let player = new Tone.Player(samples[key]).connect(panvol);
	players[key] = {
		audio: player, 
		ctrl: panvol
	};
}

let updateLocalPanvol = function(key) {
	players[key].ctrl.pan.value = shared_panvols.data[key].pan;
	players[key].ctrl.volume.value = shared_panvols.data[key].volume;
};

shared_panvols.subscribe(() => {
	if(!shared_panvols.type) {
		let panvols = {};
		for (let key in samples) {
			panvols[key] = {
				pan: 0, 
				volume: 0
			};
		}
		shared_panvols.create(panvols);
	}
	for (let key in samples) {
		updateLocalPanvol(key);
	}
});
shared_panvols.on('op', (op, source) => {
	let key = op[0].p[0];
	updateLocalPanvol(key);
});


// Orchestra map

let stage = new Konva.Stage({
	container: "orchestra-map", 
	width: 900, 
	height: 600
});

let layer = new Konva.Layer();

let counter = 0;
for (let key in samples) {
	let circle = new Konva.Circle({
		x: stage.width() / 2, 
		y: stage.height() - 100 * (counter + 1), 
		radius: 30, 
		fill: 'red', 
		draggable: true
	});
	circle.on('dragend', () => {
		let old = shared_panvols.data[key];
		let panvol = {
			pan: 2 * (circle.x() / stage.width()) - 1, 
			volume: old.volume
		};
		shared_panvols.submitOp([{p: [key], od: old, oi: panvol}]);
	});
	layer.add(circle);
	counter++;
}

stage.add(layer);

layer.draw();


// Sequencer : local event ids + shared patterns + UI

let n = rythm.loop_size * rythm.time_signature;

let play_event_ids = {};
for (let key in samples) {
	play_event_ids[key] = [];
	for (let i = 0; i < n; i++) {
		play_event_ids[key].push(0);
	}
}

let shared_patterns = connection.get('tracks', 'patterns');

for (let key in samples) {
	let row = document.createElement("div");
	row.classList.add("row");
	row.id = key;
	document.getElementById("step-sequencer").appendChild(row);
	for (let i = 0; i < n; i++) {
		let cell = document.createElement("input");
		cell.type = "checkbox";
		cell.onclick = function() {
			let old = shared_patterns.data[key][i];
			shared_patterns.submitOp([{p: [key, i], ld: old, li: cell.checked}]);
		};
		cell.classList.add("cell");
		row.appendChild(cell);
	}
}

let updateLocalPattern = function(key, idx) {
	let cell = document.getElementById(key).getElementsByClassName("cell")[idx];
	cell.checked = shared_patterns.data[key][idx];
	if(cell.checked) {
		play_event_ids[key][idx] = Tone.Transport.scheduleRepeat(
			(time) => {
				players[key].audio.start(time);
			}, 
			{"4n": rythm.loop_size}, 
			{"16n": idx});
	} else {
		Tone.Transport.clear(play_event_ids[key][idx]);
	}
};

shared_patterns.subscribe(() => {
	if (!shared_patterns.type) {
		let patterns = {};
		for (let key in samples) {
			patterns[key] = [];
			for (let i = 0; i < n; i++) {
				patterns[key].push(false);
			}
		}
		shared_patterns.create(patterns);
	}
	for (let key in samples) {
		for (let i = 0; i < n; i++) {
			updateLocalPattern(key, i);
		}
	}
});
shared_patterns.on('op', (op, source) => {
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
