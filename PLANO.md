# GHUST-DL — Plano de Implementação

Site de download de música para DJs em alta qualidade.
Modelo: doação (Pix) · Cache em disco · Backend Soulseek (slskd)

---

## Arquitetura

```
┌─────────────────────┐       ┌──────────────────────────────────┐
│   Vercel (Frontend) │       │   PC / VPS (Backend + Cache)     │
│                     │       │                                  │
│   React + Vite      │◄─────►│   FastAPI (port 8000)           │
│   Tailwind          │  API  │        │                         │
│   Domínio .com.br   │       │        ▼                         │
│                     │       │   slskd API (port 5030)          │
│                     │       │        │                         │
│                     │       │        ▼                         │
│                     │       │   Rede Soulseek (P2P)            │
│                     │       │                                  │
│                     │       │   /cache/ ─── arquivos baixados  │
└─────────────────────┘       └──────────────────────────────────┘
```

---

## Fases

### FASE 0 — Setup da máquina do Luan (⬅️ você faz em casa)

**Passo 0.1 — Instalar Docker Desktop**
- Download: https://www.docker.com/products/docker-desktop/
- Instalar, reiniciar PC

**Passo 0.2 — Rodar slskd com Docker**
```bash
docker run -d ^
  --name slskd ^
  -p 5030:5030 ^
  -v C:/ghust-dl/slskd:/app/config ^
  -v C:/ghust-dl/cache:/app/downloads ^
  slskd/slskd:latest
```
- Acessar http://localhost:5030
- Criar usuário/senha na interface web
- Configurar nome de usuário Soulseek (pode criar um anônimo)

**Passo 0.3 — Testar se slskd funciona**
```bash
curl http://localhost:5030/api/search?q=Phonk
```

---

### FASE 1 — Scaffold do projeto (⬅️ eu faço agora, remoto)

**O que vou entregar no GitHub:**
```
ghust-dl/
├── backend/
│   ├── main.py              # FastAPI endpoints
│   ├── slskd_client.py      # Wrapper da API do slskd
│   ├── cache_manager.py     # Gerenciamento de cache + fila
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── pages/
│   │   │   ├── SearchPage.tsx
│   │   │   ├── QueuePage.tsx
│   │   │   └── DonatePage.tsx
│   │   ├── components/
│   │   │   ├── SearchBar.tsx
│   │   │   ├── ResultCard.tsx
│   │   │   ├── QueueStatus.tsx
│   │   │   └── PixDonation.tsx
│   │   └── lib/
│   │       └── api.ts
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml       # slskd + backend juntos
└── PLANO.md
```

---

### FASE 2 — Backend (⬅️ eu faço agora)

**Endpoints da API:**
| Rota | Função |
|------|--------|
| `GET /api/search?q=artista+música` | Busca no Soulseek pela query |
| `POST /api/download` | Inicia download de um resultado |
| `GET /api/queue/{id}` | Status do download na fila |
| `GET /api/cache/{filename}` | Servir arquivo baixado |
| `GET /api/status` | Health check do sistema (cache hits, fila, etc) |

**Fluxo de download com cache:**
```
1. Usuário busca → slskd retorna resultados do Soulseek
2. Usuário clica em "Baixar"
3. Backend verifica: já está no cache? 
   ├─ SIM → serve instantâneo
   └─ NÃO → enfileira no slskd, espera completar, salva no cache, serve
```

---

### FASE 3 — Frontend (⬅️ eu faço agora)

**Telas:**
1. **Home / Busca** — input gigante, sugestões, resultados em grid
2. **Fila** — status dos downloads em andamento (progresso ou "completo")
3. **Sobre + Doação** — Pix QR Code, explicação do projeto

**Tech:**
- React + Vite + Tailwind v4
- Design escuro (seu padrão GHUST: dark, gold #eba61c, glass)
- Deploy automático na Vercel pelo GitHub

---

### FASE 4 — Conexão remoto/local (⬅️ passo a passo)

**Passo 4.1 — No seu PC, rodar backend local**
```bash
cd ghust-dl/backend
pip install -r requirements.txt
python main.py
# API em http://localhost:8000
```

**Passo 4.2 — Expor pro mundo (teste)**
```bash
# Opção mais simples: Cloudflare Tunnel (grátis)
cloudflared tunnel --url http://localhost:8000
# Gera URL tipo: https://random.trycloudflare.com
```

**Passo 4.3 — Configurar frontend**
- Colocar a URL do tunnel no `.env`
- `npm run dev` → testar busca + download completos
- Validar qualidade do FLAC baixado

---

### FASE 5 — VPS (⬅️ após aprovação)

**Passo 5.1 — Contratar VPS**
- Hetzner CX22 (~R$32/mês) ou Contabo (~R$38/mês)
- EUA ou Alemanha (Soulseek funciona de qualquer lugar)
- Ubuntu 24.04 LTS

**Passo 5.2 — Deploy**
```bash
# Via docker-compose (já incluso no projeto)
docker compose up -d
# Backend na porta 8000, slskd na 5030
```

**Passo 5.3 — Proxy reverso + SSL**
- Nginx ou Caddy na porta 80/443
- Domínio: `dl.ghust.com.br` (ou o que escolher)

**Passo 5.4 — Domínio + Vercel**
- Frontend na Vercel apontando pro domínio principal
- Backend no VPS em `api.dl.ghust.com.br`
- Variável de ambiente no Vercel: `VITE_API_URL=https://api.dl.ghust.com.br`

---

### FASE 6 — Pix / Doação

**Opções:**
1. **Simplista:** QR Code estático da sua chave Pix + botão "Copiar chave"
2. **Mercado Pago:** API de cobrança (gera QR dinâmico a cada doação)
3. **Asaas:** Similar ao Mercado Pago, taxas menores

**Recomendação MVP:** QR Code estático. Se começar a gerar receita significativa, migra pro Mercado Pago.

---

### FASE 7 — Aquecimento do cache (⬅️ você faz)

Antes de abrir ao público:
```bash
# Script que baixa suas playlists de DJ pro cache
python scripts/warm_cache.py --playlist-url="..."
```
- Suas tracks pessoais baixadas em FLAC/320 pré-carregadas
- Usuário inicial já encontra hits populares instantâneos

---

## Timeline resumida

| Fase | O que | Quem faz | Previsão |
|------|-------|----------|----------|
| 0 | Instalar Docker + slskd | **Luan** (em casa) | 30min |
| 1 | Scaffold do projeto | **Hermes** (agora) | - |
| 2 | Backend completo | **Hermes** (agora) | - |
| 3 | Frontend completo | **Hermes** (agora) | - |
| 4 | Teste integrado local + tunnel | **Luan** (em casa) | 1h |
| 5 | Contratar VPS + deploy | **Luan** (após validar) | 2h |
| 6 | Aquecer cache | **Luan** | 2h |
| 7 | ✨ **GO LIVE** | - | - |

---

## Custos

| Item | Recorrente | Setup |
|-----|-----------|-------|
| Domínio `.com.br` | ~R$4/mês | ~R$50/ano |
| VPS (Hetzner CX22) | ~R$32/mês | R$0 |
| Docker Desktop | Grátis | Grátis |
| slskd | Grátis | Grátis |
| Vercel (Hobby) | Grátis | Grátis |
| Cloudflare Tunnel (teste) | Grátis | Grátis |
| **Total** | **~R$36/mês** | **~R$50** |

---

## O que eu entrego AGORA (remoto)

- [ ] Repositório GitHub `ghust-dl` com código completo
- [ ] Backend FastAPI + slskd_client + cache_manager
- [ ] Frontend React + Tailwind + todas as telas
- [ ] docker-compose.yml (slskd + backend juntos)
- [ ] .env de exemplo
- [ ] Script de warm cache pro cache inicial

## O que você faz QUANDO CHEGAR EM CASA

- [ ] Instalar Docker Desktop
- [ ] Rodar `docker run` do slskd
- [ ] Configurar usuário Soulseek no slskd
- [ ] Rodar backend + frontend local
- [ ] Testar um download completo
- [ ] Tunnel Cloudflare pra testar de fora
- [ ] Contratar VPS e fazer deploy final
