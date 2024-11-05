class Tile {
  constructor(x, y) {
    this.x = x;
    this.y = y;

    this.light = color(0, 0, 0);
    this.feature = null;

    this.hasBeenSeen = false;
    this.currentlyVisible = false;
    this.hasLineOfSight = false;

    this.isSpecial = false;
  }

  render() {
    // Do nothing
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

  isTransparent(player) {
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

  constructor(width, height, floor) {
    this.width = width;
    this.height = height;
    this.floor = floor;
    this.tiles = [];
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        this.tiles.push(new Tile(x, y));
      }
    }
    this.floorIndex = 0;
    this.type = this.ONE_ROOM;
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
      if (tile instanceof Lamp) {
        tile.updateFlickerFactor();
      }
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
    }
  }

  generateNatural() {
    // fill with wall tiles
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        this.tiles[x + y * this.width] = new Wall(x, y);
      }
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
    this.tiles[x + y * this.width] = new Lamp(x, y, color(255, 0, 0));
    x = Math.floor(2*this.width / 3) - 8;
    y = Math.floor(2*this.height / 3) - 2;
    this.tiles[x + y * this.width] = new Lamp(x, y, color(255, 255, 0));

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
    this.tiles[x + y * this.width] = new Wall(x, y);
    this.tiles[x + (y - 1) * this.width] = new Wall(x, y - 1);
  }



}

class Wall extends Tile {
  constructor(x, y) {
    super(x, y);
  }

  render() {
    fill(this.light);
    stroke(this.light);
    if (RENDER_MODE == LINE_OF_SIGHT) {
      fill(255);
      stroke(255);
    }
    text('#', this.x * GRID_SIZE_X, (this.y + 1) * GRID_SIZE_Y);
  }
}

class Floor extends Tile {
  constructor(x, y) {
    super(x, y);
  }

  render() {
    fill(this.light);
    stroke(this.light);
    if (RENDER_MODE == LINE_OF_SIGHT) {
      fill(255);
      stroke(255);
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
    this.lightSource = new LightSource(color, 0.06);
  }

  render() {
    this.updateFlickerFactor();
    fill(this.getLight());
    stroke(this.getLight());
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
    player.health -= LAVA_DAMAGE;
  }

  onStay(player) {
    player.health -= LAVA_DAMAGE;
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

