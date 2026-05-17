# HTB Intel Platform

> A hacker-themed pentest intelligence platform — built by [0xmous27](https://github.com/0xmous27)

[![Live](https://img.shields.io/badge/live-htb--intel.vercel.app-00ff99?style=flat-square)](https://htb-intel.vercel.app)
![License](https://img.shields.io/badge/license-MIT-00ff99?style=flat-square)
![Stack](https://img.shields.io/badge/stack-React%20%2B%20TypeScript%20%2B%20Vite%20%2B%20Supabase-00ccff?style=flat-square)
![Made for](https://img.shields.io/badge/made%20for-HTB%20%2F%20CPTS%20%2F%20Bug%20Bounty-red?style=flat-square)

---

## What is this?

A cyberpunk-themed web platform giving instant access to pentest references, tools, and techniques — all in one place. Built for HTB, CPTS, and bug bounty hunters.

**Live at → [htb-intel.vercel.app](https://htb-intel.vercel.app)**

---

## Features

| Tab | Description |
|---|---|
| ⚡ TECHNIQUES | 172+ curated attack techniques with live `{TARGET_IP}` injection |
| 🌐 SERVICES | 35+ services with attack vectors, CVEs, and enum commands |
| 🔌 PORTS | Port reference with attack vectors |
| 🔧 TOOLS | Common pentest tools with install + usage commands |
| 💉 PAYLOADS | Reverse shells, bind shells, web shells, encrypted shells + msfvenom |
| 📡 BLIND / OOB | Out-of-band payloads — blind SQLi, XXE, SSRF, CMDi |
| 💀 CVEs | Top CVEs with one-liner exploits + MSF modules |
| 🏢 AD | Active Directory attack path — enum to Domain Admin |
| 🔐 HASH ID | Paste hash → get hashcat mode instantly |
| 📦 WORDLISTS | SecLists reference with paths + "which wordlist for what" guide |
| 🐚 GTFO | Linux/Windows privilege escalation binaries |
| ⚡ QUICK REF | One-liner cheat sheet — shells, transfers, enum, API testing |
| 🔍 REGEX | grep / sed / awk / python regex reference |
| 🎯 LOOT | Track flags, hashes, files per host |
| 🔑 CREDS | Credentials vault with command injection |
| 📋 CHECKLIST | Methodology checklists for 5 engagement types |
| 📝 NOTES | Auto-saving scratch pad |
| 🃏 TRICKS | HackTricks / coffinxp / LostSec / tomnomnom tricks |
| 🐛 BUG BOUNTY | 200+ real paid bug bounty reports + methodology |
| ⚒ FORGE | Nuclei template builder + GF pattern builder |
| 🎓 CPTS | CPTS exam guide — strategy, tips, checklists |
| 🎮 HACK GAME | Terminal hacking mini-game |

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + TypeScript + Vite + Tailwind |
| Database | Supabase (PostgreSQL) |
| Hosting | Vercel (auto-deploy on push) |
| CI | GitHub Actions (test + build) |
| Storage | localStorage (notes, creds, loot) |

---

## Run Locally

```bash
git clone https://github.com/0xmous27/htb-intel
cd htb-intel/frontend
cp .env.example .env   # fill in your Supabase keys
npm install
npm run dev
# → http://localhost:5173
```

### Environment Variables

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_KEY=your-public-anon-key
```

### Scripts

```bash
npm run dev        # Start dev server
npm run build      # Production build
npm test           # Run tests (Vitest)
npm run typecheck  # TypeScript check
```

---

## Admin Panel

Hidden at `/admin` — single-step login with Supabase service role key.
Full CRUD for all 14 content tables. Changes reflect live across all tabs.

---

## Architecture

```
Supabase DB (14 tables, RLS hardened)
    ↓
useSupabaseData hook (60s cache, 5s timeout)
    ↓
Components: static rich data + Supabase new entries
    ↓
22 tabs in 11×2 grid layout
```

- **Code-split:** Each tab lazy-loaded (initial bundle: 170KB)
- **Data pattern:** Static data = rich base. Supabase adds new entries via admin.
- **Security:** Anon key = read-only. Service role key = admin writes (never in bundle).

---

## License

MIT — free to use, modify, and distribute. See [LICENSE](LICENSE).

---

> *"Root is not the goal. Understanding is."* — 0xmous27
