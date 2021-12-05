// local_data.js

const Tone = require('tone');
const Notes = require('../utils/notes.js');

class LocalData {
	constructor(session_controller) {
		this.session = session_controller;
		this.players = {};
		this.synths = {};
		this.pattern_event_ids = {};
		this.score_event_ids = {};
	}

	addPlayer(key) {
		let panvol = new Tone.PanVol(0, 0).toDestination();
		let url = this.session.shared.samples.data[key];
		let player = new Tone.Player(url).connect(panvol);
		this.players[key] = {
			audio: player, 
			ctrl: panvol
		};
	}

	addPattern(key) {
		this.pattern_event_ids[key] = [];
		let n_slots = this.session.shared.nSlots();
		for (let i = 0; i < n_slots; i++) {
			this.pattern_event_ids[key].push(0);
		}
	}

	addSynth(key) {
		let panvol = new Tone.PanVol(0, 0).toDestination();
		let poly = new Tone.PolySynth(Tone.Synth).connect(panvol);
		this.synths[key] = {
			audio: poly, 
			ctrl: panvol
		};
	}

	addScore(key) {
		this.score_event_ids[key] = {};
		let n_slots = this.session.shared.nSlots();
		for (let i = 0; i < 12; i++) {
			let freq = Notes.freq(i);
			this.score_event_ids[key][freq] = [];
			for (let j = 0; j < n_slots; j++) {
				this.score_event_ids[key][freq].push(0);
			}
		}
	}
}

module.exports = LocalData;
