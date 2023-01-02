const canvas = document.getElementById('c')
const ctx = canvas.getContext('2d')

let width = canvas.width = window.innerWidth
let height = canvas.height = window.innerHeight

let isDragging = false

/* Helper functions */
const clamp = (val, min, max) => (
  Math.min(Math.max(min, val), max)
)

const dist = (obj1, obj2) => (
  Math.sqrt((obj1.y - obj2.y) ** 2 + (obj1.x - obj2.x) ** 2)
)

const angleTo = (obj1, obj2) => (
  Math.atan2((obj1.y - obj2.y), (obj1.x - obj2.x))
)

const rand = (min, max) => (
  Math.floor((Math.random() * (max - min + 1)) + min)
)

/* Element classes */
class Circle {
  constructor(x, y, r, c) {
    this.r = r
    this.color = c || 'orange'
    this.x = x; this.y = y
    this.vx = this.vy = 0
  }

  draw() {
    const { x, y, r, color } = this
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fillStyle = color
    ctx.fill()
    ctx.closePath()
  }

  _bounded() {
    const { x, y, r } = this
    this.x = clamp(x, r, width - r)
    this.y = clamp(y, r, height - r)
  }

  update(fn, bound) {
    if (fn) fn.call(this, this)
    if (bound) this._bounded()
    this.draw()
  }
}

/* controllable params */
// ...constant variables that won't change on runtime

/* environmental vars */
// ...variables that change during runtime

/* canvas elements */
const circles = []


/* Initial set-up */
function init() {
  let circle, intersect
  while (circles.length < 10) {
    circle = new Circle(rand(0, width), rand(0, height), rand(20, 40))
    intersect = false
    for (const circ of circles) {
      if (dist(circ, circle) <= (circ.r + circle.r)) {
        intersect = true
        break
      }
    }

    if (intersect) continue
    circle.vx = circle.vy = rand(3, 7)
    circles.push(circle)
  }
}

/* Main animation routine */
function animate() {
  requestAnimationFrame(animate)
  ctx.clearRect(0, 0, width, height)

  // check collision
  for (const circle of circles)
    circle.color = 'orange'

  let obj1, obj2, mag;
  for (let i = 0; i < circles.length; i++) {
    obj1 = circles[i]

    for (let j = i + 1; j < circles.length; j++) {
      obj2 = circles[j]
      mag = dist(obj1, obj2)

      if (mag <= (obj1.r + obj2.r)) {
        obj1.color = obj2.color = 'darkorange'

        // calculate normal unit vector
        const nx = (obj1.x - obj2.x) / mag,
          ny = (obj1.y - obj2.y) / mag

        // relative velocity
        const dvx = (obj1.vx - obj2.vx),
          dvy = (obj1.vy - obj2.vy)

        // dot product of rel velocity & normal
        const dp = (nx * dvx) + (ny * dvy)

        obj1.vx -= dp * nx
        obj1.vy -= dp * ny
        obj2.vx += dp * nx
        obj2.vy += dp * ny
      }
    }
  }

  // draw elements
  for (const circ of circles) {
    circ.update(function () {
      this.x += this.vx
      this.y += this.vy

      // rebound on edge hit
      const { x, y, r } = this
      if (x < r || x > width - r) this.vx *= -1
      if (y < r || y > height - r) this.vy *= -1
    }, true)

    // draw velocity vector
    ctx.beginPath()
    ctx.moveTo(circ.x, circ.y)
    ctx.lineTo((circ.x + circ.vx * 5), (circ.y + circ.vy * 5))
    ctx.strokeStyle = '#333'
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.closePath()
  }
}

init()
animate()

/* Event Listeners */
window.addEventListener('resize', () => {
  width = canvas.width = window.innerWidth
  height = canvas.height = window.innerHeight
})