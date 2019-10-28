//declaring the capture from the webcam
var capture;
//declaring the instance of the input from the microphone
var mic;
//declaring the instance of the p5.FFT (to analyze the frequency spectrum of the mic input)
var fft;
//a boolean that checks if the helmet has been placed on the webcam capture
var helmetPlaced = false;
//checking the volume of the lowMid frequency to detect standard sounds (talk, whistle, etc)
var energyBass;
//checking the volume of the treble frequency to detect sounds similar to an hand clap
var enegyHigh;
//declaring the instance of the player
var player;
//declaring the image of the helmet
var helmetImg;
//declaring the instance of the helmet
var helmet;
//declaring a variable that is going to be a string variable that defines the displayed text
var myText;

function preload() {
  //loading the image of the helmet
  helmetImg = loadImage("./assets/helmet.png");
}

function setup() {
  createCanvas(windowWidth, windowHeight);

//creating the capture from the webcam
  capture = createCapture(VIDEO);
  capture.size(320, 240);
  capture.hide();
  imageMode(CENTER);
  //creating the audio input from the microphone
  mic = new p5.AudioIn();
  //creating the instance of the spectrum analyzer
  fft = new p5.FFT();
  //setting the input for the analyzer
  fft.setInput(mic);
  //starting the microphone
  mic.start();
  //creating instances for player and helmet
  player = new Player(width / 2, height / 2, width/4.2);
  helmet = new Helmet(width * 0.8, height / 2, width/7);
}

function draw() {

  //get the analysis of the whole frequency spectrum
  var spectrum = fft.analyze();
  //separately checking the volume for low-mid and high frequencies
  energyBass = fft.getEnergy("lowMid");
  energyHigh = fft.getEnergy("treble");

  if (helmetPlaced == true) {
  background("MediumSeaGreen");
  myText = "Now you can have fun! talk or whistle to move, clap your hands to jump!";
  //if a clap-like sound is detected, the player jumps, else if a powerful enough normal sound is detected the player moves
  //(it works fwith my PC but I couldn't check if it work also with other ones)
  if (energyHigh > 100) {
    player.jump();
  } else if (energyBass > 100 && energyBass > energyHigh) {
  player.move();
  }
  //the helmet moves togheter with the player if placed
  helmet.move();
} else {
  myText = "Stay safe! Put a helmet on your head!";
  background("FireBrick");
}
//drawing the text and the floor
  push()
  drawingContext.font = "900 2.5vw Playfair Display";
  drawingContext.textAlign = "center";
  fill(240);
  text(myText, width / 2, height / 5);
  pop();

  push();
  noStroke();
  fill('rgba(255, 255, 255, 0.4)');
  rect(0,height/2 + player.hght/2, width, height/2 - player.hght/2);
  pop();

  //calling display method for player and helmet
player.display();
helmet.display();
}

//constructor of the player object
function Player(_x, _y, _playerWidth) {
  this.x = _x;
  this.y = _y;
  this.wdth = _playerWidth;
  this.hght = _playerWidth * 0.75;
  this.acceleration = 0;
  this.direction = 1;

  //move method: make the player move according to the volume of the detected sound and controls the acceleration of the jump to make it look natural
  this.move = function() {
    this.x += this.direction * energyBass / 20;
    this.y -= this.acceleration;

    if (this.x >= width - this.wdth / 2 || this.x <= 0 + this.wdth / 2) {
      this.direction *= -1;
    }
    //acceleration constantly decreases to slower the player when he's in mid-air and becomes negative until he's back on the floor
    if (this.y < height / 2) {
      this.acceleration--;
    } else {
      this.acceleration = 0;
    }
  }

//increases the acceleration to make the player jump
  this.jump = function() {
    if (this.acceleration == 0) {
      this.acceleration = 15;
    }
  }
//displays the capture from the webcam
  this.display = function() {
    image(capture, this.x, this.y, this.wdth, this.hght);
  }
}

//constructor of the helmet object
function Helmet(_x, _y, _size) {
  this.x = _x;
  this.y = _y;

//displays the image of the helmet
  this.display = function() {
    image(helmetImg, this.x, this.y, _size, _size);
  }

//make the helmet stick on the player and move togheter with him
  this.move = function() {
    this.x = player.x;
    this.y = player.y - _size/3;
  }

//helmet dragged
  this.dragged = function() {
    this.x = mouseX;
    this.y = mouseY;
  }
  //helmet released, it returns in the starting place if it isn't on the player
  this.released = function() {
    if (helmetPlaced == false) {
      if (this.x >= player.x - player.wdth / 2 && this.x <= player.x + player.wdth / 2 &&
        this.y >= player.y - player.hght / 2 && this.y <= player.y + player.hght / 2) {
        helmetPlaced = true;
      } else {
        this.x = _x;
        this.y = _y;
      }
    }
  }
}

//when the mouse is dragged calls the dragged method for the helmet
function mouseDragged() {
  if (helmetPlaced == false){
  helmet.dragged();
  }
  return false;
}
//when the mouse is released calls the released method for the helmet
function mouseReleased() {
  helmet.released();
}
