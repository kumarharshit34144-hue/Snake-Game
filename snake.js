
// =====================================
// 1. SELECT HTML ELEMENTS
// =====================================

const board = document.getElementById("game-board");

const foodElement = document.getElementById("food");

const scoreElement = document.getElementById("score");

const highScoreElement = document.getElementById("highScore");

const message = document.getElementById("message");

const startBtn = document.getElementById("startBtn");

const pauseBtn = document.getElementById("pauseBtn");


// =====================================
// 2. GAME VARIABLES
// =====================================

const gridSize = 25;

let snake = [];

let food = {};

let direction = { x: 1, y: 0 };

let nextDirection = { x: 1, y: 0 };

let score = 0;

let highScore =
    Number(localStorage.getItem("snakeHighScore")) || 0;

let gameInterval = null;

let gameRunning = false;

let paused = false;

highScoreElement.textContent = highScore;


// =====================================
// 3. START GAME
// =====================================

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


// =====================================
// 4. GENERATE FOOD
// =====================================

function generateFood() {

    do {

        food = {
            x: Math.floor(Math.random() * gridSize),
            y: Math.floor(Math.random() * gridSize)
        };

    } while (
        snake.some(part =>
            part.x === food.x &&
            part.y === food.y
        )
    );

    foodElement.style.left = food.x * 4 + "%";

    foodElement.style.top = food.y * 4 + "%";
}


// =====================================
// 5. MAIN GAME LOOP
// =====================================

function gameLoop() {

    direction = { ...nextDirection };

    const newHead = {
        x: snake[0].x + direction.x,
        y: snake[0].y + direction.y
    };

    // Check food
    const ateFood =
        newHead.x === food.x &&
        newHead.y === food.y;


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


    // Check body collision
    const bodyToCheck = ateFood
        ? snake
        : snake.slice(0, -1);

    const hitSelf = bodyToCheck.some(part =>
        part.x === newHead.x &&
        part.y === newHead.y
    );

    if (hitSelf) {

        gameOver();

        return;
    }


    // Move snake
    snake.unshift(newHead);


    // Eat food
    if (ateFood) {

        score += 10;

        scoreElement.textContent = score;

        // Update high score
        if (score > highScore) {

            highScore = score;

            highScoreElement.textContent = highScore;

            localStorage.setItem(
                "snakeHighScore",
                highScore
            );

        }

        generateFood();

    } else {

        // Remove tail
        snake.pop();

    }

    drawGame();
}


// =====================================
// 6. DRAW GAME
// =====================================

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


    // Draw food
    foodElement.style.left = food.x * 4 + "%";

    foodElement.style.top = food.y * 4 + "%";
}


// =====================================
// 7. CHANGE DIRECTION
// =====================================

function changeDirection(newDirection) {

    if (!gameRunning || paused) return;


    // Prevent opposite direction
    if (
        newDirection.x === -direction.x &&
        newDirection.y === -direction.y
    ) {
        return;
    }

    if (
        newDirection.x === -nextDirection.x &&
        newDirection.y === -nextDirection.y
    ) {
        return;
    }

    nextDirection = newDirection;
}


// =====================================
// 8. KEYBOARD CONTROLS
// =====================================

document.addEventListener("keydown", function(event) {

    const directions = {

        ArrowUp: { x: 0, y: -1 },

        ArrowDown: { x: 0, y: 1 },

        ArrowLeft: { x: -1, y: 0 },

        ArrowRight: { x: 1, y: 0 }

    };

    if (directions[event.key]) {

        event.preventDefault();

        changeDirection(directions[event.key]);

    }

});


// =====================================
// 9. MOBILE TOUCH BUTTONS
// =====================================

const touchDirections = {

    up: { x: 0, y: -1 },

    down: { x: 0, y: 1 },

    left: { x: -1, y: 0 },

    right: { x: 1, y: 0 }

};

document.querySelectorAll(".direction-btn").forEach(button => {

    button.addEventListener("pointerdown", function(event) {

        event.preventDefault();

        const selectedDirection = this.dataset.direction;

        changeDirection(touchDirections[selectedDirection]);

    });

});


// =====================================
// 10. SWIPE CONTROLS
// =====================================

let touchStartX = 0;

let touchStartY = 0;

board.addEventListener("pointerdown", function(event) {

    touchStartX = event.clientX;

    touchStartY = event.clientY;

});

board.addEventListener("pointerup", function(event) {

    const diffX = event.clientX - touchStartX;

    const diffY = event.clientY - touchStartY;

    // Ignore very small movements
    if (Math.abs(diffX) < 20 && Math.abs(diffY) < 20) {
        return;
    }

    // Horizontal swipe
    if (Math.abs(diffX) > Math.abs(diffY)) {

        if (diffX > 0) {
            changeDirection(touchDirections.right);
        } else {
            changeDirection(touchDirections.left);
        }

    }

    // Vertical swipe
    else {

        if (diffY > 0) {
            changeDirection(touchDirections.down);
        } else {
            changeDirection(touchDirections.up);
        }

    }

});


// =====================================
// 11. GAME OVER
// =====================================

function gameOver() {

    clearInterval(gameInterval);

    gameRunning = false;

    paused = false;

    message.textContent =
        "Game Over! Final Score: " + score;

    startBtn.textContent = "Play Again";

    pauseBtn.textContent = "Pause";
}


// =====================================
// 12. PAUSE AND RESUME
// =====================================

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


// =====================================
// 13. START BUTTON
// =====================================

startBtn.addEventListener("click", startGame);
