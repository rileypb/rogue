
class Monster {
	constructor(name, symbol, color, health, attack, defense, speed, lightSource, visionThreshold) {
		this.name = name;
		this.symbol = symbol;
		this.color = color;
		this.health = health;
		this.attack = attack;
		this.defense = defense;
		this.speed = speed;
		this.lightSource = lightSource;
		this.visionThreshold = visionThreshold !== undefined ? visionThreshold : LIGHT_THRESHOLD;
		this.x = 0;
		this.y = 0;
		this.targetX = null;
		this.targetY = null;
	}

	canSeeTile(tile) {
		return tile.hasLineOfSight &&
			(tile.light[0] + tile.light[1] + tile.light[2]) > this.visionThreshold;
	}

	move(dx, dy, floorPlan) {
		let newX = this.x + dx;
		let newY = this.y + dy;
		let newTile = floorPlan.get(newX, newY);
		if (newTile === null || newTile === undefined) {
			return false;
		}
		if (!newTile.isEnterable()) {
			return false;
		}
		// Cannot move onto the player
		if (newX === game.state.player.x && newY === game.state.player.y) {
			return false;
		}
		// Cannot move onto another monster
		for (let m of floorPlan.monsters) {
			if (m !== this && m.x === newX && m.y === newY) {
				return false;
			}
		}
		this.x = newX;
		this.y = newY;
		return true;
	}

	act(floorPlan) {
		// Default: do nothing
	}
}

class Goblin extends Monster {
	static LAVA_AVOID_RANGE = 10;

	constructor(x, y) {
		super("Goblin", "g", color(0, 255, 0), 10, 2, 1, 1, null, LIGHT_THRESHOLD);
		this.x = x;
		this.y = y;
	}

	act(floorPlan) {
		let player = game.state.player;
		let myTile = floorPlan.get(this.x, this.y);

		// Check if goblin can see the player (symmetric LOS + light level)
		let playerTile = floorPlan.get(player.x, player.y);
		let canSeePlayer = this.canSeeTile(myTile) && this.canSeeTile(playerTile);

		if (canSeePlayer) {
			// Update target to player's current position
			this.targetX = player.x;
			this.targetY = player.y;
		}

		// Collect valid adjacent moves (no water)
		let candidates = this.getValidMoves(floorPlan);
		if (candidates.length === 0) return; // stuck

		// Priority 1: Lava avoidance (filter out moves that go closer to lava)
		let lavaPositions = this.findNearbyLava(floorPlan);
		if (lavaPositions.length > 0) {
			let currentMinLavaDist = this.minLavaDistance(this.x, this.y, lavaPositions);
			// Only keep moves that don't get closer to lava
			let safeCandidates = candidates.filter(c =>
				this.minLavaDistance(c.x, c.y, lavaPositions) >= currentMinLavaDist
			);
			if (safeCandidates.length > 0) {
				candidates = safeCandidates;
			}
			// If all moves go closer to lava, keep all candidates (don't get completely stuck)
		}

		// Priority 2: Chase player or move to last known position
		if (this.targetX !== null) {
			let bestDist = Infinity;
			let chaseCandidates = [];
			for (let c of candidates) {
				let dist = Math.sqrt((c.x - this.targetX) ** 2 + (c.y - this.targetY) ** 2);
				if (dist < bestDist) {
					bestDist = dist;
					chaseCandidates = [c];
				} else if (dist === bestDist) {
					chaseCandidates.push(c);
				}
			}
			let choice = chaseCandidates[Math.floor(Math.random() * chaseCandidates.length)];
			this.move(choice.dx, choice.dy, floorPlan);

			// Clear target if we've reached the last known position
			if (this.x === this.targetX && this.y === this.targetY) {
				this.targetX = null;
				this.targetY = null;
			}
		} else {
			// Priority 3: Random movement
			let choice = candidates[Math.floor(Math.random() * candidates.length)];
			this.move(choice.dx, choice.dy, floorPlan);
		}
	}

	getValidMoves(floorPlan) {
		let candidates = [];
		for (let dx = -1; dx <= 1; dx++) {
			for (let dy = -1; dy <= 1; dy++) {
				if (dx === 0 && dy === 0) continue;
				let nx = this.x + dx;
				let ny = this.y + dy;
				let tile = floorPlan.get(nx, ny);
				if (!tile) continue;
				if (!tile.isEnterable()) continue;
				if (tile instanceof Water) continue;
				candidates.push({ dx, dy, x: nx, y: ny });
			}
		}
		return candidates;
	}

	minLavaDistance(x, y, lavaPositions) {
		let min = Infinity;
		for (let lp of lavaPositions) {
			let dist = Math.sqrt((x - lp.x) ** 2 + (y - lp.y) ** 2);
			if (dist < min) min = dist;
		}
		return min;
	}

	findNearbyLava(floorPlan) {
		let range = Goblin.LAVA_AVOID_RANGE;
		let lavaPositions = [];
		let minX = Math.max(0, this.x - range);
		let maxX = Math.min(MAP_WIDTH - 1, this.x + range);
		let minY = Math.max(0, this.y - range);
		let maxY = Math.min(MAP_HEIGHT - 1, this.y + range);
		for (let x = minX; x <= maxX; x++) {
			for (let y = minY; y <= maxY; y++) {
				let dist = Math.sqrt((x - this.x) ** 2 + (y - this.y) ** 2);
				if (dist <= range) {
					let tile = floorPlan.get(x, y);
					if (tile instanceof Lava) {
						lavaPositions.push({ x, y });
					}
				}
			}
		}
		return lavaPositions;
	}
}