// color.js

const hsv_to_rgb = (h, s, v) => {
	let h_prime = h / 60;
	let i = Math.floor(h_prime);
	let f = h_prime - i;
	let p = v * (1 - s);
	let q = v * (1 - f*s);
	let t = v * (1 - (1-f)*s);
	if (h_prime < 1) {
		return [v, t, p];
	} else if (h_prime < 2) {
		return [q, v, p];
	} else if (h_prime < 3) {
		return [p, v, t];
	} else if (h_prime < 4) {
		return [p, q, v];
	} else if (h_prime < 5) {
		return [t, p, v];
	} else {
		return [v, p, q];
	}
};

const generate = () => {
	let h = Math.random() * 360;
	let s = 0.5;
	let v = 0.9;
	let rgb = hsv_to_rgb(h, s, v);
	let r = Math.floor(rgb[0] * 255);
	let g = Math.floor(rgb[1] * 255);
	let b = Math.floor(rgb[2] * 255);
	let hex = "#" + r.toString(16) + g.toString(16) + b.toString(16);
	return hex;
};

module.exports = {
	generate
};
