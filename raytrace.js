const materials = {
    'water': 1.333,
    'air': 1,
    'glass': 1.5,
    'acrylic': 1.490
};
const materialColors = {
    'water': '#0022cc88',
    'air': '#ffffff11',
    'glass': '#00558899',
    'acrylic': '#88888899'
}
const shapes = {
    circle: class Circle {
        constructor(material, x, y, radius) {
            this.x = x;
            this.y = y;
            this.radius = radius;
            this.material = material;
        }

        isPointInside(x, y) {
            return Math.sqrt((this.x - x) ** 2 + (this.y - y) ** 2) <= this.radius;
        }

        angleAt(x, y) {
            x -= this.x;
            y -= this.y;
            return Math.atan2(y, x);
        }

        draw(ctx) {
            ctx.fillStyle = materialColors[this.material];
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#00000088';
            // ctx.stroke();
        }
    },
    rect: class rect {
        constructor(material, x, y, width, height) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.material = material;
        }

        isPointInside(x, y) {
            return x >= this.x && x <= this.x + this.width && y >= this.y && y <= this.y + this.height;
        }

        angleAt(x, y) {
            let diffX = x - (this.x + this.width / 2);
            let diffY = y - (this.y + this.height / 2);
            let orientation = Math.atan2(diffY, diffX);
            if (orientation > Math.PI * .75 || orientation < -Math.PI * .75) {
                return -Math.PI;
            } else if (orientation > Math.PI * .25) {
                return Math.PI * .5;
            } else if (orientation > -Math.PI * .25) {
                return 0;
            } else {
                return -Math.PI * .5;
            }
        }

        draw(ctx) {
            ctx.fillStyle = materialColors[this.material];
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.strokeStyle = '#00000088';
            ctx.strokeRect(this.x, this.y, this.width, this.height);
        }
    }
};
let o = Math.asin;
Math.asin = function (x) {
    if (x < 1 && x > -1) {
        return o(x);
    } else {
        while (x > 1) {
            x -= 1;
        }
        while (x < -1) {
            x += 1;
        }
        return o(x);
    }
};
// water circle 250 250 60
// water circle 380 250 60
// glass circle 50 50 30
// acrylic circle 100 90 30
// acrylic rect 400 400 20 20
let sceneString = `
`.trim();
for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
        if (Math.random() > 0.5) sceneString += `${['water', 'glass', 'acrylic'][Math.floor(Math.random() * 3)]} circle ${i * 45 + 50 + Math.random() * 5} ${j * 45 + 50 + Math.random() * 5} ${20}\n`;
    }
}
const scene = sceneString.split('\n').map(x => x.split(' ')).map(([material, shape, ...args]) => {
    return new (shapes[shape] || shapes.circle)(material, ...args.map(parseFloat));
});

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
function isInvalid(value) {
    return isNaN(value) || !isFinite(value);
}
class Ray {
    constructor(x, y, angle) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.dx = Math.cos(angle);
        this.dy = Math.sin(angle);
        this.positions = [[x, y]];
        this.inside = new Map();
    }

    step(ctx, draw = true) {
        this.x += this.dx / 3;
        this.y += this.dy / 3;
        if (isInvalid(this.x) || isInvalid(this.y)) {
            debugger;
        }
        for (let i = 0; i < scene.length; i++) {
            let alreadyInside = this.inside.get(scene[i]);
            if (scene[i].isPointInside(this.x, this.y)) {
                if (!alreadyInside) {
                    while (scene[i].isPointInside(this.x, this.y)) {
                        this.x -= this.dx / 10;
                        this.y -= this.dy / 10;
                    }
                    this.x += this.dx / 10;
                    this.y += this.dy / 10;
                    let normal = scene[i].angleAt(this.x, this.y);
                    let diff = Math.atan2(Math.sin(this.angle - normal), Math.cos(this.angle - normal));
                    let currentMaterial = 1;
                    for (let [object, isInside] of this.inside) {
                        if (isInside) {
                            currentMaterial = materials[object.material];
                        }
                    }
                    // Refraction
                    let newAngle = (normal + Math.PI) + Math.asin(Math.sin(-diff) * currentMaterial / materials[scene[i].material]);
                    this.dx = Math.cos(newAngle);
                    this.dy = Math.sin(newAngle);

                    this.angle = newAngle;
                    this.inside.set(scene[i], true);
                    this.positions.push([this.x, this.y]);
                }
            } else {
                if (alreadyInside) {
                    let normal = scene[i].angleAt(this.x, this.y) + Math.PI;
                    // console.log(normal);
                    if (isInvalid(normal) || typeof normal === 'undefined') {
                        debugger;
                    }
                    let diff = Math.atan2(Math.sin(this.angle - normal), Math.cos(this.angle - normal));
                    // console.log(diff);
                    if (isInvalid(normal) || typeof normal === 'undefined') {
                        debugger;
                    }
                    this.inside.set(scene[i], false);
                    if (isInvalid(normal) || typeof normal === 'undefined') {
                        debugger;
                    }
                    // let currentMaterial = 1;
                    // for (let [object, isInside] of this.inside) {
                    // if (isInside) {
                    // currentMaterial = materials[object.material];
                    // }
                    // }
                    // Refraction
                    let newAngle = (normal + Math.PI) + Math.asin(Math.sin(-diff) * materials[scene[i].material] / 1);
                    if (isInvalid(normal) || typeof normal === 'undefined') {
                        debugger;
                    }
                    // console.log(normal);
                    this.dx = Math.cos(newAngle);
                    if (isInvalid(normal) || typeof normal === 'undefined') {
                        debugger;
                    }
                    // console.log(normal);
                    this.dy = Math.sin(newAngle);
                    if (isInvalid(normal) || typeof normal === 'undefined') {
                        debugger;
                    }
                    if (isInvalid(this.dx) || isInvalid(this.dy)) {
                        // console.log(normal);
                        // console.log(diff);
                        debugger;
                    }
                    this.angle = newAngle;
                    this.positions.push([this.x, this.y]);
                }
            }
        }
        if (draw) {
            ctx.strokeStyle = 'white';
            ctx.globalAlpha = 0.02;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(this.positions[0][0], this.positions[0][1]);
            for (let i = 0; i < this.positions.length; i++) {
                ctx.lineTo(this.positions[i][0], this.positions[i][1]);
            }
            ctx.lineTo(this.x, this.y);
            ctx.stroke();
            ctx.globalAlpha = 1;
        }
    }
}
let rays = [
];
for (let i = -5000; i < 5000; i++) {
    rays.push(new Ray(0, 0, Math.PI / 4 + Math.PI / 25000 * i));
}
function step() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    rays.forEach(ray => ray.step(ctx, false));
    rays.forEach(ray => ray.step(ctx, false));
    rays.forEach(ray => ray.step(ctx, false));
    rays.forEach(ray => ray.step(ctx, false));
    rays.forEach(ray => ray.step(ctx, false));
    rays.forEach(ray => ray.step(ctx, false));
    rays.forEach(ray => ray.step(ctx, false));
    rays.forEach(ray => ray.step(ctx, false));
    rays.forEach(ray => ray.step(ctx, false));
    rays.forEach(ray => ray.step(ctx, false));
    rays.forEach(ray => ray.step(ctx, false));
    rays.forEach(ray => ray.step(ctx, false));
    rays.forEach(ray => ray.step(ctx));
    for (let i = 0; i < scene.length; i++) {
        scene[i].draw(ctx);
    }
}

setInterval(step, 1);