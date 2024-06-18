const canvas = document.querySelector('canvas');
const con = canvas.getContext('2d');

canvas.width = 1024 
canvas.height = 576 // 16 : 9 ratio - width of 1024 fits most screen sizes

con.fillRect(0, 0, canvas.width, canvas.height) //canvas API method 
												//filling rectangle in-use

//creating characters in forms of rectangles using OOP
const gravity = 0.7 //used for pulling characters down

const background = new Sprite({
	position: {
		x: 0, 
		y: 0
	},
	imageSrc: './img/background.png'
}) //getting the actual image and setting it in bg variable

const shop = new Sprite({
	position: {
		x: 630, 
		y: 128
	},
	imageSrc: './img/shop.png',
	scale: 2.75,
	framesMax: 6
})

const player = new Fighter({
	position:{ 
	x: 0, 
	y: 0 	 },
	velocity:{
	x:0,
	y:0 // player won't be moving by default
	},
	offset: {
		x: 0,
		y: 0
	},
	imageSrc: './img/samuraiMack/Idle.png',
	framesMax: 8,
	scale: 2.5,
	offset: {
		x: 215,
		y: 157
	},
	sprites: {
		idle: {
			imageSrc: './img/samuraiMack/Idle.png',
			framesMax: 8
		},
		run: {
			imageSrc: './img/samuraiMack/Run.png',
			framesMax: 8
		},
		jump: {
			imageSrc: './img/samuraiMack/Jump.png',
			framesMax: 2
		},
		fall: {
			imageSrc: './img/samuraiMack/Fall.png',
			framesMax: 2
		},
		attack1: {
			imageSrc: './img/samuraiMack/Attack1.png',
			framesMax: 6
		},
		takeHit: {
			imageSrc: './img/samuraiMack/Take Hit - white silhouette.png',
			framesMax: 4
		},
		death: {
			imageSrc: './img/samuraiMack/Death.png',
			framesMax: 6
		}
	},
	attackBox: {
			offset: {
				x: 100,
				y: 50
			},
			width: 160,
			height: 50
		}
}) //object for Sprite position and velocity

const enemy = new Fighter({
	position:{ 
	x: 400, 
	y: 100 	 },
	velocity:{
	x:0,
	y:0 // player won't be moving by default
	},
	color: 'blue',
	offset: {
		x: -50,
		y: 0
	}, 
	imageSrc: './img/kenji/Idle.png',
	framesMax: 4,
	scale: 2.5,
	offset: {
		x: 215,
		y: 167
	},
	sprites: {
		idle: {
			imageSrc: './img/kenji/Idle.png',
			framesMax: 4
		},
		run: {
			imageSrc: './img/kenji/Run.png',
			framesMax: 8
		},
		jump: {
			imageSrc: './img/kenji/Jump.png',
			framesMax: 2
		},
		fall: {
			imageSrc: './img/kenji/Fall.png',
			framesMax: 2
		},
		attack1: {
			imageSrc: './img/kenji/Attack1.png',
			framesMax: 4
		},
		takeHit: {
			imageSrc: './img/kenji/Take hit.png',
			framesMax: 3
		},
		death: {
			imageSrc: './img/kenji/Death.png',
			framesMax: 7
		}
	},
	attackBox: {
			offset: {
				x: -170,
				y: 50
			},
			width: 170,
			height: 50
		}
}) //object for Sprite position and velocity

enemy.draw() //puts enemy on screen

//adding velocity and gravity

console.log(player)

//object for player movement
const keys = {
	a: {
		pressed: false
	},
	d: {
		pressed: false
	},
	ArrowRight: {
		pressed: false
	},
	ArrowLeft: {
		pressed: false
	}
}
//variable to determine the last key pressed for more efficient movement
//using the variable overwrites movement when 2 keys are perssed simultaneously

timerDec()

function animation() {
	window.requestAnimationFrame(animation) //loops over throughout itself
											//moves objects/players the whole time
	
	background.update()
	shop.update()

	con.fillStyle = 'rgba(255, 255, 255, 0.2)'
	con.fillRect(0, 0, canvas.width, canvas.height)

	player.update() //moves player downwards - gravity
	enemy.update() //moves enemy downwards - gravity

	//stops movement for every frame when key is not pressed
	player.velocity.x = 0
	enemy.velocity.x = 0

	//determining velocity for movement when keys are pressed - player
	
	if (keys.a.pressed && player.lastKey == 'a') {
		player.velocity.x = -5
		player.switchSprite('run')
	} else if (keys.d.pressed && player.lastKey == 'd') {
		player.velocity.x = 5
		player.switchSprite('run')
	} else {
		player.switchSprite('idle')
	}
	//jumping
	if (player.velocity.y < 0) { //when the player is in the air
		player.switchSprite('jump')
	}  else if (player.velocity.y > 0) {
		player.switchSprite('fall')
	}


	//determining velocity for movement when keys are pressed - enemy
	if (keys.ArrowLeft.pressed && enemy.lastKey == 'ArrowLeft') {
		enemy.velocity.x = -5
		enemy.switchSprite('run') 
	} else if (keys.ArrowRight.pressed && enemy.lastKey == 'ArrowRight') {
		enemy.velocity.x = 5
		enemy.switchSprite('run') 
	} else {
		enemy.switchSprite('idle')
	}
	//jumping
	if (enemy.velocity.y < 0) { //when the enemy is in the air
		enemy.switchSprite('jump')
	}  else if (enemy.velocity.y > 0) {
		enemy.switchSprite('fall')
	}

	//detecting collision / attacking - for player && enemy gets hit
	if (
		rectCol({ 
		rectangle1: player, 
		rectangle2: enemy}) &&
		player.isAttacking && 
		player.framesCurrent === 4 //hp goes down when the player is hit in the animation sprite
		) {
		enemy.takeHit() 
		player.isAttacking = false //this is here in order to only attack once, not multiple times

		gsap.to('#enemyHealth', {
			width: enemy.health + '%' //instead of document.querySelector - with addition of animation
		})
	} //if the right end of the player attack box touches left end of enemy (or essentially the enemy)

	if (player.isAttacking && player.framesCurrent === 4) {
		player.isAttacking = false //it's here in order not to subtract health when attack box collides with enemy after missing
	}

	//detecting collision / attacking - for enemy && player gets hit
	if (
		rectCol({ rectangle1: enemy, rectangle2: player}) &&
		enemy.isAttacking && enemy.framesCurrent === 2
		) {
		enemy.isAttacking = false //this is here in order to only attack once, not multiple times
		player.takeHit()
		
		gsap.to('#playerHealth', {
			width: player.health + '%' //instead of document.querySelector - with addition of animation
		})
	} //if the left end of the enemy attack box touches right end of player (or essentially the player)

	// if enemy misses
	if (enemy.isAttacking && enemy.framesCurrent === 2) {
		enemy.isAttacking = false //it's here in order not to subtract health when attack box collides with enemy after missing
	}

	//ending the game based on HP
	if (enemy.health <= 0 || player.health <= 0) {

		whoWon({player, enemy, timerId})

	}

}

animation()

window.addEventListener('keydown', (event) => { //reacts when a specific key is pressed
	
	if (!player.dead) {
		switch (event.key) {
			case 'd':
				keys.d.pressed = true  //movement for player towards the right when key is pressed
				player.lastKey = 'd'
			break
			case 'a':
				keys.a.pressed = true //movement for player towards the left when key is pressed
				player.lastKey = 'a'
			break
			case 'w':
				player.velocity.y = -20 //gives the ability to jump
			break
			case ' ':
				player.attack()
			break
		}
	}
	
	if (!enemy.dead) {
		switch (event.key) {
			case 'ArrowRight':
				keys.ArrowRight.pressed = true  //movement for player towards the right when key is pressed
				enemy.lastKey = 'ArrowRight'
			break
			case 'ArrowLeft':
				keys.ArrowLeft.pressed = true  //movement for player towards the right when key is pressed
				enemy.lastKey = 'ArrowLeft'
			break
			case 'ArrowUp':
				enemy.velocity.y = -20  //movement for player towards the right when key is pressed
			break
			case 'ArrowDown':
				enemy.attack()
			break
		}
	}
})

window.addEventListener('keyup', (event) => { //reacts when a specific key is pressed
	//player keys
	switch (event.key) {
		case 'd':
			keys.d.pressed = false //stop movement when key is no longer pressed
		break
		case 'a':
			keys.a.pressed = false //stop movement when key is no longer pressed
		break
	}

	//enemy keys
	switch (event.key) {
		case 'ArrowRight':
			keys.ArrowRight.pressed = false //stop movement when key is no longer pressed
		break
		case 'ArrowLeft':
			keys.ArrowLeft.pressed = false //stop movement when key is no longer pressed
		break
	}
})