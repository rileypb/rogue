function lerpArray(a, b, t) {
	return [a[0] * (1 - t) + b[0] * t, a[1] * (1 - t) + b[1] * t, a[2] * (1 - t) + b[2] * t];
}

function arrayToColor(a) {
	return color(a);
}

class Tile {
	constructor(x, y) {
		if (x >= MAP_WIDTH || y >= MAP_HEIGHT || x < 0 || y < 0) {
			console.log("Tile out of bounds: " + x + ", " + y);
		}
		this.x = x;
		this.y = y;

		this.light = 0;
		this.feature = null;

		this.hasBeenSeen = false;
		this.visible = false;
		this.hasLineOfSight = false;

		this.isSpecial = false;

		this.bevelNE = false;
		this.bevelSE = false;
		this.bevelSW = false;
		this.bevelNW = false;

		this.rendered = false;

	}

	getDescription() {
		return "a void";
	}

	render() {
		// Do nothing
	}

	isSquare() {
		return false;
	}

	getLight() {
		return this.light;
	}

	getColor() {
		return this.light;
	}

	getBaseColor() {
		return [0, 0, 0];
	}

	getReflectiveness() {
		return 0.5;
	}

	getSpecularity() {
		return 1;
	}

	avoidOnPathfinding() {
		return false;
	}

	updateFlickerFactor() {
		// Do nothing
	}

	isEnterable(player) {
		return false;
	}

	isLeavable(player) {
		return false;
	}

	isTransparent() {
		return false;
	}

	isLit(player) {
		return false;
	}

	isSticky(player) {
		return false;
	}

	isFlyable(player) {
		return false;
	}

	isSwimmable(player) {
		return false;
	}

	hasSufficientLight() {
		return this.light > LIGHT_THRESHOLD;
	}

	onEnter(player) {
		// assume not water, reset timeUnderwater
		player.timeUnderwater = 0;
	}

	onLeave(player) {
		// Do nothing
	}

	onStay(player) {
		// Do nothing
	}

	drawDefaultBackground() {
		return this.drawDefaultBackground2();
		let f = gameState.currentFloor();
		let colors = [
			[ f.getColor(this.x - 1, this.y - 1), 
				f.getColor(this.x, this.y - 1),
				f.getColor(this.x + 1, this.y - 1)
			],
			[ f.getColor(this.x - 1, this.y),
				f.getColor(this.x, this.y),
				f.getColor(this.x + 1, this.y)
			],
			[ f.getColor(this.x - 1, this.y + 1),
				f.getColor(this.x, this.y + 1),
				f.getColor(this.x + 1, this.y + 1)
			]
		];
		let cornerColors = [ lerpArray(lerpArray(colors[0][0], colors[1][1], 0.5), lerpArray(colors[1][0], colors[0][1], 0.5), 0.5),
								lerpArray(lerpArray(colors[0][1], colors[1][2], 0.5), lerpArray(colors[1][1], colors[0][2], 0.5), 0.5),
								lerpArray(lerpArray(colors[1][0], colors[2][1], 0.5), lerpArray(colors[2][0], colors[1][1], 0.5), 0.5),
								lerpArray(lerpArray(colors[1][1], colors[2][2], 0.5), lerpArray(colors[2][1], colors[1][2], 0.5), 0.5)
		];
				// let cornerColors = [ lerpColor(lerpColor(colors[0][0], colors[1][1], 0.5), lerpColor(colors[1][0], colors[0][1], 0.5), 0.5),
				// 				lerpColor(lerpColor(colors[0][1], colors[1][2], 0.5), lerpColor(colors[1][1], colors[0][2], 0.5), 0.5),
				// 				lerpColor(lerpColor(colors[1][0], colors[2][1], 0.5), lerpColor(colors[2][0], colors[1][1], 0.5), 0.5),
				// 				lerpColor(lerpColor(colors[1][1], colors[2][2], 0.5), lerpColor(colors[2][1], colors[1][2], 0.5), 0.5)

		beginShape(TESS);
		fill(arrayToColor(cornerColors[0]));
		noStroke();
		vertex(this.x * GRID_SIZE_X, this.y * GRID_SIZE_Y);
		fill(arrayToColor(cornerColors[1]));
		vertex((this.x + 1) * GRID_SIZE_X, this.y * GRID_SIZE_Y);
		fill(arrayToColor(cornerColors[3]));
		vertex((this.x + 1) * GRID_SIZE_X, (this.y + 1) * GRID_SIZE_Y);
		fill(arrayToColor(cornerColors[2]));
		vertex(this.x * GRID_SIZE_X, (this.y + 1) * GRID_SIZE_Y);
		endShape(CLOSE);
	}

	drawDefaultBackground2() {
		let f = gameState.currentFloor();
		let colors = [
			[ f.getAdaptiveColor(this.x - 1, this.y - 1, this.x,this.y), 
				f.getAdaptiveColor(this.x, this.y - 1, this.x,this.y),
				f.getAdaptiveColor(this.x + 1, this.y - 1, this.x,this.y)
			],
			[ f.getAdaptiveColor(this.x - 1, this.y, this.x,this.y),
				f.getAdaptiveColor(this.x, this.y, this.x,this.y),
				f.getAdaptiveColor(this.x + 1, this.y, this.x,this.y)
			],
			[ f.getAdaptiveColor(this.x - 1, this.y + 1, this.x,this.y),
				f.getAdaptiveColor(this.x, this.y + 1, this.x,this.y),
				f.getAdaptiveColor(this.x + 1, this.y + 1, this.x,this.y)
			]
		];
		let cornerColors = [ lerpArray(lerpArray(colors[0][0], colors[1][1], 0.5), lerpArray(colors[1][0], colors[0][1], 0.5), 0.5),
								lerpArray(lerpArray(colors[0][1], colors[1][2], 0.5), lerpArray(colors[1][1], colors[0][2], 0.5), 0.5),
								lerpArray(lerpArray(colors[1][0], colors[2][1], 0.5), lerpArray(colors[2][0], colors[1][1], 0.5), 0.5),
								lerpArray(lerpArray(colors[1][1], colors[2][2], 0.5), lerpArray(colors[2][1], colors[1][2], 0.5), 0.5)
		];
		beginShape(TESS);
		fill(arrayToColor(cornerColors[0]));
		// if (this instanceof Floor && this.material == FLOOR_MATERIAL_TILE) {
		// 	stroke(0);
		// } else {
			noStroke();
		// }
		vertex(this.x * GRID_SIZE_X, this.y * GRID_SIZE_Y + 2);
		fill(arrayToColor(cornerColors[1]));
		vertex((this.x + 1) * GRID_SIZE_X, this.y * GRID_SIZE_Y + 2);
		fill(arrayToColor(cornerColors[3]));
		vertex((this.x + 1) * GRID_SIZE_X, (this.y + 1) * GRID_SIZE_Y + 2);
		fill(arrayToColor(cornerColors[2]));
		vertex(this.x * GRID_SIZE_X, (this.y + 1) * GRID_SIZE_Y + 2);
		endShape(CLOSE);
	}

}


class FloorPlan {
	NATURAL = 0;
	DUNGEON = 1;
	MIX = 2;
	ONE_ROOM = 3;
	RANDOM_WALLS = 4;
	CASTLE = 5;

	constructor(width, height, floor) {
		this.width = width;
		this.height = height;
		this.floor = floor;
		this.tiles = new Array(width * height);

		for (let x = 0; x < width; x++) {
			for (let y = 0; y < height; y++) {
				this.set(x, y, new Floor(x, y));
			}
		}
		this.floorIndex = 0;
		this.type = this.NATURAL;

		this.monsters = [];
	}

	get(x, y) {
		return this.tiles[x + y * this.width];
	}

	set(x, y, tile) {
		this.tiles[x + y * this.width] = tile;
	}

	getNeighbors(x, y) {
		let neighbors = [];
		// include diagonals
		for (let dx = -1; dx <= 1; dx++) {
			for (let dy = -1; dy <= 1; dy++) {
				if (dx == 0 && dy == 0) {
					continue;
				}
				let xx = x + dx;
				let yy = y + dy;
				if (xx >= 0 && xx < this.width && yy >= 0 && yy < this.height) {
					neighbors.push({ x: xx, y: yy });
				}
			}
		}
		return neighbors;
	}

	getColor(x, y) {
		if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
			return [0, 0, 0];
		}
		if (!this.get(x, y).visible) {
			return [0, 0, 0];
		}
		if (this.get(x, y) instanceof Lava || this.get(x, y) instanceof Water) {
			let l = this.get(x, y).getLight();
			let resultingLight;
			if (this.get(x, y).isLit()) {
				resultingLight = l + this.get(x,y).lightSource.flickerFactor;
			} else {
				resultingLight = l;
			}
			if (this.get(x, y) instanceof Lava) {
				return [resultingLight, 0, 0];
			} else {
				colorMode(HSB);
				let scaled = resultingLight/128;
				let squared = scaled * scaled;
				let brightness = 100 * squared;
				let c = color(240, 50, brightness);
				colorMode(RGB);
				return [c._getRed(), c._getGreen(), c._getBlue()];
			}
		} 

		let l = color(this.get(x, y).getLight());
		let c = color(this.get(x, y).getBaseColor());
		colorMode(HSB);
		let brightness = l._getBrightness() + globalFlickerFactor;
		let h = hue(c);
		let final = color(h, saturation(c), brightness);
		colorMode(RGB);
		return [final._getRed(), final._getGreen(), final._getBlue()];
	}

	getAdaptiveColor(x, y, cx, cy) {
		let thisIsSquare = this.isSquare(x, y);
		let centerIsSquare = this.isSquare(cx, cy);
		let thisIsVisible = this.isVisible(x, y);
		let centerIsVisible = this.isVisible(cx, cy);
		if (((thisIsSquare && thisIsVisible) || (centerIsSquare && centerIsVisible))) {
			let b1 = this.getLight(x, y);
			let reflectiveness = this.getReflectiveness(x, y);
			let specularity = this.getSpecularity(x, y);
			b1 = (b1/100) ** specularity * 100;
			b1 = b1 * reflectiveness;
			let baseColor = color(this.getBaseColor(cx, cy));
			colorMode(HSB);
			let h = hue(baseColor);
			let s = saturation(baseColor);
			let c2 = color(h, s, b1);
			colorMode(RGB);
			return [c2._getRed(), c2._getGreen(), c2._getBlue()];
		}

		return this.getColor(x, y);
	}

	getReflectiveness(x, y) {
		if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
			return 0;
		}
		return this.get(x, y).getReflectiveness();
	}

	getSpecularity(x, y) {
		if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
			return 1;
		}
		return this.get(x, y).getSpecularity();
	}

	isVisible(x, y) {
		if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
			return false;
		}
		return this.get(x, y).visible;
	}

	getLight(x, y) {
		if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
			return 0;
		}
		return this.get(x, y).getLight();
	}

	getBaseColor(x, y) {
		if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
			return [0, 0, 0];
		}
		return this.get(x, y).getBaseColor();
	}

	isSquare(x, y) {
		if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
			return true;
		}
		let tile = this.get(x, y);
		if (!tile.visible) {
			return false;
		}
		return tile.isSquare();
	}


	updateFlicker() {
		for (let tile of this.tiles) {
			tile.updateFlickerFactor();
		}
	}

	generate() {
		switch (this.type) {
			case this.NATURAL:
				this.generateNatural();
				break;
			case this.DUNGEON:
				this.generateDungeon();
				break;
			case this.MIX:
				this.generateMix();
				break;
			case this.ONE_ROOM:
				this.generateOneRoom();
				break;
			case this.RANDOM_WALLS:
				this.generateRandomWalls();
				break;
			case this.CASTLE:
				generateCastle(this);
				break;
		}
	}

	generateNatural() {
		// fill with wall tiles
		for (let x = 0; x < this.width; x++) {
			for (let y = 0; y < this.height; y++) {
				this.tiles[x + y * this.width] = new Wall(x, y);
			}
		}

		// carve out some rooms in the form of ellipses.
		let roomCount = Math.floor(Math.random() * 15) + 40;
		for (let i = 0; i < roomCount; i++) {
			let x = Math.floor(Math.random() * this.width);
			let y = Math.floor(Math.random() * this.height);
			let dx = Math.floor(Math.random() * 6) + 1;
			let dy = Math.floor(Math.random() * 6) + 1;
			let xSpace = Math.min(x, this.width - x);
			let ySpace = Math.min(y, this.height - y);
			if (dx > xSpace) {
				dx = xSpace - 1;
			}
			if (dy > ySpace) {
				dy = ySpace - 1;
			}
			let isLava = Math.random() < 0.3;
			let isWater = Math.random() < 0.3;
			let xPow = Math.floor(Math.random() * 3) + 2;
			let yPow = Math.floor(Math.random() * 3) + 2;
			let materialIndex = Math.floor(Math.random() * 7);

			let materialChanged = false;
			for (let xx = x - 1; xx < x + 1; xx++) {
				for (let yy = y - 1; yy < y + 1; yy++) {
					if (xx < 1 || xx >= this.width - 1 || yy < 1 || yy >= this.height - 1) {
						continue;
					}
					if (this.tiles[x + y * this.width] instanceof Floor) {
						materialIndex = this.tiles[x + y * this.width].material;
						materialChanged = true;
						break;
					}
				}
				if (materialChanged) {
					break;
				}
			}
			for (let xx = x - dx; xx < x + dx; xx++) {
				for (let yy = y - dy; yy < y + dy; yy++) {
					if (xx < 1 || xx >= this.width - 1 || yy < 1 || yy >= this.height - 1) {
						continue;
					}
					if ((xx - x) ** xPow / dx ** xPow + (yy - y) ** yPow / dy ** yPow < 1) {
						if (Math.random() < 0.002) {
							this.tiles[xx + yy * this.width] = new Lamp(xx, yy, Math.random() * 128 + 64);
						} else {
							if (isLava) {
								this.tiles[xx + yy * this.width] = new Lava(xx, yy);
							} else if (isWater) {
								this.tiles[xx + yy * this.width] = new Water(xx, yy, 1);
							} else {
								this.tiles[xx + yy * this.width] = new Floor(xx, yy, materialIndex);
							}
						}
					}
				}
			}
		}



		// connect it all with corridors
		// find the connected components
		let components = [];
		let used = [];
		for (let y = 0; y < this.height; y++) {
			for (let x = 0; x < this.width; x++) {
				if (this.get(x, y) === null) {
					continue;
				}
				if (this.get(x, y).isEnterable() && !used.includes(this.get(x, y))) {
					let component = [];
					let stack = [{ x: x, y: y }];
					while (stack.length > 0) {
						let current = stack.pop();
						if (!this.get(current.x, current.y)) {
							continue;
						}
						if (used.includes(this.get(current.x, current.y))) {
							continue;
						}
						if (this.get(current.x, current.y).isEnterable()) {
							component.push(current);
							// map.set(current.x, current.y, null);
							used.push(this.get(current.x, current.y));
							stack.push({ x: current.x + 1, y: current.y });
							stack.push({ x: current.x - 1, y: current.y });
							stack.push({ x: current.x, y: current.y + 1 });
							stack.push({ x: current.x, y: current.y - 1 });
						}
					}
					components.push(component);
				}

			}
		}
		// connect the components
		for (let i = 0; i < components.length - 1; i++) {
			let a = components[i][Math.floor(Math.random() * components[i].length)];
			let b = components[i + 1][Math.floor(Math.random() * components[i + 1].length)];
			let x = a.x;
			let y = a.y;
			if (a.x == b.x || a.y == b.y) {
				a = components[i][Math.floor(Math.random() * components[i].length)];
				b = components[i + 1][Math.floor(Math.random() * components[i + 1].length)];
				x = a.x;
				y = a.y;
			}

			while (x != b.x || y != b.y) {
				if (this.get(x,y) && !this.get(x, y).isEnterable()) {
					this.set(x, y, new Floor(x, y));
				}
				// // allow meandering corridors
				// if (y == b.y && Math.random() < 0.5 && Math.abs(x - b.x) > 4) {
				// 	if (Math.random() < 0.5) {
				// 		y--;
				// 	} else {
				// 		y++;
				// 	}
				// } else if (x == b.x && Math.random() < 0.5 && Math.abs(y - b.y) > 4) {
				// 	if (Math.random() < 0.5) {
				// 		x--;
				// 	} else {
				// 		x++;
				// 	}
				// } else 
				if (Math.random() < 0.1) {
					let selector = Math.random();
					if (selector < 0.25 && this.get(x + 1, y)) {
						x++;
					} else if (selector < 0.5 && this.get(x - 1, y)) {
						x--;
					} else if (selector < 0.75 && this.get(x, y + 1)) {
						y++;
					} else if (this.get(x, y - 1)) {
						y--;
					}
				} else if (Math.random() < 0.5) {
					if (x < b.x) {
						x++;
					} else if (x > b.x) {
						x--;
					} else if (y < b.y) {
						y++;
					} else if (y > b.y) {
						y--;
					}
				}
				else {
					if (y < b.y) {
						y++;
					} else if (y > b.y) {
						y--;
					} else if (x < b.x) {
						x++;
					} else if (x > b.x) {
						x--;
					}
				}
			}
		}

		// add some monsters
		let monsterCount = Math.floor(Math.random() * 10) + 10;
		for (let i = 0; i < monsterCount; i++) {
			let x = Math.floor(Math.random() * this.width);
			let y = Math.floor(Math.random() * this.height);
			while (!this.get(x, y).isEnterable()) {
				x = Math.floor(Math.random() * this.width);
				y = Math.floor(Math.random() * this.height);
			}
			this.monsters.push(new Goblin(x, y));
		}

	}

	generateOneRoom() {
		// fill with floor tiles
		for (let x = 0; x < this.width; x++) {
			for (let y = 0; y < this.height; y++) {
				this.tiles[x + y * this.width] = new Floor(x, y);
			}
		}
		// bound the room with walls
		for (let x = 0; x < this.width; x++) {
			this.tiles[x] = new Wall(x, 0);
			this.tiles[x + (this.height - 1) * this.width] = new Wall(x, this.height - 1);
		}
		for (let y = 0; y < this.height; y++) {
			this.tiles[y * this.width] = new Wall(0, y);
			this.tiles[(this.width - 1) + y * this.width] = new Wall(this.width - 1, y);
		}

		// place a lamp in the center
		let x = Math.floor(this.width / 2);
		let y = Math.floor(this.height / 2);
		this.tiles[x + y * this.width] = new Lamp(x, y, 192);
		// x = Math.floor(2*this.width / 3) - 8;
		// y = Math.floor(2*this.height / 3) - 2;
		// this.tiles[x + y * this.width] = new Lamp(x, y, color(255, 255, 0));

		// place a wall near the lamp
		// x = Math.floor(this.width / 2) + 2;
		// y = Math.floor(this.height / 2) + 2;
		// this.tiles[x + y * this.width] = new Wall(x, y);
		// this.tiles[x + (y + 1) * this.width] = new Wall(x, y + 1);
		// this.tiles[x + (y + 2) * this.width] = new Wall(x, y + 2);
		// this.tiles[x + (y + 3) * this.width] = new Wall(x, y + 3);
		// this.tiles[x + (y + 4) * this.width] = new Wall(x, y + 4);
		// this.tiles[x + (y + 5) * this.width] = new Wall(x, y + 5);
		// this.tiles[x + (y + 5) * this.width].isSpecial = true;
		// // and near the other lamp
		// x = Math.floor(2 * this.width / 3) - 6;
		// y = Math.floor(2 * this.height / 3) - 3;
		// while (x < 0) {
		// 	x++;
		// }
		// while (y < 0) {
		// 	y++;
		// }
		// this.tiles[x + y * this.width] = new Wall(x, y);
		// this.tiles[x + (y - 1) * this.width] = new Wall(x, y - 1);
		// this.tiles[x + (y - 2) * this.width] = new Wall(x, y - 2);
		// this.tiles[x + (y - 3) * this.width] = new Wall(x, y - 3);
	}

	generateRandomWalls() {
		// fill with floor tiles
		for (let x = 0; x < this.width; x++) {
			for (let y = 0; y < this.height; y++) {
				this.tiles[x + y * this.width] = new Floor(x, y);
			}
		}
		// bound the room with walls
		for (let x = 0; x < this.width; x++) {
			this.tiles[x] = new Wall(x, 0, Wall.WOOD);
			this.tiles[x + (this.height - 1) * this.width] = new Wall(x, this.height - 1, Wall.WOOD);
		}
		for (let y = 0; y < this.height; y++) {
			this.tiles[y * this.width] = new Wall(0, y, Wall.WOOD);
			this.tiles[(this.width - 1) + y * this.width] = new Wall(this.width - 1, y, Wall.WOOD);
		}
		// create 10 walls of lengths 1-6
		for (let i = 0; i < 40; i++) {
			let x = Math.floor(Math.random() * this.width);
			let y = Math.floor(Math.random() * this.height);
			let dx = Math.floor(Math.random() * 6) + 1;
			let dy = Math.floor(Math.random() * 6) + 1;
			if (x + dx >= this.width) {
				dx = this.width - x - 1;
			}
			if (y + dy >= this.height) {
				dy = this.height - y - 1;
			}
			for (let xx = x; xx < x + dx; xx++) {
				for (let yy = y; yy < Math.min(this.height, y + dy); yy++) {
					this.set(xx, yy, new Wall(xx, yy, Wall.WOOD));
				}
			}
		}
		// //create 5 random lamps
		// for (let i = 0; i < 5; i++) {
		// 	let x = Math.floor(Math.random() * this.width);
		// 	let y = Math.floor(Math.random() * this.height);
		// 	while (!this.get(x, y).isEnterable()) {
		// 		x = Math.floor(Math.random() * this.width);
		// 		y = Math.floor(Math.random() * this.height);
		// 	}
		// 	this.tiles[x + y * this.width] = new Lamp(x, y, color(Math.round(Math.random() * 255), Math.round(Math.random() * 255), Math.round(Math.random() * 255)));
		// }

		// add one irregularly shaped pool of lava of around 8 spaces
		let x = Math.floor(Math.random() * this.width);
		let y = Math.floor(Math.random() * this.height);
		let dx = Math.floor(Math.random() * 6) + 1;
		let dy = Math.floor(Math.random() * 6) + 1;
		for (let xx = x; xx < x + dx; xx++) {
			for (let yy = y; yy < Math.min(this.height, y + dy); yy++) {
				let radius = Math.floor(Math.random() * 4) + 2;
				if (xx - radius < 0) {
					radius = xx;
				}
				if (yy - radius < 0) {
					radius = yy;
				}
				if (xx + radius >= this.width) {
					radius = this.width - xx - 1;
				}
				if (yy + radius >= this.height) {
					radius = this.height - yy - 1;
				}
				for (let xxx = xx - radius; xxx < xx + radius; xxx++) {
					for (let yyy = yy - radius; yyy < yy + radius; yyy++) {
						if ((xxx - xx) ** 2 + (yyy - yy) ** 2 < radius ** 2) {

							if (this.tiles[xxx + yyy * this.width] instanceof Floor) {
								this.tiles[xxx + yyy * this.width] = new Lava(xxx, yyy);
							}
						}
					}
				}
			}
		}

		// add one irregularly shaped pool of water of around 8 spaces
		x = Math.floor(Math.random() * this.width);
		y = Math.floor(Math.random() * this.height);
		dx = Math.floor(Math.random() * 6) + 1;
		dy = Math.floor(Math.random() * 6) + 1;
		for (let xx = x; xx < x + dx; xx++) {
			for (let yy = y; yy < Math.min(this.height, y + dy); yy++) {
				if (this.tiles[xx + yy * this.width] instanceof Floor) {
					this.tiles[xx + yy * this.width] = new Water(xx, yy, 1);
				}
			}
		}
		// add one ellipse shaped pool of water of around 8 spaces
		x = Math.floor(Math.random() * this.width);
		y = Math.floor(Math.random() * this.height);
		dx = Math.floor(Math.random() * 6) + 1;
		dy = Math.floor(Math.random() * 6) + 1;
		if (x - dx < 0) {
			dx = x;
		}
		if (y - dy < 0) {
			dy = y;
		}
		for (let xx = x - dx; xx < x + dx; xx++) {
			for (let yy = y - dy; yy < Math.min(this.height, y + dy); yy++) {
				if ((xx - x) ** 2 / dx ** 2 + (yy - y) ** 2 / dy ** 2 < 1) {
					// create a disk of water of radius 1-3.
					let radius = Math.floor(Math.random() * 4) + 2;
					if (xx - radius < 0) {
						radius = xx;
					}
					if (yy - radius < 0) {
						radius = yy;
					}
					if (xx + radius >= this.width) {
						radius = this.width - xx - 1;
					}
					if (yy + radius >= this.height) {
						radius = this.height - yy - 1;
					}
					for (let xxx = xx - radius; xxx < xx + radius; xxx++) {
						for (let yyy = yy - radius; yyy < yy + radius; yyy++) {
							if ((xxx - xx) ** 2 + (yyy - yy) ** 2 < radius ** 2) {
								if (this.tiles[xxx + yyy * this.width] instanceof Floor) {
									this.tiles[xxx + yyy * this.width] = new Water(xxx, yyy, 1);
								}
							}
						}
					}
					// this.tiles[xx + yy * this.width] = new Water(xx, yy, 1);
				}
			}
		}
	}


}

class Wall extends Tile {
	STONE = 0;
	WOOD = 1;
	METAL = 2;

	constructor(x, y, kind) {
		super(x, y);

		this.kind = kind;
	}

	getDescription() {
		return 'a wall';
	}

	avoidOnPathfinding() {
		return true;
	}

	render(asNeighbor=false, symbol_only=false) {
		let resultingLight = this.light;
		if (this.kind == this.WOOD) {
			resultingLight = color(139, 69, 19);
		}

		fill(arrayToColor(this.light));
		stroke(this.light);
		if (RENDER_MODE == LINE_OF_SIGHT) {
			fill(255);
			stroke(255);
		} else if (RENDER_MODE == LINE_OF_SIGHT_PLUS && !this.hasLineOfSight) {
			fill(color(255, 200, 200));
			stroke(color(255, 200, 200));
		} else if (this.hasBeenSeen && !this.visible) {
			if (asNeighbor && !symbol_only) {
				this.drawDefaultBackground();
			}
			fill(MEMORY_LIGHT);
			stroke(MEMORY_LIGHT);
		} else if (!symbol_only) {
			this.drawDefaultBackground();
			fill(arrayToColor(this.light));
			stroke(this.light);
		}
		let char = '#';
		// if (!asNeighbor) {
		if (this.hasBeenSeen) {
			text(char, this.x * GRID_SIZE_X, (this.y + 1) * GRID_SIZE_Y);
		}
	}

	isSquare() {
		return true;
	}

	getBaseColor() {
		// dark brown
		return [70, 35, 10];
	}
}

function canSeePlayer(x, y) {
	let dx = gameState.player.x - x;
	let dy = gameState.player.y - y;
	let distance = Math.sqrt(dx ** 2 + dy ** 2);
	let angle = Math.atan2(dy, dx);
	for (let i = 0; i < distance; i++) {
		let xx = Math.floor(x + i * Math.cos(angle));
		let yy = Math.floor(y + i * Math.sin(angle));
		if (dx < 0) {
			xx = Math.ceil(x + i * Math.cos(angle));
		}
		if (dy < 0) {
			yy = Math.ceil(y + i * Math.sin(angle));
		}
		if (xx < 0 || xx >= gameState.currentFloor().width || yy < 0 || yy >= gameState.currentFloor().height) {
			return false;
		}
		if (!gameState.currentFloor().get(xx, yy).isTransparent()) {
			return false;
		}
	}
	return true;
}

FLOOR_MATERIAL_STONE = 0;
FLOOR_MATERIAL_WOOD = 1;
FLOOR_MATERIAL_GRASS = 2;
FLOOR_MATERIAL_DIRT = 3;
FLOOR_MATERIAL_TILE = 4;
FLOOR_MATERIAL_SAND = 5;
FLOOR_MATERIAL_TILE_2 = 6;

class Floor extends Tile {
	MATERIAL_COLORS = [ [0, 0, 0], [133, 94, 66], [0, 128, 0], [139, 69, 19], [148, 160, 192], [255, 255, 0], [128, 192, 128] ];
	MATERIAL_SYMBOLS = [ ['.', '.'], ['=', '='], ['"', '"'], ['.', '.'], ['-', ':'], ['.', '.'], [':', ':'] ];

	constructor(x, y, material) {
		super(x, y);

		this.material = material || FLOOR_MATERIAL_STONE;
	}

	render(asNeighbor=false, symbol_only=false) {
		fill(arrayToColor(this.light));
		stroke(this.light);
		if (RENDER_MODE == LINE_OF_SIGHT && this.hasLineOfSight) {
			fill(255);
			stroke(255);
		} else if (RENDER_MODE == LINE_OF_SIGHT_PLUS && !this.hasLineOfSight) {
			fill(color(255, 200, 200));
			stroke(color(255, 200, 200));
		} else if (RENDER_MODE == RECIPROCAL_LINE_OF_SIGHT) {
			if (this.hasLineOfSight) {
				fill(255);
				stroke(255);
				text('O', this.x * GRID_SIZE_X, (this.y + 1) * GRID_SIZE_Y);
			    if (canSeePlayer(this.x, this.y)) {
					text('0', this.x * GRID_SIZE_X, (this.y + 1) * GRID_SIZE_Y);
				}				
			} else if (canSeePlayer(this.x, this.y)) {
				fill(255);
				stroke(255);
				text('/', this.x * GRID_SIZE_X, (this.y + 1) * GRID_SIZE_Y);
			} 
		} else if (this.hasBeenSeen && !this.visible) {
			if (asNeighbor && !symbol_only) {
				this.drawDefaultBackground();
			}
			fill(MEMORY_LIGHT);
			stroke(MEMORY_LIGHT);
		} else if (!symbol_only) {
			this.drawDefaultBackground();

			let c = color(this.light);
			fill(0);
		}
		 if (!asNeighbor && this.hasBeenSeen) {
			if ((this.material == FLOOR_MATERIAL_TILE || this.material == FLOOR_MATERIAL_TILE_2) && this.visible) {
				stroke(192);
				noFill();
				rect(this.x * GRID_SIZE_X + 2 - 2, this.y * GRID_SIZE_Y + 2 + 1, GRID_SIZE_X - 2, GRID_SIZE_Y - 2);
				stroke(128);
				rect(this.x * GRID_SIZE_X + 1 - 2, this.y * GRID_SIZE_Y + 1 + 1, GRID_SIZE_X - 1, GRID_SIZE_Y - 1);
			} else {
				text(this.MATERIAL_SYMBOLS[this.material][(this.x + this.y) % 2], (this.x + 0.2) * GRID_SIZE_X, (this.y + 0.80) * GRID_SIZE_Y);
			}
		}
	}

	getDescription() {
		switch (this.material) {
			case FLOOR_MATERIAL_STONE:
				return 'a stone floor';
			case FLOOR_MATERIAL_WOOD:
				return 'a wooden floor';
			case FLOOR_MATERIAL_GRASS:
				return 'grass';
			case FLOOR_MATERIAL_DIRT:
				return 'dirt';
			case FLOOR_MATERIAL_TILE:
				return 'a tile floor';
			case FLOOR_MATERIAL_SAND:
				return 'sand';
			case FLOOR_MATERIAL_TILE_2:
				return 'a tile floor';
		}
	}

	getBaseColor() {
		return this.MATERIAL_COLORS[this.material];
	}

	isSquare() {
		return this.material == FLOOR_MATERIAL_TILE || this.material == FLOOR_MATERIAL_TILE_2;
	} 

	getReflectiveness() {
		switch (this.material) {
			case FLOOR_MATERIAL_STONE:
				return 0.5;
			case FLOOR_MATERIAL_WOOD:
				return 0.5;
			case FLOOR_MATERIAL_GRASS:
				return 0.4;
			case FLOOR_MATERIAL_DIRT:
				return 0.3;
			case FLOOR_MATERIAL_TILE:
				return 0.6;
			case FLOOR_MATERIAL_SAND:
				return 0.4;
			case FLOOR_MATERIAL_TILE_2:
				return 0.6;
		}
	}

	getSpecularity() {
		switch (this.material) {
			case FLOOR_MATERIAL_STONE:
				return 1;
			case FLOOR_MATERIAL_WOOD:
				return 1;
			case FLOOR_MATERIAL_GRASS:
				return 1;
			case FLOOR_MATERIAL_DIRT:
				return 1;
			case FLOOR_MATERIAL_TILE:
				return 2;
			case FLOOR_MATERIAL_SAND:
				return 1;
			case FLOOR_MATERIAL_TILE_2:
				return 2;
		}
	}


	isEnterable() {
		return true;
	}

	isLeavable() {
		return true;
	}

	isTransparent() {
		return true;
	}

	isLit() {
		return false;
	}

	isSticky() {
		return false;
	}

	isFlyable() {
		return true;
	}

	isSwimmable() {
		return false;
	}

}

class Lamp extends Tile {
	constructor(x, y, color) {
		super(x, y);
		this.color = color;
		this.lightSource = new LightSource(color, 0.1);
	}

	getDescription() {
		return 'a lamp';
	}

	avoidOnPathfinding() {
		return false;
	}

	render(asNeighbor=false, symbol_only=false) {
		this.updateFlickerFactor();
		fill(arrayToColor(this.getLight()));
		stroke(this.getLight());
		if (RENDER_MODE == LINE_OF_SIGHT && this.hasLineOfSight) {
			fill(255);
			stroke(255);
		} else if (RENDER_MODE == LINE_OF_SIGHT_PLUS && !this.hasLineOfSight) {
			fill(color(255, 200, 200));
			stroke(color(255, 200, 200));
		} else if (this.hasBeenSeen && !this.visible) {
			if (asNeighbor && !symbol_only) {
				this.drawDefaultBackground();
			}
			fill(MEMORY_LIGHT);
			stroke(MEMORY_LIGHT);
		} else if (!symbol_only) {
			this.drawDefaultBackground();

			fill(arrayToColor(this.light));
			stroke(this.light);
		}
		if (!asNeighbor && this.hasBeenSeen) {
			text('o', this.x * GRID_SIZE_X, (this.y + 1) * GRID_SIZE_Y);
		}
	}

	updateFlickerFactor() {
		this.lightSource.updateFlickerFactor();
	}

	getLight() {
		return this.lightSource.getLight();
	}

	isEnterable() {
		return true;
	}

	isLeavable() {
		return true;
	}

	isTransparent() {
		return true;
	}

	isLit() {
		return true;
	}

	isSticky() {
		return false;
	}

	isFlyable() {
		return true;
	}

	isSwimmable() {
		return false;
	}
}

class Spiderweb extends Tile {
	MAX_SPIDERWEB_STRENGTH = 3;

	constructor(x, y) {
		super(x, y);
		this.strength = MAX_SPIDERWEB_STRENGTH;
	}

	isEnterable() {
		return true;
	}

	isLeavable() {
		return false;
	}

	isTransparent() {
		return true;
	}

	isLit() {
		return false;
	}

	isSticky() {
		return true;
	}

	isFlyable() {
		return false;
	}

	isSwimmable() {
		return false;
	}
}

class AscendingStaircase extends Tile {
	constructor(x, y) {
		super(x, y);
	}

	isEnterable() {
		return true;
	}

	onEnter() {
		// Go up a floor
		player.timeUnderwater = 0;
	}

}

class DescendingStaircase extends Tile {
	constructor(x, y) {
		super(x, y);
	}

	isEnterable() {
		return true;
	}

	onEnter() {
		// Go down a floor
		player.timeUnderwater = 0;
	}

}

class Water extends Tile {
	constructor(x, y, depth) {
		super(x, y);
		this.depth = depth;
		this.color = [0, 0, 128];
		this.lightSource = new LightSource(32, 0.1);
	}

	getDescription() {
		return 'water';
	}

	avoidOnPathfinding() {
		return true;
	}


	render(asNeighbor=false, symbol_only=false) {
		// this.lightSource.updateFlickerFactor();
		let c = color(this.light);
		let ls = this.lightSource.getLight();
		let lsc = color(ls);
		// let useColor = lerpColor(lsc, c, 0.5);
		// fill(useColor);
		// stroke(useColor);
		if (RENDER_MODE == LINE_OF_SIGHT && this.hasLineOfSight) {
			fill(255);
			stroke(255);
		} else if (RENDER_MODE == LINE_OF_SIGHT_PLUS && !this.hasLineOfSight) {
			fill(color(255, 200, 200));
			stroke(color(255, 200, 200));
		} else if (this.hasBeenSeen && !this.visible) {
			if (asNeighbor && !symbol_only) {
				this.drawDefaultBackground();
			}
			fill(MEMORY_LIGHT);
			noStroke();
		} else if (!symbol_only) {
			this.drawDefaultBackground();
			// let f = gameState.currentFloor();
			// let colors = [
			// 	[ f.getColor(this.x - 1, this.y - 1), 
			// 		f.getColor(this.x, this.y - 1),
			// 		f.getColor(this.x + 1, this.y - 1)
			// 	],
			// 	[ f.getColor(this.x - 1, this.y),
			// 		f.getColor(this.x, this.y),
			// 		f.getColor(this.x + 1, this.y)
			// 	],
			// 	[ f.getColor(this.x - 1, this.y + 1),
			// 		f.getColor(this.x, this.y + 1),
			// 		f.getColor(this.x + 1, this.y + 1)
			// 	]
			// ];
			// let cornerColors = [ lerpColor(lerpColor(colors[0][0], colors[1][1], 0.5), lerpColor(colors[1][0], colors[0][1], 0.5), 0.5),
			// 						lerpColor(lerpColor(colors[0][1], colors[1][2], 0.5), lerpColor(colors[1][1], colors[0][2], 0.5), 0.5),
			// 						lerpColor(lerpColor(colors[1][0], colors[2][1], 0.5), lerpColor(colors[2][0], colors[1][1], 0.5), 0.5),
			// 						lerpColor(lerpColor(colors[1][1], colors[2][2], 0.5), lerpColor(colors[2][1], colors[1][2], 0.5), 0.5)
			// ];
	
			// let blue = color(0, 0, 128);
			// beginShape(TESS);
			// fill(lerpColor(cornerColors[0], blue, 0.2));
			// noStroke();
			// vertex(this.x * GRID_SIZE_X, this.y * GRID_SIZE_Y);
			// fill(lerpColor(cornerColors[1], blue, 0.2));
			// vertex((this.x + 1) * GRID_SIZE_X, this.y * GRID_SIZE_Y);
			// fill(lerpColor(cornerColors[3], blue, 0.2));
			// vertex((this.x + 1) * GRID_SIZE_X, (this.y + 1) * GRID_SIZE_Y);
			// fill(lerpColor(cornerColors[2], blue, 0.2));
			// vertex(this.x * GRID_SIZE_X, (this.y + 1) * GRID_SIZE_Y);
			// endShape(CLOSE);
		}
		// if (this.visible) {
		// 	rect(this.x * GRID_SIZE_X, this.y * GRID_SIZE_Y, GRID_SIZE_X, GRID_SIZE_Y);
		// }

		let tildeColor = lerpColor(lsc, color(0, 0, 64), 0.75);
		fill(tildeColor);
		stroke(tildeColor);
		if (RENDER_MODE == LINE_OF_SIGHT && this.hasLineOfSight) {
			fill(128);
			stroke(128);
		} else if (RENDER_MODE == LINE_OF_SIGHT_PLUS && !this.hasLineOfSight) {
			fill(color(255, 128, 128));
			stroke(color(255, 128, 128));
		} else if (this.hasBeenSeen && !this.visible) {
			fill(0, 0, 128);
			noStroke();
		}
		if (!this.visible) {
			text('~', this.x * GRID_SIZE_X, (this.y + 1) * GRID_SIZE_Y);
		}
	}

	updateFlickerFactor() {
		this.lightSource.updateFlickerFactor();
	}

	// getLight() {
	// 	return [128, 64, 0];
	// }

	getLight() {
		return this.light * this.lightSource.flickerFactor;
	}

	getReflectiveness() {
		return 1;
	}

	getSpecularity() {
		return 2;
	}

	isEnterable() {
		return false;
	}

	isLeavable() {
		return true;
	}

	isTransparent() {
		return true;
	}

	isLit() {
		return false;
	}

	isSticky() {
		return false;
	}

	isFlyable() {
		return true;
	}

	isSwimmable() {
		return true;
	}

	onEnter(player) {
	}

	onStay(player) {
		player.timeUnderwater++;
	}
}

class Lava extends Tile {
	LAVA_DAMAGE = 10;

	constructor(x, y) {
		super(x, y);
		this.color = 192;
		this.lightSource = new LightSource(32, 0.2);
	}

	getDescription() {
		return 'lava';
	}

	avoidOnPathfinding() {
		return true;
	}


	render(asNeighbor=false, symbol_only=false) {
		// this.updateFlickerFactor();
		fill(arrayToColor(this.getLight()));
		stroke(this.getLight());
		if (RENDER_MODE == LINE_OF_SIGHT && this.hasLineOfSight) {
			fill(255);
			stroke(255);
		} else if (RENDER_MODE == LINE_OF_SIGHT_PLUS && !this.hasLineOfSight) {
			fill(color(255, 200, 200));
			stroke(color(255, 200, 200));
		} else if (this.hasBeenSeen && !this.visible) {
			if (asNeighbor && !symbol_only) {
				let f = gameState.currentFloor();
				let colors = [
					[ f.getColor(this.x - 1, this.y - 1, true), 
						f.getColor(this.x, this.y - 1, true),
						f.getColor(this.x + 1, this.y - 1, true)
					],
					[ f.getColor(this.x - 1, this.y, true),
						f.getColor(this.x, this.y, true),
						f.getColor(this.x + 1, this.y, true)
					],
					[ f.getColor(this.x - 1, this.y + 1, true),
						f.getColor(this.x, this.y + 1, true),
						f.getColor(this.x + 1, this.y + 1, true)
					]
				];
				let cornerColors = [ lerpArray(lerpArray(colors[0][0], colors[1][1], 0.5), lerpArray(colors[1][0], colors[0][1], 0.5), 0.5),
				lerpArray(lerpArray(colors[0][1], colors[1][2], 0.5), lerpArray(colors[1][1], colors[0][2], 0.5), 0.5),
				lerpArray(lerpArray(colors[1][0], colors[2][1], 0.5), lerpArray(colors[2][0], colors[1][1], 0.5), 0.5),
				lerpArray(lerpArray(colors[1][1], colors[2][2], 0.5), lerpArray(colors[2][1], colors[1][2], 0.5), 0.5)
				];
	
				beginShape(TESS);
				fill(arrayToColor(cornerColors[0]));
				noStroke();
				vertex(this.x * GRID_SIZE_X, this.y * GRID_SIZE_Y + 2);
				fill(arrayToColor(cornerColors[1]));
				vertex((this.x + 1) * GRID_SIZE_X, this.y * GRID_SIZE_Y + 2);
				fill(arrayToColor(cornerColors[3]));
				vertex((this.x + 1) * GRID_SIZE_X, (this.y + 1) * GRID_SIZE_Y + 2);
				fill(arrayToColor(cornerColors[2]));
				vertex(this.x * GRID_SIZE_X, (this.y + 1) * GRID_SIZE_Y + 2);
				endShape(CLOSE);

				// fill(color(255));
				// text('*', this.x * GRID_SIZE_X, (this.y + 1) * GRID_SIZE_Y);
			} else {
				fill(0,255,0);
				// rect(this.x * GRID_SIZE_X, this.y * GRID_SIZE_Y, GRID_SIZE_X, GRID_SIZE_Y);
			}
			fill(MEMORY_LIGHT);
			noStroke();
		} else if (!symbol_only) {
			let f = gameState.currentFloor();
			let colors = [
				[ f.getColor(this.x - 1, this.y - 1, true), 
					f.getColor(this.x, this.y - 1, true),
					f.getColor(this.x + 1, this.y - 1, true)
				],
				[ f.getColor(this.x - 1, this.y, true),
					f.getColor(this.x, this.y, true),
					f.getColor(this.x + 1, this.y, true)
				],
				[ f.getColor(this.x - 1, this.y + 1, true),
					f.getColor(this.x, this.y + 1, true),
					f.getColor(this.x + 1, this.y + 1, true)
				]
			];
			let cornerColors = [ lerpArray(lerpArray(colors[0][0], colors[1][1], 0.5), lerpArray(colors[1][0], colors[0][1], 0.5), 0.5),
									lerpArray(lerpArray(colors[0][1], colors[1][2], 0.5), lerpArray(colors[1][1], colors[0][2], 0.5), 0.5),
									lerpArray(lerpArray(colors[1][0], colors[2][1], 0.5), lerpArray(colors[2][0], colors[1][1], 0.5), 0.5),
									lerpArray(lerpArray(colors[1][1], colors[2][2], 0.5), lerpArray(colors[2][1], colors[1][2], 0.5), 0.5)
			];

			beginShape(TESS);
			fill(arrayToColor(cornerColors[0]));
			noStroke();
			vertex(this.x * GRID_SIZE_X, this.y * GRID_SIZE_Y + 2);
			fill(arrayToColor(cornerColors[1]));
			vertex((this.x + 1) * GRID_SIZE_X, this.y * GRID_SIZE_Y + 2);
			fill(arrayToColor(cornerColors[3]));
			vertex((this.x + 1) * GRID_SIZE_X, (this.y + 1) * GRID_SIZE_Y + 2);
			fill(arrayToColor(cornerColors[2]));
			vertex(this.x * GRID_SIZE_X, (this.y + 1) * GRID_SIZE_Y + 2);
			endShape(CLOSE);

			// fill(color(255));
			// text('!', this.x * GRID_SIZE_X, (this.y + 1) * GRID_SIZE_Y);
		}
		// if (this.visible) {
		// 	rect(this.x * GRID_SIZE_X, this.y * GRID_SIZE_Y, GRID_SIZE_X, GRID_SIZE_Y);
		// }
		let l = this.lightSource.getLight();
		let c = color(l[0], l[1], l[2]);
		let caretColor = lerpColor(c, color(64, 0, 0), 0.75);
		fill(caretColor);
		stroke(caretColor);
		if (RENDER_MODE == LINE_OF_SIGHT && this.hasLineOfSight) {
			fill(128);
			stroke(128);
		} else if (RENDER_MODE == LINE_OF_SIGHT_PLUS && !this.hasLineOfSight) {
			fill(color(255, 128, 128));
			stroke(color(255, 128, 128));
		} else if (this.hasBeenSeen && !this.visible) {
			fill(255, 0, 0);
			noStroke();
		}
		if (!this.visible) {
			text('~', this.x * GRID_SIZE_X, (this.y + 1) * GRID_SIZE_Y);
		}
	}

	isLit() {
		return true;
	}

	updateFlickerFactor() {
		this.lightSource.updateFlickerFactor();
	}

	getLight() {
		return this.color * this.lightSource.flickerFactor;
	}

	getColor() {
		return this.color;
	}

	isEnterable() {
		return false;
	}

	isLeavable() {
		return true;
	}

	isTransparent() {
		return true;
	}

	isLit() {
		return true;
	}

	isSticky() {
		return false;
	}

	isFlyable() {
		return true;
	}

	isSwimmable() {
		return false;
	}

	onEnter(player) {
		// player.health -= LAVA_DAMAGE;
	}

	onStay(player) {
		// player.health -= LAVA_DAMAGE;
	}
}

class Pit extends Tile {
	PIT_DAMAGE = 5;

	constructor(x, y) {
		super(x, y);
	}

	isEnterable() {
		return true;
	}

	isLeavable() {
		return false;
	}

	isTransparent() {
		return true;
	}

	isLit() {
		return false;
	}

	isSticky() {
		return false;
	}

	isFlyable() {
		return true;
	}

	isSwimmable() {
		return false;
	}

	onEnter(player) {
		if (player.flying) {
			return;
		}
		// go down a floor
		player.health -= PIT_DAMAGE;
		player.floor = player.floor + 1;
	}
}

