const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const box = 20;
let snake = [];
let score = 0;
let d;
let game;
let raindrops = [];
let food = {
    x: Math.floor(Math.random() * (canvas.width / box)) * box,
    y: Math.floor(Math.random() * (canvas.height / box)) * box
};

document.addEventListener("keydown", direction);
document.getElementById("startButton").addEventListener("click", startGame);

function startGame() {
    snake = [{ x: 9 * box, y: 10 * box }];
    score = 0;
    d = 'RIGHT';
    food = {
        x: Math.floor(Math.random() * (canvas.width / box)) * box,
        y: Math.floor(Math.random() * (canvas.height / box)) * box
    };
    raindrops = [];
    clearInterval(game);
    game = setInterval(draw, 100);
    document.getElementById('nameEntry').style.display = 'none';
}

function direction(event) {
    let key = event.keyCode;
    if (key === 37 && d !== "RIGHT") d = "LEFT";
    else if (key === 38 && d !== "DOWN") d = "UP";
    else if (key === 39 && d !== "LEFT") d = "RIGHT";
    else if (key === 40 && d !== "UP") d = "DOWN";
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < snake.length; i++) {
        ctx.fillStyle = (i === 0) ? "green" : "blue";
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
            x: Math.floor(Math.random() * (canvas.width / box)) * box,
            y: Math.floor(Math.random() * (canvas.height / box)) * box
        };
        for (let i = 0; i < 3; i++) addRaindrop(); // Increase raindrop quantity with each food eaten
    } else {
        snake.pop();
    }

    let newHead = { x: snakeX, y: snakeY };

    if (collision(newHead, snake)) {
        clearInterval(game);
        alert("Game Over");
        return;
    }

    snake.unshift(newHead);

    updateAndDrawRain();
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

function addRaindrop() {
    raindrops.push({ x: Math.random() * canvas.width, y: 0 });
}

function updateAndDrawRain() {
    raindrops.forEach((drop, index) => {
        drop.y += 4;
        ctx.beginPath();
        ctx.arc(drop.x, drop.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = 'blue';
        ctx.fill();

        if (drop.y > canvas.height) {
            raindrops.splice(index, 1);
        }
    });
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


