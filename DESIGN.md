# Semantic Design System: PRD Studio Standard
**Skill Context:** `stitch-taste-design` & `stitch-react-components`
**Target App:** PRD Generator & AI Spec Engineering Studio
**Stack:** Next.js 14 (App Router) + Tailwind CSS + TypeScript + Lucide Icons

---

## 1. Dial Configuration — App Persona

| Dial | Level | Implementation for PRD Generator |
|---|---|---|
| **Creativity** | `7` | Balanced engineering elegance. Clean typographic hierarchy with sharp tech aesthetics. Bold section anchors without gimmicks. |
| **Density** | `8` | **Cockpit Dense**: High information density suitable for enterprise product specifications, table matrices, and dual-pane editors. |
| **Variance** | `6` | Asymmetric 2-column or 3-column splits (Sidebar navigation, main canvas, inspector/chat panel). |
| **Motion Intent** | `6` | Fluid, spring physics on modal entries, tab switches, and hover states. Subtle perpetual pulse on active AI generation. |

---

## 2. Visual Theme & Atmosphere
The interface evokes a **high-precision software cockpit** — deep slate obsidian surfaces, razor-sharp 1px border lines, tactile controls, and laser-focused typography. It feels like an advanced IDE built for senior product managers and tech leads. The atmosphere is quiet, intelligent, and completely free of noisy clutter or cheap visual tricks.

---

## 3. Color Calibration & Palette Roles

### Dark Mode Base (Default)
- **Deep Canvas** (`#090D16`): Primary application background. Off-black with deep navy undertone.
- **Surface Elevation 1** (`#0F172A` / Slate-900): Sidebar, header bars, card containers.
- **Surface Elevation 2** (`#141F36`): Elevated modals, active dropdowns, preview blocks.
- **Surface Elevation 3** (`#1B2A4A`): Tooltips, highlighted code blocks, active selection states.
- **Whisper Border** (`rgba(255, 255, 255, 0.08)`): Standard structural dividers and card borders.
- **Active Border** (`rgba(255, 255, 255, 0.16)`): Focused inputs, hovered cards, active tab indicator.

### Typography Colors
- **Primary Ink** (`#F8FAFC` / Slate-50): Headlines, active values, button labels.
- **Secondary Ink** (`#94A3B8` / Slate-400): Body prose, PRD descriptions, field labels.
- **Muted Ink** (`#64748B` / Slate-500): Timestamps, breadcrumbs, shortcuts, inactive icons.

### Functional Accents
- **Primary Brand**: Indigo (`#6366F1` / `brand-500`) — Primary CTA, focus rings, active links.
- **Subtle Cyan**: Sky Accent (`#38BDF8`) — Active AI generation status, code highlighting, telemetry.
- **Status Tokens**:
  - **P0 / Critical / Success**: Emerald (`#10B981`)
  - **P1 / Warning / In-Progress**: Amber (`#F59E0B`)
  - **P2 / Minor / Deprecated**: Violet (`#8B5CF6`)
  - **Destructive / Error**: Rose (`#F43F5E`)

### Banned Colors
- ❌ No pure black (`#000000`) for surfaces — always `#090D16`.
- ❌ No generic "AI Purple" neon button glows (`box-shadow: 0 0 50px magenta`).
- ❌ No saturated rainbow badges on a single screen.

---

## 4. Typography Architecture

- **Primary Sans:** `Geist Sans` or `Outfit` — Track-tight (`letter-spacing: -0.02em`), crisp line heights (`1.4–1.5`).
- **Data & Monospace:** `Geist Mono` or `JetBrains Mono` — Mandatory for version tags, token counters, PRD section IDs (e.g. `REQ-001`), database field names, and code previews.
- **Prose Reading Constraint:** Maximum `72ch` column width in the PRD Viewer to ensure maximum readability during long document reviews.

### Type Scale (Rem-based)
- **Document H1:** `clamp(1.75rem, 3vw, 2.25rem)` (font-weight: 700, tracking-tight)
- **Section H2:** `1.375rem` (font-weight: 600, tracking-tight)
- **Subsection H3:** `1.125rem` (font-weight: 600)
- **Body Regular:** `0.9375rem` / `15px` (font-weight: 400, line-height: 1.6)
- **Caption / Meta:** `0.8125rem` / `13px` (font-weight: 500, monospace for numbers)

---

## 5. Component Anatomy & Behaviors

### 1. PRD Studio Canvas & Layout
- **Layout Structure:** Triple-pane or dual-pane responsive flex.
  - Left pane: Document outline / feature list (collapsible on smaller screens).
  - Center pane: Rich Markdown PRD viewer or prompt form.
  - Right pane / Drawer: AI Chatbot Assistant & Engine inspector.
- **Sticky Actions Header:** Compact sticky bar displaying document title, autosave indicator, export options (Markdown, PDF, JSON), and token usage.

### 2. Interactive Buttons & Inputs
- **Primary Button:** Indigo solid (`bg-brand-500 hover:bg-brand-600 text-white font-medium px-4 py-2 rounded-lg transition-all duration-150 active:scale-[0.98]`). No neon outer blur.
- **Ghost / Outline Button:** Border `border-white/10 hover:border-white/20 text-slate-300 hover:text-white hover:bg-white/[0.04] active:scale-[0.98]`.
- **Text Inputs & Textareas:** Dark surface fill (`bg-slate-900/60 border border-white/10 rounded-lg px-3.5 py-2.5 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500`).

### 3. Cards & Metadata Blocks
- **Border-driven Elevation:** Instead of heavy drop shadows, cards use `border border-white/[0.08] bg-slate-900/50 backdrop-blur-md rounded-xl p-5`.
- **Tag Pills:** Rounded-full badges with subtle background tint (`bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 text-xs font-mono`).

### 4. Loading States & Feedback
- **Skeleton Shimmer:** Never use generic circular spinners for page loads. Always use layout-matching skeletal shimmer rectangles (`bg-white/[0.05] animate-pulse rounded-md`).
- **AI Streaming Indicator:** Subtle cyan pulse dot (`w-2 h-2 rounded-full bg-sky-400 animate-ping`) next to "Generating section...".

---

## 6. Motion & Micro-Interactions
- **Transitions:** Standard spring-like ease: `transition-all duration-200 ease-out`.
- **Modals & Drawers:** Slide-in and fade: `opacity-0 translate-y-2 -> opacity-100 translate-y-0`.
- **Hardware Acceleration:** Only animate `transform` and `opacity`. Avoid animating layout properties (`width`, `height`, `margin`).

---

## 7. Anti-Patterns (Banned AI Slop)
1. ❌ **No emojis in production UI labels** (use Lucide SVG icons instead).
2. ❌ **No generic 3-equal-cards feature sections** — use asymmetric bento grids or functional list groups.
3. ❌ **No fake placeholder metrics** (e.g. "99.9% Faster PRDs", "500k Users") unless actual data exists.
4. ❌ **No text overlapping other elements** — clean spatial zoning at all times.
5. ❌ **No `h-screen`** — always use `min-h-[100dvh]` to prevent viewport jumps on mobile browsers.
6. ❌ **No circular spinners** — use skeletal layout placeholders.
