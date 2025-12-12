
let displayEngine;
let displayedWorldlet;

function display() {
	if (displayEngine) {
		displayEngine.display();
	} else {
		// do something else by default
	}
}

function setDisplayedWorldlet(worldlet) {
	if (displayEngine) {
		displayEngine.teardown();
	}
	displayedWorldlet = worldlet;
	displayEngine = worldlet.displayEngine;
	displayEngine.init();
}

class DisplayEngine {
	
}

class TiledDisplayEngine extends DisplayEngine {

}

class IndoorDisplayEngine extends TiledDisplayEngine {
	init() {

	}

	teardown() {

	}

	display() {
		render();
	}
}

class OutdoorDisplayEngine extends TiledDisplayEngine {
	init() {

	}

	teardown() {

	}

	display() {
		
	}
}

class InitDisplayEngine extends DisplayEngine {
	display() {
		background(220);
		fill(0);
		textAlign(CENTER, CENTER);
		textSize(32);
		text("Welcome to the Rogue Game!", 0,-20);
		textSize(16);
		text("Press any key to begin.", 0,20);
	}
}

const INDOOR_ENGINE = new IndoorDisplayEngine();
const OUTDOOR_ENGINE = new OutdoorDisplayEngine();
const INIT_ENGINE = new InitDisplayEngine();