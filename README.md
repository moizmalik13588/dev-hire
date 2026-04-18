# DevHire 🚀

> AI-Powered Job Board Platform built for the modern tech hiring ecosystem in Pakistan.

![Node.js](https://img.shields.io/badge/Node.js-20.x-green?style=flat-square&logo=node.js)
![React](https://img.shields.io/badge/React-18.x-blue?style=flat-square&logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue?style=flat-square&logo=postgresql)
![Redis](https://img.shields.io/badge/Redis-7.x-red?style=flat-square&logo=redis)
![Docker](https://img.shields.io/badge/Docker-Compose-blue?style=flat-square&logo=docker)
![Groq](https://img.shields.io/badge/AI-Groq%20llama--3.3-orange?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

**Live Demo:** [dev-hire-beta.vercel.app](https://dev-hire-beta.vercel.app)

---

## 📌 Overview

DevHire is a production-grade full-stack job board platform that connects developers with top Pakistani tech companies — Arbisoft, 10Pearls, and Nextbridge. It features AI-powered resume screening, smart skill-based candidate matching, real-time notifications, and a scalable architecture.

Built following production best practices — JWT auth, RBAC, Redis caching, BullMQ background processing, WebSockets, and Docker — all implemented from scratch.

---

## ✨ Features

### For Developers
- 🔍 Browse and search jobs by title, skill, or location
- ⚡ Real-time application status notifications via WebSocket
- 🤖 AI Resume Reviewer — instant feedback powered by Groq (llama-3.3-70b)
- 🤖 AI Interview Prep — tailored interview questions for any job
- 🎯 Smart match score — see how well your skills match a job
- 📊 Application tracker with status timeline

### For Recruiters
- 🏢 Company profile management
- 📝 Post jobs with required skills, salary range, and location
- 🤖 AI Job Description Generator — generate professional JDs instantly
- 👥 View applicants ranked by match score
- ✅ Update application status (Pending → Reviewed → Shortlisted → Rejected)
- 📈 Recruiter dashboard with analytics

### Platform
- 🔐 JWT Authentication with Refresh Tokens
- 🛡️ Role-Based Access Control (Developer / Recruiter)
- 🔄 Background job processing with BullMQ (development)
- 💾 Redis caching with smart cache invalidation
- 🌐 Nginx load balancer config ready
- 🐳 Fully Dockerized — one command local setup
- 🌙 Dark mode support
- 📱 Fully responsive — mobile + desktop

---

## 🏛️ System Architecture

```
Internet
    │
    ▼
┌──────────────────────────────────┐
│      Nginx (Load Balancer)       │
│  Rate Limiting + Gzip + Proxy    │
└───────────────┬──────────────────┘
                │
       ┌────────┴────────┐
       │                 │
  ┌────▼────┐       ┌────▼────┐
  │  Node   │  ...  │  Node   │   (3 Replicas — Docker)
  │   #1    │       │   #3    │
  └────┬────┘       └────┬────┘
       └────────┬─────────┘
                │
     ┌──────────┴──────────────┐
     │                         │
┌────▼─────┐          ┌────────▼─────┐
│  Redis   │          │  PgBouncer   │
│  Cache   │          │  Conn Pool   │
│  Queue   │          └────────┬─────┘
│  PubSub  │                   │
└──────────┘          ┌────────▼─────┐
                       │  PostgreSQL  │
                       └─────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 + Vite + TailwindCSS |
| **Backend** | Node.js + Express.js |
| **Database** | PostgreSQL 15 + Prisma ORM |
| **Cache / Queue** | Redis 7 + BullMQ |
| **AI** | Groq API (llama-3.3-70b-versatile) |
| **Real-time** | WebSockets (ws) + Redis Pub/Sub |
| **Load Balancer** | Nginx |
| **Connection Pool** | PgBouncer |
| **Auth** | JWT + bcrypt |
| **Validation** | express-validator |
| **DevOps** | Docker + Docker Compose |

---

## 📁 Project Structure

```
devhire/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                  # Prisma client
│   │   │   ├── redis.js               # Redis connections
│   │   │   └── queue.js               # BullMQ queue
│   │   ├── routes/
│   │   │   ├── auth.routes.js         # Register, Login, JWT
│   │   │   ├── company.routes.js      # Company CRUD
│   │   │   ├── job.routes.js          # Jobs CRUD + Apply
│   │   │   └── ai.routes.js           # Groq AI endpoints
│   │   ├── middleware/
│   │   │   ├── auth.js                # JWT verification
│   │   │   └── rbac.js                # Role-based access
│   │   ├── services/
│   │   │   ├── matching.service.js    # Match score algorithm
│   │   │   └── groq.service.js        # AI integrations
│   │   ├── workers/
│   │   │   └── application.worker.js  # BullMQ worker (dev only)
│   │   └── websocket/
│   │       └── ws.server.js           # WebSocket server
│   ├── prisma/
│   │   ├── schema.prisma              # Database schema
│   │   └── seed.js                    # Demo data
│   ├── Dockerfile
│   ├── ecosystem.config.js            # PM2 config
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Jobs.jsx               # Job board (Indeed-style)
│   │   │   ├── Dashboard.jsx          # Recruiter dashboard
│   │   │   ├── MyApplications.jsx     # Developer applications
│   │   │   ├── AITools.jsx            # Resume review + Interview prep
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── components/
│   │   │   └── Navbar.jsx             # Responsive navbar + dark mode
│   │   ├── context/
│   │   │   ├── AuthContext.jsx        # Auth state management
│   │   │   └── ThemeContext.jsx       # Dark mode
│   │   ├── hooks/
│   │   │   └── useWebSocket.js        # WebSocket hook
│   │   └── services/
│   │       └── api.js                 # Axios instance
│   └── Dockerfile
│
├── nginx/
│   └── nginx.conf                     # Load balancer config
├── docker-compose.yml                 # Development
├── docker-compose.prod.yml            # Production (3 replicas + PgBouncer)
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- Docker Desktop
- Git

### Local Development Setup

```bash
# 1. Clone the repo
git clone https://github.com/moizmalik13588/devhire.git
cd devhire

# 2. Start PostgreSQL + Redis
docker compose up -d

# 3. Backend setup
cd backend
cp .env.example .env
# Fill in your keys in .env

npm install
npx prisma migrate dev
npx prisma db seed
npm run dev

# 4. Frontend setup (new terminal)
cd frontend
npm install
npm run dev
```

### Environment Variables

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://devhire_user:devhire_pass@localhost:5432/devhire_db"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET=your_super_secret_key
JWT_REFRESH_SECRET=your_refresh_secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Groq AI (free at console.groq.com)
GROQ_API_KEY=your_groq_key_here
```

### Production Deployment (Docker)

```bash
# Production with Nginx + PgBouncer + 3 Backend replicas
docker compose -f docker-compose.prod.yml up -d
```

---

## 🔌 API Reference

### Auth

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/auth/register` | Register user | Public |
| POST | `/api/auth/login` | Login | Public |
| POST | `/api/auth/refresh` | Refresh token | Public |
| GET | `/api/auth/me` | Get current user | Protected |

### Jobs

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/jobs` | List all jobs (cached) | Public |
| GET | `/api/jobs/:id` | Get job detail | Public |
| POST | `/api/jobs` | Post a job | Recruiter |
| POST | `/api/jobs/:id/apply` | Apply to job | Developer |
| GET | `/api/jobs/my/applications` | My applications (cached) | Developer |
| GET | `/api/jobs/:id/applications` | Job applicants | Recruiter |
| PATCH | `/api/jobs/applications/:id/status` | Update status | Recruiter |
| DELETE | `/api/jobs/:id` | Delete job | Recruiter |

### Companies

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/companies` | Create company | Recruiter |
| GET | `/api/companies` | List companies | Public |
| GET | `/api/companies/me` | My company (cached) | Recruiter |
| PUT | `/api/companies` | Update company | Recruiter |

### AI

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/ai/resume-review` | AI resume analysis (cached 30min) | Developer |
| POST | `/api/ai/generate-jd` | AI job description generator | Recruiter |
| POST | `/api/ai/interview-prep` | Interview questions (cached 1hr) | Developer |

### WebSocket

```
ws://localhost:5000?token=<accessToken>
```

Events received:
```json
{
  "type": "APPLICATION_RECEIVED",
  "notification": { "message": "Your application was received! Match score: 67%" },
  "matchScore": 67,
  "matchedSkills": ["Node.js", "PostgreSQL"],
  "missingSkills": ["Docker"]
}
```

---

## 🎯 Matching Algorithm

```
Developer Skills:  ["Node.js", "PostgreSQL", "React"]
Job Required:      ["Node.js", "PostgreSQL", "Docker"]

Matched:           ["Node.js", "PostgreSQL"]  →  2 / 3
Score:             67%
Missing:           ["Docker"]
```

Simple, transparent, and effective — no black box AI needed for matching.

---

## 💾 Caching Strategy

| Endpoint | Cache Key | TTL | Invalidated When |
|---|---|---|---|
| GET /jobs | `jobs:search:skill:location` | 5 min | New job posted |
| GET /my/applications | `applications:userId` | 2 min | User applies |
| GET /companies/me | `company:userId` | 2 min | Job posted |
| POST /ai/interview-prep | `interview:jobId` | 1 hour | Never (static) |
| POST /ai/resume-review | `resume:userId:jobId` | 30 min | Never |

---

## 📈 Scalability

| Concern | Solution |
|---|---|
| High traffic | Nginx load balancing (3+ replicas) |
| DB connections | PgBouncer (1000 clients → 25 DB connections) |
| Repeated queries | Redis caching with smart invalidation |
| Heavy operations | BullMQ background processing |
| Real-time push | Redis Pub/Sub + WebSockets |
| Memory pressure | Redis maxmemory + allkeys-lru policy |
| Process crashes | PM2 cluster mode + auto-restart |

> **Note:** Current free-tier deployment (Railway + Supabase) handles ~200-500 concurrent users. The architecture is designed to scale further with paid infrastructure — multiple replicas, dedicated Redis, and PgBouncer active.

---

## 👥 Demo Accounts

| Role | Email | Password | Company |
|---|---|---|---|
| Developer | moiz@test.com | 123456 | — |
| Recruiter | ahmad@arbisoft.com | 123456 | Arbisoft |
| Recruiter | sara@10pearls.com | 123456 | 10Pearls |
| Recruiter | usman@nextbridge.com | 123456 | Nextbridge |

---

## 🔐 Security

- JWT access tokens (15 min) + refresh tokens (7 days)
- bcrypt password hashing (12 rounds)
- Role-based route protection (RBAC)
- Rate limiting — 100 req/min per IP
- Helmet.js HTTP security headers
- Input validation on all endpoints (express-validator)
- Environment variables — no secrets in code

---

## 👨‍💻 Author

**Moiz Malik**
- GitHub: [@moizmalik13588](https://github.com/moizmalik13588)
- Final Year CS Student — SMIU Karachi, Pakistan

---

## 📄 License

MIT License — feel free to use this project for learning and portfolio purposes.
