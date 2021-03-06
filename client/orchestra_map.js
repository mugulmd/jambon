// orchestra_map.js

const Konva = require('konva/cmj').default;

class OrchestraMap {
	constructor(session_controller) {
		this.session = session_controller;

		this.stage = new Konva.Stage({
			container: "orchestra-map"
		});
		let container = this.stage.container();
		this.stage.width(container.clientWidth);
		this.stage.height(container.clientHeight);

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

	init() {
		this.layer_elts.destroyChildren();
		this.elts = {};
		for (let key in this.session.shared.samples.data) {
			this.add(key);
		}
		for (let key in this.session.shared.synths.data) {
			this.add(key);
		}
		this.updateOwnership();
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
			fill: this.default_color, 
			strokeWidth: 4, 
			strokeEnabled: false
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
		this.elts[key] = group;
		this.layer_elts.add(group);

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

		group.on('click', () => {
			if (key in this.session.shared.synths.data) {
				if (this.session.shared.synths.data[key].owner == undefined) {
					let old = this.session.shared.synths.data;
					let new_data = old;
					for (let key_prime in this.session.shared.synths.data) {
						if (this.session.shared.synths.data[key_prime].owner == this.session.login.pseudo()) {
							new_data[key_prime].owner = undefined;
						}
					}
					new_data[key].owner = this.session.login.pseudo();
					this.session.shared.synths.submitOp([{p: [], od: old, oi: new_data}]);
				} else {
					this.session.triggerNotification();
				}
			}
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

		let tr = new Konva.Transformer({
			nodes: [circle], 
			keepRatio: true, 
			enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right'], 
			rotateEnabled: false, 
			centeredScaling: true, 
			flipEnabled: false
		});
		this.layer_elts.add(tr);

		circle.on('transformend', () => {
			let old = this.session.shared.geom.data[key];
			let geom = { 
				x: old.x, 
				y: old.y, 
				size: circle.scaleX(), 
				active: old.active
			};
			this.session.shared.geom.submitOp([{p: [key], od: old, oi: geom}]);
		});
	}

	update(key, geom) {
		this.elts[key].x(this.stage.width() * (geom.x + 1) / 2);
		this.elts[key].y(this.stage.height() * (geom.y + 1) / 2);
		let circle = this.getCircle(key);
		if (geom.active) {
			circle.fill(this.default_color);
		} else {
			circle.fill(this.mute_color);
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

		for (let r = 50; r < this.stage.height(); r += 100) {
			let circle = new Konva.Circle({
				x: this.stage.width()/2, 
				y: this.stage.height(), 
				radius: r, 
				stroke: 'darkkhaki', 
				strokeWidth: 3
			});
			this.layer_bckg.add(circle);
		}

		let line = new Konva.Line({
			points: [this.stage.width()/2, 0, this.stage.width()/2, this.stage.height()], 
			stroke: 'darkkhaki', 
			strokeWidth: 3
		});
		this.layer_bckg.add(line);

		this.layer_bckg.on('click', () => {
			for (let key in this.session.shared.synths.data) {
				if (this.session.shared.synths.data[key].owner == this.session.login.pseudo()) {
					let old = this.session.shared.synths.data;
					let new_data = old;
					new_data[key].owner = undefined;
					this.session.shared.synths.submitOp([{p: [], od: old, oi: new_data}]);
				}
			}
		});
	}

	getCircle(key) {
		return this.elts[key].getChildren((node) => {return node.getClassName()=='Circle';})[0];
	}

	updateOwnership() {
		for (let key in this.session.shared.synths.data) {
			let owner = this.session.shared.synths.data[key].owner;
			let circle = this.getCircle(key);
			if (owner == undefined) {
				circle.strokeEnabled(false);
			} else {
				let color = this.session.shared.participants.data[owner].color;
				circle.stroke(color);
				circle.strokeEnabled(true);
			}
		}
	}
}

module.exports = OrchestraMap;
