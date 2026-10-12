/*
 * Independent implementation inspired by Codrops LayersAnimation.
 * https://github.com/codrops/LayersAnimation
 * Artwork files remain unchanged; framing is applied at display time.
 */
(() => {
  "use strict";

  const script = document.currentScript;
  const host = document.querySelector(".hero-copy");

  if (!script || !host || document.body.dataset.route !== "home") return;
  if (document.querySelector(".st-launch")) return;

  if (
    typeof HTMLDialogElement === "undefined" ||
    !HTMLDialogElement.prototype.showModal
  ) {
    return;
  }

  const assetBase = new URL("./", script.src);

  const ENTER = 650;
  const STAGGER = 110;
  const EASE = "cubic-bezier(.65, 0, .25, 1)";

  const TARGET = {
    x: 0.223,
    y: 0.40
  };

  const scenes = [
    {
      file: "theme-education.png",
      head: [0.336, 0.420],
      zoom: 1.40
    },
    {
      file: "theme-research.png",
      head: [0.255, 0.370],
      zoom: 1.45
    },
    {
      file: "theme-rights.png",
      head: [0.224, 0.350],
      zoom: 1.00
    },
    {
      file: "theme-culture.png",
      head: [0.222, 0.512],
      zoom: 1.05
    },
    {
      file: "theme-policy.png",
      head: [0.223, 0.396],
      zoom: 1.00
    },
    {
      file: "theme-reconstruction.png",
      head: [0.215, 0.409],
      zoom: 1.00
    }
  ];

  const labels = {
    en: [
      "Explore six themes",
      "Skip",
      "Loading illustrations…",
      "Unable to load the illustrations. Check the six image files."
    ],
    "zh-Hans": [
      "探索六大主题",
      "跳过",
      "正在加载插画…",
      "无法加载插画，请检查六张图片文件。"
    ],
    "zh-Hant": [
      "探索六大主題",
      "跳過",
      "正在載入插畫…",
      "無法載入插畫，請檢查六張圖片檔案。"
    ],
    ja: [
      "6つのテーマを見る",
      "スキップ",
      "画像を読み込み中…",
      "画像を読み込めません。6つの画像ファイルを確認してください。"
    ],
    ko: [
      "6가지 주제 살펴보기",
      "건너뛰기",
      "이미지를 불러오는 중…",
      "이미지를 불러올 수 없습니다. 이미지 파일 6개를 확인해 주세요."
    ],
    fr: [
      "Explorer les six thèmes",
      "Passer",
      "Chargement des illustrations…",
      "Impossible de charger les illustrations. Vérifiez les six fichiers image."
    ],
    es: [
      "Explorar los seis temas",
      "Omitir",
      "Cargando ilustraciones…",
      "No se pueden cargar las ilustraciones. Compruebe los seis archivos de imagen."
    ]
  };

  const text = labels[document.body.dataset.lang] || labels.en;
  const root = document.documentElement;
  const motionQuery = matchMedia("(prefers-reduced-motion: reduce)");

  /*
   * Styles are contained here so the existing stylesheet can remain.
   */
  const style = document.createElement("style");

  style.textContent = `
    .hero-copy .st-launch {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-top: 18px;
      padding: 12px 0;
      border: 0;
      border-bottom: 1px solid #737b80;
      background: transparent;
      color: #fff;
      font: inherit;
      text-align: left;
      cursor: pointer;
    }

    .st-launch::before {
      content: "01 — 06";
      font: 12px monospace;
      color: #bcc8ce;
    }

    .st-launch::after {
      content: "↗";
      font-size: 24px;
    }

    dialog.st-film {
      position: fixed;
      inset: 0;
      width: 100%;
      max-width: none;
      height: 100%;
      height: 100dvh;
      max-height: none;
      margin: 0;
      padding: 0;
      border: 0;
      overflow: hidden;
      background: transparent;
      color: #fff;
      overscroll-behavior: contain;
    }

    dialog.st-film:not([open]) {
      display: none;
    }

    dialog.st-film[open] {
      display: block;
    }

    dialog.st-film::backdrop {
      background: transparent;
      backdrop-filter: none;
    }

    .st-film .st-film-stage {
      position: absolute;
      inset: 0;
      overflow: hidden;
      isolation: isolate;
      pointer-events: none;
      clip-path: inset(0 0 0 0);
      will-change: clip-path;
    }

    .st-film .st-film-layer {
      position: absolute;
      inset: 0;
      overflow: hidden;
      transform: translate3d(0, 100%, 0);
      will-change: transform;
    }

    .st-film .st-film-plane {
      position: absolute;
      inset: 0;
      will-change: transform;
    }

    .st-film img.st-film-image {
      position: absolute;
      display: block;
      max-width: none;
      max-height: none;
      margin: 0;
      padding: 0;
      border: 0;
      border-radius: 0;
      object-fit: fill;
      opacity: 1;
      filter: none;
      transform: none;
    }

    .st-film .st-film-skip {
      position: absolute;
      z-index: 10;
      top: max(18px, env(safe-area-inset-top));
      right: max(20px, env(safe-area-inset-right));
      min-height: 44px;
      padding: 10px 18px;
      border: 1px solid rgb(255 255 255 / 65%);
      background: rgb(12 18 22 / 72%);
      color: #fff;
      font: inherit;
      font-size: 14px;
      line-height: 1.4;
      cursor: pointer;
    }

    .st-film .st-film-skip:hover {
      background: #101416;
    }

    .st-film-skip:focus-visible,
    .st-launch:focus-visible {
      outline: 3px solid #f0bf84;
      outline-offset: 4px;
    }

    .st-film-status {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
    }

    .st-film-error:empty {
      display: none;
    }

    .hero-copy .st-film-error {
      margin: 10px 0 0;
      font-size: 14px;
    }

    @media print {
      .st-film,
      .st-launch,
      .st-film-error {
        display: none !important;
      }
    }
  `;

  document.head.append(style);

  const launch = document.createElement("button");

  launch.type = "button";
  launch.className = "st-launch";
  launch.textContent = text[0];
  launch.setAttribute("aria-haspopup", "dialog");
  launch.setAttribute("aria-controls", "st-film");

  const error = document.createElement("p");

  error.className = "st-film-error";
  error.setAttribute("role", "status");

  host.append(launch, error);

  const dialog = document.createElement("dialog");

  dialog.id = "st-film";
  dialog.className = "st-film";
  dialog.setAttribute("aria-label", text[0]);

  const stage = document.createElement("div");

  stage.className = "st-film-stage";
  stage.setAttribute("aria-hidden", "true");

  const skip = document.createElement("button");

  skip.type = "button";
  skip.className = "st-film-skip";
  skip.textContent = text[1];

  const status = document.createElement("span");

  status.className = "st-film-status";
  status.setAttribute("role", "status");

  dialog.append(stage, skip, status);
  document.body.append(dialog);

  let active = false;
  let generation = 0;
  let imagePromise = null;
  let animations = [];
  let saved = null;
  let staticTimer = 0;

  function reduced() {
    return (
      root.classList.contains("reduce-motion") ||
      (
        !root.classList.contains("motion-enabled") &&
        motionQuery.matches
      ) ||
      typeof Element.prototype.animate !== "function"
    );
  }

  /*
   * Decode all images before starting the timeline.
   */
  function loadImage(url) {
    return new Promise((resolve, reject) => {
      const image = new Image();

      image.alt = "";
      image.decoding = "async";

      let settled = false;

      const complete = problem => {
        if (settled) return;

        settled = true;
        clearTimeout(timeout);

        image.onload = null;
        image.onerror = null;

        if (problem) {
          reject(problem);
        } else {
          resolve(image);
        }
      };

      const timeout = setTimeout(() => {
        complete(new Error(`Image timeout: ${url}`));
      }, 20000);

      image.onerror = () => {
        complete(new Error(`Image unavailable: ${url}`));
      };

      image.onload = async () => {
        try {
          if (image.decode) {
            await image.decode();
          }

          if (!image.naturalWidth) {
            throw new Error(`Empty image: ${url}`);
          }

          complete();
        } catch (problem) {
          complete(problem);
        }
      };

      image.src = url;
    });
  }

  function preload() {
    if (!imagePromise) {
      imagePromise = Promise.all(
        scenes.map(scene => {
          return loadImage(
            new URL(scene.file, assetBase).href
          );
        })
      ).catch(problem => {
        imagePromise = null;
        throw problem;
      });
    }

    return imagePromise;
  }

  function saveProperty(node, name) {
    return [
      node,
      name,
      node.style.getPropertyValue(name),
      node.style.getPropertyPriority(name)
    ];
  }

  function cleanup() {
    if (!active) return;

    active = false;
    generation++;

    clearTimeout(staticTimer);

    animations.forEach(animation => {
      animation.cancel();
    });

    animations = [];

    stage.replaceChildren();
    dialog.removeAttribute("aria-busy");
    status.textContent = "";

    if (saved) {
      saved.properties.forEach(
        ([node, name, value, priority]) => {
          if (value) {
            node.style.setProperty(name, value, priority);
          } else {
            node.style.removeProperty(name);
          }
        }
      );

      if (saved.focus?.isConnected) {
        saved.focus.focus({
          preventScroll: true
        });
      }

      saved = null;
    }
  }

  function finish() {
    if (dialog.open) {
      dialog.close();
    }

    cleanup();
  }

  function animate(node, frames, delay, startTime) {
    const animation = node.animate(frames, {
      duration: ENTER,
      delay,
      easing: EASE,
      fill: "both"
    });

    animation.startTime = startTime;
    animation.finished.catch(() => {});

    animations.push(animation);

    return animation;
  }

  /*
   * Align the subject approximately while keeping the viewport covered.
   * Width and height use the same scale, preserving image proportions.
   */
  function frameImage(image, scene, width, height) {
    const scale = Math.max(
      width / image.naturalWidth,
      height / image.naturalHeight
    ) * scene.zoom;

    const imageWidth = image.naturalWidth * scale;
    const imageHeight = image.naturalHeight * scale;

    const clamp = (value, minimum) => {
      return Math.min(0, Math.max(minimum, value));
    };

    const left = clamp(
      width * TARGET.x - scene.head[0] * imageWidth,
      width - imageWidth
    );

    const top = clamp(
      height * TARGET.y - scene.head[1] * imageHeight,
      height - imageHeight
    );

    image.className = "st-film-image";

    Object.assign(image.style, {
      width: `${imageWidth}px`,
      height: `${imageHeight}px`,
      left: `${left}px`,
      top: `${top}px`
    });
  }

  async function open() {
    if (active) return;

    error.textContent = "";

    const scrollbar = innerWidth - root.clientWidth;

    const padding = parseFloat(
      getComputedStyle(document.body).paddingRight
    ) || 0;

    saved = {
      focus: document.activeElement,
      properties: [
        saveProperty(root, "overflow"),
        saveProperty(document.body, "padding-right")
      ]
    };

    active = true;

    const token = ++generation;

    try {
      dialog.showModal();

      root.style.setProperty("overflow", "hidden");

      if (scrollbar > 0) {
        document.body.style.paddingRight =
          `${padding + scrollbar}px`;
      }

      skip.focus({
        preventScroll: true
      });

      dialog.setAttribute("aria-busy", "true");
      status.textContent = text[2];

      const images = await preload();

      if (!active || token !== generation) return;

      if (document.hidden) {
        finish();
        return;
      }

      dialog.removeAttribute("aria-busy");
      status.textContent = "";

      const width = stage.clientWidth;
      const height = stage.clientHeight;

      const layers = images.map((image, index) => {
        frameImage(
          image,
          scenes[index],
          width,
          height
        );

        const layer = document.createElement("div");
        layer.className = "st-film-layer";

        const plane = document.createElement("div");
        plane.className = "st-film-plane";

        plane.append(image);
        layer.append(plane);

        return {
          layer,
          plane
        };
      });

      /*
       * Use a brief static view when reduced motion is requested.
       */
      if (reduced()) {
        layers[0].layer.style.transform = "none";
        stage.append(layers[0].layer);

        staticTimer = setTimeout(finish, 900);
        return;
      }

      stage.append(
        ...layers.map(item => item.layer)
      );

      const startTime = document.timeline.currentTime + 30;

      layers.forEach(({ layer, plane }, index) => {
        const delay = index * STAGGER;

        animate(
          layer,
          [
            {
              transform: "translate3d(0, 100%, 0)"
            },
            {
              transform: "translate3d(0, 0%, 0)"
            }
          ],
          delay,
          startTime
        );

        /*
         * Counter-motion leaves only eight percent of viewport travel.
         */
        animate(
          plane,
          [
            {
              transform: "translate3d(0, -92%, 0)"
            },
            {
              transform: "translate3d(0, 0%, 0)"
            }
          ],
          delay,
          startTime
        );
      });

      /*
       * The homepage enters as the seventh layer.
       * The final illustration does not receive an extra hold.
       */
      animate(
        stage,
        [
          {
            clipPath: "inset(0% 0% 0% 0%)"
          },
          {
            clipPath: "inset(0% 0% 100% 0%)"
          }
        ],
        scenes.length * STAGGER,
        startTime
      );

      await Promise.all(
        animations.map(animation => animation.finished)
      );

      if (active && token === generation) {
        finish();
      }
    } catch (problem) {
      if (!active || token !== generation) return;

      finish();

      error.textContent = text[3];
      console.warn("Senzovia theme animation:", problem);
    }
  }

  launch.addEventListener("click", open);

  const warm = () => {
    preload().catch(() => {});
  };

  launch.addEventListener(
    "pointerenter",
    warm,
    { once: true }
  );

  launch.addEventListener(
    "focus",
    warm,
    { once: true }
  );

  skip.addEventListener("click", finish);

  dialog.addEventListener("cancel", event => {
    event.preventDefault();
    finish();
  });

  dialog.addEventListener("close", () => {
    if (!dialog.open) {
      cleanup();
    }
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      finish();
    }
  });

  window.addEventListener("pagehide", finish);

  /*
   * Exit cleanly if the viewport changes during playback.
   * The next launch calculates framing for the new dimensions.
   */
  window.addEventListener("resize", () => {
    if (active) {
      finish();
    }
  });

  const updateMotion = () => {
    if (active && reduced()) {
      finish();
    }
  };

  motionQuery.addEventListener("change", updateMotion);

  new MutationObserver(updateMotion).observe(root, {
    attributes: true,
    attributeFilter: ["class"]
  });
})();