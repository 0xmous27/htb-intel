# HTB Intel Platform

> A hacker-themed pentest intelligence platform — built by [0xmous27](https://github.com/0xmous27)

[![Live](https://img.shields.io/badge/live-htb--intel.vercel.app-00ff99?style=flat-square)](https://htb-intel.vercel.app)
![License](https://img.shields.io/badge/license-MIT-00ff99?style=flat-square)
![Stack](https://img.shields.io/badge/stack-React%20%2B%20Vite%20%2B%20Supabase-00ccff?style=flat-square)
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
| 🔧 TOOLS | Common pentest tools with install + usage commands |
| 🌐 SERVICES | 35+ services with attack vectors, CVEs, and enum commands |
| 📡 OOB | Out-of-band payloads — blind SQLi, XXE, SSRF, CMDi |
| ⌥ REGEX | grep / sed / awk / python regex reference |
| 💉 PAYLOADS | Reverse shells + msfvenom for all platforms |
| 🔐 HASH ID | Paste hash → get hashcat mode instantly |
| 🔌 PORTS | Port reference with attack vectors |
| 📦 WORDLISTS | SecLists reference with paths |
| 🐚 GTFOBins | Linux/Windows privilege escalation binaries |
| 💀 CVEs | Top CVEs with one-liner exploits + MSF modules |
| 🎯 LOOT | Track flags, hashes, files per host |
| 🔑 CREDS | Credentials vault with command injection |
| 📋 CHECKLIST | Methodology checklists for 7 engagement types |
| 📝 NOTES | Auto-saving scratch pad |
| 🎓 CPTS | CPTS exam guide — strategy, tips, checklists |
| ⚒ TEMPLATE FORGE | Nuclei template builder + GF pattern builder |
| 🃏 TRICKS | HackTricks / coffinxp / LostSec / tomnomnom tricks |
| 🐛 BUG BOUNTY | 200+ real paid bug bounty reports ($800–$35,000) |
| 🎮 HACK GAME | Terminal hacking mini-game |

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite + Tailwind |
| Database | Supabase (PostgreSQL) |
| Hosting | Vercel |
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
VITE_SUPABASE_KEY=your-anon-key
VITE_ADMIN_PASSWORD=your-admin-password
VITE_SECURITY_ANSWER=your-security-answer
```

---

## Admin Panel

Hidden at `/admin` — 3-step login (password → security question → Supabase service role key).  
Full CRUD for all 12 content types. Changes reflect live across all tabs.

---

## License

MIT — free to use, modify, and distribute. See [LICENSE](LICENSE).

---

> *"Root is not the goal. Understanding is."* — 0xmous27
