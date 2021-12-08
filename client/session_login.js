// session_login.js

const Colors = require('../utils/colors.js');

class SessionLogin {
	constructor(session_controller) {
		this.session = session_controller;

		this.popup = document.getElementById('login-popup');
		this.screen_blocker = document.getElementById('screen-blocker');
		this.field_name = document.getElementById('field-name');
		this.button_finish = document.getElementById('finish-login');

		this.button_finish.addEventListener('click', () => {
			// TODO : check if field is not empty and pseudo doesn't exist already
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
		return this.field_name.value;
	}
}

module.exports = SessionLogin;
