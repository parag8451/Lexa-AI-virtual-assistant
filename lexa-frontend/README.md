# Lexa AI — Frontend

> React client application for the Lexa AI virtual assistant.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite (dev server on port 8080) |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui (40+ Radix-based primitives) |
| Animations | Framer Motion |
| Routing | React Router v6 |
| Server State | TanStack React Query |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| 3D | Three.js + React Three Fiber |
| Voice | ElevenLabs React SDK |
| Auth & DB | Supabase |
| Notifications | Sonner |
| Icons | Lucide React |

## Getting Started

```bash
# Install dependencies
npm install

# Create a .env file with Supabase credentials
cp .env.example .env   # or create manually (see below)

# Start the dev server
npm run dev
```

### Environment Variables

Create a `.env` file in this directory:

```env
VITE_SUPABASE_URL=https://<project-id>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...
VITE_SUPABASE_PROJECT_ID=<project-id>
```

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server (http://localhost:8080) |
| `npm run build` | TypeScript check + production build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests with Vitest |

## Project Structure

```
src/
├── components/
│   ├── auth/             # Login & signup screens
│   ├── chat/             # 50+ chat components
│   │   ├── ChatMessage   # Message rendering (Markdown, code blocks)
│   │   ├── ChatInput     # Multi-feature input bar
│   │   ├── ChatSidebar   # Conversation list & navigation
│   │   ├── ChatHeader    # Model selector, controls
│   │   ├── FocusMode     # Distraction-free UI
│   │   ├── VoiceChatMode # Voice interaction mode
│   │   ├── ImageGenerationPanel
│   │   ├── MediaGenerationPanel
│   │   ├── GoalsPanel
│   │   ├── KnowledgeBasePanel
│   │   ├── MemoryPanel
│   │   ├── WorkspacePanel
│   │   ├── PersonalizationHub
│   │   ├── SmartTemplatesPanel
│   │   ├── CustomInstructionsPanel
│   │   └── ...more
│   └── ui/               # shadcn/ui base primitives
├── hooks/                # 30 custom hooks
│   ├── useAuth           # Authentication state
│   ├── useConversations  # Chat data management
│   ├── useVoice          # Voice input/output
│   ├── useWebSearch      # Web search integration
│   ├── useImageGeneration
│   ├── useVideoGeneration
│   ├── useGoals
│   ├── useMemories
│   ├── useModelRouting
│   ├── useWorkspaces
│   └── ...more
├── integrations/
│   └── supabase/         # Supabase client & auto-generated types
├── lib/
│   ├── streaming.ts      # Real-time message streaming
│   ├── pwa.ts            # Service worker registration
│   └── utils.ts          # Helper functions
├── pages/                # Route pages (Landing, Chat, Auth, Settings, Profile, …)
└── types/
    └── chat.ts           # Message, Conversation, Citation, Attachment types
```

## Key Features

- **Multi-model AI** — 5 model tiers with automatic routing
- **Web Search** — Live search with source citations
- **Voice Chat** — Speech-to-text and ElevenLabs TTS
- **Image & Video Generation** — DALL-E 3 and Veo 3.1
- **Knowledge Base** — Document-backed context
- **Goals & Tasks** — AI-assisted productivity tracking
- **Focus Mode** — Minimal, distraction-free interface
- **Workspaces** — Team collaboration with invites and roles
- **Smart Templates** — Reusable prompt workflows
- **Custom Instructions** — Shape AI behavior per-user
- **Persistent Memory** — Cross-session context retention
- **PWA** — Installable with offline support
- **Dark & Light Themes** — Dark by default
- **Analytics Dashboard** — Usage trends, sentiment, and productivity scores

## License

Private — All rights reserved.
