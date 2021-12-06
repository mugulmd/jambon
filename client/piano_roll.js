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
				y: 10 + i * this.cell_height, 
				text: Notes.freq(i), 
				fontSize: 12, 
				fontFamily: 'Ubuntu'
			});
			this.layer_keyboard.add(text);
		}
	}

	init() {
		for (let i = 0; i < 12; i++) {
			let freq = Notes.freq(i);
			this.cells[freq] = [];
			for (let j = 0; j < this.session.shared.nSlots(); j++) {
				let cell = new Konva.Rect({
					x: this.keyboard_size + j * this.cell_width, 
					y: 10 + i * this.cell_height, 
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

	update(freq, idx, active) {
		if (active) {
			this.cells[freq][idx].fill(this.active_color);
		} else {
			this.cells[freq][idx].fill(this.default_color);
		}
	}
}

module.exports = PianoRoll;
