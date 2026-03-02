
class Monster {
	constructor(name, symbol, color, health, attack, defense, speed, lightSource) {
		this.name = name;
		this.symbol = symbol;
		this.color = color;
		this.health = health;
		this.attack = attack;
		this.defense = defense;
		this.speed = speed;
		this.lightSource = lightSource;
		this.x = 0;
		this.y = 0;
	}
}

class Goblin extends Monster {
	constructor(x, y) {
		super("Goblin", "g", color(0, 255, 0), 10, 2, 1, 1, null);
		this.x = x;
		this.y = y;
	}
}