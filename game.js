// ==========================================
// COSMIC DEFENDER RPG - OOP Architecture
// ==========================================

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// UI Elements
const UI = {
    startScreen: document.getElementById('startScreen'),
    gameUI: document.getElementById('gameUI'),
    pauseScreen: document.getElementById('pauseScreen'),
    gameOverScreen: document.getElementById('gameOverScreen'),
    winScreen: document.getElementById('winScreen'),
    diffBtns: document.querySelectorAll('.difficulty-btn'),
    welcomeMsg: document.getElementById('welcomeMessage'),
    score: document.getElementById('ui-score'),
    wave: document.getElementById('ui-wave'),
    lives: document.getElementById('ui-lives'),
    level: document.getElementById('ui-level'),
    xpFill: document.getElementById('ui-xp-fill'),
    rapid: document.getElementById('ui-rapid'),
    triple: document.getElementById('ui-triple'),
    shield: document.getElementById('ui-shield'),
    bossContainer: document.getElementById('bossHealthContainer'),
    bossFill: document.getElementById('boss-health-fill')
};

// Game Configuration
const GAME_MAX_WAVES = 20;
const DIFF_SETTINGS = {
    easy: { welcome: "Relax, rookie!", mult: 0.6 },
    normal: { welcome: "Ready for action!", mult: 1.0 },
    hard: { welcome: "Steel yourself, veteran!", mult: 1.5 },
    insane: { welcome: "Brace yourself, legend!", mult: 2.0 }
};

let difficulty = 'normal';
let diffMult = 1.0;

// Resize handling
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// ==========================================
// CLASSES (Intermediate Level Architecture)
// ==========================================

class Player {
    constructor() {
        this.width = 50; this.height = 50;
        this.x = canvas.width / 2; this.y = canvas.height - 100;
        this.speed = 7;
        this.lives = 5;
        this.color = '#00ffff';
        
        // RPG Stats
        this.level = 1;
        this.xp = 0;
        this.xpToNext = 100;
        this.baseDamage = 1;

        // Powerups
        this.powerups = { rapid: 0, triple: 0, shield: 0 };
        this.lastShot = 0;
    }

    update() {
        // Decrease powerup timers
        for (let p in this.powerups) {
            if (this.powerups[p] > 0) {
                this.powerups[p]--;
                UI[p].classList.add('active');
            } else {
                UI[p].classList.remove('active');
            }
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // Draw Shield
        if (this.powerups.shield > 0) {
            ctx.beginPath();
            ctx.arc(0, 0, 40, 0, Math.PI * 2);
            ctx.strokeStyle = '#0055ff';
            ctx.lineWidth = 3;
            ctx.stroke();
        }

        // Procedural Ship Shape
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(0, -this.height/2);
        ctx.lineTo(this.width/2, this.height/2);
        ctx.lineTo(0, this.height/3);
        ctx.lineTo(-this.width/2, this.height/2);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    gainXp(amount) {
        this.xp += amount;
        if (this.xp >= this.xpToNext) {
            this.level++;
            this.xp -= this.xpToNext;
            this.xpToNext = Math.floor(this.xpToNext * 1.5);
            this.baseDamage += 0.5; // RPG scaling
            game.createParticles(this.x, this.y, '#ffcc00', 30); // Level up effect
        }
        UI.level.innerText = this.level;
        UI.xpFill.style.width = `${(this.xp / this.xpToNext) * 100}%`;
    }

    shoot() {
        const now = Date.now();
        const cooldown = this.powerups.rapid > 0 ? 100 : 250;
        
        if (now - this.lastShot > cooldown) {
            this.lastShot = now;
            let dmg = this.baseDamage;
            
            if (this.powerups.triple > 0) {
                game.bullets.push(new Bullet(this.x - 20, this.y - 20, -2, -10, dmg, true));
                game.bullets.push(new Bullet(this.x, this.y - 30, 0, -12, dmg, true));
                game.bullets.push(new Bullet(this.x + 20, this.y - 20, 2, -10, dmg, true));
            } else {
                game.bullets.push(new Bullet(this.x, this.y - 30, 0, -12, dmg, true));
            }
        }
    }
}

class Enemy {
    constructor(x, y, wave) {
        this.x = x; this.y = y;
        this.radius = 20;
        this.hp = Math.floor((10 + (wave * 5)) * diffMult);
        this.maxHp = this.hp;
        this.speed = (1 + Math.random() * wave * 0.1) * diffMult;
        this.sinOffset = Math.random() * Math.PI * 2;
    }

    update() {
        this.y += this.speed;
        this.x += Math.sin(this.y * 0.05 + this.sinOffset) * 2;
        
        // Shoot randomly
        if (Math.random() < 0.005 * diffMult) {
            game.bullets.push(new Bullet(this.x, this.y + 20, 0, 5, 1, false));
        }
    }

    draw() {
        ctx.fillStyle = '#ff3366';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Health bar
        if (this.hp < this.maxHp) {
            ctx.fillStyle = 'red';
            ctx.fillRect(this.x - 15, this.y - 30, 30, 4);
            ctx.fillStyle = 'lime';
            ctx.fillRect(this.x - 15, this.y - 30, 30 * (this.hp / this.maxHp), 4);
        }
    }
}

class Boss {
    constructor() {
        this.x = canvas.width / 2; this.y = -100;
        this.width = 150; this.height = 100;
        this.hp = 2000 * diffMult;
        this.maxHp = this.hp;
        this.speedX = 3;
        this.phase = 1;
        UI.bossContainer.style.display = 'block';
    }

    update() {
        if (this.y < 100) this.y += 2; // Enter screen
        else {
            this.x += this.speedX;
            if (this.x < 100 || this.x > canvas.width - 100) this.speedX *= -1;

            // Attack patterns
            if (Math.random() < 0.05) {
                game.bullets.push(new Bullet(this.x - 50, this.y + 50, -1, 7, 1, false));
                game.bullets.push(new Bullet(this.x + 50, this.y + 50, 1, 7, 1, false));
                game.bullets.push(new Bullet(this.x, this.y + 60, 0, 9, 1, false));
            }
        }
        UI.bossFill.style.width = `${(this.hp / this.maxHp) * 100}%`;
    }

    draw() {
        ctx.fillStyle = '#800000';
        ctx.fillRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
        ctx.fillStyle = '#ff3333';
        ctx.fillRect(this.x - this.width/2 + 10, this.y - this.height/2 + 10, this.width - 20, this.height - 20);
    }
}

class Bullet {
    constructor(x, y, vx, vy, damage, isPlayer) {
        this.x = x; this.y = y;
        this.vx = vx; this.vy = vy;
        this.damage = damage;
        this.isPlayer = isPlayer;
        this.radius = isPlayer ? 4 : 6;
        this.color = isPlayer ? '#00ffcc' : '#ffaa00';
    }
    update() { this.x += this.vx; this.y += this.vy; }
    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
        ctx.fill();
    }
}

// RPG Element: Drops
class ExpGem {
    constructor(x, y, type) {
        this.x = x; this.y = y;
        this.type = type; // 'xp', 'rapid', 'triple', 'shield'
        this.radius = type === 'xp' ? 6 : 12;
    }
    update() { this.y += 2; }
    draw() {
        ctx.fillStyle = this.type === 'xp' ? '#ffcc00' : '#fff';
        if(this.type === 'shield') ctx.fillStyle = '#0055ff';
        if(this.type === 'rapid') ctx.fillStyle = '#ff5500';
        if(this.type === 'triple') ctx.fillStyle = '#00ffcc';
        
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - this.radius);
        ctx.lineTo(this.x + this.radius, this.y);
        ctx.lineTo(this.x, this.y + this.radius);
        ctx.lineTo(this.x - this.radius, this.y);
        ctx.fill();
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x; this.y = y; this.color = color;
        this.vx = (Math.random() - 0.5) * 8;
        this.vy = (Math.random() - 0.5) * 8;
        this.life = 1.0;
        this.decay = Math.random() * 0.05 + 0.02;
    }
    update() { this.x += this.vx; this.y += this.vy; this.life -= this.decay; }
    draw() {
        ctx.globalAlpha = Math.max(0, this.life);
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, 4, 4);
        ctx.globalAlpha = 1.0;
    }
}

// ==========================================
// CORE GAME ENGINE
// ==========================================

class Game {
    constructor() {
        this.reset();
        this.bindEvents();
    }

    reset() {
        this.state = 'START'; // START, PLAYING, PAUSED, GAMEOVER, WIN
        this.player = new Player();
        this.enemies = [];
        this.bullets = [];
        this.gems = [];
        this.particles = [];
        this.stars = Array.from({length: 100}, () => ({
            x: Math.random() * canvas.width, 
            y: Math.random() * canvas.height, 
            s: Math.random() * 2 + 1
        }));
        this.score = 0;
        this.wave = 1;
        this.boss = null;
        this.keys = {};
        this.mouse = { x: canvas.width/2, y: canvas.height - 100, down: false };
        this.updateUI();
    }

    start() {
        this.reset();
        this.state = 'PLAYING';
        UI.startScreen.style.display = 'none';
        UI.gameOverScreen.style.display = 'none';
        UI.winScreen.style.display = 'none';
        UI.gameUI.style.display = 'block';
        this.spawnWave();
        this.loop();
    }

    spawnWave() {
        if (this.wave > GAME_MAX_WAVES) {
            this.state = 'WIN';
            UI.gameUI.style.display = 'none';
            UI.winScreen.style.display = 'flex';
            document.getElementById('win-score').innerText = this.score;
            document.getElementById('win-level').innerText = this.player.level;
            return;
        }

        if (this.wave === GAME_MAX_WAVES) {
            this.boss = new Boss();
        } else {
            const count = 5 + Math.floor(this.wave * 1.5);
            for (let i = 0; i < count; i++) {
                setTimeout(() => {
                    if (this.state === 'PLAYING') {
                        this.enemies.push(new Enemy(Math.random() * (canvas.width - 60) + 30, -50, this.wave));
                    }
                }, i * 800);
            }
        }
        UI.wave.innerText = this.wave;
    }

    createParticles(x, y, color, count = 15) {
        for(let i=0; i<count; i++) this.particles.push(new Particle(x, y, color));
    }

    updateUI() {
        UI.score.innerText = this.score;
        UI.lives.innerText = '❤️'.repeat(Math.max(0, this.player.lives));
    }

    takeDamage() {
        if (this.player.powerups.shield > 0) {
            this.player.powerups.shield = 0;
            this.createParticles(this.player.x, this.player.y, '#0055ff', 20);
        } else {
            this.player.lives--;
            this.createParticles(this.player.x, this.player.y, '#ff0000', 30);
            this.updateUI();
            if (this.player.lives <= 0) {
                this.state = 'GAMEOVER';
                UI.gameUI.style.display = 'none';
                UI.bossContainer.style.display = 'none';
                UI.gameOverScreen.style.display = 'flex';
                document.getElementById('end-score').innerText = this.score;
                document.getElementById('end-wave').innerText = this.wave;
                document.getElementById('end-level').innerText = this.player.level;
            }
        }
    }

    update() {
        if (this.state !== 'PLAYING') return;

        // Player Movement
        if (this.keys['ArrowLeft']) this.player.x -= this.player.speed;
        if (this.keys['ArrowRight']) this.player.x += this.player.speed;
        if (this.keys['ArrowUp']) this.player.y -= this.player.speed;
        if (this.keys['ArrowDown']) this.player.y += this.player.speed;
        if (this.mouse.down) {
            this.player.x += (this.mouse.x - this.player.x) * 0.1;
            this.player.y += (this.mouse.y - this.player.y) * 0.1;
            this.player.shoot();
        }
        if (this.keys[' ']) this.player.shoot();

        // Screen bounds
        this.player.x = Math.max(30, Math.min(canvas.width - 30, this.player.x));
        this.player.y = Math.max(30, Math.min(canvas.height - 30, this.player.y));

        this.player.update();

        // Background Stars
        this.stars.forEach(s => {
            s.y += s.s;
            if (s.y > canvas.height) { s.y = 0; s.x = Math.random() * canvas.width; }
        });

        // Entities
        this.bullets = this.bullets.filter(b => b.y > 0 && b.y < canvas.height && b.x > 0 && b.x < canvas.width);
        this.bullets.forEach(b => b.update());
        
        this.particles = this.particles.filter(p => p.life > 0);
        this.particles.forEach(p => p.update());

        this.gems = this.gems.filter(g => g.y < canvas.height);
        this.gems.forEach(g => {
            g.update();
            // Magnet effect to player
            const dx = this.player.x - g.x;
            const dy = this.player.y - g.y;
            const dist = Math.hypot(dx, dy);
            if (dist < 100) { g.x += dx * 0.05; g.y += dy * 0.05; }
            
            // Pickup
            if (dist < this.player.width/2 + g.radius) {
                if (g.type === 'xp') this.player.gainXp(25 * diffMult);
                else this.player.powerups[g.type] = 600; // 10 seconds at 60fps
                g.y = canvas.height + 100; // mark for deletion
            }
        });

        if (this.boss) {
            this.boss.update();
            if (this.boss.hp <= 0) {
                this.createParticles(this.boss.x, this.boss.y, '#ff0000', 100);
                this.boss = null;
                this.score += 5000;
                this.wave++;
                UI.bossContainer.style.display = 'none';
                this.spawnWave();
            }
        }

        // Enemy & Collision Logic
        this.enemies = this.enemies.filter(e => e.y < canvas.height + 50);
        let enemiesAlive = this.enemies.length;

        this.enemies.forEach(e => {
            e.update();
            
            // Player collision
            if (Math.hypot(this.player.x - e.x, this.player.y - e.y) < 40) {
                e.hp = 0; this.takeDamage();
            }

            // Bullet collision
            this.bullets.forEach(b => {
                if (b.isPlayer && Math.hypot(b.x - e.x, b.y - e.y) < e.radius + b.radius) {
                    e.hp -= b.damage;
                    b.y = -100; // destroy bullet
                    this.createParticles(e.x, e.y, '#ff3366', 5);
                }
            });

            // Death
            if (e.hp <= 0) {
                e.y = canvas.height + 100; // mark for removal
                this.score += 100;
                this.updateUI();
                this.createParticles(e.x, e.y, '#ffaa00');
                
                // Drop Mechanics
                const dropRoll = Math.random();
                if (dropRoll < 0.6) this.gems.push(new ExpGem(e.x, e.y, 'xp'));
                else if (dropRoll < 0.65) this.gems.push(new ExpGem(e.x, e.y, 'rapid'));
                else if (dropRoll < 0.70) this.gems.push(new ExpGem(e.x, e.y, 'triple'));
                else if (dropRoll < 0.75) this.gems.push(new ExpGem(e.x, e.y, 'shield'));
            }
        });

        // Boss Bullet Collision
        if (this.boss) {
            this.bullets.forEach(b => {
                if (b.isPlayer && Math.abs(b.x - this.boss.x) < this.boss.width/2 && Math.abs(b.y - this.boss.y) < this.boss.height/2) {
                    this.boss.hp -= b.damage;
                    b.y = -100;
                    this.createParticles(b.x, b.y, '#ff3333', 3);
                }
            });
        }

        // Player takes bullet damage
        this.bullets.forEach(b => {
            if (!b.isPlayer && Math.hypot(b.x - this.player.x, b.y - this.player.y) < 20) {
                b.y = canvas.height + 100;
                this.takeDamage();
            }
        });

        // Next Wave trigger
        if (enemiesAlive === 0 && !this.boss && this.enemies.length === 0) {
            this.wave++;
            this.spawnWave();
        }
    }

    draw() {
        ctx.fillStyle = '#050510';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#fff';
        this.stars.forEach(s => ctx.fillRect(s.x, s.y, s.s, s.s));

        if (this.state === 'PLAYING' || this.state === 'PAUSED') {
            this.gems.forEach(g => g.draw());
            this.bullets.forEach(b => b.draw());
            this.enemies.forEach(e => e.draw());
            if (this.boss) this.boss.draw();
            this.particles.forEach(p => p.draw());
            this.player.draw();
        }
    }

    loop() {
        if (this.state === 'PLAYING') {
            this.update();
            this.draw();
            requestAnimationFrame(() => this.loop());
        }
    }

    togglePause() {
        if (this.state === 'PLAYING') {
            this.state = 'PAUSED';
            UI.pauseScreen.style.display = 'flex';
        } else if (this.state === 'PAUSED') {
            this.state = 'PLAYING';
            UI.pauseScreen.style.display = 'none';
            this.loop();
        }
    }

    goHome() {
        this.state = 'START';
        UI.pauseScreen.style.display = 'none';
        UI.gameUI.style.display = 'none';
        UI.startScreen.style.display = 'flex';
    }

    bindEvents() {
        // Keyboard
        window.addEventListener('keydown', e => this.keys[e.key] = true);
        window.addEventListener('keyup', e => this.keys[e.key] = false);

        // Touch/Mouse
        const setMouse = (e) => {
            const touch = e.touches ? e.touches[0] : e;
            this.mouse.x = touch.clientX;
            this.mouse.y = touch.clientY;
        };
        canvas.addEventListener('mousedown', e => { this.mouse.down = true; setMouse(e); });
        canvas.addEventListener('mousemove', setMouse);
        canvas.addEventListener('mouseup', () => this.mouse.down = false);
        canvas.addEventListener('touchstart', e => { this.mouse.down = true; setMouse(e); }, {passive: true});
        canvas.addEventListener('touchmove', setMouse, {passive: true});
        canvas.addEventListener('touchend', () => this.mouse.down = false);

        // UI Buttons
        UI.diffBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                UI.diffBtns.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                difficulty = btn.dataset.difficulty;
                diffMult = DIFF_SETTINGS[difficulty].mult;
                UI.welcomeMsg.innerText = DIFF_SETTINGS[difficulty].welcome;
            });
        });

        document.getElementById('startBtn').addEventListener('click', () => this.start());
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('resumeBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('homeBtn').addEventListener('click', () => this.goHome());
        document.querySelectorAll('.restartBtn').forEach(btn => {
            btn.addEventListener('click', () => {
                UI.gameOverScreen.style.display = 'none';
                UI.winScreen.style.display = 'none';
                this.start();
            });
        });
    }
}

// Initialize Game
const game = new Game();
