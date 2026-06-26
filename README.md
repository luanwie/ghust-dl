# 🎧 GHUST-DL

Download de música em alta qualidade para DJs.
MP3 320kbps e FLAC via rede Soulseek, com cache inteligente.

## Stack

- **Frontend:** React + Vite + Tailwind (Vercel)
- **Backend:** FastAPI + Python
- **Download engine:** slskd (Soulseek headless)
- **Cache:** Disco local com hits progressivos

## Deploy

```bash
# Backend + slskd
docker compose up -d

# Frontend
cd frontend && npm install && npm run dev
```
