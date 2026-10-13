(() => {
  "use strict";

  if (document.body.dataset.route !== "home") return;
  if (document.getElementById("principles-film")) return;

  const host = document.querySelector(".hero-copy");
  if (!host || typeof HTMLDialogElement === "undefined") return;
  if (!HTMLDialogElement.prototype.showModal) return;

  const LABELS = {
    en: [
      "Explore our principles", "Skip",
      "FREEDOM", "KNOWLEDGE", "OPPORTUNITY"
    ],
    "zh-Hans": [
      "观看理念动态展示", "跳过",
      "自由", "知识", "机会"
    ],
    "zh-Hant": [
      "觀看理念動態展示", "跳過",
      "自由", "知識", "機會"
    ],
    ja: [
      "理念のアニメーションを見る", "スキップ",
      "自由", "知識", "機会"
    ],
    ko: [
      "가치 애니메이션 보기", "건너뛰기",
      "자유", "지식", "기회"
    ],
    fr: [
      "Découvrir nos principes", "Passer",
      "LIBERTÉ", "SAVOIR", "OPPORTUNITÉS"
    ],
    es: [
      "Explorar nuestros principios", "Omitir",
      "LIBERTAD", "CONOCIMIENTO", "OPORTUNIDADES"
    ]
  };

  const labels = LABELS[document.documentElement.lang] || LABELS.en;
  const words = labels.slice(2);

  const make = (tag, className, value) => {
    const element = document.createElement(tag);
    element.className = className;
    if (value) element.textContent = value;
    return element;
  };

  const row = make("div", "principles-launch-row");
  const launch = make("button", "principles-launch", labels[0]);

  launch.type = "button";
  launch.setAttribute("aria-haspopup", "dialog");
  launch.setAttribute("aria-controls", "principles-film");
  row.append(launch);

  const dialog = make("dialog", "principles-film");
  dialog.id = "principles-film";
  dialog.setAttribute("aria-label", labels[0]);

  const stage = make("div", "principles-film__stage");
  const canvas = make("canvas", "principles-film__canvas");

  canvas.setAttribute("role", "img");
  canvas.setAttribute("aria-label", words.join(" · "));

  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) return;

  const skip = make("button", "principles-film__skip", labels[1]);
  skip.type = "button";

  stage.append(canvas);
  dialog.append(stage, skip);
  document.body.append(dialog);
  host.append(row);

  const DURATION = 7800;
  const FONT = "Arial, Helvetica, sans-serif";

  const colors = {
    bg: "#101113",
    fg: "#f5f2eb",
    red: "#ee3e43"
  };

  const root = document.documentElement;
  const motion = matchMedia("(prefers-reduced-motion: reduce)");

  const reduced = () =>
    motion.matches || root.classList.contains("reduce-motion");

  const clamp = value => Math.max(0, Math.min(1, value));
  const mix = (a, b, t) => a + (b - a) * t;
  const ease = value => 1 - Math.pow(1 - clamp(value), 4);

  const range = (t, a, b) => {
    const value = clamp((t - a) / (b - a));
    return value * value * (3 - 2 * value);
  };

  let w = 0;
  let h = 0;
  let frame = 0;
  let timer = 0;
  let started = 0;
  let closing = false;
  let savedOverflow = "";
  let savedPriority = "";

  function text(value, x, y, size, options = {}) {
    ctx.save();
    ctx.font = `${options.weight || 900} ${size}px ${FONT}`;
    ctx.textAlign = options.align || "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = options.color || colors.fg;
    ctx.strokeStyle = options.color || colors.fg;

    if (options.outline) {
      ctx.lineWidth = options.line || 0.8;
      ctx.strokeText(value, x, y);
    } else {
      ctx.fillText(value, x, y);
    }

    ctx.restore();
  }

  function fit(value, available) {
    ctx.font = `900 100px ${FONT}`;

    return Math.min(
      220,
      h * 0.28,
      100 * available / ctx.measureText(value).width
    );
  }

  const word = (value, y, size, options) =>
    text(value, w * 0.5, y, size, options);

  function draw(t) {
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, w, h);

    const mid = h * 0.46;
    const fw = fit(words[0], w * 0.91);
    const kw = fit(words[1], w * 0.92);
    const ow = fit(words[2], w * 0.93);

    if (t < 2.5) {
      const enter = ease(t / 1.05);
      const leave = range(t, 2.04, 2.5);

      ctx.save();
      ctx.translate(w * 0.5, mid);
      ctx.rotate(mix(-0.1, 0, enter) - leave * 0.06);
      ctx.scale(1 + leave * 1.5, 1 + leave * 1.5);
      ctx.translate(-w * 0.5, -mid);

      for (let i = -3; i <= 3; i++) {
        ctx.globalAlpha = (1 - leave) * 0.45;

        word(words[0], mid + i * fw * 0.95, fw, {
          outline: true,
          color: "#6d6b72"
        });
      }

      ctx.globalAlpha = 1 - leave;

      for (let slice = 0; slice < 9; slice++) {
        ctx.save();

        const top = mid - fw * 0.59 + slice * fw * 0.125;

        ctx.beginPath();
        ctx.rect(-w, top, w * 3, fw * 0.128);
        ctx.clip();

        const stagger = ease((t - slice * 0.026) / 0.94);

        ctx.translate(
          (slice % 2 ? 1 : -1) * w * 0.66 * (1 - stagger),
          0
        );

        word(words[0], mid, fw, {
          color: slice === 4 && t < 0.8 ? colors.red : colors.fg
        });

        ctx.restore();
      }

      ctx.fillStyle = colors.red;

      ctx.fillRect(
        w * 0.045,
        mid + fw * 0.65,
        w * 0.91 * enter,
        Math.max(3, fw * 0.04)
      );

      ctx.restore();
    } else if (t < 4.9) {
      const local = (t - 2.5) / 2.4;
      const arrive = range(local, 0, 0.18);
      const settle = range(local, 0.65, 1);

      ctx.save();
      ctx.translate(w * 0.5, mid);
      ctx.rotate((1 - settle) * -0.045);

      for (let i = 12; i >= 0; i--) {
        const depth = i + (1 - local) * 2.2;
        const scale = Math.pow(0.79, depth);

        ctx.save();
        ctx.scale(scale, scale);
        ctx.translate(
          (1 - settle) * i * 8,
          (1 - settle) * i * -9
        );

        ctx.globalAlpha = arrive * (0.18 + 0.8 * (1 - i / 13));

        text(
          words[1],
          0,
          0,
          kw * (1 + (1 - settle) * 0.65),
          {
            outline: i !== 0 || local < 0.72,
            color: i % 4 === 0 ? colors.red : colors.fg,
            line: 1.1 / scale
          }
        );

        ctx.restore();
      }

      ctx.restore();

      const curtain = range(local, 0.87, 1);

      ctx.fillStyle = colors.red;
      ctx.fillRect(w * (1 - curtain), 0, w * curtain, h);
    } else if (t < 6.6) {
      const local = (t - 4.9) / 1.7;
      const aligned = range(local, 0.05, 0.8);

      ctx.fillStyle = colors.red;
      ctx.fillRect(0, 0, w, h);

      for (let i = -3; i <= 3; i++) {
        ctx.save();

        ctx.translate(
          (i % 2 ? -1 : 1) * (1 - aligned) * w * 0.4,
          0
        );

        word(words[2], mid + i * ow * 0.93, ow, {
          outline: i !== 0,
          color: i === 0 ? colors.bg : "#651b23",
          line: 1
        });

        ctx.restore();
      }

      const shutter = range(local, 0.75, 1);

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h * 0.5 * shutter);
      ctx.fillRect(
        0,
        h - h * 0.5 * shutter,
        w,
        h * 0.5 * shutter
      );
    } else {
      const enter = ease((t - 6.6) / 0.82);

      const size = Math.min(
        ...words.map(value => fit(value, w * 0.86)),
        h * 0.15
      );

      words.forEach((value, i) => {
        ctx.save();

        const y = mid + (i - 1) * size * 1.18;

        ctx.beginPath();
        ctx.rect(0, y - size * 0.55, w, size * 1.1);
        ctx.clip();

        text(
          value,
          w * 0.07,
          y + size * (1 - ease((t - 6.6 - i * 0.065) / 0.8)),
          size,
          {
            align: "left",
            color: i === 2 ? colors.red : colors.fg
          }
        );

        ctx.restore();
      });

      ctx.fillStyle = colors.red;
      ctx.fillRect(
        w * 0.07,
        mid - size * 2.05,
        40 * enter,
        3
      );

      text("SENZOVIA", w * 0.07, mid + size * 2.55, 12, {
        align: "left",
        weight: 400,
        color: "#b9babf"
      });
    }
  }

  function resize() {
    const box = stage.getBoundingClientRect();

    w = Math.max(1, box.width);
    h = Math.max(1, box.height);

    const ratio = Math.min(devicePixelRatio || 1, 2);

    canvas.width = Math.round(w * ratio);
    canvas.height = Math.round(h * ratio);

    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function cleanup() {
    cancelAnimationFrame(frame);
    clearTimeout(timer);

    dialog.classList.remove("is-closing");
    closing = false;

    if (savedOverflow) {
      root.style.setProperty(
        "overflow",
        savedOverflow,
        savedPriority
      );
    } else {
      root.style.removeProperty("overflow");
    }

    if (launch.isConnected) {
      launch.focus({ preventScroll: true });
    }
  }

  function close(immediate = false) {
    if (!dialog.open) return;

    cancelAnimationFrame(frame);
    clearTimeout(timer);

    if (immediate || reduced()) {
      dialog.close();
      return;
    }

    closing = true;
    dialog.classList.add("is-closing");
    timer = setTimeout(() => dialog.close(), 320);
  }

  function tick(now) {
    if (!dialog.open || closing) return;

    const elapsed = Math.min(now - started, DURATION);
    draw(elapsed / 1000);

    if (elapsed >= DURATION) {
      close();
    } else {
      frame = requestAnimationFrame(tick);
    }
  }

  launch.addEventListener("click", () => {
    if (dialog.open || document.querySelector("dialog[open]")) {
      return;
    }

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

  dialog.addEventListener("cancel", event => {
    event.preventDefault();
    close(true);
  });

  dialog.addEventListener("close", cleanup);

  window.addEventListener("pagehide", () => close(true));

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) close(true);
  });

  window.addEventListener("resize", () => {
    if (!dialog.open || closing) return;

    resize();

    draw(
      reduced()
        ? DURATION / 1000
        : Math.min(
            (performance.now() - started) / 1000,
            DURATION / 1000
          )
    );
  });

  motion.addEventListener("change", () => {
    if (reduced()) close(true);
  });

  new MutationObserver(() => {
    if (dialog.open && reduced()) close(true);
  }).observe(root, {
    attributes: true,
    attributeFilter: ["class"]
  });
})();