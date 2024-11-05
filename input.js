class InputTask extends Task {
	INITIAL_DELAY = 30;
	DELAY = 8;

	constructor() {
		super("Input Task");
		this.countdown = 1;
		this.emittedKeyCode = null;

		this.repeating = false;
	}

	run() {
		if (this.repeating == false) {
			if (keyIsPressed) {
				this.emittedKeyCode = keyCode;
				this.repeating = true;
				this.countdown = this.INITIAL_DELAY;
			} else {
				this.countdown = 1;
			}
		} else {
			this.emittedChar = null;
			if (!keyIsPressed) {
				this.repeating = false;
				this.countdown = 1;
			} else {
				this.emittedKeyCode = keyCode;
				this.countdown = this.DELAY;
			}
		}
		return 0;
	}

	noRun() {
		this.emittedKeyCode = null;
	}
}