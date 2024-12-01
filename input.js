let shiftX = 0;
let shiftY = 0;

class InputTask extends Task {
	INITIAL_DELAY = 30;
	DELAY = 8;

	constructor() {
		super("Input Task");
		this.countdown = 1;
		this.emittedKeyCode = null;

		this.repeating = false;
	}

	run() {
		if (!this.repeating) {
			if (keyIsPressed) {
				this.emittedKeyCode = keyCode;
				this.repeating = true;
				this.countdown = this.INITIAL_DELAY;
				return 0;
			} else {
				this.emittedKeyCode = null;
				this.countdown = 1;
				return -1;
			}
		} else {
			this.emittedKeyCode = null;
			if (!keyIsPressed) {
				this.repeating = false;
				this.countdown = 1;
				return -1;
			} else {
				this.emittedKeyCode = keyCode;
				this.countdown = this.DELAY;
				return 0;
			}
		}
		return -1;
	}

	noRun() {
		this.emittedKeyCode = null;
	}
}

let path = null;

let touchesCache = [];

function touchStarted() {
	touchesCache = touches;
}

function touchMoved() {
	console.log(touches);
}

function touchEnded() {
	if (touchesCache.length == 1) {
		for (let touch of touchesCache) {
			let x = Math.floor((touch.x + drawLeft) / GRID_SIZE_X);
			let y = Math.floor((touch.y + drawTop) / GRID_SIZE_Y);
			let targetTile = gameState.currentFloor().get(x, y);
			// if (!targetTile || (!targetTile.isEnterable() && targetTile.hasBeenSeen)) {
			// 	return;
			// }
			path = findPath(gameState.currentFloor(), gameState.player.x, gameState.player.y, x, y);
			if (!path) {
				return;
			}
			if (path.length > 0) {
				autoMoveTask.path = path;
				autoMoveTask.autoMoveInProgress = true;
			}
		}
	} else if (touchesCache.length == 2) {
		// let x1 = touchesCache[0].x;
		// let y1 = touchesCache[0].y;
		// let x2 = touchesCache[1].x;
		// let y2 = touchesCache[1].y;
	}
	touchesCache = [];
}

function mouseReleased() {
	let x = Math.floor((correctionX + mouseX + drawLeft - shiftX - 48) / GRID_SIZE_X);
	let y = Math.floor((correctionY + mouseY + drawTop - shiftY - 48) / GRID_SIZE_Y);
	let targetTile = gameState.currentFloor().get(x, y);
	if (!targetTile || (!targetTile.isEnterable() && targetTile.hasBeenSeen)) {
		return;
	}
	path = findPath(gameState.currentFloor(), gameState.player.x, gameState.player.y, x, y);
	if (!path) {
		return;
	}
	if (path.length > 0) {
		autoMoveTask.path = path;
		autoMoveTask.autoMoveInProgress = true;
	}
}

function findPath(map, startX, startY, endX, endY) {
	// mark all tiles as not visited.
	for (let i = 0; i < map.width; i++) {
	  for (let j = 0; j < map.height; j++) {
		map.get(i, j).visited = false;
		map.get(i, j).gScore = Infinity;
		map.get(i, j).fScore = Infinity;
		map.get(i, j).cameFrom = null;
	  }
	}
	let openSet = [map.get(startX, startY)];
	map.get(startX, startY).gScore = 0;
	map.get(startX, startY).fScore = Math.abs(endX - startX) + Math.abs(endY - startY);
	while (openSet.length > 0) {
	  let current = openSet[0];
	  for (let tile of openSet) {
		if (tile.fScore < current.fScore) {
		  current = tile;
		}
	  }
	  if (current.x == endX && current.y == endY) {
		let path = [];
		while (current.cameFrom != null) {
		  path.push(current);
		  if (current.x == startX && current.y == startY) {
			return path;
			break;
		  }
		  current = current.cameFrom;
		}
		return path;
	  }
	  openSet.splice(openSet.indexOf(current), 1);
	  current.visited = true;
	  for (let dx = -1; dx <= 1; dx++) {
		for (let dy = -1; dy <= 1; dy++) {
		  if (dx == 0 && dy == 0) {
			continue;
		  }
		  if (current.x + dx < 0 || current.x + dx >= map.width || current.y + dy < 0 || current.y + dy >= map.height) {
			continue;
		  }
		  let neighbor = map.get(current.x + dx, current.y + dy);
		  if (neighbor == null || (neighbor.avoidOnPathfinding() && neighbor.hasBeenSeen)) {
			continue;
		  }
		  if (neighbor.visited) {
			continue;
		  }
		  let tentativeGScore = current.gScore + 1;
		  if (!openSet.includes(neighbor)) {
			openSet.push(neighbor);
		  } else if (tentativeGScore >= neighbor.gScore) {
			continue;
		  }
		  neighbor.cameFrom = current;
		  neighbor.gScore = tentativeGScore;
		  neighbor.fScore = neighbor.gScore + Math.abs(endX - neighbor.x) + Math.abs(endY - neighbor.y);
		}
	  }
	}
  }


function heuristic(a, b) {
	return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}



class AutoMoveTask extends Task {
	constructor(player) {
		super("Automove Task");
		this.countdown = 1;
		this.autoMoveInProgress = false;
		this.path = null;
	}

	run() {
		if (this.autoMoveInProgress) {
			this.countdown = 1;
			if (!this.path) {
				this.autoMoveInProgress = false;
				return 0;
			}
			if (this.path.length > 0) {
				let move = this.path.pop();
				let dx = move.x - gameState.player.x;
				let dy = move.y - gameState.player.y;
				if (gameState.player.move(dx, dy, gameState.currentFloor())) {
					gameState.player.calculateLineOfSight(gameState.currentFloor());
					updateLight(gameState.currentFloor(), gameState.player);
					gameState.player.calculateSight(gameState.currentFloor());
					render();
					if (this.path.length > 0) {
						this.path = findPath(gameState.currentFloor(), gameState.player.x, gameState.player.y, this.path[0].x, this.path[0].y);
					}
				}
				else {
					this.autoMoveInProgress = false;
				}
			}
			else {
				this.autoMoveInProgress = false;
			}
		}
		this.countdown = 1;
		return 0;
	}

	
}