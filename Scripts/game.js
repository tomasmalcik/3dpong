/* Pong in ThreeJS */

/* Global Variables */
var renderer, scene, camera, timer, audioLoader, listener, countDownTimer

//Countdown
var countdown = 3

//debug - shows controls
var debug = false


//Camera view
var cameraView = 0 //0 - right angle, 1 - top view, 2 - left angle

//Pause match
var pause = false

//Hard mode
var hardmode = false
//Hardmode camera coef
var cameraCoef = -0.05
var cameraZoom = 0

//position coeficient
var coef = 0.36

//Controls
var controls = document.querySelector("#controls")
controls.style.display = (debug) ? "block" : "none"

// field variables
var aspect_ratio;

// paddle variables
var paddle1DirZ = 0, paddle2DirZ = 0, paddleSpeed = 2.5;

// ball variables
var ballDirX, ballDirZ, 
    ballSpeed = 1.3;

// game-related variables
var score1 = 0, score2 = 0, matchLength = 300 //How long will one game last in seconds
// you can change this to any positive whole number
var maxScore = 7;

// set opponent reflexes (0 - easiest, 1 - hardest)
var difficulty = 0.5;

/*
  Set mode: 1 - Player vs Player
            2 - Player vs CPU
            default: 1
*/
var mode = 2

//Get score element
var score = document.querySelector(".score")

//Choose direction - if ball will go towards player1 or 2
function chooseDir() {
    return (Math.random() > 0.5) ? 1 : -1
}

//Generates random direction from <0, PI>
function generateRandomDir() {
    return Math.random() * (1 - 1 + 1) -1
}

//Load function
function setup() {
    //Set options from menu
    setOptions()
    score1 = 0;
    score2 = 0;
    ballDirX = chooseDir()
    ballDirZ = generateRandomDir()
    //Set score
    updateScore()
    //Generate everything
    createScene()
    draw()
    initializeTimer()
    pauseGame() //pause game
    resumeGame() //Run game
    pauseExitCameraListener() //Add listener for pause to window
}

function pauseGame() { //Pause game at any point
    timer.pause()
    pause = true
}

function resumeGame() { //Resume game at any point
    countDown()
    setTimeout(() => {
        timer.resume()
        pause = false
    }, 3000)
}

function countDown() { // 3,2,1 start countdown
    $(".countDown").css("display", "flex")
    countdown = 3
    $(".countDown").text(countdown+"")
    countDownTimer = new Timer(() => {
        countdown--
        $(".countDown").text(countdown+"")

        if(countdown <= 0) {
            countDownTimer.clear()
            $(".countDown").hide()
        }
    },1000)
}

function initializeTimer() { //Timer for matchLength
    displayTime() //Set time at the start of match
    timer = new Timer(() => { //Initialize timer
        matchLength-- //Countdown
        displayTime() //Display Time

        if(matchLength <= 0) {
            timer.clear()
            endGame(true)
        }
    },1000)

}

function displayTime() { //Displays time to html
    var mins = Math.floor(matchLength / 60)
    var secs = matchLength % 60
    secs = (secs < 10 ) ? "0" + secs : secs
    score.children[1].innerHTML = mins + ":" + secs
}

function createScene() {
    //Scene
    scene = new THREE.Scene();

    //Camera
	aspect_ratio = window.innerWidth / window.innerHeight
	camera = new THREE.PerspectiveCamera(50, aspect_ratio, 1, 1000)

	camera.position.x = -8
	camera.position.y = 3
	camera.position.z = 5

	camera.rotation.x = -23 * Math.PI / 180
	camera.rotation.y = -51 * Math.PI / 180
	camera.rotation.z = -18 * Math.PI / 180

    audioLoader = new THREE.AudioLoader();
	listener = new THREE.AudioListener();
	camera.add( listener );

	//Renderer
	renderer = new THREE.WebGLRenderer({ alpha: true });
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.shadowMap.enabled = true
	renderer.shadowMap.type = THREE.PCFSoftShadowMap
	document.body.appendChild( renderer.domElement );

    //Add lights to the scene
    scene.add(new THREE.AmbientLight(0x444444))

    var dirLight = new THREE.DirectionalLight(0xffffff, 1, 100)
	dirLight.position.x = -5;
	dirLight.position.y = 10;
	dirLight.position.z = -7.5

	dirLight.castShadow = true
	dirLight.receiveShadow = true
	dirLight.shadowRadius = 1

    scene.add(dirLight)

    //If easteregg is found
    if(hardmode) {
        setHardmode()
    }    

    arena.buildArena(scene) //Build arena

    //Add audio to paddles and ball
    loadAudio("./sounds/paddleHit2.wav", [arena.paddle1, arena.paddle2], "hit")
    loadAudio("./sounds/wallHit.wav", arena.ball, "hit")
    loadAudio("./sounds/scored.wav", scene, "scored")
    loadAudio("./sounds/loose.wav", scene, "loose")
    loadAudio("./sounds/win.wav", scene, "win")
    loadAudio("./sounds/oops.wav", scene, "oops")

}

function setHardmode() { //Easteregg
    //Change paddle width
    arena.paddleWidth = 0.8
    //Change ball speed
    ballSpeed = 1.8
    //Change coeficient for movement
    coef = 0.42
}

function updateCameraPosition() { //Change camera view
    console.log(cameraView)
    if(cameraView == 0) {
        camera.position.x = -8
        camera.position.y = 3
        camera.position.z = 5
    
        camera.rotation.x = -23 * Math.PI / 180
        camera.rotation.y = -51 * Math.PI / 180
        camera.rotation.z = -18 * Math.PI / 180
    }else if(cameraView == 1) {
        camera.position.x = 0;
        camera.position.y = 9;
        camera.position.z = 0;
        camera.rotation.x = -90 * Math.PI / 180
        camera.rotation.y = 0
        camera.rotation.z = -90 * Math.PI / 180
    }else if(cameraView == 2 && mode == 2) { //Only when against CPU
        camera.position.x = -6.5
        camera.position.y = 1.2
        camera.position.z = 0

        camera.rotation.x = 0
        camera.rotation.y = -90 * Math.PI / 180
        camera.rotation.z = 0
    }else if(cameraView == 2 && mode != 2) {
        cameraView = 0;
        updateCameraPosition()
    }
}

function updateScore() { //Show score in html
    score.children[0].innerHTML = ""+score1
    score.children[2].innerHTML = ""+score2
}

//Movement handler
function paddleMovement(key1, key2, paddle) {
    
    if(Key.isDown(key1)) {
        if(paddle.position.z > -arena.planeHeight * coef) { //If im not touching the corners of table
            paddle.DirZ = -paddleSpeed * 0.05
        }else {  //Ran into corner
            paddle.DirZ = 0
            paddle.scale.y += (4 - paddle.scale.y) * 0.2
            paddle.position.y += ((4 - paddle.scale.y) * 0.1) / 8
        }
    }else if(Key.isDown(key2)) {
        if(paddle.position.z < arena.planeHeight * coef) { //If im not touching the corners of table
            paddle.DirZ = paddleSpeed * 0.05
        }else {  //Ran into corner
            paddle.DirZ = 0
            paddle.scale.y += (10 - paddle.scale.y) * 0.2
            paddle.position.y += ((10 - paddle.scale.y) * 0.1) / 8
        }        
    }else {
        paddle.DirZ = 0
    }

    paddle.scale.z += (1 - paddle.scale.z) * 0.2;	
	paddle.scale.y += (1 - paddle.scale.y) * 0.2;
    paddle.position.y += ((1 - paddle.scale.y) * 0.1) / 8
	paddle.position.z += paddle.DirZ;
}

function oponentMovement() { //"AI"
    paddle2DirZ = (arena.ball.position.z - arena.paddle2.position.z) * (difficulty / 9) //Get trajectory for oponent
    if(Math.abs(paddle2DirZ) <= paddleSpeed) { //Just so he cannot move super fast
        if(arena.paddle2.position.z <= arena.planeHeight * coef &&
           arena.paddle2.position.z >= -arena.planeHeight * coef) { //Not close to any walls
            //Add direction to position
            arena.paddle2.position.z += paddle2DirZ
        }else if(arena.paddle2.position.z >= arena.planeHeight * 0.36 && (paddle2DirZ < 0 && Math.abs(paddle2DirZ) > 0.01) || 
                 arena.paddle2.position.z <= -arena.planeHeight * 0.36 && (paddle2DirZ > 0 && paddle2DirZ > -0.01)) {
            //Stil stuck to right corner, but ball is heading in different direction
            arena.paddle2.position.z += paddle2DirZ
        }
    }
    //Scale paddle back to original size
    arena.paddle2.scale.y += (1 - arena.paddle2.scale.y) * 0.2;	
    arena.paddle2.scale.z += (1 - arena.paddle2.scale.z) * 0.2;
}

//Ball movement and physics handler
function ballPhysics() {

    //Check goals
    if(arena.ball.position.x <= -arena.planeWidth / 2) { //Player2 scored
        console.log(mode)
        score2 ++
        updateScore()
        resetBall(1)
        endGame()
        if(mode == 2)
            scene.effects["oops"].play()
        else if(mode == 1)
            scene.effects["scored"].play()
    }

    if(arena.ball.position.x >= arena.planeWidth / 2) { //Player1 scored
        score1++
        updateScore()
        resetBall(-1)
        endGame()
        scene.effects["scored"].play()
    }

    if(arena.ball.position.z >= arena.planeHeight * 0.49) {  //Left mantinel
        ballDirZ = -ballDirZ
        arena.ball.effects["hit"].play()
    }

    if(arena.ball.position.z <= -arena.planeHeight * 0.45) { //Right mantinel
        ballDirZ = -ballDirZ
        arena.ball.effects["hit"].play()
    }

    arena.ball.position.x += ballDirX * ballSpeed * 0.05 //Update position
    arena.ball.position.z += ballDirZ * ballSpeed * 0.05

    if (ballDirZ > ballSpeed * 2) {  //Keep game playable
		ballDirZ = ballSpeed * 2;
	}
	else if (ballDirZ < -ballSpeed * 2) {
		ballDirZ = -ballSpeed * 2;
	}
}

function resetBall(scored) { //After scoring, reset ball
    arena.ball.position.x = 0
    arena.ball.position.z = 0


    ballDirX = scored //What player it should go towards to
    ballDirZ = generateRandomDir()
}

//Paddle physics
function paddlePhysics() {
    //Handle player1 collisions
    if(arena.ball.position.x <= arena.paddle1.position.x + arena.paddleHeight &&  //Check alignment on x axis (top to bottom)
    arena.ball.position.x >= arena.paddle1.position.x) {

        if(arena.ball.position.z <= arena.paddle1.position.z + arena.paddleWidth * 0.56 && //Check alignment on z axis (left to right)
        arena.ball.position.z >= arena.paddle1.position.z - arena.paddleWidth * 0.56) {

            if(ballDirX < 0) { //Ball traveling towards player1
                arena.paddle1.scale.z = 2 //Scale to indicate hit
                ballDirX = -ballDirX //Reflect x direction, throw ball towards player2/cpu
                //Reflect ball into another direction, slice it
                if(Math.abs(ballDirZ) < 0.2) {
                    ballDirZ -= arena.paddle1.DirZ * 4
                    arena.paddle1.effects["hit"].play()
                }else {
                    ballDirZ -= arena.paddle1.DirZ * 2
                    arena.paddle1.effects["hit"].play()
                }
            }
        }
    }

    //Handle player2 collisions
    if(arena.ball.position.x <= arena.paddle2.position.x + arena.paddleHeight &&  //Check alignment on x axis (top to bottom)
    arena.ball.position.x >= arena.paddle2.position.x - arena.paddleHeight) {

        if(arena.ball.position.z <= arena.paddle2.position.z + arena.paddleWidth / 2 && //Check alignment on z axis (left to right)
        arena.ball.position.z >= arena.paddle2.position.z - arena.paddleWidth / 2) {
            
            if(ballDirX > 0) { //Ball traveling towards player2/cpu
                arena.paddle2.scale.z = 2 //Scale to indicate hit
                ballDirX = -ballDirX //Reflect x direction, throw ball towards player1
                //Reflect ball into another direction, slice it
                ballDirZ -= arena.paddle2.DirZ * 2
                arena.paddle2.effects["hit"].play()
            }
        }
    }
}

//animation loop
function draw() {
    renderer.render(scene, camera)
    requestAnimationFrame(draw)
    
    //Player1
    if(!pause) {
        paddleMovement(Key.A, Key.D, arena.paddle1)
        ballPhysics()
        paddlePhysics()
        checkWin()
    }

    //Check mode
    if (mode == 1 && !pause) {
      paddleMovement(Key.LEFT, Key.RIGHT, arena.paddle2)
    }else if(mode == 2 && !pause) {
        oponentMovement()
    }

    //If debug mode is on
    if(debug)
        debugGame()

    //If hardmode is set
    if(hardmode)
        cameraBreathing()

    //If cameraView is set to 2
    if(cameraView == 2)
        followPlayer1()
    
}

//Camera mode against CPU
function followPlayer1() {
    camera.position.z = arena.paddle1.position.z
}

//EasterEgg movement, each cameraView has its unique movement
function cameraBreathing() {
    if(cameraView == 0 ) {
        if(Math.abs(cameraZoom) < 1) {
            cameraZoom += cameraCoef
            camera.position.x += cameraCoef / 2
            camera.position.y += cameraCoef / 4
        }else {
            cameraZoom = 0
            cameraCoef = -1 * cameraCoef
        }
    }else if(cameraView == 1) {
        if(Math.abs(cameraZoom) < 1) {
            cameraZoom += cameraCoef
            camera.position.y += -1 * cameraCoef / 2
        }else {
            cameraZoom = 0
            cameraCoef = -1 * cameraCoef
        }
    }else if(cameraView == 2) {
        if(Math.abs(cameraZoom) < 1) {
            cameraZoom += cameraCoef
            camera.position.y += -1 * cameraCoef / 4
        }else {
            cameraZoom = 0
            cameraCoef = -1 * cameraCoef
        }       
    }
}

//Show variables for debugging
function debugGame() {
    //Write X of ball
    controls.children[0].innerHTML = "Ball X: " + arena.ball.position.x
    controls.children[1].innerHTML = "Ball Z: " + arena.ball.position.z
    controls.children[2].innerHTML = "BallSpeed: " + ballSpeed
    controls.children[3].innerHTML = "Ball Direction: [" + ballDirX + " ; " + ballDirZ +" ]"
    if(mode == 2) {
        controls.children[4].innerHTML = "Oponent DirZ: " + paddle2DirZ
    }
}

//EndGame function
function endGame(time = false) {
    //First check if time ran out
    winner = 0
    if(time) { //It did
        winner = checkScore()
    }else { //Did not
        if(!checkWin()) //Noone won yet
            return
        winner = checkScore()
    }
        
    displayWinner(winner)
}

//Check who won, if anybody
function checkScore() {
    return (score1 > score2) ? 1 : (score1 == score2) ? 0 : 2
}

//Check if someone won
function checkWin() {
    return (score1 == maxScore || score2 == maxScore) ? true : false
}

//Loads audio to game
function loadAudio(path, elements,name) {
    if(!Array.isArray(elements)) {
        audioLoader.load(path, function (buffer) {
            elements.effects = (typeof elements.effects == "undefined") ? {} : elements.effects
            var audio = new THREE.PositionalAudio(listener)
            audio.setBuffer(buffer)
            audio.name = path
            elements.effects[name] = audio
        })
        return
    }else if(Array.isArray(elements)) {
        audioLoader.load(path, function (buffer) {
            var audio = new THREE.PositionalAudio(listener)
            audio.setBuffer(buffer)
            console.log(elements)
            for(let i = 0; i < elements.length; i++) {
                elements[i].effects = (typeof effects == "undefined") ? {} : elements[i].effects
                audio.name = path
                elements[i].effects[name] = audio
            }
        })
    }
}

//add listener to window
function pauseExitCameraListener() {
    window.addEventListener("keydown", (ev) => {
        if(ev.keyCode == 32) { //Pause
            if($(".modalWindow").is(":hidden")) {
                if(pause) {
                    resumeGame()
                }else {
                    pauseGame()
                }
            }
        }

        if(ev.keyCode == 27) { //Exit
            if($(".modalWindow").is(":hidden")) {
                pauseGame()
                showModal(".exit")
            }
        }

        if(ev.keyCode == 67) { //Change camera
            cameraView = (cameraView + 1 <= 2) ? ++cameraView : 0
            updateCameraPosition()
            //cameraView++
        }
    })
}

//Shows modal window when endgame or exit
function showModal(window) {
    $(".modalWindow").show()
    $(".modalWindow").children(".modal-item").hide()
    $(".modalWindow "+window).show()
}

//Closes modal window
function closeModal() {
    $(".modalWindow").hide()
    resumeGame()
}

//When rematch button is pressed
function rematch() {
    //Reset paddle positions
    arena.paddle1.position.z = arena.paddle2.position.z = 0
    //Reset ball positions
    arena.ball.position.z = arena.ball.position.x = 0
    //Reset score
    score1 = 0
    score2 = 0
    //Reset all settings
    setOptions()
    //update score
    updateScore()
    //Display new time
    displayTime()
    //Hide rematch modal
    $(".modalWindow").hide()
    //start
    pauseGame()
    resumeGame()


}

//Displays winner to modalWindow
function displayWinner(winner) {
    pauseGame()
    if(mode == 1 && winner != 0) {
        $(".winner h3").text("Player " + winner + " won!")
        showModal(".winner")   
    }else if(mode == 2 && winner != 0) {
        $(".winner h3").text((winner == 1 ? "Player1" : "CPU") + " won!")
        showModal(".winner")
    }else {
        $(".winner h3").text("Match resulted in draw!")
        showModal(".winner")
    }

    if(mode == 2 && winner == 2) {
        scene.effects["loose"].play()
    }else {
        scene.effects["win"].play()
    }
    
}
