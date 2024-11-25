const LIGHT_FALL_OFF = 0.85;
const LIGHT_THRESHOLD = 150;
const MAX_LIGHT_DISTANCE = 20;
const MEMORY_LIGHT = [50, 50, 90];

let globalFlickerFactor = 0;

let fallOffValues = [];

class LightSource {
	constructor(color, flicker) {
		this.color = color;
		this.flicker = flicker;
		this.flickerFactor = 0.95;

		this.cache = new Array(MAP_WIDTH * MAP_HEIGHT);
		for (let i = 0; i < this.cache.length; i++) {
			this.cache[i] = [0, 0, 0];
		}

		this.hasLineOfSight = new Array(MAP_WIDTH * MAP_HEIGHT);
		for (let i = 0; i < this.hasLineOfSight.length; i++) {
			this.hasLineOfSight[i] = false;
		}

		this.isDirty = true;
	}

	updateFlickerFactor() {
		this.flickerFactor = (Math.random() * this.flicker + (1 - this.flicker)) ** 2;
	}	

	getLight() {
		return [this.color[0] * this.flickerFactor, this.color[1] * this.flickerFactor, this.color[2] * this.flickerFactor];
	}

}

let playerLightSource;

function subtractLight(floorplan, lightSource) {
	for (let tile of floorplan.tiles) {
		if (tile && tile.isTransparent()) {
			tile.light[0] -= lightSource.cache[tile.x + tile.y * MAP_WIDTH][0];
			tile.light[1] -= lightSource.cache[tile.x + tile.y * MAP_WIDTH][1];
			tile.light[2] -= lightSource.cache[tile.x + tile.y * MAP_WIDTH][2];
		}
	}
}

function updateLight(floorplan, player, refreshAll = false) {
	let allLightSources = [];
	// cast player's torchlight
	subtractLight(floorplan, playerLightSource);
	updateLightFromPosition(floorplan, player.x, player.y, playerLightSource);
	allLightSources.push(playerLightSource);

	// for each lamp, cast light
	for (let tile of floorplan.tiles) {
		if (tile && tile.isLit()) {
			allLightSources.push(tile.lightSource);
			if (refreshAll || tile.lightSource.isDirty) {
				subtractLight(floorplan, tile.lightSource);
				updateLightFromPosition(floorplan, tile.x, tile.y, tile.lightSource);
				tile.lightSource.isDirty = false;
			}
		}
	}

	for (let monster of gameState.currentFloor().monsters) {
		if (monster.lightSource) {
			allLightSources.push(monster.lightSource);
			if (refreshAll || monster.lightSource.isDirty) {
				subtractLight(floorplan, monster.lightSource);
				updateLightFromPosition(floorplan, monster.x, monster.y, monster.lightSource);
				monster.lightSource.isDirty = false;
			}
		}
	}

	// for (let tile of floorplan.tiles) {
	// 	let totalRed = 0;
	// 	let totalGreen = 0;
	// 	let totalBlue = 0;
	// 	for (let lightSource of allLightSources) {
	// 		if (!lightSource.cache[tile.x + tile.y * MAP_WIDTH]) {
	// 			// console.log("no cache for tile", tile.x, tile.y);
	// 			continue;
	// 		}
	// 		let r = lightSource.cache[tile.x + tile.y * MAP_WIDTH][0] * lightSource.flickerFactor;
	// 		let g = lightSource.cache[tile.x + tile.y * MAP_WIDTH][1] * lightSource.flickerFactor;
	// 		let b = lightSource.cache[tile.x + tile.y * MAP_WIDTH][2] * lightSource.flickerFactor;
	// 		totalRed += r;
	// 		totalGreen += g;
	// 		totalBlue += b;
	// 	}
	// 	tile.light = [totalRed, totalGreen, totalBlue];
	// }

	//mark all non-transparent tiles as having light if they are adjacent to a transparent tile with light. The light should be the average of the adjacent lights.
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
					red += neighborTile.light[0];
					green += neighborTile.light[1];
					blue += neighborTile.light[2];
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
	// reset lightSource cache
	for (let i = 0; i < lightSource.cache.length; i++) {
		lightSource.cache[i] = [0, 0, 0];
		lightSource.hasLineOfSight[i] = false;
	}
	// compute LOS from light source position
	let viz = new MRPAS(
		(x, y) => { return !floorplan.get(x, y).isTransparent(); },
		(x, y) => { lightSource.hasLineOfSight[x + y * MAP_WIDTH] = true; },
		(x, y) => { return lightSource.hasLineOfSight[x + y * MAP_WIDTH]; },
		(x, y) => { return Math.sqrt(x ** 2 + y ** 2); }
	);
	viz.compute([lightX, lightY], MAX_LIGHT_DISTANCE);
	for (let x = lightX - MAX_LIGHT_DISTANCE; x <= lightX + MAX_LIGHT_DISTANCE; x++) {
		for (let y = lightY - MAX_LIGHT_DISTANCE; y <= lightY + MAX_LIGHT_DISTANCE; y++) {
			let distance = Math.floor(Math.sqrt((x - lightX) ** 2 + (y - lightY) ** 2));
			if (distance > MAX_LIGHT_DISTANCE) {
				continue;
			}	
			if (lightSource.hasLineOfSight[x + y * MAP_WIDTH]) {
				let light = lightSource.color;
				let r = light[0];
				let g = light[1];
				let b = light[2];
				lightSource.cache[x + y * MAP_WIDTH] = [r * fallOffValues[distance], g * fallOffValues[distance], b * fallOffValues[distance]];
				let tile = floorplan.get(x, y);
				tile.light[0] += r * fallOffValues[distance];
				tile.light[1] += g * fallOffValues[distance];
				tile.light[2] += b * fallOffValues[distance];
			}
		}
	}
}