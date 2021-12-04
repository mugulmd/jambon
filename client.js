// client.js


// Imports

const ReconnectingWebSocket = require('reconnecting-websocket');
const sharedb = require('sharedb/lib/client');
const Tone = require('tone');
const Konva = require('konva/cmj').default;


// Connection to server

const socket = new ReconnectingWebSocket('ws://' + window.location.host);
const connection = new sharedb.Connection(socket);


// Shared data

let shared = {
	instruments: {
		samples: connection.get('instruments', 'samples'), 
		panvols: connection.get('instruments', 'panvols')
	}, 
	tracks: {
		rythm: connection.get('tracks', 'rythm'), 
		patterns: connection.get('tracks', 'patterns')
	} 
};

function nSlots() {
	return shared.tracks.rythm.data.loop_size * shared.tracks.rythm.data.time_signature;
}


// Local data

let local = {
	instruments: {
		players: {}
	}, 
	tracks: {
		pattern_event_ids: {}
	}
};

function addPlayerLocal(key) {
	let panvol = new Tone.PanVol(0, 0).toDestination();
	let url = shared.instruments.samples.data[key];
	let player = new Tone.Player(url).connect(panvol);
	local.instruments.players[key] = {
		audio: player, 
		ctrl: panvol
	};
}

function addPatternLocal(key) {
	local.tracks.pattern_event_ids[key] = [];
	for (let i = 0; i < nSlots(); i++) {
		local.tracks.pattern_event_ids[key].push(0);
	}
}


// UI

let ui = {
	orchestra: {
		stage: undefined, 
		layers: {}, 
		elts: {}
	}, 
	sequencer: {
		stage: undefined, 
		layers: {}, 
		cells: {}, 
		nRows: 0
	}, 
	piano: undefined, 
	participants: undefined, 
	controls: undefined
};

ui.orchestra.stage = new Konva.Stage({
	container: "orchestra-map", 
	width: 640, 
	height: 480
});

ui.orchestra.layers['main'] = new Konva.Layer();
ui.orchestra.stage.add(ui.orchestra.layers['main']);
ui.orchestra.layers['main'].draw();

function addOrchestraElt(key, pos) {
	let circle = new Konva.Circle({
		x: pos.x, 
		y: pos.y, 
		radius: 10, 
		fill: 'red', 
		draggable: true
	});
	circle.on('dragend', () => {
		let old = shared.instruments.panvols.data[key];
		let panvol = {
			pan: 2 * (circle.x() / ui.orchestra.stage.width()) - 1, 
			volume: old.volume
		};
		shared.instruments.panvols.submitOp([{p: [key], od: old, oi: panvol}]);
	});
	ui.orchestra.elts[key] = circle;
	ui.orchestra.layers['main'].add(circle);
}

ui.sequencer.stage = new Konva.Stage({
	container: "step-sequencer", 
	width: 800, 
	height: 400
});

ui.sequencer.layers['main'] = new Konva.Layer();
ui.sequencer.stage.add(ui.sequencer.layers['main']);
ui.sequencer.layers['main'].draw();

function addSequencerRow(key) {
	ui.sequencer.cells[key] = [];
	let yRow = 10 + ui.sequencer.nRows*10;
	for (let i = 0; i < nSlots(); i++) {
		let cell = new Konva.Rect({
			x: 10 + i*15, 
			y: yRow, 
			width: 15, 
			height: 10, 
			fill: 'blue', 
			cornerRadius: 3
		});
		cell.on('click', () => {
			let old = shared.tracks.patterns.data[key][i];
			shared.tracks.patterns.submitOp([{p: [key, i], ld: old, li: !old}]);
		});
		ui.sequencer.cells[key].push(cell);
		ui.sequencer.layers['main'].add(cell);
	}
	ui.sequencer.nRows++;
}


// Flush data from shared to local

function flushPanvol(key) {
	local.instruments.players[key].ctrl.pan.value = shared.instruments.panvols.data[key].pan;
	local.instruments.players[key].ctrl.volume.value = shared.instruments.panvols.data[key].volume;
	ui.orchestra.elts[key].x(ui.orchestra.stage.width() * (shared.instruments.panvols.data[key].pan + 1) / 2);
}

function flushPatternStep(key, idx) {
	let checked = shared.tracks.patterns.data[key][idx];
	let cell = ui.sequencer.cells[key][idx];
	if(checked) {
		local.tracks.pattern_event_ids[key][idx] = Tone.Transport.scheduleRepeat(
			(time) => {
				local.instruments.players[key].audio.start(time);
			}, 
			{"4n": shared.tracks.rythm.data.loop_size}, 
			{"16n": idx});
		cell.fill('green');
	} else {
		Tone.Transport.clear(local.tracks.pattern_event_ids[key][idx]);
		cell.fill('blue');
	}
}

function flushPattern(key) {
	for (let i = 0; i < nSlots(); i++) {
		flushPatternStep(key, i);
	}
}


// Initialization

shared.tracks.rythm.subscribe(() => {
	console.log("subscription to rythm data : ok");

	shared.instruments.samples.subscribe(() => {
		console.log("subscription to samples data : ok");

		let counter = 0;
		for (let key in shared.instruments.samples.data) {
			addPlayerLocal(key);
			addPatternLocal(key);
			addOrchestraElt(key, {x: ui.orchestra.stage.width()/2, y: ui.orchestra.stage.height()-50*(counter+1)});
			addSequencerRow(key);
			counter++;
		}
		console.log("local data initialized");

		shared.instruments.panvols.subscribe(() => {
			for (let key in shared.instruments.samples.data) {
				flushPanvol(key);
			}
			console.log("shared panvols flushed");
		});

		shared.tracks.patterns.subscribe(() => {
			for (let key in shared.instruments.samples.data) {
				flushPattern(key);
			}
			console.log("shared patterns flushed");
		});
	});
});


// Callbacks

shared.instruments.panvols.on('op', (op, source) => {
	let key = op[0].p[0];
	flushPanvol(key);
});

shared.tracks.patterns.on('op', (op, source) => {
	let key = op[0].p[0];
	let idx = op[0].p[1];
	flushPatternStep(key, idx);
});


// Play-pause

document.getElementById("buttonPlay").onclick = function() {
	console.log("play");
	Tone.Transport.bpm.value = shared.tracks.rythm.data.bpm;
	Tone.Transport.toggle();
};


// Initialization

window.onload = async function() {
	await Tone.start();
	console.log("audio is ready");
}
