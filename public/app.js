/*
	Client
*/


// Socket connection

let socket = io();


// Drum kit

let drums = new Tone.Players({
	urls: {
		0: "samples/kick_00.wav", 
		1: "samples/snare_00.wav", 
		2: "samples/closed_hat_00.wav" 
	}
}).toDestination();


// Sequencer

let sequencer = document.getElementById("sequencer");

let steps = [];

for (let i = 0; i < 3; i++) {

	let row = document.createElement("div");
	row.classList.add("row");

	steps.push([]);

	for (let j = 0; j < 8; j++) {
		let cell = document.createElement("input");
		cell.type = "checkbox";

		steps[i].push(0);

		cell.onclick = function() {
			console.log(i + ", " + j);
			if(cell.checked) { 
				steps[i][j] = Tone.Transport.scheduleRepeat((time) => { drums.player(i).start(time); }, {"4n": 2}, {"16n": j});
			}
			else {
				Tone.Transport.clear(steps[i][j]);
			}
		};

		cell.classList.add("cell");
		row.appendChild(cell);
	}

	sequencer.appendChild(row);
}


// Play-pause

document.getElementById("buttonPlay").onclick = function() {
	console.log("play");
	Tone.Transport.bpm.value = 60;
	Tone.Transport.toggle();
};


// Initialization

window.onload = async function() {
	await Tone.start();
	console.log("audio is ready");
}
