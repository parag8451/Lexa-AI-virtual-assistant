# 🚀 Lexa AI - Quick Reference Guide

## Setup & Installation

### Quick Start (All Systems)

**Windows:**
```bash
setup.bat
```

**macOS/Linux:**
```bash
chmod +x setup.sh
./setup.sh
```

**Manual Setup:**
```bash
# Backend
cd lexa-backend
npm install
cp .env.example .env
# Edit .env with your credentials

# Frontend
cd lexa-frontend
npm install
cp .env.example .env
# Edit .env with your credentials
```

---

## Development Commands

### Backend

```bash
cd lexa-backend

# Start development server
npm run dev
# Runs on http://localhost:3000

# Build for production
npm run build

# Run production server
npm start

# Lint code
npm run lint

# Seed database
npm run seed
```

### Frontend

```bash
cd lexa-frontend

# Start development server
npm run dev
# Runs on http://localhost:5173

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Lint code
npm run lint

# Format code
npm run format
```

---

## Environment Variables

### Backend (.env)

```env
# Database
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/lexa_ai

# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key

# AI
ANTHROPIC_API_KEY=sk-ant-...

# Server
PORT=3000
NODE_ENV=development|production

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:8082

# Optional
REDIS_URL=redis://localhost:6379
SENTRY_DSN=https://...@sentry.io/...
```

### Frontend (.env)

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# API
VITE_API_BASE_URL=http://localhost:3000/api

# Features
VITE_ENABLE_VOICE=true
VITE_ENABLE_IMAGE_GENERATION=true
VITE_ENABLE_WEB_SEARCH=true
VITE_ENABLE_COLLABORATION=true

# Analytics
VITE_ENABLE_ANALYTICS=true
VITE_SENTRY_DSN=
```

---

## API Endpoints

### Base URL
```
http://localhost:3000/api
```

### Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/chat` | Stream AI response | ✅ |
| `GET` | `/conversations` | List conversations | ✅ |
| `GET` | `/conversations/:id` | Get conversation | ✅ |
| `DELETE` | `/conversations/:id` | Delete conversation | ✅ |
| `GET` | `/health` | Health check | ❌ |

### Example Requests

**Chat:**
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Hello"}
    ],
    "model": "lexa-balanced"
  }'
```

**List Conversations:**
```bash
curl http://localhost:3000/api/conversations \
  -H "Authorization: Bearer <token>"
```

---

## Project Structure Deep Dive

### Backend Structure

```
lexa-backend/
├── src/
│   ├── server.ts          # Main Hono app
│   ├── db.ts              # MongoDB connection
│   ├── chat.ts            # Chat logic
│   ├── seed.ts            # Database seeding
│   ├── models/
│   │   └── index.ts       # Mongoose schemas
│   ├── routes/
│   │   └── chat.ts        # API routes
│   └── middleware/
│       └── auth.ts        # JWT, Rate limiting
├── supabase/
│   └── functions/
│       └── chat/
│           └── index.ts   # Edge function
├── dist/                  # Compiled JS
├── tsconfig.json          # TypeScript config
└── package.json
```

### Frontend Structure

```
lexa-frontend/
├── src/
│   ├── main.tsx           # App entry
│   ├── App.tsx            # Router
│   ├── pages/             # Route pages
│   │   ├── Landing.tsx
│   │   ├── Index.tsx      # Chat page
│   │   ├── Auth.tsx
│   │   └── ...
│   ├── components/
│   │   ├── chat/          # Chat UI
│   │   ├── auth/          # Auth forms
│   │   └── ui/            # shadcn/ui
│   ├── hooks/             # Custom hooks
│   │   ├── useChat.ts
│   │   ├── useAuth.ts
│   │   ├── useConversations.ts
│   │   └── ...
│   ├── lib/
│   │   ├── streaming.ts
│   │   └── utils.ts
│   ├── types/
│   │   └── chat.ts
│   └── integrations/
│       └── supabase/
│           └── client.ts
├── dist/                  # Build output
└── package.json
```

---

## Key Hooks (Frontend)

### useAuth
```typescript
const { user, session, loading, signOut } = useAuth();
```

### useChat
```typescript
const {
  messages,
  isLoading,
  error,
  send,
  clearMessages,
} = useChat();
```

### useConversations
```typescript
const {
  conversations,
  currentConversation,
  messages,
  createConversation,
  selectConversation,
  deleteConversation,
} = useConversations();
```

### useVoice
```typescript
const {
  isRecording,
  isTranscribing,
  isSpeaking,
  startRecording,
  stopRecording,
  speak,
} = useVoice();
```

---

## Database Models

### User
```typescript
interface IUser {
  _id: ObjectId;
  supabaseId: string;
  email: string;
  tier: 'free' | 'pro' | 'enterprise';
  usageCount: number;
  usageResetAt: Date;
  preferences: {
    personality: string;
    model: string;
    theme: 'light' | 'dark';
  };
  createdAt: Date;
  updatedAt: Date;
}
```

### Conversation
```typescript
interface IConversation {
  _id: ObjectId;
  userId: string;
  title: string;
  messages: IMessage[];
  totalTokens: number;
  model: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Message
```typescript
interface IMessage {
  role: 'user' | 'assistant';
  content: string;
  tokens?: number;
  timestamp: Date;
}
```

---

## Common Tasks

### Add a New API Endpoint

**Backend:**
```typescript
// src/routes/chat.ts
chatRouter.post('/new-endpoint', async (c) => {
  const userId = c.get('userId');
  if (!userId) return c.json({ error: 'Unauthorized' }, 401);
  
  // Your logic here
  return c.json({ success: true });
});
```

### Add a New Hook

**Frontend:**
```typescript
// src/hooks/useMyHook.ts
import { useState, useCallback } from 'react';

export function useMyHook() {
  const [state, setState] = useState(null);
  
  const doSomething = useCallback(async () => {
    // Your logic
  }, []);
  
  return { state, doSomething };
}
```

### Add a New Component

**Frontend:**
```typescript
// src/components/MyComponent.tsx
interface MyComponentProps {
  title: string;
  onAction?: () => void;
}

export function MyComponent({ title, onAction }: MyComponentProps) {
  return (
    <div className="...">
      {title}
      <button onClick={onAction}>Action</button>
    </div>
  );
}
```

---

## Deployment Checklist

- [ ] Environment variables set in production
- [ ] Database backups configured
- [ ] SSL/HTTPS enabled
- [ ] CORS properly configured
- [ ] Rate limiting active
- [ ] Monitoring set up
- [ ] Error tracking enabled
- [ ] Logs aggregated
- [ ] Database indexes created
- [ ] Frontend optimized
- [ ] API rate limits enforced
- [ ] Secrets rotated

---

## Troubleshooting

### Port Already in Use

```bash
# macOS/Linux
lsof -i :3000
kill -9 <PID>

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Clear Node Modules & Reinstall

```bash
rm -rf node_modules package-lock.json
npm install
```

### Reset Database

```bash
# Clear MongoDB collections
db.users.deleteMany({})
db.conversations.deleteMany({})

# Re-seed
npm run seed
```

### Clear Frontend Cache

```bash
# Clear browser cache
# or delete .vite folder
rm -rf .vite
npm run dev
```

---

## Performance Tips

### Frontend
- Use React.memo for expensive components
- Lazy load routes with React.lazy
- Virtualize long lists
- Debounce search/input
- Cache API responses

### Backend
- Use database indexes
- Implement caching with Redis
- Stream large responses
- Batch database queries
- Monitor slow queries

---

## Security Reminders

- ✅ Never commit .env files
- ✅ Validate all user input
- ✅ Use HTTPS in production
- ✅ Rotate API keys regularly
- ✅ Keep dependencies updated
- ✅ Use environment variables for secrets
- ✅ Implement rate limiting
- ✅ Enable CORS carefully

---

## Useful Links

- [Hono Documentation](https://hono.dev)
- [React Documentation](https://react.dev)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Supabase](https://supabase.com)
- [Anthropic Claude](https://www.anthropic.com)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)

---

## Getting Help

1. Check [SETUP_GUIDE.md](./SETUP_GUIDE.md)
2. Check [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
3. Review error messages carefully
4. Check console/logs
5. Open GitHub issues

---

**Last Updated**: May 29, 2026  
**Version**: 1.0.0
