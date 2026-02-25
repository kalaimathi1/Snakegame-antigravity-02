const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const finalScoreElement = document.getElementById('final-score');
const restartBtn = document.getElementById('restart-btn');
const gameContainer = document.querySelector('.game-container');

// Game constants
const GRID_SIZE = 20;
const TILE_COUNT = canvas.width / GRID_SIZE;
const GAME_SPEED = 200;

// Game state
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let snake = [];
let food = { x: 0, y: 0 };
let velocity = { x: 0, y: 0 };
let nextVelocity = { x: 0, y: 0 };
let gameLoop = null;
let isGameRunning = false;
let isGameOver = false;

highScoreElement.textContent = highScore;

// Initialize game
function initGame() {
    snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];
    score = 0;
    velocity = { x: 1, y: 0 };
    nextVelocity = { x: 1, y: 0 };
    scoreElement.textContent = score;
    isGameOver = false;
    placeFood();
    draw();
}

// Game Loop
function update() {
    if (isGameOver) return;

    // Move snake
    velocity = { ...nextVelocity };
    const head = { x: snake[0].x + velocity.x, y: snake[0].y + velocity.y };

    // Check Wall Collision
    if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT) {
        gameOver();
        return;
    }

    // Check Self Collision
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        gameOver();
        return;
    }

    snake.unshift(head);

    // Check Food Collision
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreElement.textContent = score;
        if (score > highScore) {
            highScore = score;
            highScoreElement.textContent = highScore;
            localStorage.setItem('snakeHighScore', highScore);
        }
        placeFood();
        // creating particle effect or animation here could be fun
    } else {
        snake.pop();
    }

    draw();
}

function draw() {
    // Clear canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'; // fade effect for trails? No, strict clear for classic look, but maybe slight trail
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Standard clear

    // Draw snake
    snake.forEach((segment, index) => {
        // Head
        if (index === 0) {
            ctx.fillStyle = '#00cc6a';
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#00ff88';
        } else {
            // Body gradient
            ctx.fillStyle = `hsl(152, 100%, ${50 - (index * 2)}%)`;
            ctx.shadowBlur = 0;
        }

        ctx.beginPath();
        ctx.roundRect(segment.x * GRID_SIZE, segment.y * GRID_SIZE, GRID_SIZE - 2, GRID_SIZE - 2, 4);
        ctx.fill();

        // Reset shadow for next iteration if needed (or keep it off for body)
        ctx.shadowBlur = 0;
    });

    // Draw food
    ctx.fillStyle = '#ff0055';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ff0055';
    ctx.beginPath();
    ctx.arc(
        food.x * GRID_SIZE + GRID_SIZE / 2,
        food.y * GRID_SIZE + GRID_SIZE / 2,
        GRID_SIZE / 2 - 2,
        0,
        Math.PI * 2
    );
    ctx.fill();
    ctx.shadowBlur = 0;
}

function placeFood() {
    food = {
        x: Math.floor(Math.random() * TILE_COUNT),
        y: Math.floor(Math.random() * TILE_COUNT)
    };

    // Make sure food doesn't spawn on snake
    while (snake.some(segment => segment.x === food.x && segment.y === food.y)) {
        food = {
            x: Math.floor(Math.random() * TILE_COUNT),
            y: Math.floor(Math.random() * TILE_COUNT)
        };
    }
}

function gameOver() {
    isGameOver = true;
    clearInterval(gameLoop);
    isGameRunning = false;
    finalScoreElement.textContent = score;
    gameOverScreen.classList.remove('hidden');
    gameContainer.classList.add('shake');
    setTimeout(() => {
        gameContainer.classList.remove('shake');
    }, 500);
}

function startGame() {
    if (isGameRunning) return;

    initGame();
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    isGameRunning = true;
    gameLoop = setInterval(update, GAME_SPEED);
}

// Input handling
document.addEventListener('keydown', (e) => {
    // Prevent scrolling
    if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].indexOf(e.code) > -1) {
        e.preventDefault();
    }

    if (!isGameRunning && !isGameOver && startScreen.classList.contains('hidden') === false) {
        startGame();
        return;
    }

    switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            if (velocity.y !== 1) nextVelocity = { x: 0, y: -1 };
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            if (velocity.y !== -1) nextVelocity = { x: 0, y: 1 };
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            if (velocity.x !== 1) nextVelocity = { x: -1, y: 0 };
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            if (velocity.x !== -1) nextVelocity = { x: 1, y: 0 };
            break;
    }
});

restartBtn.addEventListener('click', startGame);

// Initial draw (for background vibe)
initGame();
