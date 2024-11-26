
BACKGROUND_COLOR = [20, 20, 40];

let offsetX = 0;
let offsetY = 0;

function render() {
	background(BACKGROUND_COLOR);
	resetMatrix();
	// translate(-drawLeft, -drawTop);
	translate(-drawLeft-CANVAS_WIDTH/2 + shiftX, -drawTop-CANVAS_HEIGHT/2 + shiftY);	
	drawFloorPlan();
	drawEnemies();
	drawPlayer();
	drawCursor();
}

function drawFloorPlan() {
	let floorPlan = gameState.currentFloor().tiles;
	for (let tile of floorPlan) {
		tile.rendered = false;
	}
	allRenderedNeighbors = [];
	for (let tile of floorPlan) {
		if (tile.visible || ((RENDER_MODE == LINE_OF_SIGHT || RENDER_MODE == LINE_OF_SIGHT_PLUS) && tile.hasLineOfSight) || tile.hasBeenSeen) {
			tile.render();
			if (tile.visible) {
				tile.rendered = true;
			}
		} else if (RENDER_MODE == LINE_OF_SIGHT_PLUS && !tile.hasLineOfSight) {
			tile.render();
			tile.rendered = true;
		} 
		if (tile.visible) {
			let neighbors = gameState.currentFloor().getNeighbors(tile.x, tile.y);
			for (let neighbor of neighbors) {
				if (!neighbor.visible) {
					let t = gameState.currentFloor().get(neighbor.x, neighbor.y);
					if (!t.rendered) {
						t.render(true);
						t.rendered = true;
						allRenderedNeighbors.push(t);
					}
				}
			}
		}
	}
	for (let t of allRenderedNeighbors) {
		let neighbors = gameState.currentFloor().getNeighbors(t.x, t.y);
		for (let neighbor of neighbors) {
			let tt = gameState.currentFloor().get(neighbor.x, neighbor.y);
			if (!tt.visible && !tt.rendered) {
				let moreNeighbors = gameState.currentFloor().getNeighbors(tt.x, tt.y);
				let cornerColors = [BACKGROUND_COLOR, BACKGROUND_COLOR, BACKGROUND_COLOR, BACKGROUND_COLOR];
				let black = [0, 0, 0];
				for (let n of moreNeighbors) {
					let ttt = gameState.currentFloor().get(n.x, n.y);
					if (!ttt.visible && ttt.rendered) {
						let dx = ttt.x - tt.x;
						let dy = ttt.y - tt.y;
						if (dx == -1 && dy == -1) {
							cornerColors[0] = black;
						} else if (dx == 0 && dy == -1) {
							cornerColors[0] = black;
							cornerColors[1] = black;
						} else if (dx == 1 && dy == -1) {
							cornerColors[1] = black;
						} else if (dx == -1 && dy == 0) {
							cornerColors[0] = black;
							cornerColors[3] = black;
						} else if (dx == 1 && dy == 0) {
							cornerColors[1] = black;
							cornerColors[2] = black;
						} else if (dx == -1 && dy == 1) {
							cornerColors[3] = black;
						} else if (dx == 0 && dy == 1) {
							cornerColors[2] = black;
							cornerColors[3] = black;
						} else if (dx == 1 && dy == 1) {
							cornerColors[2] = black;
						}
					}
				}

				beginShape(TESS);
				fill(cornerColors[0]);
				noStroke();
				vertex(tt.x * GRID_SIZE_X, tt.y * GRID_SIZE_Y);
				fill(cornerColors[1]);
				vertex((tt.x + 1) * GRID_SIZE_X, tt.y * GRID_SIZE_Y);
				fill(cornerColors[2]);
				vertex((tt.x + 1) * GRID_SIZE_X, (tt.y + 1) * GRID_SIZE_Y);
				fill(cornerColors[3]);
				vertex(tt.x * GRID_SIZE_X, (tt.y + 1) * GRID_SIZE_Y);
				endShape(CLOSE);
				tt.render(false, true);
			}
		}
	}
		// if (!tile.visible){
		// 	fill(128, 128, 255, 16);
		// 	noStroke();
		// 	rect(tile.x * GRID_SIZE_X, tile.y * GRID_SIZE_Y, GRID_SIZE_X, GRID_SIZE_Y);
		// 	fill(255, 255, 255, 8);
		// 	noStroke();
		// 	// rect(tile.x * GRID_SIZE_X + 4, tile.y * GRID_SIZE_Y + 4, GRID_SIZE_X, GRID_SIZE_Y);
		// 	// rect(tile.x * GRID_SIZE_X - 4, tile.y * GRID_SIZE_Y - 4, GRID_SIZE_X, GRID_SIZE_Y);
		// 	// rect(tile.x * GRID_SIZE_X + 4, tile.y * GRID_SIZE_Y - 4, GRID_SIZE_X, GRID_SIZE_Y);
		// 	// rect(tile.x * GRID_SIZE_X - 4, tile.y * GRID_SIZE_Y + 4, GRID_SIZE_X, GRID_SIZE_Y);
		// }
}


function drawCursor() {
	fill(255, 255, 255, 64);
	stroke(255, 255, 255, 64);
	let x = Math.floor((mouseX + drawLeft - shiftX) / GRID_SIZE_X);
	let y = Math.floor((mouseY + drawTop - shiftY) / GRID_SIZE_Y);
	if (autoMoveTask.autoMoveInProgress && path && path.length > 0) {
		x = path[0].x;
		y = path[0].y;
		shiftX *= 0.9;
		shiftY *= 0.9;
		if (Math.abs(shiftX) < 1) {
			shiftX = 0;
		}
		if (Math.abs(shiftY) < 1) {
			shiftY = 0;
		}
	}
	let localPath = findPath(gameState.currentFloor(), gameState.player.x, gameState.player.y, x, y);
	if (localPath) {
		noStroke();
		for (let i = localPath.length - 1; i > 0; i--) {
			let tile = localPath[i];
			fill(255, 255, 255, 128);
			// rect(tile.x * GRID_SIZE_X, tile.y * GRID_SIZE_Y, GRID_SIZE_X, GRID_SIZE_Y);
			let nextTile = localPath[i - 1];
			let dx = nextTile.x - tile.x;
			let dy = nextTile.y - tile.y;
			if (dx == 1 && dy == 0) {
				// fill(0);
				text('→', (tile.x + 0.05) * GRID_SIZE_X, (tile.y + 1) * GRID_SIZE_Y);
			} else if (dx == -1 && dy == 0) {
				// fill(0);
				text('←', (tile.x + 0.05) * GRID_SIZE_X, (tile.y + 1) * GRID_SIZE_Y);
			} else if (dx == 0 && dy == 1) {
				// fill(0);
				text('↓', (tile.x + 0.05) * GRID_SIZE_X, (tile.y + 1) * GRID_SIZE_Y);
			} else if (dx == 0 && dy == -1) {
				// fill(0);
				text('↑', (tile.x + 0.05) * GRID_SIZE_X, (tile.y + 1) * GRID_SIZE_Y);
			} else if (dx == 1 && dy == 1) {
				// fill(0);
				text('↘', (tile.x + 0.05) * GRID_SIZE_X, (tile.y + 1) * GRID_SIZE_Y);
			} else if (dx == -1 && dy == 1) {
				// fill(0);
				text('↙', (tile.x + 0.05) * GRID_SIZE_X, (tile.y + 1) * GRID_SIZE_Y);
			} else if (dx == 1 && dy == -1) {
				// fill(0);
				text('↗', (tile.x + 0.05) * GRID_SIZE_X, (tile.y + 1) * GRID_SIZE_Y);
			} else if (dx == -1 && dy == -1) {
				// fill(0);
				text('↖', (tile.x + 0.05) * GRID_SIZE_X, (tile.y + 1) * GRID_SIZE_Y);
			}
		}
		if (localPath.length > 0) {
			fill(255, 255, 255, 128);
			ellipse((localPath[0].x+0.35) * GRID_SIZE_X, (localPath[0].y+0.75) * GRID_SIZE_Y, GRID_SIZE_X, GRID_SIZE_Y);
			fill(0);
			text('X', (localPath[0].x + 0) * GRID_SIZE_X, (localPath[0].y + 1.1) * GRID_SIZE_Y);
		}
	} else {
		fill(255, 0, 0, 128);
		stroke(0);
		ellipse((x + 0.5) * GRID_SIZE_X, (y + 0.5) * GRID_SIZE_Y, GRID_SIZE_X, GRID_SIZE_Y);
		fill(0);
		noStroke();
		text('X', (x + 0.2) * GRID_SIZE_X, (y + 0.85) * GRID_SIZE_Y);
	}
	
}

function drawPlayer() {
	fill(255);
	stroke(255);
	text('@', (gameState.player.x + 0.05) * GRID_SIZE_X, (gameState.player.y + 1) * GRID_SIZE_Y);
}

function drawEnemies() {
	for (let monster of gameState.currentFloor().monsters) {
		tile = gameState.currentFloor().get(monster.x, monster.y);
		if (tile.visible) {
			monster.draw();
		}
	}
}