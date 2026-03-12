# 🤖 Lexa AI — Your Intelligent Virtual Assistant

A next-generation AI chat application featuring multi-model conversations, web search with citations, voice interactions, media generation, team collaboration, and a stunning modern UI built with React and TypeScript.

---

## ✨ Features

### Core Chat
- **Multi-Model AI** — Choose from 5 model tiers (Fast, Standard, Premium, Advanced, Ultra) with automatic routing based on query complexity
- **Real-Time Streaming** — Watch responses appear in real time with smooth rendering
- **Rich Formatting** — Full Markdown support with syntax-highlighted code blocks

### Search & Research
- **Web Search** — Live internet search with source citations and configurable throttling
- **Deep Research** — Comprehensive, multi-step AI-powered research workflows
- **Knowledge Base** — Upload and manage reference documents for context-aware answers

### Voice & Media
- **Voice Chat** — Speech recognition input and ElevenLabs-powered text-to-speech output
- **Real-Time Voice** — Streaming voice conversations with natural turn-taking
- **Image Generation** — Create images via DALL-E 3 with prompt controls
- **Video Generation** — Generate short videos with AI (Veo 3.1)

### Productivity
- **Goals & Milestones** — Track objectives with AI-assisted progress monitoring
- **Scheduled Tasks** — Set up recurring or one-time automated AI tasks
- **Smart Templates** — Reusable prompt templates for common workflows
- **Custom Instructions** — Define system-level prompts to shape AI behavior
- **Focus Mode** — Distraction-free, minimal chat interface

### Personalization
- **AI Personality** — Select from 8+ personality types (Professional, Creative, Friendly, …)
- **Persistent Memory** — Lexa remembers context across sessions
- **Learning Profiles** — Adaptive responses that improve over time
- **Theme Support** — Dark mode by default with light mode option

### Collaboration
- **Workspaces** — Team-based shared environments
- **Conversation Sharing** — Share chats via link with configurable access
- **Member Management** — Invite teammates with role-based permissions

### Analytics
- **Conversation Insights** — Visual dashboard with usage trends
- **Sentiment Tracking** — Mood indicators powered by conversation analysis
- **Productivity Scores** — Quantified productivity metrics over time

### Platform
- **Progressive Web App** — Installable on desktop and mobile with offline support
- **Responsive Design** — Mobile-first layouts that scale to any screen size
- **Keyboard Shortcuts** — Full keyboard navigation for power users
- **Accessibility** — Built on Radix UI primitives for screen reader support

---

## 🏗️ Tech Stack

### Frontend (`lexa-frontend/`)

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui (Radix primitives) |
| Animations | Framer Motion |
| Routing | React Router v6 |
| Server State | TanStack React Query |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| 3D Graphics | Three.js + React Three Fiber |
| Voice | ElevenLabs React SDK |
| Auth & DB | Supabase |
| Notifications | Sonner |
| Icons | Lucide React |

### Backend (`lexa-backend/`)

| Layer | Technology |
|---|---|
| Framework | Hono |
| Runtime | Node.js + TypeScript |
| Database | MongoDB 7 |
| Server Adapter | @hono/node-server |

---

## 📁 Project Structure

```
Lexa-AI-virtual-assistant/
├── lexa-frontend/                # React client application
│   ├── public/                   # PWA manifest & icons
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/             # Login & signup UI
│   │   │   ├── chat/             # 50+ chat-related components
│   │   │   └── ui/               # shadcn/ui base primitives
│   │   ├── hooks/                # 30 custom React hooks
│   │   ├── integrations/
│   │   │   └── supabase/         # Supabase client & generated types
│   │   ├── lib/                  # Utilities (streaming, PWA, helpers)
│   │   ├── pages/                # Route pages
│   │   └── types/                # TypeScript type definitions
│   ├── supabase/                 # Supabase project config
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   └── package.json
│
├── lexa-backend/                 # Hono API server
│   ├── src/
│   │   ├── server.ts             # App entry, CORS, route registration
│   │   ├── chat.ts               # POST /api/chat handler
│   │   ├── db.ts                 # MongoDB connection
│   │   └── seed.ts               # Database initializer (21 collections)
│   └── package.json
│
└── README.md                     # ← You are here
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** (ships with Node.js)
- A **Supabase** project ([supabase.com](https://supabase.com))
- A **MongoDB** instance (local or [Atlas](https://www.mongodb.com/atlas))

### 1. Clone the Repository

```bash
git clone https://github.com/parag8451/Lexa-AI-virtual-assistant.git
cd Lexa-AI-virtual-assistant
```

### 2. Set Up the Backend

```bash
cd lexa-backend
npm install
```

Create a `.env` file in `lexa-backend/`:

```env
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/lexa_ai
PORT=3000
```

Seed the database (creates 21 collections with default data):

```bash
npm run seed
```

Start the development server:

```bash
npm run dev
```

The API will be available at **http://localhost:3000**.

### 3. Set Up the Frontend

```bash
cd lexa-frontend
npm install
```

Create a `.env` file in `lexa-frontend/`:

```env
VITE_SUPABASE_URL=https://<project-id>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...
VITE_SUPABASE_PROJECT_ID=<project-id>
```

Start the development server:

```bash
npm run dev
```

The app will be available at **http://localhost:8080**.

---

## 📜 Available Scripts

### Frontend

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server on port 8080 |
| `npm run build` | TypeScript check + production build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests with Vitest |

### Backend

| Command | Description |
|---|---|
| `npm run dev` | Start the API server with hot reload |
| `npm run seed` | Initialize MongoDB collections |

---

## 🗄️ Database Collections

The MongoDB `lexa_ai` database uses 21 collections:

| Category | Collections |
|---|---|
| **Users** | `profiles`, `user_preferences`, `user_memories`, `learning_profiles` |
| **Chat** | `conversations`, `messages`, `conversation_shares` |
| **Content** | `smart_templates`, `custom_instructions`, `artifacts` |
| **Media** | `image_generations`, `video_generations` |
| **Knowledge** | `knowledge_documents` |
| **Productivity** | `user_goals`, `scheduled_tasks`, `productivity_scores` |
| **Collaboration** | `workspaces`, `workspace_members`, `workspace_invites` |
| **Analytics** | `analytics_events`, `usage_statistics`, `rate_limits` |

---

## 🔌 API Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/chat` | Send a message and receive an AI response |

**Request body:**

```json
{
  "message": "Hello, Lexa!"
}
```

**Response:**

```json
{
  "reply": "..."
}
```

---

## 🗺️ Frontend Routes

| Path | Page | Description |
|---|---|---|
| `/` | Landing | Feature showcase and sign-up |
| `/chat` | Chat | Main AI assistant interface |
| `/auth` | Auth | Login and registration |
| `/settings` | Settings | Preferences, API keys, theme |
| `/profile` | Profile | Account management |
| `/reset-password` | Reset Password | Password recovery flow |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

Private — All rights reserved.
