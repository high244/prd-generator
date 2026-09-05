# Agent Operational Rules & Design Directives
**Scope:** Workspace-wide rules for Antigravity, Claude Code, Cursor, and Gemini CLI.

---

## 1. Mandatory Frontend UI Directives (Anti-Ngawang Protocol)

Whenever you are asked to generate, modify, or refactor any frontend UI, React components, or styles in this project:

1. **Activate Skills First**:
   - You MUST consult and activate [stitch-taste-design](file:///c:/Result/Project/prd-generator/.agents/skills/stitch-taste-design/SKILL.md) and [stitch-react-components](file:///c:/Result/Project/prd-generator/.agents/skills/stitch-react-components/SKILL.md).
   - Use [stitch-enhance-prompt](file:///c:/Result/Project/prd-generator/.agents/skills/stitch-enhance-prompt/SKILL.md) to expand user requests into structured, token-calibrated specifications.

2. **Ground Truth: Read `DESIGN.md`**:
   - You MUST read and strictly adhere to [DESIGN.md](file:///c:/Result/Project/prd-generator/DESIGN.md) located at the root of the workspace.
   - All colors must use configured tokens (e.g. `bg-[#090D16]`, `border-white/10`, `bg-brand-500`, `text-slate-100`). Do NOT invent random arbitrary hex values or pastel AI cliches.

3. **Reference Golden Exemplar**:
   - Follow the structure, TypeScript interfaces, and accessibility patterns established in:
     [gold-standard-prd-feature-card.tsx](file:///c:/Result/Project/prd-generator/.agents/skills/stitch-react-components/examples/gold-standard-prd-feature-card.tsx).

4. **Automated Quality Gate**:
   - After creating or significantly modifying a React component, you SHOULD verify it using the AST validator:
     ```bash
     node .agents/skills/stitch-react-components/scripts/validate.js <path-to-component>
     ```

---

## 2. Hard Anti-Patterns (Strictly Prohibited)

- ❌ **NO Emojis** in production UI buttons, navigation labels, or headers (use Lucide SVG icons).
- ❌ **NO Generic Circular Spinners** for data loading (always use skeletal shimmers).
- ❌ **NO AI Purple / Neon Glows** (`box-shadow: 0 0 50px magenta/purple`).
- ❌ **NO Generic 3-Equal-Card Hero Sections**.
- ❌ **NO Fabricated Metrics** (e.g., fake "99.9% uptime" or "500k users" unless real).
- ❌ **NO `h-screen`** — use `min-h-[100dvh]` to avoid mobile viewport jump bugs.
