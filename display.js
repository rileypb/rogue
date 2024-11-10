
function render() {
	background(0);
	drawFloorPlan();
	drawPlayer();
	drawCursor();
	
	//   drawEnemies();
}

function drawFloorPlan() {
	let floorPlan = gameState.currentFloor().tiles;
	translate(GRID_SIZE_X * 0.1, GRID_SIZE_Y * 0.1);
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
	resetMatrix();
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

function drawCursor() {
	fill(255, 255, 255, 64);
	stroke(255, 255, 255, 64);
	let x = Math.floor(mouseX / GRID_SIZE_X);
	let y = Math.floor(mouseY / GRID_SIZE_Y);
	// ellipse(x * GRID_SIZE_X, y * GRID_SIZE_Y, GRID_SIZE_X, GRID_SIZE_Y);
	let path;
	if (exploreInProgress) {
		path = autoMoveTask.path;
	} else {
		path = findPath(gameState.currentFloor(), gameState.player.x, gameState.player.y, x, y);
	}
	if (path) {
		noStroke();
		for (let i = path.length - 1; i > 0; i--) {
			let tile = path[i];
			fill(255, 255, 255, 128);
			// rect(tile.x * GRID_SIZE_X, tile.y * GRID_SIZE_Y, GRID_SIZE_X, GRID_SIZE_Y);
			let nextTile = path[i - 1];
			let dx = nextTile.x - tile.x;
			let dy = nextTile.y - tile.y;
			if (dx == 1 && dy == 0) {
				// fill(0);
				text('→', (tile.x + 0.25) * GRID_SIZE_X, (tile.y + 0.75) * GRID_SIZE_Y);
			} else if (dx == -1 && dy == 0) {
				// fill(0);
				text('←', (tile.x + 0.25) * GRID_SIZE_X, (tile.y + 0.75) * GRID_SIZE_Y);
			} else if (dx == 0 && dy == 1) {
				// fill(0);
				text('↓', (tile.x + 0.25) * GRID_SIZE_X, (tile.y + 0.75) * GRID_SIZE_Y);
			} else if (dx == 0 && dy == -1) {
				// fill(0);
				text('↑', (tile.x + 0.25) * GRID_SIZE_X, (tile.y + 0.75) * GRID_SIZE_Y);
			} else if (dx == 1 && dy == 1) {
				// fill(0);
				text('↘', (tile.x + 0.25) * GRID_SIZE_X, (tile.y + 0.75) * GRID_SIZE_Y);
			} else if (dx == -1 && dy == 1) {
				// fill(0);
				text('↙', (tile.x + 0.25) * GRID_SIZE_X, (tile.y +0.75) * GRID_SIZE_Y);
			} else if (dx == 1 && dy == -1) {
				// fill(0);
				text('↗', (tile.x + 0.25) * GRID_SIZE_X, (tile.y + 0.75) * GRID_SIZE_Y);
			} else if (dx == -1 && dy == -1) {
				// fill(0);
				text('↖', (tile.x + 0.25) * GRID_SIZE_X, (tile.y + 0.75) * GRID_SIZE_Y);
			}
		}
		if (path.length > 0) {
			fill(255, 255, 255, 128);
			ellipse((path[0].x+0.5) * GRID_SIZE_X, (path[0].y+0.5) * GRID_SIZE_Y, GRID_SIZE_X, GRID_SIZE_Y);
			fill(0);
			text('⌖', (path[0].x + 0) * GRID_SIZE_X, (path[0].y + 0.75) * GRID_SIZE_Y);
		}
	} else {
		gameState.currentFloor().get(x, y).unreachable = true;
		fill(255, 0, 0, 128);
		stroke(0);
		ellipse((x + 0.5) * GRID_SIZE_X, (y + 0.5) * GRID_SIZE_Y, GRID_SIZE_X, GRID_SIZE_Y);
		fill(0);
		noStroke();
		text('X', (x + 0.2) * GRID_SIZE_X, (y + 0.85) * GRID_SIZE_Y);
	}
}

function drawPlayer() {
	let currentLight = gameState.currentFloor().get(gameState.player.x, gameState.player.y).light;
	if (currentLight._getBrightness() < 50) {
		fill(255);
	} else {
		fill(0);
	}
	text('@', gameState.player.x * GRID_SIZE_X, (gameState.player.y + 1) * GRID_SIZE_Y);
}