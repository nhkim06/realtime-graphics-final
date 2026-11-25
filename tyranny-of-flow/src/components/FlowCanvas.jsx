import { useEffect, useRef } from "react";

/**
 * 작품의 TouchDesigner 네트워크를 브라우저에서 단순화해 재현한 캔버스.
 * - 이동하는 방출 지점(noise) → 입자 생성/재생성(life)
 * - 입자의 이동 경로 = 붉은 실(trail)
 * - 입자 위치마다 뉴스 카드 + 작은 붉은 정육면체
 *
 * mode: "idle" | "approach" | "turn" | "palm" | "down"
 */

const PRESETS = {
  idle: { speed: 1, yaw: 0, zoom: 1, cardAlpha: 0.95, threadAlpha: 0.5, spread: 1 },
  approach: { speed: 2.4, yaw: 0, zoom: 1.45, cardAlpha: 1, threadAlpha: 0.75, spread: 1.15 },
  turn: { speed: 1.7, yaw: 0.9, zoom: 1.2, cardAlpha: 1, threadAlpha: 0.65, spread: 1 },
  palm: { speed: 0.08, yaw: 0, zoom: 0.9, cardAlpha: 0.18, threadAlpha: 0.18, spread: 0.85 },
  down: { speed: 2.8, yaw: -0.25, zoom: 1.6, cardAlpha: 1, threadAlpha: 0.85, spread: 1.3 },
};

const CARD_TINTS = ["#3a3633", "#6b6560", "#2f5d3a", "#24211f", "#8a8580", "#3b4a6b", "#4a4542", "#a39d95", "#2a2a2a", "#7a2a22"];

function makeCardSprites(n = 10) {
  const sprites = [];
  for (let i = 0; i < n; i++) {
    const c = document.createElement("canvas");
    const w = 64;
    const h = 44 + Math.round(Math.random() * 30);
    c.width = w;
    c.height = h;
    const g = c.getContext("2d");
    const dark = Math.random() < 0.12;
    g.fillStyle = dark ? "#1a1a1a" : "#f4f2ee";
    g.fillRect(0, 0, w, h);
    // 이미지 블록
    const tint = CARD_TINTS[i % CARD_TINTS.length];
    g.fillStyle = tint;
    const imgSide = Math.random() < 0.5;
    const textOnly = Math.random() < 0.3;
    if (!textOnly) {
      if (imgSide) g.fillRect(4, 4, w * 0.42, h - 8);
      else g.fillRect(4, 4, w - 8, h * 0.42);
    }
    // 텍스트 줄
    g.fillStyle = dark ? "#777" : "#9a958d";
    const x0 = textOnly ? 6 : imgSide ? w * 0.42 + 8 : 6;
    const y0 = textOnly ? 7 : imgSide ? 7 : h * 0.42 + 9;
    for (let y = y0; y < h - 4; y += 5) {
      g.fillRect(x0, y, (w - x0 - 6) * (0.55 + Math.random() * 0.45), 2);
    }
    sprites.push(c);
  }
  return sprites;
}

// 부드러운 의사 노이즈 (사인 합)
const n1 = (t, a, b, c) => Math.sin(t * a) * 0.6 + Math.sin(t * b + 1.7) * 0.3 + Math.sin(t * c + 4.1) * 0.1;

export default function FlowCanvas({ mode = "idle", interactive = false, density = 1, className = "" }) {
  const canvasRef = useRef(null);
  const modeRef = useRef(mode);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const sprites = makeCardSprites(12);

    let W = 0, H = 0, dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = canvas.getBoundingClientRect();
      W = r.width;
      H = r.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const isSmall = window.innerWidth < 768;
    const COUNT = Math.round((isSmall ? 170 : 320) * density);
    const TRAIL = 14;
    const MAX_LIFE = 1;

    const cur = { ...PRESETS.idle };
    let t = Math.random() * 100;
    let flowT = 0;

    const emitter = { x: 0, y: 0, z: 0 };
    const emitterAt = (tt) => ({
      x: n1(tt, 0.31, 0.53, 1.3) * 1.6,
      y: n1(tt + 20, 0.27, 0.61, 1.1) * 0.9,
      z: n1(tt + 50, 0.22, 0.47, 0.9) * 1.2,
    });

    const spawn = (p, initial) => {
      const e = emitterAt(flowT);
      p.x = e.x + (Math.random() - 0.5) * 0.3;
      p.y = e.y + (Math.random() - 0.5) * 0.3;
      p.z = e.z + (Math.random() - 0.5) * 0.3;
      p.life = initial ? Math.random() * MAX_LIFE : 0;
      p.maxLife = 0.6 + Math.random() * 0.4;
      p.trail = [];
      p.rot = Math.random() * Math.PI * 2;
      p.rotV = (Math.random() - 0.5) * 3;
      p.flip = Math.random() * Math.PI * 2;
      p.sprite = sprites[(Math.random() * sprites.length) | 0];
      p.kind = Math.random() < 0.13 ? "cube" : "card";
      p.size = 0.55 + Math.random() * 0.7;
      // 확산 방향 (흐름이 화면 오른쪽으로 쏟아지는 느낌)
      p.dx = 1.2 + Math.random() * 1.2;
      p.dy = (Math.random() - 0.5) * 1.4;
      p.dz = (Math.random() - 0.5) * 1.6;
    };

    const parts = Array.from({ length: COUNT }, () => {
      const p = {};
      spawn(p, true);
      // 초기 프레임부터 화면이 채워지도록 미리 흘려보냄
      const pre = p.life * 1.2;
      p.x += p.dx * pre;
      p.y += p.dy * pre;
      p.z += p.dz * pre;
      return p;
    });

    const onMove = (e) => {
      const r = canvas.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
      mouseRef.current.y = ((e.clientY - r.top) / r.height - 0.5) * 2;
    };
    if (interactive) window.addEventListener("pointermove", onMove);

    let raf;
    let last = performance.now();
    let visible = true;
    const io = new IntersectionObserver(([en]) => (visible = en.isIntersecting));
    io.observe(canvas);

    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (!visible) return;

      // 프리셋으로 부드럽게 보간
      const target = PRESETS[modeRef.current] || PRESETS.idle;
      const k = 1 - Math.pow(0.04, dt);
      for (const key in target) cur[key] += (target[key] - cur[key]) * k;

      const speed = cur.speed * (reduced ? 0.35 : 1);
      t += dt;
      flowT += dt * speed * 0.5;

      const e = emitterAt(flowT);
      emitter.x = e.x;
      emitter.y = e.y;
      emitter.z = e.z;

      // 카메라
      const turnWobble = modeRef.current === "turn" ? Math.sin(t * 0.7) * 0.35 : 0;
      const yaw = cur.yaw + turnWobble + (interactive ? mouseRef.current.x * 0.35 : 0) + Math.sin(t * 0.13) * 0.08;
      const pitch = 0.12 + (interactive ? mouseRef.current.y * 0.15 : 0) + Math.sin(t * 0.17) * 0.04;
      const cy = Math.cos(yaw), sy = Math.sin(yaw);
      const cp = Math.cos(pitch), sp = Math.sin(pitch);
      const camDist = 6 / cur.zoom;
      const fov = Math.min(W, H) * 1.05;
      const cx0 = W * 0.58, cy0 = H * 0.5;

      // 카메라 주시 대상 = 방출 지점을 느리게 따라감
      const look = { x: e.x * 0.5 + 1.6, y: e.y * 0.4, z: e.z * 0.3 };

      const project = (x, y, z) => {
        let X = x - look.x, Y = y - look.y, Z = z - look.z;
        let x1 = X * cy - Z * sy;
        let z1 = X * sy + Z * cy;
        let y1 = Y * cp - z1 * sp;
        let z2 = Y * sp + z1 * cp + camDist;
        if (z2 < 0.3) return null;
        const s = fov / z2;
        return { x: cx0 + x1 * s, y: cy0 + y1 * s, s, z: z2 };
      };

      // 입자 갱신
      for (const p of parts) {
        p.life += (dt * speed * 0.35) / p.maxLife;
        if (p.life >= MAX_LIFE) {
          spawn(p, false);
          continue;
        }
        const f = dt * speed * 0.7 * cur.spread;
        const nx = Math.sin(p.y * 1.3 + flowT * 1.1) * 0.6;
        const ny = Math.sin(p.z * 1.1 + flowT * 0.9 + 2) * 0.5;
        const nz = Math.sin(p.x * 0.9 + flowT * 1.3 + 4) * 0.6;
        p.x += (p.dx + nx) * f;
        p.y += (p.dy + ny) * f;
        p.z += (p.dz + nz) * f;
        p.rot += p.rotV * dt * Math.max(speed, 0.15);
        p.flip += dt * 1.6 * Math.max(speed, 0.15);
        if (speed > 0.15 || p.trail.length < 2) {
          p.trail.push(p.x, p.y, p.z);
          if (p.trail.length > TRAIL * 3) p.trail.splice(0, 3);
        }
      }

      // 그리기
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = "rgba(10,9,9,0.55)";
      ctx.fillRect(0, 0, W, H);

      // 붉은 실
      ctx.globalCompositeOperation = "lighter";
      ctx.lineWidth = 1;
      for (const p of parts) {
        const tr = p.trail;
        if (tr.length < 6) continue;
        ctx.beginPath();
        let started = false;
        for (let i = 0; i < tr.length; i += 3) {
          const q = project(tr[i], tr[i + 1], tr[i + 2]);
          if (!q) continue;
          if (!started) { ctx.moveTo(q.x, q.y); started = true; }
          else ctx.lineTo(q.x, q.y);
        }
        const a = cur.threadAlpha * (1 - p.life * 0.7) * 0.9;
        ctx.strokeStyle = `rgba(185,26,22,${a})`;
        ctx.stroke();
      }
      // 방출 지점에서 뻗어나가는 붉은 다발
      const ep = project(emitter.x, emitter.y, emitter.z);
      if (ep) {
        for (let i = 0; i < 60; i++) {
          const p = parts[(i * 7) % parts.length];
          const q = project(p.x, p.y, p.z);
          if (!q) continue;
          ctx.strokeStyle = `rgba(160,20,18,${0.14 * cur.threadAlpha})`;
          ctx.beginPath();
          ctx.moveTo(ep.x, ep.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
        }
      }
      ctx.globalCompositeOperation = "source-over";

      // 깊이 정렬 후 카드/정육면체
      const drawList = [];
      for (const p of parts) {
        const q = project(p.x, p.y, p.z);
        if (q) drawList.push([q, p]);
      }
      drawList.sort((a, b) => b[0].z - a[0].z);

      for (const [q, p] of drawList) {
        // Lookup Texture처럼 수명에 따라 크기 변화
        const lifeScale = Math.sin(Math.min(p.life, 1) * Math.PI) ** 0.6;
        const depthFade = Math.min(1, 9 / q.z);
        if (p.kind === "cube") {
          const sz = 0.05 * q.s * p.size * (0.5 + lifeScale);
          ctx.globalAlpha = Math.min(1, cur.cardAlpha + 0.3) * depthFade;
          ctx.fillStyle = "#d21f1c";
          ctx.save();
          ctx.translate(q.x, q.y);
          ctx.rotate(p.rot);
          ctx.fillRect(-sz / 2, -sz / 2, sz, sz);
          ctx.fillStyle = "rgba(0,0,0,0.35)";
          ctx.fillRect(-sz / 2, sz * 0.1, sz, sz * 0.4);
          ctx.restore();
        } else {
          const base = 0.2 * q.s * p.size * lifeScale;
          if (base < 1.2) continue;
          const sp2 = p.sprite;
          const w = base, h = (base * sp2.height) / sp2.width;
          ctx.globalAlpha = cur.cardAlpha * depthFade * Math.min(1, lifeScale * 2);
          ctx.save();
          ctx.translate(q.x, q.y);
          ctx.rotate(p.rot);
          ctx.scale(Math.cos(p.flip) * 0.85 + 0.15 * Math.sign(Math.cos(p.flip) || 1), 1);
          ctx.drawImage(sp2, -w / 2, -h / 2, w, h);
          ctx.restore();
        }
      }
      ctx.globalAlpha = 1;
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      if (interactive) window.removeEventListener("pointermove", onMove);
    };
  }, [interactive, density]);

  return <canvas ref={canvasRef} className={`block h-full w-full ${className}`} aria-hidden="true" />;
}
