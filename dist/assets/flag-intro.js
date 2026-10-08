
/*
 * Senzovia National Flag Intro — Version 3: Cinematic Origami
 * Standalone script. The existing build.py and HTML can remain unchanged.
 * The artwork always uses the original flag image, never a substitute.
 */
(() => {
  'use strict';

  const BOOT_KEY = '__senzoviaFlagIntroV3Bound';
  if (window[BOOT_KEY]) return;
  window[BOOT_KEY] = true;

  const FLAG_SRC = '/assets/senzovia-flag.jpeg';
  const SELECTORS = 'img.flag, .sz-flag-trigger, a.brand';
  const PANEL_COUNT = 12;
  const FULL_DURATION = 11900;
  const SAFETY_DURATION = 16000;
  const REDUCED_DURATION = 3000;

  const STRINGS = {
    en: {
      government: 'Government of Senzovia',
      skip: 'Skip intro',
      flag: 'The national flag',
      subtitle: 'The national flag of Senzovia',
      counter: 'National symbol / 001',
      dialog: 'Senzovia national flag presentation',
      open: 'View national flag animation'
    },
    'zh-CN': {
      government: '盛眾志政府',
      skip: '跳过动画',
      flag: '国旗展示',
      subtitle: '盛眾志国旗',
      counter: '国家象征 / 001',
      dialog: '盛眾志国旗展示',
      open: '查看国旗动画'
    },
    'zh-TW': {
      government: '盛眾志政府',
      skip: '跳過動畫',
      flag: '國旗展示',
      subtitle: '盛眾志國旗',
      counter: '國家象徵 / 001',
      dialog: '盛眾志國旗展示',
      open: '查看國旗動畫'
    },
    ja: {
      government: 'センゾヴィア政府',
      skip: 'スキップ',
      flag: '国旗',
      subtitle: 'センゾヴィアの国旗',
      counter: '国家の象徴 / 001',
      dialog: 'センゾヴィア国旗の紹介',
      open: '国旗のアニメーションを見る'
    },
    ko: {
      government: '센조비아 정부',
      skip: '건너뛰기',
      flag: '국기',
      subtitle: '센조비아의 국기',
      counter: '국가 상징 / 001',
      dialog: '센조비아 국기 소개',
      open: '국기 애니메이션 보기'
    },
    fr: {
      government: 'Gouvernement de Senzovia',
      skip: 'Passer',
      flag: 'Le drapeau national',
      subtitle: 'Le drapeau national de Senzovia',
      counter: 'Symbole national / 001',
      dialog: 'Présentation du drapeau de Senzovia',
      open: 'Voir l’animation du drapeau'
    },
    es: {
      government: 'Gobierno de Senzovia',
      skip: 'Omitir',
      flag: 'La bandera nacional',
      subtitle: 'La bandera nacional de Senzovia',
      counter: 'Símbolo nacional / 001',
      dialog: 'Presentación de la bandera de Senzovia',
      open: 'Ver la animación de la bandera'
    }
  };

  let active = null;

  function locale() {
    const lang = (document.documentElement.lang || 'en').toLowerCase();
    if (lang.startsWith('zh')) {
      return /tw|hk|hant|mo/.test(lang) ? 'zh-TW' : 'zh-CN';
    }
    if (lang.startsWith('ja')) return 'ja';
    if (lang.startsWith('ko')) return 'ko';
    if (lang.startsWith('fr')) return 'fr';
    if (lang.startsWith('es')) return 'es';
    return 'en';
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function hasReducedMotion() {
    return typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function sizeStage(stage, naturalWidth, naturalHeight) {
    if (!stage || !naturalWidth || !naturalHeight) return;
    const ratio = naturalWidth / naturalHeight;
    const width = Math.max(100, Math.min(
      window.innerWidth * .78,
      1060,
      window.innerHeight * .51 * ratio
    ));
    stage.style.width = `${Math.round(width)}px`;
    stage.style.aspectRatio = `${naturalWidth} / ${naturalHeight}`;
  }

  function openIntro(opener) {
    if (active) return;

    const t = STRINGS[locale()];
    const reduced = hasReducedMotion();
    const restoreFocus = opener && typeof opener.focus === 'function'
      ? (opener.closest('a, button') || opener) : document.activeElement;
    const previousOverflow = document.body.style.overflow;

    const dialog = el('dialog', 'sz3-dialog');
    dialog.setAttribute('aria-label', t.dialog);
    dialog.setAttribute('aria-modal', 'true');

    const shell = el('div', 'sz3-shell');
    const topbar = el('header', 'sz3-topbar');
    const kicker = el('span', 'sz3-kicker', t.government);
    const skip = el('button', 'sz3-skip', t.skip);
    skip.type = 'button';
    skip.setAttribute('aria-label', t.skip);
    topbar.append(kicker, skip);

    const aura = el('div', 'sz3-aura');
    const horizon = el('div', 'sz3-horizon');
    aura.setAttribute('aria-hidden', 'true');
    horizon.setAttribute('aria-hidden', 'true');

    const perspective = el('div', 'sz3-perspective');
    perspective.setAttribute('aria-hidden', 'true');
    const stage = el('div', 'sz3-stage');
    const stageInner = el('div', 'sz3-stage-inner');
    const artwork = el('div', 'sz3-artwork');
    const panels = el('div', 'sz3-folds');

    for (let index = 0; index < PANEL_COUNT; index += 1) {
      const panel = el('div', 'sz3-panel');
      panel.style.setProperty('--sz3-x', `${index * 100 / (PANEL_COUNT - 1)}%`);
      panel.style.setProperty('--sz3-delay', `${950 + index * 140}ms`);
      panel.style.setProperty('--sz3-angle', `${index % 2 === 0 ? -83 : 83}deg`);
      panel.style.setProperty('--sz3-hinge', index % 2 === 0 ? 'left' : 'right');
      panel.style.setProperty('--sz3-rise', `${index % 3 === 0 ? -50 : 50}px`);
      panels.appendChild(panel);
    }

    const fullImage = el('img', 'sz3-full');
    fullImage.src = FLAG_SRC;
    fullImage.alt = '';
    fullImage.decoding = 'async';
    fullImage.draggable = false;

    const rim = el('div', 'sz3-rim');
    const glint = el('div', 'sz3-glint');
    const spine = el('div', 'sz3-spine');
    artwork.append(panels, fullImage, rim, glint, spine);
    stageInner.appendChild(artwork);
    stage.appendChild(stageInner);
    perspective.appendChild(stage);

    const caption = el('section', 'sz3-caption');
    const eyebrow = el('p', 'sz3-eyebrow', t.flag);
    const title = el('h2', 'sz3-title');
    title.setAttribute('aria-label', 'SENZOVIA');
    [...'SENZOVIA'].forEach((letter, index) => {
      const span = el('span', 'sz3-letter', letter);
      span.setAttribute('aria-hidden', 'true');
      span.style.setProperty('--sz3-letter-delay', `${4800 + index * 90}ms`);
      title.appendChild(span);
    });
    const rule = el('span', 'sz3-rule');
    rule.setAttribute('aria-hidden', 'true');
    const subtitle = el('p', 'sz3-subtitle', t.subtitle);
    caption.append(eyebrow, title, rule, subtitle);

    const footer = el('footer', 'sz3-footer');
    const counter = el('span', 'sz3-counter', t.counter);
    const progress = el('div', 'sz3-progress');
    progress.setAttribute('aria-hidden', 'true');
    footer.append(counter, progress);

    shell.append(aura, horizon, perspective, topbar, caption, footer);
    dialog.appendChild(shell);
    document.body.appendChild(dialog);

    let done = false;
    let closing = false;
    const timers = [];
    const later = (callback, delay) => {
      const id = window.setTimeout(callback, delay);
      timers.push(id);
      return id;
    };

    const resize = () => {
      if (fullImage.naturalWidth && fullImage.naturalHeight) {
        sizeStage(stage, fullImage.naturalWidth, fullImage.naturalHeight);
      }
    };

    const cleanup = () => {
      if (done) return;
      done = true;
      timers.forEach(window.clearTimeout);
      window.removeEventListener('resize', resize);
      document.body.style.overflow = previousOverflow;
      if (dialog.open) dialog.close();
      dialog.remove();
      active = null;
      if (restoreFocus && restoreFocus.isConnected) {
        try { restoreFocus.focus({ preventScroll: true }); }
        catch (_) { restoreFocus.focus(); }
      }
    };

    const dismiss = () => {
      if (done || closing) return;
      closing = true;
      dialog.classList.add('sz3-closing');
      later(cleanup, reduced ? 30 : 260);
    };

    active = { dismiss, cleanup };
    skip.addEventListener('click', dismiss);
    dialog.addEventListener('cancel', event => {
      event.preventDefault();
      dismiss();
    });
    dialog.addEventListener('close', cleanup);
    fullImage.addEventListener('load', resize, { once: true });
    fullImage.addEventListener('error', () => {
      console.warn('[Senzovia] Flag intro asset is unavailable:', FLAG_SRC);
      dismiss();
    }, { once: true });
    window.addEventListener('resize', resize, { passive: true });

    try {
      dialog.showModal();
      document.body.style.overflow = 'hidden';
      skip.focus({ preventScroll: true });
    } catch (error) {
      console.warn('[Senzovia] Unable to open flag intro:', error);
      cleanup();
      return;
    }

    if (fullImage.complete) {
      if (fullImage.naturalWidth) resize();
      else dismiss();
    }
    later(dismiss, reduced ? REDUCED_DURATION : FULL_DURATION);
    later(cleanup, SAFETY_DURATION);
  }

  function findTrigger(target) {
    if (!(target instanceof Element)) return null;
    return target.closest(SELECTORS);
  }

  document.addEventListener('click', event => {
    const trigger = findTrigger(event.target);
    if (!trigger) return;
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    openIntro(trigger);
  });

  document.addEventListener('keydown', event => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const trigger = findTrigger(event.target);
    if (!trigger) return;
    const tag = trigger.tagName.toLowerCase();
    if (tag === 'a' || tag === 'button') return;
    event.preventDefault();
    openIntro(trigger);
  });

  function addKeyboardAccess() {
    document.querySelectorAll('img.flag, .sz-flag-trigger').forEach(node => {
      if (node.closest('a, button')) return;
      if (node.matches('img.flag') && node.closest('.sz-flag-trigger')) return;
      if (!node.hasAttribute('tabindex')) node.tabIndex = 0;
      if (!node.hasAttribute('role')) node.setAttribute('role', 'button');
      if (!node.hasAttribute('aria-label')) {
        node.setAttribute('aria-label', STRINGS[locale()].open);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addKeyboardAccess, { once: true });
  } else {
    addKeyboardAccess();
  }
})();
