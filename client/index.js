// index.js
// client side entry point

const ReconnectingWebSocket = require('reconnecting-websocket');
const sharedb = require('sharedb/lib/client');
const SessionController = require('./session_controller.js');

let socket = new ReconnectingWebSocket('ws://' + window.location.host);
let connection = new sharedb.Connection(socket);

socket.addEventListener('message', (event) => {
	if (event.data == "conductor") {
		let session = new SessionController(connection, true);
		session.join();
	} else if (event.data == "not conductor") {
		let session = new SessionController(connection, false);
		session.join();
	}
});
