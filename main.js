const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game settings
const birdWidth = 34; // Adjust this to match the exact width of the bird image
const birdHeight = 24; // Adjust this to match the exact height of the bird image
const gravity = 0.05; // Slower gravity (further reduced)
const jump = -3; // Less jump force
const pipeWidth = 50;
const pipeGap = 150;
let birdY = canvas.height / 2;
let birdVelocity = 0;
let birdFlap = false;
let score = 0;
let doubleJumpAllowed = true; // Allow double jump
let pipeHitsInARow = 0; // Count consecutive hits
const pipeCollisionBuffer = 5; // Collision allowance buffer for pipes
const birdCollisionBuffer = 2; // Smaller collision allowance buffer for bird (less lenient than before)

let birdChoice = 'bird1'; // Default bird is bird1

// Load assets
const background = new Image();
background.src = 'assets/background.png';
const ground = new Image();
ground.src = 'assets/ground.png';
const bird1 = new Image();
bird1.src = 'assets/bird1.png'; // Ensure this image has no white background (transparent background)
const bird2 = new Image();
bird2.src = 'assets/bird2.png'; // Ensure this image has no white background (transparent background)
const pipes = new Image();
pipes.src = 'assets/pipes.png';

// Pipe array and movement
let pipesArray = [];
let pipeX = canvas.width;
let pipeSpeed = 0.5; // Slow down the speed
let pipeGapHeight = pipeGap; 

// Timing for bird choice (3.5 seconds)
let birdChoiceTimer = 3500; // 3.5 seconds to choose bird
let gameStarted = false; // Track if game has started

// Event listeners for bird flap
document.addEventListener('keydown', () => {
  if (birdY > 0 && gameStarted) { // Make sure player has selected bird and game started
    birdVelocity = jump;
    if (doubleJumpAllowed) {
      doubleJumpAllowed = false;
    }
  }
});

// Event listeners for bird selection
document.addEventListener('keydown', (event) => {
  if (!gameStarted) {
    if (event.key === '1') {
      birdChoice = 'bird1';
      gameStarted = true; // Start the game immediately after bird choice
    } else if (event.key === '2') {
      birdChoice = 'bird2';
      gameStarted = true; // Start the game immediately after bird choice
    }
  }
});

// Game loop
function gameLoop() {
  // Show background and birds during the first 3.5 seconds for selection
  if (!gameStarted) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    // Display the bird options
    ctx.fillStyle = 'white';
    ctx.font = '30px Arial';
    ctx.fillText('Choose your bird!', canvas.width / 2 - 120, canvas.height / 2 - 50);

    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText('Press 1 for Bird 1 or 2 for Bird 2', canvas.width / 2 - 140, canvas.height / 2);

    ctx.drawImage(bird1, canvas.width / 2 - 90, canvas.height / 2 + 20, birdWidth, birdHeight);
    ctx.drawImage(bird2, canvas.width / 2 + 40, canvas.height / 2 + 20, birdWidth, birdHeight);

    // Wait for 3.5 seconds or bird selection
    setTimeout(() => {
      if (!gameStarted) {
        // Default to bird1 if no bird is chosen within 3.5 seconds
        birdChoice = 'bird1';
        gameStarted = true; // Game starts automatically after 3.5 seconds
      }
    }, birdChoiceTimer);

  } else {
    // Game has started, run the game loop

    // Update bird position
    birdVelocity += gravity;
    birdY += birdVelocity;

    // Check for bird hitting the ground or going off-screen
    if (birdY + birdHeight > canvas.height - ground.height / 2) {
      birdY = canvas.height - ground.height / 2 - birdHeight;
      birdVelocity = 0;
    }

    // Add pipes after bird selection
    if (pipeX < canvas.width / 2) {
      let pipeHeight = Math.floor(Math.random() * (canvas.height - pipeGapHeight));
      pipesArray.push({ x: pipeX, y: pipeHeight });
      pipeX = canvas.width;
    } else {
      pipeX -= pipeSpeed;
    }

    // Move pipes
    pipesArray.forEach(pipe => {
      pipe.x -= pipeSpeed;

      // Adjusted pipe collision check (allowance buffer)
      if (
        birdY < pipe.y - pipeGapHeight + pipeCollisionBuffer || // Top pipe with buffer
        birdY + birdHeight > pipe.y + pipeGapHeight + pipeCollisionBuffer // Bottom pipe with buffer
      ) {
        if (pipe.x < birdWidth + birdCollisionBuffer) { // Left side collision with bird buffer
          // Increment consecutive pipe hit counter
          pipeHitsInARow++;

          // Check if bird hits two pipes in a row
          if (pipeHitsInARow >= 2) {
            endGame();
          }
        }
      }

      // Remove pipes off-screen
      if (pipe.x + pipeWidth < 0) {
        pipesArray.shift();
        score++;
        pipeHitsInARow = 0; // Reset consecutive hit counter
      }
    });

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the background and ground
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    // Adjust ground to appear half lower
    ctx.drawImage(ground, 0, canvas.height - ground.height / 2, canvas.width, ground.height / 2);

    // Draw pipes only if the game has started
    if (gameStarted) {
      pipesArray.forEach(pipe => {
        ctx.drawImage(pipes, pipe.x, 0, pipeWidth, pipe.y);
        ctx.drawImage(pipes, pipe.x, pipe.y + pipeGapHeight, pipeWidth, canvas.height);
      });
    }

    // Draw the selected bird (bird1 by default)
    if (birdChoice === 'bird1') {
      ctx.drawImage(bird1, 20, birdY, birdWidth, birdHeight);
    } else if (birdChoice === 'bird2') {
      ctx.drawImage(bird2, 20, birdY, birdWidth, birdHeight);
    }

    // Display score
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText('Score: ' + score, 10, 30);
  }

  requestAnimationFrame(gameLoop);
}

// End the game when bird hits two pipes in a row
function endGame() {
  alert('Game Over! Your score: ' + score);
  resetGame();
}

// Reset the game
function resetGame() {
  birdY = canvas.height / 2;
  birdVelocity = 0;
  pipesArray = [];
  pipeX = canvas.width;
  score = 0;
  pipeHitsInARow = 0;
  doubleJumpAllowed = true;
  gameStarted = false;
}
// Move pipes
pipesArray.forEach(pipe => {
  pipe.x -= pipeSpeed;

  // Adjusted pipe collision check (no buffer)
  if (
    birdY < pipe.y - pipeGapHeight || // Top pipe
    birdY + birdHeight > pipe.y + pipeGapHeight // Bottom pipe
  ) {
    if (pipe.x < birdWidth && pipe.x + pipeWidth > 0) { // Left and right side collision with bird (without buffer)
      // Increment consecutive pipe hit counter
      pipeHitsInARow++;

      // Check if bird hits two pipes in a row
      if (pipeHitsInARow >= 2) {
        endGame();
      }
    }
  }

  // Remove pipes off-screen
  if (pipe.x + pipeWidth < 0) {
    pipesArray.shift();
    score++;
    pipeHitsInARow = 0; // Reset consecutive hit counter
  }
});

// Start the game loop
gameLoop();
