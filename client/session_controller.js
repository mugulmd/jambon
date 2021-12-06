// controller.js

const Tone = require('tone');
const SharedData = require('./shared_data.js');
const LocalData = require('./local_data.js');
const SessionUI = require('./session_ui.js');
const Notes = require('../utils/notes.js');

class SessionController {
	constructor(connection) {
		this.shared = new SharedData(connection);
		this.local = new LocalData(this);
		this.ui = new SessionUI(this);
	}

	flushGeom(key) {
		let geom = this.shared.geom.data[key];
		this.ui.orchestra_map.update(key, geom);
		if (key in this.shared.samples.data) {
			this.local.players[key].ctrl.pan.value = geom.x;
			this.local.players[key].ctrl.volume.value = Math.log(geom.size) * 10;
			this.local.players[key].ctrl.mute = !geom.active;
		} else {
			this.local.synths[key].ctrl.pan.value = geom.x;
			this.local.synths[key].ctrl.volume.value = Math.log(geom.size) * 10;
			this.local.synths[key].ctrl.mute = !geom.active;
		}
	}

	flushPatternStep(key, idx) {
		let checked = this.shared.patterns.data[key][idx];
		if(checked) {
			this.local.pattern_event_ids[key][idx] = Tone.Transport.scheduleRepeat(
				(time) => {
					this.local.players[key].audio.start(time);
				}, 
				{"4n": this.shared.rythm.data.loop_size}, 
				{"16n": idx});
		} else {
			Tone.Transport.clear(this.local.pattern_event_ids[key][idx]);
		}
		this.ui.step_sequencer.update(key, idx, checked);
	}

	flushPattern(key) {
		let n_slots = this.shared.nSlots();
		for (let i = 0; i < n_slots; i++) {
			this.flushPatternStep(key, i);
		}
	}

	flushScoreNote(key, freq, idx) {
		let checked = this.shared.scores.data[key][freq][idx];
		if(checked) {
			this.local.score_event_ids[key][freq][idx] = Tone.Transport.scheduleRepeat(
				(time) => {
					this.local.synths[key].audio.triggerAttackRelease(freq, "16n");
				}, 
				{"4n": this.shared.rythm.data.loop_size}, 
				{"16n": idx});
		} else {
			Tone.Transport.clear(this.local.score_event_ids[key][freq][idx]);
		}
		this.ui.piano_roll.update(freq, idx, checked);
	}

	flushScore(key) {
		let n_slots = this.shared.nSlots();
		for (let i = 0; i < 12; i++) {
			let freq = Notes.freq(i);
			for (let j = 0; j < n_slots; j++) {
				this.flushScoreNote(key, freq, j);
			}
		}
	}

	async join() {
		await Tone.start();
		console.log("audio is ready");

		this.shared.rythm.subscribe(() => {
			console.log("subscription to rythm data : ok");

			Tone.Transport.bpm.value = this.shared.rythm.data.bpm;

			this.shared.samples.subscribe(() => {
				console.log("subscription to samples data : ok");

				this.shared.synths.subscribe(() => {
					console.log("subscription to synths data : ok");

					for (let key in this.shared.samples.data) {
						this.local.addPlayer(key);
						this.local.addPattern(key);
						this.ui.orchestra_map.add(key);
						this.ui.step_sequencer.add(key);
					}
					for (let key in this.shared.synths.data) {
						this.local.addSynth(key);
						this.local.addScore(key);
						this.ui.orchestra_map.add(key);
					}
					this.ui.piano_roll.init();
					console.log("local data initialized");

					this.shared.patterns.subscribe(() => {
						for (let key in this.shared.samples.data) {
							this.flushPattern(key);
						}
						console.log("shared patterns flushed");
					});

					this.shared.scores.subscribe(() => {
						for (let key in this.shared.synths.data) {
							this.flushScore(key);
						}
						console.log("shared scores flushed");

						this.ui.piano_roll.select('synth');
					});

					this.shared.geom.subscribe(() => {
						for (let key in this.shared.samples.data) {
							this.flushGeom(key);
						}
						for (let key in this.shared.synths.data) {
							this.flushGeom(key);
						}
						console.log("shared geom flushed");
					});
				});
			});
		});

		this.setup();
	}

	setup() {
		this.shared.geom.on('op', (op, source) => {
			let key = op[0].p[0];
			this.flushGeom(key);
		});

		this.shared.patterns.on('op', (op, source) => {
			let key = op[0].p[0];
			let idx = op[0].p[1];
			this.flushPatternStep(key, idx);
		});

		this.shared.scores.on('op', (op, source) => {
			let key = op[0].p[0];
			let freq = op[0].p[1];
			let idx = op[0].p[2];
			this.flushScoreNote(key, freq, idx);
		});
	}
}

module.exports = SessionController;
