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
let d;
let game;
let raindrops = [];

document.getElementById("startButton").addEventListener("click", startGame);

function startGame() {
    snake = [{ x: 9 * box, y: 10 * box }];
    score = 0;
    d = 'RIGHT'; // Default direction
    food = {
        x: Math.floor(Math.random() * 17 + 1) * box,
        y: Math.floor(Math.random() * 15 + 3) * box
    };
    clearInterval(game);
    game = setInterval(draw, 100);
    document.getElementById('nameEntry').style.display = 'none'; // Hide name entry on game start
    bgMusic.play();
}

let raindrops = [];

function addRaindrop() {
    // Adds a new raindrop at a random position at the top
    raindrops.push({ x: Math.random() * canvas.width, y: 0 });
}

for (let i = 0; i < 20; i++) { // Start with 20 raindrops
    addRaindrop();
}

function updateAndDrawRain() {
    ctx.fillStyle = 'blue';
    raindrops.forEach((drop, index) => {
        drop.y += 4; // Speed of raindrop fall
        ctx.beginPath();
        ctx.arc(drop.x, drop.y, 2, 0, Math.PI * 2); // Draw raindrop as small circle
        ctx.fill();

        // Remove raindrop if it goes beyond the canvas
        if (drop.y > canvas.height) {
            raindrops.splice(index, 1);
        }
    });
}

let fireworks = [];

function triggerFireworks() {
    fireworks.push({ x: canvas.width / 2, y: canvas.height / 2, size: 1, maxSize: 50 });
}

function updateAndDrawFireworks() {
    for (let i = 0; i < fireworks.length; i++) {
        let fw = fireworks[i];
        fw.size += 2; // Speed of fireworks expansion
        ctx.beginPath();
        ctx.arc(fw.x, fw.y, fw.size, 0, 2 * Math.PI);
        ctx.fillStyle = 'red';
        ctx.fill();

        // Remove fireworks if it reaches its max size
        if (fw.size > fw.maxSize) {
            fireworks.splice(i, 1);
            i--;
        }
    }
}


function direction(event) {
    let key = event.keyCode;
    if (key === 37 && d !== "RIGHT") d = "LEFT";
    else if (key === 38 && d !== "DOWN") d = "UP";
    else if (key === 39 && d !== "LEFT") d = "RIGHT";
    else if (key === 40 && d !== "UP") d = "DOWN";
}

document.addEventListener("keydown", direction);

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updateAndDrawRain();
    updateAndDrawFireworks(); // Update and draw fireworks if active
    for (let i = 0; i < snake.length; i++) {
        ctx.fillStyle = (i === 0) ? "green" : "blue";
        ctx.fillRect(snake[i].x, snake[i].y, box, box);
    }

    ctx.fillStyle = "red";
    ctx.fillRect(food.x, food.y, box, box);

    // Snake's next position
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
    food = {
        x: Math.floor(Math.random() * 17 + 1) * box,
        y: Math.floor(Math.random() * 15 + 3) * box
    };
    
    // Add multiple new raindrops each time the snake eats food
    for (let i = 0; i < score; i++) {
        addRaindrop();
    }
    // Modify the score increase logic to trigger fireworks at a score of 5
if (score === 5) {
    triggerFireworks();
}
    } else {
        snake.pop();
    }
    // New head position
    let newHead = { x: snakeX, y: snakeY };

    // Collision detection
    if (snakeX < 0 || snakeX >= canvas.width || snakeY < 0 || snakeY >= canvas.height || collision(newHead, snake)) {
        gameOver();
        return;
    }

    snake.unshift(newHead);
    // Display score
    ctx.fillStyle = "white";
    ctx.font = "45px Arial";
    ctx.fillText(score, 2 * box, 1.6 * box);
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

// Leaderboard and score submission
function submitPlayerScore() {
    const playerName = document.getElementById('playerName').value.trim();
    if (!playerName) {
        alert("Please enter your name.");
        return;
    }
    const data = { name: playerName, score: score };
    fetch('https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec', {
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
    fetch('https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec')
    .then(response => response.json())
    .then(data => {
        const leaderboardList = document.getElementById('leaderboardList');
        leaderboardList.innerHTML = ''; // Clear the leaderboard
        data.forEach((entry, index) => {
            if (index < 5) { // Display top 5 scores
                const listItem = document.createElement('li');
                listItem.textContent = `${entry[0]}: ${entry[1]}`;
                leaderboardList.appendChild(listItem);
            }
        });
    })
    .catch(error => console.error('Error fetching leaderboard:', error));
}

// Audio setup
let eatSound = new Audio('audio/eat_sound.wav');
let gameOverSound = new Audio('audio/game_over_sound.wav');
let bgMusic = new Audio('audio/bgmusic.mp3');
bgMusic.loop = true;

// Handling user input for the name entry
document.getElementById('playerName').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        submitPlayerScore();
    }
});

// Initialize leaderboard on page load
document.addEventListener('DOMContentLoaded', getLeaderboard);


