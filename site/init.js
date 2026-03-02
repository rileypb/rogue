function initDisplay() {
	game.camera.canvasWidth = Math.min(GRID_SIZE_X * MAP_WIDTH, windowWidth);
	game.camera.canvasHeight = Math.min(GRID_SIZE_Y * MAP_HEIGHT, windowHeight);

	createCanvas(game.camera.canvasWidth, game.camera.canvasHeight, WEBGL);
	cursor(CROSS);
	textFont(game.fonts.b612Mono, GRID_SIZE_Y);
}