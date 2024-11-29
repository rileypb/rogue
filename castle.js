
const TYPE_CASTLE = 0;

const SQUARE = 0;
const HORIZONTAL = 1;
const VERTICAL = 2;

const UP = 0;
const DOWN = 1;
const LEFT = 2;
const RIGHT = 3;

const FIRST_SUBDIVISION_BORDER = 0;
const FIRST_SUBDIVISION_INTERIOR = 1;


function generateCastle(floorPlan) {
  let subdivision = [{x: 0, y: 0, width: floorPlan.width, height: floorPlan.height, type: TYPE_CASTLE}];

  let result = generateSubdivision(floorPlan, subdivision);

  // set all tiles to floor
  for (let x = 0; x < floorPlan.width; x++) {
	for (let y = 0; y < floorPlan.height; y++) {
	  floorPlan.set(x,y, new Floor(x, y, FLOOR_MATERIAL_GRASS));
	}
  }

//   for (let sub of result) {
// 	// set tiles on border to FLOOR_MATERIAL_GRASS
// 	for (let x = sub.x; x < sub.x + sub.width; x++) {
// 	  for (let y = sub.y; y < sub.y + sub.height; y++) {
// 		if (x == sub.x || x == sub.x + sub.width - 1 || y == sub.y || y == sub.y + sub.height - 1) {
// 		  floorPlan.get(x, y).material = FLOOR_MATERIAL_GRASS;
// 		}
// 	  }
// 	}
//   }
}

function generateSubdivision(floorPlan, subdivision) {
	switch (subdivision[0].type) {
		case TYPE_CASTLE:
			return generateCastleSubdivision(floorPlan, subdivision);
			break;
	}
}

function generateCastleSubdivision(floorPlan, subdivision) {
	var castle = subdivision[0];
	var castleWidth = castle.width;
	var castleHeight = castle.height;

	var horizontalSubdivisions = Math.floor(random(4, 6));
	var verticalSubdivisions = Math.floor(random(4, 6));
	var horizontalSubdivisionWidth = castleWidth / horizontalSubdivisions;
	var verticalSubdivisionHeight = castleHeight / verticalSubdivisions;

	var subdivisions = [];
	var shuffledCoords = [];
	for (var i = 0; i < horizontalSubdivisions; i++) {
		subdivisions.push([]);
		for (var j = 0; j < verticalSubdivisions; j++) {
			var x = castle.x + i * horizontalSubdivisionWidth;
			var y = castle.y + j * verticalSubdivisionHeight;
			var width = horizontalSubdivisionWidth;
			var height = verticalSubdivisionHeight;
			subdivisions[i].push({u: i, v: j, x: x, y: y, components: [[i, j]], width: width, height: height, type: TYPE_CASTLE});
			shuffledCoords.push([i, j]);
		}
	}
	shuffle(shuffledCoords, true);
	var combinedSubdivisions = [];

	// combine some of the subdivisions into larger rectangles.
	// follow a path starting at a random point and moving in a random direction
	// if the path intersects with a subdivision, combine the two subdivisions if and only if the combined subdivision is a rectangle.
	// if the path intersects with a wall, move in a different direction.
	// if that path would intersect with itself, move in a different direction.
	// if the path cannot move in any direction, jump to a random point that has not been visited.
	// if there are no unvisited points, stop.

	var visited = [];
	for (var i = 0; i < horizontalSubdivisions; i++) {
		visited.push([]);
		for (var j = 0; j < verticalSubdivisions; j++) {
			visited[i].push(false);
		}
	}

	var pathU = Math.floor(random(horizontalSubdivisions));
	var pathV = Math.floor(random(verticalSubdivisions));
	visited[pathU][pathV] = true;
	combinedSubdivisions.push(subdivisions[pathU][pathV]);
	while (true) {
		var jumped = false;
		var newCoords = getNextPosition(pathU, pathV, visited, horizontalSubdivisions, verticalSubdivisions);
		if (newCoords == null) {
			newCoords = jump(shuffledCoords, visited);
			jumped = true;
		}
		if (newCoords == null) {
			break;
		}
		var newU = newCoords[0];
		var newV = newCoords[1];
		console.log(pathU, pathV, newU, newV);
		visited[newU][newV] = true;
		
		let currentSubdivision = subdivisions[pathU][pathV];
		let newSubdivision = subdivisions[newU][newV];
		let orientation = SQUARE;
		let currentUWidth = currentSubdivision.width / horizontalSubdivisionWidth;
		let currentVHeight = currentSubdivision.height / verticalSubdivisionHeight;
		if (currentUWidth > currentVHeight) {
			orientation = HORIZONTAL;
		} else if (currentVHeight > currentUWidth) {
			orientation = VERTICAL;
		}
		let newOrientation = SQUARE;
		if (newSubdivision.u == currentSubdivision.u) {
			newOrientation = VERTICAL;
		} else if (newSubdivision.v == currentSubdivision.v) {
			newOrientation = HORIZONTAL;
		}
		if (!jumped && (orientation == newOrientation || orientation == SQUARE)) {
			console.log("combining");
			console.log(orientation + " " + newOrientation);
			console.log(currentSubdivision);
			console.log(newSubdivision);
			let combined = combineSubdivisions(currentSubdivision, newSubdivision);
			console.log(combined);
			for (let i = 0; i < combined.components.length; i++) {
				subdivisions[combined.components[i][0]][combined.components[i][1]] = combined;
			}
			if (combinedSubdivisions.includes(currentSubdivision)) {
				combinedSubdivisions.splice(combinedSubdivisions.indexOf(currentSubdivision), 1);
			}
			if (combinedSubdivisions.includes(newSubdivision)) {
				combinedSubdivisions.splice(combinedSubdivisions.indexOf(newSubdivision), 1);
			}
			combinedSubdivisions.push(combined);
		} else {
			console.log("not combining");
			console.log(newSubdivision);
			combinedSubdivisions.push(newSubdivision);
		}
		pathU = newU;
		pathV = newV;
	}
	console.log(combinedSubdivisions);

	let numberOfComponents = 0;
	for (let sub of combinedSubdivisions) {
		numberOfComponents += sub.components.length;
	}
	console.log(numberOfComponents);
	console.log(horizontalSubdivisions * verticalSubdivisions);

	let result = [];
	for (let sub of combinedSubdivisions) {
		if (isBorderSubdivision(sub, floorPlan)) {
			let recursiveSubdivisions = generateFirstLevelBorderSubdivision(sub, floorPlan)
			result.push(...recursiveSubdivisions);
		}
	}

	return result;
}

function isBorderSubdivision(subdivision, floorPlan) {
	return subdivision.x == 0 || subdivision.y == 0 || subdivision.x + subdivision.width == floorPlan.width || subdivision.y + subdivision.height == floorPlan.height;
}

function generateFirstLevelBorderSubdivision(subdivision, floorPlan) {
	var x = subdivision.x;
	var y = subdivision.y;
	var width = subdivision.width;
	var height = subdivision.height;
	let horizontalSubdivisions = Math.floor(random(2, 5));
	let verticalSubdivisions = Math.floor(random(2, 5));
	while (width % horizontalSubdivisions != 0) {
		horizontalSubdivisions = Math.floor(random(2, 5));
	}
	while (height % verticalSubdivisions != 0) {
		verticalSubdivisions = Math.floor(random(2, 5));
	}
	
	let horizontalSubdivisionWidth = width / horizontalSubdivisions;
	let verticalSubdivisionHeight = height / verticalSubdivisions;
	let subdivisions = [];
	for (var i = 0; i < horizontalSubdivisions; i++) {
		subdivisions.push([]);
		for (var j = 0; j < verticalSubdivisions; j++) {
			var x = subdivision.x + i * horizontalSubdivisionWidth;
			var y = subdivision.y + j * verticalSubdivisionHeight;
			var width = horizontalSubdivisionWidth;
			var height = verticalSubdivisionHeight;
			subdivisions[i].push({u: i, v: j, x: x, y: y, components: [[i, j]], width: width, height: height, type: TYPE_CASTLE});
		}
	}
	let shuffledCoords = [];
	for (let i = 0; i < horizontalSubdivisions; i++) {
		for (let j = 0; j < verticalSubdivisions; j++) {
			shuffledCoords.push([i, j]);
		}
	}
	shuffle(shuffledCoords, true);
	let combinedSubdivisions = [];
	let visited = [];
	for (let i = 0; i < horizontalSubdivisions; i++) {
		visited.push([]);
		for (let j = 0; j < verticalSubdivisions; j++) {
			visited[i].push(false);
		}
	}
	let pathU = Math.floor(random(horizontalSubdivisions));
	let pathV = Math.floor(random(verticalSubdivisions));
	visited[pathU][pathV] = true;
	combinedSubdivisions.push(subdivisions[pathU][pathV]);
	while (true) {
		let jumped = false;
		let newCoords = getNextPosition(pathU, pathV, visited, horizontalSubdivisions, verticalSubdivisions);
		if (newCoords == null) {
			newCoords = jump(shuffledCoords, visited);
			jumped = true;
		}
		if (newCoords == null) {
			break;
		}
		let newU = newCoords[0];
		let newV = newCoords[1];
		visited[newU][newV] = true;
		let currentSubdivision = subdivisions[pathU][pathV];
		let newSubdivision = subdivisions[newU][newV];
		let orientation = SQUARE;
		let currentUWidth = currentSubdivision.width / horizontalSubdivisionWidth;
		let currentVHeight = currentSubdivision.height / verticalSubdivisionHeight;
		if (currentUWidth > currentVHeight) {
			orientation = HORIZONTAL;
		} else if (currentVHeight > currentUWidth) {
			orientation = VERTICAL;
		}
		let newOrientation = SQUARE;
		if (newSubdivision.u == currentSubdivision.u) {
			newOrientation = VERTICAL;
		}
		if (newSubdivision.v == currentSubdivision.v) {
			newOrientation = HORIZONTAL;
		}
		if (!jumped && (orientation == newOrientation || orientation == SQUARE)) {
			let combined = combineSubdivisions(currentSubdivision, newSubdivision);
			for (let i = 0; i < combined.components.length; i++) {
				subdivisions[combined.components[i][0]][combined.components[i][1]] = combined;
			}
			if (combinedSubdivisions.includes(currentSubdivision)) {
				combinedSubdivisions.splice(combinedSubdivisions.indexOf(currentSubdivision), 1);
			}
			if (combinedSubdivisions.includes(newSubdivision)) {
				combinedSubdivisions.splice(combinedSubdivisions.indexOf(newSubdivision), 1);
			}
			combinedSubdivisions.push(combined);
		}
		pathU = newU;
		pathV = newV;
	}

	return combinedSubdivisions;
}


function combineSubdivisions(subdivision1, subdivision2) {
	let comps = subdivision1.components.concat(subdivision2.components);
	comps = [...new Set(comps)];
	return {u: Math.min(subdivision1.u, subdivision2.u), v: Math.min(subdivision1.v, subdivision2.v), x: Math.min(subdivision1.x, subdivision2.x), y: Math.min(subdivision1.y, subdivision2.y), width: Math.max(subdivision1.x + subdivision1.width, subdivision2.x + subdivision2.width) - Math.min(subdivision1.x, subdivision2.x), height: Math.max(subdivision1.y + subdivision1.height, subdivision2.y + subdivision2.height) - Math.min(subdivision1.y, subdivision2.y), components: comps, type: TYPE_CASTLE};
}

function getNextPosition(u, v, visited, horizontalSubdivisions, verticalSubdivisions) {
	let directions = [UP, DOWN, LEFT, RIGHT];
	shuffle(directions, true);
	for (let direction of directions) {
		let newU = u;
		let newV = v;
		switch (direction) {
			case UP:
				newV--;
				break;
			case DOWN:
				newV++;
				break;
			case LEFT:
				newU--;
				break;
			case RIGHT:
				newU++;
				break;
		}
		if (newU >= 0 && newU < horizontalSubdivisions && newV >= 0 && newV < verticalSubdivisions && !visited[newU][newV]) {
			return [newU, newV];
		}
	}
	return null;
}


function jump(shuffledCoords, visited) {
	if (shuffledCoords.length == 0) {
		return null;
	}
	let newCoords = shuffledCoords.pop();
	while (visited[newCoords[0]][newCoords[1]]) {
		if (shuffledCoords.length == 0) {
			return null;
		}
		newCoords = shuffledCoords.pop();
	}
	return newCoords;
}
