class GameState {
	constructor() {
		this.player = null;
		this.floors = [];
		this.floorIndex = 0;
	}

	currentFloor() {
	  return this.floors[this.floorIndex];
	}
}