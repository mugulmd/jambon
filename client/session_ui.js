// session_ui.js

const OrchestraMap = require('./orchestra_map.js');
const StepSequencer = require('./step_sequencer.js');
const CtrlPannel = require('./ctrl_pannel.js');

class SessionUI {
	constructor(session_controller) {
		this.session = session_controller;
		this.orchestra_map = new OrchestraMap(session_controller);
		this.step_sequencer = new StepSequencer(session_controller);
		this.ctrl_pannel = new CtrlPannel(session_controller);
	}
}

module.exports = SessionUI;
