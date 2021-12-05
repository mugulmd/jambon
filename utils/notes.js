// notes.js

const base = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

const freq = (idx) => {
	let q = parseInt(idx / 12);
	let octave = q + 4;
	let r = idx % 12;
	return base[r] + octave;
};

module.exports = {
	freq
};
