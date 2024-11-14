class GameState {
	constructor() {
		this.player = null;
		this.floors = [];
		this.floorIndex = 0;
		this.monsters = [];
	}

	currentFloor() {
	  return this.floors[this.floorIndex];
	}
}