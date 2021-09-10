// DOM Refenrences

const canvas = document.querySelector("canvas");

const xDOM = document.querySelector("#dxdt");
const yDOM = document.querySelector("#dydt");

const vibrationDOM = document.querySelector("#vibração");
const velocityDOM = document.querySelector("#velocidade");
const nParticlesDOM = document.querySelector("#n-particles");
const sideDOM = document.querySelector("#side");

const velocitySpan = document.querySelector("#velocity-span");
const nParticlesSpan = document.querySelector("#n-particles-span");
const areaSpan = document.querySelector("#area-span");

UpdateCanvasSize();

// Global Variables
let expX = xDOM.value; // expression for dx/dt
let expY = yDOM.value; // expression for dy/dt

let compX = math.compile(expX);
let compY = math.compile(expY);

let particles = [];
let respawn = false;
let zoom = 1;
let n = nParticlesDOM.value - 0;
let particlesSquareSide = sideDOM.value - 0;
let randomness = vibrationDOM.value - 0;
let frameCounter = 0;
let isRunning = false;
let particleVelMult = velocityDOM.value - 0;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
camera.position.z = 4;
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(canvas.width, canvas.height);

const particleGeometry = new THREE.PlaneBufferGeometry(0.02, 0.02);
const particleTexture = new THREE.MeshBasicMaterial({ color: 0xff00ff });

const vertexShader = `
out vec2 v_uv;

void main () {
	v_uv = uv;
	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;
const fragmentShader = `
precision highp float;

in vec2 v_uv;

void main () {
	// float c = smoothstep(1.0,0.9,length(v_uv*2.0-vec2(1.0)) );
	gl_FragColor = vec4( 1.0,1.0,1.0, 1.0);
}`;

const particleMaterial = new THREE.ShaderMaterial({
	vertexShader, fragmentShader, transparent: true
})

// Callbacks

function getSide(event) {
	particlesSquareSide = sideDOM.value - 0;
	areaSpan.innerText = particlesSquareSide + "";
}
function getNParticles(event) {
	n = nParticlesDOM.value - 0;
	nParticlesSpan.innerText = n + "";
}
function getRandomness(event) {
	randomness = vibrationDOM.value - 0;
}
function getVelocity(event) {
	particleVelMult = velocityDOM.value - 0;
	velocitySpan.innerText = particleVelMult + "";
}
function SetNewExpression(event) {
	expX = xDOM.value;
	expY = yDOM.value;
	try {
		compX = math.compile(expX);
		compY = math.compile(expY);
	} catch (error) {
		alert(error);
	}
}
function Zooming(event) {
	zoom -= event.deltaY * zoom / 1000;
	camera.position.z += event.deltaY *camera.position.z / 500;
	if (camera.position.z < 1) {
		camera.position.z = 1;
	}
	else if (camera.position.z > 10) {
		camera.position.z = 10
	}
}
function Reset(event) {
	scene.clear();
	compX = math.compile("0");
	compY = math.compile("0");
	for (let y = -particlesSquareSide/2; y < particlesSquareSide/2; y += particlesSquareSide/n) {
		for (let x = -particlesSquareSide/2; x < particlesSquareSide/2; x += particlesSquareSide/n) {
			let p = new Particle(x, y, particleGeometry, particleMaterial)
			scene.add(p);
		}
	}
}
function UpdateCanvasSize() {
	canvas.width = 500;
	canvas.height = 500;
	if (innerWidth < 520) {
		canvas.width = innerWidth - 20;
		canvas.height = innerWidth - 20;
	}
}

// Classes 

class Particle extends THREE.Mesh {
	constructor(x, y, geometry, texture) {
		super(geometry, texture);
		this.position.x = x;
		this.position.y = y;
		this.velocity = { x: 0, y: 0 };
		this.lifeTime = (respawn)?180:Infinity;
	}
	onAfterRender(renderer, scene, camera, geometry, material, group) {

		this.position.x += this.velocity.x * particleVelMult / 60 + (1-Math.random()*2)*randomness/10000;
		this.position.y += this.velocity.y * particleVelMult / 60 + (1-Math.random()*2)*randomness/10000;

		this.lifeTime--;
		if (this.lifeTime === 0) {
			scene.remove(this);
		}

		this.velocity.x = compX.evaluate({ x: this.position.x, y: this.position.y });
		this.velocity.y = compY.evaluate({ x: this.position.x, y: this.position.y });
	}
}

function Animate() {

	renderer.render(scene, camera);
	frameCounter = requestAnimationFrame(Animate);
}
Reset();
Animate();