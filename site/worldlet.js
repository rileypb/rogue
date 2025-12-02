
	WT_OPEN_WORLD = 0;
	WT_DUNGEON = 1;
	WT_INIT = 2;

	FP_NONE = 0;
	FP_CENTER = 1;
	
class Worldlet {

	constructor(name, worldletType, followPolicy, displayEngine, inputEngine) {
		this.name = name;
		this.worldletType = worldletType;
		this.followPolicy = followPolicy;
		this.displayEngine = displayEngine;
		this.inputEngine = inputEngine;
		this.initialFloor = 0;
	}

	async init() {
		await this.generateFloors();
		this.inputEngine.init();
		this.displayEngine.init();
	}

	teardown() {
		this.inputEngine.teardown();
		this.displayEngine.teardown();
	}

	async generateFloors() {
		let fps;
		switch (this.worldletType) {
			case WT_OPEN_WORLD:
				fps = [new FloorPlan(MAP_WIDTH, MAP_HEIGHT, 0)];
				fps[0].generate();
				return fps;
		
			case WT_DUNGEON:
				fps = [new FloorPlan(MAP_WIDTH, MAP_HEIGHT, 0)];
				fps[0].generate();
				return fps;
				
			case WT_INIT:
				return [new FloorPlan(MAP_WIDTH, MAP_HEIGHT, 0)];
		}
		return null;
	}

}