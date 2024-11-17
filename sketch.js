let taskManager = new TaskManager();
// let counterTask = new TestTask("Counter Task");
let inputTask = new InputTask();
let gameState = new GameState();
let flickerTask;
let autoMoveTask;

const GRID_SIZE_X = 16;
const GRID_SIZE_Y = 16;
const FONT_NAME = 'monospace';
const MAP_WIDTH = 60;
const MAP_HEIGHT = 60;

let CANVAS_WIDTH;
let CANVAS_HEIGHT;
let MAP_PIXEL_WIDTH = GRID_SIZE_X * MAP_WIDTH;
let MAP_PIXEL_HEIGHT = GRID_SIZE_Y * MAP_HEIGHT;

let drawLeft = 0;
let drawTop = 0;
let drawRight = 0;
let drawBottom = 0;
let hMargin = 0;
let vMargin = 0;

const Q = 81;
const W = 87;
const E = 69;
const A = 65;
const S = 83;
const D = 68;
const Z = 90;
const X = 88;
const C = 67;

NORMAL = 0;
LINE_OF_SIGHT = 1;
VISIBLE = 2;
LINE_OF_SIGHT_PLUS = 3;
RECIPROCAL_LINE_OF_SIGHT = 4;

// RENDER_MODE = LINE_OF_SIGHT;
RENDER_MODE = NORMAL;
// RENDER_MODE = LINE_OF_SIGHT_PLUS;
// RENDER_MODE = RECIPROCAL_LINE_OF_SIGHT;

let autoMoveInProgress = false;

function setup() {
	CANVAS_WIDTH = Math.min(GRID_SIZE_X * MAP_WIDTH, windowWidth);
	CANVAS_HEIGHT = Math.min(GRID_SIZE_Y * MAP_HEIGHT, windowHeight);

	createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT, WEBGL);
	cursor(CROSS);

	let theFont = loadFont("https://fonts.googleapis.com/css2?family=Comfortaa&family=Open+Sans:wght@400;700&family=Roboto+Mono:ital,wght@0,100..700;1,100..700&display=swap");
	textFont(theFont);

	// taskManager.addTask(counterTask);
	taskManager.addTask(inputTask);
	autoMoveTask = new AutoMoveTask();
	taskManager.addTask(autoMoveTask);
	setupGameState(gameState);
	// set up falloff values
	for (let i = 0; i <= MAX_LIGHT_DISTANCE; i++) {
		fallOffValues.push(LIGHT_FALL_OFF ** i);
	}
	textFont(FONT_NAME);
	textSize(GRID_SIZE_Y);
	playerLightSource = new LightSource(color(255, 255, 128), 0.1);
	gameState.player.calculateLineOfSight(gameState.currentFloor());
	updateLight(gameState.currentFloor(), gameState.player);
	gameState.player.calculateSight(gameState.currentFloor());
	render();
}

function setupGameState(gameState) {
	gameState.floors = [new FloorPlan(MAP_WIDTH, MAP_HEIGHT, 0)];
	gameState.floorIndex = 0;
	gameState.currentFloor().generate();
	gameState.player = new Player("The player");
	gameState.player.x = Math.floor(Math.random() * MAP_WIDTH);
	gameState.player.y = Math.floor(Math.random() * MAP_HEIGHT);
	while (!(gameState.currentFloor().get(gameState.player.x, gameState.player.y) instanceof Floor)) {
		gameState.player.x = Math.floor(Math.random() * MAP_WIDTH);
		gameState.player.y = Math.floor(Math.random() * MAP_HEIGHT);
	}
	flickerTask = new FlickerTask(gameState.currentFloor());
	taskManager.addTask(flickerTask);

	hMargin = 6 * GRID_SIZE_X;
	vMargin = 6 * GRID_SIZE_Y;

	drawLeft = GRID_SIZE_X * gameState.player.x - CANVAS_WIDTH / 2;
	if (drawLeft < 0) {
		drawLeft = 0;
	}
	drawRight = drawLeft + CANVAS_WIDTH;
	if (drawRight > MAP_PIXEL_WIDTH + 1) {
		drawRight = MAP_PIXEL_WIDTH + 1;
		drawLeft = drawRight - CANVAS_WIDTH;
	}

	drawTop = GRID_SIZE_Y * gameState.player.y - CANVAS_HEIGHT / 2;
	if (drawTop < 0) {
		drawTop = 0;
	}
	drawBottom = drawTop + CANVAS_HEIGHT;
	if (drawBottom > MAP_PIXEL_HEIGHT + 1) {
		drawBottom = MAP_PIXEL_HEIGHT + 1;
		drawTop = drawBottom - CANVAS_HEIGHT;
	}
	console.log(drawLeft, drawTop, drawRight, drawBottom);
}



function draw() {
	taskManager.runTasks();

	drawLeft = GRID_SIZE_X * gameState.player.x - CANVAS_WIDTH / 2;
	if (drawLeft < 0) {
		drawLeft = 0;
	}
	drawRight = drawLeft + CANVAS_WIDTH;
	if (drawRight > MAP_PIXEL_WIDTH) {
		drawRight = MAP_PIXEL_WIDTH;
		drawLeft = drawRight - CANVAS_WIDTH;
	}

	drawTop = GRID_SIZE_Y * gameState.player.y - CANVAS_HEIGHT / 2;
	if (drawTop < 0) {
		drawTop = 0;
	}
	drawBottom = drawTop + CANVAS_HEIGHT;
	if (drawBottom > MAP_PIXEL_HEIGHT) {
		drawBottom = MAP_PIXEL_HEIGHT;
		drawTop = drawBottom - CANVAS_HEIGHT;
	}

	// updateLight(gameState.currentFloor());
	//render();
	fill(255);
	stroke(255);
	// text(counterTask.count, 100, 100);
	let moveKey = inputTask.emittedKeyCode;
	if (moveKey) {
		switch (moveKey) {
			case Q:
				gameState.player.move(-1, -1, gameState.currentFloor());
				break;
			case W:
				gameState.player.move(0, -1, gameState.currentFloor());
				break;
			case E:
				gameState.player.move(1, -1, gameState.currentFloor());
				break;
			case A:
				gameState.player.move(-1, 0, gameState.currentFloor());
				break;
			case S:
				gameState.player.move(0, 0, gameState.currentFloor());
				break;
			case D:
				gameState.player.move(1, 0, gameState.currentFloor());
				break;
			case Z:
				gameState.player.move(-1, 1, gameState.currentFloor());
				break;
			case X:
				gameState.player.move(0, 1, gameState.currentFloor());
				break;
			case C:
				gameState.player.move(1, 1, gameState.currentFloor());
				break;
		}
		gameState.player.calculateLineOfSight(gameState.currentFloor());
		updateLight(gameState.currentFloor(), gameState.player);
		gameState.player.calculateSight(gameState.currentFloor());
		render();
	}

}

function keyPressed() {
	autoMoveTask.autoMoveInProgress = false;
	inputTask.emittedKeyCode = keyCode;
	inputTask.repeating = true;
	taskManager.tasks.push(inputTask);
	// inputTask.run();

}		
