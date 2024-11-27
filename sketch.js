let font;
let tSize = 150; // size of text
let tposX, tposY;
let pointCount = 0.8; // 0-1; 0 = few particles, 1 = more particles

let speed = 2; // speed of particles
let dia = 100; // diameter of interaction
let randomPos = true; // start particles at random positions
let pointsDirection = "down"; // initial direction for points

let textPoints = [];
let currentWord = "home"; // starting word
let targetWord = "projects"; // new word after explosion
let isExploded = false; // track if the particles are exploded
let targetPoints = []; // target points for the new word

let soundEffect1, soundEffect2, soundEffect3;
let soundIndex = 0; // Track the current sound

// New variable for suction strength
let suctionStrength = 0.3; // Default suction strength (adjust this to control suction power)

let button;

function preload() {
  font = loadFont("AvenirNextLTPro-Demi.otf");

  // Load the sounds
  soundEffect1 = loadSound("scale-c6-106131.mp3");
  soundEffect2 = loadSound("scale-d6-106129.mp3");
  soundEffect3 = loadSound("scale-f6-106128.mp3");
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  // Set initial text position to center of the canvas
  centerText(); 

  setupTextPoints(currentWord); // Setup initial particles for "home"

  // Create button
  button = createButton('Go to website');
  button.position(width / 2 - 100, height - 100); // Place the button below the text
  button.size(200, 60); // Make the button bigger
  button.mousePressed(handleButtonClick); // Attach the event to the button
}

function centerText() {
  // Recalculate the center position of the text dynamically
  tposX = width / 2 - textWidth(currentWord) / 2;
  tposY = height / 2 + tSize / 2.9;
}

function setupTextPoints(word) {
  textPoints = []; // reset text points
  let points = font.textToPoints(word, tposX, tposY, tSize, {
    sampleFactor: pointCount,
  });

  for (let i = 0; i < points.length; i++) {
    let pt = points[i];
    let textPoint = new Interact(pt.x, pt.y, speed, dia, randomPos, pointsDirection);
    textPoints.push(textPoint);
  }

  // Store target points for the next word (e.g., "projects")
  if (word === "projects") {
    targetPoints = points; // Set target points for "projects"
  } else if (word === "contact") {
    targetPoints = points; // Set target points for "contact"
  }
}

function draw() {
  background(29, 60, 110);

  // Draw vacuum cursor
  if (isExploded) {
    cursor('url(vacuum-cursor.png), auto'); // Set custom vacuum cursor
  } else {
    cursor(ARROW); // Set default cursor before explosion
  }

  for (let i = 0; i < textPoints.length; i++) {
    let v = textPoints[i];
    v.update();
    v.show();

    if (!isExploded) {
      v.follow(mouseX, mouseY); // Follow the mouse before explosion
    } else {
      // Suck particles towards the mouse after explosion (vacuum effect)
      v.suckTowards(mouseX, mouseY); // Suck particles to the vacuum (mouse)
    }
  }
}

function mousePressed() {
  // Trigger explosion when mouse is pressed for the first time
  if (!isExploded) {
    isExploded = true; // Activate explosion effect
    for (let i = 0; i < textPoints.length; i++) {
      textPoints[i].explode(); // Make particles explode
    }
    // Cycle sound effects
    if (soundIndex === 0) {
      soundEffect1.play();
    } else if (soundIndex === 1) {
      soundEffect2.play();
    } else if (soundIndex === 2) {
      soundEffect3.play();
    }
    soundIndex = (soundIndex + 1) % 3; // This will cycle through 0, 1, 2
  } else {
    // After the explosion, change the word (cycle through words)
    if (currentWord === "home") {
      currentWord = "projects";
      setupTextPoints(currentWord); // Set up particles for "projects"
    } else if (currentWord === "projects") {
      currentWord = "contact";
      setupTextPoints(currentWord); // Set up particles for "contact"
    } else {
      currentWord = "home";
      setupTextPoints(currentWord); // Reset particles to "home"
    }
    isExploded = false; // Reset exploded state to start moving particles back
  }
}

function keyPressed() {
  if (key === 'r' || key === 'R') {
    // Reset and restart the text explosion effect when the user presses 'r'
    isExploded = false;
    setupTextPoints(currentWord); // Reset particles to their original position
  }
}

function handleButtonClick() {
  // Check if the current word is "home"
  if (currentWord === "home") {
    // Open IKEA website in a new tab
    window.open("https://www.ikea.com/es/es/", "_blank");
  } 
  // Check if the current word is "projects"
  else if (currentWord === "projects") {
    // Open Justine Soulie website in a new tab
    window.open("https://justinesoulie.fr/", "_blank");
  }
  // Check if the current word is "contact"
  else if (currentWord === "contact") {
    // Open Trevor Carlee Art contact page in a new tab
    window.open("https://www.trevorcarleeart.com/contact", "_blank");
  }
  else {
    // Change the word if it's neither "home" nor "projects" nor "contact"
    changeWord();
  }
}

function changeWord() {
  if (currentWord === "home") {
    currentWord = "projects";
    setupTextPoints(currentWord); // Set up particles for "projects"
  } else if (currentWord === "projects") {
    currentWord = "contact";
    setupTextPoints(currentWord); // Set up particles for "contact"
  } else {
    currentWord = "home";
    setupTextPoints(currentWord); // Reset particles to "home"
  }
}

function Interact(x, y, m, d, t, di) {
  this.home = createVector(x, y); // store the original position of the particle
  this.pos = this.home.copy();
  this.vel = createVector();
  this.acc = createVector();
  this.r = 8;
  this.maxSpeed = m;
  this.maxForce = 1;
  this.dia = d;
  this.exploded = false; // track if particle is exploded
}

Interact.prototype.update = function () {
  this.pos.add(this.vel);
  this.vel.add(this.acc);
  this.acc.mult(0);
};

Interact.prototype.follow = function (mx, my) {
  if (this.exploded) return; // Skip following if exploded
  let target = createVector(mx, my);
  let force = p5.Vector.sub(target, this.pos);
  force.setMag(0.1); // Speed of particles following the mouse
  this.applyForce(force);
};

Interact.prototype.explode = function () {
  this.exploded = true;
  let angle = random(TWO_PI);
  let force = createVector(cos(angle), sin(angle));
  force.mult(random(1, 5)); // random explosion force
  this.applyForce(force);
};

Interact.prototype.suckTowards = function (mx, my) {
  // Vacuum effect: particles are pulled towards the mouse
  let target = createVector(mx, my);
  let force = p5.Vector.sub(target, this.pos);
  force.setMag(suctionStrength); // Use the suction strength variable
  this.applyForce(force);
};

Interact.prototype.applyForce = function (f) {
  this.acc.add(f);
};

Interact.prototype.show = function () {
  stroke(255);
  strokeWeight(4);
  point(this.pos.x, this.pos.y);
};

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  centerText(); // Recalculate the text position on window resize
  setupTextPoints(currentWord); // Recreate the particles after resizing
}
