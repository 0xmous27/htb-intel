# HTB INTEL — PROJECT SESSION FILE
# Last updated: 2026-05-10
# Purpose: Drop this context at the start of any new session to continue without re-explaining the project.

---

## PROJECT IDENTITY

- **Name:** HTB Intel Platform
- **Repo:** https://github.com/0xmous27/htb-intel
- **Live:** https://htb-intel.vercel.app/
- **Stack:** React 18 + Vite + Tailwind (utility classes minimal, mostly inline styles) + JetBrains Mono font
- **Theme:** Cyberpunk/hacker dark terminal aesthetic. CSS vars: `--neon`, `--neon-dim`, `--red`, `--bg`, `--panel`, `--border`
- **Deploy:** Vercel auto-deploys on every push to `main`. Just `git push` and it's live.
- **Git creds:** Already configured in working directory. Push with `git add -A && git commit -m "..." && git push`

---

## PROJECT STRUCTURE

```
/home/oxmous/htb-intel/
├── frontend/                        ← Vite React app (the only thing deployed)
│   ├── src/
│   │   ├── main.jsx                 ← Entry: PillChoice → App, applies CSS vars, localStorage
│   │   ├── App.jsx                  ← Tab router, all 20 tabs wired here
│   │   ├── index.css                ← All global styles, CSS vars, animations
│   │   ├── hooks/
│   │   │   ├── ThemeContext.js      ← useNeon() hook → returns current --neon color string
│   │   │   ├── TargetContext.jsx    ← useTargetCtx() → {ip, domain, inject(cmd)}
│   │   │   └── useTarget.js
│   │   ├── components/
│   │   │   ├── PillChoice.jsx       ← Onboarding: pick pill color → enter name → saves to localStorage
│   │   │   ├── Sidebar.jsx          ← Left nav, category filter, search
│   │   │   ├── TargetBar.jsx        ← IP/domain/port inputs at top
│   │   │   ├── TechniqueCard.jsx    ← Expandable attack technique card
│   │   │   ├── MatrixRain.jsx       ← Canvas matrix rain (reads --neon CSS var)
│   │   │   ├── CrashText.jsx        ← Lightning strike animation on operator name
│   │   │   ├── Footer.jsx           ← Quote, clock, visitor count, welcome back msg
│   │   │   ├── ToolsView.jsx        ← Tools tab
│   │   │   ├── ServicesView.jsx     ← Services tab
│   │   │   ├── OOBView.jsx          ← OOB/interactsh tab
│   │   │   ├── RegexView.jsx        ← Regex reference tab
│   │   │   ├── PayloadGen.jsx       ← Payload generator tab
│   │   │   ├── HashID.jsx           ← Hash identifier tab
│   │   │   ├── PortRef.jsx          ← Port reference tab
│   │   │   ├── WordlistsRef.jsx     ← Wordlists reference tab
│   │   │   ├── GTFOBins.jsx         ← GTFOBins reference tab
│   │   │   ├── CVERef.jsx           ← CVE reference tab
│   │   │   ├── LootTracker.jsx      ← Loot tracker (localStorage)
│   │   │   ├── CredsVault.jsx       ← Credentials vault (localStorage)
│   │   │   ├── ChecklistTab.jsx     ← Pentest checklist (localStorage)
│   │   │   ├── NotesTab.jsx         ← Free-text notes (localStorage, autosave)
│   │   │   ├── CPTSGuide.jsx        ← CPTS exam guide
│   │   │   ├── HackGame.jsx         ← Hacking mini-game
│   │   │   ├── RunnerGame.jsx       ← Runner mini-game
│   │   │   ├── EscapeLogin.jsx      ← Login escape mini-game
│   │   │   ├── TemplateForge.jsx    ← ⚒ TEMPLATE FORGE (main component)
│   │   │   └── forge/
│   │   │       ├── yamlGen.js       ← YAML/GF generator, validator, defaultState/defaultRequest/defaultMatcher/defaultExtractor
│   │   │       ├── ForgeComponents.jsx ← Label (with hint tooltip), Inp, Sel, Btn, Section, RegexPanel, MatcherBuilder, ExtractorBuilder
│   │   │       └── RequestBuilder.jsx  ← Full HTTP request builder sub-component
│   │   └── data/
│   │       ├── techniques.json      ← Attack techniques data (loaded at runtime, fallback static)
│   │       ├── forgeData.js         ← SEVERITIES, METHODS, MATCHER_TYPES, EXTRACTOR_TYPES, PARTS, ATTACK_MODES, COMMON_TAGS, STARTER_TEMPLATES (10), REGEX_LIBRARY (30+ patterns), GF_STARTERS
│   │       ├── tricksData.js        ← Tricks data (HackTricks, coffinxp, LostSec, tomnomnom)
│   │       ├── bugbountyData.js     ← Loader: imports all bb/*.json files, exports BB_REPORTS + BB_CATEGORIES
│   │       ├── bb/                  ← Bug bounty reports split by category (200+ reports)
│   │       │   ├── idor.json        ← 15 IDOR reports
│   │       │   ├── xss.json         ← 15 XSS reports
│   │       │   ├── ssrf.json        ← 12 SSRF reports
│   │       │   ├── rce.json         ← 12 RCE reports
│   │       │   ├── sqli.json        ← 10 SQLi reports
│   │       │   ├── auth.json        ← 12 Auth Bypass reports
│   │       │   ├── logic.json       ← 10 Business Logic reports
│   │       │   ├── upload.json      ← 10 File Upload reports
│   │       │   ├── cors.json        ← 6 CORS reports
│   │       │   ├── csrf.json        ← 6 CSRF reports
│   │       │   ├── redirect.json    ← 5 Open Redirect reports
│   │       │   ├── info.json        ← 8 Info Disclosure reports
│   │       │   ├── xxe.json         ← 5 XXE reports
│   │       │   └── privesc.json     ← 5 Privilege Escalation reports
│   │       ├── cves.js              ← CVE data
│   │       ├── gtfo.js              ← GTFOBins data
│   │       ├── checklists.js        ← Checklist data
│   │       ├── oob.js               ← OOB payloads
│   │       ├── regex.js             ← Regex reference data
│   │       ├── services.js          ← Services data
│   │       └── tools.js             ← Tools data
│   ├── package.json                 ← deps: react, react-dom, framer-motion, lucide-react, tailwindcss, vite
│   └── .vercel/project.json         ← Vercel project config
└── backend/                         ← Python PDF parser (NOT deployed, local only)
```

---

## ALL TABS (App.jsx TABS array)

| id | label | component |
|---|---|---|
| techniques | ⚡ TECHNIQUES | TechniqueCard list |
| tools | 🔧 TOOLS | ToolsView |
| services | 🌐 SERVICES | ServicesView |
| oob | 📡 OOB | OOBView |
| regex | ⌥ REGEX | RegexView |
| payload | 💉 PAYLOADS | PayloadGen |
| hash | 🔐 HASH ID | HashID |
| ports | 🔌 PORTS | PortRef |
| wordlists | 📦 WORDLISTS | WordlistsRef |
| gtfo | 🐚 GTFOBins | GTFOBins |
| cve | 💀 CVEs | CVERef |
| loot | 🎯 LOOT | LootTracker |
| creds | 🔑 CREDS | CredsVault |
| checklist | 📋 CHECKLIST | ChecklistTab |
| notes | 📝 NOTES | NotesTab |
| cpts | 🎓 CPTS | CPTSGuide |
| forge | ⚒ TEMPLATE FORGE | TemplateForge |
| tricks | 🃏 TRICKS | TricksTab |
| bugbounty | 🐛 BUG BOUNTY | BugBountyTab |
| game | 🎮 HACK GAME | HackGame |
| runner | 😂 CATCH ME | RunnerGame (EscapeLogin) |

---

## THEME SYSTEM

- **Pill colors** (set in `main.jsx` → `PILLS_VARS`):
  - `blue` → `--neon: #0088ff`, `--neon-dim: #0055cc`, `--red: #0044aa`
  - `red`  → `--neon: #ff3300`, `--neon-dim: #cc2200`, `--red: #ff0000`
  - `green` → `--neon: #00ff99`, `--neon-dim: #00cc77`, `--red: #ff3333`
- Applied via `document.documentElement.style.setProperty(k, v)`
- Persisted in `localStorage` keys: `htb-pill`, `htb-pill-vars`, `htb-intel-name`
- **Rule:** Never hardcode `#00ff99` or `#00cc77` in components. Always use `var(--neon)` / `var(--neon-dim)` in inline styles, or `useNeon()` when you need the JS string value.
- **Exception:** Games (HackGame, RunnerGame, EscapeLogin) use hardcoded green — intentional game UI.

---

## TEMPLATE FORGE — FULL FEATURE MAP

**Left sidebar:** mode toggle (NUCLEI/GF), NEW TEMPLATE, IMPORT YAML, ⚡ CURL→NUCLEI converter, starter templates list (10), validation errors / ✓ valid

**Center tabs:**
- 🔧 BUILDER — metadata form + request builder(s)
- 📄 YAML PREVIEW — live generated nuclei YAML or GF JSON
- 🧪 SANDBOX — paste HTTP response, test matchers/extractors against it
- 🔍 GF BUILDER — dedicated GF JSON builder with ⚡ regex library on each pattern row
- 📖 HOW TO USE — 10 step-by-step vuln guides (SQLi, XSS, SSRF, Redirect, Git, CORS, Secrets, Debug, JWT, GF)

**Right panel:** ⚡ Regex Intelligence Panel (collapsible) — 30+ patterns across 8 categories, click-to-insert into any regex/extractor field

**Forge features:**
- Real-time YAML generation (debounced 300ms)
- Real-time validation (missing ID, empty matchers, invalid regex, missing paths)
- localStorage autosave (`forge-state` key) — survives page refresh
- `● SAVED` indicator
- Curl → Nuclei converter (parses method, URL→path, headers, body)
- Export `.yaml` / `.json`
- Copy to clipboard
- All field labels have `?` hint tooltips with plain-English explanations

**Matcher types:** word, regex, status, dsl, binary, xpath, size
**Extractor types:** regex (with group), json, xpath, kval, dsl
**Starter templates (10):** XSS Reflected, SQLi Error, SSRF OOB, Open Redirect, Git Exposure, CORS Misconfig, Debug Endpoints, JWT None Alg, Backup Files, Secrets in JS

---

## CODING CONVENTIONS

- Inline styles everywhere (no Tailwind classes in components, only in index.css globals)
- CSS vars for theme: `var(--neon)`, `var(--neon-dim)`, `var(--red)`, `var(--bg)`, `var(--panel)`, `var(--border)`
- `useNeon()` when you need the neon color as a JS string (e.g. for template literals in inline styles)
- `getComputedStyle(document.documentElement).getPropertyValue('--neon')` in canvas/animation code
- localStorage keys in use: `htb-pill`, `htb-pill-vars`, `htb-intel-name`, `htb_notes`, `forge-state`, `htb_creds`, `htb_loot`, `htb_checklist`
- No external UI libraries (no shadcn, no MUI). Pure React + inline styles.
- No TypeScript. Plain JSX.
- Build: `cd frontend && npm run build` — must pass before pushing
- Push: `git add -A && git commit -m "..." && git push` from `/home/oxmous/htb-intel`

---

## KNOWN ISSUES / NOT YET DONE

- [ ] Multi-request chaining in forge (flow: extract value from req1 → use in req2)
- [ ] CVE tab "Build Template" button → pre-fills forge with CVE data
- [ ] Response diff view in sandbox (before/after payload comparison)
- [ ] Nuclei output parser tab (paste `-json` output → clean findings table)
- [ ] Template history list (multiple saved templates, not just last one)
- [ ] Wordlist/payload manager (store custom lists, reference as `{{payloads.name}}`)
- [ ] Nuclei command generator (shows exact CLI command to run the template)
- [ ] Games still use hardcoded `#00ff99` — low priority, intentional game aesthetic
- [ ] `nuclei` engine version is v3.5.1 (outdated), templates are v10.4.3

---

## COMPLETED THIS SESSION (2026-05-09)

- [x] **GF mode builder isolation** — clicking GF now shows only the GF pattern interface (pattern name + GFBuilder). Nuclei metadata (ID, author, name, severity, tags, etc.) is fully hidden in GF mode. Previously the Nuclei metadata was leaking into GF mode.
- [x] **GF validation fix** — `validateTemplate()` in `yamlGen.js` now runs GF-specific checks only (pattern name + regex validity) when in GF mode. No more irrelevant "Template name is required" / "Author is required" errors showing in the sidebar while in GF mode.
- [x] **GF starter auto-fills pattern name** — clicking a GF starter from the left sidebar now automatically sets `meta.id` (the PATTERN NAME / export filename) to the starter's name (e.g. clicking `sqli` sets the filename to `sqli`). Previously the field stayed blank.

---

## COMPLETED THIS SESSION (2026-05-10)

- [x] **Bug Bounty tab added** — new `🐛 BUG BOUNTY` tab (id: `bugbounty`) wired in App.jsx after TRICKS
- [x] **200+ reports across 14 categories** — all paid bounties ($800–$35,000), no informational reports
- [x] **Split data architecture** — reports split into `src/data/bb/*.json` files by category, loaded via `bugbountyData.js` barrel
- [x] **BugBountyTab.jsx** — expandable cards with severity badge, bounty amount, platform/program, description, step-by-step, copyable payload, tags. Filter by category + severity + search.
- [x] **Admin Panel** — hidden at `/admin` (not in tab bar). 3-step login (password → security question → service role key). Full CRUD (add/edit/delete with confirm modal) for 12 content types: bb_reports, techniques, cves, tools, tricks, wordlists, services, oob_payloads, regex_ref, ports, checklists, gtfobins. Stats dashboard, search, toast notifications. Credentials stored in `.env` (not committed).
- [x] **Supabase integration** — client at `src/lib/supabase.js`. Schema SQL at `supabase_schema.sql` (run in Supabase SQL editor to create tables). Tables: bb_reports, techniques, cves, tools, tricks, wordlists.
- [x] **vercel.json** — SPA rewrite added so `/admin` route works on Vercel.

---

## HOW TO ADD A NEW TAB

1. Create `frontend/src/components/MyTab.jsx`
2. Import it in `App.jsx`
3. Add `{ id: 'mytab', label: '🔥 MY TAB' }` to the `TABS` array in `App.jsx`
4. Add `{tab === 'mytab' && <MyTab />}` in the render block
5. Build + push

## HOW TO ADD DATA TO FORGE

- Starter templates → `src/data/forgeData.js` → `STARTER_TEMPLATES` array
- Regex library patterns → `src/data/forgeData.js` → `REGEX_LIBRARY` object (keyed by category)
- GF starters → `src/data/forgeData.js` → `GF_STARTERS` array
- YAML generation logic → `src/components/forge/yamlGen.js`
