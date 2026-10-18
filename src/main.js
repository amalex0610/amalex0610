import * as THREE from 'three';

// ==========================================
// 1. 音效合成器 (Web Audio API - 無需外部檔案)
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

  // 聚氣嗡鳴音 (隨蓄力程度音調上升)
  startChargeHum(ratio) {
    if (!this.ctx) return;
    if (!this.isHumming) {
      this.humOsc = this.ctx.createOscillator();
      this.humGain = this.ctx.createGain();
      
      this.humOsc.type = 'sawtooth';
      this.humOsc.frequency.setValueAtTime(100, this.ctx.currentTime);
      
      // 低通濾波器增加厚重感
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

  // 氣功波發射爆音 (轟鳴 + 雷射咆哮)
  playBeamBlast() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    // 低頻衝擊波
    const bassOsc = this.ctx.createOscillator();
    const bassGain = this.ctx.createGain();
    bassOsc.type = 'sine';
    bassOsc.frequency.setValueAtTime(160, t);
    bassOsc.frequency.exponentialRampToValueAtTime(35, t + 0.6);
    bassGain.gain.setValueAtTime(0.4, t);
    bassGain.gain.exponentialRampToValueAtTime(0.01, t + 0.8);

    bassOsc.connect(bassGain);
    bassGain.connect(this.ctx.destination);
    bassOsc.start(t);
    bassOsc.stop(t + 0.8);

    // 高頻能量束嘯聲
    const zapOsc = this.ctx.createOscillator();
    const zapGain = this.ctx.createGain();
    zapOsc.type = 'sawtooth';
    zapOsc.frequency.setValueAtTime(800, t);
    zapOsc.frequency.exponentialRampToValueAtTime(180, t + 0.5);
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
    
    // 白噪聲爆裂
    const bufferSize = this.ctx.sampleRate * 0.4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(450, t);
    filter.frequency.exponentialRampToValueAtTime(80, t + 0.35);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(t);
    noise.stop(t + 0.4);
  }

  // 多重鎖定提示音 (隨鎖定數量音調逐次爬升)
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

  // 分裂導彈/雷射連環發射嘯聲
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

let score = 0;
let chargeLevel = 0; // 0 ~ 1.0
let isHandDetected = false;
let palmScreenPos = { x: 0.5, y: 0.5, z: 0 };
let lastPalmZ = 0;
let facingMode = 'environment'; // 預設後置鏡頭
let isFiring = false;
let beamDuration = 0;

// 手勢瞄準與出掌角度向量
let smoothedAimDir = new THREE.Vector3(0, 0, -1);
let targetAimDir = new THREE.Vector3(0, 0, -1);

// 多重目標鎖定與手勢狀態
let lockedTargets = []; // 存儲多個鎖定的目標
const MAX_LOCKS = 5;    // 最多同時鎖定 5 個目標
let wasFistState = false;

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

// 燈光
const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
dirLight.position.set(2, 5, 2);
scene.add(dirLight);

// 掌心聚氣光暈光源 (動態照亮周圍虛擬物體)
const kiLight = new THREE.PointLight(0x00f7ff, 0, 8);
scene.add(kiLight);

// ==========================================
// 4. 特效：掌心聚氣能量球 (Ki Orb)
// ==========================================
const kiGroup = new THREE.Group();
scene.add(kiGroup);

// 核心發光球
const orbGeo = new THREE.SphereGeometry(0.12, 24, 24);
const orbMat = new THREE.MeshBasicMaterial({
  color: 0x00ffff,
  wireframe: true,
  transparent: true,
  opacity: 0.8
});
const orbMesh = new THREE.Mesh(orbGeo, orbMat);
kiGroup.add(orbMesh);

// 旋轉能量光環 1
const ringGeo1 = new THREE.TorusGeometry(0.18, 0.015, 12, 36);
const ringMat1 = new THREE.MeshBasicMaterial({ color: 0xffe600, transparent: true, opacity: 0.8 });
const ringMesh1 = new THREE.Mesh(ringGeo1, ringMat1);
kiGroup.add(ringMesh1);

// 旋轉能量光環 2
const ringGeo2 = new THREE.TorusGeometry(0.15, 0.012, 12, 36);
const ringMat2 = new THREE.MeshBasicMaterial({ color: 0x00f7ff, transparent: true, opacity: 0.8 });
const ringMesh2 = new THREE.Mesh(ringGeo2, ringMat2);
kiGroup.add(ringMesh2);

// 聚氣吸入微粒
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

// ==========================================
// 5. 特效：氣功波雷射衝擊波 (Ki Blast Beam)
// ==========================================
const beamGroup = new THREE.Group();
scene.add(beamGroup);

// 氣功波核心光柱
const beamCoreGeo = new THREE.CylinderGeometry(0.08, 0.22, 18, 16);
beamCoreGeo.rotateX(-Math.PI / 2);
beamCoreGeo.translate(0, 0, -9);
const beamCoreMat = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0.95
});
const beamCore = new THREE.Mesh(beamCoreGeo, beamCoreMat);
beamGroup.add(beamCore);

// 外層等離子能量鞘
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

// 槍口衝擊波擴散環
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

// 瞄準導引光束線 (Aim Guide Line)
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

// 3D 多重目標鎖定框物件池 (最多支援 5 個目標同時鎖定)
const lockReticlePool = [];
for (let i = 0; i < 5; i++) {
  const grp = new THREE.Group();
  
  // 外圍鎖定環
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

  // 4 個鎖定角標
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
// 分裂導引弧形雷射 (Split Curved Homing Lasers)
// ==========================================
const activeMissiles = [];

function launchHomingMissiles(palmWorldPos, targetList) {
  sound.playSalvoLaunch(targetList.length);

  targetList.forEach((target, i) => {
    // 導引彈頭 (發光等離子球)
    const headGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const headMat = new THREE.MeshBasicMaterial({
      color: 0xffe600,
      transparent: true,
      opacity: 0.95
    });
    const headMesh = new THREE.Mesh(headGeo, headMat);
    headMesh.position.copy(palmWorldPos);

    // 弧線軌跡光線 (20 點動態射線帶)
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

    // 側向飛散弧度向量 (板野馬戲式外擴飛散)
    const angle = (i / targetList.length) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
    const spreadRadius = 1.8 + Math.random() * 0.8;
    const arcOffset = new THREE.Vector3(
      Math.cos(angle) * spreadRadius,
      Math.sin(angle) * spreadRadius + 0.4,
      -0.6
    ).applyQuaternion(camera.quaternion);

    const midPoint = new THREE.Vector3()
      .lerpVectors(palmWorldPos, target.position, 0.42)
      .add(arcOffset);

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
// 6. 目標物系統 (Targets) 與 破壞碎片系統
// ==========================================
const targets = [];
const debrisList = [];

// 生成單個懸浮目標物
function spawnTarget(customPos = null) {
  const targetGroup = new THREE.Group();
  
  // 外殼：發光能量晶石
  const type = Math.floor(Math.random() * 3);
  let geo;
  if (type === 0) geo = new THREE.IcosahedronGeometry(0.35, 0);
  else if (type === 1) geo = new THREE.OctahedronGeometry(0.38, 0);
  else geo = new THREE.DodecahedronGeometry(0.32, 0);

  const mat = new THREE.MeshStandardMaterial({
    color: type === 0 ? 0xff0055 : (type === 1 ? 0xffaa00 : 0xaa00ff),
    roughness: 0.2,
    metalness: 0.8,
    emissive: type === 0 ? 0x660022 : (type === 1 ? 0x552200 : 0x330066),
    emissiveIntensity: 0.5
  });
  const mesh = new THREE.Mesh(geo, mat);
  targetGroup.add(mesh);

  // 外圍護盾環
  const shieldGeo = new THREE.TorusGeometry(0.5, 0.015, 8, 24);
  const shieldMat = new THREE.MeshBasicMaterial({
    color: 0x00f7ff,
    transparent: true,
    opacity: 0.7
  });
  const shield = new THREE.Mesh(shieldGeo, shieldMat);
  targetGroup.add(shield);

  // 位置設置
  if (customPos) {
    targetGroup.position.copy(customPos);
  } else {
    // 隨機在玩家前方視野空間生成 (更寬廣的角度與距離)
    const angle = (Math.random() - 0.5) * 1.5;
    const height = (Math.random() - 0.5) * 1.0;
    const dist = 3.2 + Math.random() * 2.8; // 距離 3.2m ~ 6.0m
    targetGroup.position.set(Math.sin(angle) * dist, height, -Math.cos(angle) * dist);
  }

  targetGroup.userData = {
    radius: 0.45,
    rotSpeedX: (Math.random() - 0.5) * 1.5,
    rotSpeedY: (Math.random() - 0.5) * 2.0,
    baseY: targetGroup.position.y,
    floatOffset: Math.random() * Math.PI * 2
  };

  scene.add(targetGroup);
  targets.push(targetGroup);
}

// 預先生成 6 個目標以利多重鎖定
for (let i = 0; i < 6; i++) {
  spawnTarget();
}

// 目標被破壞：碎成 30 塊碎片噴飛
function destroyTarget(targetGroup, hitPoint, blastDir) {
  sound.playDestruction();
  
  score++;
  scoreEl.textContent = score;

  // 震動手機 (若手機硬體支援)
  if (navigator.vibrate) {
    navigator.vibrate([80, 40, 150]);
  }

  // 產生 25~35 塊 3D 幾何碎片
  const shardCount = 30;
  for (let i = 0; i < shardCount; i++) {
    const shardGeo = new THREE.TetrahedronGeometry(0.06 + Math.random() * 0.08);
    const shardMat = new THREE.MeshStandardMaterial({
      color: Math.random() > 0.4 ? 0xff4400 : 0xffcc00,
      emissive: 0xff2200,
      emissiveIntensity: 0.8
    });
    const shard = new THREE.Mesh(shardGeo, shardMat);
    shard.position.copy(targetGroup.position);
    
    // 爆炸擴散速度 (疊加氣功波的方向)
    const speed = 2.5 + Math.random() * 4.0;
    const spread = new THREE.Vector3(
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.3) * 2,
      (Math.random() - 0.5) * 2
    ).normalize();

    const velocity = spread.multiplyScalar(speed).add(blastDir.clone().multiplyScalar(4));

    shard.userData = {
      velocity: velocity,
      rotVel: new THREE.Vector3(Math.random() * 10, Math.random() * 10, Math.random() * 10),
      life: 1.0 // 存活時間秒數
    };

    scene.add(shard);
    debrisList.push(shard);
  }

  // 從場景中移除被打爆的目標
  scene.remove(targetGroup);
  const idx = targets.indexOf(targetGroup);
  if (idx !== -1) targets.splice(idx, 1);

  // 也從鎖定列表中移除
  const lIdx = lockedTargets.indexOf(targetGroup);
  if (lIdx !== -1) lockedTargets.splice(lIdx, 1);

  // 補發新目標，隨時保持場上有 6 個目標
  setTimeout(() => {
    if (targets.length < 6) {
      spawnTarget();
    }
  }, 1000);
}

// ==========================================
// 7. 氣功波發射判定與命中檢測
// ==========================================
function fireKiBlast() {
  // 若有鎖定目標或充能 > 15% 即可發射
  if (chargeLevel < 0.15 && lockedTargets.length === 0 && !isFiring) {
    guideTextEl.textContent = "氣力不足！請先掌心向上托天蓄力";
    return;
  }

  isFiring = true;
  beamDuration = 0.55; // 光束持續時間 0.55 秒
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
    // 【一般直射模式】：單發中指瞄準光束
    sound.playBeamBlast();
    beamGroup.position.copy(palmWorldPos);
    const shootDir = smoothedAimDir.clone().normalize();
    
    beamGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, -1), shootDir);
    beamGroup.visible = true;

    // 氣功波射線碰撞判定
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
      destroyTarget(hit.target, hit.hitPoint, shootDir);
    });
  }

  // 消耗蓄力
  chargeLevel = 0;
  updateChargeUI();
}

// 將 2D 螢幕手掌坐標轉換為 3D 空間坐標
function getPalmWorldPosition() {
  const normX = (palmScreenPos.x * 2) - 1;
  const normY = -(palmScreenPos.y * 2) + 1;
  const vec = new THREE.Vector3(normX, normY, 0.5);
  vec.unproject(camera);
  vec.sub(camera.position).normalize();
  const distance = 1.4; // 手掌距離相機約 1.4 公尺處
  return new THREE.Vector3().copy(camera.position).addScaledVector(vec, distance);
}

// 依中指指向計算瞄準向量 (中指指哪射哪)
function computeMiddleFingerAimDirection(landmarks) {
  const pWrist = getLandmarkCameraPos(landmarks[0]);
  const pMiddleTip = getLandmarkCameraPos(landmarks[12]);
  const pMiddleMcp = getLandmarkCameraPos(landmarks[9]);

  // 中指指尖方向 (從手腕或中指根部穿過中指尖)
  const fingerVector = new THREE.Vector3().subVectors(pMiddleTip, pWrist).normalize();

  // 轉換為相機局部空間以便靈活調校靈敏度
  const invCamQuat = camera.quaternion.clone().invert();
  const fingerCam = fingerVector.clone().applyQuaternion(invCamQuat);

  // 擴大中指上下左右擺動的瞄準靈敏度
  const sensitivity = 2.4;
  const aimCam = new THREE.Vector3(
    fingerCam.x * sensitivity,
    fingerCam.y * sensitivity,
    fingerCam.z < -0.1 ? fingerCam.z : -1.0
  ).normalize();

  // 轉回世界坐標
  return aimCam.applyQuaternion(camera.quaternion).normalize();
}

// 檢測是否「掌心向上」托天聚氣
function checkIsPalmUp(landmarks) {
  const pWrist = getLandmarkCameraPos(landmarks[0]);
  const pIndexMcp = getLandmarkCameraPos(landmarks[5]);
  const pPinkyMcp = getLandmarkCameraPos(landmarks[17]);
  const pMiddleMcp = getLandmarkCameraPos(landmarks[9]);

  const vUp = new THREE.Vector3().subVectors(pMiddleMcp, pWrist).normalize();
  const vSide = new THREE.Vector3().subVectors(pIndexMcp, pPinkyMcp).normalize();
  const normal = new THREE.Vector3().crossVectors(vSide, vUp).normalize();

  // 掌心法向量是否主要朝上 (Y 軸向上)
  return Math.abs(normal.y) > 0.42;
}

// 檢測是否「握拳」鎖定
function checkIsFist(landmarks) {
  const wrist = landmarks[0];
  const fingers = [
    { tip: 8, mcp: 5 },   // 食指
    { tip: 12, mcp: 9 },  // 中指
    { tip: 16, mcp: 13 }, // 無名指
    { tip: 20, mcp: 17 }  // 小指
  ];
  let curled = 0;
  for (let f of fingers) {
    const tip = landmarks[f.tip];
    const mcp = landmarks[f.mcp];
    const distMcp = Math.hypot(tip.x - mcp.x, tip.y - mcp.y);
    const distWrist = Math.hypot(tip.x - wrist.x, tip.y - wrist.y);
    // 指尖蜷縮進掌心
    if (distMcp < 0.12 || distWrist < 0.25) {
      curled++;
    }
  }
  return curled >= 3;
}

// 依據瞄準射線尋找最接近準心的懸浮目標 (排除已鎖定的目標)
function findAimedTarget(fromPos, aimDir, excludeList = []) {
  let closestTarget = null;
  let minAngle = 0.55; // 約 32 度角寬容度

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
  
  if (pct >= 80) {
    chargeBarEl.style.boxShadow = '0 0 20px #ff0055, 0 0 35px #ffe600';
  } else {
    chargeBarEl.style.boxShadow = '0 0 12px rgba(0, 247, 255, 0.8)';
  }
}

// ==========================================
// 8. 攝影機串流與 MediaPipe Hands 整合
// ==========================================
let handsTracker = null;
let cameraHelper = null;
let currentStream = null;

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
    statusEl.textContent = "AR 追蹤就緒！請伸出手掌";
    initMediaPipe();
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

  // 每一幀將視訊傳給 MediaPipe
  async function processVideoFrame() {
    if (videoEl.readyState >= 2) {
      await handsTracker.send({ image: videoEl });
    }
    requestAnimationFrame(processVideoFrame);
  }
  requestAnimationFrame(processVideoFrame);
}

// 處理手部追蹤回傳結果
function onHandResults(results) {
  debugCtx.clearRect(0, 0, debugCanvas.width, debugCanvas.height);

  if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
    isHandDetected = true;
    const landmarks = results.multiHandLandmarks[0];

    const wrist = landmarks[0];
    const indexMcp = landmarks[5];
    const pinkyMcp = landmarks[17];

    // 前置鏡頭需要水平鏡像 X
    let rawX = (wrist.x + indexMcp.x + pinkyMcp.x) / 3;
    if (facingMode === 'user') {
      rawX = 1.0 - rawX;
    }
    const rawY = (wrist.y + indexMcp.y + pinkyMcp.y) / 3;
    const rawZ = (wrist.z + indexMcp.z + pinkyMcp.z) / 3;

    palmScreenPos.x = rawX;
    palmScreenPos.y = rawY;

    // 前推手勢檢測 (Z 軸向螢幕推進)
    const deltaZ = lastPalmZ - rawZ;
    lastPalmZ = rawZ;

    // 手勢辨識
    const isFist = checkIsFist(landmarks);
    const isPalmUp = !isFist && checkIsPalmUp(landmarks);

    // 1. 中指瞄準方向：在非握拳時計算指向向量
    if (!isFist) {
      const rawAimDir = computeMiddleFingerAimDirection(landmarks);
      targetAimDir.copy(rawAimDir);
    }

    const pPos = getPalmWorldPosition();

    // 2. 狀態機處理
    if (!isFiring) {
      // 狀態 A：掌心向上 -> 托天聚氣
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

      // 狀態 B：握拳 -> 多重掃描鎖定 (Multi-Lock On)
      if (isFist) {
        // 握拳期間，揮動手臂準心掃過任一目標即加入鎖定 (最多 5 體)
        const candidate = findAimedTarget(pPos, smoothedAimDir, lockedTargets);
        if (candidate && lockedTargets.length < MAX_LOCKS) {
          lockedTargets.push(candidate);
          sound.playMultiLock(lockedTargets.length - 1);
          if (navigator.vibrate) navigator.vibrate([70, 30, 70]);
        }

        if (lockedTargets.length > 0) {
          statusEl.textContent = `🎯 多重鎖定: ${lockedTargets.length} 體 (LOCKED x${lockedTargets.length})！`;
          guideIconEl.textContent = "🔒";
          guideTextEl.textContent = `已鎖定 ${lockedTargets.length} 體！繼續擺動手腕可鎖更多，出掌全彈齊射！`;
        } else {
          statusEl.textContent = "✊ 握拳中 (對準目標自動鎖定)";
          guideIconEl.textContent = "✊";
          guideTextEl.textContent = "對準目標即可自動逐一鎖定 (最多 5 體)";
        }
      }

      // 狀態 C：出掌發射！
      // 觸發條件 1: 從握拳剛放開出掌 (wasFistState && !isFist)
      // 觸發條件 2: 蓄力完成且向前猛推掌 (deltaZ > 0.038)
      if (wasFistState && !isFist && !isPalmUp) {
        // 從握拳放開出掌！若有鎖定目標或充能 > 15% 即可釋放
        if (lockedTargets.length > 0 || chargeLevel >= 0.15) {
          fireKiBlast();
        }
      } else if (!isFist && !isPalmUp && deltaZ > 0.038 && (lockedTargets.length > 0 || chargeLevel >= 0.35)) {
        fireKiBlast();
      } else if (!isFist && !isPalmUp && lockedTargets.length === 0) {
        // 一般瞄準狀態
        statusEl.textContent = "🎯 中指指向瞄準中";
        guideIconEl.textContent = "👆";
        guideTextEl.textContent = "以中指指向目標，握拳鎖定 (可鎖定多體)";
      }
    }

    wasFistState = isFist;

    // 在 2D 畫布繪製手部節點光點
    drawHandAura(landmarks, isFist, isPalmUp);
  } else {
    isHandDetected = false;
    wasFistState = false;
    sound.stopChargeHum();
    statusEl.textContent = "等待手掌進入視野...";
    guideIconEl.textContent = "🖐️";
    guideTextEl.textContent = "請將手伸到鏡頭前，掌心向上聚氣";
  }
}

// 繪製手掌周圍能量光暈
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
// 9. 主遊戲動畫循環 (Game Loop)
// ==========================================
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  const elapsedTime = clock.getElapsedTime();

  // 平滑插值出掌瞄準方向 (避免手勢追蹤噪點造成抖動)
  smoothedAimDir.lerp(targetAimDir, 0.22);
  smoothedAimDir.normalize();

  // 更新掌心 3D 聚氣球與瞄準光線位置
  if (isHandDetected && !isFiring) {
    kiGroup.visible = true;
    const pPos = getPalmWorldPosition();
    kiGroup.position.copy(pPos);

    // 聚氣球朝向跟隨出掌角度旋轉
    kiGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, -1), smoothedAimDir);

    // 隨蓄力大小縮放
    const scale = 0.5 + chargeLevel * 1.5;
    kiGroup.scale.set(scale, scale, scale);

    // 光環與粒子旋轉
    ringMesh1.rotation.x += delta * 4;
    ringMesh1.rotation.y += delta * 3;
    ringMesh2.rotation.y -= delta * 5;
    ringMesh2.rotation.z += delta * 4;
    kiParticles.rotation.y += delta * 2;

    // 掌心燈光強度隨蓄力加強
    kiLight.position.copy(pPos);
    kiLight.intensity = chargeLevel * 6;

    // 顯示即時出掌瞄準導引線 (聚氣越多線條越顯眼)
    aimLine.visible = true;
    const lineEnd = new THREE.Vector3().copy(pPos).addScaledVector(smoothedAimDir, 14.0);
    const posArr = aimLine.geometry.attributes.position.array;
    posArr[0] = pPos.x; posArr[1] = pPos.y; posArr[2] = pPos.z;
    posArr[3] = lineEnd.x; posArr[4] = lineEnd.y; posArr[5] = lineEnd.z;
    aimLine.geometry.attributes.position.needsUpdate = true;
    aimLine.material.opacity = 0.25 + chargeLevel * 0.65;

    // 動態將出掌射線投影到螢幕上的準心
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
      // 衝擊波核心震顫特效
      beamCore.scale.x = 1.0 + Math.sin(elapsedTime * 60) * 0.3;
      beamCore.scale.z = 1.0 + Math.cos(elapsedTime * 60) * 0.3;
      beamOuter.rotation.z += delta * 15;
      muzzleRing.scale.addScalar(delta * 4);
    }
  }

  // 3D 多重目標鎖定框動畫與跟隨
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

  // 分裂導引飛彈飛行動畫更新
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
      posArr[j * 3] = pt.x;
      posArr[j * 3 + 1] = pt.y;
      posArr[j * 3 + 2] = pt.z;
    }
    m.trail.geometry.attributes.position.needsUpdate = true;

    if (m.progress >= 1.0) {
      const hitDir = new THREE.Vector3().subVectors(targetPos, m.mid).normalize();
      if (targets.includes(m.target)) {
        destroyTarget(m.target, targetPos.clone(), hitDir);
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

  // 目標物浮動與旋轉動畫
  targets.forEach(t => {
    t.rotation.x += t.userData.rotSpeedX * delta;
    t.rotation.y += t.userData.rotSpeedY * delta;
    t.position.y = t.userData.baseY + Math.sin(elapsedTime * 2 + t.userData.floatOffset) * 0.15;
  });

  // 物理碎片動畫更新 (重力、旋轉、漸漸消失)
  for (let i = debrisList.length - 1; i >= 0; i--) {
    const shard = debrisList[i];
    shard.userData.life -= delta;
    
    // 重力墜落
    shard.userData.velocity.y -= 9.8 * delta;
    shard.position.addScaledVector(shard.userData.velocity, delta);
    shard.rotation.x += shard.userData.rotVel.x * delta;
    shard.rotation.y += shard.userData.rotVel.y * delta;

    // 縮小淡出
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
// 10. 事件監聽與畫面自適應
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

// 啟動按鈕 (點擊解鎖音效與相機)
document.getElementById('btn-start').addEventListener('click', () => {
  document.getElementById('start-overlay').style.display = 'none';
  sound.init();
  setupWebcam();
});

// 手動發射按鈕
document.getElementById('btn-fire').addEventListener('click', () => {
  if (chargeLevel < 0.3) {
    chargeLevel = 1.0; // 手動點擊直接充滿並發射
    updateChargeUI();
  }
  fireKiBlast();
});

// 點擊「放置目標」按鈕
document.getElementById('btn-add-target').addEventListener('click', () => {
  const p = new THREE.Vector3(
    (Math.random() - 0.5) * 1.5,
    (Math.random() - 0.5) * 1.0,
    -3.5 - Math.random() * 2
  );
  spawnTarget(p);
  guideTextEl.textContent = "已在視野中生成新目標！";
});

// 切換前後鏡頭
document.getElementById('btn-switch-cam').addEventListener('click', () => {
  facingMode = (facingMode === 'environment') ? 'user' : 'environment';
  setupWebcam();
});

// 點擊螢幕任意處放置虛擬目標在相機真實視圖中
canvas3d.addEventListener('pointerdown', (e) => {
  // 若點擊的是下半部的按鈕區則忽略
  if (e.clientY > window.innerHeight - 130) return;

  const mouse = new THREE.Vector2(
    (e.clientX / window.innerWidth) * 2 - 1,
    -(e.clientY / window.innerHeight) * 2 + 1
  );

  const ray = new THREE.Raycaster();
  ray.setFromCamera(mouse, camera);

  // 在距離鏡頭 3.5 米處生成目標
  const spawnPos = new THREE.Vector3();
  ray.ray.at(3.5, spawnPos);
  spawnTarget(spawnPos);
});

// 啟動主渲染循環
animate();
