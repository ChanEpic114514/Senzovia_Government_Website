(() => {
  "use strict";

  // Concept reference: Bruno Imbrizi / Codrops, Interactive Particles.
  // https://github.com/brunoimbrizi/interactive-particles
  // Independent WebGL implementation; no external runtime dependencies.

  if (!["rights", "rights-full"].includes(document.body.dataset.route)) {
    return;
  }

  const anchor = document.querySelector("main .page-intro");

  if (!anchor || document.querySelector(".pride-panel")) {
    return;
  }

  const labels = {
    en: [
      "Freedom & equal opportunity",
      "Move across the flag to set the particles in motion.",
      "Pause",
      "Resume",
      "Replay",
      "Six-colour LGBTQ+ Pride flag",
      "Static display: reduced motion is enabled.",
      "Static flag display."
    ],
    "zh-Hans": [
      "自由与机会平等",
      "移动鼠标或轻触旗面，让粒子随你流动。",
      "暂停",
      "继续",
      "重播",
      "六色 LGBTQ+ 骄傲旗",
      "静态展示：已启用减少动画。",
      "旗帜静态展示。"
    ],
    "zh-Hant": [
      "自由與機會平等",
      "移動滑鼠或輕觸旗面，讓粒子隨你流動。",
      "暫停",
      "繼續",
      "重播",
      "六色 LGBTQ+ 驕傲旗",
      "靜態展示：已啟用減少動畫。",
      "旗幟靜態展示。"
    ],
    ja: [
      "自由と機会の平等",
      "ポインターを動かすか旗に触れると、粒子が動きます。",
      "一時停止",
      "再開",
      "もう一度",
      "6色のLGBTQ+プライドフラッグ",
      "動きを抑える設定のため、静止表示しています。",
      "旗の静止表示。"
    ],
    ko: [
      "자유와 기회의 평등",
      "포인터를 움직이거나 깃발을 터치하면 입자가 움직입니다.",
      "일시 정지",
      "계속",
      "다시 재생",
      "여섯 색상의 LGBTQ+ 프라이드 깃발",
      "동작 줄이기 설정에 따라 정적으로 표시합니다.",
      "깃발 정적 표시."
    ],
    fr: [
      "Liberté et égalité des chances",
      "Déplacez le pointeur ou touchez le drapeau pour animer les particules.",
      "Pause",
      "Reprendre",
      "Rejouer",
      "Drapeau des fiertés LGBTQ+ à six couleurs",
      "Affichage statique : réduction des animations activée.",
      "Affichage statique du drapeau."
    ],
    es: [
      "Libertad e igualdad de oportunidades",
      "Mueve el puntero o toca la bandera para animar las partículas.",
      "Pausar",
      "Continuar",
      "Repetir",
      "Bandera del orgullo LGBTQ+ de seis colores",
      "Vista estática: movimiento reducido activado.",
      "Vista estática de la bandera."
    ]
  };

  const text = labels[document.documentElement.lang] || labels.en;
  const panel = document.createElement("figure");

  panel.className = "wrap pride-panel is-static";
  panel.innerHTML = `
    <div class="pride-heading">
      <h2></h2>
      <span>SENZOVIA / LGBTQ+</span>
    </div>
    <div class="pride-stage" role="img">
      <div class="pride-fallback" aria-hidden="true"></div>
      <canvas aria-hidden="true"></canvas>
    </div>
    <figcaption class="pride-caption">
      <p></p>
      <div class="pride-controls">
        <button type="button" data-action="pause"></button>
        <button type="button" data-action="replay"></button>
      </div>
    </figcaption>
  `;

  panel.querySelector("h2").textContent = text[0];

  const stage = panel.querySelector(".pride-stage");
  const caption = panel.querySelector(".pride-caption p");
  const pause = panel.querySelector('[data-action="pause"]');
  const replay = panel.querySelector('[data-action="replay"]');

  stage.setAttribute("aria-label", text[5]);
  pause.textContent = text[2];
  replay.textContent = text[4];
  anchor.after(panel);

  const canvas = panel.querySelector("canvas");
  const media = matchMedia("(prefers-reduced-motion: reduce)");
  const trails = new Float32Array(24);
  const uniforms = {};

  const columns = matchMedia("(max-width: 600px)").matches ? 96 : 144;
  const rows = columns * 2 / 3;

  let gl;
  let program;
  let buffer;
  let observer;
  let resizeObserver;
  let motionObserver;

  let failed = false;
  let paused = false;
  let visible = true;
  let reduced = false;

  let frame = 0;
  let previous = 0;
  let time = 0;
  let trailIndex = 0;

  const vertexSource = `
    precision highp float;

    attribute vec2 aGrid;

    uniform vec2 uResolution;
    uniform float uTime;
    uniform float uSize;
    uniform float uRatio;
    uniform vec3 uTrail[8];

    varying vec3 vColor;
    varying float vAlpha;

    void main() {
      float band = floor(aGrid.y * 6.0);

      if (band < 1.0) {
        vColor = vec3(0.894, 0.012, 0.012);
      } else if (band < 2.0) {
        vColor = vec3(1.0, 0.549, 0.0);
      } else if (band < 3.0) {
        vColor = vec3(1.0, 0.929, 0.0);
      } else if (band < 4.0) {
        vColor = vec3(0.0, 0.502, 0.149);
      } else if (band < 5.0) {
        vColor = vec3(0.0, 0.302, 1.0);
      } else {
        vColor = vec3(0.459, 0.027, 0.529);
      }

      vec2 target = (aGrid - 0.5) * vec2(1.0, 0.666667);

      target.y += sin(
        aGrid.x * 9.0 - uTime * 1.4 + aGrid.y * 2.0
      ) * 0.016 * (0.3 + aGrid.x);

      target.x += sin(
        aGrid.y * 5.0 + uTime * 0.7
      ) * 0.006;

      float seed = fract(
        sin(dot(aGrid, vec2(127.1, 311.7))) * 43758.5453
      );

      float progress = smoothstep(
        0.0,
        1.0,
        clamp((uTime - seed * 0.7) / 3.5, 0.0, 1.0)
      );

      float angle =
        seed * 6.283185 + (1.0 - progress) * 4.5;

      vec2 cloud =
        vec2(cos(angle), sin(angle)) * (0.3 + seed * 0.5);

      vec2 position = mix(cloud, target, progress);
      float energy = 0.0;

      for (int i = 0; i < 8; i++) {
        vec2 delta = target - uTrail[i].xy;
        float distanceToTouch = length(delta);

        float force = exp(
          -distanceToTouch * distanceToTouch * 100.0
        ) * uTrail[i].z;

        vec2 direction =
          delta / max(distanceToTouch, 0.025);

        position += (
          direction +
          vec2(-direction.y, direction.x) * 0.55
        ) * force * 0.025;

        energy += force;
      }

      vec2 pixel =
        uResolution * 0.5 + position * uSize;

      gl_Position = vec4(
        pixel / uResolution * vec2(2.0, -2.0)
          + vec2(-1.0, 1.0),
        0.0,
        1.0
      );

      gl_PointSize = clamp(
        uSize / ${columns}.0 * 1.55
          + min(energy, 2.0) * uRatio,
        1.0,
        18.0
      );

      vAlpha =
        (0.35 + 0.65 * progress) *
        (0.85 + 0.15 * sin(seed * 30.0 + uTime));
    }
  `;

  const fragmentSource = `
    precision mediump float;

    varying vec3 vColor;
    varying float vAlpha;

    void main() {
      float radius = length(gl_PointCoord - 0.5);

      float halo =
        (1.0 - smoothstep(0.16, 0.5, radius)) * 0.4;

      float core =
        (1.0 - smoothstep(0.12, 0.3, radius)) * 0.6;

      gl_FragColor = vec4(
        vColor,
        (halo + core) * vAlpha
      );
    }
  `;

  function motionPreference() {
    const root = document.documentElement;

    return root.classList.contains("reduce-motion") ||
      (
        !root.classList.contains("motion-enabled") &&
        media.matches
      );
  }

  function updateState() {
    reduced = motionPreference();

    const staticMode = failed || reduced;

    panel.classList.toggle("is-static", staticMode);
    panel.classList.toggle("is-live", !staticMode);

    pause.disabled = staticMode;
    replay.disabled = staticMode;
    pause.textContent = paused ? text[3] : text[2];

    caption.textContent = failed
      ? text[7]
      : reduced
        ? text[6]
        : text[1];

    cancelAnimationFrame(frame);
    frame = 0;
    previous = 0;

    if (!staticMode && !paused && visible && !document.hidden) {
      frame = requestAnimationFrame(animate);
    }
  }

  function compile(type, source) {
    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const message = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error(message);
    }

    return shader;
  }

  function draw() {
    const box = stage.getBoundingClientRect();
    const ratio = Math.min(devicePixelRatio || 1, 2);

    const width = Math.max(
      1,
      Math.round(box.width * ratio)
    );

    const height = Math.max(
      1,
      Math.round(box.height * ratio)
    );

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    gl.viewport(0, 0, width, height);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.uniform2f(uniforms.uResolution, width, height);

    gl.uniform1f(
      uniforms.uSize,
      Math.min(width * 0.76, height * 1.05)
    );

    gl.uniform1f(uniforms.uRatio, ratio);
    gl.uniform1f(uniforms.uTime, time);
    gl.uniform3fv(uniforms.uTrail, trails);

    gl.drawArrays(gl.POINTS, 0, columns * rows);
  }

  function animate(now) {
    const delta = previous
      ? Math.min((now - previous) / 1000, 0.05)
      : 0;

    previous = now;
    time += delta;

    for (let i = 2; i < trails.length; i += 3) {
      trails[i] *= Math.exp(-delta * 2.8);
    }

    draw();
    frame = requestAnimationFrame(animate);
  }

  function touch(event) {
    if (failed || reduced || paused) {
      return;
    }

    const box = stage.getBoundingClientRect();
    const size = Math.min(
      box.width * 0.76,
      box.height * 1.05
    );

    const index = (trailIndex++ % 8) * 3;

    trails[index] =
      (event.clientX - box.left - box.width / 2) / size;

    trails[index + 1] =
      (event.clientY - box.top - box.height / 2) / size;

    trails[index + 2] = 1;
  }

  function fallback(error) {
    failed = true;
    updateState();

    if (error) {
      console.warn(
        "Pride particles: static fallback enabled.",
        error
      );
    }
  }

  try {
    gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      depth: false
    });

    if (!gl) {
      throw new Error("WebGL is unavailable.");
    }

    const vertex = compile(gl.VERTEX_SHADER, vertexSource);
    const fragment = compile(gl.FRAGMENT_SHADER, fragmentSource);

    program = gl.createProgram();

    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);

    gl.deleteShader(vertex);
    gl.deleteShader(fragment);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program));
    }

    gl.useProgram(program);

    const points = new Float32Array(columns * rows * 2);

    for (let y = 0, i = 0; y < rows; y++) {
      for (let x = 0; x < columns; x++) {
        points[i++] = (x + 0.5) / columns;
        points[i++] = (y + 0.5) / rows;
      }
    }

    buffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      points,
      gl.STATIC_DRAW
    );

    const attribute = gl.getAttribLocation(
      program,
      "aGrid"
    );

    gl.enableVertexAttribArray(attribute);
    gl.vertexAttribPointer(
      attribute,
      2,
      gl.FLOAT,
      false,
      0,
      0
    );

    for (const name of [
      "uResolution",
      "uTime",
      "uSize",
      "uRatio",
      "uTrail"
    ]) {
      uniforms[name] = gl.getUniformLocation(
        program,
        name === "uTrail" ? "uTrail[0]" : name
      );
    }

    gl.enable(gl.BLEND);
    gl.blendFunc(
      gl.SRC_ALPHA,
      gl.ONE_MINUS_SRC_ALPHA
    );

    gl.clearColor(0, 0, 0, 0);
    draw();

    stage.addEventListener(
      "pointermove",
      touch,
      { passive: true }
    );

    stage.addEventListener(
      "pointerdown",
      touch,
      { passive: true }
    );

    pause.addEventListener("click", () => {
      paused = !paused;
      updateState();
    });

    replay.addEventListener("click", () => {
      time = 0;
      trails.fill(0);
      paused = false;
      updateState();
    });

    if ("IntersectionObserver" in window) {
      visible = false;

      observer = new IntersectionObserver(entries => {
        visible = entries[0].isIntersecting;
        updateState();
      });

      observer.observe(panel);
    }

    resizeObserver = new ResizeObserver(() => {
      if (!failed) {
        draw();
      }
    });

    resizeObserver.observe(stage);

    motionObserver = new MutationObserver(updateState);

    motionObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"]
    });

    media.addEventListener("change", updateState);
    document.addEventListener("visibilitychange", updateState);

    window.addEventListener("pagehide", () => {
      cancelAnimationFrame(frame);
      previous = 0;
    });

    window.addEventListener("pageshow", updateState);

    canvas.addEventListener("webglcontextlost", event => {
      event.preventDefault();
      fallback();
    });

    updateState();
  } catch (error) {
    fallback(error);
  }
})();