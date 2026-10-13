(() => {
  "use strict";

  function mount() {
    const route = document.body.dataset.route;
    const path = window.location.pathname;

    const isEducation =
      route === "education" ||
      route === "education-full" ||
      /\/education(?:-full)?\/(?:index\.html)?$/.test(path);

    if (!isEducation) return;

    if (document.getElementById("education-intro-dialog")) return;

    const translations = {
      en: {
        open: "Explore ESX",
        skip: "Skip",
        title: "Education System X",
        description:
          "An abstract spatial animation revealing the letters ESX."
      },
      "zh-Hans": {
        open: "探索 ESX",
        skip: "跳过",
        title: "Education System X",
        description:
          "抽象空间连续变化，最终由留白显现 ESX 字母。"
      },
      "zh-Hant": {
        open: "探索 ESX",
        skip: "跳過",
        title: "Education System X",
        description:
          "抽象空間連續變化，最終由留白顯現 ESX 字母。"
      },
      ja: {
        open: "ESX を体験",
        skip: "スキップ",
        title: "Education System X",
        description:
          "抽象的な空間が連続的に変化し、最後に余白から ESX の文字が現れます。"
      },
      ko: {
        open: "ESX 살펴보기",
        skip: "건너뛰기",
        title: "Education System X",
        description:
          "추상적인 공간이 연속적으로 변화하며 마지막에 여백으로 ESX 글자가 나타납니다."
      },
      fr: {
        open: "Découvrir ESX",
        skip: "Passer",
        title: "Education System X",
        description:
          "Une animation spatiale abstraite révèle les lettres ESX."
      },
      es: {
        open: "Explorar ESX",
        skip: "Omitir",
        title: "Education System X",
        description:
          "Una animación espacial abstracta revela las letras ESX."
      }
    };

    const language =
      document.documentElement.lang ||
      document.body.dataset.lang ||
      "en";

    const labels = translations[language] || translations.en;

    let trigger = document.querySelector("[data-education-intro]");

    if (!trigger) {
      const host =
        document.querySelector(".page-intro .wrap") ||
        document.querySelector(".page-intro") ||
        document.querySelector("main");

      if (!host) return;

      trigger = document.createElement("button");
      trigger.type = "button";
      trigger.className = "education-intro-trigger";
      trigger.dataset.educationIntro = "";
      trigger.textContent = labels.open;

      if (host.matches("main")) {
        host.prepend(trigger);
      } else {
        host.append(trigger);
      }
    }

    trigger.setAttribute("aria-haspopup", "dialog");
    trigger.setAttribute("aria-controls", "education-intro-dialog");

    const dialog = document.createElement("dialog");
    dialog.id = "education-intro-dialog";
    dialog.setAttribute("aria-label", labels.title);
    dialog.setAttribute(
      "aria-describedby",
      "education-intro-description"
    );

    const canvas = document.createElement("canvas");
    canvas.className = "education-intro-canvas";
    canvas.setAttribute("aria-hidden", "true");

    const fallback = document.createElement("div");
    fallback.className = "education-intro-fallback";
    fallback.textContent = "ESX";
    fallback.hidden = true;
    fallback.setAttribute("aria-hidden", "true");

    const description = document.createElement("p");
    description.id = "education-intro-description";
    description.className = "education-intro-sr";
    description.textContent = labels.description;

    const skip = document.createElement("button");
    skip.type = "button";
    skip.className = "education-intro-skip";
    skip.textContent = labels.skip;
    skip.autofocus = true;

    dialog.append(canvas, fallback, description, skip);
    document.body.append(dialog);

    const duration = 12000;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    const vertexSource = `
      attribute vec2 position;

      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    const fragmentSource = `
precision highp float;

uniform vec2 resolution;
uniform float time;
uniform vec3 camera;
uniform vec3 target;
uniform float lens;

mat2 rotation(float a) {
  float c = cos(a);
  float s = sin(a);
  return mat2(c, -s, s, c);
}

float box(vec3 p, vec3 b) {
  vec3 q = abs(p) - b;
  return length(max(q, 0.0))
    + min(max(q.x, max(q.y, q.z)), 0.0);
}

float box2(vec2 p, vec2 b) {
  vec2 q = abs(p) - b;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0);
}

float segment(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  return length(
    pa - ba * clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0)
  );
}

float glyph(vec2 p) {
  vec2 e = p - vec2(-2.15, 0.0);

  float dE = box2(
    e - vec2(-.57, 0.0),
    vec2(.17, 1.09)
  );

  dE = min(
    dE,
    box2(e - vec2(0.0, .91), vec2(.72, .18))
  );

  dE = min(
    dE,
    box2(e - vec2(-.04, 0.0), vec2(.67, .17))
  );

  dE = min(
    dE,
    box2(e - vec2(0.0, -.91), vec2(.72, .18))
  );

  vec2 s = p;

  float dS = segment(
    s, vec2(.60, .78), vec2(.27, 1.0)
  );

  dS = min(dS, segment(
    s, vec2(.27, 1.0), vec2(-.29, 1.0)
  ));

  dS = min(dS, segment(
    s, vec2(-.29, 1.0), vec2(-.61, .70)
  ));

  dS = min(dS, segment(
    s, vec2(-.61, .70), vec2(-.59, .36)
  ));

  dS = min(dS, segment(
    s, vec2(-.59, .36), vec2(-.23, .12)
  ));

  dS = min(dS, segment(
    s, vec2(-.23, .12), vec2(.27, -.08)
  ));

  dS = min(dS, segment(
    s, vec2(.27, -.08), vec2(.60, -.36)
  ));

  dS = min(dS, segment(
    s, vec2(.60, -.36), vec2(.59, -.73)
  ));

  dS = min(dS, segment(
    s, vec2(.59, -.73), vec2(.25, -1.0)
  ));

  dS = min(dS, segment(
    s, vec2(.25, -1.0), vec2(-.27, -1.0)
  ));

  dS = min(dS, segment(
    s, vec2(-.27, -1.0), vec2(-.63, -.80)
  )) - .18;

  vec2 x = p - vec2(2.13, 0.0);

  float dX = min(
    segment(x, vec2(-.69, -1.02), vec2(.69, 1.02)),
    segment(x, vec2(-.69, 1.02), vec2(.69, -1.02))
  ) - .18;

  return min(dE, min(dS, dX));
}

float field(vec3 p) {
  float unfold = smoothstep(1.6, 3.8, time);
  float orbit = smoothstep(3.8, 5.7, time);
  float branch = smoothstep(5.8, 7.4, time);
  float merge = smoothstep(7.5, 9.2, time);
  float align = smoothstep(9.0, 10.5, time);

  vec3 q = p;

  q.xy = rotation(
    .36 + unfold * .42 + orbit * .5 * sin(p.z * .38)
  ) * q.xy;

  float ordered = q.y + .17 * q.z;

  float arch =
    length(q.xy - vec2(-2.4, .3)) + .17 * q.z - 2.4;

  float spiral =
    q.y * cos(q.z * .36)
    + q.x * sin(q.z * .36)
    + .2 * q.z;

  float angle = atan(q.y, q.x);

  float star =
    length(q.xy)
    * (1.0 + .24 * cos(5.0 * angle + .35 * q.z))
    + .2 * q.z - 1.8;

  float saddle =
    q.y + .16 * (q.x * q.x - q.z * q.z)
    + .28 * sin(q.x * .8);

  float f = mix(ordered, arch, unfold);
  f = mix(f, spiral, orbit);
  f = mix(f, star, branch);
  f = mix(f, saddle, merge);
  f = mix(f, p.z, align);

  return f;
}

float map(vec3 p) {
  float align = smoothstep(9.0, 10.5, time);
  float f = field(p);
  float period = mix(.26, .46, align);

  float bands =
    abs(mod(f + period * .5, period) - period * .5)
    - mix(.033, .044, align);

  float d = bands * mix(.42, 1.0, align);

  vec3 limits = mix(
    vec3(10.0, 8.0, 10.0),
    vec3(11.0, 7.0, 1.8),
    align
  );

  d = max(d, box(p, limits));

  if (time > 1.7 && time < 4.2) {
    float sweep = mix(
      -6.0, 7.0, smoothstep(1.7, 4.2, time)
    );

    float cut = p.x + .28 * p.y - .1 * p.z - sweep;
    d = max(d, .12 - abs(cut));
  }

  if (time < 9.8) {
    d = max(d, .70 - length(p - camera));
  }

  if (time > 8.5) {
    float reveal = smoothstep(8.5, 10.5, time);
    vec2 uv = p.xy;

    uv = rotation((1.0 - reveal) * p.z * .5) * uv;

    uv += vec2(sin(p.z * 1.6), cos(p.z * .7))
      * (1.0 - reveal) * 1.2;

    uv /= 1.0 + max(0.0, 1.8 - p.z) * .112 * reveal;

    float hole = glyph(uv);
    d = max(d, -hole - (1.0 - reveal) * 1.5);
  }

  return d;
}

vec3 normalAt(vec3 p, float eps) {
  vec2 e = vec2(1.0, -1.0) * eps;

  vec3 n =
    e.xyy * map(p + e.xyy)
    + e.yyx * map(p + e.yyx)
    + e.yxy * map(p + e.yxy)
    + e.xxx * map(p + e.xxx);

  return n / max(length(n), .000001);
}

float aoAt(vec3 p, vec3 n) {
  float shade = 0.0;
  float weight = 1.0;

  for (int i = 1; i <= 4; i++) {
    float h = .055 * float(i);
    shade += (h - map(p + n * h)) * weight;
    weight *= .63;
  }

  return clamp(1.0 - 3.5 * shade, .12, 1.0);
}

float shadowAt(vec3 p, vec3 light) {
  float shade = 1.0;
  float distance = .025;

  for (int i = 0; i < 14; i++) {
    float d = map(p + light * distance);

    shade = min(shade, 14.0 * d / distance);
    distance += clamp(d, .035, .23);

    if (d < .001 || distance > 2.2) break;
  }

  return clamp(shade, .1, 1.0);
}

float hash(vec2 p) {
  return fract(
    sin(dot(p, vec2(127.1, 311.7))) * 43758.5453
  );
}

void main() {
  vec2 uv =
    (gl_FragCoord.xy - .5 * resolution) / resolution.y;

  vec3 forward = normalize(target - camera);
  vec3 right = normalize(
    cross(forward, vec3(0.0, 1.0, 0.0))
  );
  vec3 up = cross(right, forward);

  float align = smoothstep(9.0, 10.5, time);

  float roll =
    .10 * sin(time * .7)
    + .5 * smoothstep(2.1, 3.8, time)
    - .7 * smoothstep(5.8, 7.4, time);

  uv = rotation(roll * (1.0 - align)) * uv;

  vec3 ray = normalize(
    forward * lens + right * uv.x + up * uv.y
  );

  float travel = 0.0;
  bool hit = false;

  for (int i = 0; i < 120; i++) {
    float d = map(camera + ray * travel);

    if (d < max(.0012, travel * .00023)) {
      hit = true;
      break;
    }

    travel += max(d * .7, .0012);

    if (travel > 32.0) break;
  }

  vec3 color = vec3(.00015);

  if (hit) {
    vec3 p = camera + ray * travel;

    vec3 normal = normalAt(
      p, max(.001, travel * .00022)
    );

    vec3 light = normalize(
      camera + vec3(-2.8, 4.0, 2.4) - p
    );

    float ao = aoAt(p, normal);
    float shadow = shadowAt(p + normal * .045, light);
    float diffuse = max(dot(normal, light), 0.0);
    float face = clamp(dot(normal, -ray), 0.0, 1.0);

    float specular = pow(
      max(dot(normal, normalize(light - ray)), 0.0),
      64.0
    );

    float sheen = pow(max(0.0, 1.0 - face), 5.0);

    float value = (
      .006
      + smoothstep(.12, .65, diffuse) * 1.4 * shadow
      + .025 * face
    ) * ao;

    value += specular * .35 * shadow + sheen * .08;
    color = vec3(value) * vec3(.98, .99, 1.0);

    float sweep = mix(
      -6.0, 7.0, smoothstep(1.7, 4.2, time)
    );

    float cut = p.x + .28 * p.y - .1 * p.z - sweep;

    float red =
      (1.0 - smoothstep(.12, .21, abs(cut)))
      * smoothstep(1.7, 1.95, time)
      * (1.0 - smoothstep(4.0, 4.2, time));

    float ribbon =
      (1.0 - smoothstep(
        .025,
        .052,
        abs(p.y - .32 * sin(p.x * .7) - .2 * p.z)
      ))
      * smoothstep(4.2, 4.7, time)
      * (1.0 - smoothstep(8.8, 10.0, time));

    float accent = max(red, ribbon * .8);

    color = mix(
      color,
      vec3(.9, .011, .006) * (.65 + .35 * diffuse),
      accent
    );

    color = mix(
      color,
      vec3(.00015),
      1.0 - exp(-travel * .012)
    );
  }

  color = 1.0 - exp(-color * 1.8);
  color = pow(max(color, 0.0), vec3(.65));
  color *= 1.0 - .13 * smoothstep(.2, 1.0, length(uv));
  color += (hash(gl_FragCoord.xy) - .5) * .006;

  gl_FragColor = vec4(color, 1.0);
}
    `;

    const cameraKeys = [
      [0, [.8, .3, 5.5], [0, 0, -3], 1.1],
      [1.7, [.5, .15, 4.8], [0, 0, -3], 1.1],
      [3.8, [1, .5, 2], [-.6, 0, -3], 1],
      [5.5, [.7, -.5, .3], [0, .3, -3.5], .95],
      [7.3, [.1, .2, -.7], [0, 0, -4], .98],
      [8.4, [3.6, 2.1, 7.8], [0, 0, 0], 1],
      [10, [1.2, .6, 10.2], [0, 0, 0], 1.5],
      [10.5, [.025, .02, 10.3], [0, 0, 0], 1.5],
      [12, [0, 0, 10.3], [0, 0, 0], 1.5]
    ];

    let gl = null;
    let program = null;
    let buffer = null;
    let uniforms = null;
    let frame = 0;
    let exitTimer = 0;
    let closeTimer = 0;
    let started = 0;
    let previous = 0;
    let elapsed = 0;
    let quality = 1;
    let slowFrames = 0;
    let running = false;
    let closing = false;
    let unavailable = false;
    let returnFocus = null;
    let ownsScrollLock = false;

    function smooth(value) {
      const x = Math.max(0, Math.min(1, value));
      return x * x * (3 - 2 * x);
    }

    function lerp(a, b, amount) {
      return a + (b - a) * amount;
    }

    function prefersStatic() {
      let saved = false;

      try {
        saved =
          window.localStorage.getItem("senzovia-motion") === "reduce";
      } catch {
        saved = false;
      }

      return (
        reducedMotion.matches ||
        document.documentElement.classList.contains("reduce-motion") ||
        document.body.classList.contains("reduce-motion") ||
        saved
      );
    }

    function compile(type, source) {
      const shader = gl.createShader(type);

      if (!shader) {
        throw new Error("Shader allocation failed.");
      }

      gl.shaderSource(shader, source);
      gl.compileShader(shader);

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const message = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new Error(message || "Shader compilation failed.");
      }

      return shader;
    }

    function initialize() {
      if (program) return true;
      if (unavailable) return false;

      let vertex = null;
      let fragment = null;
      let candidate = null;

      try {
        gl = canvas.getContext("webgl", {
          alpha: false,
          antialias: false,
          powerPreference: "high-performance"
        });

        if (!gl) {
          throw new Error("WebGL is unavailable.");
        }

        vertex = compile(gl.VERTEX_SHADER, vertexSource);
        fragment = compile(gl.FRAGMENT_SHADER, fragmentSource);
        candidate = gl.createProgram();

        if (!candidate) {
          throw new Error("Program allocation failed.");
        }

        gl.attachShader(candidate, vertex);
        gl.attachShader(candidate, fragment);
        gl.linkProgram(candidate);

        if (!gl.getProgramParameter(candidate, gl.LINK_STATUS)) {
          throw new Error(
            gl.getProgramInfoLog(candidate) || "Program linking failed."
          );
        }

        program = candidate;
        gl.useProgram(program);

        buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

        gl.bufferData(
          gl.ARRAY_BUFFER,
          new Float32Array([-1, -1, 3, -1, -1, 3]),
          gl.STATIC_DRAW
        );

        const position = gl.getAttribLocation(program, "position");

        gl.enableVertexAttribArray(position);
        gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

        uniforms = Object.fromEntries(
          ["resolution", "time", "camera", "target", "lens"].map(
            name => [name, gl.getUniformLocation(program, name)]
          )
        );

        return true;
      } catch (error) {
        console.warn("ESX animation unavailable:", error);
        unavailable = true;

        if (candidate && gl) gl.deleteProgram(candidate);
        if (buffer && gl) gl.deleteBuffer(buffer);

        program = null;
        buffer = null;
        return false;
      } finally {
        if (vertex && gl) gl.deleteShader(vertex);
        if (fragment && gl) gl.deleteShader(fragment);
      }
    }

    function pose(seconds) {
      let index = 0;

      while (
        index < cameraKeys.length - 2 &&
        seconds > cameraKeys[index + 1][0]
      ) {
        index += 1;
      }

      const a = cameraKeys[index];
      const b = cameraKeys[index + 1];

      const amount = smooth(
        (seconds - a[0]) / (b[0] - a[0])
      );

      const origin = a[1].map(
        (value, axis) => lerp(value, b[1][axis], amount)
      );

      const target = a[2].map(
        (value, axis) => lerp(value, b[2][axis], amount)
      );

      const aspect = canvas.width / canvas.height;
      const fit = Math.min(1, aspect / 1.24);

      const framing = lerp(
        1,
        fit,
        smooth((seconds - 8.4) / 2.4)
      );

      return {
        origin,
        target,
        lens: lerp(a[3], b[3], amount) * framing
      };
    }

    function resizeCanvas() {
      const bounds = dialog.getBoundingClientRect();
      const area = Math.max(1, bounds.width * bounds.height);

      const ratio = Math.min(
        window.devicePixelRatio || 1,
        1.25,
        Math.sqrt(650000 / area)
      ) * quality;

      canvas.width = Math.max(
        1,
        Math.round(bounds.width * ratio)
      );

      canvas.height = Math.max(
        1,
        Math.round(bounds.height * ratio)
      );
    }

    function draw(seconds) {
      if (!gl || !program || unavailable) return;

      const view = pose(seconds);

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(program);

      gl.uniform2f(
        uniforms.resolution,
        canvas.width,
        canvas.height
      );

      gl.uniform1f(uniforms.time, seconds);
      gl.uniform3fv(uniforms.camera, view.origin);
      gl.uniform3fv(uniforms.target, view.target);
      gl.uniform1f(uniforms.lens, view.lens);

      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    function clearPlayback() {
      running = false;
      window.cancelAnimationFrame(frame);
      window.clearTimeout(exitTimer);
      frame = 0;
      exitTimer = 0;
    }

    function finishClose() {
      window.clearTimeout(closeTimer);
      closeTimer = 0;

      if (dialog.open) dialog.close();

      dialog.classList.remove("is-closing");
      closing = false;

      if (ownsScrollLock) {
        document.documentElement.classList.remove(
          "education-intro-active"
        );
        ownsScrollLock = false;
      }

      if (returnFocus && returnFocus.isConnected) {
        returnFocus.focus({ preventScroll: true });
      }
    }

    function close(immediate = false) {
      if (!dialog.open || closing) return;

      clearPlayback();
      closing = true;

      if (immediate || prefersStatic()) {
        finishClose();
        return;
      }

      dialog.classList.add("is-closing");
      closeTimer = window.setTimeout(finishClose, 340);
    }

    function showStatic() {
      clearPlayback();
      elapsed = duration;

      if (program && !unavailable) {
        canvas.hidden = false;
        fallback.hidden = true;
        resizeCanvas();
        draw(12);
      } else {
        canvas.hidden = true;
        fallback.hidden = false;
      }

      exitTimer = window.setTimeout(() => close(), 1800);
    }

    function tick(now) {
      if (!running || !dialog.open) return;

      if (started === 0) started = now;

      const delta = previous === 0 ? 0 : now - previous;
      previous = now;
      elapsed = Math.min(duration, now - started);

      if (delta > 48) {
        slowFrames += 1;
      } else {
        slowFrames = Math.max(0, slowFrames - 1);
      }

      if (slowFrames > 10 && quality > .52) {
        quality = Math.max(.52, quality * .82);
        slowFrames = 0;
        resizeCanvas();
      }

      draw(elapsed / 1000);

      if (elapsed >= duration) {
        close();
        return;
      }

      frame = window.requestAnimationFrame(tick);
    }

    function open() {
      if (dialog.open || closing) return;

      returnFocus = document.activeElement;

      try {
        dialog.showModal();
      } catch (error) {
        console.warn("ESX dialog could not open:", error);
        return;
      }

      ownsScrollLock = !document.documentElement.classList.contains(
        "education-intro-active"
      );

      document.documentElement.classList.add(
        "education-intro-active"
      );

      skip.focus({ preventScroll: true });

      quality = 1;
      slowFrames = 0;
      elapsed = 0;
      started = 0;
      previous = 0;

      canvas.hidden = false;
      fallback.hidden = true;

      if (prefersStatic()) {
        showStatic();
        return;
      }

      if (!initialize()) {
        showStatic();
        return;
      }

      resizeCanvas();
      draw(0);

      running = true;
      frame = window.requestAnimationFrame(tick);

      exitTimer = window.setTimeout(() => close(), duration + 250);
    }

    trigger.addEventListener("click", open);

    skip.addEventListener("click", () => close(true));

    dialog.addEventListener("cancel", event => {
      event.preventDefault();
      close(true);
    });

    dialog.addEventListener("close", () => {
      clearPlayback();

      if (ownsScrollLock) {
        document.documentElement.classList.remove(
          "education-intro-active"
        );
        ownsScrollLock = false;
      }
    });

    window.addEventListener("resize", () => {
      if (!dialog.open || closing || canvas.hidden) return;

      resizeCanvas();
      draw(elapsed / 1000);
    });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden && dialog.open) close(true);
    });

    reducedMotion.addEventListener("change", () => {
      if (dialog.open && !closing && prefersStatic()) {
        showStatic();
      }
    });

    canvas.addEventListener("webglcontextlost", event => {
      event.preventDefault();
      unavailable = true;
      program = null;

      if (dialog.open && !closing) showStatic();
    });

    canvas.addEventListener("webglcontextrestored", () => {
      unavailable = false;
      program = null;
      buffer = null;
      uniforms = null;
    });

    window.addEventListener("pagehide", () => {
      close(true);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount, {
      once: true
    });
  } else {
    mount();
  }
})();