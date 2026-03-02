/**
 * Command pattern for game actions.
 * All actor actions (player or AI) are represented as Command objects.
 * Commands are created by input resolution or AI, then executed by the turn system.
 */

class Command {
	/**
	 * Execute this command for the given actor on the given floor.
	 * @param {Player|Monster} actor - The actor performing the action
	 * @param {FloorPlan} floor - The current floor
	 * @returns {boolean} true if the action succeeded (costs a turn)
	 */
	execute(actor, floor) {
		return false;
	}
}

class MoveCommand extends Command {
	constructor(dx, dy) {
		super();
		this.dx = dx;
		this.dy = dy;
	}

	execute(actor, floor) {
		return actor.move(this.dx, this.dy, floor);
	}
}

class WaitCommand extends Command {
	execute(actor, floor) {
		return true; // waiting always succeeds and costs a turn
	}
}

// --- Input resolution ---

const KEY_TO_COMMAND = {};

function initKeyBindings() {
	KEY_TO_COMMAND[Q] = new MoveCommand(-1, -1);
	KEY_TO_COMMAND[W] = new MoveCommand( 0, -1);
	KEY_TO_COMMAND[E] = new MoveCommand( 1, -1);
	KEY_TO_COMMAND[A] = new MoveCommand(-1,  0);
	KEY_TO_COMMAND[S] = new WaitCommand();
	KEY_TO_COMMAND[D] = new MoveCommand( 1,  0);
	KEY_TO_COMMAND[Z] = new MoveCommand(-1,  1);
	KEY_TO_COMMAND[X] = new MoveCommand( 0,  1);
	KEY_TO_COMMAND[C] = new MoveCommand( 1,  1);
}

/**
 * Map a keyCode to a Command, or null if unmapped.
 */
function resolveInput(keyCode) {
	return KEY_TO_COMMAND[keyCode] || null;
}

// --- Turn execution ---

/**
 * Execute a single turn for the given actor, then update vision and lighting.
 * @param {Command} command
 * @param {Player|Monster} actor
 * @param {GameState} state
 * @returns {boolean} true if the command succeeded
 */
function executeTurn(command, actor, state) {
	let floor = state.currentFloor();
	let success = command.execute(actor, floor);
	if (success) {
		endTurn(state);
	}
	return success;
}

/**
 * Post-turn bookkeeping: recalculate LOS, lighting, visibility, and redraw.
 */
function endTurn(state) {
	let floor = state.currentFloor();
	// Compute player LOS first so monsters can use it for awareness
	state.player.calculateLineOfSight(floor);
	// All monsters act (using current LOS)
	for (let monster of floor.monsters) {
		monster.act(floor);
	}
	// Remove dead monsters
	floor.monsters = floor.monsters.filter(m => m.health > 0);
	updateLight(floor, state.player);
	state.player.calculateSight(floor);
	// Cancel auto-move if a monster newly came into view
	if (game.autoMoveTask.autoMoveInProgress) {
		for (let monster of floor.monsters) {
			let tile = floor.get(monster.x, monster.y);
			if (tile.visible && !monster.wasVisible) {
				game.autoMoveTask.autoMoveInProgress = false;
				break;
			}
		}
	}
	// Update visibility tracking for all monsters
	for (let monster of floor.monsters) {
		monster.wasVisible = floor.get(monster.x, monster.y).visible;
	}
	display();
}
