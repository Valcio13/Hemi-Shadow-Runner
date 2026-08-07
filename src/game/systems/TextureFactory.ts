/**
 * TextureFactory — generates all placeholder textures procedurally at boot.
 *
 * Milestone 1 uses clean vector-style shapes drawn to canvas so we have zero
 * binary asset dependencies while nailing gameplay feel first. Real sprite
 * sheets can drop in later by simply replacing these keys.
 */
import Phaser from 'phaser';
import { BARRIER, COIN, OBSTACLE, PLAYER, POWERUP, SHADOW, VIEW, WORLD } from '../config/GameConfig';

export function generateTextures(scene: Phaser.Scene): void {
  makeAstronaut(scene, 'player', PLAYER.COLOR);
  makeAstronaut(scene, 'player-dash', PLAYER.COLOR_DASH);
  makeGround(scene);
  makeParticle(scene);
  makeCoin(scene);
  makeSparkle(scene);
  makeShockRing(scene);
  makeStarfield(scene);
  makeMountains(scene);
  makeBarrier(scene, 'barrier-light', SHADOW.LIGHT_COLOR);
  makeBarrier(scene, 'barrier-shadow', SHADOW.SHADOW_COLOR);
  // Power-ups (M8): a faceted crystal (Genesis), an angular time-shard (Chrono),
  // and a hexagonal chip (Recovery). Distinct shape + color for instant reads.
  makeGenesisCrystal(scene);
  makeChronoShard(scene);
  makeRecoveryChip(scene);
  for (const t of OBSTACLE.TYPES) {
    makeObstacle(scene, t.key, t.width, t.height, t.color);
  }
}

/** Genesis Shard — a golden faceted diamond crystal with an inner glint. */
function makeGenesisCrystal(scene: Phaser.Scene): void {
  const key = POWERUP.GENESIS.key;
  if (scene.textures.exists(key)) return;
  const r = POWERUP.GENESIS.RADIUS;
  const size = r * 2 + 12;
  const c = size / 2;
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  // Glow halo
  g.fillStyle(POWERUP.GENESIS.COLOR_GLOW, 0.3);
  g.fillCircle(c, c, r + 5);
  // Diamond body (elongated hexagon)
  const top = c - r, bot = c + r, midU = c - r * 0.45, midL = c + r * 0.45;
  g.fillStyle(POWERUP.GENESIS.COLOR, 1);
  g.beginPath();
  g.moveTo(c, top);
  g.lineTo(c + r * 0.72, midU);
  g.lineTo(c + r * 0.5, midL);
  g.lineTo(c, bot);
  g.lineTo(c - r * 0.5, midL);
  g.lineTo(c - r * 0.72, midU);
  g.closePath();
  g.fillPath();
  // Facet lines
  g.lineStyle(1.5, 0xffffff, 0.5);
  g.beginPath();
  g.moveTo(c, top); g.lineTo(c, bot);
  g.moveTo(c - r * 0.72, midU); g.lineTo(c + r * 0.72, midU);
  g.strokePath();
  // Bright glint
  g.fillStyle(0xffffff, 0.85);
  g.fillCircle(c - r * 0.2, c - r * 0.3, r * 0.16);
  g.generateTexture(key, size, size);
  g.destroy();
}

/** Chrono Fragment — a blue angular time-shard (kite) with a clock tick core. */
function makeChronoShard(scene: Phaser.Scene): void {
  const key = POWERUP.CHRONO.key;
  if (scene.textures.exists(key)) return;
  const r = POWERUP.CHRONO.RADIUS;
  const size = r * 2 + 12;
  const c = size / 2;
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  g.fillStyle(POWERUP.CHRONO.COLOR_GLOW, 0.3);
  g.fillCircle(c, c, r + 5);
  // Kite shard
  g.fillStyle(POWERUP.CHRONO.COLOR, 1);
  g.beginPath();
  g.moveTo(c, c - r);
  g.lineTo(c + r * 0.7, c);
  g.lineTo(c, c + r);
  g.lineTo(c - r * 0.7, c);
  g.closePath();
  g.fillPath();
  // Clock hands (a "time" read)
  g.lineStyle(2, 0xffffff, 0.85);
  g.beginPath();
  g.moveTo(c, c); g.lineTo(c, c - r * 0.5);
  g.moveTo(c, c); g.lineTo(c + r * 0.34, c);
  g.strokePath();
  g.fillStyle(0xffffff, 0.9);
  g.fillCircle(c, c, r * 0.12);
  g.generateTexture(key, size, size);
  g.destroy();
}

/** Recovery Protocol — a green hexagonal chip with a shield cross. */
function makeRecoveryChip(scene: Phaser.Scene): void {
  const key = POWERUP.RECOVERY.key;
  if (scene.textures.exists(key)) return;
  const r = POWERUP.RECOVERY.RADIUS;
  const size = r * 2 + 12;
  const c = size / 2;
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  g.fillStyle(POWERUP.RECOVERY.COLOR_GLOW, 0.3);
  g.fillCircle(c, c, r + 5);
  // Hexagon body
  g.fillStyle(POWERUP.RECOVERY.COLOR, 1);
  g.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i - Math.PI / 6;
    const px = c + Math.cos(a) * r;
    const py = c + Math.sin(a) * r;
    if (i === 0) g.moveTo(px, py);
    else g.lineTo(px, py);
  }
  g.closePath();
  g.fillPath();
  // Hex outline
  g.lineStyle(1.5, 0x0a2a1c, 0.6);
  g.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i - Math.PI / 6;
    const px = c + Math.cos(a) * r;
    const py = c + Math.sin(a) * r;
    if (i === 0) g.moveTo(px, py);
    else g.lineTo(px, py);
  }
  g.closePath();
  g.strokePath();
  // Medical cross (revive/heal read)
  g.fillStyle(0xffffff, 0.95);
  const arm = r * 0.5, thick = r * 0.2;
  g.fillRect(c - thick, c - arm, thick * 2, arm * 2);
  g.fillRect(c - arm, c - thick, arm * 2, thick * 2);
  g.generateTexture(key, size, size);
  g.destroy();
}

/** Astronaut character - cute space runner with helmet and striped suit */
function makeAstronaut(scene: Phaser.Scene, key: string, color: number): void {
  if (scene.textures.exists(key)) return;
  const w = PLAYER.WIDTH;
  const h = PLAYER.HEIGHT;
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  
  const cx = w / 2;
  const headY = 10;
  const headR = 8;
  const bodyY = headY + headR + 2;
  const bodyH = 18;
  const legY = bodyY + bodyH;
  
  // Outer glow
  g.fillStyle(color, 0.2);
  g.fillCircle(cx, headY, headR + 2);
  g.fillRect(cx - 8, bodyY - 1, 16, bodyH + 4);
  
  // Body - white with rounded corners
  g.fillStyle(0xffffff, 1);
  g.fillRect(cx - 7, bodyY, 14, bodyH);
  
  // Orange stripes on body (3 stripes)
  g.fillStyle(0xff8833, 1);
  g.fillRect(cx - 7, bodyY + 3, 14, 3);
  g.fillRect(cx - 7, bodyY + 9, 14, 3);
  g.fillRect(cx - 7, bodyY + 15, 14, 3);
  
  // Arms
  g.fillStyle(0xffffff, 1);
  // Left arm
  g.fillRect(cx - 11, bodyY + 2, 4, 10);
  g.fillStyle(0xff8833, 1);
  g.fillRect(cx - 11, bodyY + 4, 4, 2);
  // Right arm
  g.fillStyle(0xffffff, 1);
  g.fillRect(cx + 7, bodyY + 2, 4, 10);
  g.fillStyle(0xff8833, 1);
  g.fillRect(cx + 7, bodyY + 4, 4, 2);
  
  // Legs
  g.fillStyle(0xffffff, 1);
  // Left leg
  g.fillRect(cx - 5, legY, 4, 8);
  g.fillStyle(0xff8833, 1);
  g.fillRect(cx - 5, legY + 2, 4, 2);
  // Right leg
  g.fillStyle(0xffffff, 1);
  g.fillRect(cx + 1, legY, 4, 8);
  g.fillStyle(0xff8833, 1);
  g.fillRect(cx + 1, legY + 2, 4, 2);
  
  // Helmet - sphere with visor
  g.fillStyle(0xeeeeee, 0.9);
  g.fillCircle(cx, headY, headR);
  
  // Helmet shine
  g.fillStyle(0xffffff, 0.6);
  g.fillCircle(cx - 2, headY - 2, 3);
  
  // Visor - dark tinted glass with colored glow
  g.fillStyle(color, 0.7);
  g.fillEllipse(cx, headY + 1, headR - 3, headR - 4);
  
  // Visor highlight
  g.fillStyle(0xffffff, 0.4);
  g.fillEllipse(cx - 1, headY, 3, 2);
  
  // Helmet rim/collar
  g.lineStyle(2, 0xcccccc, 1);
  g.strokeCircle(cx, headY, headR);
  
  // Boots
  g.fillStyle(0x444444, 1);
  g.fillRect(cx - 6, legY + 7, 5, 3);
  g.fillRect(cx + 1, legY + 7, 5, 3);
  
  g.generateTexture(key, w, h);
  g.destroy();
}

/** A tileable starfield: scattered dots on transparent for the far parallax layer. */
function makeStarfield(scene: Phaser.Scene): void {
  const key = 'stars';
  if (scene.textures.exists(key)) return;
  const w = VIEW.WIDTH;
  const h = VIEW.HEIGHT;
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  const rng = new Phaser.Math.RandomDataGenerator(['hemi-stars']);
  for (let i = 0; i < 140; i++) {
    const x = rng.between(0, w);
    const y = rng.between(0, h - 120);
    const r = rng.realInRange(0.6, 1.8);
    g.fillStyle(0xffffff, rng.realInRange(0.25, 0.9));
    g.fillCircle(x, y, r);
  }
  g.generateTexture(key, w, h);
  g.destroy();
}

/** A tileable silhouette skyline for the mid parallax layer (drawn white, tinted per-plane). */
function makeMountains(scene: Phaser.Scene): void {
  const key = 'mountains';
  if (scene.textures.exists(key)) return;
  const w = VIEW.WIDTH;
  const h = 260;
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  const rng = new Phaser.Math.RandomDataGenerator(['hemi-peaks']);
  g.fillStyle(0xffffff, 1);
  // Seamless tiling: the ridge must start and end at the SAME height so the
  // left edge meets the right edge with no notch when the TileSprite wraps.
  const edgeY = 150;
  const pts: Phaser.Types.Math.Vector2Like[] = [{ x: 0, y: edgeY }];
  let x = rng.between(60, 120);
  while (x < w - 60) {
    pts.push({ x, y: rng.between(30, 150) });
    x += rng.between(70, 150);
  }
  pts.push({ x: w, y: edgeY });
  // Close the polygon down through the bottom corners so it fills to the base.
  g.beginPath();
  g.moveTo(0, h);
  for (const p of pts) g.lineTo(p.x!, p.y!);
  g.lineTo(w, h);
  g.closePath();
  g.fillPath();
  g.generateTexture(key, w, h);
  g.destroy();
}

/** A tall plane-locked barrier: bright edges + a striped energy-field body. */
function makeBarrier(scene: Phaser.Scene, key: string, color: number): void {
  if (scene.textures.exists(key)) return;
  const w = BARRIER.WIDTH;
  const h = BARRIER.HEIGHT;
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  // Soft outer glow
  g.fillStyle(color, 0.28);
  g.fillRoundedRect(0, 0, w, h, 8);
  // Translucent field body
  g.fillStyle(color, 0.55);
  g.fillRoundedRect(3, 3, w - 6, h - 6, 6);
  // Diagonal energy stripes for a "force field" read
  g.fillStyle(0xffffff, 0.18);
  for (let y = 8; y < h; y += 26) {
    g.fillRect(4, y, w - 8, 6);
  }
  // Bright vertical edges
  g.fillStyle(0xffffff, 0.5);
  g.fillRect(3, 3, 3, h - 6);
  g.fillRect(w - 6, 3, 3, h - 6);
  g.generateTexture(key, w, h);
  g.destroy();
}


/** A thin ring used for the dash-activation shockwave burst. */
function makeShockRing(scene: Phaser.Scene): void {
  const key = 'shock-ring';
  if (scene.textures.exists(key)) return;
  const size = 128;
  const c = size / 2;
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  g.lineStyle(8, 0xffffff, 1);
  g.strokeCircle(c, c, c - 8);
  g.generateTexture(key, size, size);
  g.destroy();
}

function makeCoin(scene: Phaser.Scene): void {
  const key = 'coin';
  if (scene.textures.exists(key)) return;
  const r = COIN.RADIUS;
  const size = r * 2 + 6;
  const c = size / 2;
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  // Outer glow
  g.fillStyle(COIN.COLOR_GLOW, 0.35);
  g.fillCircle(c, c, r + 3);
  // Token body (Hemi orange)
  g.fillStyle(COIN.COLOR, 1);
  g.fillCircle(c, c, r);
  // Inner ring
  g.lineStyle(2, 0xffffff, 0.55);
  g.strokeCircle(c, c, r - 3);
  // Hemi mark: a white mountain-range glyph (two peaks) — the brand's motif.
  g.fillStyle(0xffffff, 0.95);
  const baseY = c + r * 0.42;
  const pk = r * 0.62;
  g.beginPath();
  g.moveTo(c - pk, baseY);
  g.lineTo(c - pk * 0.35, baseY - pk * 0.95); // left peak
  g.lineTo(c - pk * 0.02, baseY - pk * 0.35); // valley
  g.lineTo(c + pk * 0.38, baseY - pk * 1.15); // right (taller) peak
  g.lineTo(c + pk, baseY);
  g.closePath();
  g.fillPath();
  g.generateTexture(key, size, size);
  g.destroy();
}

function makeSparkle(scene: Phaser.Scene): void {
  const key = 'sparkle';
  if (scene.textures.exists(key)) return;
  const size = 10;
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  g.fillStyle(0xfff7cc, 1);
  g.fillCircle(size / 2, size / 2, size / 2);
  g.generateTexture(key, size, size);
  g.destroy();
}

function makeObstacle(
  scene: Phaser.Scene,
  key: string,
  w: number,
  h: number,
  color: number
): void {
  if (scene.textures.exists(key)) return;
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  // Danger glow band
  g.fillStyle(OBSTACLE.COLOR_GLOW, 0.3);
  g.fillRoundedRect(0, 0, w, h, 6);
  // Body
  g.fillStyle(color, 1);
  g.fillRoundedRect(2, 2, w - 4, h - 4, 5);
  // Dark angled slash for a spiky, hazardous read
  g.fillStyle(0x000000, 0.22);
  g.fillTriangle(2, h - 2, w - 2, h - 2, w - 2, h * 0.45);
  g.generateTexture(key, w, h);
  g.destroy();
}

// Unused function - kept for potential future use
// function makeRoundedRect(
//   scene: Phaser.Scene,
//   key: string,
//   w: number,
//   h: number,
//   color: number,
//   radius: number
// ): void {
//   if (scene.textures.exists(key)) return;
//   const g = scene.make.graphics({ x: 0, y: 0 }, false);
//   // Soft outer glow band
//   g.fillStyle(color, 0.25);
//   g.fillRoundedRect(0, 0, w, h, radius + 3);
//   // Body
//   g.fillStyle(color, 1);
//   g.fillRoundedRect(2, 2, w - 4, h - 4, radius);
//   // Inner highlight
//   g.fillStyle(0xffffff, 0.35);
//   g.fillRoundedRect(6, 6, w - 12, (h - 12) * 0.4, radius * 0.6);
//   g.generateTexture(key, w, h);
//   g.destroy();
// }

function makeGround(scene: Phaser.Scene): void {
  const key = 'ground';
  if (scene.textures.exists(key)) return;
  const w = VIEW.WIDTH;
  const h = WORLD.GROUND_HEIGHT;
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  g.fillStyle(0x1c2130, 1);
  g.fillRect(0, 0, w, h);
  // Top edge accent line
  g.fillStyle(0x2f3a55, 1);
  g.fillRect(0, 0, w, 4);
  // Subtle repeating tread marks for motion parallax readability
  g.fillStyle(0x161a26, 1);
  for (let x = 0; x < w; x += 48) {
    g.fillRect(x, 14, 26, 6);
  }
  g.generateTexture(key, w, h);
  g.destroy();
}

function makeParticle(scene: Phaser.Scene): void {
  const key = 'dust';
  if (scene.textures.exists(key)) return;
  const size = 12;
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  g.fillStyle(0xffffff, 1);
  g.fillCircle(size / 2, size / 2, size / 2);
  g.generateTexture(key, size, size);
  g.destroy();
}
