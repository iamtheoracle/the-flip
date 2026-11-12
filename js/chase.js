/* The Flip — real-time chase engine.
   Standalone and event-driven: owns the canvas, the loop, the pursuit AI and
   the input bindings. Never touches game state; reports through events.

   Events:
     start    {units, escapeNeed}
     hud      {units, speed, los, stress, damage, phase}  (every frame)
     phase    {phase, t}                                  (on change)
     shot     {hit}
     collision{damage}
     escape   {seconds, damage, fired, reward, aftermath, label}
     busted   {reason}
     end      {outcome, ...payload}
*/
(function (global) {
  "use strict";

  const CLASSES = {
    none: {label: "On foot", max: 130, accel: 140, turn: 3.6, aftermath: 0},
    low: {label: "Low-profile", max: 185, accel: 190, turn: 3.5, aftermath: 0},
    standard: {label: "Standard", max: 215, accel: 200, turn: 3.3, aftermath: 1},
    performance: {label: "Performance", max: 255, accel: 230, turn: 3.1, aftermath: 2},
    heavy: {label: "Heavy", max: 195, accel: 165, turn: 2.6, aftermath: 1}
  };

  const BLOCKS = [];
  for (let gx = 0; gx < 4; gx++) {
    for (let gy = 0; gy < 3; gy++) {
      BLOCKS.push({x: 30 + gx * 184, y: 30 + gy * 138, w: 104, h: 72});
    }
  }
  const SPAWNS = [[724, 135], [174, 15], [542, 419], [724, 419]];

  function hitsBlock(x, y, r) {
    for (const b of BLOCKS) {
      if (x > b.x - r && x < b.x + b.w + r && y > b.y - r && y < b.y + b.h + r) return true;
    }
    return false;
  }

  function segEdge(x1, y1, x2, y2, ax, ay, bx, by) {
    const rx = x2 - x1, ry = y2 - y1, sx = bx - ax, sy = by - ay;
    const den = rx * sy - ry * sx;
    if (Math.abs(den) < 1e-9) return false;
    const qx = ax - x1, qy = ay - y1;
    const t = (qx * sy - qy * sx) / den, u = (qx * ry - qy * rx) / den;
    return t >= 0 && t <= 1 && u >= 0 && u <= 1;
  }

  function lineOfSight(x1, y1, x2, y2) {
    for (const b of BLOCKS) {
      if (Math.max(x1, x2) < b.x || Math.min(x1, x2) > b.x + b.w ||
          Math.max(y1, y2) < b.y || Math.min(y1, y2) > b.y + b.h) continue;
      const inA = x1 >= b.x && x1 <= b.x + b.w && y1 >= b.y && y1 <= b.y + b.h;
      const inB = x2 >= b.x && x2 <= b.x + b.w && y2 >= b.y && y2 <= b.y + b.h;
      if (inA || inB) return false;
      if (segEdge(x1, y1, x2, y2, b.x, b.y, b.x + b.w, b.y)) return false;
      if (segEdge(x1, y1, x2, y2, b.x + b.w, b.y, b.x + b.w, b.y + b.h)) return false;
      if (segEdge(x1, y1, x2, y2, b.x + b.w, b.y + b.h, b.x, b.y + b.h)) return false;
      if (segEdge(x1, y1, x2, y2, b.x, b.y + b.h, b.x, b.y)) return false;
    }
    return true;
  }

  function turnTo(angle, target, maxStep) {
    let d = ((target - angle + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
    if (d > maxStep) d = maxStep;
    if (d < -maxStep) d = -maxStep;
    return angle + d;
  }

  class ChaseRun {
    constructor({canvas, modal}) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.modal = modal;
      this.listeners = {};
      this.active = false;
      this.raf = 0;
      this.last = 0;
      this.t = 0;
      this.los = 0;
      this.escapeNeed = 2;
      this.stress = 0;
      this.damage = 0;
      this.contain = 0;
      this.pin = 0;
      this.fired = 0;
      this.reward = 0;
      this.units = [];
      this.lastPhase = "";
      this.vehicleClass = "none";
      this.intensity = 0;
      this.seenX = undefined;
      this.seenY = undefined;
      this.player = {x: 700, y: 273, angle: Math.PI, speed: 0};
      this.keys = {up: false, down: false, left: false, right: false, brake: false};
      this._loop = (now) => this.frame(now);
      this.bindKeys();
    }

    /* ---------- events ---------- */
    on(event, fn) {
      (this.listeners[event] = this.listeners[event] || []).push(fn);
      return this;
    }

    emit(event, payload) {
      (this.listeners[event] || []).forEach((fn) => fn(payload));
    }

    /* ---------- input ---------- */
    resetKeys() {
      for (const k in this.keys) this.keys[k] = false;
    }

    bindKeys() {
      const map = {
        arrowup: "up", w: "up", arrowdown: "down", s: "down",
        arrowleft: "left", a: "left", arrowright: "right", d: "right"
      };
      window.addEventListener("keydown", (e) => {
        if (!this.active) return;
        if (e.key === " " || e.code === "Space") { this.keys.brake = true; e.preventDefault(); return; }
        const n = e.key.toLowerCase();
        if (n === "f") { if (!e.repeat) this.fire(); e.preventDefault(); return; }
        if (map[n]) { this.keys[map[n]] = true; e.preventDefault(); }
      });
      window.addEventListener("keyup", (e) => {
        if (e.key === " " || e.code === "Space") { this.keys.brake = false; return; }
        const n = e.key.toLowerCase();
        if (map[n]) this.keys[map[n]] = false;
      });
      if (!this.modal) return;
      this.modal.querySelectorAll(".chase-pad button").forEach((btn) => {
        const key = btn.dataset.key;
        const on = () => {
          if (key === "fire") { this.fire(); return; }
          if (key in this.keys) this.keys[key] = true;
        };
        const off = () => { if (key in this.keys) this.keys[key] = false; };
        btn.addEventListener("pointerdown", (e) => {
          e.preventDefault();
          on();
          if (btn.setPointerCapture) { try { btn.setPointerCapture(e.pointerId); } catch (_) {} }
        });
        btn.addEventListener("pointerup", off);
        btn.addEventListener("pointercancel", off);
        btn.addEventListener("pointerleave", off);
      });
    }

    /* ---------- lifecycle ---------- */
    start(opts) {
      const o = opts || {};
      this.vehicleClass = o.vehicleClass || this.vehicleClass || "none";
      this.intensity = o.intensity || 0;
      this.reward = o.reward || 0;
      this.active = true;
      this.t = 0;
      this.los = 0;
      this.stress = 0;
      this.damage = 0;
      this.contain = 0;
      this.pin = 0;
      this.fired = 0;
      this.seenX = undefined;
      this.seenY = undefined;
      this.lastPhase = "";
      this.units = [];
      this.player = {x: 700, y: 273, angle: Math.PI, speed: 0};

      const base = Math.max(1, Math.min(4, 1 + Math.floor(this.intensity / 30)));
      const n = Math.min(4, base + (o.units || 0));
      for (let i = 0; i < n; i++) this.units.push(this.spawnUnit(i));
      this.escapeNeed = 1.2 + 0.5 * (this.units.length - 1);

      this.last = performance.now();
      this.resetKeys();
      if (this.modal) this.modal.classList.add("open");
      this.emit("start", {units: this.units.length, escapeNeed: this.escapeNeed});
      this.hudUpdate();
      cancelAnimationFrame(this.raf);
      this.raf = requestAnimationFrame(this._loop);
    }

    stop() {
      this.active = false;
      cancelAnimationFrame(this.raf);
      if (this.modal) this.modal.classList.remove("open");
      this.resetKeys();
    }

    finish(outcome, payload) {
      this.stop();
      this.emit(outcome, payload);
      this.emit("end", Object.assign({outcome: outcome}, payload));
    }

    spawnUnit(i) {
      const s = SPAWNS[i % SPAWNS.length];
      return {
        x: s[0], y: s[1], angle: Math.PI, speed: 100,
        maxSpeed: 170 + (this.intensity > 55 ? 12 : 0),
        timer: 0.8 + i * 0.25,
        targetX: this.player.x, targetY: this.player.y,
        los: false
      };
    }

    /* ---------- shooting ---------- */
    fire() {
      if (!this.active) return;
      let best = null, bd = 1e9;
      for (const u of this.units) {
        const d = Math.hypot(u.x - this.player.x, u.y - this.player.y);
        if (lineOfSight(u.x, u.y, this.player.x, this.player.y) && d < bd) { bd = d; best = u; }
      }
      this.fired += 1;
      this.emit("shot", {hit: !!best});
      if (best) {
        const acc = Math.max(0.15, 0.7 - this.stress / 170 - this.player.speed / 950);
        if (Math.random() < acc) {
          this.units = this.units.filter((u) => u !== best);
          this.stress = Math.min(100, this.stress + 18);
        }
      }
      setTimeout(() => {
        if (!this.active) return;
        this.units.push(this.spawnUnit(this.units.length + 1));
        this.hudUpdate();
      }, 1900);
      this.hudUpdate();
    }

    /* ---------- loop ---------- */
    phaseLabel() {
      if (this.t < 2.5) return "CONTACT";
      if (this.t < 6) return "BREAK";
      if (this.los > 0.35) return "SEPARATION";
      if (this.contain > 0.35) return "CONTAINMENT";
      return "SUSTAIN";
    }

    hudUpdate() {
      const phase = this.phaseLabel();
      if (phase !== this.lastPhase) {
        this.lastPhase = phase;
        this.emit("phase", {phase: phase, t: this.t});
      }
      this.emit("hud", {
        units: this.units.length,
        speed: Math.round(this.player.speed * 0.9),
        los: Math.min(100, Math.round(this.los / this.escapeNeed * 100)),
        stress: Math.round(this.stress),
        damage: Math.round(this.damage),
        phase: phase
      });
    }

    frame(now) {
      if (!this.active) return;
      let dt = (now - this.last) / 1000;
      this.last = now;
      if (!isFinite(dt) || dt <= 0) dt = 0.016;
      if (dt > 0.05) dt = 0.05;
      this.t += dt;
      const p = this.player;
      const cls = CLASSES[this.vehicleClass] || CLASSES.none;

      if (this.keys.up) p.speed = Math.min(cls.max, p.speed + cls.accel * dt);
      else if (this.keys.down) p.speed = Math.max(0, p.speed - 300 * dt);
      else p.speed = Math.max(0, p.speed - 80 * dt);
      if (this.keys.brake) p.speed = Math.max(0, p.speed - 460 * dt);
      const steer = (this.keys.left ? -1 : 0) + (this.keys.right ? 1 : 0);
      if (steer && p.speed > 6) {
        p.angle += steer * cls.turn * dt * (0.4 + 0.6 * Math.min(1, p.speed / cls.max));
      }
      const step = p.speed * dt;
      const dx = Math.cos(p.angle) * step, dy = Math.sin(p.angle) * step;
      if (!hitsBlock(p.x + dx, p.y + dy, 9)) {
        p.x += dx; p.y += dy;
      } else {
        let hit = true;
        if (!hitsBlock(p.x + dx, p.y, 9)) { p.x += dx * 0.9; hit = false; }
        if (!hitsBlock(p.x, p.y + dy, 9)) { p.y += dy * 0.9; hit = false; }
        if (hit) {
          if (p.speed > 140) {
            this.damage = Math.min(100, this.damage + p.speed * 0.055);
            this.emit("collision", {damage: Math.round(this.damage)});
          }
          p.speed *= 0.2;
        } else p.speed *= Math.max(0, 1 - dt * 1.2);
      }
      if (p.x < 12) { p.x = 12; p.speed *= 0.5; }
      if (p.x > 748) { p.x = 748; p.speed *= 0.5; }
      if (p.y < 12) { p.y = 12; p.speed *= 0.5; }
      if (p.y > 448) { p.y = 448; p.speed *= 0.5; }

      let anyLOS = false, nearest = 1e9, close = 0;
      for (const u of this.units) {
        const d = Math.hypot(p.x - u.x, p.y - u.y);
        if (d < nearest) nearest = d;
        u.los = d < 320 && lineOfSight(u.x, u.y, p.x, p.y);
        if (u.los) { anyLOS = true; this.seenX = p.x; this.seenY = p.y; }
      }
      for (const u of this.units) {
        u.timer -= dt;
        if (u.timer <= 0 && this.seenX !== undefined) {
          u.targetX = this.seenX; u.targetY = this.seenY;
          u.timer = 1.2 + Math.random() * 0.7;
        }
        const desired = Math.atan2(u.targetY - u.y, u.targetX - u.x);
        u.angle = turnTo(u.angle, desired, 2.6 * dt);
        const td = Math.hypot(u.targetX - u.x, u.targetY - u.y);
        const want = Math.min(u.maxSpeed, td * 3);
        u.speed += (want - u.speed) * Math.min(1, dt * 3);
        const us = u.speed * dt;
        let moved = false;
        for (const off of [0, 0.6, -0.6, 1.2, -1.2]) {
          const ux = u.x + Math.cos(u.angle + off) * us, uy = u.y + Math.sin(u.angle + off) * us;
          if (!hitsBlock(ux, uy, 9) && ux > 10 && ux < 750 && uy > 10 && uy < 450) {
            u.x = ux; u.y = uy; moved = true; break;
          }
        }
        if (!moved) {
          const dxu = Math.cos(u.angle) * us, dyu = Math.sin(u.angle) * us;
          if (!hitsBlock(u.x + dxu, u.y, 9)) { u.x += dxu; moved = true; }
          else if (!hitsBlock(u.x, u.y + dyu, 9)) { u.y += dyu; moved = true; }
        }
        if (!moved) u.speed *= 0.4;
        const cd = Math.hypot(p.x - u.x, p.y - u.y);
        if (cd < 20) {
          this.damage = Math.min(100, this.damage + 13 * dt);
          p.speed = Math.max(0, p.speed - 55 * dt);
        }
        if (cd < 40) close++;
      }

      if (!anyLOS && this.t > 1.8) this.los += dt;
      else if (anyLOS) this.los = Math.max(0, this.los - dt * 1.5);
      if (close >= 2) this.contain += dt;
      else this.contain = Math.max(0, this.contain - dt * 0.7);
      this.escapeNeed = this.units.length ? 1.2 + 0.5 * (this.units.length - 1) : 1;
      if (nearest < 22) this.pin += dt;
      else this.pin = Math.max(0, this.pin - dt);

      const targetStress = Math.min(100, p.speed / cls.max * 45 + (nearest < 150 ? 35 : 0) + this.damage * 0.25);
      this.stress += (targetStress - this.stress) * Math.min(1, dt * 2.2);

      if (this.los >= this.escapeNeed) {
        this.finish("escape", {
          seconds: Math.round(this.t),
          damage: Math.round(this.damage),
          fired: this.fired,
          reward: this.reward,
          aftermath: cls.aftermath,
          label: cls.label
        });
        return;
      }
      if (this.contain >= 2 || this.pin >= 2.2) { this.finish("busted", {reason: "Boxed in and stopped."}); return; }
      if (this.damage >= 100) { this.finish("busted", {reason: "Catastrophic crash."}); return; }

      this.draw(now);
      this.hudUpdate();
      this.raf = requestAnimationFrame(this._loop);
    }

    /* ---------- render ---------- */
    draw(now) {
      const ctx = this.ctx;
      ctx.clearRect(0, 0, 760, 460);
      ctx.fillStyle = "#0c0d10"; ctx.fillRect(0, 0, 760, 460);
      ctx.strokeStyle = "#191a20"; ctx.lineWidth = 1; ctx.setLineDash([12, 20]);
      [174, 358, 542].forEach((x) => { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 460); ctx.stroke(); });
      [135, 273, 419].forEach((y) => { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(760, y); ctx.stroke(); });
      ctx.setLineDash([]);
      for (const b of BLOCKS) {
        ctx.fillStyle = "#1c1d24"; ctx.fillRect(b.x, b.y, b.w, b.h);
        ctx.strokeStyle = "#2b2c35"; ctx.strokeRect(b.x + 0.5, b.y + 0.5, b.w - 1, b.h - 1);
      }
      ctx.strokeStyle = "rgba(190,60,60,.16)";
      for (const u of this.units) {
        if (!u.los) continue;
        ctx.beginPath(); ctx.moveTo(u.x, u.y); ctx.lineTo(this.player.x, this.player.y); ctx.stroke();
      }
      const flash = Math.floor(now / 220) % 2 === 0;
      for (const u of this.units) this.drawCar(ctx, u, flash ? "#4a7bd0" : "#8ea8d8");
      this.drawCar(ctx, this.player, "#c45c26");
    }

    drawCar(ctx, car, color) {
      ctx.save(); ctx.translate(car.x, car.y); ctx.rotate(car.angle);
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.moveTo(12, 0); ctx.lineTo(-9, -7); ctx.lineTo(-9, 7); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,.5)"; ctx.stroke();
      ctx.restore();
    }
  }

  global.FlipChase = {CLASSES: CLASSES, ChaseRun: ChaseRun};
})(window);
