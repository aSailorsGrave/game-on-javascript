'use strict';

class Vector {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  plus(vector) {
    if(!(vector instanceof Vector)) {
      throw new Error('Ошибка в методе plus класса Vector');
    } else {
      let newVec = new Vector;
      newVec.x = this.x + vector.x;
      newVec.y = this.y + vector.y;
      return newVec;
    }
  }

  times(multiplier) {
    let newVec = new Vector;
    newVec.x = this.x * multiplier;
    newVec.y = this.y * multiplier;
    return newVec;
  }

};

/* const start = new Vector(30, 50);
const moveTo = new Vector(5, 10);
const finish = start.plus(moveTo.times(2));

console.log(`Исходное расположение: ${start.x}:${start.y}`);
console.log(`Текущее расположение: ${finish.x}:${finish.y}`);
console.log('\n____________________________\n\n')
// Исходное расположение: 30:50
// Текущее расположение: 40:70 */

class Actor {
  constructor(position = new Vector(0, 0), size = new Vector(1, 1), speed = new Vector(0, 0)) {
    if (!(position instanceof Vector) || !(size instanceof Vector) || !(speed instanceof Vector)) {
      throw new Error('Ошибка в конструкторе класса Actor');
    }

    this.pos = position;
    this.size = size;
    this.speed = speed;
  }
  
  act() {
  }

  get left() {
    return this.pos.x;
  }

  get top() {
    return this.pos.y;
  }

  get right() {
    return this.pos.x + this.size.x;
  }
  
  get bottom() {
    return this.pos.y + this.size.y;
  }

  get type() {
    return 'actor';
  }

  isIntersect(actor) {
    if(!(actor instanceof Actor)) {
      throw new Error('Ошибка в методе isIntersect класса Actor');
    }

    if(actor === this) {
      return false;
    }

    if(actor.left < this.right && actor.right > this.left && actor.bottom > this.top && actor.top < this.bottom) {
      return true;
    } else {
      return false;
    }
  }
};

/* const items = new Map();
const player = new Actor();
items.set('Игрок', player);
items.set('Первая монета', new Actor(new Vector(10, 10)));
items.set('Вторая монета', new Actor(new Vector(15, 5)));

function position(item) {
  return ['left', 'top', 'right', 'bottom']
    .map(side => `${side}: ${item[side]}`)
    .join(', ');  
}

function movePlayer(x, y) {
  player.pos = player.pos.plus(new Vector(x, y));
}

function status(item, title) {
  console.log(`${title}: ${position(item)}`);
  if (player.isIntersect(item)) {
    console.log(`Игрок подобрал ${title}`);
  }
}

items.forEach(status);
movePlayer(10, 10);
items.forEach(status);
movePlayer(5, -5);
items.forEach(status); */

class Level {
  constructor(grid = [], actors = []) {
    this.grid = grid;
    this.actors = actors;
    this.player = actors.find(actor => actor.type === 'player');
    this.height = grid.length;
    this.width = Math.max(0, ...this.grid.map(str => str.length));
    this.status = null;
    this.finishDelay = 1;
  }

  isFinished() {
    if(this.status !== null && this.finishDelay < 0) {
      return true;
    } else {
      return false;
    }
  }

  actorAt(actor) {
    if (!(actor instanceof Actor)) {
      throw new Error('Ошибка в методе actorAt класса Level');
    }

    return this.actors.find(char => actor.isIntersect(char));
  }

  obstacleAt(position, size) {
    if(!(position instanceof Vector) || !(size instanceof Vector)) {
      throw new Error('Ошибка в методе obstacleAt класса actorAt')
    }

    let leftFrontier = Math.floor(position.x);
    let rightFrontier = Math.ceil(position.x + size.x);
    let topFrontier = Math.floor(position.y);
    let bottomFrontier = Math.ceil(position.y + size.y);

    if (this.width < rightFrontier || leftFrontier < 0 || topFrontier < 0) {
      return 'wall';
    }

    if (bottomFrontier > this.height) {
      return 'lava';
    }

    for(let j = topFrontier; j < bottomFrontier; j++) {
      for(let k = leftFrontier; k < rightFrontier; k++) {
        let field = this.grid[j][k];
        if(field) {
          return field;
        }
      }
    }
  }

  removeActor(actor) {
    let index = this.actors.indexOf(actor);
		if(index !== -1) {
			this.actors.splice(index, 1);
		}
  }

  noMoreActors(type) {
    if(this.actors.length === 0) {
      return true;
    }

    for(let act of this.actors) {
      if(act.type === type) {
        return false;
      }
    }
    return true;  
  }

  playerTouched(obstacleType, actor) {
    if(this.status !== null) {
			return;
		}
		
		if(obstacleType === 'lava' || obstacleType === 'fireball') {
			this.status = 'lost';
		}

		if (obstacleType === 'coin') {
			this.removeActor(actor);
			if (this.noMoreActors('coin')) {
				this.status = 'won';
			}
		}    
  }
};

/* const grid = [
  [undefined, undefined],
  ['wall', 'wall']
];

function MyCoin(title) {
  this.type = 'coin';
  this.title = title;
}
MyCoin.prototype = Object.create(Actor);
MyCoin.constructor = MyCoin;

const goldCoin = new MyCoin('Золото');
const bronzeCoin = new MyCoin('Бронза');
const player = new Actor();
const fireball = new Actor();

const level = new Level(grid, [ goldCoin, bronzeCoin, player, fireball ]);

level.playerTouched('coin', goldCoin);
level.playerTouched('coin', bronzeCoin);

if (level.noMoreActors('coin')) {
  console.log('Все монеты собраны');
  console.log(`Статус игры: ${level.status}`);
}

const obstacle = level.obstacleAt(new Vector(1, 1), player.size);
if (obstacle) {
  console.log(`На пути препятствие: ${obstacle}`);
}

const otherActor = level.actorAt(player);
if (otherActor === fireball) {
  console.log('Пользователь столкнулся с шаровой молнией');
} */

class LevelParser {
  constructor(fieldObjects) {
    this.fieldObjects = fieldObjects;
  }

  actorFromSymbol(symbolFromField) {
    if(typeof symbolFromField !== 'string') {
      return undefined;
    }
    return this.fieldObjects[symbolFromField];
  }

  obstacleFromSymbol(symbolFromField) {
    if(symbolFromField === 'x') {
      return 'wall';
    } else if(symbolFromField === '!') {
      return 'lava';
    } else {
      return undefined;
    }
  }

  createGrid(plan) {
    if(plan === undefined || plan.length === 0) {
			return [];
		}
		
		let grid = [];

		for(let i = 0; i < plan.length; i++) {
			let strs = plan[i];
			let line = [];
			for(let k = 0; k < strs.length; k++) {
				line.push(this.obstacleFromSymbol(strs[k]));
			}
			grid.push(line);
		}

		return grid;
  }

  createActors(plan) {
    if(plan === undefined || plan.length === 0) {
			return [];
		}

		let actors = [];

		for(let i = 0; i < plan.length; i++) {
			let strs = plan[i];
			for(let k = 0; k < strs.length; k++) {
				if(!(this.fieldObjects) || Object.keys(this.fieldObjects).length === 0 || !(strs[k] in this.fieldObjects)) {
					continue;
				}
				let ActorConstructor = this.actorFromSymbol(strs[k]);
				if(!ActorConstructor) {
					continue;
				}
				if(Actor.prototype === ActorConstructor.prototype || Actor.prototype.isPrototypeOf(ActorConstructor.prototype)) {
					actors.push(new ActorConstructor(new Vector(k, i)));
				}
			}
		}
		return actors;
  }

  parse(plan) {
		return new Level(this.createGrid(plan), this.createActors(plan));
	}
};

/* const plan = [
  ' @ ',
  'x!x'
];

const actorsDict = Object.create(null);
actorsDict['@'] = Actor;

const parser = new LevelParser(actorsDict);
const level = parser.parse(plan);

level.grid.forEach((line, y) => {
  line.forEach((cell, x) => console.log(`(${x}:${y}) ${cell}`));
});

level.actors.forEach(actor => console.log(`(${actor.pos.x}:${actor.pos.y}) ${actor.type}`)); */

class Fireball extends Actor {
  constructor(pos = new Vector(0,0), speed = new Vector(0,0)) {
    super(pos);
    this.speed = speed;
    this.size = new Vector(1, 1);
  }

  get type() {
    return 'fireball';
  }
  
  getNextPosition(time = 1) {
    return new Vector(this.pos.x + this.speed.x * time, this.pos.y + this.speed.y * time);
  }

  handleObstacle() {
    this.speed = new Vector(-this.speed.x, -this.speed.y);
  }

  act(time, level) {
    let nextPos = this.getNextPosition(time);
    if(level.obstacleAt(nextPos, this.size)) {
      this.handleObstacle();
    } else {
      this.pos = nextPos;
    }
  }
};

/* const time = 5;
const speed = new Vector(1, 0);
const position = new Vector(5, 5);

const ball = new Fireball(position, speed);

const nextPosition = ball.getNextPosition(time);
console.log(`Новая позиция: ${nextPosition.x}: ${nextPosition.y}`);

ball.handleObstacle();
console.log(`Текущая скорость: ${ball.speed.x}: ${ball.speed.y}`); */

class HorizontalFireball extends Fireball {
  constructor(pos = new Vector(0,0)) {
    super(pos);
    this.speed = new Vector(2, 0);
  }
};

class VerticalFireball extends Fireball {
  constructor(pos = new Vector(0,0)) {
    super(pos);
    this.speed = new Vector(0, 2);
  }
};

class FireRain extends Fireball {
  constructor(pos = new Vector(0,0)) {
    super(pos);
    this.speed = new Vector(0, 3);    
    this.initialPos = this.pos;
  }

  handleObstacle() {
    this.pos = this.initialPos;
  }
};

class Coin extends Actor {
  constructor(pos = new Vector(0,0)) {
    super(pos.plus(new Vector(0.2, 0.1)), new Vector(0.6, 0.6));
    this.springSpeed = 8;
    this.springDist = 0.07;
    this.spring = Math.random() * Math.PI * 2;
    this.initialPos = this.pos;
  }

  get type() {
    return 'coin';
  }

  updateSpring(time = 1) {
    this.spring += this.springSpeed * time;
  }

  getSpringVector() {
    return new Vector(0, Math.sin(this.spring) * this.springDist);
  }

  getNextPosition(time = 1) {
    this.spring += this.springSpeed * time;
    return this.initialPos.plus(this.getSpringVector());
  }

  act(time) {
    this.pos = this.getNextPosition(time);
  }
};

class Player extends Actor {
  constructor(pos){
		super(pos, new Vector(0.8, 1.5));
		this.pos = this.pos.plus(new Vector(0, -0.5));
	}

  get type() {
    return 'player';
  }
};

const schemas = [
  [
    ' =                    ',
    '                      ',
    '                      ',
    '            !       o ',
    '     !xxx      xxxxxxx',
    ' @                    ',
    'xxx!      xxxx        ',
    '                      ',
    '                      ',
    '                      '
  ],
  [
    '         v   v   ',
    '                 ',
    '                 ',
    '      v         o',
    '               xx',
    '@      xxxxx     ',
    'xxxxx            ',
    '                 ',
    '                 ',
    '                 ',
    '                 '
  ],
  [
    '                           ',
    ' |                o        ',
    '                  xxxx     ',
    '      v                    ',
    '                        xxx',
    '@                    xxx   ',
    'xxxxx                      ',
    ' |            xxxxx        ',
    '|       o                  ',
    '      xxxxxx!              ',
    '                           ',
    '                           ',
    '                            '
  ]
];

const actorDict = {
  '@': Player,
  'v': FireRain,
  'o': Coin,
  '=': Fireball,
  '|': VerticalFireball
};

const parser = new LevelParser(actorDict);
runGame(schemas, parser, DOMDisplay)
  .then(() => alert('Вы выиграли приз!'));