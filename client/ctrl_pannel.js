// ctrl_pannel.js

const Tone = require('tone');

class CtrlPannel {
	constructor(session_controller) {
		this.session = session_controller;

		this.button_play = document.getElementById('buttonPlay');
		this.button_play.addEventListener('click', () => {
			Tone.Transport.toggle();
		});
	}
}

module.exports = CtrlPannel;
