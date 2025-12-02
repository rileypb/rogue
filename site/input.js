
class InputEngine {
	init() {

	}

	teardown() {

	}
}

class OutdoorInputEngine extends InputEngine {

}

class IndoorInputEngine extends InputEngine {

}

OUTDOOR_INPUT = new OutdoorInputEngine();
INDOOR_INPUT = new IndoorInputEngine();