class GameState {
	constructor() {
		this.player = null;
		this.floors = [];
		this.floorIndex = 0;
		this.monsters = [];
		this.currentWorldlet = null;
	}

	currentFloor() {
	  return this.floors[this.floorIndex];
	}
}