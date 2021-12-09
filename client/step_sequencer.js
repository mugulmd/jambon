// step_sequencer.js

const Konva = require('konva/cmj').default;

class StepSequencer {
	constructor(session_controller) {
		this.session = session_controller;

		this.stage = new Konva.Stage({
			container: "step-sequencer"
		});
		let container = this.stage.container();
		this.stage.width(container.clientWidth);
		this.stage.height(container.clientHeight);

		this.layer_bckg = new Konva.Layer();
		this.stage.add(this.layer_bckg);
		this.layer_bckg.draw();

		this.layer_ids = new Konva.Layer();
		this.stage.add(this.layer_ids);
		this.layer_ids.draw();

		this.layer_cells = new Konva.Layer();
		this.stage.add(this.layer_cells);
		this.layer_cells.draw();

		this.layer_grid = new Konva.Layer();
		this.stage.add(this.layer_grid);
		this.layer_grid.draw();

		this.cells = {};
		this.name_col_size = 50;
		this.top_offset = 20;
		this.cell_width = 30;
		this.cell_height = 20;
		this.default_color = 'gray';
		this.active_color = 'orange';

		this.drawBckg();
	}

	init() {
		this.layer_ids.destroyChildren();
		this.layer_cells.destroyChildren();
		this.cells = {};

		let n_slots = this.session.shared.nSlots();
		this.cell_width = Math.min((this.stage.width() - this.name_col_size) / n_slots, 30);

		for (let key in this.session.shared.samples.data) {
			this.add(key);
		}
		this.drawGrid();
	}

	add(key) {
		let n_rows = Object.keys(this.cells).length;
		this.cells[key] = [];
		let yRow = this.top_offset + n_rows * this.cell_height;

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
				x: this.name_col_size + i * this.cell_width, 
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

		this.drawGrid();
	}

	update(key, idx, active) {
		if (active) {
			this.cells[key][idx].fill(this.active_color);
		} else {
			this.cells[key][idx].fill(this.default_color);
		}
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

	drawGrid() {
		this.layer_grid.destroyChildren();

		let n_rows = Object.keys(this.cells).length;
		let n_slots = this.session.shared.nSlots();

		for (let i = 0; i <= n_rows; i++) {
			let y = this.top_offset + i * this.cell_height;
			let line = new Konva.Line({
				points: [0, y, this.name_col_size + n_slots * this.cell_width, y], 
				stroke: 'darkslategray', 
				strokeWidth: 1
			});
			this.layer_grid.add(line);
		}

		for (let i = 0; i <= n_slots; i++) {
			let x = this.name_col_size + i * this.cell_width;
			let line = new Konva.Line({
				points: [x, this.cell_height, x, this.top_offset + n_rows * this.cell_height], 
				stroke: 'darkslategray', 
				strokeWidth: ((i % 4 == 0) ? 2 : 1)
			});
			this.layer_grid.add(line);
		}
	}
}

module.exports = StepSequencer;
