// shared_data.js

class SharedData {
	constructor(connection) {
		this.rythm = connection.get('tracks', 'rythm');
		this.samples = connection.get('instruments', 'samples');
		this.synths = connection.get('instruments', 'synths');
		this.geom = connection.get('instruments', 'geom');
		this.patterns = connection.get('tracks', 'patterns');
		this.scores = connection.get('tracks', 'scores');
	}

	nSlots() {
		return this.rythm.data.loop_size * this.rythm.data.time_signature;
	}
}

module.exports = SharedData;
