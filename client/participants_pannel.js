// participants_pannel.js

class ParticipantsPannel {
	constructor(session_controller) {
		this.session = session_controller;

		this.pannel = document.getElementById('participants');
	}

	add(name) {
		let elt = document.createElement('div');

		let dot = document.createElement('span');
		dot.classList.add('dot');
		dot.style.backgroundColor = this.session.shared.participants.data[name].color;
		elt.appendChild(dot);

		let label = document.createElement('span');
		label.textContent = name;
		elt.appendChild(label);

		this.pannel.appendChild(elt);
	}
}

module.exports = ParticipantsPannel;
