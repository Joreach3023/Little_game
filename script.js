const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const box = 20; // Size of each box in the grid
let snake = [{ x: 9 * box, y: 10 * box }]; // Initial snake position
let score = 0;
let d = 'RIGHT'; // Initial direction
let game;
let food = { x: Math.floor(Math.random() * 17 + 1) * box, y: Math.floor(Math.random() * 15 + 3) * box };
let raindrops = [];

// Load audio files
let eatSound = new Audio('path/to/eat_sound.mp3');
let gameOverSound = new Audio('path/to/game_over_sound.mp3');
let bgMusic = new Audio('path/to/background_music.mp3');
bgMusic.loop = true;

// Touch controls
let touchStartX = 0;
let touchStartY = 0;
canvas.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
}, false);

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault(); // Prevent scrolling
    let touchEndX = e.changedTouches[0].screenX;
    let touchEndY = e.changedTouches[0].screenY;

    let dx = touchEndX - touchStartX;
    let dy = touchEndY - touchStartY;

    if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0 && d !== 'LEFT') d = 'RIGHT';
        else if (dx < 0 && d !== 'RIGHT') d = 'LEFT';
    } else {
        if (dy > 0 && d !== 'UP') d = 'DOWN';
        else if (dy < 0 && d !== 'DOWN') d = 'UP';
    }
}, false);

// Start game
document.getElementById("startButton").addEventListener("click", startGame);

function startGame() {
    snake = [{ x: 9 * box, y: 10 * box }];
    score = 0;
    d = 'RIGHT';
    food = { x: Math.floor(Math.random() * 17 + 1) * box, y: Math.floor(Math.random() * 15 + 3) * box };
    raindrops = [];
    clearInterval(game);
    game = setInterval(draw, 100);
    bgMusic.play();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Draw snake
    for (let i = 0; i < snake.length; i++) {
        ctx.fillStyle = (i === 0) ? "green" : "blue";
        ctx.fillRect(snake[i].x, snake[i].y, box, box);
    }

    // Draw food
    ctx.fillStyle = "red";
    ctx.fillRect(food.x, food.y, box, box);

    // Update snake's next position
    let snakeX = snake[0].x;
    let snakeY = snake[0].y;

    if (d === "LEFT") snakeX -= box;
    if (d === "UP") snakeY -= box;
    if (d === "RIGHT") snakeX += box;
    if (d === "DOWN") snakeY += box;

    // Eating food logic
    if (snakeX === food.x && snakeY === food.y) {
        score++;
        eatSound.play();
        food = { x: Math.floor(Math.random() * 17 + 1) * box, y: Math.floor(Math.random() * 15 + 3) * box };
        addRaindrop(); // Add a raindrop every time the snake eats food
    } else {
        snake.pop(); // Remove the last part of the snake
    }

    // Collision detection (with walls)
    if (snakeX < 0 || snakeX >= canvas.width || snakeY < 0 || snakeY >= canvas.height) {
        gameOver();
        return;
    }

    let newHead = { x: snakeX, y: snakeY };
    snake.unshift(newHead); // Add new head to the snake

    updateAndDrawRain();
    displayScore();
    // Trigger and draw fireworks if the score reaches 5
    if (score >= 5 && fireworks.length === 0) { // Trigger once when score reaches 5
        triggerFireworks();
    }
    drawFireworks();
    
}

function addRaindrop() {
    raindrops.push({ x: Math.random() * canvas.width, y: 0, speed: Math.random() * 2 + 1 });
}

function updateAndDrawRain() {
    raindrops.forEach((drop, index) => {
        drop.y += drop.speed;
        ctx.fillStyle = 'rgba(0, 0, 255, 0.5)';
        ctx.beginPath();
        ctx.arc(drop.x, drop.y, 2, 0, Math.PI * 2);
        ctx.fill();

        if (drop.y > canvas.height) {
            raindrops.splice(index, 1); // Remove raindrop when it falls beyond the canvas
        }
    });
}
function displayScore() {
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, box, 1.6 * box);
}

function collision(head, array) {
    for (let i = 1; i < array.length; i++) {
        if (head.x === array[i].x && head.y === array[i].y) {
            return true;
        }
    }
    return false;
}

function gameOver() {
    clearInterval(game);
    bgMusic.pause();
    gameOverSound.play();
    document.getElementById('nameEntry').style.display = 'block';
}

// Leaderboard Functions
function submitPlayerScore() {
    const playerName = document.getElementById('playerName').value.trim();
    if (!playerName) {
        alert("Please enter your name.");
        return;
    }
    const data = { name: playerName, score: score };
    fetch('https://script.google.com/macros/s/https://script.google.com/macros/s/AKfycbzLJHP3H8cvJffQEqdRI6nrtgHSo7-EacEXSySafzsM1MBx66thshcMSRLuwjowvqGlqw/exec/exec', {
        method: 'POST',
        mode: 'no-cors', // Note: 'no-cors' mode doesn't allow reading the response from the server
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(() => {
        document.getElementById('nameEntry').style.display = 'none';
        getLeaderboard();
    })
    .catch(error => console.error('Error:', error));
}

function getLeaderboard() {
    fetch('https://script.google.com/macros/s/https://script.google.com/macros/s/AKfycbzLJHP3H8cvJffQEqdRI6nrtgHSo7-EacEXSySafzsM1MBx66thshcMSRLuwjowvqGlqw/exec/exec')
    .then(response => response.json())
    .then(data => {
        const leaderboardList = document.getElementById('leaderboardList');
        leaderboardList.innerHTML = '';
        data.forEach((entry, index) => {
            const listItem = document.createElement('li');
            listItem.textContent = `${entry[0]}: ${entry[1]}`;
            leaderboardList.appendChild(listItem);
        });
    })
    .catch(error => console.error('Error fetching leaderboard:', error));
}

// Fireworks logic
let fireworks = [];

function triggerFireworks() {
    if (score === 5) {
        for (let i = 0; i < 10; i++) {
            fireworks.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * (20 - 5) + 5,
                alpha: 1,
                color: `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`
            });
        }
    }
}

function drawFireworks() {
    fireworks.forEach((firework, index) => {
        ctx.fillStyle = `rgba(${firework.color},${firework.alpha})`;
        ctx.beginPath();
        ctx.arc(firework.x, firework.y, firework.radius, 0, Math.PI * 2);
        ctx.fill();
        firework.alpha -= 0.01;
        if (firework.alpha <= 0) {
            fireworks.splice(index, 1);
        }
    });
}



// Remember to call getLeaderboard on game start and after submitting a score
document.addEventListener('DOMContentLoaded', getLeaderboard);



