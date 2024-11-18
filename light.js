const LIGHT_FALL_OFF = 0.88;
const LIGHT_THRESHOLD = 0.3;
const MAX_LIGHT_DISTANCE = 20;
const MEMORY_LIGHT = 40;

let fallOffValues = [];

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
		return [this.color[0] * this.flickerFactor, this.color[1] * this.flickerFactor, this.color[2] * this.flickerFactor];
	}

}

let playerLightSource;

function updateLight(floorplan, player) {
	// reset light
	for (let tile of floorplan.tiles) {
		if (tile) {
			tile.light = color(0, 0, 0);
		}
	}
	// cast player's torchlight
	updateLightFromPosition(floorplan, player.x, player.y, playerLightSource);

	// for each lamp, cast light
	for (let tile of floorplan.tiles) {
		if (tile && tile.isLit()) {
			updateLightFromPosition(floorplan, tile.x, tile.y, tile.lightSource);
		}
	}

	for (let monster of gameState.currentFloor().monsters) {
		if (monster.lightSource) {
			updateLightFromPosition(floorplan, monster.x, monster.y, monster.lightSource);
		}
	}

	// mark all non-transparent tiles as having light if they are adjacent to a transparent tile with light. The light should be the average of the adjacent lights.
	for (let tile of floorplan.tiles) {
		if (!tile.isTransparent() && tile.hasLineOfSight) {
			let neighbors = floorplan.getNeighbors(tile.x, tile.y);
			let neighborCount = 0;
			let red = 0;
			let green = 0;
			let blue = 0;
			for (let neighbor of neighbors) {
				let neighborTile = floorplan.get(neighbor.x, neighbor.y);
				if (!neighborTile.isTransparent() || !neighborTile.hasLineOfSight) {
					continue;
				}					
				// tile.light = neighborTile.light;
				// break;
				let d1 = (neighborTile.x - gameState.player.x) ** 2 + (neighborTile.y - gameState.player.y) ** 2;
				let d2 = (tile.x - gameState.player.x) ** 2 + (tile.y - gameState.player.y) ** 2;
				if (d1 < d2) {
					red += neighborTile.light._getRed();
					green += neighborTile.light._getGreen();
					blue += neighborTile.light._getBlue();
					neighborCount++;
				}
			}
			if (neighborCount > 0) {
				tile.light = [red / neighborCount, green / neighborCount, blue / neighborCount];
			}
		}
	}
}

function updateLightFromPosition(floorplan, lightX, lightY, lightSource) {
	for (let x = lightX - MAX_LIGHT_DISTANCE; x <= lightX + MAX_LIGHT_DISTANCE; x++) {
		for (let y = lightY - MAX_LIGHT_DISTANCE; y <= lightY + MAX_LIGHT_DISTANCE; y++) {
			let distance = Math.sqrt((x - lightX) ** 2 + (y - lightY) ** 2);
			if (distance > MAX_LIGHT_DISTANCE) {
				continue;
			}
			let dx = x - lightX;
			let dy = y - lightY;
			let angle = Math.atan2(dy, dx);
			// trace a ray from the target tile to the lamp
			let light = lightSource.getLight();
			blocked = false;
			for (let d = 0; d <= distance; d++) {
				let xx = Math.floor(lightX + Math.cos(angle) * d);
				let yy = Math.floor(lightY + Math.sin(angle) * d);
				if (dx < 0) {
					xx = Math.ceil(lightX + Math.cos(angle) * d);
				}
				if (dy < 0) {
					yy = Math.ceil(lightY + Math.sin(angle) * d);
				}
				let traceTile = floorplan.get(xx, yy);
				if (traceTile != null && traceTile != undefined && !traceTile.isTransparent()) {
					blocked = true;
					break;
				}
			}
			if (!blocked) {
				let floorTile = floorplan.get(x, y);
				if (floorTile != null) {
					let existingLight = floorTile.light;
					floorTile.light = [existingLight[0] + light[0] * fallOffValues[Math.round(distance)], existingLight[1] + light[1] * fallOffValues[Math.round(distance)], existingLight[2] + light[2] * fallOffValues[Math.round(distance)]];
				}
			}
		}


	}
}