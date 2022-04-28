/***********************************************************************************
  MoodyMaze
  by Scott Kildall

  Uses the p5.2DAdventure.js class 
  
------------------------------------------------------------------------------------
  To use:
  Add this line to the index.html

  <script src="p5.2DAdventure.js"></script>
***********************************************************************************/

// adventure manager global  
var adventureManager;
var clickablesManager;
var clickables;

// avatar selction
var playerAvatar;
var playerGirl;
var playerBoy;

// keycods
const W_KEY = 87;
const S_KEY = 83;
const D_KEY = 68;
const A_KEY = 65;
const X_KEY = 88;
var speed = 5;

// fonts
var din_condensed;

// Variables needed for intro screen
var timer;
var animated_girl = [];
var animated_boy = [];
var animated_index = 0;

// Grabbable arrays
var trash = [];
var groceries = [];

// Grass/Trees in the park
var grass = [];
var trees = [];
var curr_grass = 0;
var curr_tree = 0;

// Cashier in store
var cashier = [];
var curr_cashier = 0;

// Allocate Adventure Manager with states table and interaction tables
function preload() {
  clickablesManager = new ClickableManager('data/clickableLayout.csv');
  adventureManager = new AdventureManager('data/adventureStates.csv', 'data/interactionTable.csv', 'data/clickableLayout.csv');

  // Pre load fonts
  din_condensed = loadFont("fonts/DinCondensed.ttf");

  // Pre load images for animated character selection
  animated_girl[0] = loadImage('assets/people/female_standing01.png');
  animated_girl[1] = loadImage('assets/people/female_standing02.png');
  animated_boy[0] = loadImage('assets/people/male_standing02.png');
  animated_boy[1] = loadImage('assets/people/male_standing01.png');
}

// Setup the adventure manager
function setup() {
  createCanvas(1280, 720);

  // setup the clickables
  clickables = clickablesManager.setup();

  // avatar set up
  playerGirl = new Avatar("Girl", 640, 400);
  playerGirl.setMaxSpeed(20);
  playerGirl.addMovingAnimation('assets/people/female_running01.png', 'assets/people/female_running03.png');
  playerGirl.addStandingAnimation('assets/people/female_standing01.png', 'assets/people/female_standing02.png');

  playerBoy = new Avatar("Boy", 700, 400);
  playerBoy.setMaxSpeed(20);
  playerBoy.addMovingAnimation('assets/people/male_running01.png', 'assets/people/male_running03.png');
  playerBoy.addStandingAnimation('assets/people/male_standing01.png', 'assets/people/male_standing02.png');

  // manage turning visibility of buttons on/off based on the state name in the clickableLayout
  adventureManager.setClickableManager(clickablesManager);

  // load the images, go through state and interation tables, etc
  adventureManager.setup();

  // call OUR function to setup additional information about the p5.clickables
  // that are not in the array 
  setupClickables();

  timer = new Timer(300);
  timer.start();
}

// Adventure manager handles it all!
function draw() {

  // draws background rooms and handles movement from one to another
  adventureManager.draw();

  // draw the p5.clickables, in front of the mazes but behind the sprites 
  clickablesManager.draw();

  if (adventureManager.getStateName() == "Instructions") {
    // Draw animation of girl
    let img1 = animated_girl[animated_index];
    img1.resize(160, 300);
    image(img1, 445, 270);

    // Draw animation of boy
    let img2 = animated_boy[animated_index];
    img2.resize(160, 300);
    image(img2, 695, 270);

    // Change image
    if (timer.expired()) {
      if (animated_index == 0) {
        animated_index = 1;
      } else {
        animated_index = 0;
      }
      timer.start();
    }
  }
}

function notSplashOrInstruct() {
  checkMovement();
  drawSprite(playerAvatar.sprite);
  playerAvatar.update();
}

// respond to W-A-S-D or the arrow keys
function checkMovement() {
  var xSpeed = 0;
  var ySpeed = 0;

  // Check x movement
  if (keyIsDown(RIGHT_ARROW) || keyIsDown(D_KEY)) {
    xSpeed = speed;
  }
  else if (keyIsDown(LEFT_ARROW) || keyIsDown(A_KEY)) {
    xSpeed = -speed;
  }

  // Check y movement
  if (keyIsDown(DOWN_ARROW) || keyIsDown(S_KEY)) {
    ySpeed = speed;
  }
  else if (keyIsDown(UP_ARROW) || keyIsDown(W_KEY)) {
    ySpeed = -speed;
  }

  playerAvatar.setSpeed(xSpeed, ySpeed);
}

function mouseReleased() {
  if (adventureManager.getStateName() === "Splash") {
    adventureManager.changeState("Instructions");
  }
}

function setupClickables() {
  // All clickables to have same effects
  for (let i = 0; i < clickables.length; i++) {

    // Callbacks
    clickables[i].onHover = clickableButtonHover;
    clickables[i].onOutside = clickableButtonOnOutside;
    clickables[i].onPress = clickableButtonPressed;

    // Style
    clickables[i].textFont = din_condensed;
    clickables[i].textSize = 20;
    clickables[i].strokeWeight = 5;
    clickables[i].stroke = "#FFFFFF";
  }
}

// tint when mouse is over
clickableButtonHover = function () {
  this.color = "#A9A9A9";
  this.noTint = false;
  this.tint = "#A9A9A9";
}

// color a light gray if off
clickableButtonOnOutside = function () {
  // backto our gray color
  this.color = "#FFFFFF";
}

clickableButtonPressed = function () {
  // these clickables are ones that change your state
  // so they route to the adventure manager to do this
  adventureManager.clickablePressed(this.name);
  if (this.name == "ChooseFemale") {
    playerAvatar = playerGirl;
  } if (this.name == "ChooseMale") {
    playerAvatar = playerBoy;
  }

  adventureManager.setPlayerSprite(playerAvatar.sprite);
}
//

//-------------- SUBCLASSES / YOUR DRAW CODE CAN GO HERE ---------------//

//-- MODIFY THIS:
// Change for your own instructions screen

// Instructions screen has a backgrounnd image, loaded from the adventureStates table
// It is sublcassed from PNGRoom, which means all the loading, unloading and drawing of that
// class can be used. We call super() to call the super class's function as needed
class InstructionsScreen extends PNGRoom {
  // preload is where we define OUR variables
  // Best not to use constructor() functions for sublcasses of PNGRoom
  // AdventureManager calls preload() one time, during startup
  preload() {
    // These are out variables in the InstructionsScreen class
    this.textBoxWidth = (width / 6) * 4;
    this.textBoxHeight = (height / 6) * 4;

    // hard-coded, but this could be loaded from a file if we wanted to be more elegant
    this.instructionsText = "You are navigating through the interior space of your moods. There is no goal to this game, but just a chance to explore various things that might be going on in your head. Use the ARROW keys to navigate your avatar around.";
  }

  // call the PNGRoom superclass's draw function to draw the background image
  // and draw our instructions on top of this
  draw() {

    // this calls PNGRoom.draw()
    super.draw();

  }
}

/**
 * Class for the spawn room, the park
 */


var lastTrashGrab1 = -1; // most recent
var lastTrashGrab2 = -1; // second most recent
var preventPickupTrash = [false, false, false, false]; // true if you cannot pick up item

var can;

class ParkRoom extends PNGRoom {
  preload() {

    // Pre load images for grass
    grass[0] = loadImage('assets/grass01.png');
    grass[1] = loadImage('assets/grass02.png');
    grass[2] = loadImage('assets/grass03.png');
    grass[3] = loadImage('assets/grass04.png');

    // Pre load images for trees
    trees[0] = loadImage('assets/tree01.png');
    trees[1] = loadImage('assets/tree02.png');
    trees[2] = loadImage('assets/tree03.png');

    // Pre load trash grabbables
    trash.push(new StaticSprite("Bag", 100, 200, 'assets/items/plastic_bag.png'));
    trash.push(new StaticSprite("Wrapper", 800, 70, 'assets/items/plastic_wrap.png'));
    trash.push(new StaticSprite("Straw", 400, 600, 'assets/items/straw.png'));
    trash.push(new StaticSprite("Bottle", 1180, 650, 'assets/items/water_bottle.png'));

    this.isSetup = false;
  }

  draw() {
    if (this.isSetup === false) {
      for (let i = 0; i < trash.length; i++) {
        trash[i].setup();
      }

      can = new GarbageCan("Can", width / 2, height / 2);
      can.addMovingAnimation('assets/trash.png', 'assets/trash.png');
      can.addStandingAnimation('assets/trash.png', 'assets/trash.png');

      this.isSetup = true;
    }

    super.draw();
    notSplashOrInstruct();

    // Draw sprites
    drawSprite(can.sprite);

    for (let i = 0; i < trash.length; i++) {
      drawSprite(trash[i].sprite);
    }

    // Draw grass
    let x_grass = [50, 100, 200, 300, 400, 500, 700, 800, 900, 1000, 1100, 1200];
    let y_grass = [50, 650, 150, 500, 260, 600, 200, 400, 100, 650, 500, 50];

    for (let i = 0; i < x_grass.length; i++) {
      image(grass[curr_grass], x_grass[i], y_grass[i]);
    }

    // Draw tree
    let x_tree = [150, 300, 910, 950];
    let y_tree = [550, 0, 340, -150];

    let tree = trees[curr_tree];
    tree.resize(180, 337);

    for (let j = 0; j < x_tree.length; j++) {
      image(tree, x_tree[j], y_tree[j]);
    }

    // Change images
    if (timer.expired()) {
      curr_grass++;
      curr_tree++;
      if (curr_grass == 4) {
        curr_grass = 0;
      }
      if (curr_tree == 3) {
        curr_tree = 0;
      }
      timer.start();
    }

    // Grabbale Code
    if (lastTrashGrab1 >= 0 && !playerAvatar.sprite.overlap(trash[lastTrashGrab1].sprite)) {
      preventPickupTrash[lastTrashGrab1] = false;
      lastTrashGrab1 = -1;
    }

    for (i = 0; i < trash.length; i++) {

      if (!preventPickupTrash[i] && playerAvatar.sprite.overlap(trash[i].sprite)) {

        playerAvatar.setGrabbable(trash[i]);
        preventPickupTrash[i] = true;
        lastTrashGrab2 = lastTrashGrab1;
        lastTrashGrab1 = i;
      }
    }

    if (lastTrashGrab1 >= 0 && lastTrashGrab2 >= 0 && !playerAvatar.sprite.overlap(trash[lastTrashGrab2].sprite)) {
      preventPickupTrash[lastTrashGrab2] = false;
      lastTrashGrab2 = -1;
    }

    checkItemDrop();
  }
}

/**
 * Class for the grocery store
 */

var lastGroceryGrab1 = -1; // most recent
var lastGroceryGrab2 = -1; // second most recent
var preventPickupGroceries = [false, false, false, false, false, false, false, false]; // true if you cannot pick up item

class StoreRoom extends PNGRoom {
  preload() {
    // Pre load images for cashier in the store
    cashier[0] = loadImage('assets/people/store_associate01.png');
    cashier[1] = loadImage('assets/people/store_associate02.png');

    // Pre load images of groceries
    groceries.push(new StaticSprite("Apple", 755, 382, 'assets/items/apple.png'));
    groceries.push(new StaticSprite("Banana", 1000, 380, 'assets/items/banana.png'));
    groceries.push(new StaticSprite("Broccoli", 1125, 383, 'assets/items/broccoli.png'));
    groceries.push(new StaticSprite("Bacon", 937, 115, 'assets/items/bacon.png'));
    groceries.push(new StaticSprite("Chicken", 505, 117, 'assets/items/chicken.png'));
    groceries.push(new StaticSprite("Steak", 1095, 120, 'assets/items/steak.png'));
    groceries.push(new StaticSprite("Tofu", 188, 117, 'assets/items/tofu.png'));
    groceries.push(new StaticSprite("Milk", 350, 117, 'assets/items/milk.png'));

    this.isSetup = false;
  }

  draw() {
    if (this.isSetup === false) {
      for (let i = 0; i < groceries.length; i++) {
        groceries[i].setup();
      }

      this.isSetup = true;
    }

    super.draw();
    notSplashOrInstruct();

    // Draw Sprites
    for (let i = 0; i < groceries.length; i++) {
      if (i < 3) {
        drawSprite(groceries[i].sprite);
      }
      drawSprite(groceries[i].sprite);
    }

    // Draw store associate
    image(cashier[curr_cashier], 50, 318);
    if (timer.expired()) {
      if (curr_cashier == 0) {
        curr_cashier = 1;
      } else {
        curr_cashier = 0;
      }
      timer.start();
    }
    // Grabbale Code
    if (lastGroceryGrab1 >= 0 && !playerAvatar.sprite.overlap(groceries[lastGroceryGrab1].sprite)) {
      preventPickupGroceries[lastGroceryGrab1] = false;
      lastGroceryGrab1 = -1;
    }

    for (i = 0; i < groceries.length; i++) {

      if (!preventPickupGroceries[i] && playerAvatar.sprite.overlap(groceries[i].sprite)) {

        playerAvatar.setGrabbable(groceries[i]);
        preventPickupGroceries[i] = true;
        lastGroceryGrab2 = lastGroceryGrab1;
        lastGroceryGrab1 = i;
      }
    }

    if (lastGroceryGrab1 >= 0 && lastGroceryGrab2 >= 0 && !playerAvatar.sprite.overlap(groceries[lastGroceryGrab2].sprite)) {
      preventPickupGroceries[lastGroceryGrab2] = false;
      lastGroceryGrab2 = -1;
    }

    checkItemDrop();
  }
}

function checkItemDrop() {
  if (keyIsDown(X_KEY) && playerAvatar.grabbable !== undefined) {
    playerAvatar.clearGrabbable();
  }
}

class ParkingRoom extends PNGRoom {
  preload() {

  }
  draw() {
    super.draw();
    notSplashOrInstruct();
  }
}
class HomesRoom extends PNGRoom {
  preload() {

  }
  draw() {
    super.draw();
    notSplashOrInstruct();
  }
}