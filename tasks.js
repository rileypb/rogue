class Task {
  constructor(name) {
	this.name = name;
	this.countdown = -1;
  }

  run() {
	return -1;
  }

  noRun() {
	// do nothing
  }
}

class TaskManager {
  constructor() {
	this.tasks = [];
  }

  addTask(task) {
	this.tasks.push(task);
  }

  runTasks() {
	let completedTasks = [];
	for (let task of this.tasks) {
	  task.countdown--;
	  if (task.countdown === 0) {
		let result = task.run();
		if (result === -1) {
		  completedTasks.push(task);
		}
	  } else {
		task.noRun();
	  }
	}
	for (let task of completedTasks) {
	  this.tasks.splice(this.tasks.indexOf(task), 1);
	}
  }
}

class TestTask extends Task {
  constructor(name) {
	super(name);
	this.countdown = 60;
	this.count = 0;
  }

  run() {
	fill(255);
	stroke(255);
	this.count++;
	this.countdown = 60;
	return 0;
  }
}

class FlickerTask extends Task {
  constructor(floorPlan) {
	super("Flicker Task");
	this.countdown = 30;
	this.floorPlan = floorPlan;
  }

  run() {
	this.floorPlan.updateFlicker();
	playerLightSource.updateFlickerFactor();
	updateLight(this.floorPlan, gameState.player);
	render();
	this.countdown = Math.floor(Math.random() * 30 + 1);
	return 0;
  }
}