let canvas = document.getElementById("gameCanvas");
let ctx = canvas.getContext("2d");
let box = 20;
let snake = [];
let food = {
    x: Math.floor(Math.random() * 17 + 1) * box,
    y: Math.floor(Math.random() * 15 + 3) * box
};
let score = 0;
let game;
let d;

document.getElementById("startButton").addEventListener("click", startGame);
document.addEventListener("keydown", direction);

// Touch event variables
let touchstartX = 0;
let touchstartY = 0;
let touchendX = 0;
let touchendY = 0;

// Add touch event listeners
canvas.addEventListener('touchstart', e => {
    touchstartX = e.changedTouches[0].screenX;
    touchstartY = e.changedTouches[0].screenY;
}, false);

canvas.addEventListener('touchend', e => {
    touchendX = e.changedTouches[0].screenX;
    touchendY = e.changedTouches[0].screenY;
    handleSwipeGesture();
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

function handleSwipeGesture() {
    const deltaX = touchendX - touchstartX;
    const deltaY = touchendY - touchstartY;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (deltaX > 0 && d !== "LEFT") d = "RIGHT";
        else if (deltaX < 0 && d !== "RIGHT") d = "LEFT";
    } else {
        // Vertical swipe
        if (deltaY > 0 && d !== "UP") d = "DOWN";
        else if (deltaY < 0 && d !== "DOWN") d = "UP";
    }
}

function draw() {
    ctx.fillStyle = '#dcdcdc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < snake.length; i++) {
        ctx.fillStyle = (i === 0) ? "#4caf50" : "#8bc34a";
        ctx.fillRect(snake[i].x, snake[i].y, box, box);

        ctx.strokeStyle = "#388e3c";
        ctx.strokeRect(snake[i].x, snake[i].y, box, box);
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

    let newHead = { x: snakeX, y: snakeY };

    if (snakeX < box || snakeY < box || snakeX > canvas.width - box || snakeY > canvas.height - box || collision(newHead, snake)) {
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
