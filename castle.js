
const TYPE_CASTLE = 0;

const SQUARE = 0;
const HORIZONTAL = 1;
const VERTICAL = 2;

const UP = 0;
const DOWN = 1;
const LEFT = 2;
const RIGHT = 3;


function generateCastle(floorPlan) {
  let subdivision = [{x: 0, y: 0, width: floorPlan.width, height: floorPlan.height, type: TYPE_CASTLE}];

  generateSubdivision(floorPlan, subdivision);
}

function generateSubdivision(floorPlan, subdivision) {
	switch (subdivision[0].type) {
		case TYPE_CASTLE:
			generateCastleSubdivision(floorPlan, subdivision);
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

	// make some rooms
	// for each subdivision, make a room
	// floorPlan.tiles = [];
	// let x = 1/0;
	for (let x = 0; x < floorPlan.width; x++) {
		for (let y = 0; y < floorPlan.height; y++) {
			floorPlan.get(x, y).material = 3;
		}
	}
	for (let sub of combinedSubdivisions) {
		let roomWidth = sub.width;
		let roomHeight = sub.height;
		let roomX = sub.x;
		let roomY = sub.y;
		let type = Math.floor(random(4));
		for (let i = roomX; i < roomX + roomWidth; i++) {
			for (let j = roomY; j < roomY + roomHeight; j++) {
				floorPlan.get(i,j).material = type;
				// floorPlan.tiles[floorPlan.tiles.length - 1].type = type;
			}
		}
	}
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
