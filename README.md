# HTB Command Intelligence Platform

> A local/hosted web application for penetration testers — built by [0xmous7](https://github.com/0xmous27)

![License](https://img.shields.io/badge/license-MIT-00ff99?style=flat-square)
![Made for](https://img.shields.io/badge/made%20for-HTB%20CPTS-red?style=flat-square)
![Stack](https://img.shields.io/badge/stack-React%20%2B%20FastAPI-00ccff?style=flat-square)

---

## What is this?

A hacker-themed command intelligence platform that gives you instant access to:

- **172+ curated pentest techniques** with live variable injection (`{TARGET_IP}`, `{USERNAME}`, etc.)
- **GTFOBins / LOLBAS** reference (Linux + Windows privilege escalation binaries)
- **CVE quick reference** — top exploits with one-liner commands
- **Out-of-band techniques** — blind SQLi, XXE, SSRF, CMDi
- **Payload generator** — reverse shells + msfvenom for all platforms
- **Hash identifier** — paste hash → get hashcat mode instantly
- **Services reference** — 35 services with attack vectors and CVEs
- **Evasion techniques** — WAF bypass, AMSI bypass, obfuscation
- **CPTS exam guide** — strategy, checklists, tips
- **Credentials vault** — store found creds, inject into commands
- **Loot tracker** — track flags, hashes, files per host
- **Notes** — scratch pad with auto-save
- **Checklists** — methodology checklists for 5 engagement types
- **Mini games** — Hack Game (terminal missions) + Catch Me (escape login)

---

## Screenshots

> Matrix rain background · Neon hacker theme · CRT scanline effect

---

## Quick Start (Local)

### Frontend only (no backend needed)
```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

### Full stack (with PDF pipeline)
```bash
# Backend
cd backend
pip install fastapi uvicorn pymupdf pytesseract pillow
python3 build_data.py        # process PDFs (optional)
uvicorn main:app --port 8000 --reload

# Frontend
cd frontend
npm install
npm run dev
```

---

[click-Test](https://htb-intel.vercel.app)

The app works fully static — no backend required for hosting.

---

## Adding Techniques

Edit `backend/data/output.json` directly, or add a new part file and run:

```bash
cd backend
python3 merge_data.py
cp data/output.json ../frontend/src/data/techniques.json
```

---

## Contributing

Pull requests welcome. To add techniques:

1. Edit or add a JSON file in `backend/data/`
2. Follow the technique format:
```json
{
  "id": "unique_id",
  "name": "Technique Name",
  "purpose": "What it does",
  "when_to_use": "When to use it",
  "command": "command --flag {TARGET_IP}",
  "tags": ["tag1", "tag2"]
}
```
3. Run `merge_data.py` and copy output to frontend
4. Submit PR

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React + Vite + TailwindCSS |
| Backend | Python + FastAPI |
| PDF Processing | PyMuPDF + Tesseract OCR |
| Hosting | Vercel (frontend) |
| Storage | localStorage (notes, creds, loot) |

---

## License

MIT — free to use, modify, and distribute. See [LICENSE](LICENSE).

---

> *"Root is not the goal. Understanding is."* — 0xmous7
