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

		this.layer_bckg = new Konva.Layer();
		this.stage.add(this.layer_bckg);
		this.layer_bckg.draw();

		this.layer_elts = new Konva.Layer();
		this.stage.add(this.layer_elts);
		this.layer_elts.draw();

		this.elts = {};
		this.elt_size = 20;
		this.default_color = 'red';
		this.mute_color = 'gray';

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
		let group = new Konva.Group({
			x: this.stage.width()/2, 
			y: this.stage.height()/2, 
			draggable: true
		});
		let circle = new Konva.Circle({
			x: 0, 
			y: 0, 
			radius: this.elt_size, 
			fill: this.default_color
		});
		group.add(circle);
		let text = new Konva.Text({
			x: -this.elt_size/2, 
			y: -this.elt_size/2, 
			text: key, 
			fontSize: 12, 
			fontFamily: 'Ubuntu'
		});
		group.add(text);
		group.on('dragend', () => {
			let old = this.session.shared.geom.data[key];
			let geom = { 
				x: 2 * (group.x() / this.stage.width()) - 1, 
				y: 2 * (group.y() / this.stage.height()) - 1, 
				size: old.size, 
				active: old.active
			};
			this.session.shared.geom.submitOp([{p: [key], od: old, oi: geom}]);
		});
		group.on('dblclick', () => {
			let old = this.session.shared.geom.data[key];
			let geom = { 
				x: old.x, 
				y: old.y, 
				size: old.size, 
				active: !old.active
			};
			this.session.shared.geom.submitOp([{p: [key], od: old, oi: geom}]);
		});
		this.elts[key] = group;
		this.layer_elts.add(group);
	}

	update(key, geom) {
		this.elts[key].x(this.stage.width() * (geom.x + 1) / 2);
		this.elts[key].y(this.stage.height() * (geom.y + 1) / 2);
		let circle = this.elts[key].getChildren((node) => {return node.getClassName()=='Circle';})[0];
		if (geom.active) {
			circle.fill(this.default_color);
		} else {
			circle.fill(this.mute_color);
		}
	} 
}

module.exports = OrchestraMap;
