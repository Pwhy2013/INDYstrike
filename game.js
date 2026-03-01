const player = document.getElementById('player');

let playerPos = {
    x: 100,
    y: 50,
    yVelocity: 0,
    onGround: true
};

const gravity = 0.8;
const jumpStrength = 15;
const moveSpeed = 5;

const keys = {};

document.addEventListener('keydown', (e) => keys[e.code] = true);
document.addEventListener('keyup', (e) => keys[e.code] = false);

function gameLoop() {
    // Horizontal movement
    if (keys['ArrowLeft']) playerPos.x -= moveSpeed;
    if (keys['ArrowRight']) playerPos.x += moveSpeed;

    // Jump
    if (keys['ArrowUp'] && playerPos.onGround) {
        playerPos.yVelocity = -jumpStrength;
        playerPos.onGround = false;
    }

    // Gravity
    playerPos.yVelocity += gravity;
    playerPos.y += playerPos.yVelocity;

    // Floor collision
    if (playerPos.y > 50) { // 50 = floor height
        playerPos.y = 50;
        playerPos.yVelocity = 0;
        playerPos.onGround = true;
    }

    // Update player position
    player.style.left = playerPos.x + 'px';
    player.style.bottom = playerPos.y + 'px';

    requestAnimationFrame(gameLoop);
}

gameLoop();
