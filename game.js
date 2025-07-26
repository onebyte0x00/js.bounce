const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const levelElement = document.getElementById('level');
const startBtn = document.getElementById('start-btn');

// Game settings
const paddleHeight = 15;
const paddleWidth = 100;
const ballRadius = 10;
const brickRowCount = 5;
const brickColumnCount = 9;
const brickWidth = 60;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 60;
const brickOffsetLeft = 30;

// Game variables
let score = 0;
let lives = 3;
let level = 1;
let gameRunning = false;
let gameLoop;
let rightPressed = false;
let leftPressed = false;

// Game objects
let paddle = {
    x: canvas.width / 2 - paddleWidth / 2,
    y: canvas.height - paddleHeight - 10,
    width: paddleWidth,
    height: paddleHeight
};

let ball = {
    x: canvas.width / 2,
    y: canvas.height - 30,
    radius: ballRadius,
    dx: 4,
    dy: -4
};

let bricks = [];

// Initialize bricks
function initBricks() {
    bricks = [];
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            bricks[c][r] = { x: 0, y: 0, status: 1 };
        }
    }
}

// Draw bricks
function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status === 1) {
                const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
                const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                
                // Different colors for different rows
                const colors = ['#f44336', '#ff9800', '#ffeb3b', '#4CAF50', '#2196F3'];
                ctx.fillStyle = colors[r];
                ctx.fillRect(brickX, brickY, brickWidth, brickHeight);
            }
        }
    }
}

// Draw paddle
function drawPaddle() {
    ctx.fillStyle = '#0095DD';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

// Draw ball
function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#FF5722';
    ctx.fill();
    ctx.closePath();
}

// Update game info display
function updateGameInfo() {
    scoreElement.textContent = `Score: ${score}`;
    livesElement.textContent = `Lives: ${lives}`;
    levelElement.textContent = `Level: ${level}`;
}

// Collision detection
function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const brick = bricks[c][r];
            if (brick.status === 1) {
                if (
                    ball.x > brick.x &&
                    ball.x < brick.x + brickWidth &&
                    ball.y > brick.y &&
                    ball.y < brick.y + brickHeight
                ) {
                    ball.dy = -ball.dy;
                    brick.status = 0;
                    score += 10;
                    updateGameInfo();
                    
                    // Check if all bricks are cleared
                    if (checkLevelComplete()) {
                        levelUp();
                    }
                }
            }
        }
    }
}

function checkLevelComplete() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status === 1) {
                return false;
            }
        }
    }
    return true;
}

function levelUp() {
    level++;
    updateGameInfo();
    
    // Increase ball speed
    ball.dx *= 1.1;
    ball.dy *= 1.1;
    
    // Reset ball and paddle
    ball.x = canvas.width / 2;
    ball.y = canvas.height - 30;
    ball.dy = -Math.abs(ball.dy);
    paddle.x = canvas.width / 2 - paddle.width / 2;
    
    // Create new bricks
    initBricks();
}

// Game over
function gameOver() {
    clearInterval(gameLoop);
    gameRunning = false;
    startBtn.textContent = 'Play Again';
    
    // Show game over message
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#f44336';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 20);
    ctx.font = '20px Arial';
    ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
}

// Game loop
function gameUpdate() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw game elements
    drawBricks();
    drawPaddle();
    drawBall();
    collisionDetection();
    
    // Ball collision with walls
    if (ball.x + ball.dx > canvas.width - ball.radius || ball.x + ball.dx < ball.radius) {
        ball.dx = -ball.dx;
    }
    
    // Ball collision with top
    if (ball.y + ball.dy < ball.radius) {
        ball.dy = -ball.dy;
    }
    
    // Ball collision with paddle
    if (
        ball.y + ball.dy > canvas.height - ball.radius - paddle.height &&
        ball.x > paddle.x &&
        ball.x < paddle.x + paddle.width
    ) {
        // Calculate bounce angle based on where ball hits paddle
        const hitPosition = (ball.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2);
        ball.dx = hitPosition * 5;
        ball.dy = -Math.abs(ball.dy);
    }
    
    // Ball out of bounds (bottom)
    if (ball.y + ball.dy > canvas.height - ball.radius) {
        lives--;
        updateGameInfo();
        
        if (lives === 0) {
            gameOver();
            return;
        } else {
            // Reset ball and paddle
            ball.x = canvas.width / 2;
            ball.y = canvas.height - 30;
            ball.dx = 4;
            ball.dy = -4;
            paddle.x = canvas.width / 2 - paddle.width / 2;
        }
    }
    
    // Move paddle
    if (rightPressed && paddle.x < canvas.width - paddle.width) {
        paddle.x += 7;
    } else if (leftPressed && paddle.x > 0) {
        paddle.x -= 7;
    }
    
    // Move ball
    ball.x += ball.dx;
    ball.y += ball.dy;
}

// Start game
function startGame() {
    if (gameRunning) return;
    
    // Reset game state
    score = 0;
    lives = 3;
    level = 1;
    updateGameInfo();
    
    // Initialize game objects
    paddle = {
        x: canvas.width / 2 - paddleWidth / 2,
        y: canvas.height - paddleHeight - 10,
        width: paddleWidth,
        height: paddleHeight
    };
    
    ball = {
        x: canvas.width / 2,
        y: canvas.height - 30,
        radius: ballRadius,
        dx: 4,
        dy: -4
    };
    
    initBricks();
    gameRunning = true;
    startBtn.textContent = 'Restart Game';
    
    // Clear any existing game loop
    if (gameLoop) {
        clearInterval(gameLoop);
    }
    
    // Start new game loop
    gameLoop = setInterval(gameUpdate, 1000 / 60);
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
        rightPressed = true;
    } else if (e.key === 'ArrowLeft') {
        leftPressed = true;
    } else if (e.key === ' ' && !gameRunning) {
        startGame();
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowRight') {
        rightPressed = false;
    } else if (e.key === 'ArrowLeft') {
        leftPressed = false;
    }
});

// Button control
startBtn.addEventListener('click', startGame);

// Initial setup
initBricks();
updateGameInfo();
