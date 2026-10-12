# LoveHub — "Journey" Landing Page (scroll-scrubbed video + light three.js)

> **Audience:** AI coding agent (Antigravity IDE). Read this whole file first.
> **Owner:** Saurav (repo `github.com/SAURAV-GGD/lovehub`, live `lovehub.in`).
> **Relation to v1:** this file **replaces the concept** of `implementation.md`. Rename the old file to `implementation-v1.md` and keep it in the repo root. Anything marked **(from v1 §x)** is reused unchanged from that file.

---

## 0. Rules for the agent

1. Work in phases (Section 7). Finish a phase, verify, commit, then continue.
2. Phase 0 is read-only. Report what you found before editing.
3. Do not touch auth, payments, API routes, database, `/create`, `/dashboard`, `/admin`, pricing logic or existing copy. Visual/scroll work only.
4. Match the existing project (JS vs TS, alias, Next/Vite). Check `package.json` versions before installing (v1 §0 rule 5 still applies).
5. If this file conflicts with the repo, stop and report.
6. Every phase ends with a measurable check. Report real numbers.

---

## 1. Concept

One short AI-generated video (a camera walking along a dirt path beside a lake, cherry blossoms, a village ahead) is the **background for the entire page, hero to footer**. Scroll position controls the video's `currentTime`, so scrolling = walking toward the village. HTML text stays on top. A transparent three.js canvas sits between video and text and draws **drifting petals** that react to scroll speed.

```
z-0  <video id="journey-video">   fixed, muted, never "plays" — scroll sets currentTime
z-0  #video-scrim                  fixed gradient so text stays readable
z-1  <canvas> (three.js)           fixed, transparent, petals only, pointer-events none
z-10 <main> sections               real HTML text, links, buttons
z-50 nav
```

`video.currentTime = progress * (duration - 0.05)` where `progress` is the existing piecewise scroll progress from v1 §5.2 (0 at top, 1 at bottom).

| Section id | progress | video time (5 s file) | What the user sees |
|---|---|---|---|
| `hero` | 0 | 0.0 s | Meadow, lake, path ahead |
| `demo` | 1/6 | 0.8 s | Walking along the path |
| `steps` | 2/6 | 1.7 s | Fence + flowers rush past |
| `features` | 3/6 | 2.5 s | Blossom trees close by |
| `pricing` | 4/6 | 3.3 s | Petal swirl / blur moment |
| `faq` | 5/6 | 4.2 s | Village + pagoda clearly visible |
| `cta` + footer | 0.92 → 1 | 4.6 → 5.0 s | Closest to the village |

The built-in petal blur in the video lands around `pricing → faq`. Keep that area visually calm (no busy full-bleed images behind it).

---

## 2. Hard constraints

### DO
- **One** `<Canvas>` (transparent). Mount it **after first paint** (idle callback) so LCP = poster image.
- Keep all text/buttons/links as HTML. Canvas is `aria-hidden` + `pointer-events: none`.
- Drive everything from the mutable `scrollState` object (v1 §5.2). Never put scroll progress in React state.
- Petals animate on the GPU (vertex shader). No per-particle CPU work.
- No allocation inside `useFrame`. Named imports from `three` only.
- Video attributes: `muted playsInline preload="auto"`, **no audio track in the file**, poster set.
- Respect `prefers-reduced-motion` and `saveData`: show the **poster image only**, no scrub, no canvas.
- Pause the rAF loops when the tab is hidden.

### DO NOT
- No `<video>` as a three.js texture. The video stays an HTML element **behind** the canvas.
- No lights, shadows, `MeshStandardMaterial`, post-processing, HDRI, `useGLTF`, `Html`, `Text3D`.
- No second canvas, no text inside WebGL, no external CDN assets, no new fonts.
- No `setState` inside `useFrame` or inside the scrub loop.
- Do **not** build the v1 night/stars/lanterns/heart worlds. The video is daytime throughout.

---

## 3. Assets (already prepared)

```
public/
  video/hero-journey.mp4    # 1280x720, 30 fps, 5.0 s, ~3.2 MB, H.264, no audio, keyframe every 4 frames (scrub-friendly)
  video/hero-poster.jpg     # first frame, used for LCP and the static tier
  frames/f_0001.webp …      # OPTIONAL, 100 frames 960 px wide (~6 MB). Only used if scrubbing stutters on iOS (Phase 5)
```

Source clip facts (do not "fix" these in code):
- The original render is 8 s, but after ~5 s the camera drifts **backwards**, so it was trimmed to 5.0 s.
- It does not loop and does not need to.
- It ends on the approach to the village, not at its door. A longer file can replace `hero-journey.mp4` later with **zero code changes** (duration is read at runtime).

Re-encode command (if a new clip is dropped in):
```bash
ffmpeg -i in.mp4 -an -vf "fps=30,scale=1280:-2" -c:v libx264 -preset slow -crf 28 -g 4 -pix_fmt yuv420p -movflags +faststart public/video/hero-journey.mp4
ffmpeg -i in.mp4 -frames:v 1 -q:v 3 public/video/hero-poster.jpg
```
`-g 4` (a keyframe every 4 frames) is what makes backwards scrubbing smooth. Do not raise it.

---

## 4. What changes vs v1

| v1 item | v2 action |
|---|---|
| §1 Descent concept, palette flow | **Replace** with Section 1 above |
| §5.1 `scenes.ts`, §5.2 `scrollState.ts` | **Keep unchanged** |
| §5.3 `useImmersiveScroll.ts` | **Keep**, but call it from a new always-on `ScrollDriver` (see 5.2), not from `ImmersiveRoot` |
| §5.4 `quality.ts` | **Keep**; `TIER_CONFIG` only needs `dprMax` and `petals` |
| §5.5 `ImmersiveLoader.tsx` | **Keep** |
| §5.6 `ImmersiveRoot.tsx` | **Simplify** (5.4 below) |
| §5.7 `SceneGroup.tsx` | **Delete** (only one scene now) |
| §5.8 `CameraRig.tsx` | **Replace** with pointer-parallax-only rig (5.5) |
| §5.9 `AtmosphereRig.tsx` | **Delete** (no sky colour, no fog, no hero-video fade) |
| §5.10 `Petals.tsx` | **Keep**, with the 3 edits in 5.6 |
| §5.11–5.15 Clouds, Canopy, Lanterns, StarField, HeartField, `textures.ts` | **Delete / do not build** |
| §5.16 page skeleton | **Replace** with 5.3 |
| §5.17 CSS fallbacks, §5.18 `Reveal` | **Keep**, with the CSS additions in 5.7 |
| §9 hero video section | **Obsolete**, assets are in Section 3 |

---

## 5. Architecture & code

```
src/
  components/immersive/
    ScrollDriver.tsx      # "use client" — runs Lenis + scrollState (always on, except reduced-motion)
    JourneyVideo.tsx      # "use client" — the scrubbed <video>
    ImmersiveLoader.tsx   # (v1 §5.5) mounts ImmersiveRoot after idle
    ImmersiveRoot.tsx     # <Canvas> + petals only
    CameraRig.tsx         # pointer parallax only
    Petals.tsx            # (v1 §5.10) with edits
  lib/immersive/
    scenes.ts  scrollState.ts  useImmersiveScroll.ts  quality.ts   # (v1, unchanged)
```

### 5.1 `JourneyVideo.tsx`

```tsx
"use client";
import { useEffect, useRef } from "react";
import { scrollState } from "@/lib/immersive/scrollState";

export default function JourneyVideo() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return; // poster only

    let raf = 0, cur = 0, last = -1, primed = false;

    // iOS only lets a video be controlled after one user gesture
    const unlock = () => { v.play().then(() => v.pause()).catch(() => {}); };
    window.addEventListener("touchstart", unlock, { once: true, passive: true });

    const loop = () => {
      const d = v.duration;
      if (d && isFinite(d)) {
        const target = Math.min(Math.max(scrollState.progress, 0), 1) * (d - 0.05);
        if (!primed) { cur = target; primed = true; }       // refresh mid-page: no scrub from 0
        cur += (target - cur) * 0.15;                       // extra smoothing on top of Lenis
        if (!v.seeking && Math.abs(cur - last) > 0.008) { v.currentTime = cur; last = cur; }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onVis = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) raf = requestAnimationFrame(loop);
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("touchstart", unlock);
    };
  }, []);

  return (
    <video
      ref={ref}
      id="journey-video"
      className="fixed inset-0 z-0 h-full w-full object-cover"
      muted playsInline preload="auto"
      poster="/video/hero-poster.jpg"
      aria-hidden="true" tabIndex={-1}
    >
      <source src="/video/hero-journey.mp4" type="video/mp4" />
    </video>
  );
}
```

### 5.2 `ScrollDriver.tsx`

`scrollState.progress` must update even before the canvas mounts and even on the `static`/low tiers, because the video depends on it.

```tsx
"use client";
import { useImmersiveScroll } from "@/lib/immersive/useImmersiveScroll";
export default function ScrollDriver() { useImmersiveScroll(); return null; }
```
Remove the `useImmersiveScroll()` call from `ImmersiveRoot`. In `useImmersiveScroll`, skip creating Lenis when `prefers-reduced-motion` is set (still compute progress from native scroll).

### 5.3 Page skeleton

```tsx
// app/page.tsx (server component)
import ScrollDriver from "@/components/immersive/ScrollDriver";
import JourneyVideo from "@/components/immersive/JourneyVideo";
import ImmersiveLoader from "@/components/immersive/ImmersiveLoader";

export default function Page() {
  return (
    <>
      <JourneyVideo />
      <div id="video-scrim" className="pointer-events-none fixed inset-0 z-0" />
      <ScrollDriver />
      <ImmersiveLoader />   {/* petals canvas, z-1, mounts after idle */}

      <main className="relative z-10">
        <section id="hero"     className="min-h-screen">{/* existing hero */}</section>
        <section id="demo"     className="min-h-screen">{/* Runaway NO simulator */}</section>
        <section id="steps"    className="min-h-[160vh]">{/* 3-step journey */}</section>
        <section id="features" className="min-h-[140vh]">{/* features + birthdays teaser */}</section>
        <section id="pricing"  className="min-h-screen">{/* Free / Romantic / Premium */}</section>
        <section id="faq"      className="min-h-screen">{/* FAQ */}</section>
        <section id="cta"      className="min-h-screen">{/* final CTA */}</section>
      </main>
      {/* footer: solid dark background so it is always readable */}
    </>
  );
}
```
Keep the existing copy. If the hero is already a client component, adapt, do not rewrite its content. Remove the old `hero-space-voyage-preview-*.gif` (text is burnt into it).

### 5.4 `ImmersiveRoot.tsx` (simplified)

```tsx
"use client";
import { Canvas } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { useEffect, useState } from "react";
import { TIER_CONFIG, nextLowerTier, type Tier } from "@/lib/immersive/quality";
import { CameraRig } from "./CameraRig";
import { Petals } from "./Petals";

export default function ImmersiveRoot({ initialTier }: { initialTier: Tier }) {
  const [tier, setTier] = useState<Tier>(initialTier);
  const [visible, setVisible] = useState(true);
  const cfg = tier === "static" ? TIER_CONFIG.low : TIER_CONFIG[tier];
  const [dpr, setDpr] = useState(cfg.dprMax);

  useEffect(() => {
    const onVis = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);
  useEffect(() => { document.documentElement.dataset.immersive = tier; }, [tier]);

  if (tier === "static") return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[1]" aria-hidden="true">
      <Canvas
        frameloop={visible ? "always" : "never"}
        dpr={dpr}
        gl={{ antialias: false, alpha: true, stencil: false, powerPreference: "default" }}
        camera={{ fov: 55, near: 0.1, far: 60, position: [0, 0, 0] }}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      >
        <PerformanceMonitor
          flipflops={3}
          onDecline={() => setDpr((d) => Math.max(1, +(d - 0.25).toFixed(2)))}
          onIncline={() => setDpr((d) => Math.min(cfg.dprMax, +(d + 0.25).toFixed(2)))}
          onFallback={() => setTier((t) => nextLowerTier(t))}
        />
        <CameraRig />
        <Petals count={cfg.petals} />
      </Canvas>
    </div>
  );
}
```

### 5.5 `CameraRig.tsx` (pointer parallax only; the video already moves the "camera")

```tsx
"use client";
import { MathUtils } from "three";
import { useFrame } from "@react-three/fiber";
import { scrollState } from "@/lib/immersive/scrollState";

export function CameraRig() {
  useFrame(({ camera }, dt) => {
    camera.position.x = MathUtils.damp(camera.position.x, scrollState.pointer.x * 0.5, 4, dt);
    camera.position.y = MathUtils.damp(camera.position.y, scrollState.pointer.y * 0.3, 4, dt);
    camera.lookAt(0, 0, -10);
  });
  return null;
}
```

### 5.6 `Petals.tsx` edits (v1 §5.10)

1. **Constant opacity:** change `uniforms.uOpacity.value = 1 - MathUtils.smoothstep(...)` to `uniforms.uOpacity.value = 1`.
2. **Scroll reacts to petals:** add `uSpeed` uniform (default 1). In `useFrame`: `uniforms.uSpeed.value = 1 + Math.min(Math.abs(scrollState.velocity) * 0.15, 2.5)`. In the vertex shader accumulate time instead of multiplying: keep a JS-side `phase += dt * uSpeed.value` and send it as `uTime`. (This avoids petals jumping when speed changes.)
3. **Sizes for a daytime background:** `uSize` 260 → 200 and petal colours slightly more saturated (`vec3(1.0,0.70,0.80)` → `vec3(1.0,0.50,0.66)`) so they stay visible on the bright sky. Normal alpha blending only; never additive on this background.

### 5.7 CSS (add to global stylesheet)

```css
#video-scrim {
  background:
    linear-gradient(to bottom, rgba(5,10,30,.35) 0%, rgba(5,10,30,.15) 30%, rgba(5,10,30,.25) 70%, rgba(5,10,30,.55) 100%);
}
/* poster only for reduced-motion / saveData / no JS scrub */
html[data-immersive="static"] #journey-video { object-position: center; }

/* bright video → darker glass cards than v1 */
.glass { background: rgba(10,12,30,.45); border: 1px solid rgba(255,255,255,.2); border-radius: 1.25rem; }
html[data-immersive="high"] .glass, html[data-immersive="mid"] .glass { backdrop-filter: blur(10px); }

main h1, main h2, main h3, main p { color: #fff; text-shadow: 0 1px 14px rgba(0,0,0,.45); }
footer { background: #0b0720; position: relative; z-index: 10; }
```
Also reuse v1 §5.17 reduced-motion rule and v1 §5.18 `Reveal`.

---

## 6. Section behaviour notes

- Cards over the video must be `.glass`; headings need `text-shadow` (already in CSS above). Check contrast ≥ 4.5:1 on **every** card (the sky and fence areas are bright).
- Do not put full-width opaque blocks between sections: they hide the journey. Use spacing, not backgrounds.
- The footer is solid dark so the scene "ends" cleanly; the final video frame should be visible just above it (CTA section).
- Mobile: video is 1280x720 with `object-cover`, so the centre of the frame is what stays visible. Keep the path/village centre-weighted (it already is).

---

## 7. Phases

### Phase 0 — Recon (read-only)
Report Next/React/TS/Tailwind versions, alias, where each section lives, whether `framer-motion` exists, and the list of files you will create/change.

### Phase 1 — Assets + video layer (no three.js)
- Add assets from Section 3 (`public/video/...`). Remove the old GIF hero.
- Create `ScrollDriver`, `JourneyVideo`, `#video-scrim`, page skeleton, CSS (5.7). Install only `lenis` now.
- **Verify:** scrolling top → bottom moves the video from first to last frame; scrolling back up reverses it; refresh mid-page starts at the right frame; no ghost text; Lighthouse mobile LCP < 2.5 s; content readable with JS disabled.

### Phase 2 — Petals canvas
- Install `three @react-three/fiber @react-three/drei` (+ `@types/three` if TS). Match r3f/drei versions to React (v1 §0 rule 5).
- Add `quality.ts`, `ImmersiveLoader`, `ImmersiveRoot`, `CameraRig`, `Petals` (with 5.6 edits).
- **Verify:** petals visible on bright sky, speed up while scrolling fast, canvas never blocks clicks, draw calls ≤ 3, `?debug=1` overlay optional.

### Phase 3 — Tiers & fallbacks
- Wire `PerformanceMonitor`, static tier (poster only, no scrub), reduced-motion, saveData, hidden tab.
- **Verify:** 4x/6x CPU throttle lowers dpr then tier; static tier looks intentional.

### Phase 4 — Polish
- `Reveal` on headings/cards, contrast pass, keep Runaway-NO demo exactly as is (DOM-only).
- Optional: subtle scale `1.0 → 1.06` on `#journey-video` across the whole scroll (CSS transform from `scrollState.progress`, written in the same rAF loop) for extra depth.

### Phase 5 — Only if needed: frame-sequence fallback
- If scrubbing stutters on iOS Safari: add `JourneyCanvas` that draws `public/frames/f_%04d.webp` (100 frames) to a 2D canvas with the same `progress → frame index` mapping. Preload the first 10 frames immediately and the rest on idle. Use it **only** on iOS/low tier; keep `<video>` elsewhere.

### Phase 6 — QA & report
Run Section 8 and paste real numbers. Do not claim a pass without measuring.

---

## 8. Performance budget & QA

| Metric | Target |
|---|---|
| LCP (mobile, throttled 4G) | < 2.5 s (poster image, JPG ≤ 250 KB) |
| CLS | < 0.05 |
| Video | ≤ 3.5 MB, 1280x720, no audio, `-g 4` |
| 3D chunk (gzip) | ≤ ~200 KB (petals only); report if exceeded |
| Draw calls | ≤ 3 |
| FPS | ≥ 55 desktop; ≥ 30 low-end Android |
| JS heap | no steady growth during a 60 s scroll up/down loop |

Checklist:
- [ ] No ghost/double text anywhere.
- [ ] All links/buttons work; canvas and scrim never block clicks.
- [ ] Runaway-NO demo unchanged.
- [ ] Progress 0 at top, 1 at bottom; `/#pricing` deep links land on the right frame.
- [ ] Resize/orientation keeps sections aligned with video time.
- [ ] `prefers-reduced-motion`: poster only, no smooth scroll, text readable.
- [ ] Tab hidden: rAF loops stop; return resumes.
- [ ] Contrast ≥ 4.5:1 on all cards.
- [ ] View-source / reader mode shows all real text (SEO intact).
- [ ] Safari iOS: video scrubs after first touch (otherwise go to Phase 5).

---

## 9. Prompt to paste into Antigravity

```
Read /implementation-v2.md completely (implementation-v1.md is only referenced for
unchanged parts). Execute ONLY Phase 0 and show me the plan (Next/React/TS versions,
files you will create or change) before editing anything. After I approve, do one
phase at a time. After each phase: run `npm run build`, run the phase's verification,
report real numbers, and make a git commit ("phase N: ..."). Do not touch auth,
payments, API routes, or existing copy. If this file conflicts with the repo, stop
and ask. No new dependencies other than the ones listed in Phase 1 and Phase 2.
The video assets are already at public/video/hero-journey.mp4 and hero-poster.jpg.
```
