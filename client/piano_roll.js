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

		this.layer_bckg = new Konva.Layer();
		this.stage.add(this.layer_bckg);
		this.layer_bckg.draw();

		this.layer_keyboard = new Konva.Layer();
		this.stage.add(this.layer_keyboard);
		this.layer_keyboard.draw();

		this.layer_cells = new Konva.Layer();
		this.stage.add(this.layer_cells);
		this.layer_cells.draw();

		this.layer_grid = new Konva.Layer();
		this.stage.add(this.layer_grid);
		this.layer_grid.draw();

		this.cells = {};
		this.keyboard_size = 100;
		this.cell_width = 30;
		this.cell_height = 20;
		this.default_color = 'gray';
		this.active_color = 'orange';

		this.drawBckg();
		this.drawKeyboard();
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

	drawKeyboard() {
		for (let i = 0; i < 12; i++) {
			let text = new Konva.Text({
				x: 10, 
				y: (i+1) * this.cell_height, 
				text: Notes.freq(i), 
				fontSize: 12, 
				fontFamily: 'Ubuntu'
			});
			this.layer_keyboard.add(text);
		}
	}

	createCells() {
		for (let i = 0; i < 12; i++) {
			let freq = Notes.freq(i);
			this.cells[freq] = [];
			for (let j = 0; j < this.session.shared.nSlots(); j++) {
				let cell = new Konva.Rect({
					x: this.keyboard_size + j * this.cell_width, 
					y: (i+1) * this.cell_height, 
					width: this.cell_width, 
					height: this.cell_height, 
					fill: this.default_color, 
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

	drawGrid() {
		let n_rows = Object.keys(this.cells).length;
		let n_slots = this.session.shared.nSlots();

		for (let i = 0; i <= n_rows; i++) {
			let y = (i + 1) * this.cell_height;
			let line = new Konva.Line({
				points: [0, y, this.keyboard_size+n_slots*this.cell_width, y], 
				stroke: 'darkslategray', 
				strokeWidth: 1
			});
			this.layer_grid.add(line);
		}

		for (let i = 0; i <= n_slots; i++) {
			let x = this.keyboard_size + i * this.cell_width;
			let line = new Konva.Line({
				points: [x, this.cell_height, x, (n_rows+1)*this.cell_height], 
				stroke: 'darkslategray', 
				strokeWidth: ((i % 4 == 0) ? 2 : 1)
			});
			this.layer_grid.add(line);
		}
	}

	init() {
		this.createCells();
		this.drawGrid();
	}

	update(freq, idx, active) {
		if (active) {
			this.cells[freq][idx].fill(this.active_color);
		} else {
			this.cells[freq][idx].fill(this.default_color);
		}
	}
}

module.exports = PianoRoll;
