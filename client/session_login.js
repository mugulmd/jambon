// session_login.js

const Colors = require('../utils/colors.js');

class SessionLogin {
	constructor(session_controller, is_conductor) {
		this.session = session_controller;
		this.is_conductor = is_conductor;

		this.popup = document.getElementById('login-popup');
		this.screen_blocker = document.getElementById('screen-blocker');
		this.field_pseudo = document.getElementById('login-pseudo');
		this.field_bpm = document.getElementById('login-bpm');
		this.field_time_signature_top = document.getElementById('login-time-signature-top');
		this.field_time_signature_bottom = document.getElementById('login-time-signature-bottom');
		this.field_loop_size = document.getElementById('login-loop-size');
		this.field_resolution = document.getElementById('login-resolution');
		this.button_finish = document.getElementById('finish-login');

		if (!this.is_conductor) {
			let elts_conductor = document.getElementsByClassName('conductor');
			for (let i = 0; i < elts_conductor.length; i++) {
				elts_conductor.item(i).disabled = true;
			}
		}

		this.button_finish.addEventListener('click', () => {
			if (this.is_conductor) {
				let old = this.session.shared.rythm.data;
				let rythm_data = {
					bpm: parseFloat(this.field_bpm.value), 
					time_signature_top: parseInt(this.field_time_signature_top.value), 
					time_signature_bottom: parseInt(this.field_time_signature_bottom.value), 
					loop_size: parseInt(this.field_loop_size.value), 
					resolution: parseInt(this.field_resolution.value)
				};
				this.session.shared.rythm.submitOp([{p: [], od: old, oi: rythm_data}]);
			}

			// TODO : check if field is not empty and pseudo doesn't exist already
			// TODO : generate random color
			let c = Colors.generate();
			this.session.shared.participants.submitOp([{p: [this.pseudo()], oi: {color: c}}]);
			this.hide();
		});
	}

	show() {
		this.popup.style.display = 'block';
	}

	hide() {
		this.popup.style.display = 'none';
		this.screen_blocker.style.display = 'none';
	}

	pseudo() {
		return this.field_pseudo.value;
	}
}

module.exports = SessionLogin;
