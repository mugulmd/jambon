// ctrl_pannel.js

const Tone = require('tone');

class CtrlPannel {
	constructor(session_controller) {
		this.session = session_controller;

		this.button_play = document.getElementById('play-pause');
		this.slider_bpm = document.getElementById('session-bpm');

		this.button_play.addEventListener('click', () => {
			Tone.Transport.toggle();
		});

		this.slider_bpm.addEventListener('mousemove', () => {
			Tone.Transport.bpm.value = parseFloat(this.slider_bpm.value);
		});

		this.slider_bpm.addEventListener('mouseup', () => {
			let old = this.session.shared.rythm.data.bpm;
			this.session.shared.rythm.submitOp([{p: ['bpm'], od: old, oi: parseFloat(this.slider_bpm.value)}]);
		});
	}
}

module.exports = CtrlPannel;
