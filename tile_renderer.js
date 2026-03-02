/**
 * TileRenderer - Handles all tile and entity rendering, decoupled from tile data classes.
 * Tiles expose data; the renderer reads it and draws using p5.js primitives.
 */
class TileRenderer {

	drawDefaultBackground(tile, floorPlan) {
		let colors = [
			[ floorPlan.getColor(tile.x - 1, tile.y - 1), 
				floorPlan.getColor(tile.x, tile.y - 1),
				floorPlan.getColor(tile.x + 1, tile.y - 1)
			],
			[ floorPlan.getColor(tile.x - 1, tile.y),
				floorPlan.getColor(tile.x, tile.y),
				floorPlan.getColor(tile.x + 1, tile.y)
			],
			[ floorPlan.getColor(tile.x - 1, tile.y + 1),
				floorPlan.getColor(tile.x, tile.y + 1),
				floorPlan.getColor(tile.x + 1, tile.y + 1)
			]
		];
		let cornerColors = [ lerpArray(lerpArray(colors[0][0], colors[1][1], 0.5), lerpArray(colors[1][0], colors[0][1], 0.5), 0.5),
								lerpArray(lerpArray(colors[0][1], colors[1][2], 0.5), lerpArray(colors[1][1], colors[0][2], 0.5), 0.5),
								lerpArray(lerpArray(colors[1][0], colors[2][1], 0.5), lerpArray(colors[2][0], colors[1][1], 0.5), 0.5),
								lerpArray(lerpArray(colors[1][1], colors[2][2], 0.5), lerpArray(colors[2][1], colors[1][2], 0.5), 0.5)
		];

		beginShape(TESS);
		fill(arrayToColor(cornerColors[0]));
		noStroke();
		vertex(tile.x * GRID_SIZE_X, tile.y * GRID_SIZE_Y);
		fill(arrayToColor(cornerColors[1]));
		vertex((tile.x + 1) * GRID_SIZE_X, tile.y * GRID_SIZE_Y);
		fill(arrayToColor(cornerColors[3]));
		vertex((tile.x + 1) * GRID_SIZE_X, (tile.y + 1) * GRID_SIZE_Y);
		fill(arrayToColor(cornerColors[2]));
		vertex(tile.x * GRID_SIZE_X, (tile.y + 1) * GRID_SIZE_Y);
		endShape(CLOSE);
	}

	renderGradientQuad(x, y, cornerColors) {
		beginShape(TESS);
		fill(cornerColors[0]);
		noStroke();
		vertex(x * GRID_SIZE_X, y * GRID_SIZE_Y);
		fill(cornerColors[1]);
		vertex((x + 1) * GRID_SIZE_X, y * GRID_SIZE_Y);
		fill(cornerColors[2]);
		vertex((x + 1) * GRID_SIZE_X, (y + 1) * GRID_SIZE_Y);
		fill(cornerColors[3]);
		vertex(x * GRID_SIZE_X, (y + 1) * GRID_SIZE_Y);
		endShape(CLOSE);
	}

	renderTile(tile, floorPlan, asNeighbor = false, symbolOnly = false) {
		if (tile instanceof Lava) return this.renderLava(tile, floorPlan, asNeighbor, symbolOnly);
		if (tile instanceof Water) return this.renderWater(tile, floorPlan, asNeighbor, symbolOnly);
		if (tile instanceof Lamp) return this.renderLamp(tile, floorPlan, asNeighbor, symbolOnly);
		if (tile instanceof Wall) return this.renderWall(tile, floorPlan, asNeighbor, symbolOnly);
		if (tile instanceof Floor) return this.renderFloor(tile, floorPlan, asNeighbor, symbolOnly);
		// Other tile types (Spiderweb, Pit, etc.): no rendering (matches original Tile.render() no-op)
	}

	renderWall(tile, floorPlan, asNeighbor, symbolOnly) {
		let resultingLight = tile.light;
		if (tile.kind == tile.WOOD) {
			resultingLight = color(139, 69, 19);
		}

		fill(tile.light);
		stroke(tile.light);
		if (game.renderMode == LINE_OF_SIGHT) {
			fill(255);
			stroke(255);
		} else if (game.renderMode == LINE_OF_SIGHT_PLUS && !tile.hasLineOfSight) {
			fill(color(255, 200, 200));
			stroke(color(255, 200, 200));
		} else if (tile.hasBeenSeen && !tile.visible) {
			if (asNeighbor && !symbolOnly) {
				this.drawDefaultBackground(tile, floorPlan);
			}
			fill(MEMORY_LIGHT);
			stroke(MEMORY_LIGHT);
		} else if (!symbolOnly) {
			this.drawDefaultBackground(tile, floorPlan);
			fill(tile.light);
			stroke(tile.light);
		}
		let char = '#';
		// if (!asNeighbor) {
		if (tile.hasBeenSeen) {
			text(char, tile.x * GRID_SIZE_X, (tile.y + 1) * GRID_SIZE_Y);
		}
	}

	renderFloor(tile, floorPlan, asNeighbor, symbolOnly) {
		fill(tile.light);
		stroke(tile.light);
		if (game.renderMode == LINE_OF_SIGHT && tile.hasLineOfSight) {
			fill(255);
			stroke(255);
		} else if (game.renderMode == LINE_OF_SIGHT_PLUS && !tile.hasLineOfSight) {
			fill(color(255, 200, 200));
			stroke(color(255, 200, 200));
		} else if (game.renderMode == RECIPROCAL_LINE_OF_SIGHT) {
			if (tile.hasLineOfSight) {
				fill(255);
				stroke(255);
				text('O', tile.x * GRID_SIZE_X, (tile.y + 1) * GRID_SIZE_Y);
			    if (canSeePlayer(tile.x, tile.y)) {
					text('0', tile.x * GRID_SIZE_X, (tile.y + 1) * GRID_SIZE_Y);
				}				
			} else if (canSeePlayer(tile.x, tile.y)) {
				fill(255);
				stroke(255);
				text('/', tile.x * GRID_SIZE_X, (tile.y + 1) * GRID_SIZE_Y);
			} 
		} else if (tile.hasBeenSeen && !tile.visible) {
			if (asNeighbor && !symbolOnly) {
				this.drawDefaultBackground(tile, floorPlan);
			}
			fill(MEMORY_LIGHT);
			stroke(MEMORY_LIGHT);
		} else if (!symbolOnly) {
			this.drawDefaultBackground(tile, floorPlan);

			let c = color(tile.light[0], tile.light[1], tile.light[2]);
			fill(c);
			stroke(c);
		}
		if (!asNeighbor && tile.hasBeenSeen) {
			text('.', tile.x * GRID_SIZE_X + 3, (tile.y + 1) * GRID_SIZE_Y - 3);
		}
	}

	renderLamp(tile, floorPlan, asNeighbor, symbolOnly) {
		tile.updateFlickerFactor();
		fill(tile.getLight());
		stroke(tile.getLight());
		if (game.renderMode == LINE_OF_SIGHT && tile.hasLineOfSight) {
			fill(255);
			stroke(255);
		} else if (game.renderMode == LINE_OF_SIGHT_PLUS && !tile.hasLineOfSight) {
			fill(color(255, 200, 200));
			stroke(color(255, 200, 200));
		} else if (tile.hasBeenSeen && !tile.visible) {
			if (asNeighbor && !symbolOnly) {
				this.drawDefaultBackground(tile, floorPlan);
			}
			fill(MEMORY_LIGHT);
			stroke(MEMORY_LIGHT);
		} else if (!symbolOnly) {
			this.drawDefaultBackground(tile, floorPlan);

			fill(tile.light);
			stroke(tile.light);
		}
		if (!asNeighbor && tile.hasBeenSeen) {
			text('o', tile.x * GRID_SIZE_X, (tile.y + 1) * GRID_SIZE_Y);
		}
	}

	renderWater(tile, floorPlan, asNeighbor, symbolOnly) {
		// this.lightSource.updateFlickerFactor();
		let c = color(tile.light[0], tile.light[1], tile.light[2]);
		let ls = tile.lightSource.getLight();
		let lsc = color(ls[0], ls[1], ls[2]);
		// let useColor = lerpColor(lsc, c, 0.5);
		// fill(useColor);
		// stroke(useColor);
		if (game.renderMode == LINE_OF_SIGHT && tile.hasLineOfSight) {
			fill(255);
			stroke(255);
		} else if (game.renderMode == LINE_OF_SIGHT_PLUS && !tile.hasLineOfSight) {
			fill(color(255, 200, 200));
			stroke(color(255, 200, 200));
		} else if (tile.hasBeenSeen && !tile.visible) {
			if (asNeighbor && !symbolOnly) {
				this.drawDefaultBackground(tile, floorPlan);
			}
			fill(MEMORY_LIGHT);
			noStroke();
		} else if (!symbolOnly) {
			this.drawDefaultBackground(tile, floorPlan);
		}

		let tildeColor = lerpColor(lsc, color(0, 0, 64), 0.75);
		fill(tildeColor);
		stroke(tildeColor);
		if (game.renderMode == LINE_OF_SIGHT && tile.hasLineOfSight) {
			fill(128);
			stroke(128);
		} else if (game.renderMode == LINE_OF_SIGHT_PLUS && !tile.hasLineOfSight) {
			fill(color(255, 128, 128));
			stroke(color(255, 128, 128));
		} else if (tile.hasBeenSeen && !tile.visible) {
			fill(0, 0, 192);
			noStroke();
		}
		text('~', tile.x * GRID_SIZE_X, (tile.y + 1) * GRID_SIZE_Y);
	}

	renderLava(tile, floorPlan, asNeighbor, symbolOnly) {
		// this.updateFlickerFactor();
		fill(tile.getLight());
		stroke(tile.getLight());
		if (game.renderMode == LINE_OF_SIGHT && tile.hasLineOfSight) {
			fill(255);
			stroke(255);
		} else if (game.renderMode == LINE_OF_SIGHT_PLUS && !tile.hasLineOfSight) {
			fill(color(255, 200, 200));
			stroke(color(255, 200, 200));
		} else if (tile.hasBeenSeen && !tile.visible) {
			if (asNeighbor && !symbolOnly) {
				this.drawDefaultBackground(tile, floorPlan);
			} else {
				fill(0,255,0);
			}
			fill(MEMORY_LIGHT);
			noStroke();
		} else if (!symbolOnly) {
			this.drawDefaultBackground(tile, floorPlan);
		}
		let l = tile.lightSource.getLight();
		let c = color(l[0], l[1], l[2]);
		let caretColor = lerpColor(c, color(64, 0, 0), 0.75);
		fill(caretColor);
		stroke(caretColor);
		if (game.renderMode == LINE_OF_SIGHT && tile.hasLineOfSight) {
			fill(128);
			stroke(128);
		} else if (game.renderMode == LINE_OF_SIGHT_PLUS && !tile.hasLineOfSight) {
			fill(color(255, 128, 128));
			stroke(color(255, 128, 128));
		} else if (tile.hasBeenSeen && !tile.visible) {
			fill(255, 0, 0);
			noStroke();
		}
		text('~', tile.x * GRID_SIZE_X, (tile.y + 1) * GRID_SIZE_Y);
	}

	renderMonster(monster, floorPlan) {
		let tile = floorPlan.get(monster.x, monster.y);
		let brightness = (tile.light[0] + tile.light[1] + tile.light[2]) / 500;
		let thisColor = color(monster.color._getRed() * brightness, monster.color._getGreen() * brightness, monster.color._getBlue() * brightness);
		fill(thisColor);
		stroke(thisColor);
		text(monster.symbol, monster.x * GRID_SIZE_X, (monster.y + 1) * GRID_SIZE_Y);
	}
}

const tileRenderer = new TileRenderer();
