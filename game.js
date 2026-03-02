/**
 * Game — The single top-level context object.
 * Replaces ~15 scattered mutable globals with one well-known access point.
 *
 * Usage: access via the global `game` instance, e.g. game.state, game.camera, etc.
 */
class Game {
	constructor() {
		this.state = new GameState();
		this.camera = new Camera();
		this.taskManager = new TaskManager();
		this.inputTask = new InputTask();
		this.autoMoveTask = null;   // created in setup()
		this.flickerTask = null;    // created in setupGameState()

		this.playerLightSource = null; // created in setup()
		this.displayEngine = null;     // set in setupGameState()
		this.worldlet = null;          // set in setupGameState()

		this.currentPath = null;       // was: path (input.js)
		this.flickerFactor = 0;        // was: globalFlickerFactor
		this.fallOffValues = [];       // was: fallOffValues (light2.js)
		this.renderMode = NORMAL;      // was: RENDER_MODE

		this.fonts = {
			robotoMono: null,
			b612Mono: null,
		};
	}
}

const game = new Game();
