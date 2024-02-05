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
let touchStartX = 0;
let touchStartY = 0;
let threshold = 60; // Pixels. Adjust based on testing for best feel.


document.getElementById("startButton").addEventListener("click", startGame);
document.addEventListener("keydown", direction);
controlArea.addEventListener('touchmove', handleTouchMove, false);
canvas.addEventListener('touchmove', handleTouchMove, { passive: true });

function createRaindrop() {
    const raindrop = document.createElement('div');
    raindrop.classList.add('raindrop');
    raindrop.style.left = Math.random() * window.innerWidth + 'px';
    raindrop.style.animationDuration = Math.random() * 2 + 1 + 's';
    raindrop.style.opacity = Math.random() + 0.2;

    document.getElementById('rainContainer').appendChild(raindrop);

    raindrop.addEventListener('animationend', function() {
        raindrop.remove();
    });
}

setInterval(createRaindrop, 100);

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

function handleTouchMove(e) {
    e.preventDefault(); // Prevent scrolling when touching the canvas
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const dx = touchEndX - touchStartX;
    const dy = touchEndY - touchStartY;

    if (Math.abs(dx) > Math.abs(dy)) { // Horizontal movement
        if (dx > threshold && d !== "LEFT") d = "RIGHT";
        else if (dx < -threshold && d !== "RIGHT") d = "LEFT";
    } else { // Vertical movement
        if (dy > threshold && d !== "UP") d = "DOWN";
        else if (dy < -threshold && d !== "DOWN") d = "UP";
    }

    // Optionally, update the start position for the next move
    // Only update if a swipe was detected to prevent drift
    if (Math.abs(dx) > threshold || Math.abs(dy) > threshold) {
        touchStartX = touchEndX;
        touchStartY = touchEndY;
    }
}

// ... continuation from the previous code ...

function draw() {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < snake.length; i++) {
        ctx.fillStyle = (i == 0) ? "green" : "blue";
        ctx.fillRect(snake[i].x, snake[i].y, box, box);
    }

    ctx.fillStyle = "red";
    ctx.fillRect(food.x, food.y, box, box);

    // Move the snake head
    let snakeX = snake[0].x;
    let snakeY = snake[0].y;

    if (d === "LEFT") snakeX -= box;
    if (d === "UP") snakeY -= box;
    if (d === "RIGHT") snakeX += box;
    if (d === "DOWN") snakeY += box;

    // Check collision with food
    if (snakeX === food.x && snakeY === food.y) {
        score++;
        eatSound.play();
        food = {
            x: Math.floor(Math.random() * 17 + 1) * box,
            y: Math.floor(Math.random() * 15 + 3) * box
        };
    } else {
        snake.pop();
    }

    // Check for collisions with the wall or the snake itself
    if (snakeX < 0 || snakeY < 0 || snakeX >= canvas.width || snakeY >= canvas.height || collision({ x: snakeX, y: snakeY }, snake)) {
        gameOver();
        return;
    }

    // Add new head position
    let newHead = { x: snakeX, y: snakeY };
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

function gameOver() {
    gameOverSound.play();
    clearInterval(game);
    bgMusic.pause();
    document.getElementById('nameEntry').style.display = 'block'; // Show the name entry form
}

function submitPlayerScore() {
    const playerName = document.getElementById('playerName').value;
    if (playerName) {
        submitScore(playerName, score);
        document.getElementById('nameEntry').style.display = 'none'; // Hide the form after submitting
        getLeaderboard(); // Optional: Refresh the leaderboard
    } else {
        alert("Please enter your name.");
    }
}

// Leaderboard Functions
function submitScore(name, score) {
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
    fetch('https://script.google.com/macros/s/AKfycbxmVTIwsKdgcJXjWoc5JIAJrJK9dqLFhAUCzyz1M7FNa7WejsbAHp8zGJt3zI4Qerja7Q/exec')
        .then(response => response.json())
        .then(data => {
            updateLeaderboard(data);
        })
        .catch(error => console.error('Error:', error));
}

function updateLeaderboard(data) {
    const leaderboardList = document.getElementById('leaderboardList');
    leaderboardList.innerHTML = '';
    data.forEach(entry => {
        const listItem = document.createElement('li');
        listItem.textContent = `${entry[0]}: ${entry[1]}`;
        leaderboardList.appendChild(listItem);
    });
}

