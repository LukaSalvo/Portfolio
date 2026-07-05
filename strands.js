// Rubans lumineux ondulants en fond de la section Contact — adapté du composant
// React "Strands" (react-bits, ogl) en JS vanilla. Palette recalée sur les verts
// d'encre du site (--accent) plutôt que le dégradé arc-en-ciel par défaut.
(function () {
  const container = document.getElementById('contactStrands');
  const section = document.getElementById('contact');
  if (!container || !section) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced || window.innerWidth < 768) return;

  const MAX_STRANDS = 12;
  const MAX_COLORS = 8;

  const VERT = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

  const FRAG = `#version 300 es
precision highp float;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColors[${MAX_COLORS}];
uniform int uColorCount;
uniform int uStrandCount;
uniform float uSpeed;
uniform float uAmplitude;
uniform float uWaviness;
uniform float uThickness;
uniform float uGlow;
uniform float uTaper;
uniform float uSpread;
uniform float uHueShift;
uniform float uIntensity;
uniform float uOpacity;
uniform float uScale;
uniform float uSaturation;

out vec4 fragColor;

const float PI = 3.14159265;

vec3 spectrum(float t) {
  return 0.5 + 0.5 * cos(2.0 * PI * (t + vec3(0.00, 0.33, 0.67)));
}

vec3 samplePalette(float t) {
  t = fract(t);
  float scaled = t * float(uColorCount);
  int idx = int(floor(scaled));
  float blend = fract(scaled);
  int nextIdx = idx + 1;
  if (nextIdx >= uColorCount) nextIdx = 0;
  return mix(uColors[idx], uColors[nextIdx], blend);
}

vec3 strandColor(float t) {
  if (uColorCount > 0) return samplePalette(t);
  return spectrum(t);
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;
  uv /= max(uScale, 0.0001);

  float e = 0.06 + uIntensity * 0.94;
  float env = pow(max(cos(uv.x * PI * 1.3), 0.0), uTaper);

  vec3 col = vec3(0.0);

  for (int i = 0; i < ${MAX_STRANDS}; i++) {
    if (i >= uStrandCount) break;

    float fi = float(i);
    float ph = fi * 1.7 * uSpread;
    float freq = (2.0 + fi * 0.35) * uWaviness;
    float spd = 1.4 + fi * 1.2;

    float tt = uTime * uSpeed;
    float w = sin(uv.x * freq + tt * spd + ph) * 0.60
            + sin(uv.x * freq * 1.1 - tt * spd * 0.7 + ph * 1.7) * 0.40;

    float amp = (0.1 + 0.02 * e) * env * uAmplitude;
    float y = w * amp;

    float d = abs(uv.y - y);
    float thick = (0.001 + 0.05 * e) * (0.35 + env) * uThickness;
    float g = thick / (d + thick * 0.45);
    g = g * g;

    float h = fi / float(uStrandCount) + uv.x * 0.30 + uTime * 0.04 + uHueShift;
    col += strandColor(h) * g * env;
  }

  col *= 0.45 + 0.7 * e;
  col = 1.0 - exp(-col * uGlow);

  float gray = dot(col, vec3(0.2126, 0.7152, 0.0722));
  col = max(mix(vec3(gray), col, uSaturation), 0.0);

  float lum = max(max(col.r, col.g), col.b);
  float alpha = clamp(lum, 0.0, 1.0) * uOpacity;

  fragColor = vec4(col * uOpacity, alpha);
}
`;

  // Palettes vert-encre (au lieu du dégradé arc-en-ciel par défaut du composant)
  const LIGHT_COLORS = ['#1B4332', '#2D6A4F', '#40916C', '#74C69D'];
  const DARK_COLORS = ['#40916C', '#52B788', '#74C69D', '#95D5B2'];

  const settings = {
    count: 5,
    speed: 0.35,
    amplitude: 1.1,
    waviness: 1.3,
    thickness: 0.45,
    glow: 1.5,
    taper: 2.2,
    spread: 1.4,
    hueShift: 0,
    intensity: 0.45,
    saturation: 1.1,
    scale: 1,
    opacity: 0.35,
    colors: LIGHT_COLORS
  };

  function isDarkTheme() {
    return document.documentElement.classList.contains('dark');
  }

  function applyThemeSettings() {
    settings.colors = isDarkTheme() ? DARK_COLORS : LIGHT_COLORS;
    settings.opacity = isDarkTheme() ? 0.5 : 0.4;
  }
  applyThemeSettings();

  // Position/taille calées sur le bloc .contact-links réellement affiché plutôt
  // que sur des pourcentages fixes de la section (qui tombaient mal selon la
  // hauteur du contenu et la largeur d'écran).
  const linksBlock = section.querySelector('.contact-links');
  const PAD_X = 220;
  const PAD_Y = 90;

  function syncPosition() {
    if (!linksBlock) return;
    const sectionRect = section.getBoundingClientRect();
    const linksRect = linksBlock.getBoundingClientRect();
    const centerX = linksRect.left - sectionRect.left + linksRect.width / 2;
    const centerY = linksRect.top - sectionRect.top + linksRect.height / 2;
    const width = linksRect.width + PAD_X * 2;
    const height = linksRect.height + PAD_Y * 2;

    container.style.left = centerX + 'px';
    container.style.top = centerY + 'px';
    container.style.width = width + 'px';
    container.style.height = height + 'px';
    container.style.transform = 'translate(-50%, -50%)';

    if (renderer) {
      renderer.setSize(width, height);
      program.uniforms.uResolution.value = [width, height];
    }
  }

  function buildPalette(colors) {
    const filled = colors && colors.length ? colors : ['#ffffff'];
    const padded = [];
    for (let i = 0; i < MAX_COLORS; i++) {
      const hex = filled[i] ?? filled[filled.length - 1];
      const c = hexToRgb(hex);
      padded.push([c.r, c.g, c.b]);
    }
    return padded;
  }

  function hexToRgb(hex) {
    const n = parseInt(hex.replace('#', ''), 16);
    return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 };
  }

  let renderer, gl, program, mesh, animateId;
  let started = false;

  async function ensureStarted() {
    if (started) return;
    started = true;

    let ogl;
    try {
      ogl = await import('https://cdn.jsdelivr.net/npm/ogl@1.0.11/src/index.js');
    } catch (err) {
      started = false;
      return;
    }
    const { Renderer, Program, Mesh, Triangle } = ogl;

    renderer = new Renderer({ alpha: true, premultipliedAlpha: true, antialias: true });
    gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    const geometry = new Triangle(gl);
    if (geometry.attributes.uv) delete geometry.attributes.uv;

    program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: [container.offsetWidth, container.offsetHeight] },
        uColors: { value: buildPalette(settings.colors) },
        uColorCount: { value: settings.colors.length },
        uStrandCount: { value: settings.count },
        uSpeed: { value: settings.speed },
        uAmplitude: { value: settings.amplitude },
        uWaviness: { value: settings.waviness },
        uThickness: { value: settings.thickness },
        uGlow: { value: settings.glow },
        uTaper: { value: settings.taper },
        uSpread: { value: settings.spread },
        uHueShift: { value: settings.hueShift },
        uIntensity: { value: settings.intensity },
        uOpacity: { value: settings.opacity },
        uScale: { value: settings.scale },
        uSaturation: { value: settings.saturation }
      }
    });

    mesh = new Mesh(gl, { geometry, program });
    container.appendChild(gl.canvas);

    syncPosition();
    window.addEventListener('resize', syncPosition);
    window.addEventListener('load', syncPosition);
    if (window.ResizeObserver && linksBlock) {
      new ResizeObserver(syncPosition).observe(linksBlock);
    }

    new MutationObserver(function () {
      applyThemeSettings();
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  }

  function loop(t) {
    animateId = requestAnimationFrame(loop);
    program.uniforms.uTime.value = t * 0.001;
    program.uniforms.uColors.value = buildPalette(settings.colors);
    program.uniforms.uColorCount.value = settings.colors.length;
    program.uniforms.uOpacity.value = settings.opacity;
    renderer.render({ scene: mesh });
  }

  async function start() {
    await ensureStarted();
    if (!program) return;
    animateId = requestAnimationFrame(loop);
  }

  start();
})();
