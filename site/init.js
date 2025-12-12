function initDisplay() {
	CANVAS_WIDTH = Math.min(GRID_SIZE_X * MAP_WIDTH, windowWidth);
	CANVAS_HEIGHT = Math.min(GRID_SIZE_Y * MAP_HEIGHT, windowHeight);

	createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT, WEBGL);
	cursor(CROSS);
	textFont(b612Mono, GRID_SIZE_Y);
}