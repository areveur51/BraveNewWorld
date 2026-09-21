/* Exact manifesto — one spoken line on screen at a time. */
const MANIFESTO = [
  "A•Rêveur is a French word that translates to \"dreamer\".",
  "",
  "\u201cDreamers need to stick together.",
  "It\u2019s not programming. It\u2019s personal.\u201d",
  "",
  "We are going to show you a new world.",
  "Those who are blind will soon see the light.",
  "A beautiful brave new world lies ahead.",
  "We take this journey together.",
  "One step at a time.",
  "Where we go one, we go all!",
  "",
  "Nothing can stop what is coming.",
  "Nothing!",
  "",
  "THE BEST IS YET TO COME!",
  "",
  "THIS GAME IS DEDICATED TO ALL THE DREAMING CHILDREN.",
].join("\n");
window.MANIFESTO = MANIFESTO;
const LINES = MANIFESTO.split("\n");
window.LINES = LINES;

/* Speaking cadence: letter-by-letter at a read-along pace, with breath at punctuation. */
const LETTER_MS = 70;
const SPACE_MS = 95;
const COMMA_MS = 240;
const COLON_MS = 300;
const SENTENCE_MS = 520;
const LINE_HOLD_MS = 780;
const BLANK_HOLD_MS = 980;
const START_HOLD_MS = 420;
const END_HOLD_MS = 2400;

function measureLineWidthDom(line, fontSizePx) {
  const probe = measureLineWidthDom._probe || (measureLineWidthDom._probe = (() => {
    const s = document.createElement("span");
    s.setAttribute("aria-hidden", "true");
    s.style.cssText = "position:absolute;left:-99999px;top:0;white-space:pre;visibility:hidden;pointer-events:none;font-family:\"Courier New\",Courier,ui-monospace,monospace;font-weight:400;letter-spacing:normal;";
    document.body.appendChild(s);
    return s;
  })());
  probe.style.fontSize = fontSizePx + "px";
  probe.textContent = line;
  return probe.getBoundingClientRect().width;
}

function lineWidthPx(line, fontSizePx) {
  if (!line) return 0;
  return measureLineWidthDom(line, fontSizePx);
}

function captionText() {
  const term = document.getElementById("terminal");
  return term ? term.textContent || "" : "";
}

function setCaptionText(text) {
  const term = document.getElementById("terminal");
  if (!term) return;
  term.textContent = String(text || "").replace(/\n/g, "");
}

function fitTerminalFont(activeLine) {
  const term = document.getElementById("terminal");
  if (!term) return;
  const glass = term.closest(".crt-glass") || term.parentElement;
  const wrap = term.closest(".crt-wrap");
  const lineBox = term.closest(".crt-line");
  const stage = document.querySelector(".stage") || document.body;
  const cs = glass ? getComputedStyle(glass) : null;
  const padX = cs
    ? (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0)
    : 72;
  const linePad = 24;
  const innerAir = 40;
  const maxBox = Math.max(220, Math.min(stage.clientWidth * 0.9, 1040));
  const maxText = Math.max(140, maxBox - padX - linePad);
  const line = (typeof activeLine === "string")
    ? activeLine
    : (captionText() || LINES.reduce((a, b) => (b.length > a.length ? b : a), ""));
  const sample = line && line.length ? line : "Where we go one, we go all!";
  const minFs = 18;
  const maxFs = 26;
  const widthAt = (fs) => lineWidthPx(sample, fs);
  let best = maxFs;
  if (widthAt(maxFs) <= maxText - 12) {
    best = maxFs;
  } else if (widthAt(minFs) <= maxText - 12) {
    let lo = minFs;
    let hi = maxFs;
    best = minFs;
    for (let n = 0; n < 22; n++) {
      const mid = (lo + hi) / 2;
      if (widthAt(mid) <= maxText - 12) {
        best = mid;
        lo = mid;
      } else {
        hi = mid;
      }
    }
  } else {
    best = minFs;
  }
  const fitsOneLine = widthAt(best) <= maxText - 12;
  document.documentElement.style.setProperty("--term-fs", best.toFixed(2) + "px");
  requestAnimationFrame(() => {
    const cursorEl = document.getElementById("cursor");
    const cursorW = cursorEl && getComputedStyle(cursorEl).display !== "none"
      ? Math.max(cursorEl.getBoundingClientRect().width || 0, best * 0.7)
      : best * 0.7;
    const textW = widthAt(best);
    const needed = Math.ceil(textW + cursorW + padX + linePad + innerAir);
    const width = fitsOneLine
      ? Math.min(maxBox, Math.max(200, needed))
      : maxBox;
    if (glass) glass.style.width = width + "px";
    if (wrap) wrap.classList.toggle("is-beat", !sample.trim());
    if (lineBox) lineBox.style.maxWidth = "100%";
  });
}

const el = document.getElementById("terminal");
const cursor = document.getElementById("cursor");
const root = document.documentElement;
const scenes = Array.from(document.querySelectorAll(".scene"));
let sceneIdx = 0;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Muted looping video background behind the CRT overlay. */
(function initBgVideo() {
  const video = document.getElementById("bg-video");
  const body = document.body;
  if (!video) return;

  function showStills() {
    body.classList.remove("has-bg-video");
    body.classList.add("bg-video-fallback");
    try { video.pause(); } catch (_) {}
  }

  function showVideo() {
    body.classList.add("has-bg-video");
    body.classList.remove("bg-video-fallback");
  }

  video.muted = true;
  video.defaultMuted = true;
  video.loop = true;
  video.playsInline = true;
  video.setAttribute("playsinline", "");
  video.setAttribute("muted", "");

  if (reduceMotion) {
    showStills();
    try {
      video.pause();
      video.currentTime = 0;
    } catch (_) {}
    return;
  }

  video.addEventListener("error", showStills);
  video.addEventListener("playing", showVideo);

  const tryPlay = () => {
    const p = video.play();
    if (p && typeof p.then === "function") {
      p.then(showVideo).catch(showStills);
    }
  };

  if (video.readyState >= 2) tryPlay();
  else video.addEventListener("canplay", tryPlay, { once: true });
  window.addEventListener("load", tryPlay, { once: true });
})();

function setTilt(nx, ny) {
  if (reduceMotion) return;
  root.style.setProperty("--rx", (ny * -6).toFixed(2) + "deg");
  root.style.setProperty("--ry", (nx * 8).toFixed(2) + "deg");
  root.style.setProperty("--tx", (nx * -18).toFixed(1) + "px");
  root.style.setProperty("--ty", (ny * -12).toFixed(1) + "px");
  scenes.forEach((scene) => {
    const sky = scene.querySelector(".layer-sky");
    const mid = scene.querySelector(".layer-mid");
    const near = scene.querySelector(".layer-near");
    if (sky) sky.style.transform = `translate3d(${nx * -8}px, ${ny * -5}px, -80px) scale(1.18)`;
    if (mid) mid.style.transform = `translate3d(${nx * -16}px, ${ny * -10}px, -30px) scale(1.12)`;
    if (near) near.style.transform = `translate3d(${nx * -28}px, ${ny * -18}px, 20px) scale(1.08)`;
  });
}

function onPointer(e) {
  const x = e.clientX ?? (e.touches && e.touches[0]?.clientX) ?? window.innerWidth / 2;
  const y = e.clientY ?? (e.touches && e.touches[0]?.clientY) ?? window.innerHeight / 2;
  setTilt((x / window.innerWidth) * 2 - 1, (y / window.innerHeight) * 2 - 1);
}

function cycleScene() {
  if (scenes.length < 2) return;
  scenes[sceneIdx].classList.remove("is-active");
  sceneIdx = (sceneIdx + 1) % scenes.length;
  scenes[sceneIdx].classList.add("is-active");
}

function delayForChar(ch) {
  if (ch === "\n") return 0;
  if (".!?".includes(ch)) return SENTENCE_MS;
  if (";:".includes(ch)) return COLON_MS;
  if (",\u2014\u2013".includes(ch)) return COMMA_MS;
  if (ch === " ") return SPACE_MS;
  if ("\"'\u2018\u2019\u201c\u201d".includes(ch)) return 85;
  return LETTER_MS;
}

function lineIndexForCount(count) {
  if (count <= 0) return 0;
  let seen = 0;
  for (let li = 0; li < LINES.length; li++) {
    const end = seen + LINES[li].length;
    const withNl = end + (li < LINES.length - 1 ? 1 : 0);
    if (count <= withNl) return li;
    seen = withNl;
  }
  return LINES.length - 1;
}

function sliceForCount(count) {
  const n = Math.max(0, Math.min(MANIFESTO.length, count | 0));
  if (n <= 0) return { lineIdx: 0, text: "", doneAll: false };
  const li = lineIndexForCount(n);
  let start = 0;
  for (let i = 0; i < li; i++) start += LINES[i].length + 1;
  const into = Math.max(0, n - start);
  const text = LINES[li].slice(0, Math.min(LINES[li].length, into));
  return { lineIdx: li, text, doneAll: n >= MANIFESTO.length };
}

function visibleSlice(count) {
  const sliced = sliceForCount(count);
  const raw = LINES[sliced.lineIdx] || "";
  if (raw.trim()) return { ...sliced, beat: false };
  for (let i = sliced.lineIdx - 1; i >= 0; i--) {
    if (LINES[i].trim()) {
      return { lineIdx: i, text: LINES[i], doneAll: sliced.doneAll, beat: true };
    }
  }
  return { ...sliced, beat: true };
}

function holdAfterNewline(countAfterNewline) {
  const li = lineIndexForCount(Math.min(MANIFESTO.length, countAfterNewline));
  const line = LINES[li] || "";
  if (!line.trim()) return BLANK_HOLD_MS;
  return LINE_HOLD_MS;
}

let lastTyped = -1;
let lastLineIdx = -2;
let fadedOut = false;
let shown = 0;
let nextAt = 0;
let rafId = 0;
let typingActive = false;
let lastVideoTime = 0;
let lastResetAt = 0;
let trailerBound = false;
let endHoldStarted = false;

function setFaded(on) {
  const wrap = document.querySelector(".crt-wrap");
  if (!wrap) return;
  fadedOut = !!on;
  wrap.classList.toggle("is-faded", fadedOut);
}

function renderTyped(count) {
  const n = Math.max(0, Math.min(MANIFESTO.length, count | 0));
  const { lineIdx, text, doneAll, beat } = visibleSlice(n);
  if (n === lastTyped && lineIdx === lastLineIdx && !doneAll) return;
  const lineChanged = lineIdx !== lastLineIdx;
  lastTyped = n;
  lastLineIdx = lineIdx;
  setCaptionText(text);
  if (el) el.classList.toggle("is-beat", !!beat);
  const fullLine = LINES[lineIdx] && LINES[lineIdx].trim() ? LINES[lineIdx] : text;
  if (lineChanged || n <= 1) fitTerminalFont(fullLine || " ");
  else fitTerminalFont(fullLine || text || " ");
  if (doneAll) {
    if (cursor) cursor.classList.add("done");
  } else {
    if (cursor) cursor.classList.remove("done");
    if (fadedOut) setFaded(false);
  }
}

function stopCadence() {
  typingActive = false;
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = 0;
  }
}

function cadenceFrame(now) {
  if (!typingActive) return;
  if (now < nextAt) {
    rafId = requestAnimationFrame(cadenceFrame);
    return;
  }

  if (shown >= MANIFESTO.length) {
    if (!endHoldStarted) {
      endHoldStarted = true;
      if (cursor) cursor.classList.add("done");
      nextAt = now + END_HOLD_MS;
      rafId = requestAnimationFrame(cadenceFrame);
      return;
    }
    setFaded(true);
    typingActive = false;
    rafId = 0;
    return;
  }

  const ch = MANIFESTO[shown];
  shown += 1;
  renderTyped(shown);
  nextAt = now + (ch === "\n" ? holdAfterNewline(shown) : delayForChar(ch));
  rafId = requestAnimationFrame(cadenceFrame);
}

function startCadenceTypewriter() {
  stopCadence();
  shown = 0;
  lastTyped = -1;
  lastLineIdx = -2;
  endHoldStarted = false;
  setFaded(false);
  if (cursor) cursor.classList.remove("done");
  renderTyped(0);
  typingActive = true;
  nextAt = performance.now() + START_HOLD_MS;
  rafId = requestAnimationFrame(cadenceFrame);
}

function maybeResetFromVideo(tSec) {
  if (lastVideoTime > 1 && tSec + 0.5 < lastVideoTime) {
    const now = performance.now();
    if (now - lastResetAt > 400) {
      lastResetAt = now;
      startCadenceTypewriter();
    }
  }
  lastVideoTime = tSec;
}

function startTrailerSync() {
  if (window.__BNW_SKIP_TYPEWRITER) {
    window.finishManifesto();
    return;
  }
  if (reduceMotion) {
    window.finishManifesto();
    return;
  }

  startCadenceTypewriter();

  const video = document.getElementById("bg-video");
  if (video && !trailerBound) {
    trailerBound = true;
    const onStamp = () => maybeResetFromVideo(video.currentTime || 0);
    video.addEventListener("timeupdate", onStamp);
    video.addEventListener("seeked", onStamp);
    video.addEventListener("play", onStamp);
    video.addEventListener("ended", () => {
      lastVideoTime = 0;
      const now = performance.now();
      if (now - lastResetAt > 400) {
        lastResetAt = now;
        startCadenceTypewriter();
      }
    });
    return;
  }

  if (!video) {
    const loopMs = 42000;
    setInterval(() => {
      if (!typingActive) startCadenceTypewriter();
    }, loopMs);
  }
}

window.fitTerminalFont = fitTerminalFont;
window.__bnwCaptionText = captionText;
window.__bnwSetCaptionText = setCaptionText;
window.__bnwSliceForCount = sliceForCount;
window.__bnwVisibleSlice = visibleSlice;
window.__bnwDelayForChar = delayForChar;
window.__bnwStartCadence = startCadenceTypewriter;
window.finishManifesto = function () {
  stopCadence();
  lastTyped = -1;
  lastLineIdx = -2;
  const last = [...LINES].reverse().find((line) => line.trim()) || "";
  setCaptionText(last);
  fitTerminalFont(last);
  if (cursor) cursor.classList.add("done");
  setFaded(false);
};
fitTerminalFont();
window.addEventListener("resize", () => fitTerminalFont(LINES[Math.max(0, lastLineIdx)] || captionText()));
startTrailerSync();
window.addEventListener("pointermove", onPointer, { passive: true });
window.addEventListener("deviceorientation", (ev) => {
  if (reduceMotion || ev.gamma == null || ev.beta == null) return;
  setTilt(Math.max(-1, Math.min(1, ev.gamma / 30)), Math.max(-1, Math.min(1, (ev.beta - 45) / 30)));
}, true);
if (!reduceMotion) setInterval(cycleScene, 14000);
