let startX, startY;
let isDragging = false;

function touchStarted(event) {
	event.preventDefault();
	startX = event.touches[0].pageX;
	startY = event.touches[0].pageY;
}

function touchMoved(event) {
	isDragging = true;
	event.preventDefault();
	let dx = event.touches[0].pageX - startX;
	let dy =event.touches[0].pageY - startY;
	shiftX += dx;
	shiftY += dy;
	startX = event.touches[0].pageX;
	startY = event.touches[0].pageY;
	return false; // prevent default
}

function touchEnded(event) {
	if (!isDragging) {
		let x = Math.floor((event.changedTouches[0].pageX + drawLeft - shiftX) / GRID_SIZE_X);
		let y = Math.floor((event.changedTouches[0].pageY + drawTop - shiftY) / GRID_SIZE_Y);
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
	} else {
		event.preventDefault();
		isDragging = false;
	}
	return false; // prevent default
}