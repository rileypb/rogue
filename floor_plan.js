class Tile {
  constructor(x, y) {
    this.x = x;
    this.y = y;

    this.light = color(0, 0, 0);
    this.feature = null;

    this.hasBeenSeen = false;
    this.visible = false;
    this.hasLineOfSight = false;

    this.isSpecial = false;
  }

  render() {
    // Do nothing
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
    return this.light._getBrightness() > LIGHT_THRESHOLD;
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


}


class FloorPlan {
  NATURAL = 0;
  DUNGEON = 1;
  MIX = 2;
  ONE_ROOM = 3;
  RANDOM_WALLS = 4;

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
    this.type = this.RANDOM_WALLS;
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
      let xPow = Math.floor(Math.random() * 3) + 2;
      let yPow = Math.floor(Math.random() * 3) + 2;
      for (let xx = x-dx; xx < x + dx; xx++) {
        for (let yy = y-dy; yy < y + dy; yy++) {
          if ((xx - x) ** xPow / dx ** xPow + (yy - y) ** yPow / dy ** yPow < 1) {
            this.tiles[xx + yy * this.width] = new Floor(xx, yy);
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
		let b = components[i+1][Math.floor(Math.random() * components[i+1].length)];
		let x = a.x;
		let y = a.y;
		while (x != b.x || y != b.y) {
			if (!this.get(x, y).isEnterable()) {
				this.set(x, y, new Floor(x, y));
			}
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
	}
  }

  generateOneRoom() {
    // fill with floor tiles
    for (let x = 0; x < this.width+1; x++) {
      for (let y = 0; y < this.height+1; y++) {
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
    this.tiles[x + y * this.width] = new Lamp(x, y, color(255, 0, 0));
    // x = Math.floor(2*this.width / 3) - 8;
    // y = Math.floor(2*this.height / 3) - 2;
    // this.tiles[x + y * this.width] = new Lamp(x, y, color(255, 255, 0));

    // place a wall near the lamp
    x = Math.floor(this.width / 2) + 2;
    y = Math.floor(this.height / 2) + 2;
    this.tiles[x + y * this.width] = new Wall(x, y);
    this.tiles[x + (y + 1) * this.width] = new Wall(x, y + 1);
    this.tiles[x + (y + 2) * this.width] = new Wall(x, y + 2);
    this.tiles[x + (y + 3) * this.width] = new Wall(x, y + 3);
    this.tiles[x + (y + 4) * this.width] = new Wall(x, y + 4);
    this.tiles[x + (y + 5) * this.width] = new Wall(x, y + 5);
    this.tiles[x + (y + 5) * this.width].isSpecial = true;
    // and near the other lamp
    x = Math.floor(2*this.width / 3) - 6;
    y = Math.floor(2*this.height / 3) - 3;
    while (x < 0) {
      x++;
    }
    while (y < 0) {
      y++;
    }
    this.tiles[x + y * this.width] = new Wall(x, y);
    this.tiles[x + (y - 1) * this.width] = new Wall(x, y - 1);
    this.tiles[x + (y - 2) * this.width] = new Wall(x, y - 2);
    this.tiles[x + (y - 3) * this.width] = new Wall(x, y - 3);
  }

  generateRandomWalls() {
    // fill with floor tiles
    for (let x = 0; x < this.width+1; x++) {
      for (let y = 0; y < this.height+1; y++) {
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
      console.log("wall at " + x + ", " + y, " of size " + dx + ", " + dy);
      for (let xx = x; xx < x + dx; xx++) {
        for (let yy = y; yy < Math.min(this.height,y + dy); yy++) {
          this.set(xx, yy, new Wall(xx, yy, Wall.WOOD));
        }
      }
    }
    //create 5 random lamps
    for (let i = 0; i < 5; i++) {
      let x = Math.floor(Math.random() * this.width);
      let y = Math.floor(Math.random() * this.height);
      while (!this.get(x, y).isEnterable()) {
        x = Math.floor(Math.random() * this.width);
        y = Math.floor(Math.random() * this.height);
      }
      this.tiles[x + y * this.width] = new Lamp(x, y, color(Math.round(Math.random() * 255), Math.round(Math.random() * 255), Math.round(Math.random() * 255)));
    }

    // add one irregularly shaped pool of lava of around 8 spaces
    let x = Math.floor(Math.random() * this.width);
    let y = Math.floor(Math.random() * this.height);
    let dx = Math.floor(Math.random() * 6) + 1;
    let dy = Math.floor(Math.random() * 6) + 1;
    for (let xx = x; xx < x + dx; xx++) {
      for (let yy = y; yy < Math.min(this.height,y + dy); yy++) {
        let radius = Math.floor(Math.random() * 4) + 2;
        if (xx - radius < 0) {
          radius = xx;
        }
        if (yy - radius < 0) {
          radius = yy;
        }
        for (let xxx = xx-radius; xxx < xx + radius; xxx++) {
          for (let yyy = yy-radius; yyy < yy + radius; yyy++) {
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
      for (let yy = y; yy < Math.min(this.height,y + dy); yy++) {
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
    for (let xx = x-dx; xx < x + dx; xx++) {
      for (let yy = y-dy; yy < Math.min(this.height,y + dy); yy++) {
        if ((xx - x) ** 2 / dx ** 2 + (yy - y) ** 2 / dy ** 2 < 1) {
          // create a disk of water of radius 1-3.
          let radius = Math.floor(Math.random() * 4) + 2;
          if (xx - radius < 0) {
            radius = xx;
          }
          if (yy - radius < 0) {
            radius = yy;
          }
          for (let xxx = xx-radius; xxx < xx + radius; xxx++) {
            for (let yyy = yy-radius; yyy < yy + radius; yyy++) {
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

  avoidOnPathfinding() {
    return true;
  }

  render() {
    let resultingLight = this.light;
    if (this.kind == this.WOOD) {
      resultingLight = color(139, 69, 19);
    }

    fill(this.light);
    stroke(this.light);
    if (RENDER_MODE == LINE_OF_SIGHT) {
      fill(255);
      stroke(255);
    } else if (RENDER_MODE == LINE_OF_SIGHT_PLUS && !this.hasLineOfSight) {
      fill(color(255,200,200));
      stroke(color(255,200,200));
    } else if (this.hasBeenSeen && !this.visible) {
      fill(MEMORY_LIGHT);
      stroke(MEMORY_LIGHT);
    }
    let char = '#';
    text(char, this.x * GRID_SIZE_X, (this.y + 1) * GRID_SIZE_Y);
  }
}

class Floor extends Tile {
  constructor(x, y) {
    super(x, y);
  }

  render() {
    fill(this.light);
    stroke(this.light);
    if (RENDER_MODE == LINE_OF_SIGHT && this.hasLineOfSight) {
      fill(255);
      stroke(255);
    } else if (RENDER_MODE == LINE_OF_SIGHT_PLUS && !this.hasLineOfSight) {
      fill(color(255,200,200));
      stroke(color(255,200,200));
    } else if (this.hasBeenSeen && !this.visible) {
      fill(MEMORY_LIGHT);
      stroke(MEMORY_LIGHT);
    }
    text('.', this.x * GRID_SIZE_X, (this.y + 1) * GRID_SIZE_Y);
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

  avoidOnPathfinding() {
    return true;
  }

  render() {
    this.updateFlickerFactor();
    fill(this.getLight());
    stroke(this.getLight());
    if (RENDER_MODE == LINE_OF_SIGHT && this.hasLineOfSight) {
      fill(255);
      stroke(255);
    } else if (RENDER_MODE == LINE_OF_SIGHT_PLUS && !this.hasLineOfSight) {
      fill(color(255,200,200));
      stroke(color(255,200,200));
    } else if (this.hasBeenSeen && !this.visible) {
      fill(MEMORY_LIGHT);
      stroke(MEMORY_LIGHT);
    }
    text('o', this.x * GRID_SIZE_X, (this.y + 1) * GRID_SIZE_Y);
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
    this.color = color(0);
    this.lightSource = new LightSource(this.color, 0.1);
  }

  avoidOnPathfinding() {
    return true;
  }


  render() {
    // this.lightSource.updateFlickerFactor();
    let useColor = lerpColor(this.lightSource.getLight(), this.light, 0.5);
    fill(useColor);
    stroke(useColor);
    if (RENDER_MODE == LINE_OF_SIGHT && this.hasLineOfSight) {
      fill(255);
      stroke(255);
    } else if (RENDER_MODE == LINE_OF_SIGHT_PLUS && !this.hasLineOfSight) {
      fill(color(255,200,200));
      stroke(color(255,200,200));
    } else if (this.hasBeenSeen && !this.visible) {
      fill(MEMORY_LIGHT);
      noStroke();
    }
    if (this.visible) {
      rect(this.x * GRID_SIZE_X, this.y * GRID_SIZE_Y, GRID_SIZE_X, GRID_SIZE_Y);
    }

    let tildeColor = lerpColor(this.lightSource.getLight(), color(0, 0, 64), 0.75);
    fill(tildeColor);
    stroke(tildeColor);
    if (RENDER_MODE == LINE_OF_SIGHT && this.hasLineOfSight) {
      fill(128);
      stroke(128);
    } else if (RENDER_MODE == LINE_OF_SIGHT_PLUS && !this.hasLineOfSight) {
      fill(color(255,128,128));
      stroke(color(255,128,128));
    } else if (this.hasBeenSeen && !this.visible) {
      fill(0, 0, 128);
      noStroke();
    }
    text('~', this.x * GRID_SIZE_X, (this.y + 1) * GRID_SIZE_Y);
  }

  updateFlickerFactor() {
    this.lightSource.updateFlickerFactor();
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
    this.color = color(255, 0, 0);
    this.lightSource = new LightSource(this.color, 0.2);
  }

  avoidOnPathfinding() {
    return true;
  }


  render() {
    // this.updateFlickerFactor();
    fill(this.getLight());
    stroke(this.getLight());
    if (RENDER_MODE == LINE_OF_SIGHT && this.hasLineOfSight) {
      fill(255);
      stroke(255);
    } else if (RENDER_MODE == LINE_OF_SIGHT_PLUS && !this.hasLineOfSight) {
      fill(color(255,200,200));
      stroke(color(255,200,200));
    } else if (this.hasBeenSeen && !this.visible) {
      fill(MEMORY_LIGHT);
      noStroke();
    }
    if (this.visible) {
      rect(this.x * GRID_SIZE_X, this.y * GRID_SIZE_Y, GRID_SIZE_X, GRID_SIZE_Y);
    }

    let caretColor = lerpColor(this.lightSource.getLight(), color(64, 0, 0), 0.75);
    fill(caretColor);
    stroke(caretColor);
    if (RENDER_MODE == LINE_OF_SIGHT && this.hasLineOfSight) {
      fill(128);
      stroke(128);
    } else if (RENDER_MODE == LINE_OF_SIGHT_PLUS && !this.hasLineOfSight) {
      fill(color(255,128,128));
      stroke(color(255,128,128));
    } else if (this.hasBeenSeen && !this.visible) {
      fill(255, 0, 0);
      noStroke();
    }
    text('^', this.x * GRID_SIZE_X, (this.y + 1) * GRID_SIZE_Y);

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

