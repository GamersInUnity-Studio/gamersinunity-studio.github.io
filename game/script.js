class AsteroidsGame {
  constructor(config) {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.config = config;
    this.colors = config.colors;

    this.gameRunning = false;
    this.score = 0;
    this.highScore = this.loadHighScore();
    this.lives = config.lives.initial;
    this.level = 1;
    this.gameOverMessages = [];

    this.keys = {
      left: false,
      right: false,
      up: false,
      down: false,
      shoot: false,
      brake: false
    };

    this.lastShot = 0;
    this.ship = null;
    this.bullets = [];
    this.asteroids = [];
    this.particles = [];
    this.asteroidCount = config.asteroids.initialCount;

    this.init();
  }

  async loadGameOverMessages() {
    try {
      const response = await fetch('data/messages.json');
      if (response.ok) {
        const data = await response.json();
        this.gameOverMessages = data.gameOverMessages || [];
      }
    } catch (e) {
      this.gameOverMessages = [];
    }
  }

  loadHighScore() {
    try {
      const name = 'asteroidsHighScore=';
      const decodedCookie = decodeURIComponent(document.cookie);
      const cookies = decodedCookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i].trim();
        if (cookie.indexOf(name) === 0) {
          const value = cookie.substring(name.length);
          return parseInt(value, 10) || 0;
        }
      }
      return 0;
    } catch (e) {
      return 0;
    }
  }

  saveHighScore(score) {
    try {
      const d = new Date();
      d.setTime(d.getTime() + (365 * 24 * 60 * 60 * 1000));
      document.cookie = 'asteroidsHighScore=' + score + ';expires=' + d.toUTCString() + ';path=/';
    } catch (e) {
      console.warn('Could not save high score:', e);
    }
  }

  init() {
    this.updateHighScoreDisplay();
    this.setupEventListeners();
    this.loadGameOverMessages();
    this.startNewGame();
  }

  updateHighScoreDisplay() {
    document.getElementById('highScore').textContent = this.highScore;
  }

  setupEventListeners() {
    document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    document.addEventListener('keyup', (e) => this.handleKeyUp(e));
    this.canvas.addEventListener('click', () => this.handleClick());
  }

  handleKeyDown(e) {
    const keyMap = {
      'ArrowLeft': 'left', 'KeyA': 'left',
      'ArrowRight': 'right', 'KeyD': 'right',
      'ArrowUp': 'up', 'KeyW': 'up',
      'ArrowDown': 'down', 'KeyS': 'down',
      'Space': 'shoot',
      'ShiftLeft': 'brake', 'ShiftRight': 'brake'
    };

    if (keyMap[e.code]) {
      if (e.code === 'Space') e.preventDefault();
      this.keys[keyMap[e.code]] = true;
    }
  }

  handleKeyUp(e) {
    const keyMap = {
      'ArrowLeft': 'left', 'KeyA': 'left',
      'ArrowRight': 'right', 'KeyD': 'right',
      'ArrowUp': 'up', 'KeyW': 'up',
      'ArrowDown': 'down', 'KeyS': 'down',
      'Space': 'shoot',
      'ShiftLeft': 'brake', 'ShiftRight': 'brake'
    };

    if (keyMap[e.code]) {
      this.keys[keyMap[e.code]] = false;
    }
  }

  handleClick() {
    if (this.gameRunning) {
      const bullet = this.ship.shoot(this.config.bullet, this);
      if (bullet) this.bullets.push(bullet);
    }
  }

  startNewGame() {
    this.ship = new Ship(this.config.ship, this.canvas, this);
    this.bullets = [];
    this.asteroids = [];
    this.particles = [];
    this.score = 0;
    this.lives = this.config.lives.initial;
    this.level = 1;
    this.asteroidCount = this.config.asteroids.initialCount;

    document.getElementById('currentScore').textContent = this.score;
    document.getElementById('lives').textContent = this.lives;
    document.getElementById('gameOverScreen').classList.remove('visible');

    this.spawnAsteroids();
    this.showLevelText();
    this.gameRunning = true;
    this.gameLoop();
  }

  spawnAsteroids() {
    this.asteroids = [];
    for (let i = 0; i < this.asteroidCount; i++) {
      let x, y;
      do {
        x = Math.random() * this.canvas.width;
        y = Math.random() * this.canvas.height;
      } while (this.distance(x, y, this.ship.x, this.ship.y) < this.config.asteroids.spawnDistance);
      this.asteroids.push(new Asteroid(x, y, 'large', this.config.asteroids, this));
    }
  }

  distance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  }

  checkCollisions() {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      for (let j = this.asteroids.length - 1; j >= 0; j--) {
        if (this.distance(this.bullets[i].x, this.bullets[i].y, this.asteroids[j].x, this.asteroids[j].y) < this.asteroids[j].radius) {
          this.destroyAsteroid(i, j);
          break;
        }
      }
    }

    if (!this.ship.invincible) {
      for (let asteroid of this.asteroids) {
        if (this.distance(this.ship.x, this.ship.y, asteroid.x, asteroid.y) < asteroid.radius + this.ship.radius - 5) {
          this.shipHit();
          break;
        }
      }
    }
  }

  destroyAsteroid(bulletIndex, asteroidIndex) {
    const asteroid = this.asteroids[asteroidIndex];
    const newAsteroids = asteroid.break();
    const sizeConfig = this.config.asteroids.sizes[asteroid.size];

    this.asteroids.splice(asteroidIndex, 1);
    this.bullets.splice(bulletIndex, 1);

    this.score += sizeConfig.points;
    document.getElementById('currentScore').textContent = this.score;

    for (let k = 0; k < this.config.particles.count; k++) {
      this.particles.push(new Particle(asteroid.x, asteroid.y, this.colors.mauve, this.config.particles));
    }

    this.asteroids.push(...newAsteroids);
  }

  shipHit() {
    this.lives--;
    document.getElementById('lives').textContent = this.lives;

    for (let k = 0; k < this.config.lives.explosionCount; k++) {
      this.particles.push(new Particle(this.ship.x, this.ship.y, this.colors.peach, this.config.particles));
    }

    if (this.lives <= 0) {
      this.gameOver();
    } else {
      this.ship.reset();
    }
  }

  checkLevelComplete() {
    if (this.asteroids.length === 0) {
      this.level++;
      this.asteroidCount = this.config.asteroids.initialCount + this.level;
      this.showLevelText();
      this.spawnAsteroids();
    }
  }

  showLevelText() {
    const levelText = document.getElementById('levelText');
    levelText.textContent = `LEVEL ${this.level}`;
    levelText.classList.add('visible');
    setTimeout(() => {
      levelText.classList.remove('visible');
    }, this.config.levels.levelTransitionDuration);
  }

  gameOver() {
    this.gameRunning = false;
    document.getElementById('finalScore').textContent = this.score;

    const messages = this.gameOverMessages.length > 0 ? this.gameOverMessages : [
      'Better luck next time!',
      'The void wins...',
      'Space is harsh, huh?',
      'Respawn and try again!'
    ];

    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.saveHighScore(this.highScore);
      document.getElementById('newHighScoreText').innerHTML = '<span class="new-high-score">NEW HIGH SCORE!</span>';
    } else if (this.score > 0) {
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      document.getElementById('newHighScoreText').textContent = randomMessage;
    } else {
      document.getElementById('newHighScoreText').textContent = 'At least you tried!';
    }

    document.getElementById('gameOverScreen').classList.add('visible');
  }

  drawStars() {
    const time = Date.now() / 1000;
    for (let i = 0; i < this.config.stars.count; i++) {
      const x = (i * 137 + time * this.config.stars.twinkleSpeed) % this.canvas.width;
      const y = (i * 97) % this.canvas.height;
      const size = (Math.sin(time + i) + 1) * 0.5 + 0.5;
      this.ctx.globalAlpha = this.config.stars.baseOpacity + size * (this.config.stars.maxOpacity - this.config.stars.baseOpacity);
      this.ctx.beginPath();
      this.ctx.arc(x, y, size, 0, Math.PI * 2);
      this.ctx.fillStyle = this.colors.text;
      this.ctx.fill();
    }
    this.ctx.globalAlpha = 1;
  }

  gameLoop() {
    if (!this.gameRunning) return;

    this.ctx.fillStyle = this.colors.base;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.drawStars();

    this.ship.update(this.keys, this.colors);
    this.ship.draw(this.ctx, this.colors);

    this.bullets = this.bullets.filter(bullet => bullet.update(this.canvas));
    this.bullets.forEach(bullet => bullet.draw(this.ctx, this.colors));

    this.asteroids.forEach(asteroid => {
      asteroid.update(this.canvas);
      asteroid.draw(this.ctx, this.colors);
    });

    this.particles = this.particles.filter(particle => particle.update());
    this.particles.forEach(particle => particle.draw(this.ctx));

    this.checkCollisions();
    this.checkLevelComplete();

    if (this.keys.shoot) {
      const bullet = this.ship.shoot(this.config.bullet, this);
      if (bullet) this.bullets.push(bullet);
    }

    requestAnimationFrame(() => this.gameLoop());
  }
}

class Ship {
  constructor(config, canvas, game) {
    this.x = canvas.width / 2;
    this.y = canvas.height / 2;
    this.radius = config.radius;
    this.angle = config.angle;
    this.velocityX = 0;
    this.velocityY = 0;
    this.rotationSpeed = config.rotationSpeed;
    this.thrust = config.thrust;
    this.friction = config.friction;
    this.invincible = false;
    this.invincibleTimer = 0;
    this.visible = true;
    this.blinkTimer = 0;
    this.blinkRate = config.blinkRate;
    this.game = game;
  }

  update(keys, colors) {
    if (keys.left) this.angle -= this.rotationSpeed;
    if (keys.right) this.angle += this.rotationSpeed;

    if (keys.up) {
      this.velocityX += Math.cos(this.angle) * this.thrust;
      this.velocityY += Math.sin(this.angle) * this.thrust;
    }

    if (keys.down) {
      this.velocityX -= Math.cos(this.angle) * this.thrust * 0.5;
      this.velocityY -= Math.sin(this.angle) * this.thrust * 0.5;
    }

    if (keys.brake) {
      this.velocityX *= 0.95;
      this.velocityY *= 0.95;
    }

    this.velocityX *= this.friction;
    this.velocityY *= this.friction;

    this.x += this.velocityX;
    this.y += this.velocityY;

    if (this.x < 0) this.x = this.game.canvas.width;
    if (this.x > this.game.canvas.width) this.x = 0;
    if (this.y < 0) this.y = this.game.canvas.height;
    if (this.y > this.game.canvas.height) this.y = 0;

    if (this.invincible) {
      this.invincibleTimer--;
      if (this.invincibleTimer <= 0) {
        this.invincible = false;
      }
      this.blinkTimer++;
      this.visible = Math.floor(this.blinkTimer / this.blinkRate) % 2 === 0;
    }
  }

  draw(ctx, colors) {
    if (!this.visible) return;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    const isThrusting = this.velocityX !== 0 || this.velocityY !== 0;

    ctx.strokeStyle = isThrusting ? colors.peach : colors.text;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(20, 0);
    ctx.lineTo(-15, -12);
    ctx.lineTo(-8, 0);
    ctx.lineTo(-15, 12);
    ctx.closePath();
    ctx.stroke();

    if (isThrusting) {
      ctx.beginPath();
      ctx.moveTo(-10, 0);
      ctx.lineTo(-25 - Math.random() * 10, -7);
      ctx.moveTo(-10, 0);
      ctx.lineTo(-25 - Math.random() * 10, 7);
      ctx.strokeStyle = Math.random() > 0.5 ? colors.yellow : colors.peach;
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    ctx.restore();
  }

  shoot(config, game) {
    const now = Date.now();
    if (now - game.lastShot < config.cooldown) return null;
    game.lastShot = now;

    return new Bullet(
      this.x + Math.cos(this.angle) * 20,
      this.y + Math.sin(this.angle) * 20,
      this.angle,
      config
    );
  }

  reset() {
    this.x = this.game.canvas.width / 2;
    this.y = this.game.canvas.height / 2;
    this.velocityX = 0;
    this.velocityY = 0;
    this.angle = -Math.PI / 2;
    this.invincible = true;
    this.invincibleTimer = this.game.config.ship.invincibilityDuration;
    this.visible = true;
  }
}

class Bullet {
  constructor(x, y, angle, config) {
    this.x = x;
    this.y = y;
    this.velocityX = Math.cos(angle) * config.speed;
    this.velocityY = Math.sin(angle) * config.speed;
    this.life = config.lifetime;
    this.radius = config.radius;
  }

  update(canvas) {
    this.x += this.velocityX;
    this.y += this.velocityY;
    this.life--;

    if (this.x < 0) this.x = canvas.width;
    if (this.x > canvas.width) this.x = 0;
    if (this.y < 0) this.y = canvas.height;
    if (this.y > canvas.height) this.y = 0;

    return this.life > 0;
  }

  draw(ctx, colors) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = colors.sky;
    ctx.fill();
  }
}

class Asteroid {
  constructor(x, y, size, config, game) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.radius = config.sizes[size].radius;
    this.angle = Math.random() * Math.PI * 2;
    this.speed = config.sizes[size].speed;
    this.velocityX = Math.cos(this.angle) * this.speed;
    this.velocityY = Math.sin(this.angle) * this.speed;
    this.rotationSpeed = (Math.random() * (config.rotationSpeed.max - config.rotationSpeed.min)) + config.rotationSpeed.min;
    this.rotation = 0;
    this.vertices = this.generateVertices(config);
    this.game = game;
  }

  generateVertices(config) {
    const vertices = [];
    const numVertices = Math.floor(Math.random() * (config.maxVertices - config.minVertices + 1)) + config.minVertices;
    for (let i = 0; i < numVertices; i++) {
      const angle = (i / numVertices) * Math.PI * 2;
      const variance = Math.random() * (config.vertexVariance.max - config.vertexVariance.min) + config.vertexVariance.min;
      vertices.push({
        x: Math.cos(angle) * this.radius * variance,
        y: Math.sin(angle) * this.radius * variance
      });
    }
    return vertices;
  }

  update(canvas) {
    this.x += this.velocityX;
    this.y += this.velocityY;
    this.rotation += this.rotationSpeed;

    if (this.x < -this.radius) this.x = canvas.width + this.radius;
    if (this.x > canvas.width + this.radius) this.x = -this.radius;
    if (this.y < -this.radius) this.y = canvas.height + this.radius;
    if (this.y > canvas.height + this.radius) this.y = -this.radius;

    return true;
  }

  draw(ctx, colors) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    ctx.strokeStyle = colors.text;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.vertices[0].x, this.vertices[0].y);
    for (let i = 1; i < this.vertices.length; i++) {
      ctx.lineTo(this.vertices[i].x, this.vertices[i].y);
    }
    ctx.closePath();
    ctx.stroke();

    ctx.restore();
  }

  break() {
    if (this.size === 'large') {
      return [
        new Asteroid(this.x, this.y, 'medium', this.game.config.asteroids, this.game),
        new Asteroid(this.x, this.y, 'medium', this.game.config.asteroids, this.game)
      ];
    } else if (this.size === 'medium') {
      return [
        new Asteroid(this.x, this.y, 'small', this.game.config.asteroids, this.game),
        new Asteroid(this.x, this.y, 'small', this.game.config.asteroids, this.game)
      ];
    }
    return [];
  }
}

class Particle {
  constructor(x, y, color, config) {
    this.x = x;
    this.y = y;
    this.velocityX = (Math.random() - 0.5) * config.speed;
    this.velocityY = (Math.random() - 0.5) * config.speed;
    this.life = config.lifetime;
    this.color = color;
    this.size = Math.random() * (config.size.max - config.size.min) + config.size.min;
  }

  update() {
    this.x += this.velocityX;
    this.y += this.velocityY;
    this.life--;
    this.size *= 0.95;
    return this.life > 0;
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.globalAlpha = this.life / 30;
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

let game;

async function initGame() {
  try {
    const loadingFill = document.getElementById('loadingFill');
    const loadingScreen = document.getElementById('loadingScreen');
    const loadingMessageEl = document.getElementById('loadingMessage');

    const loadingMessages = [
      'Summoning asteroids...',
      'Polishing the void...',
      'Loading pew pew sounds...',
      ' calibrating warp drive...',
      'Feeding space cats...',
      'Spawning enemies...',
      'Charging lasers...',
      'Aligning pixels...'
    ];

    let messageIndex = 0;
    if (loadingMessageEl) {
      const messageInterval = setInterval(() => {
        loadingMessageEl.style.opacity = 0;
        setTimeout(() => {
          loadingMessageEl.textContent = loadingMessages[messageIndex];
          loadingMessageEl.style.opacity = 1;
          messageIndex = (messageIndex + 1) % loadingMessages.length;
        }, 200);
      }, 600);
    }

    loadingFill.style.width = '20%';

    const response = await fetch('data/game.json');
    if (!response.ok) throw new Error('Failed to fetch game config');

    loadingFill.style.width = '50%';

    const config = await response.json();
    loadingFill.style.width = '70%';

    const gameColors = {
      base: '#1e1e2e',
      surface: '#313244',
      text: '#cdd6f4',
      mauve: '#cba6f7',
      pink: '#f5c2e7',
      sky: '#89dceb',
      sapphire: '#89b4fa',
      green: '#a6e3a1',
      peach: '#fab387',
      rosewater: '#f5e0dc',
      yellow: '#f9e2af'
    };

    config.colors = gameColors;

    if (config.game && config.game.title) {
      document.getElementById('gameTitle').textContent = config.game.title;
    }

    loadingFill.style.width = '100%';

    setTimeout(() => {
      loadingScreen.style.display = 'none';
      game = new AsteroidsGame(config);
    }, 200);

  } catch (error) {
    console.error('Failed to load game configuration:', error);
    document.getElementById('loadingScreen').innerHTML = '<h2>Failed to load game</h2><p>' + error.message + '</p>';
  }
}

(function() {
    const gameEasterEggs = [
        { type: 'log', msg: '%c🚀 ASTEROIDS - Prepare for battle!', style: 'font-size: 16px; font-weight: bold; color: #89dceb;' },
        { type: 'log', msg: '%cDestroy asteroids. Survive. Repeat.', style: 'color: #cdd6f4;' },
        { type: 'log', msg: '%cHigh score is saved. Can you beat it?', style: 'color: #f9e2af; font-style: italic;' },
        { type: 'warn', msg: 'Warning: Asteroids may cause existential crisis.' },
        { type: 'log', msg: '%c\n    ★  ☆  ★  ☆  ★\n\n', style: 'font-size: 20px; color: #f9e2af;' },
    ];

    const randomEgg = gameEasterEggs[Math.floor(Math.random() * gameEasterEggs.length)];
    console[randomEgg.type](randomEgg.msg, randomEgg.style || '');

    window.asteroids = {
        score: () => game ? game.score : 'Not started',
        lives: () => game ? game.lives : 'Not started',
        level: () => game ? game.level : 'Not started',
        highscore: () => game ? game.highScore : '?',
        nuke: () => { if (game) { game.asteroids = []; console.log('%c💥 Asteroids destroyed!', 'color: #f38ba8;'); } },
        godmode: () => { if (game) { game.lives = 9999; console.log('%c👑 God mode activated!', 'color: #cba6f7;'); } },
        help: () => {
            console.log('%c🕹️ Asteroids Console Commands:', 'font-weight: bold; color: #89dceb;');
            console.log('  asteroids.score() - Current score');
            console.log('  asteroids.lives() - Remaining lives');
            console.log('  asteroids.level() - Current level');
            console.log('  asteroids.highscore() - High score');
            console.log('  asteroids.nuke() - Destroy all asteroids');
            console.log('  asteroids.godmode() - Infinite lives');
        }
    };

    console.log('%c💡 Tip: Type asteroids("help") for commands!', 'color: #94e2d5; font-style: italic;');
})();

function restartGame() {
  if (game) {
    game.startNewGame();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initGame();
});
