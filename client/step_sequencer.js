// step_sequencer.js

const Konva = require('konva/cmj').default;

class StepSequencer {
	constructor(session_controller) {
		this.session = session_controller;

		this.stage = new Konva.Stage({
			container: "step-sequencer", 
			width: 900, 
			height: 400
		});

		this.layer_cells = new Konva.Layer();
		this.stage.add(this.layer_cells);
		this.layer_cells.draw();

		this.cells = {};
	}

	add(key) {
		let n_rows = Object.keys(this.cells).length;
		this.cells[key] = [];
		let yRow = 20 + n_rows*20;
		let n_slots = this.session.shared.nSlots();
		for (let i = 0; i < n_slots; i++) {
			let cell = new Konva.Rect({
				x: 20 + i*30, 
				y: yRow, 
				width: 30, 
				height: 20, 
				fill: 'blue', 
				cornerRadius: 5
			});
			cell.on('click', () => {
				let old = this.session.shared.patterns.data[key][i];
				this.session.shared.patterns.submitOp([{p: [key, i], ld: old, li: !old}]);
			});
			this.cells[key].push(cell);
			this.layer_cells.add(cell);
		}
	}
}

module.exports = StepSequencer;
