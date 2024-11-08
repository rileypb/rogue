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
				console.log("repeating and key is pressed");
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

function mouseClicked() {
	let x = Math.floor(mouseX / GRID_SIZE_X);
	let y = Math.floor(mouseY / GRID_SIZE_Y);
	let targetTile = gameState.currentFloor().get(x, y);
	if (!targetTile || !targetTile.isEnterable() || !targetTile.hasBeenSeen) {
		return;
	}
	let path = findPath(gameState.currentFloor(), gameState.player.x, gameState.player.y, x, y);
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
		  let neighbor = map.get(current.x + dx, current.y + dy);
		  if (neighbor == null || neighbor.avoidOnPathfinding() || !neighbor.hasBeenSeen) {
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
						findPath(gameState.currentFloor(), gameState.player.x, gameState.player.y, this.path[this.path.length - 1].x, this.path[this.path.length - 1].y);
					}
				}
				else {
					this.autoMoveInProgress = false;
				}
			}
		}
		this.countdown = 1;
		return 0;
	}

	
}