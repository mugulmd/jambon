// controller.js

const Tone = require('tone');
const SharedData = require('./shared_data.js');
const LocalData = require('./local_data.js');
const SessionUI = require('./session_ui.js');

class SessionController {
	constructor(connection) {
		this.shared = new SharedData(connection);
		this.local = new LocalData(this);
		this.ui = new SessionUI(this);
	}

	flushGeom(key) {
		let geom = this.shared.geom.data[key];
		this.ui.orchestra_map.update(key, geom);
		this.local.players[key].ctrl.pan.value = geom.x;
	}

	flushPatternStep(key, idx) {
		let checked = this.shared.patterns.data[key][idx];
		let cell = this.ui.step_sequencer.cells[key][idx];
		if(checked) {
			this.local.pattern_event_ids[key][idx] = Tone.Transport.scheduleRepeat(
				(time) => {
					this.local.players[key].audio.start(time);
				}, 
				{"4n": this.shared.rythm.data.loop_size}, 
				{"16n": idx});
			cell.fill('green');
		} else {
			Tone.Transport.clear(this.local.pattern_event_ids[key][idx]);
			cell.fill('blue');
		}
	}

	flushPattern(key) {
		let n_slots = this.shared.nSlots();
		for (let i = 0; i < n_slots; i++) {
			this.flushPatternStep(key, i);
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

				for (let key in this.shared.samples.data) {
					this.local.addPlayer(key);
					this.local.addPattern(key);
					this.ui.orchestra_map.add(key);
					this.ui.step_sequencer.add(key);
				}
				console.log("local data initialized");

				this.shared.geom.subscribe(() => {
					for (let key in this.shared.samples.data) {
						this.flushGeom(key);
					}
					console.log("shared geom flushed");
				});

				this.shared.patterns.subscribe(() => {
					for (let key in this.shared.samples.data) {
						this.flushPattern(key);
					}
					console.log("shared patterns flushed");
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
	}
}

module.exports = SessionController;
