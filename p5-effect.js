let _dots = [];

function setup() {
  let cnv = createCanvas(windowWidth, windowHeight);
  cnv.style("position", "fixed");
  cnv.style("top", "0");
  cnv.style("left", "0");
  cnv.style("z-index", "-1");
  cnv.style("pointer-events", "none");

  for (let i = 0; i < 80; i++) {
    _dots.push(new Particle());
  }
}

function draw() {
  clear();
  let isDark = document.body.classList.contains("dark-mode");
  let pCol = isDark ? color(255, 255, 255, 100) : color(88, 101, 242, 120);
  let lCol = isDark ? color(255, 255, 255, 30) : color(88, 101, 242, 50);

  _dots.forEach((p, index) => {
    p.update();
    p.show(pCol);
    p.connect(_dots.slice(index), lCol);
  });
}

class Particle {
  constructor() {
    this.pos = createVector(random(width), random(height));
    this.vel = createVector(random(-0.6, 0.6), random(-0.6, 0.6));

    this.angle = random(TWO_PI);
    this.orbitRadius = random(50, 100);
    this.orbitSpeed = random(0.02, 0.05);
  }

  update() {
    let mouseDist = dist(mouseX, mouseY, this.pos.x, this.pos.y);

    if (mouseDist < 200) {
      let targetX = mouseX + cos(this.angle) * this.orbitRadius;
      let targetY = mouseY + sin(this.angle) * this.orbitRadius;

      this.pos.x = lerp(this.pos.x, targetX, 0.05);
      this.pos.y = lerp(this.pos.y, targetY, 0.05);

      this.angle += this.orbitSpeed;
    } else {
      this.pos.add(this.vel);

      if (this.pos.x < 0 || this.pos.x > width) this.vel.x *= -1;
      if (this.pos.y < 0 || this.pos.y > height) this.vel.y *= -1;
    }
  }

  show(c) {
    noStroke();
    fill(c);
    circle(this.pos.x, this.pos.y, 4);
  }

  connect(others, c) {
    others.forEach((o) => {
      let d = dist(this.pos.x, this.pos.y, o.pos.x, o.pos.y);
      if (d < 150) {
        stroke(c);
        strokeWeight(1);
        line(this.pos.x, this.pos.y, o.pos.x, o.pos.y);
      }
    });
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
