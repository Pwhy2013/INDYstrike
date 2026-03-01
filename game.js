// --- Indie Character Roster ---
const indieCharacters = [
    { name: 'Hollow Knight', color: '#ffffff', picked: false },
    { name: 'Shovel Knight', color: '#0000ff', picked: false },
    { name: 'Cuphead', color: '#ff0000', picked: false },
    { name: 'Celeste', color: '#ff99ff', picked: false },
    { name: 'Dead Cells', color: '#00ff00', picked: false }
];
const characterDamages = {
    'Hollow Knight': 30,
    'Shovel Knight': 30,
    'Cuphead': 7,
    'Celeste': 15,
    'Dead Cells': 7
};

// --- Selection System ---
let selectionDiv = document.getElementById('character-buttons');
let selectionTitle = document.getElementById('selection-title');
let currentPlayer = 1;
let players = [];

function renderCharacterButtons() {
    selectionDiv.innerHTML = '';
    indieCharacters.forEach((char, index) => {
        const btn = document.createElement('button');
        btn.innerText = char.name;
        btn.style.backgroundColor = char.picked ? 'gray' : char.color;
        btn.disabled = char.picked;
        btn.style.padding = '10px 20px';
        btn.onclick = () => pickCharacter(index);
        selectionDiv.appendChild(btn);
    });
}

function pickCharacter(index) {
    indieCharacters[index].picked = true;

    const keySet = currentPlayer === 1 ?
        { left: 'ArrowLeft', right: 'ArrowRight', jump: 'ArrowUp', attack: 'ShiftRight' } :
        { left: 'KeyA', right: 'KeyD', jump: 'KeyW', attack: 'Space' };

    spawnPlayer(index, currentPlayer === 1 ? 100 : 600, keySet);

    if (currentPlayer === 1) {
        currentPlayer = 2;
        selectionTitle.innerText = 'Player 2: Choose Your Indie Hero';
    } else {
        document.getElementById('character-selection').style.display = 'none';
        alert('All players ready! Fight!');
    }
    renderCharacterButtons();
}

renderCharacterButtons();

// --- Arena & Player Movement ---
const floorHeight = 50;
const gravity = 0.8;
const jumpStrength = 15;
const moveSpeed = 5;

function spawnPlayer(characterIndex, startX, keySet) {
    const char = indieCharacters[characterIndex];
    const playerDiv = document.createElement('div');
    playerDiv.classList.add('player');
    playerDiv.style.backgroundColor = char.color;
    playerDiv.style.left = startX + 'px';
    playerDiv.style.bottom = floorHeight + 'px';
    document.getElementById('game').appendChild(playerDiv);

    const playerObj = {
        name: char.name,
        div: playerDiv,
        x: startX,
        y: floorHeight,
        xVelocity: 0,
        yVelocity: 0,
        onGround: true,
        keys: keySet,
        facing: 'right',
        attack: null,
        health: 0,
        knockbackX: 0,
        knockbackY: 0,
        damage: characterDamages[char.name],
        canAttack: true,
        attackCooldown: 500
    };

    // Optional: custom cooldowns per character
    switch (char.name) {
        case 'Hollow Knight': playerObj.attackCooldown = 400; break;
        case 'Shovel Knight': playerObj.attackCooldown = 500; break;
        case 'Cuphead': playerObj.attackCooldown = 300; break;
        case 'Celeste': playerObj.attackCooldown = 350; break;
        case 'Dead Cells': playerObj.attackCooldown = 450; break;
    }

    // --- Assign unique attacks ---
    switch (char.name) {
        case 'Hollow Knight':
            playerObj.attack = function(p) { createHitbox(p, 60, 50, 200, 50, 0, 0); }
            break;
        case 'Shovel Knight':
            playerObj.attack = function(p) { createHitbox(p, 50, 60, 200, 50, 0, 0); }
            break;
        case 'Cuphead':
            playerObj.attack = function(p) { spawnProjectile(p, 20, 20, 5); }
            break;
        case 'Celeste':
            playerObj.attack = function(p) { p.x += (p.facing === 'right' ? 50 : -50); createHitbox(p, 40, 50, 200, 50, 0, 0); }
            break;
        case 'Dead Cells':
            playerObj.attack = function(p) { spawnProjectile(p, 15, 15, 7, 50, 25); }
            break;
    }

    players.push(playerObj);
}

// --- Melee Hitbox Function (direction aware)
function createHitbox(player, width, height, duration, offsetX = 0, offsetY = 0, speedX = 0) {
    let direction = player.facing === 'right' ? 1 : -1;
    offsetX *= direction;
    speedX *= direction;

    const hitbox = document.createElement('div');
    hitbox.style.position = 'absolute';
    hitbox.style.width = width + 'px';
    hitbox.style.height = height + 'px';
    hitbox.style.backgroundColor = 'yellow';
    hitbox.style.opacity = '0.7';
    hitbox.style.left = (player.x + offsetX) + 'px';
    hitbox.style.bottom = (player.y + offsetY) + 'px';
    document.getElementById('game').appendChild(hitbox);

    const interval = setInterval(() => {
        if (speedX !== 0) hitbox.style.left = (parseFloat(hitbox.style.left) + speedX) + 'px';
        checkHit(hitbox, player);
    }, 16);

    setTimeout(() => { clearInterval(interval); hitbox.remove(); }, duration);
}

// --- Projectile Function for Cuphead & Dead Cells
function spawnProjectile(player, width, height, speedX, offsetX = 50, offsetY = 20) {
    const direction = player.facing === 'right' ? 1 : -1;
    const proj = document.createElement('div');
    proj.style.position = 'absolute';
    proj.style.width = width + 'px';
    proj.style.height = height + 'px';
    proj.style.backgroundColor = 'orange';
    proj.style.left = (player.x + offsetX * direction) + 'px';
    proj.style.bottom = (player.y + offsetY) + 'px';
    document.getElementById('game').appendChild(proj);

    const interval = setInterval(() => {
        proj.style.left = (parseFloat(proj.style.left) + speedX * direction) + 'px';
        checkHit(proj, player);
        if (parseFloat(proj.style.left) < 0 || parseFloat(proj.style.left) > 800) {
            clearInterval(interval);
            proj.remove();
        }
    }, 16);

    // Store interval on element for removal after hit
    proj._interval = interval;
}

// --- Collision detection & knockback scaling
function checkHit(hitbox, attacker) {
    const hitX = parseFloat(hitbox.style.left);
    const hitY = parseFloat(hitbox.style.bottom);
    const hitWidth = parseFloat(hitbox.style.width);
    const hitHeight = parseFloat(hitbox.style.height);

    players.forEach(player => {
        if (player === attacker) return;

        const playerX = player.x;
        const playerY = player.y;
        const playerWidth = parseFloat(player.div.style.width) || 50;
        const playerHeight = parseFloat(player.div.style.height) || 50;

        if (
            hitX + hitWidth > playerX &&
            hitX < playerX + playerWidth &&
            hitY + hitHeight > playerY &&
            hitY < playerY + playerHeight
        ) {
            const direction = attacker.facing === 'right' ? 1 : -1;
            const knockbackPower = 2 + player.health * 0.1;
            player.knockbackX += knockbackPower * direction;
            player.knockbackY += knockbackPower;
            player.health += player.damage;

            // Remove hitbox/projectile after hit
            if (hitbox.parentElement) hitbox.remove();
            if (hitbox._interval) clearInterval(hitbox._interval);
        }
    });
}

// --- Key Handling ---
const keys = {};
document.addEventListener('keydown', e => {
    keys[e.code] = true;
    players.forEach(player => {
        if (e.code === player.keys.attack && player.canAttack) {
            player.attack(player);
            player.canAttack = false;
            setTimeout(() => { player.canAttack = true; }, player.attackCooldown);
        }
    });
});
document.addEventListener('keyup', e => keys[e.code] = false);

// --- Game Loop ---
function gameLoop() {
    players.forEach(player => {
        // Horizontal movement
        player.xVelocity = 0;
        if (keys[player.keys.left]) { player.xVelocity = -moveSpeed; player.facing = 'left'; }
        if (keys[player.keys.right]) { player.xVelocity = moveSpeed; player.facing = 'right'; }
        player.x += player.xVelocity;

        // Jump
        if (keys[player.keys.jump] && player.onGround) { player.yVelocity = jumpStrength; player.onGround = false; }

        // Gravity
        player.yVelocity -= gravity;
        player.y += player.yVelocity;

        // Apply knockback
        player.x += player.knockbackX;
        player.y += player.knockbackY;
        player.knockbackX *= 0.9;
        player.knockbackY *= 0.9;

        // Floor collision
        if (player.y < floorHeight) { player.y = floorHeight; player.yVelocity = 0; player.onGround = true; }

        // Update DOM
        player.div.style.left = player.x + 'px';
        player.div.style.bottom = player.y + 'px';
    });

    requestAnimationFrame(gameLoop);
}

gameLoop();
