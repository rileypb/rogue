
function render() {
	background(0);
	drawFloorPlan();
	drawPlayer();
	drawCursor();
	//   drawEnemies();
}

function drawFloorPlan() {
	let floorPlan = gameState.currentFloor().tiles;
	for (let tile of floorPlan) {
		// let tile = floorPlan[i];
		if (tile.visible || ((RENDER_MODE == LINE_OF_SIGHT || RENDER_MODE == LINE_OF_SIGHT_PLUS) && tile.hasLineOfSight) || tile.hasBeenSeen) {
			// if (tile.hasBeenSeen && !tile.visible) {
			// 	fill(255);
			// 	noStroke();
			// 	rect(tile.x * GRID_SIZE_X, tile.y * GRID_SIZE_Y, GRID_SIZE_X, GRID_SIZE_Y);
			// }
			tile.render();
		} else if (RENDER_MODE == LINE_OF_SIGHT_PLUS && !tile.hasLineOfSight) {
			// fill(color(255,200,200));
			// stroke(color(255,200,200));
			// rect(tile.x * GRID_SIZE_X, tile.y * GRID_SIZE_Y, GRID_SIZE_X, GRID_SIZE_Y);
			tile.render();
		} 
		if (!tile.visible){
			fill(128, 128, 255, 16);
			noStroke();
			rect(tile.x * GRID_SIZE_X, tile.y * GRID_SIZE_Y, GRID_SIZE_X, GRID_SIZE_Y);
			fill(255, 255, 255, 8);
			noStroke();
			rect(tile.x * GRID_SIZE_X + 4, tile.y * GRID_SIZE_Y + 4, GRID_SIZE_X, GRID_SIZE_Y);
			rect(tile.x * GRID_SIZE_X - 4, tile.y * GRID_SIZE_Y - 4, GRID_SIZE_X, GRID_SIZE_Y);
			rect(tile.x * GRID_SIZE_X + 4, tile.y * GRID_SIZE_Y - 4, GRID_SIZE_X, GRID_SIZE_Y);
			rect(tile.x * GRID_SIZE_X - 4, tile.y * GRID_SIZE_Y + 4, GRID_SIZE_X, GRID_SIZE_Y);
		}
	}
}

drawCursor = function() {
	fill(255, 255, 255, 64);
	stroke(255, 255, 255, 64);
	let x = Math.floor(mouseX / GRID_SIZE_X);
	let y = Math.floor(mouseY / GRID_SIZE_Y);
	rect(x * GRID_SIZE_X, y * GRID_SIZE_Y, GRID_SIZE_X, GRID_SIZE_Y);
}

function drawPlayer() {
	fill(255);
	stroke(255);
	text('@', gameState.player.x * GRID_SIZE_X, (gameState.player.y + 1) * GRID_SIZE_Y);
}