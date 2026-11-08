import React, { useEffect, useRef, useState, useCallback } from 'react';
import { AUDIO_B64 } from '../data/rubyTypingAudioB64';

export interface RubyWritingToolbarControls {
  soundOn: boolean;
  toggleSound: () => void;
  showStage: boolean;
  toggleStage: () => void;
  hasRealAudio: boolean;
  triggerUploadMp3: () => void;
}

interface RubyWritingBoxProps {
  value: string;
  onChange: (newValue: string) => void;
  placeholder?: string;
  minHeight?: number;
  renderToolbar?: (controls: RubyWritingToolbarControls) => React.ReactNode;
}

// Mốc thời gian (giây) của từng tiếng gõ trong file mp3 – mỗi phím phát một tiếng ngẫu nhiên
const ONSETS = [
  0.085, 0.285, 0.36, 0.53, 0.67, 0.81, 0.885, 1.05, 1.335, 1.43, 1.515, 1.595,
  1.77, 1.93, 2.005, 2.23, 2.325, 2.41, 2.56, 2.64, 2.84, 2.99, 3.67, 3.76,
  3.865, 4.035, 4.155, 4.25, 4.34, 4.65, 5.06, 5.24, 5.375, 5.68, 5.765, 6.025,
  6.125, 6.58, 6.745, 6.835, 7.075, 7.245, 7.555, 7.685, 7.83, 7.955
];
const VOLUME = 0.8;

const PUNCT: Record<string, string> = {
  '`': 'Backquote', '-': 'Minus', '=': 'Equal', '[': 'BracketLeft', ']': 'BracketRight',
  '\\': 'Backslash', ';': 'Semicolon', "'": 'Quote', ',': 'Comma', '.': 'Period', '/': 'Slash'
};

interface KeyDef {
  code: string;
  label: string;
  ch?: string;
  w?: number;
  cls?: string;
}

const k = (ch: string, w?: number): KeyDef => ({
  code: /^[a-z]$/i.test(ch) ? 'Key' + ch.toUpperCase() : /^\d$/.test(ch) ? 'Digit' + ch : PUNCT[ch],
  label: ch,
  ch: ch.toLowerCase(),
  w
});
const sp = (code: string, label: string, w?: number): KeyDef => ({ code, label, w });
const chars = (s: string): KeyDef[] => [...s].map(c => k(c));

const ROWS: KeyDef[][] = [
  [...chars('`1234567890-='), sp('Backspace', '⌫', 1.9)],
  [sp('Tab', '⇥', 1.5), ...chars('QWERTYUIOP[]'), k('\\', 1.5)],
  [sp('CapsLock', '⇪', 1.8), ...chars("ASDFGHJKL;'"), sp('Enter', '⏎', 2.2)],
  [sp('ShiftLeft', '⇧', 2.3), ...chars('ZXCVBNM,./'), sp('ShiftRight', '⇧', 2.7)],
  [{ code: 'Space', label: '', ch: ' ', cls: 'space' }]
];

class Spring {
  x: number;
  t: number;
  v: number;
  k = 0;
  c = 0;
  constructor(x: number, k: number, z: number) {
    this.x = x;
    this.t = x;
    this.v = 0;
    this.set(k, z);
  }
  set(k: number, z: number) {
    this.k = k;
    this.c = 2 * z * Math.sqrt(k);
  }
  step(dt: number) {
    const a = this.k * (this.t - this.x) - this.c * this.v;
    this.v += a * dt;
    this.x += this.v * dt;
  }
  get rest() {
    return Math.abs(this.t - this.x) < 0.03 && Math.abs(this.v) < 0.05;
  }
}

let sharedActx: AudioContext | null = null;
let sharedAbuf: AudioBuffer | null = null;

function b64ToBuf(b: string): ArrayBuffer {
  const bin = atob(b);
  const u = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
  return u.buffer;
}

export const RubyWritingBox: React.FC<RubyWritingBoxProps> = ({
  value,
  onChange,
  placeholder = 'Bắt đầu viết tại đây…',
  minHeight = 230,
  renderToolbar
}) => {
  const paperRef = useRef<HTMLDivElement>(null);
  const displayRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const caretRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const bodyElRef = useRef<SVGGElement>(null);
  const pawLRef = useRef<SVGGElement>(null);
  const pawRRef = useRef<SVGGElement>(null);
  const armLRef = useRef<SVGGElement>(null);
  const armRRef = useRef<SVGGElement>(null);
  const wcRef = useRef<HTMLElement>(null);

  const byCodeRef = useRef<Record<string, HTMLDivElement | null>>({});
  const byCharRef = useRef<Record<string, HTMLDivElement | null>>({});
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const [soundOn, setSoundOn] = useState<boolean>(() => {
    try {
      return localStorage.getItem('typing-sound') !== 'off';
    } catch {
      return true;
    }
  });
  const soundOnRef = useRef(soundOn);
  useEffect(() => {
    soundOnRef.current = soundOn;
  }, [soundOn]);

  const [showStage, setShowStage] = useState<boolean>(true);
  const lastIdxRef = useRef<number>(-1);

  const initAudio = useCallback(() => {
    if (sharedActx) {
      if (sharedActx.state === 'suspended') sharedActx.resume();
      return;
    }
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      sharedActx = new AudioCtx();
      sharedActx
        .decodeAudioData(b64ToBuf(AUDIO_B64))
        .then(b => {
          sharedAbuf = b;
        })
        .catch(() => {});
    } catch {
      // ignore
    }
  }, []);

  const playClick = useCallback((code: string) => {
    if (!soundOnRef.current || !sharedActx || !sharedAbuf) return;
    if (sharedActx.state === 'suspended') sharedActx.resume();
    let i: number;
    do {
      i = Math.floor(Math.random() * ONSETS.length);
    } while (i === lastIdxRef.current && ONSETS.length > 1);
    lastIdxRef.current = i;
    const st = Math.max(0, ONSETS[i] - 0.012);
    const next = i + 1 < ONSETS.length ? ONSETS[i + 1] : sharedAbuf.duration;
    const dur = Math.min(0.26, Math.max(0.1, next - ONSETS[i] + 0.012));
    const heavy = /^(Space|Enter|Backspace)$/.test(code);
    const src = sharedActx.createBufferSource();
    src.buffer = sharedAbuf;
    src.playbackRate.value = (heavy ? 0.86 : 1) * (0.97 + Math.random() * 0.06);
    const g = sharedActx.createGain();
    const t = sharedActx.currentTime;
    const v = VOLUME * (0.85 + Math.random() * 0.15);
    g.gain.setValueAtTime(v, t);
    g.gain.setValueAtTime(v, t + dur - 0.035);
    g.gain.linearRampToValueAtTime(0.0001, t + dur);
    src.connect(g);
    g.connect(sharedActx.destination);
    src.start(t, st, dur);
  }, []);

  const toggleSound = useCallback(() => {
    setSoundOn(prev => {
      const next = !prev;
      soundOnRef.current = next;
      try {
        localStorage.setItem('typing-sound', next ? 'on' : 'off');
      } catch {
        // ignore
      }
      return next;
    });
    initAudio();
    taRef.current?.focus();
  }, [initAudio]);

  const toggleStage = useCallback(() => {
    setShowStage(prev => !prev);
  }, []);

  // Store imperative render & layout refs so external `value` changes and `window.refreshWritingStudioLayout` can trigger them
  const syncAndRenderRef = useRef<(() => void) | null>(null);
  const layoutFnRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const paper = paperRef.current;
    const display = displayRef.current;
    const ta = taRef.current;
    const caret = caretRef.current;
    const stage = stageRef.current;
    const svg = svgRef.current;
    const bodyEl = bodyElRef.current;
    const pawLEl = pawLRef.current;
    const pawREl = pawRRef.current;
    const armLEl = armLRef.current;
    const armREl = armRRef.current;

    if (!paper || !display || !ta || !caret || !stage || !svg || !bodyEl || !pawLEl || !pawREl || !armLEl || !armREl) {
      return;
    }

    type KeyElementWithTimers = HTMLDivElement & { _u?: number; _t?: number };

    function light(el: HTMLDivElement | null | undefined) {
      if (!el) return;
      const kEl = el as KeyElementWithTimers;
      clearTimeout(kEl._u);
      kEl._t = performance.now();
      kEl.classList.add('lit');
      const r = document.createElement('span');
      r.className = 'rip';
      kEl.appendChild(r);
      window.setTimeout(() => r.remove(), 600);
    }

    const unlight = (el: HTMLDivElement | null | undefined) => {
      if (!el) return;
      const kEl = el as KeyElementWithTimers;
      const w = Math.max(30, 110 - (performance.now() - (kEl._t || 0)));
      kEl._u = window.setTimeout(() => kEl.classList.remove('lit'), w);
    };

    /* ========== 2. CHUYỂN ĐỘNG LÒ XO: LINH VẬT + CARET ========== */
    const paws = (['L', 'R'] as const).map(s => ({
      side: s,
      el: s === 'L' ? pawLEl : pawREl,
      arm: s === 'L' ? armLEl : armREl,
      X: new Spring(0, 420, 0.85),
      Y: new Spring(0, 300, 0.8),
      rx: 0,
      ry: 116,
      hy: 116,
      sx: 0,
      sy: 104,
      t: 0,
      init: false
    }));
    const P = { L: paws[0], R: paws[1] };
    const lean = new Spring(0, 150, 0.75);
    const rot = new Spring(0, 130, 0.7);
    const bn = new Spring(0, 520, 0.45);
    const cX = new Spring(0, 900, 0.9);
    const cY = new Spring(0, 900, 0.9);
    const springs = [lean, rot, bn, cX, cY, ...paws.flatMap(p => [p.X, p.Y])];

    let W = 0;
    let H = 0;
    let cx = 0;
    let alt = false;
    let raf = 0;
    let lastT = 0;
    let cH = 0;
    let cSnap = true;
    let relaxT = 0;
    let squintT = 0;

    function frame(now: number) {
      const dt = Math.min((now - lastT) / 1000 || 0.016, 0.034);
      lastT = now;
      const n = Math.max(1, Math.ceil(dt / 0.008));
      const h = dt / n;
      for (let i = 0; i < n; i++) {
        for (const s of springs) s.step(h);
      }
      draw();
      drawCaret();
      raf = springs.some(s => !s.rest) ? requestAnimationFrame(frame) : 0;
    }

    const wake = () => {
      if (!raf) {
        lastT = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };

    function layout() {
      if (!stage || !svg) return;
      const r = stage.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;
      W = r.width;
      H = r.height;
      cx = W / 2;
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
      P.L.rx = cx - 80;
      P.R.rx = cx + 80;
      P.L.sx = cx - 44;
      P.R.sx = cx + 44;
      paws.forEach(p => {
        if (!p.init) {
          p.X.x = p.X.t = p.rx;
          p.Y.x = p.Y.t = p.ry;
          p.init = true;
        } else if (!raf) {
          p.X.x = p.X.t = p.rx;
        }
      });
      draw();
    }

    function draw() {
      if (!bodyEl) return;
      const b = bn.x;
      bodyEl.setAttribute(
        'transform',
        `translate(${cx + lean.x},${12 + b * 0.6}) translate(0,100) rotate(${rot.x}) scale(${1 + b * 0.012},${1 - b * 0.012}) translate(0,-100)`
      );
      paws.forEach(p => {
        const x = p.X.x;
        const y = p.Y.x;
        const dir = p.side === 'L' ? -1 : 1;
        const sq = Math.max(-0.12, Math.min(0.12, p.Y.v / 4000));
        p.el.setAttribute('transform', `translate(${x},${y}) scale(${1 - sq},${1 + sq})`);
        const sx = p.sx + lean.x;
        const len = Math.hypot(x - sx, y - p.sy);
        const mx = (sx + x) / 2 + dir * Math.min(46, 8 + len * 0.2);
        const my = (p.sy + y) / 2 - Math.min(10, len * 0.08);
        const d = `M${sx} ${p.sy} Q${mx} ${my} ${x} ${y}`;
        p.arm.querySelectorAll('path').forEach(pa => pa.setAttribute('d', d));
      });
    }

    function setCaret(x: number, y: number, h: number) {
      cH = h;
      cX.t = x;
      cY.t = y;
      if (cSnap) {
        cX.x = x;
        cY.x = y;
        cX.v = cY.v = 0;
        cSnap = false;
      }
      wake();
    }

    function drawCaret() {
      if (!caret) return;
      caret.style.height = cH + 'px';
      caret.style.transform = `translate(${cX.x}px,${cY.x}px)`;
    }

    function slam(el: HTMLDivElement | null | undefined) {
      if (!el || !stage || !bodyEl) return;
      const kr = el.getBoundingClientRect();
      const sr = stage.getBoundingClientRect();
      if (sr.width === 0) return;
      const kx = kr.left - sr.left + kr.width / 2;
      const ktop = kr.top - sr.top;
      const side = kx < cx - 24 ? 'L' : kx > cx + 24 ? 'R' : (alt = !alt) ? 'L' : 'R';
      const p = P[side];
      const nx = Math.max(-1, Math.min(1, (kx - cx) / (W / 2 || 1)));
      p.X.set(420, 0.85);
      p.X.t = kx;
      p.hy = ktop - 24;
      p.Y.set(1100, 0.75);
      p.Y.t = ktop - 4;
      clearTimeout(p.t);
      p.t = window.setTimeout(() => {
        p.Y.set(240, 0.8);
        p.Y.t = p.hy;
        wake();
      }, 70);
      bn.v += 100;
      lean.t = nx * 7;
      rot.t = nx * 3.5;
      clearTimeout(relaxT);
      relaxT = window.setTimeout(() => {
        paws.forEach(q => {
          q.X.t = q.rx;
          q.Y.set(120, 0.9);
          q.Y.t = q.ry;
        });
        lean.t = 0;
        rot.t = 0;
        wake();
      }, 800);
      bodyEl.classList.add('squint');
      clearTimeout(squintT);
      squintT = window.setTimeout(() => bodyEl.classList.remove('squint'), 130);
      wake();
    }

    const blinkInterval = window.setInterval(() => {
      bodyEl.classList.add('blink');
      window.setTimeout(() => bodyEl.classList.remove('blink'), 130);
    }, 3200);

    /* ========== 3. KHUNG VIẾT: CHỮ HIỆN DẦN + CARET MƯỢT ========== */
    let pv = '';
    const units: HTMLSpanElement[] = [];
    let idleT = 0;
    let lastKey = 0;

    display.innerHTML = '';
    const marker = document.createElement('span');
    marker.className = 'm';
    marker.textContent = '\u200B';
    const phEl = document.createElement('span');
    phEl.className = 'ph';
    phEl.textContent = placeholder;
    const tail = document.createElement('span');
    tail.textContent = '\u200B';
    display.append(marker, phEl, tail);

    function makeSpan(v: string, i: number, animate = true) {
      const s = document.createElement('span');
      s.className = animate ? 'c fresh' : 'c';
      const c = v.charCodeAt(i);
      const prev = i > 0 ? v.charCodeAt(i - 1) : 0;
      if (c >= 0xdc00 && c <= 0xdfff && prev >= 0xd800 && prev <= 0xdbff) {
        s.textContent = '';
      } else if (c >= 0xd800 && c <= 0xdbff && i + 1 < v.length) {
        s.textContent = v[i] + v[i + 1];
      } else {
        s.textContent = v[i];
      }
      if (animate) {
        s.addEventListener(
          'animationend',
          () => {
            s.className = 'c';
          },
          { once: true }
        );
      }
      return s;
    }

    function syncText(animateNewChars = true) {
      if (!ta || !display) return;
      const v = ta.value;
      if (v === pv) return;
      let p = 0;
      const max = Math.min(pv.length, v.length);
      while (p < max && pv[p] === v[p]) p++;
      let s = 0;
      while (s < max - p && pv[pv.length - 1 - s] === v[v.length - 1 - s]) s++;
      const removed = pv.length - p - s;
      const added = v.length - p - s;
      units.splice(p, removed).forEach(u => u.remove());
      const anchor = units[p] || tail;
      const ns: HTMLSpanElement[] = [];
      for (let j = 0; j < added; j++) {
        const n = makeSpan(v, p + j, animateNewChars);
        display.insertBefore(n, anchor);
        ns.push(n);
      }
      units.splice(p, 0, ...ns);
      pv = v;
    }

    function moveMarker() {
      if (!ta || !display) return;
      const v = ta.value;
      const sel = Math.min(ta.selectionStart || 0, units.length);
      phEl.style.display = v === '' ? 'inline' : 'none';
      display.insertBefore(marker, v === '' ? phEl : units[sel] || tail);
    }

    function placeCaret() {
      if (!paper || !display || !caret) return;
      const r = marker.getBoundingClientRect();
      const pr = paper.getBoundingClientRect();
      if (pr.width === 0) return;
      const fs = parseFloat(getComputedStyle(display).fontSize) || 20;
      const h = Math.round(fs * 1.3);
      setCaret(r.left - pr.left, r.top - pr.top + (r.height - h) / 2, h);
      caret.classList.remove('idle');
      clearTimeout(idleT);
      idleT = window.setTimeout(() => caret.classList.add('idle'), 700);
    }

    function render(animateNewChars = true) {
      if (!ta) return;
      syncText(animateNewChars);
      moveMarker();
      placeCaret();
      const t = ta.value.trim();
      if (wcRef.current) {
        wcRef.current.textContent = String(t ? t.split(/\s+/).length : 0);
      }
    }

    function beat() {
      if (!caret || typeof caret.animate !== 'function') return;
      caret.animate(
        [
          { boxShadow: '0 0 14px rgba(201,37,50,.7)' },
          { boxShadow: '0 0 6px rgba(201,37,50,.35)' }
        ],
        { duration: 450, easing: 'ease-out' }
      );
    }

    function onInput(e: Event) {
      if (!ta) return;
      render(true);
      beat();
      onChangeRef.current(ta.value);
      const now = performance.now();
      const ie = e as InputEvent;
      if (now - lastKey > 60 && ie && ie.data) {
        const base = ie.data
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/đ/gi, 'd')
          .toLowerCase()[0];
        const el = byCharRef.current[base];
        if (el) {
          light(el);
          unlight(el);
          slam(el);
          playClick(el === byCharRef.current[' '] ? 'Space' : '');
        }
      }
    }

    const onKeyDown = (e: KeyboardEvent) => {
      lastKey = performance.now();
      initAudio();
      const el = byCodeRef.current[e.code];
      if (!el) return;
      light(el);
      if (!e.ctrlKey && !e.metaKey && !/^(Shift|Control|Alt|Meta|CapsLock)/.test(e.code)) {
        slam(el);
        playClick(e.code);
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      unlight(byCodeRef.current[e.code]);
      requestAnimationFrame(() => render(true));
    };

    const onClick = () => render(true);
    const onFocus = () => {
      paper.classList.add('focus');
      initAudio();
      render(true);
    };
    const onBlur = () => {
      paper.classList.remove('focus');
    };
    const onSelectionChange = () => {
      if (document.activeElement === ta) render(true);
    };
    const onPaperMouseDown = (e: MouseEvent) => {
      if (e.target !== ta) {
        e.preventDefault();
        ta.focus();
      }
    };

    ta.addEventListener('input', onInput);
    ta.addEventListener('keydown', onKeyDown);
    ta.addEventListener('keyup', onKeyUp);
    ta.addEventListener('click', onClick);
    ta.addEventListener('focus', onFocus);
    ta.addEventListener('blur', onBlur);
    document.addEventListener('selectionchange', onSelectionChange);
    paper.addEventListener('mousedown', onPaperMouseDown);

    const ro = new ResizeObserver(() => {
      placeCaret();
      layout();
    });
    ro.observe(paper);
    ro.observe(stage);
    window.addEventListener('resize', layout);

    // Initial value sync without triggering fresh animation on pre-loaded draft
    if (value && ta.value !== value) {
      ta.value = value;
    }
    (document.fonts?.ready || Promise.resolve()).then(() => {
      layout();
      render(false);
    });
    layout();
    render(false);

    syncAndRenderRef.current = () => render(false);
    layoutFnRef.current = layout;
    (window as unknown as { refreshWritingStudioLayout?: () => void }).refreshWritingStudioLayout = () => {
      layout();
      render(false);
    };

    return () => {
      clearInterval(blinkInterval);
      if (raf) cancelAnimationFrame(raf);
      ta.removeEventListener('input', onInput);
      ta.removeEventListener('keydown', onKeyDown);
      ta.removeEventListener('keyup', onKeyUp);
      ta.removeEventListener('click', onClick);
      ta.removeEventListener('focus', onFocus);
      ta.removeEventListener('blur', onBlur);
      document.removeEventListener('selectionchange', onSelectionChange);
      paper.removeEventListener('mousedown', onPaperMouseDown);
      ro.disconnect();
      window.removeEventListener('resize', layout);
    };
  }, [initAudio, playClick, placeholder]);

  // Sync external `value` prop into textarea when changed from outside (e.g. switching Day or restoring history)
  useEffect(() => {
    const ta = taRef.current;
    if (ta && ta.value !== value) {
      ta.value = value;
      syncAndRenderRef.current?.();
    }
  }, [value]);

  useEffect(() => {
    if (showStage) {
      requestAnimationFrame(() => {
        layoutFnRef.current?.();
        syncAndRenderRef.current?.();
      });
    }
  }, [showStage]);

  return (
    <section className="writing-studio-scope">
      <style>{`
        .writing-studio-scope {
          --paper:#E9DCC2; --paper-2:#F1E7D3; --aged:#DCC9A8; --aged-dk:#C9B38E;
          --ink:#181614; --ink-2:#51483D; --ink-3:#796B59; --rule:#493B2D;
          --red:#C92532; --red-dk:#991D27; --red-lt:#E8B7AC;
          color: var(--ink);
        }
        .writing-studio-scope * { box-sizing: border-box; }
        .writing-studio-scope .paper {
          position:relative;background:var(--grain) 0 0/260px,var(--paper-2);
          border:1.5px solid var(--rule);border-radius:3px;min-height:${minHeight}px;cursor:text;
          box-shadow:4px 4px 0 rgba(24,22,20,.2);
          transition:box-shadow .3s,border-color .3s;
        }
        .writing-studio-scope .paper.focus {
          border-color:var(--red);
          box-shadow:0 0 0 3px rgba(201,37,50,.14),4px 4px 0 rgba(24,22,20,.2);
        }
        .writing-studio-scope .field {
          font-family:'Playfair Display',Georgia,serif;font-size:clamp(19px,2.6vw,24px);line-height:1.75;
          padding:26px 30px;white-space:pre-wrap;overflow-wrap:break-word;word-break:normal;
          letter-spacing:0;margin:0;min-height:${minHeight}px;
        }
        .writing-studio-scope #display { position:relative;color:var(--red); }
        .writing-studio-scope #ta {
          position:absolute;inset:0;width:100%;height:100%;border:0;outline:0;background:none;
          resize:none;color:transparent;caret-color:transparent;overflow:hidden;
        }
        .writing-studio-scope .c { color:var(--red); }
        .writing-studio-scope .c.fresh { animation:writingStudioInk 0.7s linear both; }
        @keyframes writingStudioInk {
          0%  {opacity:0;color:#C9B38E}
          18% {opacity:.55;color:#DDB8A2}
          40% {opacity:.9;color:#E0868D}
          70% {opacity:1;color:#D2495A}
          100%{opacity:1;color:#C92532}
        }
        .writing-studio-scope .ph { color:var(--ink-3);font-style:italic;opacity:.75; }
        .writing-studio-scope .m { display:inline; }

        .writing-studio-scope .caret {
          position:absolute;left:0;top:0;width:3px;border-radius:1px;pointer-events:none;
          background:var(--red);box-shadow:0 0 6px rgba(201,37,50,.35);opacity:0;will-change:transform;
          transition:opacity .25s;
        }
        .writing-studio-scope .paper.focus .caret { opacity:1; }
        .writing-studio-scope .paper.focus .caret.idle { animation:writingStudioBlink 1.1s ease-in-out infinite; }
        @keyframes writingStudioBlink { 0%,100%{opacity:1} 50%{opacity:.1} }

        .writing-studio-scope .meta {
          display:flex;justify-content:space-between;align-items:center;margin:12px 2px 24px;
          font-size:13.5px;color:var(--ink-2);
        }
        .writing-studio-scope .meta b { color:var(--red);font-weight:700; }
        .writing-studio-scope .meta button {
          font:500 12px 'Oswald',sans-serif;letter-spacing:.12em;text-transform:uppercase;color:var(--ink);
          background:var(--paper-2);border:1.5px solid var(--ink);border-radius:3px;padding:7px 14px;cursor:pointer;
          box-shadow:2px 2px 0 var(--ink);transition:background .15s,color .15s,transform .1s,box-shadow .1s;
        }
        .writing-studio-scope .meta button:hover { background:var(--red);color:#fff; }
        .writing-studio-scope .meta button:active { transform:translate(2px,2px);box-shadow:0 0 0 var(--ink); }

        /* ====== BÀN PHÍM: TRANG BÁO ====== */
        .writing-studio-scope .masthead {
          display:flex;justify-content:space-between;align-items:center;padding:6px 2px;margin-bottom:12px;
          border-top:4px double var(--ink);border-bottom:1px solid var(--ink);
          font:500 11.5px 'Oswald',sans-serif;letter-spacing:.22em;text-transform:uppercase;color:var(--ink);
        }
        .writing-studio-scope .masthead b { font-weight:600; }
        .writing-studio-scope .masthead span { color:var(--ink-2); }
        .writing-studio-scope .stage {
          position:relative;padding:14px 14px 18px;border-radius:3px;
          background:var(--fiber) 0 0/520px,var(--grain) 0 0/260px,var(--aged);
          box-shadow:0 0 0 2px var(--ink),7px 7px 0 rgba(24,22,20,.9);
        }
        .writing-studio-scope .stage::before {
          content:"";position:absolute;left:0;right:0;top:0;height:134px;border-radius:3px 3px 0 0;
          background:radial-gradient(rgba(24,22,20,.38) 1.3px,transparent 1.8px) 0 0/6px 6px,var(--red);
          clip-path:polygon(0 0,100% 0,100% 80%,97% 89%,93% 79%,88% 91%,83% 82%,77% 93%,70% 84%,63% 94%,56% 85%,49% 93%,42% 83%,34% 93%,27% 84%,19% 92%,12% 82%,6% 91%,0 82%);
        }
        .writing-studio-scope .stage::after {
          content:"Keep going";position:absolute;left:28px;top:34px;transform:rotate(-6deg);pointer-events:none;
          font:italic 500 27px 'Playfair Display',serif;color:var(--paper-2);
        }
        .writing-studio-scope .stamp {
          position:absolute;right:26px;top:30px;transform:rotate(7deg);z-index:1;pointer-events:none;
          font:600 15px 'Oswald',sans-serif;letter-spacing:.2em;text-transform:uppercase;color:var(--paper-2);
          border:2.5px solid var(--paper-2);padding:3px 10px 3px 14px;border-radius:3px;opacity:.9;
        }
        .writing-studio-scope .mspace { height:128px; }
        .writing-studio-scope #fx {
          position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:5;overflow:visible;
        }
        .writing-studio-scope .row { display:flex;gap:6px;margin-bottom:8px; }
        .writing-studio-scope .row.last { justify-content:center;margin-bottom:0; }
        .writing-studio-scope .key {
          flex:var(--w,1) 1 0;min-width:0;height:clamp(30px,5.2vw,42px);
          display:grid;place-items:center;position:relative;overflow:hidden;user-select:none;
          font:500 clamp(10px,1.5vw,13px) 'Oswald',sans-serif;letter-spacing:.06em;text-transform:uppercase;
          color:var(--ink);background:var(--grain) 0 0/260px,linear-gradient(#F6EEDC,#EADDC0);
          border:1.5px solid var(--ink);border-radius:3px;box-shadow:0 3px 0 var(--ink);
          transition:background .7s ease-out,color .7s ease-out,box-shadow .7s ease-out,transform .22s cubic-bezier(.2,.8,.2,1);
        }
        .writing-studio-scope .key.mod { background:var(--grain) 0 0/260px,#26211D;color:var(--paper-2); }
        .writing-studio-scope .key[data-code="Enter"] { background:var(--grain) 0 0/260px,var(--red);color:#fff; }
        .writing-studio-scope .key.space { flex:0 0 56%; }
        .writing-studio-scope .key.space::after {
          content:"MASTER ENGLISH";font-size:.82em;letter-spacing:.42em;color:var(--ink-3);
        }
        .writing-studio-scope .key.lit {
          background:var(--red);color:#fff;border-color:var(--ink);
          box-shadow:0 0 0 var(--ink),0 0 0 3px rgba(201,37,50,.3);
          transform:translateY(3px);transition-duration:.05s,.05s,.05s,.05s;
        }
        .writing-studio-scope .key.lit.space::after { color:var(--red-lt); }
        .writing-studio-scope .key .rip {
          position:absolute;left:50%;top:50%;width:10px;height:10px;margin:-5px 0 0 -5px;border-radius:50%;
          background:rgba(241,231,211,.55);animation:writingStudioRip .55s ease-out forwards;pointer-events:none;
        }
        @keyframes writingStudioRip { to{transform:scale(7);opacity:0} }

        .writing-studio-scope #body .eyes-hit { display:none; }
        .writing-studio-scope #body.squint .eyes-open,
        .writing-studio-scope #body.blink .eyes-open { display:none; }
        .writing-studio-scope #body.squint .eyes-hit { display:inline; }
        .writing-studio-scope #body.blink:not(.squint) .eyes-blink { display:inline; }
        .writing-studio-scope #body .eyes-blink { display:none; }

        .writing-studio-scope .hint {
          margin:20px 4px 0;font:italic 400 14px 'Playfair Display',serif;color:var(--ink-3);text-align:center;
        }
        @media (max-width:620px){
          .writing-studio-scope .stage::after,.writing-studio-scope .stamp{display:none}
          .writing-studio-scope .masthead{letter-spacing:.14em}
        }
        @media (prefers-reduced-motion:reduce){
          .writing-studio-scope .c.fresh{animation-duration:.01s}
          .writing-studio-scope .caret{transition:none}
        }
      `}</style>

      <div className="paper" id="paper" ref={paperRef}>
        <div className="field" id="display" ref={displayRef} aria-hidden="true" />
        <textarea
          className="field"
          id="ta"
          ref={taRef}
          spellCheck={false}
          aria-label="Khung viết bài"
          autoComplete="off"
        />
        <div className="caret" id="caret" ref={caretRef} />
      </div>

      {renderToolbar ? (
        <div className="my-3">
          {renderToolbar({
            soundOn,
            toggleSound,
            showStage,
            toggleStage,
            hasRealAudio: true,
            triggerUploadMp3: () => {}
          })}
        </div>
      ) : (
        <div className="meta">
          <span>
            Số từ: <b id="wc" ref={wcRef}>0</b>
          </span>
          <button
            id="snd"
            type="button"
            aria-pressed={soundOn}
            onClick={toggleSound}
            onMouseDown={e => e.stopPropagation()}
          >
            {soundOn ? '🔊 Âm thanh: bật' : '🔇 Âm thanh: tắt'}
          </button>
        </div>
      )}

      <div style={{ display: showStage ? 'block' : 'none' }}>
        <div className="masthead">
          <b>The Typing Desk</b>
          <span>Keyboard Edition · Nº 01</span>
        </div>
        <div className="stage" id="stage" ref={stageRef}>
          <div className="stamp">Practice</div>
          <svg id="fx" ref={svgRef} xmlns="http://www.w3.org/2000/svg">
            <g id="armL" ref={armLRef}>
              <path className="ao" fill="none" stroke="#181614" strokeWidth="21" strokeLinecap="round" />
              <path className="ai" fill="none" stroke="#F1E7D3" strokeWidth="14" strokeLinecap="round" />
            </g>
            <g id="armR" ref={armRRef}>
              <path className="ao" fill="none" stroke="#181614" strokeWidth="21" strokeLinecap="round" />
              <path className="ai" fill="none" stroke="#F1E7D3" strokeWidth="14" strokeLinecap="round" />
            </g>

            {/* Linh vật "Ruby": mèo đeo kính + tai nghe, in đen trắng + đỏ biên tập */}
            <g id="body" ref={bodyElRef}>
              <defs>
                <clipPath id="hc">
                  <ellipse cx="0" cy="62" rx="62" ry="48" />
                </clipPath>
                <pattern id="ht" width="5" height="5" patternUnits="userSpaceOnUse">
                  <circle cx="2.5" cy="2.5" r="1.15" fill="#181614" />
                </pattern>
              </defs>
              <path
                d="M-52 40 L-48 -4 L-16 24 Z"
                fill="#F1E7D3"
                stroke="#181614"
                strokeWidth="3.5"
                strokeLinejoin="round"
              />
              <path
                d="M52 40 L48 -4 L16 24 Z"
                fill="#181614"
                stroke="#181614"
                strokeWidth="3.5"
                strokeLinejoin="round"
              />
              <path d="M-44 28 L-42 8 L-27 22 Z" fill="#C92532" />
              <path d="M44 28 L42 8 L27 22 Z" fill="#C92532" />
              <ellipse cx="0" cy="62" rx="62" ry="48" fill="#F1E7D3" />
              <g clipPath="url(#hc)">
                <circle cx="40" cy="34" r="24" fill="#181614" />
                <circle cx="-44" cy="90" r="20" fill="#C92532" />
                <circle cx="-12" cy="22" r="10" fill="#796B59" opacity=".8" />
                <ellipse cx="0" cy="112" rx="74" ry="30" fill="url(#ht)" opacity=".55" />
              </g>
              <ellipse cx="0" cy="62" rx="62" ry="48" fill="none" stroke="#181614" strokeWidth="3.5" />
              <g className="eyes-open">
                <circle cx="-23" cy="60" r="6.5" fill="#181614" />
                <circle cx="23" cy="60" r="6.5" fill="#181614" />
                <circle cx="-21" cy="58" r="2" fill="#fff" />
                <circle cx="25" cy="58" r="2" fill="#fff" />
              </g>
              <g className="eyes-blink" stroke="#181614" strokeWidth="3.5" strokeLinecap="round" fill="none">
                <path d="M-30 61 H-16" />
                <path d="M16 61 H30" />
              </g>
              <g
                className="eyes-hit"
                stroke="#181614"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              >
                <path d="M-30 53 L-17 60 L-30 67" />
                <path d="M30 53 L17 60 L30 67" />
              </g>
              <circle cx="-23" cy="60" r="16" fill="rgba(241,231,211,.25)" stroke="#181614" strokeWidth="3.5" />
              <circle cx="23" cy="60" r="16" fill="rgba(241,231,211,.25)" stroke="#181614" strokeWidth="3.5" />
              <path d="M-8 58 Q0 53 8 58" fill="none" stroke="#181614" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M-4 73 H4 L0 78 Z" fill="#C92532" stroke="#181614" strokeWidth="1.8" strokeLinejoin="round" />
              <path
                d="M0 78 V80 Q-5 85 -10 81 M0 80 Q5 85 10 81"
                fill="none"
                stroke="#181614"
                strokeWidth="2.8"
                strokeLinecap="round"
              />
              <path d="M-60 62 C-64 -6 64 -6 60 62" fill="none" stroke="#181614" strokeWidth="7.5" strokeLinecap="round" />
              <rect x="-73" y="46" width="19" height="36" rx="9" fill="#181614" />
              <rect x="54" y="46" width="19" height="36" rx="9" fill="#181614" />
              <rect x="-69" y="53" width="9" height="22" rx="4.5" fill="#C92532" />
              <rect x="60" y="53" width="9" height="22" rx="4.5" fill="#C92532" />
            </g>

            <g id="pawL" ref={pawLRef}>
              <circle r="15" fill="#F1E7D3" stroke="#181614" strokeWidth="3.5" />
              <ellipse cy="3" rx="7" ry="5.5" fill="#C92532" />
              <circle cx="-8" cy="-6" r="2.6" fill="#C92532" />
              <circle cy="-9" r="2.6" fill="#C92532" />
              <circle cx="8" cy="-6" r="2.6" fill="#C92532" />
            </g>
            <g id="pawR" ref={pawRRef}>
              <circle r="15" fill="#F1E7D3" stroke="#181614" strokeWidth="3.5" />
              <ellipse cy="3" rx="7" ry="5.5" fill="#C92532" />
              <circle cx="-8" cy="-6" r="2.6" fill="#C92532" />
              <circle cy="-9" r="2.6" fill="#C92532" />
              <circle cx="8" cy="-6" r="2.6" fill="#C92532" />
            </g>
          </svg>
          <div className="mspace" />
          <div id="kb">
            {ROWS.map((r, i) => (
              <div key={i} className={`row${i === ROWS.length - 1 ? ' last' : ''}`}>
                {r.map(d => (
                  <div
                    key={d.code}
                    ref={el => {
                      byCodeRef.current[d.code] = el;
                      if (d.ch) byCharRef.current[d.ch] = el;
                    }}
                    className={`key ${d.cls || ''}${!d.ch ? ' mod' : ''}`}
                    data-code={d.code}
                    style={d.w ? ({ '--w': d.w } as React.CSSProperties) : undefined}
                  >
                    {d.label}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        <p className="hint">Mẹo: gõ thử Backspace hay Enter để xem linh vật với tay xa thế nào 🙂</p>
      </div>
    </section>
  );
};
