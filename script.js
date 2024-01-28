let canvas = document.getElementById("gameCanvas");
let ctx = canvas.getContext("2d");
let box = 20;
let snake = [];
snake[0] = { x: 9 * box, y: 10 * box };
let food = {
    x: Math.floor(Math.random() * 17 + 1) * box,
    y: Math.floor(Math.random() * 15 + 3) * box
};
let score = 0;
let game;
let d;

document.getElementById("startButton").addEventListener("click", startGame);
document.addEventListener("keydown", direction);

// Add touch event listener
canvas.addEventListener('touchmove', e => {
    handleTouchMove(e);
}, false);

function startGame() {
    snake = [{ x: 9 * box, y: 10 * box }];
    score = 0;
    d = null;
    clearInterval(game);
    game = setInterval(draw, 100);
}

function direction(event) {
    if (event.keyCode === 37 && d !== "RIGHT") d = "LEFT";
    else if (event.keyCode === 38 && d !== "DOWN") d = "UP";
    else if (event.keyCode === 39 && d !== "LEFT") d = "RIGHT";
    else if (event.keyCode === 40 && d !== "UP") d = "DOWN";
}

function handleTouchMove(event) {
    const touchX = event.touches[0].clientX;
    const touchY = event.touches[0].clientY;
    const snakeHeadX = snake[0].x;
    const snakeHeadY = snake[0].y;
    const canvasRect = canvas.getBoundingClientRect();

    // Convert touch coordinates to canvas coordinates
    const canvasTouchX = touchX - canvasRect.left;
    const canvasTouchY = touchY - canvasRect.top;

    // Determine direction based on touch position relative to snake head
    if (Math.abs(canvasTouchX - snakeHeadX) > Math.abs(canvasTouchY - snakeHeadY)) {
        if (canvasTouchX > snakeHeadX && d !== "LEFT") d = "RIGHT";
        else if (canvasTouchX < snakeHeadX && d !== "RIGHT") d = "LEFT";
    } else {
        if (canvasTouchY > snakeHeadY && d !== "UP") d = "DOWN";
        else if (canvasTouchY < snakeHeadY && d !== "DOWN") d = "UP";
    }

    event.preventDefault();
}

function draw() {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < snake.length; i++) {
        ctx.fillStyle = (i == 0) ? "green" : "blue";
        ctx.fillRect(snake[i].x, snake[i].y, box, box);
    }

    ctx.fillStyle = "red";
    ctx.fillRect(food.x, food.y, box, box);

    let snakeX = snake[0].x;
    let snakeY = snake[0].y;

    if (d === "LEFT") snakeX -= box;
    if (d === "UP") snakeY -= box;
    if (d === "RIGHT") snakeX += box;
    if (d === "DOWN") snakeY += box;

    if (snakeX === food.x && snakeY === food.y) {
        score++;
        food = {
            x: Math.floor(Math.random() * 17 + 1) * box,
            y: Math.floor(Math.random() * 15 + 3) * box
        };
    } else {
        snake.pop();
    }

    let newHead = {
        x: snakeX,
        y: snakeY
    };

    if (snakeX < 0 || snakeY < 0 || snakeX >= canvas.width || snakeY >= canvas.height || collision(newHead, snake)) {
        clearInterval(game);
        alert("Game Over! Score: " + score);
    }

    snake.unshift(newHead);
}

function collision(head, array) {
    for (let i = 0; i < array.length; i++) {
        if (head.x === array[i].x && head.y === array[i].y) {
            return true;
        }
    }
    return false;
}

