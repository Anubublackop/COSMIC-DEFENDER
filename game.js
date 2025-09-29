// ...existing code...

const playerImg = new Image();
playerImg.src = 'images/Rocket.png';

const enemyImg = new Image();
enemyImg.src = 'images/Alien.png';

// ...existing code...
// ======================
// Game Initialization
// ======================
// ...existing code...

const bossImg = new Image();
bossImg.src = 'images/boss.png';

// ...existing code...
// ...existing code...
const shieldImg = new Image();
shieldImg.src = 'images/shield.svg';
// ...existing code...
// ...existing code...
const rapidFireImg = new Image();
rapidFireImg.src = 'images/rapidFire.svg';
// ...existing code...
const tripleShotImg = new Image();
tripleShotImg.src = 'images/tripleShot.svg';
const gameMusic = document.getElementById('gameMusic');
function startGame() {
    // ...existing code...
    gameMusic.currentTime = 0;
    gameMusic.play();
    // ...existing code...
}
function togglePause() {
    if (!gameStarted || lives <= 0 || gameLevel > MAX_GAME_LEVEL) return;
    isPaused = !isPaused;

    if (isPaused) {
        cancelAnimationFrame(animationFrameId);
        pauseScreen.style.display = 'flex';
        gameMusic.pause();
    } else {
        pauseScreen.style.display = 'none';
        gameMusic.play();
        gameLoop();
    }
}
function goHome() {
    // ...existing code...
    gameMusic.pause();
    gameMusic.currentTime = 0;
    // ...existing code...
}

function gameOver() {
    // ...existing code...
    gameMusic.pause();
    gameMusic.currentTime = 0;
    // ...existing code...
}
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const gameWinScreen = document.getElementById('gameWinScreen');
const scoreElement = document.getElementById('score');
const waveElement = document.getElementById('wave');
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
const startInstructionsElement = document.getElementById('startInstructions');
const controlInstructionsElement = document.getElementById('controlInstructions');
const restartInstructionsElement = document.getElementById('restartInstructions');
const winRestartInstructionsElement = document.getElementById('winRestartInstructions');
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

// Game state
let score = 0;
let gameLevel = 1;
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
let waveClearTime = 0; // For managing delay between waves
const WAVE_DELAY_FRAMES = 120; // 2-second delay at 60fps
// ...existing code...
let difficultySettings = {
    easy: {
        enemyHealth: 0.2,      // Lower health
        enemySpeed: 0.4,       // Slower enemies
        enemyShootRate: 0.3,   // Enemies shoot less often
        bossHealth: 0.5,       // Boss has less health
        enemyDamage: 0.5,      // Bullets do less damage
        enemyCollisionDamage: 1, // Collision does less damage
        bossCollisionDamage: 2
    },
    normal: { enemyHealth: 1, enemySpeed: 1, enemyShootRate: 1, bossHealth: 1, enemyDamage: 1, enemyCollisionDamage: 2, bossCollisionDamage: 3 },
    hard: {
        enemyHealth: 1.3, enemySpeed: 1.2, enemyShootRate: 1.3, bossHealth: 1.3,
        enemyDamage: 1.5, enemyCollisionDamage: 3, bossCollisionDamage: 4
    },
    insane: {
        enemyHealth: 1.5, enemySpeed: 1.2, enemyShootRate: 1.5, bossHealth: 1.7,
        enemyDamage: 2, enemyCollisionDamage: 4, bossCollisionDamage: 5
    }
};
// ...existing code...
let welcomeMessages = {
    easy: "Relax, rookie!",
    normal: "Ready for action!",
    hard: "Steel yourself, veteran!",
    insane: "Brace yourself, legend!"
};

// New: Max game level for victory condition
const MAX_GAME_LEVEL = 20;

// ======================
// Background Elements
// ======================
const stars = [];
const nebula = { x: 0, y: 0, alpha: 0.3 };

// ======================
// Explosions
// ======================
const explosions = [];

// ======================
// Game Objects
// ======================
const player = {
    x: 0,
    y: 0,
    width: 80,
    height: 80,
    speed: 10,
    bullets: [],
    powerUps: {
        rapidFire: false,
        tripleShot: false,
        shield: false
    },
    lastShot: 0,
    blinkCount: 0,
    isShootingFlash: false,
    flashTimer: 0
};

const enemies = [];
const enemyBullets = [];
const powerUps = [];
const boss = {
    x: 0,
    y: -200,
    width: 200,
    height: 200,
    speed: 1,
    health: 0,
    maxHealth: 0,
    direction: 1,
    lastShot: 0,
    shootInterval: 1000
};

// ...existing code...

const wavePatterns = [
    { count: 3, speed: 1.5, spawnRate: 120, enemyHealth: 1, enemyShoot: true },
    { count: 5, speed: 2, spawnRate: 90, enemyHealth: 1, enemyShoot: true },
    { count: 7, speed: 2.5, spawnRate: 75, enemyHealth: 2, enemyShoot: true }
];

// Example: To change the number of enemies per wave, edit the `count` value.
// For example, to spawn 4 enemies in the first wave, change the first object to:
// { count: 4, speed: 1.5, spawnRate: 120, enemyHealth: 1, enemyShoot: true }
const keys = {
    ArrowLeft: false,
    ArrowRight: false,
    Space: false,
    Enter: false
};

// ======================
// Core Game Functions
// ======================

// Function to detect mobile devices
function isMobileDevice() {
    return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Function to resize the canvas dynamically
function resizeCanvas() {
    canvas.width = window.innerWidth * 0.9;
    canvas.height = window.innerHeight * 0.9;
    player.x = Math.max(0, Math.min(player.x, canvas.width - player.width));
    player.y = canvas.height - 100;
}

function initGame() {
    isMobile = isMobileDevice();
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize stars
    for (let i = 0; i < 100; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 3 + 1,
            speed: Math.random() * 2 + 1,
            layer: Math.floor(Math.random() * 3)
        });
    }

    // Set up difficulty selection
    difficultyButtons.forEach(button => {
        button.addEventListener('click', () => {
            difficulty = button.dataset.difficulty;
            difficultyButtons.forEach(btn => btn.classList.remove('selected'));
            button.classList.add('selected');
            difficultyDisplay.textContent = `Mode: ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}`;
            welcomeMessage.textContent = welcomeMessages[difficulty];
        });
    });

    // Default to normal difficulty
    document.querySelector('[data-difficulty="normal"]').classList.add('selected');

    setupInput();

    if (isMobile) {
        startInstructionsElement.textContent = "Tap to Start";
        controlInstructionsElement.textContent = "Drag: Move | Tap: Shoot";
        restartInstructionsElement.textContent = "Tap to Play Again";
        winRestartInstructionsElement.textContent = "Tap to Play Again";
        mobileControls.style.display = 'flex';
    } else {
        startInstructionsElement.textContent = "Press ENTER to Start";
        controlInstructionsElement.textContent = "Arrow Keys: Move | Space: Shoot";
        restartInstructionsElement.textContent = "Press ENTER to Play Again";
        winRestartInstructionsElement.textContent = "Press ENTER to Play Again";
    }
}

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

    if (isMobile) {
        setupTouchControls();
    }
    canvas.focus();
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
            const currentTouchX = e.touches[0].clientX;
            player.x = currentTouchX - canvas.getBoundingClientRect().left - player.width / 2;
            player.x = Math.max(0, Math.min(player.x, canvas.width - player.width));
        }
    }, { passive: false });

    canvas.addEventListener('touchend', (e) => {
        touchMoveActive = false;
    });

    // Mobile control buttons
    leftBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        keys.ArrowLeft = true;
    });

    leftBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        keys.ArrowLeft = false;
    });

    rightBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        keys.ArrowRight = true;
    });

    rightBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        keys.ArrowRight = false;
    });

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

    startScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';
    gameWinScreen.style.display = 'none';
    uiContainer.style.display = 'flex';
    livesElement.style.display = 'block';
    powerupStatusContainer.style.display = 'flex';
    bossHealthBar.style.display = 'none';
    gameControls.style.display = 'flex';

    updateLivesDisplay();
    updateScore();
    updateWave();
    updatePowerupDisplay();
    spawnWave();
    gameLoop();
}

function gameLoop() {
    if (!gameStarted) return;

    update();
    render();
    animationFrameId = requestAnimationFrame(gameLoop);
}

function update() {
    updatePlayer();
    updateBullets();
    updateEnemies();
    updateEnemyBullets();
    updateExplosions();
    if (bossActive) updateBoss();
    updatePowerUps();
    checkCollisions();

    // Handle delay between waves for smoother pacing
    if (enemies.length === 0 && !bossActive && gameStarted) {
        if (waveClearTime === 0 && gameLevel <= MAX_GAME_LEVEL) {
            waveClearTime = frameCount; // Mark the time the wave was cleared
        }
        if (waveClearTime > 0 && (frameCount - waveClearTime > WAVE_DELAY_FRAMES)) {
            spawnWave(); // Spawn next wave after a delay
        }
    }

    frameCount++;
}

function render() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawBackground();

    if (player.blinkCount % 10 < 5 || !invulnerable) {
        drawPlayer();
    }
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
        ctx.fillText('BOSS INCOMING!', canvas.width / 2, canvas.height / 2);
        bossIncomingTimer--;
    } else if (bossIncomingTimer <= 0) {
        showBossIncoming = false;
    }
}

function togglePause() {
    if (!gameStarted || lives <= 0 || gameLevel > MAX_GAME_LEVEL) return;
    isPaused = !isPaused;

    if (isPaused) {
        cancelAnimationFrame(animationFrameId);
        pauseScreen.style.display = 'flex';
    } else {
        pauseScreen.style.display = 'none';
        gameLoop();
    }
}

function goHome() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }

    gameStarted = false;
    isPaused = false;

    // Hide all game screens and UI
    gameOverScreen.style.display = 'none';
    gameWinScreen.style.display = 'none';
    pauseScreen.style.display = 'none';
    uiContainer.style.display = 'none';
    livesElement.style.display = 'none';
    powerupStatusContainer.style.display = 'none';
    bossHealthBar.style.display = 'none';
    gameControls.style.display = 'none';
    if (isMobile) {
        mobileControls.style.display = 'none';
    }

    // Show start screen
    startScreen.style.display = 'block';
}

// ======================
// Background Drawing
// ======================
function drawBackground() {
    const nebulaGradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height)
    );
    nebulaGradient.addColorStop(0, `rgba(70, 0, 130, ${nebula.alpha})`);
    nebulaGradient.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = nebulaGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";
    stars.forEach(star => {
        star.y += star.speed * gameSpeed;
        if (star.y > canvas.height) star.y = 0;
        ctx.globalAlpha = 1 - (star.layer * 0.3);
        ctx.fillRect(star.x, star.y, star.size, star.size);
    });
    ctx.globalAlpha = 1;
}

// ======================
// Player Functions
// ======================
function updatePlayer() {
    // This logic works for both keyboard and mobile button controls
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
        ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);
    }

    // Draw shield if active
    if (player.powerUps.shield) {
        ctx.strokeStyle = '#FFFF00';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(
            player.x + player.width / 2,
            player.y + player.height / 2,
            player.width * 0.75, // Reduced shield size for a better fit
            0,
            Math.PI * 2
        );
        ctx.stroke();
    }
}

// ======================
// Bullet System (Player)
// ======================
function shoot() {
    const baseBullet = {
        width: 8,
        height: 20,
        speed: 12,
        color: '#FF0000'
    };

    const bulletXOffsets = player.powerUps.tripleShot
        ? [5, player.width / 2 - 4, player.width - 13]
        : [player.width / 2 - 4];

    bulletXOffsets.forEach(offset => {
        player.bullets.push({
            ...baseBullet,
            x: player.x + offset,
            y: player.y
        });
    });
}

function updateBullets() {
    player.bullets.forEach((bullet, index) => {
        bullet.y -= bullet.speed;
        if (bullet.y < 0) player.bullets.splice(index, 1);
    });
}

function drawBullets() {
    player.bullets.forEach(bullet => {
        ctx.fillStyle = bullet.color;
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
}

function spawnWave() {
    if (gameLevel > MAX_GAME_LEVEL) {
        gameWin();
        return;
    }

    // Check if it's the final wave (boss wave)
    if (gameLevel === MAX_GAME_LEVEL) {
        spawnBoss();
        return;
    }

    const waveIndex = (gameLevel - 1) % wavePatterns.length;
    const wave = wavePatterns[waveIndex];
    const settings = difficultySettings[difficulty];
    const health = wave.enemyHealth * settings.enemyHealth;

    // Spawn enemies in order from left to right
    for (let i = 0; i < wave.count; i++) {
        setTimeout(() => {
            const spacing = canvas.width / (wave.count + 1);
            const enemyX = spacing * (i + 1) - 30; // Center each enemy
            enemies.push({
                x: enemyX,
                y: -60,
                width: 60,
                height: 60,
                speed: wave.speed * gameSpeed * 0.8 * settings.enemySpeed,
                health: health,
                maxHealth: health,
                color: `hsl(${Math.random() * 60 + 180}, 100%, 50%)`,
                canShoot: wave.enemyShoot,
                lastShot: Date.now() + Math.random() * 2000,
                shootInterval: (1500 + Math.random() * 1000) / settings.enemyShootRate
            });
        }, i * wave.spawnRate);
    }

    waveClearTime = 0;
    currentWave++;
    totalWaves++;
    gameLevel++;
    gameSpeed += 0.1;
    updateWave();
}

// ...existing code...

function updateEnemies() {
    enemies.forEach((enemy, index) => {
        // Move enemy down
        enemy.y += enemy.speed;

        // Track player's horizontal position
        if (player.x + player.width / 2 < enemy.x + enemy.width / 2) {
            enemy.x -= enemy.speed * 0.5; // Move left toward player
        } else if (player.x + player.width / 2 > enemy.x + enemy.width / 2) {
            enemy.x += enemy.speed * 0.5; // Move right toward player
        }

        // Enemy shooting logic
        if (enemy.canShoot && Date.now() - enemy.lastShot > enemy.shootInterval) {
            enemyBullets.push({
                x: enemy.x + enemy.width / 2 - 2,
                y: enemy.y + enemy.height,
                width: 4,
                height: 15,
                speed: 5 * difficultySettings[difficulty].enemySpeed,
                color: '#FFD700',
                damage: difficultySettings[difficulty].enemyDamage
            });
            enemy.lastShot = Date.now();
        }

        if (enemy.y > canvas.height) enemies.splice(index, 1);
    });
}

// ...existing code...



function drawEnemies() {
    enemies.forEach(enemy => {
        ctx.drawImage(enemyImg, enemy.x, enemy.y, enemy.width, enemy.height);

        if (enemy.health > 1) {
            ctx.fillStyle = 'red';
            ctx.fillRect(
                enemy.x,
                enemy.y - 10,
                enemy.width * (enemy.health / enemy.maxHealth),
                5
            );
        }
    });
}

// ======================
// Enemy Bullet System
// ======================
function updateEnemyBullets() {
    enemyBullets.forEach((bullet, index) => {
        bullet.y += bullet.speed;
        if (bullet.y > canvas.height) enemyBullets.splice(index, 1);
    });
}

function drawEnemyBullets() {
    enemyBullets.forEach(bullet => {
        ctx.fillStyle = bullet.color;
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
}

// ======================
// Boss System
// ======================
function spawnBoss() {
    bossActive = true;
    boss.x = canvas.width / 2 - boss.width / 2;
    boss.y = -200;
    const settings = difficultySettings[difficulty];
    // Set a fixed, high health for the final boss
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
        if (boss.x <= 0 || boss.x >= canvas.width - boss.width) {
            boss.direction *= -1;
        }
    }

    if (Date.now() - boss.lastShot > boss.shootInterval) {
        bossShoot();
        boss.lastShot = Date.now();
    }
}

function bossShoot() {
    const bulletSpeed = 4 * difficultySettings[difficulty].enemySpeed;
    const bulletColor = '#FF00FF';
    const bulletWidth = 10;
    const bulletHeight = 20;
    const damage = difficultySettings[difficulty].enemyDamage;

    const bossBulletXOffsets = [-boss.width / 4, 0, boss.width / 4];

    bossBulletXOffsets.forEach(offset => {
        enemyBullets.push({
            x: boss.x + boss.width / 2 + offset - bulletWidth / 2,
            y: boss.y + boss.height,
            width: bulletWidth,
            height: bulletHeight,
            speed: bulletSpeed,
            color: bulletColor,
            damage: damage
        });
    });
}

function drawBoss() {
    if (bossImg && bossImg.complete) {
        ctx.drawImage(bossImg, boss.x, boss.y, boss.width, boss.height);
    } else {
        // Fallback drawing if image fails to load
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(boss.x, boss.y, boss.width, boss.height);
    }
}

// ======================
// Power-Up System
// ======================
function spawnPowerUp(x, y) {
    if (Math.random() < 0.4 && !bossActive) {
        const types = ['rapidFire', 'tripleShot', 'shield'];
        const type = types[Math.floor(Math.random() * types.length)];
        const colors = {
            rapidFire: '#FFA500',
            tripleShot: '#00FFFF',
            shield: '#FFFF00'
        };

        powerUps.push({
            x: x,
            y: y,
            width: 30, // Increased size for better visibility
            height: 30, // Increased size for better visibility
            speed: 3,
            type: type,
            color: colors[type],
            duration: 8000
        });
    }
}

function updatePowerUps() {
    powerUps.forEach((powerUp, index) => {
        powerUp.y += powerUp.speed;

        if (powerUp.y > canvas.height) {
            powerUps.splice(index, 1);
        }
        else if (
            player.x < powerUp.x + powerUp.width &&
            player.x + player.width > powerUp.x &&
            player.y < powerUp.y + powerUp.height &&
            player.y + player.height > powerUp.y
        ) {
            player.powerUps[powerUp.type] = true;
            setTimeout(() => {
                player.powerUps[powerUp.type] = false;
                updatePowerupDisplay();
            }, powerUp.duration);
            powerUps.splice(index, 1);
            updatePowerupDisplay();
        }
    });
}

function drawPowerUps() {
    powerUps.forEach(powerUp => {
        let img;
        if (powerUp.type === 'shield') img = shieldImg;
        if (powerUp.type === 'rapidFire') img = rapidFireImg;
        if (powerUp.type === 'tripleShot') img = tripleShotImg;

        if (img && img.complete) {
            ctx.drawImage(img, powerUp.x, powerUp.y, powerUp.width, powerUp.height);
        } else {
            // Fallback: colored square with letter
            ctx.fillStyle = powerUp.color;
            ctx.fillRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
            ctx.fillStyle = '#000000';
            ctx.font = '20px Arial'; // Increased font size for fallback
            ctx.textAlign = 'center';
            ctx.fillText(
                powerUp.type === 'rapidFire' ? 'R' :
                powerUp.type === 'tripleShot' ? 'T' : 'S',
                powerUp.x + powerUp.width / 2,
                powerUp.y + powerUp.height / 2 + 7 // Adjusted vertical alignment
            );
        }
    });
}

// ======================
// Explosion System
// ======================
function createExplosion(x, y, color) {
    for (let i = 0; i < 30; i++) {
        explosions.push({
            x, y,
            radius: Math.random() * 3 + 1,
            speedX: Math.random() * 6 - 3,
            speedY: Math.random() * 6 - 3,
            color: color || `hsl(${Math.random() * 60}, 100%, 50%)`,
            life: 30 + Math.random() * 20
        });
    }
}

function updateExplosions() {
    explosions.forEach((exp, index) => {
        exp.x += exp.speedX;
        exp.y += exp.speedY;
        exp.life--;
        if (exp.life <= 0) explosions.splice(index, 1);
    });
}

function drawExplosions() {
    explosions.forEach(exp => {
        ctx.globalAlpha = exp.life / 50;
        ctx.beginPath();
        ctx.arc(exp.x, exp.y, exp.radius, 0, Math.PI * 2);
        ctx.fillStyle = exp.color;
        ctx.fill();
    });
    ctx.globalAlpha = 1;
}

// ======================
// Collision & Game Logic
// ======================
function checkCollisions() {
    // Player bullet-enemy collisions
    player.bullets.forEach((bullet, bIndex) => {
        enemies.forEach((enemy, eIndex) => {
            if (
                bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.height > enemy.y
            ) {
                player.bullets.splice(bIndex, 1);
                enemy.health--;

                if (enemy.health <= 0) {
                    if (enemy.color !== '#FF00FF') {
                        spawnPowerUp(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
                        createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.color);
                    }
                    enemies.splice(eIndex, 1);
                    score += 100 * gameLevel;
                    updateScore();
                }
            }
        });

        // Player bullet-boss collisions
        if (bossActive &&
            bullet.x < boss.x + boss.width &&
            bullet.x + bullet.width > boss.x &&
            bullet.y < boss.y + boss.height &&
            bullet.y + bullet.height > boss.y
        ) {
            player.bullets.splice(bIndex, 1);
            boss.health--;
            updateBossHealth();

            if (boss.health <= 0) {
                // Award a large, fixed score bonus for defeating the final boss
                score += 5000;
                updateScore();
                bossActive = false;
                bossHealthBar.style.display = 'none';
                createExplosion(boss.x + boss.width / 2, boss.y + boss.height / 2, '#FF0000');
                spawnPowerUp(boss.x + boss.width / 2, boss.y + boss.height / 2);
                gameLevel++;
            }
        }
    });

    // Enemy bullet-player collisions
    enemyBullets.forEach((bullet, ebIndex) => {
        if (
            player.x < bullet.x + bullet.width &&
            player.x + player.width > bullet.x &&
            player.y < bullet.y + bullet.height &&
            player.y + player.height > bullet.y
        ) {
            enemyBullets.splice(ebIndex, 1);
            takeDamage(bullet.damage || 1);
        }
    });

    // Player-enemy collisions (direct contact)
    if (!invulnerable) {
        enemies.forEach((enemy, index) => {
            if (
                player.x < enemy.x + enemy.width &&
                player.x + player.width > enemy.x &&
                player.y < enemy.y + enemy.height &&
                player.y + player.height > enemy.y
            ) {
                takeDamage(difficultySettings[difficulty].enemyCollisionDamage);
                if (enemy.color !== '#FF00FF') {
                    createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.color);
                    enemies.splice(index, 1);
                    score += 50;
                    updateScore();
                }
            }
        });

        // Player-boss collision
        if (bossActive &&
            player.x < boss.x + boss.width &&
            player.x + player.width > boss.x &&
            player.y < boss.y + boss.height &&
            player.y + player.height > boss.y
        ) {
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

        if (lives <= 0) {
            gameOver();
        }
    }
}

function updateBossHealth() {
    const percent = (boss.health / boss.maxHealth) * 100;
    bossHealthFill.style.width = `${percent}%`;
}

function updateScore() {
    scoreElement.textContent = score;
}

function updateWave() {
    waveElement.textContent = currentWave;
}

function updateLivesDisplay() {
    livesElement.innerHTML = '❤️'.repeat(Math.max(0, lives));
}

function updatePowerupDisplay() {
    rapidFireElement.classList.toggle('active', player.powerUps.rapidFire);
    tripleShotElement.classList.toggle('active', player.powerUps.tripleShot);
    shieldElement.classList.toggle('active', player.powerUps.shield);
}

function gameOver() {
    gameStarted = false;
    finalScoreElement.textContent = score;
    finalWavesElement.textContent = totalWaves;
    gameOverScreen.style.display = 'block';
    gameControls.style.display = 'none';
    gameWinScreen.style.display = 'none';
}

function gameWin() {
    gameStarted = false;
    winFinalScoreElement.textContent = score;
    winFinalWavesElement.textContent = totalWaves;
    gameWinScreen.style.display = 'block';
    gameControls.style.display = 'none';
    gameOverScreen.style.display = 'none';

    canvas.style.borderColor = '#00FF00';
    canvas.style.boxShadow = '0 0 30px rgba(0, 255, 0, 0.7)';
}

// Start the game when the window loads
window.onload = function () {
    initGame();
    // Add event listeners for new buttons
    pauseBtn.addEventListener('click', togglePause);
    homeBtn.addEventListener('click', goHome);
};
