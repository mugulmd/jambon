// orchestra_map.js

const Konva = require('konva/cmj').default;

class OrchestraMap {
	constructor(session_controller) {
		this.session = session_controller;

		this.stage = new Konva.Stage({
			container: "orchestra-map", 
			width: 640, 
			height: 480
		});

		this.layer_elts = new Konva.Layer();
		this.stage.add(this.layer_elts);
		this.layer_elts.draw();

		this.elts = {};
	}

	add(key) {
		let circle = new Konva.Circle({
			x: this.stage.width()/2, 
			y: this.stage.height()/2, 
			radius: 10, 
			fill: 'red', 
			draggable: true
		});
		circle.on('dragend', () => {
			let old = this.session.shared.geom.data[key];
			let geom = { 
				x: 2 * (circle.x() / this.stage.width()) - 1, 
				y: 2 * (circle.y() / this.stage.height()) - 1, 
				size: old.size
			};
			this.session.shared.geom.submitOp([{p: [key], od: old, oi: geom}]);
		});
		this.elts[key] = circle;
		this.layer_elts.add(circle);
	}

	update(key, geom) {
		this.elts[key].x(this.stage.width() * (geom.x + 1) / 2);
		this.elts[key].y(this.stage.height() * (geom.y + 1) / 2);
	} 
}

module.exports = OrchestraMap;
