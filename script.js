const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const box = 20; // Size of each box in the grid
let snake = []; // Snake array
let score = 0;
let d = 'RIGHT'; // Initial direction of the snake
let food = {};
let raindrops = [];
let fireworks = [];
let game;

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById("startButton").addEventListener("click", startGame);
});

document.getElementById('retryButton').addEventListener('click', function() {
    this.style.display = 'none'; // Hide the retry button
    startGame(); // Restart the game
});

document.addEventListener("keydown", direction);

// Audio files
let eatSound = new Audio('audio/eat_sound.wav');
let gameOverSound = new Audio('audio/game_over_sound.wav');
let bgMusic = new Audio('audio/bgmusic.mp3');
bgMusic.loop = true;

// Touch controls setup
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
    handleTouchMove(touchEndX, touchEndY);
}, false);

function handleTouchMove(touchEndX, touchEndY) {
    let dx = touchEndX - touchStartX;
    let dy = touchEndY - touchStartY;

    if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0 && d !== 'LEFT') d = 'RIGHT';
        else if (dx < 0 && d !== 'RIGHT') d = 'LEFT';
    } else {
        if (dy > 0 && d !== 'UP') d = 'DOWN';
        else if (dy < 0 && d !== 'DOWN') d = 'UP';
    }
}

function startGame() {
    snake = [{ x: 9 * box, y: 10 * box }];
    score = 0;
    d = 'RIGHT';
    food = generateFood();
    raindrops = [];
    fireworks = [];
    clearInterval(game);
    game = setInterval(draw, 100);
    bgMusic.play();
}

function direction(event) {
    let key = event.keyCode;
    if (key === 37 && d !== "RIGHT") {
        d = "LEFT";
        event.preventDefault(); // Prevent the default action (scroll) for this event
    } else if (key === 38 && d !== "DOWN") {
        d = "UP";
        event.preventDefault();
    } else if (key === 39 && d !== "LEFT") {
        d = "RIGHT";
        event.preventDefault();
    } else if (key === 40 && d !== "UP") {
        d = "DOWN";
        event.preventDefault();
    }
}

function generateFood() {
    return {
        x: Math.floor(Math.random() * 17 + 1) * box,
        y: Math.floor(Math.random() * 15 + 3) * box
    };
}



function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw rain
    updateAndDrawRain();

    // Draw snake
    snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? "green" : "blue";
        ctx.fillRect(segment.x, segment.y, box, box);
    });

    // Draw food
    ctx.fillStyle = "red";
    ctx.fillRect(food.x, food.y, box, box);

    // Move snake
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
        food = generateFood(); // Generate new food position
        addRaindrop(); // Add a new raindrop
    } else {
        snake.pop(); // Remove the last segment of the snake
    }

    // Check game over conditions
    if (snakeX < 0 || snakeX >= canvas.width || snakeY < 0 || snakeY >= canvas.height || collision({ x: snakeX, y: snakeY }, snake)) {
        gameOver();
        return;
    }

    // Add new head
    let newHead = { x: snakeX, y: snakeY };
    snake.unshift(newHead);

    // Display score
    displayScore();

    // Trigger fireworks at score 5
    if (score === 5) {
        triggerFireworks();
    }
}

function updateAndDrawRain() {
    raindrops.forEach((drop, index) => {
        drop.y += drop.speed;
        ctx.fillStyle = 'rgba(0, 0, 255, 0.5)';
        ctx.beginPath();
        ctx.arc(drop.x, drop.y, 50, 0, Math.PI * 2);
        ctx.fill();

        if (drop.y > canvas.height) {
            raindrops.splice(index, 1);
        }
    });
}

function addRaindrop() {
    raindrops.push({ x: Math.random() * canvas.width, y: 0, speed: Math.random() * 2 + 1 });
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
    document.getElementById('gameOverModal').style.display = "block";
}

// Close modal when the user clicks on <span> (x)
document.querySelector('.close').addEventListener('click', function() {
    document.getElementById('gameOverModal').style.display = "none";
});

function submitName() {
    const playerName = document.getElementById('playerNameInput').value.trim();
    if (playerName) {
        submitScore(playerName, score); // Use your existing function to submit the score
        document.getElementById('gameOverModal').style.display = "none";
    } else {
        alert("Please enter your name.");
    }
     document.getElementById('retryButton').style.display = 'block'; // Show retry button
}


function displayScore() {
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, box, 1.6 * box);
}
function triggerFireworks() {
    // Assuming each firework is a set of particles
    for (let i = 0; i < 10; i++) {
        fireworks.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * (20 - 5) + 5,
            alpha: 1, // Start fully visible
            color: `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`
        });
    }
}

function drawFireworks() {
    fireworks.forEach((firework, index) => {
        ctx.fillStyle = `rgba(${firework.color},${firework.alpha})`;
        ctx.beginPath();
        ctx.arc(firework.x, firework.y, firework.radius, 0, Math.PI * 2);
        ctx.fill();
        firework.alpha -= 0.01; // Fade out
        if (firework.alpha <= 0) {
            fireworks.splice(index, 1); // Remove faded firework
        }
    });
}

// Submitting score to the leaderboard
// Corrected submitScore function
function submitScore(playerName, score) {
    // No need to get playerName from the DOM, it's passed as an argument
    if (playerName) {
        fetch('https://script.google.com/macros/s/AKfycbxlZ26ix5F6RtjRrzS96iwyIbWA1GZ12TVUauQvXEWFgIeATgyjVPoY9di7c4Z4WnRyhw/exec', {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: playerName, score: score })
        })
        .then(() => {
            alert('Score submitted!');
            // Optionally clear the input field if it exists elsewhere for re-use
            // document.getElementById('playerName').value = '';
            fetchLeaderboard(); // Refresh the leaderboard after submitting
        })
        .catch(error => console.error('Error:', error));
    } else {
        alert("Please enter your name.");
    }
}



function fetchLeaderboard() {
    fetch('https://script.google.com/macros/s/AKfycbxlZ26ix5F6RtjRrzS96iwyIbWA1GZ12TVUauQvXEWFgIeATgyjVPoY9di7c4Z4WnRyhw/exec')
    .then(response => response.json())
    .then(data => {
        const sortedData = data.sort((a, b) => b.score - a.score).slice(0, 5); // Sort by score descending, then take top 5
        const leaderboardList = document.getElementById('leaderboardList');
        leaderboardList.innerHTML = ''; // Clear current list
        sortedData.forEach(entry => {
            const li = document.createElement('li');
            li.textContent = `${entry.name}: ${entry.score}`;
            leaderboardList.appendChild(li);
        });
    })
    .catch(error => console.error('Error fetching leaderboard:', error));
}


// Initial fetch for leaderboard
document.addEventListener('DOMContentLoaded', fetchLeaderboard);
