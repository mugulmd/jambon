// piano_roll.js

const Konva = require('konva/cmj').default;
const Notes = require('../utils/notes.js');

class PianoRoll {
	constructor(session_controller) {
		this.session = session_controller;

		this.stage = new Konva.Stage({
			container: "piano-roll", 
			width: 900, 
			height: 400
		});

		this.layer_cells = new Konva.Layer();
		this.stage.add(this.layer_cells);
		this.layer_cells.draw();

		this.cells = {};
	}

	init() {
		for (let i = 0; i < 12; i++) {
			let freq = Notes.freq(i);
			this.cells[freq] = [];
			for (let j = 0; j < this.session.shared.nSlots(); j++) {
				let cell = new Konva.Rect({
					x: 20 + j*30, 
					y: 20 + i*20, 
					width: 30, 
					height: 20, 
					fill: 'blue', 
					cornerRadius: 5
				});
				cell.on('click', () => {
					let old = this.session.shared.scores.data['synth'][freq][j];
					this.session.shared.scores.submitOp([{p: ['synth', freq, j], ld: old, li: !old}]);
				});
				this.cells[freq].push(cell);
				this.layer_cells.add(cell);
			}
		}
	}
}

module.exports = PianoRoll;
