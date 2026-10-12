(() => {
  "use strict";

  const route = document.body.dataset.route;
  if (!["research", "research-full"].includes(route)) return;
  if (document.getElementById("science-intro")) return;

  const intro = document.querySelector(".page-intro");
  if (!intro || typeof HTMLDialogElement === "undefined") return;
  if (!HTMLDialogElement.prototype.showModal) return;

  const LABELS = {
    en: ["Explore science in motion", "Skip", "Science & Innovation",
      "CURIOSITY", "STRUCTURE", "DISCOVERY", "Freedom", "to discover.",
      "An artistic particle animation, not a representation of research data."],
    "zh-Hans": ["观看科研动态展示", "跳过", "科学与创新",
      "好奇", "结构", "发现", "自由探索", "追求发现。",
      "粒子动画为艺术演绎，不代表实际科研数据。"],
    "zh-Hant": ["觀看科研動態展示", "跳過", "科學與創新",
      "好奇", "結構", "發現", "自由探索", "追求發現。",
      "粒子動畫為藝術演繹，不代表實際科研數據。"],
    ja: ["科学のアニメーションを見る", "スキップ", "科学とイノベーション",
      "好奇心", "構造", "発見", "自由な探究から", "新たな発見へ。",
      "この粒子アニメーションは芸術的な表現であり、実際の研究データではありません。"],
    ko: ["과학 애니메이션 보기", "건너뛰기", "과학과 혁신",
      "호기심", "구조", "발견", "자유로운 탐구", "새로운 발견.",
      "이 입자 애니메이션은 예술적 표현이며 실제 연구 데이터를 나타내지 않습니다."],
    fr: ["Voir la science en mouvement", "Passer", "Science et innovation",
      "CURIOSITÉ", "STRUCTURE", "DÉCOUVERTE", "La liberté", "de découvrir.",
      "Cette animation de particules est une création artistique, pas une représentation de données scientifiques."],
    es: ["Ver la ciencia en movimiento", "Omitir", "Ciencia e innovación",
      "CURIOSIDAD", "ESTRUCTURA", "DESCUBRIMIENTO", "La libertad", "de descubrir.",
      "Esta animación de partículas es una interpretación artística, no una representación de datos científicos."]
  };

  const labels = LABELS[document.documentElement.lang] || LABELS.en;
  const make = (tag, className, value) => {
    const element = document.createElement(tag);
    element.className = className;
    if (value) element.textContent = value;
    return element;
  };

  const row = make("div", "science-launch-row");
  const launch = make("button", "button outline", labels[0]);
  launch.type = "button";
  launch.setAttribute("aria-haspopup", "dialog");
  launch.setAttribute("aria-controls", "science-intro");
  row.append(launch);

  const dialog = make("dialog", "science-intro");
  dialog.id = "science-intro";
  dialog.setAttribute("aria-label", labels[2]);
  const header = make("div", "science-intro__header");
  const skip = make("button", "science-intro__skip", labels[1]);
  skip.type = "button";
  header.append(
    make("span", "science-intro__brand", "SENZOVIA"),
    make("span", "science-intro__title", labels[2]),
    skip
  );
  const stage = make("div", "science-intro__stage");
  const canvas = make("canvas", "science-intro__canvas");
  canvas.setAttribute("role", "img");
  canvas.setAttribute("aria-label", labels[8]);
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) return;
  stage.append(canvas);
  dialog.append(header, stage);
  document.body.append(dialog);
  intro.append(row);

  const DURATION = 8400;
  const TAU = Math.PI * 2;
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const root = document.documentElement;
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const mix = (a, b, t) => a + (b - a) * t;
  const range = (t, a, b) => {
    const v = clamp((t - a) / (b - a));
    return v * v * (3 - 2 * v);
  };
  const reduced = () => motion.matches || root.classList.contains("reduce-motion");
  let seed = 917;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const particles = Array.from({ length: 1728 }, (_, i) => {
    const z = 1 - 2 * (i + 0.5) / 1728;
    const angle = i * 2.3999632297;
    return {
      i, u: (i % 72) / 72 * TAU, v: Math.floor(i / 72) / 24 * TAU,
      x: (random() - 0.5) * 4.8, y: (random() - 0.5) * 3.4,
      z: (random() - 0.5) * 4, r: random(),
      sx: Math.sqrt(1 - z * z) * Math.cos(angle), sy: z,
      sz: Math.sqrt(1 - z * z) * Math.sin(angle)
    };
  });

  let width = 0, height = 0, frame = 0, timer = 0;
  let started = 0, closing = false, savedOverflow = "", savedPriority = "";

  function text(value, x, y, size, serif = false) {
    ctx.font = `400 ${size}px ${serif ? "Georgia,serif" : "Arial,Helvetica,sans-serif"}`;
    ctx.textBaseline = "middle";
    ctx.fillText(value, x, y);
  }

  function draw(t) {
    const w = width, h = height;
    ctx.fillStyle = "#101113";
    ctx.fillRect(0, 0, w, h);
    const glow = ctx.createRadialGradient(w * 0.5, h * 0.47, 2, w * 0.5, h * 0.47, w * 0.65);
    glow.addColorStop(0, "#242429");
    glow.addColorStop(1, "#101113");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#ffffff07";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 20; x < w; x += 40) { ctx.moveTo(x, 0); ctx.lineTo(x, h); }
    for (let y = 15; y < h; y += 40) { ctx.moveTo(0, y); ctx.lineTo(w, y); }
    ctx.stroke();

    const gather = range(t, 0.35, 2.5), grid = range(t, 3.1, 4.65);
    const globe = range(t, 5.3, 6.95), finish = range(t, 6.8, 8.1);
    const angle = 0.3 + t * 0.22, tilt = -0.38 + Math.sin(t * 0.38) * 0.3;
    const scale = Math.min(w * 0.285, h * 0.47);
    const cx = mix(w * 0.5, w > 550 ? w * 0.72 : w * 0.5, finish);
    const cy = mix(h * 0.47, w > 550 ? h * 0.47 : h * 0.34, finish);
    const cloud = particles.map(p => {
      const radius = 0.83 + 0.32 * Math.cos(p.v + t * 0.32);
      const torus = [radius * Math.cos(p.u), 0.32 * Math.sin(p.v + t * 0.32), radius * Math.sin(p.u)];
      const chaos = [p.x + Math.sin(t * 0.5 + p.u) * 0.2, p.y + Math.cos(t * 0.4 + p.v) * 0.2, p.z];
      const lattice = [(p.i % 48) / 47 * 2.7 - 1.35,
        Math.sin(p.u * 1.2 + t * 1.6) * 0.13 + Math.cos(p.v + t) * 0.13,
        Math.floor(p.i / 48) / 35 * 2.3 - 1.15];
      const sphere = [p.sx * 0.97, p.sy * 0.97, p.sz * 0.97];
      const xyz = chaos.map((n, i) => mix(mix(mix(n, torus[i], gather), lattice[i], grid), sphere[i], globe));
      const rx = xyz[0] * Math.cos(angle) + xyz[2] * Math.sin(angle);
      const rz = -xyz[0] * Math.sin(angle) + xyz[2] * Math.cos(angle);
      const ry = xyz[1] * Math.cos(tilt) - rz * Math.sin(tilt);
      const depth = xyz[1] * Math.sin(tilt) + rz * Math.cos(tilt);
      const perspective = 3.4 / (3.4 - depth);
      const finalScale = mix(1, w > 550 ? 0.71 : 0.65, finish);
      return {
        x: cx + rx * scale * perspective * finalScale,
        y: cy + ry * scale * perspective * finalScale,
        z: depth, alpha: clamp(0.36 + depth * 0.28 + p.r * 0.2, 0.12, 0.95),
        size: (0.65 + p.r * 0.65) * perspective, red: p.i % 24 < 3
      };
    });

    const structure = gather * (1 - globe * 0.75);
    if (structure > 0.01) {
      ctx.lineWidth = 0.55;
      cloud.forEach((p, i) => {
        const q = cloud[i + (grid > 0.5 ? 48 : 72)];
        if (!q || i % 3 || Math.hypot(p.x - q.x, p.y - q.y) > scale * 0.35) return;
        ctx.strokeStyle = p.red
          ? `rgba(238,62,67,${0.3 * structure})`
          : `rgba(230,230,238,${0.13 * structure})`;
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
      });
    }
    cloud.sort((a, b) => a.z - b.z).forEach(p => {
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.red ? "#ee3e43" : "#f5f2eb";
      ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(0.4, p.size), 0, TAU); ctx.fill();
    });
    ctx.globalAlpha = 1;

    if (t > 1.1 && t < 6.9) {
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(-0.22 - t * 0.13);
      ctx.scale(1, 0.43 + globe * 0.2);
      ctx.strokeStyle = `rgba(238,62,67,${Math.sin(clamp((t - 1.1) / 5.8) * Math.PI) * 0.7})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.ellipse(0, 0, scale * 1.44, scale * 1.44, 0, -0.4, Math.PI * 1.2);
      ctx.stroke(); ctx.restore();
    }
    if (finish > 0) {
      ctx.save(); ctx.globalAlpha = finish;
      const left = w > 550 ? w * 0.07 : w * 0.09;
      const base = w > 550 ? h * 0.38 : h * 0.67;
      ctx.font = "400 100px Georgia,serif";
      const measured = Math.max(ctx.measureText(labels[6]).width, ctx.measureText(labels[7]).width);
      const size = Math.min(w * 0.065, 52, h * 0.09, (w > 550 ? w * 0.4 : w * 0.82) * 100 / measured);
      ctx.fillStyle = "#f5f2eb";
      text(labels[6], left, base, size, true);
      text(labels[7], left, base + size * 1.15, size, true);
      ctx.fillStyle = "#ee3e43";
      ctx.fillRect(left, base + size * 2, 36 * finish, 2);
      ctx.restore();
    } else {
      ctx.fillStyle = "#b9babf";
      text(labels[t < 2.6 ? 3 : t < 5.2 ? 4 : 5], 24, h - 32, 12);
    }
  }

  function resize() {
    const rect = stage.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    const ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function cleanup() {
    cancelAnimationFrame(frame);
    clearTimeout(timer);
    dialog.classList.remove("is-closing");
    closing = false;
    if (savedOverflow) root.style.setProperty("overflow", savedOverflow, savedPriority);
    else root.style.removeProperty("overflow");
    if (launch.isConnected) launch.focus({ preventScroll: true });
  }

  function close(immediate = false) {
    if (!dialog.open) return;
    cancelAnimationFrame(frame);
    clearTimeout(timer);
    if (immediate || reduced()) { dialog.close(); return; }
    closing = true;
    dialog.classList.add("is-closing");
    timer = setTimeout(() => dialog.close(), 320);
  }

  function tick(now) {
    if (!dialog.open || closing) return;
    const elapsed = Math.min(now - started, DURATION);
    draw(elapsed / 1000);
    if (elapsed >= DURATION) close();
    else frame = requestAnimationFrame(tick);
  }

  launch.addEventListener("click", () => {
    if (dialog.open || document.querySelector("dialog[open]")) return;
    savedOverflow = root.style.getPropertyValue("overflow");
    savedPriority = root.style.getPropertyPriority("overflow");
    dialog.showModal();
    root.style.setProperty("overflow", "hidden");
    skip.focus({ preventScroll: true });
    resize();
    started = performance.now();
    if (reduced()) {
      draw(DURATION / 1000);
      timer = setTimeout(() => close(true), 1600);
    } else {
      draw(0);
      frame = requestAnimationFrame(tick);
      timer = setTimeout(() => close(true), DURATION + 650);
    }
  });
  skip.addEventListener("click", () => close(true));
  dialog.addEventListener("cancel", event => { event.preventDefault(); close(true); });
  dialog.addEventListener("close", cleanup);
  window.addEventListener("pagehide", () => close(true));
  document.addEventListener("visibilitychange", () => { if (document.hidden) close(true); });
  window.addEventListener("resize", () => {
    if (!dialog.open || closing) return;
    resize();
    draw(reduced() ? DURATION / 1000 : Math.min((performance.now() - started) / 1000, DURATION / 1000));
  });
  motion.addEventListener("change", () => { if (reduced()) close(true); });
  new MutationObserver(() => {
    if (dialog.open && reduced()) close(true);
  }).observe(root, { attributes: true, attributeFilter: ["class"] });
})();