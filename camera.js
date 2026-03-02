/**
 * Camera — Owns viewport state (scroll position, canvas size).
 * Replaces the scattered drawLeft/drawTop/drawRight/drawBottom/CANVAS_WIDTH/CANVAS_HEIGHT globals.
 */
class Camera {
	constructor() {
		this.left = 0;
		this.top = 0;
		this.right = 0;
		this.bottom = 0;
		this.canvasWidth = 0;
		this.canvasHeight = 0;
		this.mapPixelWidth = GRID_SIZE_X * MAP_WIDTH;
		this.mapPixelHeight = GRID_SIZE_Y * MAP_HEIGHT;
	}

	/**
	 * Update the camera to center on (playerX, playerY), clamped to map bounds.
	 */
	update(playerX, playerY) {
		this.left = GRID_SIZE_X * playerX - this.canvasWidth / 2;
		if (this.left < 0) {
			this.left = 0;
		}
		this.right = this.left + this.canvasWidth;
		if (this.right > this.mapPixelWidth) {
			this.right = this.mapPixelWidth;
			this.left = this.right - this.canvasWidth;
		}

		this.top = GRID_SIZE_Y * playerY - this.canvasHeight / 2;
		if (this.top < 0) {
			this.top = 0;
		}
		this.bottom = this.top + this.canvasHeight;
		if (this.bottom > this.mapPixelHeight) {
			this.bottom = this.mapPixelHeight;
			this.top = this.bottom - this.canvasHeight;
		}
	}
}
