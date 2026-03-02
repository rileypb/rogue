let robotoMono;
let b612Mono;

function preload() {
	robotoMono = loadFont("RobotoMono-Regular.ttf");
	b612Mono = loadFont("B612Mono-Regular.ttf");
}

async function setup() {
	game.fonts.robotoMono = robotoMono;
	game.fonts.b612Mono = b612Mono;
	initDisplay();
	initKeyBindings();
	
	game.taskManager.addTask(game.inputTask);
	game.autoMoveTask = new AutoMoveTask();
	game.taskManager.addTask(game.autoMoveTask);

	// set up falloff values
	for (let i = 0; i <= MAX_LIGHT_DISTANCE; i++) {
		game.fallOffValues.push(LIGHT_FALL_OFF ** i);
	}

	await setupGameState(game.state);

	game.playerLightSource = new LightSource([192, 192, 192], 0.1);
	endTurn(game.state);
}

async function setupGameState(state) {
	// worldlet = new Worldlet("init", WT_OPEN_WORLD, FP_NONE, OUTDOOR_ENGINE, OUTDOOR_INPUT);
	game.worldlet = new Worldlet("init", WT_DUNGEON, FP_NONE, INDOOR_ENGINE, INDOOR_INPUT);

	await game.worldlet.init();
	state.floors = game.worldlet.floors;
	state.floorIndex = game.worldlet.initialFloor;
	state.currentWorldlet = game.worldlet;
	game.displayEngine = game.worldlet.displayEngine;
	state.player = new Player("The player");
	state.player.x = 30;
	state.player.y = 30;
	while (!(state.currentFloor().get(state.player.x, state.player.y) instanceof Floor)) {
		state.player.x = Math.floor(Math.random() * MAP_WIDTH);
		state.player.y = Math.floor(Math.random() * MAP_HEIGHT);
	}
	game.flickerTask = new FlickerTask(state.currentFloor());
	game.taskManager.addTask(game.flickerTask);

	game.camera.update(state.player.x, state.player.y);
	console.log(game.camera.left, game.camera.top, game.camera.right, game.camera.bottom);
}



function draw() {
	game.taskManager.runTasks();

	game.camera.update(game.state.player.x, game.state.player.y);

	// updateLight(game.state.currentFloor());
	//render();
	fill(255);
	stroke(255);
	// text(counterTask.count, 100, 100);
	let moveKey = game.inputTask.emittedKeyCode;
	if (moveKey) {
		let command = resolveInput(moveKey);
		if (command) {
			executeTurn(command, game.state.player, game.state);
		}
	}
}

function keyPressed() {
	game.autoMoveTask.autoMoveInProgress = false;
	game.inputTask.emittedKeyCode = keyCode;
	game.inputTask.repeating = true;
	game.taskManager.tasks.push(game.inputTask);
}		
