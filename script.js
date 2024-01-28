let canvas = document.getElementById("gameCanvas");
let ctx = canvas.getContext("2d");
let controlArea = document.getElementById("controlArea");
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

// Audio elements
let eatSound = new Audio('audio/eat_sound.wav');
let gameOverSound = new Audio('audio/game_over_sound.wav');
let bgMusic = new Audio('audio/bgmusic.mp3');
bgMusic.loop = true;

document.getElementById("startButton").addEventListener("click", startGame);
document.addEventListener("keydown", direction);
controlArea.addEventListener('touchmove', handleTouchMove, false);

function startGame() {
    snake = [{ x: 9 * box, y: 10 * box }];
    score = 0;
    d = null;
    clearInterval(game);
    game = setInterval(draw, 100);
    bgMusic.play(); // Play background music
}

function direction(event) {
    if (event.keyCode === 37 && d !== "RIGHT") d = "LEFT";
    else if (event.keyCode === 38 && d !== "DOWN") d = "UP";
    else if (event.keyCode === 39 && d !== "LEFT") d = "RIGHT";
    else if (event.keyCode === 40 && d !== "UP") d = "DOWN";
}

function handleTouchMove(event) {
    // Touch move handling logic
    // ...
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
        eatSound.play(); // Play eating sound
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
        gameOverSound.play(); // Play game over sound
        clearInterval(game);
        bgMusic.pause(); // Stop background music
        alert("Game Over! Score: " + score);
        submitScore("PlayerName", score); // Submit score to leaderboard
        return;
    }

    snake.unshift(newHead);
}

function collision(head, array) {
    // Collision detection logic
    // ...
}

// Leaderboard Functions
function submitScore(name, score) {
    // Submit score to Google Sheets via Apps Script Web App
    fetch('https://script.google.com/macros/s/AKfycbxmVTIwsKdgcJXjWoc5JIAJrJK9dqLFhAUCzyz1M7FNa7WejsbAHp8zGJt3zI4Qerja7Q/exec', {
        method: 'POST',
        mode: 'no-cors',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: name, score: score })
    })
    .then(response => response.text())
    .then(result => console.log(result))
    .catch(error => console.error('Error:', error));
}

function getLeaderboard() {
    // Retrieve leaderboard data from Google Sheets
    fetch('https://script.google.com/macros/s/AKfycbxmVTIwsKdgcJXjWoc5JIAJrJK9dqLFhAUCzyz1M7FNa7WejsbAHp8zGJt3zI4Qerja7Q/exec')
        .then(response => response.json())
        .then(data => {
            // Process and display the leaderboard data
            console.log(data);
        })
        .catch(error => console.error('Error:', error));
}
