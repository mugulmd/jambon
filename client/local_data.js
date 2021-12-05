// local_data.js

const Tone = require('tone');

class LocalData {
	constructor(session_controller) {
		this.session = session_controller;
		this.players = {};
		this.pattern_event_ids = {};
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
}

module.exports = LocalData;
