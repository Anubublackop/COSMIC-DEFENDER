// ==============================
//  COSMIC DEFENDER – Game Logic
//  Simple AI (10%) – great for intermediate coders
// ==============================

// -------- Images --------
const playerImg = new Image();
playerImg.src = 'images/Rocket.png';
const enemyImg = new Image();
enemyImg.src = 'images/Alien.png';
const bossImg = new Image();
bossImg.src = 'images/boss.png';
const shieldImg = new Image();
shieldImg.src = 'images/shield.svg';
const rapidFireImg = new Image();
rapidFireImg.src = 'images/rapidFire.svg';
const tripleShotImg = new Image();
tripleShotImg.src = 'images/tripleShot.svg';

// -------- Audio --------
const gameMusic = document.getElementById('gameMusic');

// -------- DOM --------
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const gameWinScreen = document.getElementById('gameWinScreen');
const scoreElement = document.getElementById('score');
const waveElement = document.getElementById('wave');
const levelElement = document.getElementById('level');
const livesElement = document.getElementById('lives');
const bossHealthBar = document.getElementById('bossHealth');
const bossHealthFill = document.getElementById('bossHealthBar');
const finalScoreElement = document.getElementById('finalScore');
const finalWavesElement = document.getElementById('finalWaves');
const winFinalScoreElement = document.getElementById('winFinalScore');
const winFinalWavesElement = document.getElementById('winFinalWaves');
const rapidFireElement = document.getElementById('rapidFire');
const tripleShotElement = document.getElementById('tripleShot');
const shieldElement = document.getElementById('shield');
const startInstructions = document.getElementById('startInstructions');
const controlInstructions = document.getElementById('controlInstructions');
const restartInstructions = document.getElementById('restartInstructions');
const winRestartInstructions = document.getElementById('winRestartInstructions');
const mobileControls = document.getElementById('mobileControls');
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');
const shootBtn = document.getElementById('shootBtn');
const difficultyDisplay = document.getElementById('difficultyDisplay');
const welcomeMessage = document.getElementById('welcomeMessage');
const difficultyButtons = document.querySelectorAll('.difficulty-btn');
const pauseScreen = document.getElementById('pauseScreen');
const gameControls = document.getElementById('gameControls');
const pauseBtn = document.getElementById('pauseBtn');
const homeBtn = document.getElementById('homeBtn');
const uiContainer = document.getElementById('ui');
const powerupStatusContainer = document.getElementById('powerup-status');

// -------- Game State --------
let score = 0;
let gameLevel = 1;          // 1..20 (boss at 20)
let gameSpeed = 1;
let gameStarted = false;
let frameCount = 0;
let lives = 5;
let invulnerable = false;
let bossActive = false;
let isMobile = false;
let showBossIncoming = false;
let bossIncomingTimer = 0;
let currentWave = 1;
let totalWaves = 0;
let difficulty = "normal";
let isPaused = false;
let animationFrameId;
let waveClearTime = 0;
const WAVE_DELAY_FRAMES = 90;
const MAX_GAME_LEVEL = 20;

// -------- Difficulty Settings --------
const difficultySettings = {
    easy: {
        enemyHealth: 0.2, enemySpeed: 0.4, enemyShootRate: 0.3,
        bossHealth: 0.5, enemyDamage: 0.5, enemyCollisionDamage: 1, bossCollisionDamage: 2
    },
    normal: {
        enemyHealth: 1, enemySpeed: 1, enemyShootRate: 1,
        bossHealth: 1, enemyDamage: 1, enemyCollisionDamage: 2, bossCollisionDamage: 3
    },
    hard: {
        enemyHealth: 1.3, enemySpeed: 1.2, enemyShootRate: 1.3,
        bossHealth: 1.3, enemyDamage: 1.5, enemyCollisionDamage: 3, bossCollisionDamage: 4
    },
    insane: {
        enemyHealth: 1.5, enemySpeed: 1.2, enemyShootRate: 1.5,
        bossHealth: 1.7, enemyDamage: 2, enemyCollisionDamage: 4, bossCollisionDamage: 5
    }
};

const welcomeMessages = {
    easy: "Relax, rookie!",
    normal: "Ready for action!",
    hard: "Steel yourself, veteran!",
    insane: "Brace yourself, legend!"
};

// -------- Wave Patterns (progressive) --------
function getWavePattern(level) {
    const baseCount = Math.min(3 + Math.floor(level / 2), 12);
    const speed = 1.2 + level * 0.08;
    const spawnRate = Math.max(30, 120 - level * 4);
    const enemyHealth = 1 + Math.floor(level / 3);
    return { count: baseCount, speed, spawnRate, enemyHealth };
}

// -------- Keyboard State --------
const keys = {
    ArrowLeft: false,
    ArrowRight: false,
    Space: false,
    Enter: false
};

// -------- Background Stars & Nebula --------
const stars = [];
for (let i = 0; i < 120; i++) {
    stars.push({
        x: Math.random() * 800,
        y: Math.random() * 600,
        size: Math.random() * 3 + 1,
        speed: Math.random() * 2 + 0.5,
        layer: Math.floor(Math.random() * 3)
    });
}
const nebula = { x: 0, y: 0, alpha: 0.25 };

// -------- Game Objects --------
const explosions = [];
const player = {
    x: 0, y: 0,
    width: 80, height: 80,
    speed: 10,
    bullets: [],
    powerUps: { rapidFire: false, tripleShot: false, shield: false },
    lastShot: 0,
    blinkCount: 0,
    isShootingFlash: false,
    flashTimer: 0
};
const enemies = [];
const enemyBullets = [];
const powerUps = [];
const boss = {
    x: 0, y: -200,
    width: 200, height: 200,
    speed: 1.5,
    health: 0, maxHealth: 0,
    direction: 1,
    lastShot: 0,
    shootInterval: 800
};

// -------- Helpers --------
function isMobileDevice() {
    return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function resizeCanvas() {
    const w = window.innerWidth * 0.9;
    const h = window.innerHeight * 0.9;
    canvas.width = Math.min(w, 800);
    canvas.height = Math.min(h, 600);
    player.x = Math.max(0, Math.min(player.x, canvas.width - player.width));
    player.y = canvas.height - 100;
}

// -------- Initialisation --------
function initGame() {
    isMobile = isMobileDevice();
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    difficultyButtons.forEach(button => {
        button.addEventListener('click', () => {
            difficulty = button.dataset.difficulty;
            difficultyButtons.forEach(btn => btn.classList.remove('selected'));
            button.classList.add('selected');
            difficultyDisplay.textContent = `Mode: ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}`;
            welcomeMessage.textContent = welcomeMessages[difficulty];
        });
    });
    document.querySelector('[data-difficulty="normal"]').classList.add('selected');

    setupInput();

    if (isMobile) {
        startInstructions.textContent = "Tap to Start";
        controlInstructions.textContent = "Drag: Move | Tap: Shoot";
        restartInstructions.textContent = "Tap to Play Again";
        winRestartInstructions.textContent = "Tap to Play Again";
        mobileControls.style.display = 'flex';
    } else {
        startInstructions.textContent = "Press ENTER to Start";
        controlInstructions.textContent = "Arrow Keys: Move | Space: Shoot";
        restartInstructions.textContent = "Press ENTER to Play Again";
        winRestartInstructions.textContent = "Press ENTER to Play Again";
    }
    canvas.focus();
}

// -------- Input --------
function setupInput() {
    document.addEventListener('keydown', (e) => {
        if (e.key in keys) keys[e.key] = true;
        if (e.key === 'Enter' && (!gameStarted || lives <= 0 || gameLevel > MAX_GAME_LEVEL)) {
            e.preventDefault();
            startGame();
        }
        if (gameStarted && (e.key.toLowerCase() === 'p' || e.key === 'Escape')) {
            e.preventDefault();
            togglePause();
        }
        if (gameStarted && !isMobile && e.key === ' ' && Date.now() - player.lastShot > (player.powerUps.rapidFire ? 100 : 300)) {
            shoot();
            player.lastShot = Date.now();
            player.isShootingFlash = true;
            player.flashTimer = 5;
        }
    });
    document.addEventListener('keyup', (e) => {
        if (e.key in keys) keys[e.key] = false;
    });

    if (isMobile) setupTouchControls();
}

function setupTouchControls() {
    let touchMoveActive = false;
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        touchMoveActive = true;
        if (Date.now() - player.lastShot > (player.powerUps.rapidFire ? 100 : 300)) {
            shoot();
            player.lastShot = Date.now();
            player.isShootingFlash = true;
            player.flashTimer = 5;
        }
    }, { passive: false });
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (touchMoveActive) {
            const rect = canvas.getBoundingClientRect();
            const touchX = e.touches[0].clientX - rect.left;
            player.x = touchX - player.width / 2;
            player.x = Math.max(0, Math.min(player.x, canvas.width - player.width));
        }
    }, { passive: false });
    canvas.addEventListener('touchend', () => { touchMoveActive = false; });

    leftBtn.addEventListener('touchstart', (e) => { e.preventDefault(); keys.ArrowLeft = true; });
    leftBtn.addEventListener('touchend', (e) => { e.preventDefault(); keys.ArrowLeft = false; });
    rightBtn.addEventListener('touchstart', (e) => { e.preventDefault(); keys.ArrowRight = true; });
    rightBtn.addEventListener('touchend', (e) => { e.preventDefault(); keys.ArrowRight = false; });
    shootBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (Date.now() - player.lastShot > (player.powerUps.rapidFire ? 100 : 300)) {
            shoot();
            player.lastShot = Date.now();
            player.isShootingFlash = true;
            player.flashTimer = 5;
        }
    });
}

// -------- Start Game --------
function startGame() {
    gameStarted = true;
    score = 0;
    lives = 5;
    gameLevel = 1;
    currentWave = 1;
    totalWaves = 0;
    gameSpeed = 1;
    player.bullets = [];
    enemies.length = 0;
    enemyBullets.length = 0;
    powerUps.length = 0;
    explosions.length = 0;
    bossActive = false;
    waveClearTime = 0;
    player.powerUps = { rapidFire: false, tripleShot: false, shield: false };
    updatePowerupDisplay();

    startScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';
    gameWinScreen.style.display = 'none';
    uiContainer.style.display = 'flex';
    document.getElementById('topRight').style.display = 'flex';
    powerupStatusContainer.style.display = 'flex';
    bossHealthBar.style.display = 'none';
    gameControls.style.display = 'flex';

    updateLivesDisplay();
    updateScore();
    updateWave();
    spawnWave();

    try { gameMusic.currentTime = 0; gameMusic.play(); } catch(e) {}
    gameLoop();
}

// -------- Main Loop --------
function gameLoop() {
    if (!gameStarted) return;
    update();
    render();
    animationFrameId = requestAnimationFrame(gameLoop);
}

// -------- Update --------
function update() {
    updatePlayer();
    updateBullets();
    updateEnemies();
    updateEnemyBullets();
    updateExplosions();
    if (bossActive) updateBoss();
    updatePowerUps();
    checkCollisions();

    if (enemies.length === 0 && !bossActive && gameStarted) {
        if (waveClearTime === 0 && gameLevel <= MAX_GAME_LEVEL) {
            waveClearTime = frameCount;
        }
        if (waveClearTime > 0 && (frameCount - waveClearTime > WAVE_DELAY_FRAMES)) {
            spawnWave();
        }
    }
    frameCount++;
}

// -------- Render --------
function render() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawBackground();

    if (player.blinkCount % 10 < 5 || !invulnerable) drawPlayer();
    drawBullets();
    drawEnemies();
    drawEnemyBullets();
    drawPowerUps();
    drawExplosions();
    if (bossActive) drawBoss();

    if (invulnerable) {
        player.blinkCount++;
        if (player.blinkCount > 60) {
            invulnerable = false;
            player.blinkCount = 0;
        }
    }

    if (showBossIncoming && bossIncomingTimer > 0) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = '48px "Inter", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('⚡ BOSS INCOMING! ⚡', canvas.width/2, canvas.height/2);
        bossIncomingTimer--;
    } else if (bossIncomingTimer <= 0) {
        showBossIncoming = false;
    }
}

// -------- Background --------
function drawBackground() {
    const grad = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 0, canvas.width/2, canvas.height/2, Math.max(canvas.width, canvas.height));
    grad.addColorStop(0, `rgba(70, 0, 130, ${nebula.alpha})`);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'white';
    stars.forEach(star => {
        star.y += star.speed * gameSpeed;
        if (star.y > canvas.height) star.y = 0;
        ctx.globalAlpha = 1 - (star.layer * 0.3);
        ctx.fillRect(star.x, star.y, star.size, star.size);
    });
    ctx.globalAlpha = 1;
}

// -------- Player --------
function updatePlayer() {
    if (keys.ArrowLeft && player.x > 0) player.x -= player.speed;
    if (keys.ArrowRight && player.x < canvas.width - player.width) player.x += player.speed;
}

function drawPlayer() {
    if (player.isShootingFlash && player.flashTimer > 0) {
        ctx.save();
        ctx.globalAlpha = 0.7;
        ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);
        ctx.restore();
        player.flashTimer--;
    } else {
        if (playerImg.complete && playerImg.naturalWidth !== 0) {
            ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);
        } else {
            ctx.fillStyle = '#00FFFF';
            ctx.fillRect(player.x, player.y, player.width, player.height);
        }
    }
    if (player.powerUps.shield) {
        ctx.strokeStyle = '#FFFF00';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(player.x + player.width/2, player.y + player.height/2, player.width*0.75, 0, Math.PI*2);
        ctx.stroke();
    }
}

// -------- Player Bullets --------
function shoot() {
    const baseBullet = { width: 8, height: 20, speed: 12, color: '#FF0000' };
    const offsets = player.powerUps.tripleShot ? [5, player.width/2-4, player.width-13] : [player.width/2-4];
    offsets.forEach(offset => {
        player.bullets.push({ ...baseBullet, x: player.x + offset, y: player.y });
    });
}

function updateBullets() {
    for (let i = player.bullets.length-1; i>=0; i--) {
        player.bullets[i].y -= player.bullets[i].speed;
        if (player.bullets[i].y < 0) player.bullets.splice(i,1);
    }
}

function drawBullets() {
    player.bullets.forEach(b => ctx.fillRect(b.x, b.y, b.width, b.height));
}

// -------- Enemies (SIMPLE AI – ~10%) --------
function spawnWave() {
    if (gameLevel > MAX_GAME_LEVEL) {
        gameWin();
        return;
    }
    if (gameLevel === MAX_GAME_LEVEL) {
        spawnBoss();
        return;
    }

    const pattern = getWavePattern(gameLevel);
    const settings = difficultySettings[difficulty];
    const health = pattern.enemyHealth * settings.enemyHealth;

    for (let i = 0; i < pattern.count; i++) {
        setTimeout(() => {
            const spacing = canvas.width / (pattern.count + 1);
            const enemyX = spacing * (i + 1) - 30;
            enemies.push({
                x: enemyX,
                y: -60,
                width: 60, height: 60,
                speed: pattern.speed * gameSpeed * 0.8 * settings.enemySpeed,
                health: health,
                maxHealth: health,
                color: `hsl(${Math.random()*60+180}, 100%, 50%)`,
                canShoot: true,
                lastShot: Date.now() + Math.random() * 1500,
                shootInterval: (1200 + Math.random() * 800) / settings.enemyShootRate
            });
        }, i * pattern.spawnRate);
    }

    waveClearTime = 0;
    currentWave++;
    totalWaves++;
    gameLevel++;
    gameSpeed += 0.08;
    updateWave();
    levelElement.textContent = gameLevel;
}

// SIMPLE AI: just move down and drift toward the player's X
function updateEnemies() {
    const playerCenter = player.x + player.width/2;
    for (let i = enemies.length-1; i>=0; i--) {
        const enemy = enemies[i];
        const eCenter = enemy.x + enemy.width/2;

        // Drift toward player (gentle)
        if (playerCenter < eCenter) enemy.x -= enemy.speed * 0.2;
        else if (playerCenter > eCenter) enemy.x += enemy.speed * 0.2;

        enemy.y += enemy.speed;

        // Shoot straight down (no aiming)
        if (enemy.canShoot && Date.now() - enemy.lastShot > enemy.shootInterval) {
            enemyBullets.push({
                x: enemy.x + enemy.width/2 - 2,
                y: enemy.y + enemy.height,
                width: 4, height: 15,
                speedX: 0,
                speedY: 5 * difficultySettings[difficulty].enemySpeed,
                color: '#FFD700',
                damage: difficultySettings[difficulty].enemyDamage
            });
            enemy.lastShot = Date.now();
        }

        if (enemy.y > canvas.height) enemies.splice(i,1);
    }
}

function drawEnemies() {
    enemies.forEach(enemy => {
        if (enemyImg.complete && enemyImg.naturalWidth !== 0) {
            ctx.drawImage(enemyImg, enemy.x, enemy.y, enemy.width, enemy.height);
        } else {
            ctx.fillStyle = enemy.color;
            ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        }
        if (enemy.health > 1) {
            ctx.fillStyle = 'red';
            ctx.fillRect(enemy.x, enemy.y-10, enemy.width * (enemy.health/enemy.maxHealth), 5);
        }
    });
}

// -------- Enemy Bullets (straight) --------
function updateEnemyBullets() {
    for (let i = enemyBullets.length-1; i>=0; i--) {
        const b = enemyBullets[i];
        b.x += b.speedX || 0;
        b.y += b.speedY || 5;
        if (b.y > canvas.height || b.y < 0 || b.x < 0 || b.x > canvas.width) {
            enemyBullets.splice(i,1);
        }
    }
}

function drawEnemyBullets() {
    enemyBullets.forEach(b => ctx.fillRect(b.x, b.y, 6, 12));
}

// -------- Boss (simple side-to-side + spread) --------
function spawnBoss() {
    bossActive = true;
    boss.x = canvas.width/2 - boss.width/2;
    boss.y = -200;
    const settings = difficultySettings[difficulty];
    boss.health = 250 * settings.bossHealth;
    boss.maxHealth = boss.health;
    bossHealthBar.style.display = 'block';
    updateBossHealth();

    showBossIncoming = true;
    bossIncomingTimer = 180;
}

function updateBoss() {
    if (boss.y < 50) {
        boss.y += 1;
        boss.x += Math.sin(frameCount * 0.05) * 2;
    } else {
        boss.x += boss.speed * boss.direction;
        if (boss.x <= 0 || boss.x >= canvas.width - boss.width) boss.direction *= -1;
    }
    if (Date.now() - boss.lastShot > boss.shootInterval) {
        for (let i = -2; i <= 2; i++) {
            const angle = Math.PI/2 + i * 0.2;
            const speed = 4 * difficultySettings[difficulty].enemySpeed;
            enemyBullets.push({
                x: boss.x + boss.width/2 - 5,
                y: boss.y + boss.height,
                width: 10, height: 20,
                speedX: Math.cos(angle) * speed,
                speedY: Math.sin(angle) * speed,
                color: '#FF00FF',
                damage: difficultySettings[difficulty].enemyDamage
            });
        }
        boss.lastShot = Date.now();
    }
}

function drawBoss() {
    if (bossImg.complete && bossImg.naturalWidth !== 0) {
        ctx.drawImage(bossImg, boss.x, boss.y, boss.width, boss.height);
    } else {
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(boss.x, boss.y, boss.width, boss.height);
    }
}

// -------- Power-Ups --------
function spawnPowerUp(x, y) {
    if (Math.random() < 0.4 && !bossActive) {
        const types = ['rapidFire', 'tripleShot', 'shield'];
        const type = types[Math.floor(Math.random() * types.length)];
        const colors = { rapidFire: '#FFA500', tripleShot: '#00FFFF', shield: '#FFFF00' };
        powerUps.push({
            x, y,
            width: 30, height: 30,
            speed: 3,
            type,
            color: colors[type],
            duration: 8000
        });
    }
}

function updatePowerUps() {
    for (let i = powerUps.length-1; i>=0; i--) {
        const p = powerUps[i];
        p.y += p.speed;
        if (p.y > canvas.height) { powerUps.splice(i,1); continue; }
        if (player.x < p.x + p.width && player.x + player.width > p.x &&
            player.y < p.y + p.height && player.y + player.height > p.y) {
            player.powerUps[p.type] = true;
            setTimeout(() => {
                player.powerUps[p.type] = false;
                updatePowerupDisplay();
            }, p.duration);
            powerUps.splice(i,1);
            updatePowerupDisplay();
        }
    }
}

function drawPowerUps() {
    powerUps.forEach(p => {
        let img = null;
        if (p.type === 'shield') img = shieldImg;
        else if (p.type === 'rapidFire') img = rapidFireImg;
        else if (p.type === 'tripleShot') img = tripleShotImg;
        if (img && img.complete && img.naturalWidth !== 0) {
            ctx.drawImage(img, p.x, p.y, p.width, p.height);
        } else {
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x, p.y, p.width, p.height);
            ctx.fillStyle = '#000';
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            const letter = p.type === 'rapidFire' ? 'R' : p.type === 'tripleShot' ? 'T' : 'S';
            ctx.fillText(letter, p.x + p.width/2, p.y + p.height/2 + 7);
        }
    });
}

// -------- Explosions --------
function createExplosion(x, y, color) {
    for (let i = 0; i < 30; i++) {
        explosions.push({
            x, y,
            radius: Math.random() * 3 + 1,
            speedX: Math.random() * 6 - 3,
            speedY: Math.random() * 6 - 3,
            color: color || `hsl(${Math.random()*60}, 100%, 50%)`,
            life: 30 + Math.random() * 20
        });
    }
}

function updateExplosions() {
    for (let i = explosions.length-1; i>=0; i--) {
        const e = explosions[i];
        e.x += e.speedX;
        e.y += e.speedY;
        e.life--;
        if (e.life <= 0) explosions.splice(i,1);
    }
}

function drawExplosions() {
    explosions.forEach(e => {
        ctx.globalAlpha = e.life / 50;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.radius, 0, Math.PI*2);
        ctx.fillStyle = e.color;
        ctx.fill();
    });
    ctx.globalAlpha = 1;
}

// -------- Collisions --------
function checkCollisions() {
    // Player bullets vs enemies
    for (let b = player.bullets.length-1; b>=0; b--) {
        const bullet = player.bullets[b];
        for (let e = enemies.length-1; e>=0; e--) {
            const enemy = enemies[e];
            if (bullet.x < enemy.x + enemy.width && bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height && bullet.y + bullet.height > enemy.y) {
                player.bullets.splice(b,1);
                enemy.health--;
                if (enemy.health <= 0) {
                    spawnPowerUp(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
                    createExplosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2, enemy.color);
                    enemies.splice(e,1);
                    score += 100 * gameLevel;
                    updateScore();
                }
                break;
            }
        }
    }

    // Player bullets vs boss
    for (let b = player.bullets.length-1; b>=0; b--) {
        const bullet = player.bullets[b];
        if (bossActive && bullet.x < boss.x + boss.width && bullet.x + bullet.width > boss.x &&
            bullet.y < boss.y + boss.height && bullet.y + bullet.height > boss.y) {
            player.bullets.splice(b,1);
            boss.health--;
            updateBossHealth();
            if (boss.health <= 0) {
                score += 5000;
                updateScore();
                bossActive = false;
                bossHealthBar.style.display = 'none';
                createExplosion(boss.x + boss.width/2, boss.y + boss.height/2, '#FF0000');
                spawnPowerUp(boss.x + boss.width/2, boss.y + boss.height/2);
                gameLevel++;
            }
        }
    }

    // Enemy bullets vs player
    for (let b = enemyBullets.length-1; b>=0; b--) {
        const bullet = enemyBullets[b];
        if (player.x < bullet.x + 6 && player.x + player.width > bullet.x &&
            player.y < bullet.y + 12 && player.y + player.height > bullet.y) {
            enemyBullets.splice(b,1);
            takeDamage(bullet.damage || 1);
        }
    }

    // Direct enemy collision
    if (!invulnerable) {
        for (let e = enemies.length-1; e>=0; e--) {
            const enemy = enemies[e];
            if (player.x < enemy.x + enemy.width && player.x + player.width > enemy.x &&
                player.y < enemy.y + enemy.height && player.y + player.height > enemy.y) {
                takeDamage(difficultySettings[difficulty].enemyCollisionDamage);
                createExplosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2, enemy.color);
                enemies.splice(e,1);
                score += 50;
                updateScore();
            }
        }
        if (bossActive && player.x < boss.x + boss.width && player.x + player.width > boss.x &&
            player.y < boss.y + boss.height && player.y + player.height > boss.y) {
            takeDamage(difficultySettings[difficulty].bossCollisionDamage);
        }
    }
}

function takeDamage(damage = 1) {
    if (player.powerUps.shield) {
        player.powerUps.shield = false;
        updatePowerupDisplay();
    } else {
        lives -= damage;
        updateLivesDisplay();
        invulnerable = true;
        player.blinkCount = 0;
        if (lives <= 0) gameOver();
    }
}

// -------- UI Updates --------
function updateBossHealth() {
    const percent = (boss.health / boss.maxHealth) * 100;
    bossHealthFill.style.width = `${percent}%`;
}
function updateScore() { scoreElement.textContent = score; }
function updateWave() { waveElement.textContent = currentWave; }
function updateLivesDisplay() { livesElement.innerHTML = '❤️'.repeat(Math.max(0, lives)); }
function updatePowerupDisplay() {
    rapidFireElement.classList.toggle('active', player.powerUps.rapidFire);
    tripleShotElement.classList.toggle('active', player.powerUps.tripleShot);
    shieldElement.classList.toggle('active', player.powerUps.shield);
}

// -------- Game Over / Win --------
function gameOver() {
    gameStarted = false;
    finalScoreElement.textContent = score;
    finalWavesElement.textContent = totalWaves;
    gameOverScreen.style.display = 'block';
    document.getElementById('topRight').style.display = 'none';
    try { gameMusic.pause(); } catch(e) {}
}

function gameWin() {
    gameStarted = false;
    winFinalScoreElement.textContent = score;
    winFinalWavesElement.textContent = totalWaves;
    gameWinScreen.style.display = 'block';
    document.getElementById('topRight').style.display = 'none';
    canvas.style.borderColor = '#00FF00';
    canvas.style.boxShadow = '0 0 40px rgba(0,255,0,0.8)';
    try { gameMusic.pause(); } catch(e) {}
}

// -------- Pause / Home --------
function togglePause() {
    if (!gameStarted || lives <= 0 || gameLevel > MAX_GAME_LEVEL) return;
    isPaused = !isPaused;
    if (isPaused) {
        cancelAnimationFrame(animationFrameId);
        pauseScreen.style.display = 'flex';
        try { gameMusic.pause(); } catch(e) {}
    } else {
        pauseScreen.style.display = 'none';
        try { gameMusic.play(); } catch(e) {}
        gameLoop();
    }
}

function goHome() {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    gameStarted = false;
    isPaused = false;
    gameOverScreen.style.display = 'none';
    gameWinScreen.style.display = 'none';
    pauseScreen.style.display = 'none';
    uiContainer.style.display = 'none';
    document.getElementById('topRight').style.display = 'none';
    powerupStatusContainer.style.display = 'none';
    bossHealthBar.style.display = 'none';
    gameControls.style.display = 'none';
    if (isMobile) mobileControls.style.display = 'none';
    startScreen.style.display = 'block';
    try { gameMusic.pause(); } catch(e) {}
}

// -------- Bootstrap --------
window.onload = function () {
    initGame();
    pauseBtn.addEventListener('click', togglePause);
    homeBtn.addEventListener('click', goHome);
};
