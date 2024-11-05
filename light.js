const LIGHT_FALL_OFF = 0.88;
const LIGHT_THRESHOLD = 0.1;
const MAX_LIGHT_DISTANCE = 10;

class LightSource {
	constructor(color, flicker) {
		this.color = color;
		this.flicker = flicker;
		this.flickerFactor = 0.95;
	}

	updateFlickerFactor() {
		this.flickerFactor = (Math.random() * this.flicker + (1 - this.flicker)) ** 2;
	}	

	getLight() {
		return color(this.color._getRed() * this.flickerFactor, this.color._getGreen() * this.flickerFactor, this.color._getBlue() * this.flickerFactor);
	}

}

function updateLight(floorplan, player) {
	// reset light
	for (let tile of floorplan.tiles) {
		tile.light = color(0, 0, 0);
	}
	// for each lamp, cast light
	for (let tile of floorplan.tiles) {
		if (tile.isLit()) {
			updateLightFromTile(floorplan, tile);
		}
	}
}

function updateLightFromTile(floorplan, tile) {
	for (let x = tile.x - MAX_LIGHT_DISTANCE; x <= tile.x + MAX_LIGHT_DISTANCE; x++) {
		for (let y = tile.y - MAX_LIGHT_DISTANCE; y <= tile.y + MAX_LIGHT_DISTANCE; y++) {
			let distance = Math.sqrt((x - tile.x) ** 2 + (y - tile.y) ** 2);
			if (distance > MAX_LIGHT_DISTANCE) {
				continue;
			}
			let dx = x - tile.x;
			let dy = y - tile.y;
			let angle = Math.atan2(dy, dx);
			// trace a ray from the target tile to the lamp
			let light = tile.lightSource.getLight();
			blocked = false;
			for (let d = 0; d <= distance; d++) {
				let xx = Math.floor(tile.x + Math.cos(angle) * d);
				let yy = Math.floor(tile.y + Math.sin(angle) * d);
				if (dx < 0) {
					xx = Math.ceil(tile.x + Math.cos(angle) * d);
				}
				if (dy < 0) {
					yy = Math.ceil(tile.y + Math.sin(angle) * d);
				}
				let traceTile = floorplan.get(xx, yy);
				if (!traceTile.isTransparent()) {
					blocked = true;
					break;
				}
			}
			if (!blocked) {
				let floorTile = floorplan.get(x, y);
				let existingLight = floorTile.light;
				floorTile.light = color(existingLight._getRed() + light._getRed() * LIGHT_FALL_OFF ** distance, existingLight._getGreen() + light._getGreen() * LIGHT_FALL_OFF ** distance, existingLight._getBlue() + light._getBlue() * LIGHT_FALL_OFF ** distance);
			}
		}

		// mark all non-transparent tiles as having light if they are adjacent to a trasparent tile with light. The light should be the average of the adjacent lights.
		for (let tile of floorplan.tiles) {
			if (!tile.isTransparent()) {
				let neighbors = floorplan.getNeighbors(tile.x, tile.y);
				let neighborCount = 0;
				let red = 0;
				let green = 0;
				let blue = 0;
				for (let neighbor of neighbors) {
					let neighborTile = floorplan.get(neighbor.x, neighbor.y);
					if (!neighborTile.isTransparent(gameState.player) || !neighborTile.hasLineOfSight) {
						continue;
					}					
					let d1 = Math.sqrt((neighborTile.x - gameState.player.x) ** 2 + (neighborTile.y - gameState.player.y) ** 2);
					let d2 = Math.sqrt((tile.x - gameState.player.x) ** 2 + (tile.y - gameState.player.y) ** 2);
					if (d1 < d2) {
						red += neighborTile.light._getRed();
						green += neighborTile.light._getGreen();
						blue += neighborTile.light._getBlue();
						neighborCount++;
					}
				}
				if (neighborCount > 0) {
					tile.light = color(red / neighborCount, green / neighborCount, blue / neighborCount);
				}
			}
		}
	}
}