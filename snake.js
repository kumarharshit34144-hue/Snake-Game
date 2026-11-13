
// Selecting HTML elements
const board = document.querySelector("#game-board");
const foodElement = document.getElementById("food");
const scoreElement = document.getElementById("score");
const highScoreElement = document.getElementById("highScore");
const message = document.getElementById("message");

const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");

// Game variables
const gridSize = 25;

let snake;
let food;
let direction;
let nextDirection;
let score = 0;

let gameInterval = null;
let gameRunning = false;
let paused = false;

// Get saved high score
let highScore = Number(localStorage.getItem("snakeHighScore")) || 0;

highScoreElement.textContent = highScore;


// Start game
function startGame() {

    clearInterval(gameInterval);

    snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];

    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };

    score = 0;
    scoreElement.textContent = score;

    gameRunning = true;
    paused = false;

    message.textContent = "Game Started!";

    startBtn.textContent = "Restart Game";
    pauseBtn.textContent = "Pause";

    generateFood();
    drawGame();

    gameInterval = setInterval(gameLoop, 120);
}


// Generate random food
function generateFood() {

    do {
        food = {
            x: Math.floor(Math.random() * gridSize),
            y: Math.floor(Math.random() * gridSize)
        };
    } while (
        snake.some(part => part.x === food.x && part.y === food.y)
    );

    foodElement.style.left = food.x * 4 + "%";
    foodElement.style.top = food.y * 4 + "%";
}


// Main game loop
function gameLoop() {

    direction = nextDirection;

    const newHead = {
        x: snake[0].x + direction.x,
        y: snake[0].y + direction.y
    };

    // Check whether food is eaten
    const ateFood =
        newHead.x === food.x && newHead.y === food.y;

    // Check wall collision
    if (
        newHead.x < 0 ||
        newHead.x >= gridSize ||
        newHead.y < 0 ||
        newHead.y >= gridSize
    ) {
        gameOver();
        return;
    }

    // Check self collision
    const bodyToCheck = ateFood ? snake : snake.slice(0, -1);

    const hitSelf = bodyToCheck.some(
        part => part.x === newHead.x && part.y === newHead.y
    );

    if (hitSelf) {
        gameOver();
        return;
    }

    // Add new head
    snake.unshift(newHead);

    if (ateFood) {

        score += 10;
        scoreElement.textContent = score;

        // Update high score
        if (score > highScore) {
            highScore = score;
            highScoreElement.textContent = highScore;

            localStorage.setItem("snakeHighScore", highScore);
        }

        generateFood();

    } else {

        // Remove last body part
        snake.pop();
    }

    drawGame();
}


// Draw snake on board
function drawGame() {

    // Remove previous snake
    document.querySelectorAll(".snake-part").forEach(part => {
        part.remove();
    });

    // Draw new snake
    snake.forEach((part, index) => {

        const snakePart = document.createElement("div");

        snakePart.classList.add("snake-part");

        if (index === 0) {
            snakePart.classList.add("snake-head");
        }

        snakePart.style.left = part.x * 4 + "%";
        snakePart.style.top = part.y * 4 + "%";

        board.appendChild(snakePart);
    });

    // Update food position
    foodElement.style.left = food.x * 4 + "%";
    foodElement.style.top = food.y * 4 + "%";
}


// Keyboard controls
document.addEventListener("keydown", function(event) {

    const keys = [
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight"
    ];

    if (keys.includes(event.key)) {
        event.preventDefault();
    }

    if (!gameRunning || paused) return;

    // Prevent reverse movement
    if (event.key === "ArrowUp" && direction.y !== 1) {
        nextDirection = { x: 0, y: -1 };
    }

    else if (event.key === "ArrowDown" && direction.y !== -1) {
        nextDirection = { x: 0, y: 1 };
    }

    else if (event.key === "ArrowLeft" && direction.x !== 1) {
        nextDirection = { x: -1, y: 0 };
    }

    else if (event.key === "ArrowRight" && direction.x !== -1) {
        nextDirection = { x: 1, y: 0 };
    }

});


// Game over
function gameOver() {

    clearInterval(gameInterval);

    gameRunning = false;
    paused = false;

    message.textContent = "Game Over! Final Score: " + score;

    startBtn.textContent = "Play Again";
    pauseBtn.textContent = "Pause";
}


// Pause and resume
pauseBtn.addEventListener("click", function() {

    if (!gameRunning) return;

    if (!paused) {

        clearInterval(gameInterval);
        paused = true;

        message.textContent = "Game Paused";

        pauseBtn.textContent = "Resume";

    } else {

        paused = false;

        message.textContent = "Game Resumed";

        pauseBtn.textContent = "Pause";

        gameInterval = setInterval(gameLoop, 120);
    }

});


// Start button
startBtn.addEventListener("click", startGame);
