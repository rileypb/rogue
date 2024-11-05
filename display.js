
function render() {
	background(0);
	drawFloorPlan();
	drawPlayer();
	//   drawEnemies();
}

function drawFloorPlan() {
	let floorPlan = gameState.currentFloor().tiles;
	for (var i = 0; i < floorPlan.length; i++) {
		let tile = floorPlan[i];
		if (tile.visible || (RENDER_MODE == LINE_OF_SIGHT && tile.hasLineOfSight)) {
			tile.render();
		}
	}
}

function drawPlayer() {
	fill(255);
	stroke(255);
	text('@', gameState.player.x * GRID_SIZE_X, (gameState.player.y + 1) * GRID_SIZE_Y);
}