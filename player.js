
const BRESENHAM_ALGORITHM = true;

function castRay(startX, startY, endX, endY, floorPlan, includeStart = false, includeEnd = false) {
	var xIncrement = (endX > startX) ? 1 : -1;
	var yIncrement = (endY > startY) ? 1 : -1;

	var dx = Math.abs(endX - startX);
	var dy = Math.abs(endY - startY);

	var error = dx - dy;
	var errorCorrectX = dx * 2;
	var errorCorrectY = dy * 2;

	var currentX = startX;
	var currentY = startY;

	let ray = [];
	while (true) {
		if (!floorPlan.get(currentX, currentY)) {
			break;
		}
		if (!floorPlan.get(currentX, currentY).isTransparent()) {
			return ray;
		}
		if (currentX == startX && currentY == startY) {
			if (includeStart) {
				ray.push(floorPlan.get(currentX, currentY));
			}
		}
		if (currentX == endX && currentY == endY) {
			if (includeEnd) {
				ray.push(floorPlan.get(currentX, currentY));
			}
			break;
		}
		if ((currentX != startX || currentY != startY) && (currentX != endX || currentY != endY)) {
			ray.push(floorPlan.get(currentX, currentY));
		}

		if (currentX == endX && currentY == endY) {
			break;
		}

		if (error > 0) {
			currentX += xIncrement;
			error -= errorCorrectY;
		}
		else if (error < 0) {
			currentY += yIncrement;
			error += errorCorrectX;
		}
		else {
			currentX += xIncrement;
			currentY += yIncrement;
		}
	}
	return ray;
}

class Player {
	MAX_HEALTH = 100;

	constructor(name) {
		this.name = name;

		this.health = this.MAX_HEALTH;
		this.timeUnderwater = 0;
		this.floor = 0;

		this.x = 0;
		this.y = 0;
	}




	calculateLineOfSight(floorPlan) {
		console.log("Calculating line of sight");
		if (this.BRESENHAM_ALGORITHM) {
			for (let tile of floorPlan.tiles) {
				tile.hasLineOfSight = false;
			}

			for (let tile of floorPlan.tiles) {
				let ray = this.castRay(this.x, this.y, tile.x, tile.y, floorPlan, true, true);
				for (let rayTile of ray) {
					rayTile.hasLineOfSight = true;
				}
			}

		} else {
			for (let i = 0; i < floorPlan.width; i++) {
				for (let j = 0; j < floorPlan.height; j++) {
					floorPlan.get(i, j).hasLineOfSight = false;
				}
			}
			for (let tile of floorPlan.tiles) {
				// if (tile === null || tile === undefined) {
				// 	continue;
				// }
				let distance = Math.ceil(Math.sqrt((tile.x - this.x) ** 2 + (tile.y - this.y) ** 2));
				let dx = this.x - tile.x;
				let dy = this.y - tile.y;
				let angle = Math.atan2(dy, dx);
				let blocked = false;
				for (let d = 0; d <= distance; d++) {
					// if (dy == 0 && dx == -20) {
					// 	let a = 0;
					// }
					let xx = Math.ceil(this.x - Math.cos(angle) * d);
					let yy = Math.ceil(this.y - Math.sin(angle) * d);
					if (dx < 0) {
						xx = Math.floor(this.x - Math.cos(angle) * d);
					}
					if (dy < 0) {
						yy = Math.floor(this.y - Math.sin(angle) * d);
					}

					if (xx < 0 || xx >= floorPlan.width || yy < 0 || yy >= floorPlan.height) {
						break;
					}
					let traceTile = floorPlan.get(xx, yy);
					traceTile.hasLineOfSight = true;
					if (traceTile.isTransparent() && d == distance - 1 && (yy != tile.y || xx != tile.x)) {
						traceTile = floorPlan.get(tile.x, tile.y);
						traceTile.hasLineOfSight = true;
					}

					if (!traceTile.isTransparent()) {
						break;
						blocked = true;
					}
				}
				// if (!blocked) {
				// 	tile.hasLineOfSight = true;
				// }
			}
			floorPlan.get(this.x, this.y).hasLineOfSight = true;
		}
	}

	calculateSight(floorPlan) {
		for (let tile of floorPlan.tiles) {
			tile.visible = tile.hasLineOfSight && tile.hasSufficientLight();
			tile.hasBeenSeen = tile.hasBeenSeen || tile.visible;
		}
	}

	move(dx, dy, floorPlan) {
		let newX = this.x + dx;
		let newY = this.y + dy;
		let newTile = floorPlan.get(newX, newY);
		if (newTile === null || newTile === undefined) {
			return false;
		}
		if (newTile.isEnterable()) {
			this.x = newX;
			this.y = newY;
			newTile.onEnter(this);
			return true;
		}
		return false;
	}

}