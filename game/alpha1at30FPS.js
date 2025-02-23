// version notes: 

// let mode = "edit";  // modes for programmer, "edit", "play"
let mode = "play";  // modes for programmer, "edit", "play"
let gameWon = false;
let gameOver = false;
let drawEndScreen = false;
let timeWon;
// ---
let tempSprite;
let lSpriteArray = [];      // leftSpriteArray
let rSpriteArray = [];      // rightSpriteArray
let fSpriteArray = [];      // upSpriteArray - back
let bSpriteArray = [];      // downSpriteArray - front
// ---
let redetTerrain = [];      // the REDET terrain painting
let rocketShip = [];        // image at 0 -> Empty, at 1 -> BatteryOn, at 2 -> Ready
let rocketShipState = "Empty";
let rocketShipLaunch = [];
let ignitionMeter = 0;
let rocketShipX;  // let them public so that in central draw, you can affect the rocketship move when you win
let rocketShipY;
let atRocketBase = false;
let gearsNeeded;
// ---
let martianSizeMult = 2;     // martian size multiplier - default is 1, play with fraction of width, krata to paron sto 1, allaxe to mono gia provolh
let martianStep = 10;       // distance covered with each step of the astronaut, will see which will be the ideal
let martianHeight;
let martianWidth;
let martianTimeForm = 0;    // in sprite 0 he is still, starting form
let martianDirection = "front";
// ---
let wormX;
let wormY;
let wormHead;
let wormBody;
let angleClockwise = [0, 0.1, 0.2, 0.3, 0.4, 0.5]; // initial angle of head and body parts for CLOCKWISE rotation (and incrementing the angle)
let angleCounterClockwise = [360, 359.9, 359.8, 359.7, 359.6, 359.5]; // COUNTERCLOCKWISE rotation and decreasing the angle
let wormSizeRegular;
let r1;  // radius for the first Worm
let r2; // radius for the second Worm
let wormEaten = false;
let battery;
let batteryTaken = false;
let pileOfGears;
let pileOfGearsPicked = false;
// ---
let cam;
let camView = 500;  // the view of the camera, higher value gives larger expansion of the camera
let camViewUpperLimit = 700; // 700 default, 1200 semi-god mode (at around 800 we have a full screen view so lets take it at a little less, at around 700, so that you can see and avoid the worms)
let font; // for use in play mode (WebGL)
// setting the FPS
let smoothnessFactor = 1;  // 1 (default) corresponds to 30FPS, 2 to 60FPS etc. will be using this factor to change everything whenever needed from 30FPS to 60FPS and vice versa
// will be used at the setting of the fps and at various loops such as "loop for continuous movement to a direction - (frameCount%3)===0 happens 10 times in frameRate(30) to reduce the speed of the martian, if smoothnessFactor=2 then the fps would be 60FPS so the framesCount would be double so we divide them by 3*2(2 being the smoothnessFactor) to keep things happening the same times"
// space cargo variables
let crateX;
let crateY;
let superCrateX;
let superCrateY;
let cratePicked = false;
let cratePickedFrame;

// metrics based on the width
let deciWidth;
let centiWidth;
let milliWidth;
let deciHeight;
let centiHeight
let milliHeight;

// JS stats of the game passed to the HTML STATS BAR (1/3)
let oxygenMax = document.getElementById("oxygenMax").innerText;
let oxygen = oxygenMax;
let oxygenRef;
let gears = 0;
let gearsRef;

// --- 
let backgroundMusic;
let gearsPickupSound;
let rocketLaunchingSound;


function preload() {

  for (i = 1; i < 9; i += 1) {
    tempSprite = loadImage('/assets/left/' + i + '.png');
    lSpriteArray.push(tempSprite);
    tempSprite = loadImage('/assets/right/' + i + '.png');
    rSpriteArray.push(tempSprite);
    tempSprite = loadImage('/assets/front/' + i + '.png');
    fSpriteArray.push(tempSprite);
    tempSprite = loadImage('/assets/back/' + i + '.png');
    bSpriteArray.push(tempSprite);
  }
  font = loadFont('/assets/inconsolata.otf'); // for use in play mode (WebGL)

  for (i = 0; i < 13; i += 1) {
    redetTerrain.push(loadImage('/assets/redetTerrain' + i + '.png'));
  }


  wormHead = loadImage('/assets/wormHead.png');
  wormBody = loadImage('/assets/wormBody.png');

  battery = loadImage('/assets/battery.png');

  pileOfGears = loadImage('assets/pileOfGears.png');

  rocketShip.push(loadImage('/assets/rocketEmpty.png'));
  rocketShip.push(loadImage('/assets/rocketBatteryOn.png'));
  rocketShip.push(loadImage('/assets/rocketReady.png'));

  for (i = 0; i < 8; i += 1) {
    rocketShipLaunch.push(loadImage('/assets/launching/rocketLaunch' + i + '.png'));
  }

  // music
  backgroundMusic = loadSound('/assets/chill-galaxy-bells.wav');
  gearsPickupSound = loadSound('/assets/gear-picked.mp3');
  rocketLaunchingSound = loadSound('/assets/launch.mp3');
  
}


function setup() {

  if (mode === "edit") {
    createCanvas(windowWidth - 5, windowHeight - 5); // edit mode 
  }
  else {
    createCanvas(windowWidth - 5, windowHeight - 5, WEBGL);       // play mode
    cam = createCamera();
  }

  // settings about frames
  frameRate(30 * smoothnessFactor);


  // settings about width-height dimensions and metrics
  deciWidth = width / 10;
  centiWidth = deciWidth / 10;
  milliWidth = centiWidth / 10;
  deciHeight = height / 10;
  centiHeight = deciHeight / 10;
  milliHeight - centiHeight / 10;
  // ---
  martianWidth = 2 * centiWidth * martianSizeMult;   // default mW = width/50 = 2*width/100 (aka 2 centiWidths)
  martianHeight = 2 * martianWidth;               // default mH = width/25 = 4*width/100 (aka 4 centiWidths)
  martianX = width / 2;     // set here and not at the start because the canvas should first be drawn to get its width and height
  martianY = height / 2;
  drawAstronaut(fSpriteArray[martianTimeForm]);   // starts at the above martianX, martianY
  textAlign(CENTER);

  // ---
  wormSizeRegular = 5 * martianHeight;
  r1 = 4 * martianHeight;
  r2 = 2 * martianHeight;
  r3 = 10 * martianHeight;

  // ---
  gearsNeeded = random(30, 40);

  // needed so that text appears when in play mode (WebGL)
  fill('deeppink');
  textFont(font);
  textSize(36);

  // JS stats of the game passed to the HTML STATS BAR (2/3)
  // creating a reference-bridge variable (getElementById) for the HTML element which we assign to a JS variable
  oxygenRef = document.getElementById("oxygenDisplay");
  gearsRef = document.getElementById("gearsDisplay");
}

// main function that calls (indexes) the rest of the functions
function draw() {

  if (drawEndScreen === false) {

    // playing background music
    if ( (frameCount === 1) || (frameCount % (19 * 30 * smoothnessFactor) === 0) ) {  // sound duration 19 seconds so replay him every (19 seconds * frames/sec), 
      backgroundMusic.play();
    }

    drawTerrain();

    // a set of tools used to help me estimate, draw, etc. uncomment it when editing to see coordinates
    // toolbox();

    // JS stats of the game passed to the HTML STATS BAR (3/3)
    // assigning the value we want at the reference bridge variable thus to the corresponding HTML element
    oxygenRef.innerHTML = oxygen;
    gearsRef.innerHTML = gears;
    oxygenMax = document.getElementById("oxygenMax").innerText;

    // mode is determined at the variables section at the start
    if (mode === "play") {
      cam.setPosition(martianX, martianY, camView);  // setting the camera to follow our astronaut
    }

    // drawing of the BASE for replenishing oxygen
    drawBase();

    // draws and sets the movement of the ASTRONAUT
    // set to work 10 times in for fps=30, with boolean (frameCount%3===0), if I put the player to just walk and not kind of run it feels boring, run already!
    if ((gameWon !== true) && (gameOver === false)) {
      moveMartian();
    }

    if ((gameWon !== true) && (gameOver === false)) {
      calculateOxygen();
    }


    // boxes appearance and disappearance, GAME OVER condition
    handleEvents();


    // WORM surrounding the base
    drawWorm(angleClockwise, r3, width / 2, height / 2, 2 * wormSizeRegular);

    // BATTERY and WORMS around it, lazy drawing -> draw it only if the Martian comes close to it
    if ((martianX < 0) && (martianY < height)) {
      let nestX = -width;
      let nestY = 0;
      if (batteryTaken === false) {
        image(battery, nestX, nestY, 3 * martianHeight, 3 * martianHeight);
        if ((Math.abs(martianX - nestX) < (martianWidth)) && (Math.abs(martianY - nestY) < (martianWidth))) {
          batteryTaken = true;
        }
      }
      drawWorm(angleClockwise, r1, nestX, nestY, wormSizeRegular);
      drawWorm(angleCounterClockwise, r2, nestX, nestY, wormSizeRegular);
    }

    // PILE of GEARS, lazy drawing
    if ((martianX < 0) && (martianY > height)) {
      drawPileOfGears();
    }

    // lazy DRAWING of the ROCKETSHIP -> draw it only if the Martian comes close to it
    if (gameWon !== true) { // not drawing when you win, it is leaving the screen then
      if ((martianX > width) && (martianY > height)) {
        drawRocketShip();
      }
    }

    // GAME WIN condition - when you repaired and launched the rocketship
    if (gameWon === true) {
      rocketShipY -= 5;
      image(rocketShipLaunch[7], rocketShipX, rocketShipY, 20 * martianWidth, 10 * martianWidth);
      textSize(24);
      text("Congratulations! You helped Anthony launch his rocket and continue his journey!", martianX, martianY);
      // after 3 seconds meaning 3 * fps (for 30 fps after 90 frames, for 60 fps after 180 frames)

      if (frameCount > timeWon + (3 * 30 * smoothnessFactor)) {

        drawEndScreen = true;
      }
    }
    // GAME OVER condition
    if (gameOver === true) {
      textSize(24);
      text("Well, seems like you just died, refresh the page to try again!", martianX, martianY);
    }
  }
  else { // draw the final screen
    background(170, 116, 72); // color of REDET inspired by the Martian
    textSize(36)
    text("Thank you for playing, have a nice day!", 2 * width, 2 * height);
    text("Created by Manos Stamatakis", 2 * width, 2 * height + 100);
  }




}

function calculateOxygen() {
  if (frameCount % (30 * smoothnessFactor) === 0) {

    // checking if he is at the rocketBase
    if ((martianX > rocketShipX - 3 * martianHeight) && (martianX < rocketShipX + 3 * martianHeight) && (martianY > rocketShipY - 3 * martianHeight) && (martianY < rocketShipY + 3 * martianHeight)) {
      atRocketBase = true;
    }
    else { atRocketBase = false; }

    // oxygen levels falling when out of rocket base or out of base
    if ((atRocketBase === false) && ((martianX > width / 2 + 4 * centiWidth) || (martianX < width / 2 - 4 * centiWidth) || (martianY > height / 2 + 4 * centiWidth) || (martianY < height / 2 - 4 * centiWidth))) {
      if (oxygen > 0) { oxygen -= 1; }
    }
    // oxygen levels replenishing when in base or in rocketBase
    else {
      if (oxygen < oxygenMax) {
        if (oxygen < (oxygenMax - 6)) { oxygen += 5; }
        else { oxygen += 1; }
      }
    }
  }


}

function martianIsCloseTo(x, y, howClose) {
  if ((Math.abs(martianX - x) < (howClose)) && (Math.abs(martianY - y) < (howClose))) {
    return true;
  }
  else {
    return false;
  }
}

function drawTerrain() {
  background(170, 116, 72); // color of REDET inspired by the Martian
  // main areas around the base
  let tempWidth = (4 / 5) * width;
  let tempHeight = (4 / 5) * height;
  image(redetTerrain[0], 0, 0, tempWidth, tempHeight);
  image(redetTerrain[1], width, 0, tempWidth, tempHeight);
  image(redetTerrain[2], width, height, tempWidth, tempHeight);
  image(redetTerrain[3], 0, height, tempWidth, tempHeight);
  // auxiliary areas at the borders
  let temp2Width = width / 4;
  let temp2Height = height / 4;
  image(redetTerrain[4], -width, height, tempWidth, tempHeight);
  image(redetTerrain[5], -width, 2 * height, tempWidth, tempHeight);
  image(redetTerrain[6], 0, 2 * height, tempWidth, tempHeight);
  image(redetTerrain[7], width, 2 * height, tempWidth, tempHeight);
  image(redetTerrain[8], 2 * width, height, tempWidth, tempHeight);
  image(redetTerrain[9], 2 * width, 0, tempWidth, tempHeight);
  image(redetTerrain[10], width, -height, tempWidth, tempHeight);
  image(redetTerrain[11], 0, -height, tempWidth, tempHeight);
  image(redetTerrain[12], -width, -height, tempWidth, tempHeight);
}

// LET IT GLOBAL so that setup function can see it !
function drawAstronaut(img) {
  imageMode(CENTER);
  image(img, martianX, martianY, martianWidth, martianHeight);
}

function drawBase() {
  // drawing of the BASE for replenishing oxygen
  stroke(127, 127, 127);
  strokeWeight(0);    // so the circle does not pass over the martian
  fill(127, 127, 127);
  circle(width / 2, height / 2, 8 * centiWidth);

  textSize(15);
  fill(0, 128, 0);
  text("B A S E", width / 2, height / 2);
  noFill();
}

function drawCrate(cX, cY, cSize) {
  // grey background
  rectMode(CENTER);
  noStroke();
  fill(147, 161, 170);  // grey
  rect(cX, cY, cSize, cSize);
  // green type of container
  fill(0, 128, 0);
  rect(cX, cY - cSize / 3, cSize / 2, cSize / 12);
  // dark depth lines
  fill(41, 41, 41);  // dark grey
  rect(cX, cY, cSize / 10, cSize);
  rect(cX, cY, cSize, cSize / 10);
  // dark depth cycle
  stroke(41, 41, 41);
  strokeWeight(5);
  fill(147, 161, 170);
  circle(cX, cY, cSize / 3);
}

function drawRocketShip() {
  rocketShipX = 2 * width;
  rocketShipY = 2 * height;
  noFill();
  stroke(151, 103, 64);
  circle(rocketShipX, rocketShipY, 10 * martianHeight);
  stroke(134, 91, 57);
  //circle(rocketShipX, rocketShipY, 10 * martianWidth);
  if (rocketShipState === "Empty") {
    image(rocketShip[0], rocketShipX, rocketShipY, 20 * martianWidth, 10 * martianWidth);
    if (martianIsCloseTo(rocketShipX, rocketShipY, 2 * martianWidth)) {
      if (batteryTaken === false) {
        fill("black");
        textSize(10);
        text('\"Seems like it needs something to power it on,\n its main battery seems to be missing.\n And then maybe some gears to repair it and tune it.\"', rocketShipX, rocketShipY);
      }
      else {  // battery is taken
        rocketShipState = "BatteryOn";
      }
    }
  }
  else if (rocketShipState === "BatteryOn") {
    image(rocketShip[1], rocketShipX, rocketShipY, 20 * martianWidth, 10 * martianWidth);
    if (martianIsCloseTo(rocketShipX, rocketShipY, 2 * martianWidth)) {
      // put gears needed as a random number between 30 and 40 after being tested with 10 for simplicity
      if (gears < gearsNeeded) {
        fill("black");
        textSize(10);
        text('\"Okay, battery seems to be fitting, now I need some gears to tune it. \n The repairs needed are small, so maybe 30-40 gears will do the trick?\"', rocketShipX, rocketShipY);
      }
      else {
        rocketShipState = "Ready";
      }
    }
  }
  else if (rocketShipState === "Ready") {
    image(rocketShip[2], rocketShipX, rocketShipY, 20 * martianWidth, 10 * martianWidth);
    if (martianIsCloseTo(rocketShipX, rocketShipY, 2 * martianWidth)) {
      fill("black");
      textSize(10);
      text('\"Okay, seems ready. Guess it\'s finally time to go home!\nIf I remember correctly this rocketship should turn on if I press X! \"', rocketShipX, rocketShipY);
      // now if you press X, it changes the rocketShipState to Ignited
    }
  }
  else if (rocketShipState === "Ignited") {
    console.log("Ignited");
    if (martianIsCloseTo(rocketShipX, rocketShipY, 2 * martianWidth)) {
      if (frameCount%(4 * 30 * smoothnessFactor)===0) {   // play the sound every 4 seconds (duration of sound) e.g. 4 * fps = X, every X frames
        rocketLaunchingSound.play();  
      }
      
      
      image(rocketShipLaunch[0], rocketShipX, rocketShipY, 20 * martianWidth, 10 * martianWidth);

      fill("black");
      textSize(10);
      text('\"It\'s on, let\'s keep on pressing L \nfor full throttle, time to Launch!!! \"', rocketShipX, rocketShipY);
    }
    else {
      rocketShipState = "Ready";
    }
  }
  else if (rocketShipState === "Launching") {
    if (keyIsDown(76) === true && (frameCount % (30 * smoothnessFactor)) === 0) {
      ignitionMeter += 1;
    }

    if (ignitionMeter < 2) {
      image(rocketShipLaunch[0], rocketShipX, rocketShipY, 20 * martianWidth, 10 * martianWidth);
    }
    else if (ignitionMeter < 3) {
      image(rocketShipLaunch[1], rocketShipX, rocketShipY, 20 * martianWidth, 10 * martianWidth);
    }

    else if (ignitionMeter < 4) {
      image(rocketShipLaunch[2], rocketShipX, rocketShipY, 20 * martianWidth, 10 * martianWidth);
    }
    else if (ignitionMeter < 5) {
      image(rocketShipLaunch[3], rocketShipX, rocketShipY, 20 * martianWidth, 10 * martianWidth);
    }
    else if (ignitionMeter < 6) {
      image(rocketShipLaunch[4], rocketShipX, rocketShipY, 20 * martianWidth, 10 * martianWidth);
    }
    else if (ignitionMeter < 7) {
      image(rocketShipLaunch[5], rocketShipX, rocketShipY, 20 * martianWidth, 10 * martianWidth);
    }
    else if (ignitionMeter < 8) {
      image(rocketShipLaunch[6], rocketShipX, rocketShipY, 20 * martianWidth, 10 * martianWidth);
    }
    else {
      gameWon = true;
      timeWon = frameCount;
    }
  }
  else {

  }






}

function drawWorm(angle, theRadius, nestX, nestY, wormSize) {
  fill(99, 67, 41); // color of the Worm
  stroke(0);
  // draw multiple circles for the Worm's face and body
  for (let i = 0; i < angle.length; i += 1) {
    wormX = nestX + theRadius * cos(angle[i]);
    wormY = nestY + theRadius * sin(angle[i]);
    // Draw the body and ...
    if (i != 5) {
      image(wormBody, wormX, wormY, 2 * wormSize, 2 * wormSize);
    }
    // circle(wormX, wormY, wormSize);
    // ... the head of the worm
    if (i === 5) {
      image(wormHead, wormX, wormY, wormSize, wormSize);
    }
    if (angle[0] < angle[1]) {  // meaning clockwise rotation
      angle[i] += 0.01;   // speed of circling around - have to correlate it to the fps
      if (angle[i] === 360) {
        angle[i] = 0; // limiting the values that angle will take after several frames, better safe than sorry
      }
    }
    if (angle[0] > angle[1]) {  // meaning counter-clockwise rotation
      angle[i] -= 0.01;   // speed of circling around - have to correlate it to the fps
      if (angle[i] === 0) {
        angle[i] = 360; // limiting the values that angle will take after several frames, better safe than sorry
      }
    }
  }
  // CHECKING if the Worm got the astronaut
  if ((Math.abs(martianX - wormX) < (martianWidth)) && (Math.abs(martianY - wormY) < (martianWidth))) {
    wormEaten = true;
  }


}

function drawPileOfGears() {
  if (pileOfGearsPicked === false) {
    image(pileOfGears, -width, 2 * height, martianHeight, martianHeight);
    text("a pile of gears, these will be put to good use", -width, 2 * height + 1 * martianHeight);
    if (martianIsCloseTo(-width, 2 * height, martianWidth/2)) {
      pileOfGearsPicked = true;
      gears += 20;
    }
  }


}

// a general direction's function for when you press ONCE! a button or for other ONCE! buttons
// the moveMartian function contains the handling of keys being pressed continuously
function keyPressed() {

  // up-back
  if (key === 'w') {
    martianDirection = "back";
    martianTimeForm += 1;
    martianY -= martianStep;
  }
  // left
  else if (key === 'a') {
    martianDirection = "left";
    martianTimeForm += 1;
    martianX -= martianStep;
  }
  // right
  else if (key === 'd') {
    martianDirection = "right";
    martianTimeForm += 1;
    martianX += martianStep;
  }
  // down-front
  else if (key === 's') {
    martianDirection = "front";
    martianTimeForm += 1;
    martianY += martianStep;
  }
  else if (key === 'x') {
    if (rocketShipState === "Ready") {
      rocketShipState = "Ignited";
    }
  }
  else if (key === 'l') {
    console.log(ignitionMeter);
    if (rocketShipState === "Ignited") {
      rocketShipState = "Launching";
    }
  }


  else {
    // nada for the time being, maybe space or enter for action of the astronaut
  }
}

function mouseWheel(event) {
  // wheel-up -> expanding
  if (event.delta > 0) {
    if (camView < camViewUpperLimit) {
      camView += 20;
    }
    else {
      camView = camViewUpperLimit;
    }

  }
  // wheel-down -> zooming
  else {
    if (camView > 80) {
      if (camView < 100) {
        camView -= 5;
      }
      else { camView -= 20; }
    }

  }
}

function moveMartian() {
  function martianFormLoopCheck() {
    if (martianTimeForm === 8) {
      martianTimeForm = 0;
    }
  }

  // loop for the form-rotation of the martian while walking
  martianFormLoopCheck();


  // loop for turning to a direction - essential! so the martian keeps appearing when buttons are not pressed
  if (martianDirection === "left") {
    if (keyIsDown(65) === true) {
      drawAstronaut(lSpriteArray[martianTimeForm]);
    }
    // to stand still
    else {
      drawAstronaut(lSpriteArray[0]);
    }
  }
  if (martianDirection === "back") {
    if (keyIsDown(87) === true) {
      drawAstronaut(bSpriteArray[martianTimeForm]);
    }
    // to stand still
    else {
      drawAstronaut(bSpriteArray[0]);
    }
  }
  if (martianDirection === "right") {
    if (keyIsDown(68) === true) {
      drawAstronaut(rSpriteArray[martianTimeForm]);
    }
    // to stand still
    else {
      drawAstronaut(rSpriteArray[0]);
    }
  }
  if (martianDirection === "front") {
    if (keyIsDown(83) === true) {
      drawAstronaut(fSpriteArray[martianTimeForm]);
    }
    // to stand still
    else {
      drawAstronaut(fSpriteArray[0]);
    }

  }
  // loop for continuous movement to a direction - (frameCount%3)===0 happens 10 times in frameRate(30) to reduce the speed of the martian, if smoothnessFactor=2 then the fps would be 60FPS so the framesCount would be double so we divide them by 3*2(2 being the smoothnessFactor) to keep things happening the same times
  // keep left and right below the back and front so in diagonal moves the left and right portraits are drawn
  if (keyIsDown(87) === true && (frameCount % (3 * smoothnessFactor)) === 0) {
    martianDirection = "back";
    martianTimeForm += 1;
    martianY -= martianStep;  //going up
    martianFormLoopCheck();
  }
  if (keyIsDown(83) === true && (frameCount % (3 * smoothnessFactor)) === 0) {
    martianDirection = "front";
    martianTimeForm += 1;
    martianY += martianStep;  //going down
    martianFormLoopCheck();
  }
  if (keyIsDown(65) === true && (frameCount % (3 * smoothnessFactor)) === 0) {
    martianDirection = "left";
    martianTimeForm += 1;
    martianX -= martianStep;  //going left
    martianFormLoopCheck();
  }
  if (keyIsDown(68) === true && (frameCount % (3 * smoothnessFactor)) === 0) {
    martianDirection = "right";
    martianTimeForm += 1;
    martianX += martianStep;  //going right
    martianFormLoopCheck();
  }

}

function toolbox() {
  textSize(20);
  // here you can comment out whichever you (don't) need at the time
  xWidth_yDepth();
  function xWidth_yDepth() {
    //displays the x and y position of the mouse on the canvas
    fill(255); //white text
    if (mode === "edit") {
      text(`mouseX-width: ${mouseX}`, 10, 35);
      text(`mouseY-depth: ${mouseY}`, 10, 40);
    }

  }
  canvasXYDisplay();
  function canvasXYDisplay() {
    let w = window.width;
    let h = window.height;
    fill("white");
    if (mode === "edit") {
      text('10,10', 10, 10);
      text(w, width - 70, 10); text(',10', width - 50, 10);
      text('10,', 10, height - 30); text(h, 30, height - 30);
      text(w, width - 70, height - 50); text(',', width - 50, height - 50); text(h, width - 40, height - 50);
    }
    else {
      // basic points
      text('0, 0', 0, 0);
      text(`${w} , 0`, w, 0);
      text(`0, ${h}`, 0, h);
      text(`${w}, ${h}`, w, h);
      // row 0
      text(`${-w}, ${-h}`, -w, -h);
      text(`${-w}, 0`, -w, 0);
      text(`${-w}, ${h}`, -w, h);
      text(`${-w}, ${2 * h}`, -w, 2 * h);
      // line 0
      text(`0, ${-h}`, 0, -h);
      text(`${w}, ${-h}`, w, -h);
      text(`${2 * w}, ${-h}`, 2 * w, -h);
      // row -1
      text(`${2 * w}, ${2 * h}`, 2 * w, 2 * h);
      text(`${2 * w}, ${h}`, 2 * w, h);
      text(`${2 * w}, 0`, 2 * w, 0);
      // line -1
      text(`${w}, ${2 * h}`, w, 2 * h);
      text(`0, ${2 * h}`, 0, 2 * h);

    }


  }

}

function handleEvents() {

  // GAME OVER conditions and 
  if ((oxygen < 1) || (wormEaten === true) || (gameOver === true)) { // last one so that you can not revive him by moving him to the base
    gameOver = true;
  }

  // SPAWNING A SPACE CARGO CONTAINER
  // frameCount%300 === 0, dhladh gia fps=30 ana 10 deuterolepta 8a emfanizetai ena
  if (cratePicked === false) {
    if (frameCount % (300 * smoothnessFactor) === 0) {
      crateX = random(0, width);
      crateY = random(0, height);
      // crates at the (width, 2*width, 0, -height) rectangle
      superCrateX = random(width, 2 * width);
      superCrateY = random(-height, 0);
    }
    drawCrate(crateX, crateY, martianWidth);
    drawCrate(superCrateX, superCrateY, martianWidth);
  }

  // PICKING UP A CRATE, making it disappear and marking its pickup time
  // green crate
  if ((cratePicked === false) && (Math.abs(martianX - crateX) < (martianWidth / 2)) && (Math.abs(martianY - crateY) < (martianWidth / 2))) {
    let greenCrateValue = random([1, 2, 3, 4]);
    gears += greenCrateValue;
    gearsPickupSound.play();
    cratePicked = true;
    cratePickedFrame = frameCount;
  }
  if ((cratePicked === false) && (Math.abs(martianX - superCrateX) < (martianWidth / 2)) && (Math.abs(martianY - superCrateY) < (martianWidth / 2))) {
    let superCrateValue = random([6, 7, 8, 15]);
    gears += superCrateValue;
    gearsPickupSound.play();
    cratePicked = true;
    cratePickedFrame = frameCount;
  }

  // while cratePicked is true no crates will appear, so this condition delays the re-appearance of crates
  if (cratePicked === true) {
    crateX = -5000; // away from everything (so it does not get picked up by accident) and not drawn
    crateY = -5000;
    // 180 frames, for fps=30, means six seconds, waited for six seconds until the next crate appears
    if (frameCount > cratePickedFrame + (90 * smoothnessFactor)) {
      cratePicked = false; // so that it can be redrawn now
    }
  }



}


