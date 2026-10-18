import * as THREE from 'three';

// ==========================================
// 1. 頂級戰鬥音效合成器 (Web Audio API)
// ==========================================
class SoundSynthesizer {
  constructor() {
    this.ctx = null;
    this.humOsc = null;
    this.humGain = null;
    this.isHumming = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // 聚氣嗡鳴音
  startChargeHum(ratio) {
    if (!this.ctx) return;
    if (!this.isHumming) {
      this.humOsc = this.ctx.createOscillator();
      this.humGain = this.ctx.createGain();
      this.humOsc.type = 'sawtooth';
      this.humOsc.frequency.setValueAtTime(100, this.ctx.currentTime);
      
      this.filter = this.ctx.createBiquadFilter();
      this.filter.type = 'lowpass';
      this.filter.frequency.setValueAtTime(250, this.ctx.currentTime);

      this.humOsc.connect(this.filter);
      this.filter.connect(this.humGain);
      this.humGain.connect(this.ctx.destination);
      
      this.humGain.gain.setValueAtTime(0.01, this.ctx.currentTime);
      this.humOsc.start();
      this.isHumming = true;
    }

    const t = this.ctx.currentTime;
    const targetFreq = 120 + ratio * 380;
    const targetFilter = 300 + ratio * 1200;
    const targetGain = 0.05 + ratio * 0.15;
    
    this.humOsc.frequency.setTargetAtTime(targetFreq, t, 0.05);
    this.filter.frequency.setTargetAtTime(targetFilter, t, 0.05);
    this.humGain.gain.setTargetAtTime(targetGain, t, 0.05);
  }

  stopChargeHum() {
    if (this.isHumming && this.humGain && this.ctx) {
      this.humGain.gain.setTargetAtTime(0.001, this.ctx.currentTime, 0.08);
      setTimeout(() => {
        if (this.humOsc) {
          try { this.humOsc.stop(); } catch (e) {}
          this.humOsc.disconnect();
          this.humOsc = null;
        }
        this.isHumming = false;
      }, 100);
    }
  }

  // 氣功波發射爆音
  playBeamBlast() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    const bassOsc = this.ctx.createOscillator();
    const bassGain = this.ctx.createGain();
    bassOsc.type = 'sine';
    bassOsc.frequency.setValueAtTime(170, t);
    bassOsc.frequency.exponentialRampToValueAtTime(35, t + 0.6);
    bassGain.gain.setValueAtTime(0.4, t);
    bassGain.gain.exponentialRampToValueAtTime(0.01, t + 0.8);
    bassOsc.connect(bassGain);
    bassGain.connect(this.ctx.destination);
    bassOsc.start(t);
    bassOsc.stop(t + 0.8);

    const zapOsc = this.ctx.createOscillator();
    const zapGain = this.ctx.createGain();
    zapOsc.type = 'sawtooth';
    zapOsc.frequency.setValueAtTime(850, t);
    zapOsc.frequency.exponentialRampToValueAtTime(160, t + 0.5);
    zapGain.gain.setValueAtTime(0.25, t);
    zapGain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);
    zapOsc.connect(zapGain);
    zapGain.connect(this.ctx.destination);
    zapOsc.start(t);
    zapOsc.stop(t + 0.5);
  }

  // 目標粉碎爆炸音
  playDestruction() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.45;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(500, t);
    filter.frequency.exponentialRampToValueAtTime(60, t + 0.4);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.45, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.45);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(t);
    noise.stop(t + 0.45);
  }

  // 多重鎖定提示音 (爬升和弦)
  playMultiLock(index = 0) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const freqs = [980, 1220, 1480, 1800, 2200, 2600];
    const baseFreq = freqs[Math.min(index, freqs.length - 1)];
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, t);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.25, t + 0.1);
    gain.gain.setValueAtTime(0.28, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.12);
  }

  // 分裂導彈齊射嘯聲
  playSalvoLaunch(count = 1) {
    if (!this.ctx) return;
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(450 + i * 90, t);
        osc.frequency.exponentialRampToValueAtTime(1400 + i * 160, t + 0.28);
        gain.gain.setValueAtTime(0.22, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.3);
      }, i * 50);
    }
  }

  // ⚡ 食指居合彈反金屬撞擊音 (鏘！！！清脆極致)
  playDeflect() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    
    // 主金屬碰擊音
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(2400, t);
    osc1.frequency.exponentialRampToValueAtTime(800, t + 0.25);
    gain1.gain.setValueAtTime(0.5, t);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    osc1.connect(gain1);
    gain1.connect(this.ctx.destination);
    osc1.start(t);
    osc1.stop(t + 0.35);

    // 高頻清脆金屬泛音 (Bell ping)
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(3600, t);
    osc2.frequency.exponentialRampToValueAtTime(1800, t + 0.4);
    gain2.gain.setValueAtTime(0.4, t);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
    osc2.connect(gain2);
    gain2.connect(this.ctx.destination);
    osc2.start(t);
    osc2.stop(t + 0.45);
  }

  // 敵方雷射發射音
  playEnemyShoot() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(750, t);
    osc.frequency.exponentialRampToValueAtTime(140, t + 0.22);
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.25);
  }

  // 玩家受擊重音
  playPlayerHit() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.3);
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.35);
  }

  // BOSS 出場防空警報音
  playBossAlert() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    for (let i = 0; i < 3; i++) {
      const startT = t + i * 0.7;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(340, startT);
      osc.frequency.linearRampToValueAtTime(220, startT + 0.35);
      osc.frequency.linearRampToValueAtTime(340, startT + 0.65);
      gain.gain.setValueAtTime(0.3, startT);
      gain.gain.linearRampToValueAtTime(0.01, startT + 0.68);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(startT);
      osc.stop(startT + 0.68);
    }
  }

  // 關卡勝利和弦
  playStageClear() {
    if (!this.ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C, E, G, High C
    const t = this.ctx.currentTime;
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.12);
      gain.gain.setValueAtTime(0.3, t + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.01, t + idx * 0.12 + 0.6);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + idx * 0.12);
      osc.stop(t + idx * 0.12 + 0.6);
    });
  }

  // Game Over 悲壯音
  playGameOver() {
    if (!this.ctx) return;
    const notes = [440, 415, 392, 349];
    const t = this.ctx.currentTime;
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t + idx * 0.25);
      gain.gain.setValueAtTime(0.25, t + idx * 0.25);
      gain.gain.exponentialRampToValueAtTime(0.01, t + idx * 0.25 + 0.5);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + idx * 0.25);
      osc.stop(t + idx * 0.25 + 0.5);
    });
  }
}

const sound = new SoundSynthesizer();

// ==========================================
// 2. 遊戲狀態與 DOM 物件
// ==========================================
const videoEl = document.getElementById('webcam');
const canvas3d = document.getElementById('ar-canvas');
const debugCanvas = document.getElementById('hand-debug-canvas');
const debugCtx = debugCanvas.getContext('2d');

const statusEl = document.getElementById('tracking-status');
const scoreEl = document.getElementById('score-counter');
const chargeBarEl = document.getElementById('charge-bar-fill');
const chargePercentEl = document.getElementById('charge-percent');
const guideIconEl = document.getElementById('guide-icon');
const guideTextEl = document.getElementById('guide-text');
const reticleEl = document.getElementById('reticle');

// 關卡與 BOSS 相關 UI
const stageBadge = document.getElementById('stage-badge');
const bossBarContainer = document.getElementById('boss-bar-container');
const bossBarFill = document.getElementById('boss-bar-fill');
const bossHpText = document.getElementById('boss-hp-text');
const bossWarningBanner = document.getElementById('boss-warning-banner');
const enemyIndicatorsContainer = document.getElementById('enemy-indicators-container');

const gameResultOverlay = document.getElementById('game-result-overlay');
const resultTitle = document.getElementById('result-title');
const resultSubtitle = document.getElementById('result-subtitle');
const resultScore = document.getElementById('result-score');
const btnNextStage = document.getElementById('btn-next-stage');
const btnRetry = document.getElementById('btn-retry');

// 玩家與關卡數值
let score = 0;
let currentStage = 1; // 1: 小怪波, 2: 精英波, 3: 大 BOSS
let isStageTransition = false;
let isGameOver = false;

let chargeLevel = 0; // 0 ~ 1.0
let isHandDetected = false;
let palmScreenPos = { x: 0.5, y: 0.5, z: 0 };
let lastPalmZ = 0;
let facingMode = 'environment';
let isFiring = false;
let beamDuration = 0;

let smoothedAimDir = new THREE.Vector3(0, 0, -1);
let targetAimDir = new THREE.Vector3(0, 0, -1);

let lockedTargets = [];
const MAX_LOCKS = 5;
let wasFistState = false;

// 螢幕外敵人導引指示器快取池
const indicatorElements = [];

// ==========================================
// 3. Three.js 3D 渲染場景建置
// ==========================================
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0, 0);

const renderer = new THREE.WebGLRenderer({
  canvas: canvas3d,
  alpha: true,
  antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
dirLight.position.set(2, 5, 2);
scene.add(dirLight);

const kiLight = new THREE.PointLight(0x00f7ff, 0, 8);
scene.add(kiLight);

// ==========================================
// 4. 特效系統：氣功球、氣功柱、瞄準線、食指光刃
// ==========================================
const kiGroup = new THREE.Group();
scene.add(kiGroup);

const orbGeo = new THREE.SphereGeometry(0.12, 24, 24);
const orbMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, wireframe: true, transparent: true, opacity: 0.8 });
const orbMesh = new THREE.Mesh(orbGeo, orbMat);
kiGroup.add(orbMesh);

const ringGeo1 = new THREE.TorusGeometry(0.18, 0.015, 12, 36);
const ringMat1 = new THREE.MeshBasicMaterial({ color: 0xffe600, transparent: true, opacity: 0.8 });
const ringMesh1 = new THREE.Mesh(ringGeo1, ringMat1);
kiGroup.add(ringMesh1);

const ringGeo2 = new THREE.TorusGeometry(0.15, 0.012, 12, 36);
const ringMat2 = new THREE.MeshBasicMaterial({ color: 0x00f7ff, transparent: true, opacity: 0.8 });
const ringMesh2 = new THREE.Mesh(ringGeo2, ringMat2);
kiGroup.add(ringMesh2);

const kiParticleCount = 60;
const kiParticleGeo = new THREE.BufferGeometry();
const kiParticlePos = new Float32Array(kiParticleCount * 3);
for (let i = 0; i < kiParticleCount * 3; i += 3) {
  kiParticlePos[i] = (Math.random() - 0.5) * 0.8;
  kiParticlePos[i + 1] = (Math.random() - 0.5) * 0.8;
  kiParticlePos[i + 2] = (Math.random() - 0.5) * 0.8;
}
kiParticleGeo.setAttribute('position', new THREE.BufferAttribute(kiParticlePos, 3));
const kiParticleMat = new THREE.PointsMaterial({
  color: 0x00ffff,
  size: 0.04,
  transparent: true,
  opacity: 0.9,
  blending: THREE.AdditiveBlending
});
const kiParticles = new THREE.Points(kiParticleGeo, kiParticleMat);
kiGroup.add(kiParticles);
kiGroup.visible = false;

// 氣功波雷射衝擊波
const beamGroup = new THREE.Group();
scene.add(beamGroup);

const beamCoreGeo = new THREE.CylinderGeometry(0.08, 0.22, 18, 16);
beamCoreGeo.rotateX(-Math.PI / 2);
beamCoreGeo.translate(0, 0, -9);
const beamCoreMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95 });
const beamCore = new THREE.Mesh(beamCoreGeo, beamCoreMat);
beamGroup.add(beamCore);

const beamOuterGeo = new THREE.CylinderGeometry(0.2, 0.45, 18, 16);
beamOuterGeo.rotateX(-Math.PI / 2);
beamOuterGeo.translate(0, 0, -9);
const beamOuterMat = new THREE.MeshBasicMaterial({
  color: 0x00f7ff,
  transparent: true,
  opacity: 0.65,
  blending: THREE.AdditiveBlending
});
const beamOuter = new THREE.Mesh(beamOuterGeo, beamOuterMat);
beamGroup.add(beamOuter);

const muzzleRingGeo = new THREE.RingGeometry(0.1, 0.45, 32);
const muzzleRingMat = new THREE.MeshBasicMaterial({
  color: 0xffe600,
  side: THREE.DoubleSide,
  transparent: true,
  opacity: 0.9,
  blending: THREE.AdditiveBlending
});
const muzzleRing = new THREE.Mesh(muzzleRingGeo, muzzleRingMat);
beamGroup.add(muzzleRing);
beamGroup.visible = false;

// 瞄準導引線
const aimLineGeo = new THREE.BufferGeometry();
const aimLinePos = new Float32Array(6);
aimLineGeo.setAttribute('position', new THREE.BufferAttribute(aimLinePos, 3));
const aimLineMat = new THREE.LineBasicMaterial({
  color: 0x00f7ff,
  transparent: true,
  opacity: 0.5,
  blending: THREE.AdditiveBlending
});
const aimLine = new THREE.Line(aimLineGeo, aimLineMat);
scene.add(aimLine);
aimLine.visible = false;

// 多重鎖定框池
const lockReticlePool = [];
for (let i = 0; i < 5; i++) {
  const grp = new THREE.Group();
  const ringGeo = new THREE.RingGeometry(0.52, 0.60, 24);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0xff0044,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  grp.add(ring);

  for (let j = 0; j < 4; j++) {
    const tickGeo = new THREE.PlaneGeometry(0.06, 0.22);
    const tickMat = new THREE.MeshBasicMaterial({ color: 0xff0044, side: THREE.DoubleSide });
    const tick = new THREE.Mesh(tickGeo, tickMat);
    tick.rotation.z = (j * Math.PI) / 2;
    tick.position.set(Math.cos(j * Math.PI / 2) * 0.70, Math.sin(j * Math.PI / 2) * 0.70, 0);
    grp.add(tick);
  }
  grp.visible = false;
  scene.add(grp);
  lockReticlePool.push(grp);
}

// ==========================================
// 5. 分裂導引飛彈系統 (Homing Curve Lasers)
// ==========================================
const activeMissiles = [];

function launchHomingMissiles(palmWorldPos, targetList) {
  sound.playSalvoLaunch(targetList.length);

  targetList.forEach((target, i) => {
    const headGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const headMat = new THREE.MeshBasicMaterial({ color: 0xffe600, transparent: true, opacity: 0.95 });
    const headMesh = new THREE.Mesh(headGeo, headMat);
    headMesh.position.copy(palmWorldPos);

    const curvePoints = 20;
    const trailPositions = new Float32Array(curvePoints * 3);
    for (let p = 0; p < curvePoints * 3; p += 3) {
      trailPositions[p] = palmWorldPos.x;
      trailPositions[p + 1] = palmWorldPos.y;
      trailPositions[p + 2] = palmWorldPos.z;
    }
    const trailGeo = new THREE.BufferGeometry();
    trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
    const trailMat = new THREE.LineBasicMaterial({
      color: (i % 2 === 0) ? 0x00f7ff : 0xff9900,
      linewidth: 3,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });
    const trailMesh = new THREE.Line(trailGeo, trailMat);
    scene.add(headMesh);
    scene.add(trailMesh);

    const angle = (i / targetList.length) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
    const spreadRadius = 1.8 + Math.random() * 0.8;
    const arcOffset = new THREE.Vector3(
      Math.cos(angle) * spreadRadius,
      Math.sin(angle) * spreadRadius + 0.4,
      -0.6
    ).applyQuaternion(camera.quaternion);

    const midPoint = new THREE.Vector3().lerpVectors(palmWorldPos, target.position, 0.42).add(arcOffset);

    activeMissiles.push({
      head: headMesh,
      trail: trailMesh,
      start: palmWorldPos.clone(),
      mid: midPoint,
      target: target,
      progress: 0,
      speed: 2.2 + Math.random() * 0.5,
      history: [palmWorldPos.clone()]
    });
  });
}

function getBezierPoint(p0, p1, p2, t) {
  const oneMinusT = 1 - t;
  return new THREE.Vector3(
    oneMinusT * oneMinusT * p0.x + 2 * oneMinusT * t * p1.x + t * t * p2.x,
    oneMinusT * oneMinusT * p0.y + 2 * oneMinusT * t * p1.y + t * t * p2.y,
    oneMinusT * oneMinusT * p0.z + 2 * oneMinusT * t * p1.z + t * t * p2.z
  );
}

// ==========================================
// 6. 敵人系統：小怪、小BOSS、大BOSS、光彈與彈反
// ==========================================
const targets = [];
const debrisList = [];
const enemyProjectiles = [];
const sparkParticles = [];

// 生成各種類型的敵人
function spawnEnemy(type = 'drone', customPos = null) {
  const enemyGroup = new THREE.Group();
  let maxHp = 1;
  let radius = 0.45;

  if (type === 'drone') {
    // 【小怪】：機動浮游晶石
    maxHp = 1;
    radius = 0.4;
    const geo = new THREE.OctahedronGeometry(0.35, 0);
    const mat = new THREE.MeshStandardMaterial({
      color: 0xff0055,
      roughness: 0.2,
      metalness: 0.8,
      emissive: 0x880022,
      emissiveIntensity: 0.6
    });
    const mesh = new THREE.Mesh(geo, mat);
    enemyGroup.add(mesh);

    const shieldGeo = new THREE.TorusGeometry(0.48, 0.015, 8, 24);
    const shieldMat = new THREE.MeshBasicMaterial({ color: 0x00f7ff, transparent: true, opacity: 0.7 });
    enemyGroup.add(new THREE.Mesh(shieldGeo, shieldMat));
  } else if (type === 'elite') {
    // 【小 BOSS】：雙重旋轉光環精英機
    maxHp = 6;
    radius = 0.65;
    const geo = new THREE.IcosahedronGeometry(0.55, 0);
    const mat = new THREE.MeshStandardMaterial({
      color: 0xffaa00,
      roughness: 0.1,
      metalness: 0.9,
      emissive: 0x663300,
      emissiveIntensity: 0.8
    });
    const mesh = new THREE.Mesh(geo, mat);
    enemyGroup.add(mesh);

    const ring1 = new THREE.Mesh(
      new THREE.TorusGeometry(0.8, 0.02, 12, 32),
      new THREE.MeshBasicMaterial({ color: 0xff0044, transparent: true, opacity: 0.85 })
    );
    const ring2 = new THREE.Mesh(
      new THREE.TorusGeometry(0.68, 0.018, 12, 32),
      new THREE.MeshBasicMaterial({ color: 0xffcc00, transparent: true, opacity: 0.85 })
    );
    enemyGroup.add(ring1);
    enemyGroup.add(ring2);
  } else if (type === 'boss') {
    // 【大 BOSS】：巨型 OMEGA 毀滅星核
    maxHp = 30;
    radius = 1.1;
    const geo = new THREE.DodecahedronGeometry(0.9, 0);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x8800ff,
      roughness: 0.15,
      metalness: 0.95,
      emissive: 0x440088,
      emissiveIntensity: 0.9
    });
    const mesh = new THREE.Mesh(geo, mat);
    enemyGroup.add(mesh);

    // 4 顆環繞浮游護盾衛星
    const satGroup = new THREE.Group();
    for (let s = 0; s < 4; s++) {
      const satGeo = new THREE.OctahedronGeometry(0.2, 0);
      const satMat = new THREE.MeshBasicMaterial({ color: 0xff0055 });
      const sat = new THREE.Mesh(satGeo, satMat);
      sat.position.set(Math.cos(s * Math.PI / 2) * 1.5, Math.sin(s * Math.PI / 2) * 1.5, 0);
      satGroup.add(sat);
    }
    enemyGroup.add(satGroup);
    enemyGroup.userData.satGroup = satGroup;
  }

  // 位置配置：緊縮在鏡頭正前方 ±30° (0.52 rad) 舒適視野內，避免刷在死角或轉身看不到的地方
  if (customPos) {
    enemyGroup.position.copy(customPos);
  } else {
    if (type === 'boss') {
      enemyGroup.position.set(0, 0.15, -4.2); // BOSS 居中霸氣降臨
    } else {
      // 水平夾角收斂在 ±28 度以內，高度收斂在 -0.4 ~ +0.5m，距離 3.2m ~ 4.5m，保證一抬手機就在正前方！
      const angle = (Math.random() - 0.5) * 0.95; 
      const height = (Math.random() - 0.5) * 0.8 + 0.1;
      const dist = 3.2 + Math.random() * 1.5;
      enemyGroup.position.set(Math.sin(angle) * dist, height, -Math.cos(angle) * dist);
    }
  }

  Object.assign(enemyGroup.userData, {
    type: type,
    hp: maxHp,
    maxHp: maxHp,
    radius: radius,
    rotSpeedX: (Math.random() - 0.5) * 1.5,
    rotSpeedY: (Math.random() - 0.5) * 2.0,
    baseY: enemyGroup.position.y,
    floatOffset: Math.random() * Math.PI * 2
  });

  scene.add(enemyGroup);
  targets.push(enemyGroup);
  return enemyGroup;
}

// ==========================================
// 螢幕外敵人導航雷達指示器 (Off-screen Enemy Indicator)
// ==========================================
function updateOffscreenIndicators() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const padding = 45; // 螢幕邊緣安全留白

  let indicatorIdx = 0;

  targets.forEach((target) => {
    // 取得敵人在相機視錐中的投影位置
    const targetPos = target.position.clone();
    const proj = targetPos.clone().project(camera);

    // 檢查目標是在相機前方還是後方 (proj.z > 1 代表在相機後方)
    const isBehind = proj.z > 1;

    // 判斷是否在可視畫面內部 (留有 padding 裕度)
    const isInScreen = !isBehind && 
      proj.x >= -0.85 && proj.x <= 0.85 && 
      proj.y >= -0.85 && proj.y <= 0.85;

    // 如果敵人已在螢幕舒適視野中，不需要顯示導引箭頭
    if (isInScreen) return;

    // 如果敵人在相機後方，方向需要水平與垂直反轉以引導玩家轉動視角
    let screenDirX = proj.x;
    let screenDirY = proj.y;
    if (isBehind) {
      screenDirX = -screenDirX;
      screenDirY = -screenDirY;
    }

    // 計算指向敵人的角度
    const angle = Math.atan2(screenDirY, screenDirX);

    // 計算邊緣貼齊座標 (Ray cast 到螢幕矩形邊緣)
    const halfW = (w / 2) - padding;
    const halfH = (h / 2) - padding;

    let edgeX = Math.cos(angle) * halfW;
    let edgeY = Math.sin(angle) * halfH;

    // 依比例縮放至矩形邊界
    const scale = Math.min(
      Math.abs(halfW / (edgeX || 0.0001)),
      Math.abs(halfH / (edgeY || 0.0001))
    );

    const posX = (w / 2) + edgeX * scale;
    // Three.js 投影 y 軸向上為正，螢幕 CSS y 軸向下為正，需反轉
    const posY = (h / 2) - edgeY * scale;

    // 計算旋轉角 (CSS 箭頭指向邊緣外側/目標方向)
    const deg = -angle * (180 / Math.PI);

    // 從指示器池中取出或創建元素
    let el = indicatorElements[indicatorIdx];
    if (!el) {
      el = document.createElement('div');
      el.className = 'offscreen-indicator';
      enemyIndicatorsContainer.appendChild(el);
      indicatorElements.push(el);
    }

    const type = target.userData.type;
    el.className = `offscreen-indicator indicator-${type}`;
    const label = type === 'boss' ? '⚠️ BOSS' : (type === 'elite' ? '⚡ ELITE' : '🎯 敵機');
    
    el.innerHTML = `<span class="indicator-arrow" style="transform: rotate(${deg}deg)">➔</span><span>${label}</span>`;
    el.style.left = `${posX}px`;
    el.style.top = `${posY}px`;
    el.style.display = 'flex';

    indicatorIdx++;
  });

  // 隱藏多餘的指示器標籤
  for (let i = indicatorIdx; i < indicatorElements.length; i++) {
    indicatorElements[i].style.display = 'none';
  }
}

// 破壞目標：扣血與碎裂
function destroyTarget(targetGroup, hitPoint, blastDir, damage = 1) {
  targetGroup.userData.hp -= damage;

  // 更新 BOSS 血條 (若受傷者為 BOSS)
  if (targetGroup.userData.type === 'boss') {
    const pct = Math.max(0, Math.round((targetGroup.userData.hp / targetGroup.userData.maxHp) * 100));
    bossBarFill.style.width = `${pct}%`;
    bossHpText.textContent = `${pct}%`;
  }

  // 尚未死亡：受傷閃爍
  if (targetGroup.userData.hp > 0) {
    sound.playDestruction();
    // 受擊硬直小跳動
    targetGroup.position.addScaledVector(blastDir, 0.2);
    return;
  }

  // 目標徹底陣亡！
  sound.playDestruction();
  score++;
  scoreEl.textContent = score;

  if (navigator.vibrate) navigator.vibrate([80, 40, 150]);

  // 產生 30 塊碎片
  const shardCount = targetGroup.userData.type === 'boss' ? 55 : 30;
  for (let i = 0; i < shardCount; i++) {
    const shardGeo = new THREE.TetrahedronGeometry(0.06 + Math.random() * 0.1);
    const shardMat = new THREE.MeshStandardMaterial({
      color: targetGroup.userData.type === 'boss' ? 0xaa00ff : 0xff4400,
      emissive: 0xff2200,
      emissiveIntensity: 0.8
    });
    const shard = new THREE.Mesh(shardGeo, shardMat);
    shard.position.copy(targetGroup.position);
    
    const speed = 3.0 + Math.random() * 4.5;
    const spread = new THREE.Vector3(
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.3) * 2,
      (Math.random() - 0.5) * 2
    ).normalize();
    const velocity = spread.multiplyScalar(speed).add(blastDir.clone().multiplyScalar(4));

    shard.userData = {
      velocity: velocity,
      rotVel: new THREE.Vector3(Math.random() * 10, Math.random() * 10, Math.random() * 10),
      life: 1.0
    };
    scene.add(shard);
    debrisList.push(shard);
  }

  scene.remove(targetGroup);
  const idx = targets.indexOf(targetGroup);
  if (idx !== -1) targets.splice(idx, 1);

  const lIdx = lockedTargets.indexOf(targetGroup);
  if (lIdx !== -1) lockedTargets.splice(lIdx, 1);

  checkStageCompletion();
}

// ==========================================
// 7. 關卡進程管理 (Stage Progression)
// ==========================================
function startStage(stageNum) {
  currentStage = stageNum;
  isStageTransition = false;
  
  // 清理現有光彈與鎖定
  enemyProjectiles.forEach(p => scene.remove(p.mesh));
  enemyProjectiles.length = 0;
  lockedTargets = [];
  lockReticlePool.forEach(r => r.visible = false);

  if (stageNum === 1) {
    stageBadge.textContent = "STAGE 1 · 偵察小隊";
    bossBarContainer.classList.add('boss-bar-hidden');
    // 生成 4 隻偵察小怪
    for (let i = 0; i < 4; i++) spawnEnemy('drone');
    guideTextEl.textContent = "第一關！瞄準並消滅所有浮游偵察機！";
  } else if (stageNum === 2) {
    stageBadge.textContent = "STAGE 2 · 精英突襲";
    bossBarContainer.classList.add('boss-bar-hidden');
    // 生成 3 隻小怪 + 1 隻精英小 BOSS
    spawnEnemy('elite');
    for (let i = 0; i < 3; i++) spawnEnemy('drone');
    guideTextEl.textContent = "第二關！精英機登場！血量更厚，需多次命中！";
  } else if (stageNum === 3) {
    stageBadge.textContent = "STAGE 3 · BOSS 終局";
    // 觸發全螢幕 BOSS 警報
    sound.playBossAlert();
    bossWarningBanner.classList.remove('hidden');
    setTimeout(() => bossWarningBanner.classList.add('hidden'), 2600);

    // 展開頂部 BOSS 血條
    bossBarContainer.classList.remove('boss-bar-hidden');
    bossBarFill.style.width = '100%';
    bossHpText.textContent = '100%';

    // 召喚巨型 OMEGA BOSS + 2 隻僚機
    spawnEnemy('boss');
    for (let i = 0; i < 2; i++) spawnEnemy('drone');
    guideTextEl.textContent = "⚠️ 破壞神降臨！蓄力出掌，全彈齊射消滅巨型核心！";
  }
}

function checkStageCompletion() {
  if (targets.length === 0 && !isStageTransition && !isGameOver) {
    isStageTransition = true;
    sound.playStageClear();

    if (currentStage < 3) {
      resultTitle.textContent = `🎉 STAGE ${currentStage} CLEAR!`;
      resultSubtitle.textContent = "關卡完成！準備迎戰下一波";
      resultScore.textContent = score;
      btnNextStage.classList.remove('hidden');
      btnRetry.classList.add('hidden');
      gameResultOverlay.classList.remove('hidden');
    } else {
      // 破台通關！
      resultTitle.textContent = "🏆 MISSION ACCOMPLISHED!";
      resultSubtitle.textContent = "恭喜你！成功消滅 OMEGA BOSS，守護現實世界！";
      resultScore.textContent = score;
      btnNextStage.classList.add('hidden');
      btnRetry.classList.remove('hidden');
      gameResultOverlay.classList.remove('hidden');
    }
  }
}

// ==========================================
// 8. 氣功波發射判定 (支援單發與分裂齊射)
// ==========================================
function fireKiBlast() {
  if (chargeLevel < 0.15 && lockedTargets.length === 0 && !isFiring) {
    guideTextEl.textContent = "氣力不足！請先掌心向上托天蓄力";
    return;
  }

  isFiring = true;
  beamDuration = 0.55;
  sound.stopChargeHum();

  const palmWorldPos = getPalmWorldPosition();

  if (lockedTargets.length > 0) {
    // 【多重分裂導引雷射齊射！】
    guideTextEl.textContent = `⚡ 全彈齊射！發射 ${lockedTargets.length} 道追蹤雷射！`;
    const targetsToHit = [...lockedTargets];
    lockedTargets = [];
    lockReticlePool.forEach(r => r.visible = false);
    launchHomingMissiles(palmWorldPos, targetsToHit);
  } else {
    // 【單發直射模式】
    sound.playBeamBlast();
    beamGroup.position.copy(palmWorldPos);
    const shootDir = smoothedAimDir.clone().normalize();
    beamGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, -1), shootDir);
    beamGroup.visible = true;

    // 氣功波碰撞判定
    const hitTargets = [];
    targets.forEach(t => {
      const toTarget = new THREE.Vector3().subVectors(t.position, palmWorldPos);
      const projDist = toTarget.dot(shootDir);
      if (projDist > 0) {
        const closestPoint = new THREE.Vector3().copy(palmWorldPos).addScaledVector(shootDir, projDist);
        const dist = closestPoint.distanceTo(t.position);
        if (dist < t.userData.radius + 0.45) {
          hitTargets.push({ target: t, dist: projDist, hitPoint: closestPoint });
        }
      }
    });

    hitTargets.forEach(hit => {
      destroyTarget(hit.target, hit.hitPoint, shootDir, 3); // 單發重擊傷害
    });
  }

  chargeLevel = 0;
  updateChargeUI();
}

// 坐標轉換與手勢幾何
function getPalmWorldPosition() {
  const normX = (palmScreenPos.x * 2) - 1;
  const normY = -(palmScreenPos.y * 2) + 1;
  const vec = new THREE.Vector3(normX, normY, 0.5);
  vec.unproject(camera);
  vec.sub(camera.position).normalize();
  const distance = 1.4;
  return new THREE.Vector3().copy(camera.position).addScaledVector(vec, distance);
}

function computeMiddleFingerAimDirection(landmarks) {
  const pWrist = getLandmarkCameraPos(landmarks[0]);
  const pMiddleTip = getLandmarkCameraPos(landmarks[12]);
  const fingerVector = new THREE.Vector3().subVectors(pMiddleTip, pWrist).normalize();

  const invCamQuat = camera.quaternion.clone().invert();
  const fingerCam = fingerVector.clone().applyQuaternion(invCamQuat);

  const sensitivity = 2.4;
  const aimCam = new THREE.Vector3(
    fingerCam.x * sensitivity,
    fingerCam.y * sensitivity,
    fingerCam.z < -0.1 ? fingerCam.z : -1.0
  ).normalize();

  return aimCam.applyQuaternion(camera.quaternion).normalize();
}

function checkIsPalmUp(landmarks) {
  const pWrist = getLandmarkCameraPos(landmarks[0]);
  const pIndexMcp = getLandmarkCameraPos(landmarks[5]);
  const pPinkyMcp = getLandmarkCameraPos(landmarks[17]);
  const pMiddleMcp = getLandmarkCameraPos(landmarks[9]);

  const vUp = new THREE.Vector3().subVectors(pMiddleMcp, pWrist).normalize();
  const vSide = new THREE.Vector3().subVectors(pIndexMcp, pPinkyMcp).normalize();
  const normal = new THREE.Vector3().crossVectors(vSide, vUp).normalize();
  return Math.abs(normal.y) > 0.42;
}

function checkIsFist(landmarks) {
  const wrist = landmarks[0];
  const fingers = [
    { tip: 8, mcp: 5 },
    { tip: 12, mcp: 9 },
    { tip: 16, mcp: 13 },
    { tip: 20, mcp: 17 }
  ];
  let curled = 0;
  for (let f of fingers) {
    const tip = landmarks[f.tip];
    const mcp = landmarks[f.mcp];
    const distMcp = Math.hypot(tip.x - mcp.x, tip.y - mcp.y);
    const distWrist = Math.hypot(tip.x - wrist.x, tip.y - wrist.y);
    if (distMcp < 0.12 || distWrist < 0.25) curled++;
  }
  return curled >= 3;
}

function findAimedTarget(fromPos, aimDir, excludeList = []) {
  let closestTarget = null;
  let minAngle = 0.55;

  targets.forEach(t => {
    if (excludeList.includes(t)) return;
    const toTarget = new THREE.Vector3().subVectors(t.position, fromPos);
    const dist = toTarget.length();
    if (dist > 18) return;

    const dirToTarget = toTarget.clone().normalize();
    const dot = aimDir.dot(dirToTarget);
    const angle = Math.acos(Math.min(1, Math.max(-1, dot)));

    if (angle < minAngle) {
      minAngle = angle;
      closestTarget = t;
    }
  });

  return closestTarget;
}

function getLandmarkCameraPos(pt, baseDepth = 1.4) {
  const screenX = (facingMode === 'user' ? (1.0 - pt.x) : pt.x) * 2 - 1;
  const screenY = -(pt.y * 2 - 1);
  const vec = new THREE.Vector3(screenX, screenY, 0.5);
  vec.unproject(camera);
  vec.sub(camera.position).normalize();
  const depth = Math.max(0.6, baseDepth + (pt.z || 0) * 2.0);
  return new THREE.Vector3().copy(camera.position).addScaledVector(vec, depth);
}

function updateChargeUI() {
  const pct = Math.round(chargeLevel * 100);
  chargeBarEl.style.width = `${pct}%`;
  chargePercentEl.textContent = `${pct}%`;
  chargeBarEl.style.boxShadow = pct >= 80 ? '0 0 20px #ff0055, 0 0 35px #ffe600' : '0 0 12px rgba(0, 247, 255, 0.8)';
}

// ==========================================
// 9. 攝影機與 MediaPipe Hands 整合
// ==========================================
let handsTracker = null;
let currentStream = null;
let isMediaPipeLoopRunning = false;

async function setupWebcam() {
  if (currentStream) {
    currentStream.getTracks().forEach(track => track.stop());
  }

  const constraints = {
    video: {
      facingMode: facingMode,
      width: { ideal: 1280 },
      height: { ideal: 720 }
    },
    audio: false
  };

  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    currentStream = stream;
    videoEl.srcObject = stream;
    await videoEl.play();
    statusEl.textContent = "AR 戰場就緒！請伸出手掌";
    if (!handsTracker) {
      initMediaPipe();
    }
  } catch (err) {
    console.error("相機存取失敗:", err);
    statusEl.textContent = "相機啟動失敗，請確認權限";
    alert("請允許 Safari 使用相機權限以進行 AR 手勢辨識！");
  }
}

function initMediaPipe() {
  if (!window.Hands) {
    console.error("MediaPipe Hands 尚未載入");
    return;
  }

  handsTracker = new window.Hands({
    locateFile: (file) => `./mediapipe/${file}`
  });

  handsTracker.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
  });

  handsTracker.onResults(onHandResults);

  if (!isMediaPipeLoopRunning) {
    isMediaPipeLoopRunning = true;
    let isProcessingFrame = false;
    async function processVideoFrame() {
      if (videoEl.readyState >= 2 && videoEl.videoWidth > 0 && !isProcessingFrame) {
        isProcessingFrame = true;
        try {
          await handsTracker.send({ image: videoEl });
        } catch (err) {
          console.error("Frame tracking error:", err);
        } finally {
          isProcessingFrame = false;
        }
      }
      requestAnimationFrame(processVideoFrame);
    }
    requestAnimationFrame(processVideoFrame);
  }
}

// 處理手部追蹤與手勢判定
function onHandResults(results) {
  try {
    debugCtx.clearRect(0, 0, debugCanvas.width, debugCanvas.height);

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      isHandDetected = true;
      const landmarks = results.multiHandLandmarks[0];

      const wrist = landmarks[0];
      const indexMcp = landmarks[5];
      const pinkyMcp = landmarks[17];

      let rawX = (wrist.x + indexMcp.x + pinkyMcp.x) / 3;
      if (facingMode === 'user') rawX = 1.0 - rawX;
      const rawY = (wrist.y + indexMcp.y + pinkyMcp.y) / 3;
      const rawZ = (wrist.z + indexMcp.z + pinkyMcp.z) / 3;

      palmScreenPos.x = rawX;
      palmScreenPos.y = rawY;

      const deltaZ = lastPalmZ - rawZ;
      lastPalmZ = rawZ;

      const isFist = checkIsFist(landmarks);
      const isPalmUp = !isFist && checkIsPalmUp(landmarks);

      // 1. 中指指向瞄準
      if (!isFist) {
        const rawAimDir = computeMiddleFingerAimDirection(landmarks);
        targetAimDir.copy(rawAimDir);
      }

    const pPos = getPalmWorldPosition();

    // 3. 狀態機處理
    if (!isFiring && !isGameOver) {
      // 狀態 A：掌心向上聚氣
      if (isPalmUp) {
        chargeLevel = Math.min(1.0, chargeLevel + 0.022);
        updateChargeUI();
        sound.startChargeHum(chargeLevel);

        statusEl.textContent = `⚡ 掌心向上聚氣中 (${Math.round(chargeLevel * 100)}%)`;
        guideIconEl.textContent = "🤲";
        guideTextEl.textContent = chargeLevel > 0.8 ? "能量充足！以中指瞄準目標並握拳鎖定！" : "維持掌心向上托天蓄力...";
      } else {
        sound.stopChargeHum();
      }

      // 狀態 B：握拳多重鎖定
      if (isFist) {
        const candidate = findAimedTarget(pPos, smoothedAimDir, lockedTargets);
        if (candidate && lockedTargets.length < MAX_LOCKS) {
          lockedTargets.push(candidate);
          sound.playMultiLock(lockedTargets.length - 1);
          if (navigator.vibrate) navigator.vibrate([70, 30, 70]);
        }

        if (lockedTargets.length > 0) {
          statusEl.textContent = `🎯 多重鎖定: ${lockedTargets.length} 體 (LOCKED x${lockedTargets.length})！`;
          guideIconEl.textContent = "🔒";
          guideTextEl.textContent = `已鎖定 ${lockedTargets.length} 體！出掌即可全彈齊射！`;
        } else {
          statusEl.textContent = "✊ 握拳中 (對準目標自動鎖定)";
          guideIconEl.textContent = "✊";
          guideTextEl.textContent = "對準目標即可自動逐一鎖定 (最多 5 體)";
        }
      }

      // 狀態 C：出掌齊射
      if (wasFistState && !isFist && !isPalmUp) {
        if (lockedTargets.length > 0 || chargeLevel >= 0.15) {
          fireKiBlast();
        }
      } else if (!isFist && !isPalmUp && deltaZ > 0.038 && (lockedTargets.length > 0 || chargeLevel >= 0.35)) {
        fireKiBlast();
      } else if (!isFist && !isPalmUp && lockedTargets.length === 0) {
        statusEl.textContent = "🎯 中指指向瞄準";
        guideIconEl.textContent = "👆";
        guideTextEl.textContent = "以中指指向目標握拳鎖定，出掌全彈齊射！";
      }
    }

    wasFistState = isFist;
    drawHandAura(landmarks, isFist, isPalmUp);
  } else {
    isHandDetected = false;
    wasFistState = false;
    sound.stopChargeHum();
    statusEl.textContent = "等待手掌進入視野...";
    guideIconEl.textContent = "🖐️";
    guideTextEl.textContent = "請將手伸到鏡頭前，掌心向上聚氣";
  }
  } catch (err) {
    console.error("onHandResults error:", err);
  }
}

function drawHandAura(landmarks, isFist, isPalmUp) {
  const w = debugCanvas.width;
  const h = debugCanvas.height;

  debugCtx.fillStyle = isFist ? 'rgba(255, 0, 80, 0.8)' : (isPalmUp ? 'rgba(255, 230, 0, 0.8)' : 'rgba(0, 247, 255, 0.7)');
  debugCtx.shadowColor = isFist ? '#ff0050' : (isPalmUp ? '#ffe600' : '#00f7ff');
  debugCtx.shadowBlur = 10;

  for (let pt of landmarks) {
    const x = (facingMode === 'user' ? (1.0 - pt.x) : pt.x) * w;
    const y = pt.y * h;
    debugCtx.beginPath();
    debugCtx.arc(x, y, 4, 0, Math.PI * 2);
    debugCtx.fill();
  }
}

// ==========================================
// 10. 主遊戲動畫循環 (Game Loop)
// ==========================================
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  const elapsedTime = clock.getElapsedTime();

  smoothedAimDir.lerp(targetAimDir, 0.22);
  smoothedAimDir.normalize();

  // 更新掌心聚氣球與瞄準光束
  if (isHandDetected && !isFiring) {
    kiGroup.visible = true;
    const pPos = getPalmWorldPosition();
    kiGroup.position.copy(pPos);
    kiGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, -1), smoothedAimDir);

    const scale = 0.5 + chargeLevel * 1.5;
    kiGroup.scale.set(scale, scale, scale);

    ringMesh1.rotation.x += delta * 4;
    ringMesh1.rotation.y += delta * 3;
    ringMesh2.rotation.y -= delta * 5;
    ringMesh2.rotation.z += delta * 4;
    kiParticles.rotation.y += delta * 2;

    kiLight.position.copy(pPos);
    kiLight.intensity = chargeLevel * 6;

    aimLine.visible = true;
    const lineEnd = new THREE.Vector3().copy(pPos).addScaledVector(smoothedAimDir, 14.0);
    const posArr = aimLine.geometry.attributes.position.array;
    posArr[0] = pPos.x; posArr[1] = pPos.y; posArr[2] = pPos.z;
    posArr[3] = lineEnd.x; posArr[4] = lineEnd.y; posArr[5] = lineEnd.z;
    aimLine.geometry.attributes.position.needsUpdate = true;
    aimLine.material.opacity = 0.25 + chargeLevel * 0.65;

    const aimPoint = new THREE.Vector3().copy(pPos).addScaledVector(smoothedAimDir, 5.0);
    const proj = aimPoint.clone().project(camera);
    if (proj.z < 1) {
      const screenX = (proj.x * 0.5 + 0.5) * window.innerWidth;
      const screenY = (-(proj.y * 0.5) + 0.5) * window.innerHeight;
      reticleEl.style.transform = `translate(${screenX - 22}px, ${screenY - 22}px)`;
      reticleEl.style.opacity = '0.9';
    }
  } else {
    kiGroup.visible = false;
    kiLight.intensity = 0;
    aimLine.visible = false;
    reticleEl.style.transform = `translate(calc(50vw - 22px), calc(50vh - 22px))`;
    reticleEl.style.opacity = '0.35';
  }

  // 氣功波持續時間更新
  if (isFiring) {
    beamDuration -= delta;
    if (beamDuration <= 0) {
      isFiring = false;
      beamGroup.visible = false;
    } else {
      beamCore.scale.x = 1.0 + Math.sin(elapsedTime * 60) * 0.3;
      beamCore.scale.z = 1.0 + Math.cos(elapsedTime * 60) * 0.3;
      beamOuter.rotation.z += delta * 15;
      muzzleRing.scale.addScalar(delta * 4);
    }
  }

  // 多重鎖定框動畫
  lockReticlePool.forEach((reticle, idx) => {
    if (idx < lockedTargets.length && targets.includes(lockedTargets[idx])) {
      const tgt = lockedTargets[idx];
      reticle.visible = true;
      reticle.position.copy(tgt.position);
      reticle.lookAt(camera.position);
      reticle.children[0].rotation.z += delta * (3.5 + idx * 0.8);
      const pulse = 1.0 + Math.sin(elapsedTime * 10 + idx * 1.5) * 0.12;
      reticle.scale.set(pulse, pulse, pulse);
    } else {
      reticle.visible = false;
    }
  });

  // 分裂導引雷射飛行動畫更新
  for (let i = activeMissiles.length - 1; i >= 0; i--) {
    const m = activeMissiles[i];
    m.progress += delta * m.speed;

    const targetPos = m.target.position;
    const currentPos = getBezierPoint(m.start, m.mid, targetPos, Math.min(1.0, m.progress));
    m.head.position.copy(currentPos);

    m.history.push(currentPos.clone());
    if (m.history.length > 20) m.history.shift();

    const posArr = m.trail.geometry.attributes.position.array;
    for (let j = 0; j < 20; j++) {
      const histIdx = Math.floor((j / 19) * (m.history.length - 1));
      const pt = m.history[histIdx] || currentPos;
      posArr[j * 3] = pt.x; posArr[j * 3 + 1] = pt.y; posArr[j * 3 + 2] = pt.z;
    }
    m.trail.geometry.attributes.position.needsUpdate = true;

    if (m.progress >= 1.0) {
      const hitDir = new THREE.Vector3().subVectors(targetPos, m.mid).normalize();
      if (targets.includes(m.target)) {
        destroyTarget(m.target, targetPos.clone(), hitDir, 2);
      }
      scene.remove(m.head);
      scene.remove(m.trail);
      m.head.geometry.dispose();
      m.head.material.dispose();
      m.trail.geometry.dispose();
      m.trail.material.dispose();
      activeMissiles.splice(i, 1);
    }
  }

  // 敵人浮游動畫 (無攻擊，休閒享受打靶爽快感！)
  targets.forEach(t => {
    t.rotation.x += t.userData.rotSpeedX * delta;
    t.rotation.y += t.userData.rotSpeedY * delta;
    t.position.y = t.userData.baseY + Math.sin(elapsedTime * 2 + t.userData.floatOffset) * 0.15;

    // BOSS 護盾衛星環繞旋轉
    if (t.userData.type === 'boss' && t.userData.satGroup) {
      t.userData.satGroup.rotation.z += delta * 2.5;
    }
  });

  // 更新螢幕外邊緣敵人雷達箭頭
  updateOffscreenIndicators();

  // 物理碎片動畫更新
  for (let i = debrisList.length - 1; i >= 0; i--) {
    const shard = debrisList[i];
    shard.userData.life -= delta;
    shard.userData.velocity.y -= 9.8 * delta;
    shard.position.addScaledVector(shard.userData.velocity, delta);
    shard.rotation.x += shard.userData.rotVel.x * delta;
    shard.rotation.y += shard.userData.rotVel.y * delta;

    const scale = Math.max(0.01, shard.userData.life);
    shard.scale.set(scale, scale, scale);

    if (shard.userData.life <= 0) {
      scene.remove(shard);
      debrisList.splice(i, 1);
    }
  }

  renderer.render(scene, camera);
}

// ==========================================
// 11. 畫面與事件監聽
// ==========================================
function onResize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  debugCanvas.width = w;
  debugCanvas.height = h;
}
window.addEventListener('resize', onResize);
onResize();

// 首次啟動按鈕
document.getElementById('btn-start').addEventListener('click', () => {
  document.getElementById('start-overlay').style.display = 'none';
  sound.init();
  setupWebcam();
  startStage(1); // 啟動第 1 關！
});

// 手動發射按鈕
document.getElementById('btn-fire').addEventListener('click', () => {
  if (chargeLevel < 0.3) {
    chargeLevel = 1.0;
    updateChargeUI();
  }
  fireKiBlast();
});

// 手動生成目標
document.getElementById('btn-add-target').addEventListener('click', () => {
  const p = new THREE.Vector3(
    (Math.random() - 0.5) * 1.5,
    (Math.random() - 0.5) * 1.0,
    -3.5 - Math.random() * 2
  );
  spawnEnemy('drone', p);
  guideTextEl.textContent = "已在視野中生成新目標！";
});

// 切換鏡頭
document.getElementById('btn-switch-cam').addEventListener('click', () => {
  facingMode = (facingMode === 'environment') ? 'user' : 'environment';
  setupWebcam();
});

// 下一關按鈕
btnNextStage.addEventListener('click', () => {
  gameResultOverlay.classList.add('hidden');
  startStage(currentStage + 1);
});

// 重新挑戰按鈕
btnRetry.addEventListener('click', () => {
  gameResultOverlay.classList.add('hidden');
  isGameOver = false;
  score = 0;
  scoreEl.textContent = '0';
  // 清除場上殘留目標
  targets.forEach(t => scene.remove(t));
  targets.length = 0;
  startStage(1);
});

// 點擊螢幕放置目標
canvas3d.addEventListener('pointerdown', (e) => {
  if (e.clientY > window.innerHeight - 130) return;
  const mouse = new THREE.Vector2(
    (e.clientX / window.innerWidth) * 2 - 1,
    -(e.clientY / window.innerHeight) * 2 + 1
  );
  const ray = new THREE.Raycaster();
  ray.setFromCamera(mouse, camera);
  const spawnPos = new THREE.Vector3();
  ray.ray.at(3.5, spawnPos);
  spawnEnemy('drone', spawnPos);
});

// 啟動主渲染循環
animate();
