let board;
let context;

// Game dimensions (base values for scaling)
const baseWidth = 360;
const baseHeight = 640;

let boardWidth = baseWidth;
let boardHeight = baseHeight;

let scaleFactor = 1; // To scale elements proportionally

let birdWidth = 60;
let birdHeight = 60;
let birdX = baseWidth / 8;
let birdY = baseHeight / 2;

let birdImg;

let bird = {
    x: birdX,
    y: birdY,
    width: birdWidth,
    height: birdHeight
};

let pipeArray = [];
let pipeWidth = 64;
let pipeHeight = 450;
let pipeX = baseWidth;
let pipeY = 0;

let topPipeImage;
let bottomPipeImage;

let velocityX = -2;
let velocityY = 0;
let gravity = 0.4;
let gameover = false;
let score = 0;

let highScore = localStorage.getItem("highScore") ? parseInt(localStorage.getItem("highScore")) : 0;

let playAgainButton; // Button reference

// Ensure the DOM is loaded before accessing elements
document.addEventListener("DOMContentLoaded", function () {
    board = document.getElementById("board");
    context = board.getContext("2d");

    // Ensure the playAgainButton is available after DOM is loaded
    playAgainButton = document.getElementById("playAgainButton");

    birdImg = new Image();
    birdImg.src = "./img/flappy.png";

    topPipeImage = new Image();
    topPipeImage.src = "./img/pipeup.png";

    bottomPipeImage = new Image();
    bottomPipeImage.src = "./img/pipedown.png";

    resizeGame(); // Set initial size
    window.addEventListener("resize", resizeGame); // Adjust size on window resize

    requestAnimationFrame(update);
    setInterval(placepipes, 1500);

    // Mobile and Desktop key/touch events for bird movement
    document.addEventListener("keydown", moveBird);
    document.addEventListener("touchstart", moveBird); // Added for touch support
    document.addEventListener("click", moveBird); // Added for mouse click support

    // Play Again Button functionality
    playAgainButton.addEventListener("click", function () {
        restartGame();
    });

    // Play Again using Enter key
    document.addEventListener("keydown", function (e) {
        if (gameover && e.code === "Enter") {
            restartGame();
        }
    });
});

function resizeGame() {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // Maintain aspect ratio
    const widthRatio = windowWidth / baseWidth;
    const heightRatio = windowHeight / baseHeight;
    scaleFactor = Math.min(widthRatio, heightRatio);

    boardWidth = baseWidth * scaleFactor;
    boardHeight = baseHeight * scaleFactor;

    board.width = boardWidth;
    board.height = boardHeight;

    context.scale(scaleFactor, scaleFactor);
}

function update() {
    if (gameover) {
        if (score > highScore) {
            highScore = score;
            localStorage.setItem("highScore", highScore);
        }

        context.fillStyle = "red";
        context.font = "50px sans-serif";
        context.fillText("Game Over", baseWidth / 4, baseHeight / 2);

        context.fillStyle = "white";
        context.font = "30px sans-serif";
        context.fillText(`Score: ${score}`, baseWidth / 3, baseHeight / 2 + 50);
        context.fillText(`High Score: ${highScore}`, baseWidth / 5, baseHeight / 2 + 100);

        // Show "Play Again" button
        playAgainButton.style.display = "block";

        return;
    }

    velocityY += gravity;
    bird.y = Math.max(bird.y + velocityY, 0);

    context.clearRect(0, 0, boardWidth, boardHeight);

    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    if (bird.y > baseHeight) {
        gameover = true;
    }

    for (let i = 0; i < pipeArray.length; i++) {
        let pipePair = pipeArray[i];

        pipePair.top.x += velocityX;
        pipePair.bottom.x += velocityX;

        context.drawImage(pipePair.top.img, pipePair.top.x, pipePair.top.y, pipePair.top.width, pipePair.top.height);
        context.drawImage(pipePair.bottom.img, pipePair.bottom.x, pipePair.bottom.y, pipePair.bottom.width, pipePair.bottom.height);

        if (checkCollision(bird, pipePair.top) || checkCollision(bird, pipePair.bottom)) {
            gameover = true;
        }

        if (!pipePair.top.passed && bird.x > pipePair.top.x + pipeWidth) {
            score++;
            pipePair.top.passed = true;
        }
    }

    pipeArray = pipeArray.filter(pipePair => pipePair.top.x + pipeWidth > 0);

    drawScores();

    requestAnimationFrame(update);
}

function placepipes() {
    if (gameover) return;

    let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
    let openingSpace = baseHeight / 4;

    let topPipe = {
        img: topPipeImage,
        x: pipeX,
        y: randomPipeY,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    };

    let bottomPipe = {
        img: bottomPipeImage,
        x: pipeX,
        y: randomPipeY + pipeHeight + openingSpace,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    };

    pipeArray.push({ top: topPipe, bottom: bottomPipe });
}

function moveBird(e) {
    if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyX" || e.type === "touchstart" || e.type === "click") {
        velocityY = -6;
    }
}

function checkCollision(bird, pipe) {
    return bird.x < pipe.x + pipe.width &&
           bird.x + bird.width > pipe.x &&
           bird.y < pipe.y + pipe.height &&
           bird.y + bird.height > pipe.y;
}

function drawScores() {
    context.fillStyle = "white";
    context.font = "30px sans-serif";
    context.fillText(`Score: ${score}`, 10, 40);
    context.fillText(`High Score: ${highScore}`, baseWidth - 180, 40);
}

// Restart the game
function restartGame() {
    // Reset game variables
    gameover = false;
    score = 0;
    velocityY = 0;
    bird.y = baseHeight / 2;
    pipeArray = [];

    // Hide the "Play Again" button
    playAgainButton.style.display = "none";

    // Restart the game loop
    requestAnimationFrame(update);
}
