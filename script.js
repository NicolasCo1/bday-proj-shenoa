const entryScreen = document.getElementById('entryScreen');
const enterBtn = document.getElementById('enterBtn');
const mainContent = document.getElementById('mainContent');
const bgMusic = document.getElementById('bgMusic');
const openDateBtn = document.getElementById('openDateBtn');
const dateReveal = document.getElementById('dateReveal');
const yesBtn = document.getElementById('yesBtn');
const noBtn = document.getElementById('noBtn');
const finalMessage = document.getElementById('finalMessage');
const canvas = document.getElementById('confettiCanvas');
const ctx = canvas.getContext('2d');

function openMainPage() {
  entryScreen.classList.add('is-hidden');
  mainContent.classList.add('is-visible');
  mainContent.removeAttribute('aria-hidden');

  bgMusic.volume = 0.16;
  bgMusic.play().catch(() => {
    // Some browsers may still block audio. The page works even if playback is denied.
  });

  setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 120);
}

enterBtn.addEventListener('click', openMainPage);

openDateBtn.addEventListener('click', () => {
  dateReveal.classList.add('is-open');
  openDateBtn.textContent = 'Fecha abierta';
  openDateBtn.disabled = true;
  setTimeout(() => dateReveal.scrollIntoView({ behavior: 'smooth', block: 'center' }), 180);
});

const targetDate = new Date('2026-07-08T00:00:00-05:00').getTime();

function pad(value) {
  return String(value).padStart(2, '0');
}

function updateCountdown() {
  const now = Date.now();
  const diff = targetDate - now;

  const days = document.getElementById('days');
  const hours = document.getElementById('hours');
  const minutes = document.getElementById('minutes');
  const seconds = document.getElementById('seconds');

  if (diff <= 0) {
    days.textContent = '00';
    hours.textContent = '00';
    minutes.textContent = '00';
    seconds.textContent = '00';
    return;
  }

  const totalSeconds = Math.floor(diff / 1000);
  days.textContent = pad(Math.floor(totalSeconds / 86400));
  hours.textContent = pad(Math.floor((totalSeconds % 86400) / 3600));
  minutes.textContent = pad(Math.floor((totalSeconds % 3600) / 60));
  seconds.textContent = pad(totalSeconds % 60);
}

updateCountdown();
setInterval(updateCountdown, 1000);

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.18 });

document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

function moveNoButton() {
  const parent = noBtn.parentElement;
  const parentRect = parent.getBoundingClientRect();
  const btnRect = noBtn.getBoundingClientRect();
  const maxX = Math.max(parentRect.width - btnRect.width, 0);
  const maxY = Math.max(parentRect.height - btnRect.height, 0);
  const x = Math.random() * maxX;
  const y = Math.random() * maxY;

  noBtn.classList.add('moving');
  noBtn.style.left = `${x}px`;
  noBtn.style.top = `${y}px`;
}

noBtn.addEventListener('pointerenter', moveNoButton);
noBtn.addEventListener('click', (event) => {
  event.preventDefault();
  moveNoButton();
});
noBtn.addEventListener('touchstart', (event) => {
  event.preventDefault();
  moveNoButton();
}, { passive: false });

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

let particles = [];
let animationFrame = null;

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function createParticles() {
  const shapes = ['♥', '♡', '✦'];
  const count = window.innerWidth < 600 ? 90 : 150;
  particles = Array.from({ length: count }, () => ({
    x: window.innerWidth / 2 + randomBetween(-80, 80),
    y: window.innerHeight * 0.55 + randomBetween(-60, 30),
    vx: randomBetween(-6, 6),
    vy: randomBetween(-11, -4),
    gravity: randomBetween(0.12, 0.24),
    rotation: randomBetween(0, Math.PI * 2),
    rotationSpeed: randomBetween(-0.12, 0.12),
    size: randomBetween(14, 30),
    life: randomBetween(90, 150),
    shape: shapes[Math.floor(Math.random() * shapes.length)],
    color: Math.random() > 0.5 ? '#ffc9df' : '#ff8ebd'
  }));
}

function drawParticles() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  particles = particles.filter((p) => p.life > 0);

  particles.forEach((p) => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += p.gravity;
    p.rotation += p.rotationSpeed;
    p.life -= 1;

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.globalAlpha = Math.max(p.life / 120, 0);
    ctx.fillStyle = p.color;
    ctx.font = `${p.size}px Georgia, serif`;
    ctx.fillText(p.shape, 0, 0);
    ctx.restore();
  });

  if (particles.length > 0) {
    animationFrame = requestAnimationFrame(drawParticles);
  } else {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    animationFrame = null;
  }
}

function launchConfetti() {
  if (animationFrame) cancelAnimationFrame(animationFrame);
  resizeCanvas();
  createParticles();
  drawParticles();
}

yesBtn.addEventListener('click', () => {
  finalMessage.classList.add('is-visible');
  launchConfetti();
  yesBtn.textContent = 'Confirmado';
  yesBtn.disabled = true;
  noBtn.style.display = 'none';
  setTimeout(() => finalMessage.scrollIntoView({ behavior: 'smooth', block: 'center' }), 200);
});
