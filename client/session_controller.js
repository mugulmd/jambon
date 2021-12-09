// session_controller.js

const Tone = require('tone');
const SharedData = require('./shared_data.js');
const LocalData = require('./local_data.js');
const SessionUI = require('./session_ui.js');
const SessionLogin = require('./session_login.js');
const Notes = require('../utils/notes.js');

class SessionController {
	constructor(connection, is_conductor) {
		this.shared = new SharedData(connection);
		this.login = new SessionLogin(this, is_conductor);
		this.local = new LocalData(this);
		this.ui = new SessionUI(this);
	}

	async join() {
		await Tone.start();
		console.log("audio is ready");
		this.subscribeParticipants();
		this.setup();
	}

	subscribeParticipants() {
		this.shared.participants.subscribe(() => {
			console.log("subscription to participants data : ok");
			for (let key in this.shared.participants.data) {
				this.ui.participants_pannel.add(key);
			}
			this.login.show();

			this.subscribeRythm();
		});
	}

	subscribeRythm() {
		this.shared.rythm.subscribe(() => {
			console.log("subscription to rythm data : ok");
			Tone.Transport.bpm.value = this.shared.rythm.data.bpm;

			this.subscribeSamples();
		});
	}

	subscribeSamples() {
		this.shared.samples.subscribe(() => {
			console.log("subscription to samples data : ok");

			this.subscribeSynths();
		});
	}

	subscribeSynths() {
		this.shared.synths.subscribe(() => {
			console.log("subscription to synths data : ok");
			
			this.local.initPlayers();
			this.local.initPatterns();
			this.local.initSynths();
			this.local.initScores();
			console.log("local data initialized");

			this.ui.orchestra_map.init();
			this.ui.step_sequencer.init();
			this.ui.piano_roll.init();
			console.log("UI initialized");

			this.subscribePatterns();
			this.subscribeScores();
			this.subscribeGeom();
		});
	}

	subscribePatterns() {
		this.shared.patterns.subscribe(() => {
			for (let key in this.shared.samples.data) {
				this.flushPattern(key);
			}
			console.log("shared patterns flushed");
		});
	}

	subscribeScores() {
		this.shared.scores.subscribe(() => {
			for (let key in this.shared.synths.data) {
				this.flushScore(key);
			}
			console.log("shared scores flushed");
		});
	}

	subscribeGeom() {
		this.shared.geom.subscribe(() => {
			for (let key in this.shared.samples.data) {
				this.flushGeom(key);
			}
			for (let key in this.shared.synths.data) {
				this.flushGeom(key);
			}
			console.log("shared geom flushed");
		});
	}

	setup() {
		this.shared.participants.on('op', (op, source) => {
			let key = op[0].p[0];
			this.ui.participants_pannel.add(key);
		});

		this.shared.geom.on('op', (op, source) => {
			let key = op[0].p[0];
			this.flushGeom(key);
		});

		this.shared.rythm.on('op', (op, source) => {
			if (op[0].p.length == 0) {
				// conductor has defined bpm, time signature, loop size and resolution
				let n_slots = this.shared.nSlots();
				// re-initialize patterns
				let old_patterns = this.shared.patterns.data;
				let patterns_data = {};
				for (let key in this.shared.samples.data) {
					patterns_data[key] = [];
					for (let i = 0; i < n_slots; i++) {
						patterns_data[key].push(false);
					}
				}
				this.shared.patterns.submitOp([{p: [], od: old_patterns, oi: patterns_data}]);
				// re-initialize scores
				let old_scores = this.shared.scores.data;
				let scores_data = {};
				for (let key in this.shared.synths.data) {
					scores_data[key] = {};
					for (let i = 0; i < 12; i++) {
						let freq = Notes.freq(i);
						scores_data[key][freq] = [];
						for (let j = 0; j < n_slots; j++) {
							scores_data[key][freq].push(false);
						}
					}
				}
				this.shared.scores.submitOp([{p: [], od: old_scores, oi: scores_data}]);
			} else {
				// a participant has changed the bpm
				Tone.Transport.bpm.value = this.shared.rythm.data.bpm;
			}
		});

		this.shared.patterns.on('op', (op, source) => {
			if (op[0].p.length == 0) {
				// all patterns have been re-initialized
				this.local.initPatterns();
				this.ui.step_sequencer.init();
			} else {
				// one pattern step has been modified
				let key = op[0].p[0];
				let idx = op[0].p[1];
				this.flushPatternStep(key, idx);
			}
		});

		this.shared.scores.on('op', (op, source) => {
			if (op[0].p.length == 0) {
				// all scores have been re-initialized
				this.local.initScores();
				this.ui.piano_roll.init();
			} else {
				// one score note has been modified
				let key = op[0].p[0];
				let freq = op[0].p[1];
				let idx = op[0].p[2];
				this.flushScoreNote(key, freq, idx);
			}
		});
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
}

module.exports = SessionController;
