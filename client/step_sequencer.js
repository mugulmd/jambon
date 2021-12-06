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

		this.layer_bckg = new Konva.Layer();
		this.stage.add(this.layer_bckg);
		this.layer_bckg.draw();

		this.layer_ids = new Konva.Layer();
		this.stage.add(this.layer_ids);
		this.layer_ids.draw();

		this.layer_cells = new Konva.Layer();
		this.stage.add(this.layer_cells);
		this.layer_cells.draw();

		this.cells = {};
		this.id_col_size = 100;
		this.cell_width = 30;
		this.cell_height = 20;
		this.default_color = 'gray';
		this.active_color = 'orange';

		this.drawBckg();
	}

	drawBckg() {
		let rect = new Konva.Rect({
			x: 0, 
			y: 0, 
			width: this.stage.width(),
			height: this.stage.height(), 
			fill: 'beige'
		});
		this.layer_bckg.add(rect);
	}

	add(key) {
		let n_rows = Object.keys(this.cells).length;
		this.cells[key] = [];
		let yRow = (n_rows + 1) * this.cell_height;

		let text = new Konva.Text({
			x: 10, 
			y: yRow, 
			text: key, 
			fontSize: 12, 
			fontFamily: 'Ubuntu'
		});
		this.layer_ids.add(text);

		let n_slots = this.session.shared.nSlots();
		for (let i = 0; i < n_slots; i++) {
			let cell = new Konva.Rect({
				x: this.id_col_size + i * this.cell_width, 
				y: yRow, 
				width: this.cell_width, 
				height: this.cell_height, 
				fill: this.default_color, 
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

	update(key, idx, active) {
		if (active) {
			this.cells[key][idx].fill(this.active_color);
		} else {
			this.cells[key][idx].fill(this.default_color);
		}
	}
}

module.exports = StepSequencer;
