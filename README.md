# 🤖 Lexa AI - Virtual Assistant

> A full-stack AI virtual assistant with real-time chat, voice capabilities, and advanced AI features powered by Claude 3.5 and Supabase.

## ✨ Features

### 💬 Core Chat Features
- **Real-time Streaming** - Token-by-token response streaming via Server-Sent Events
- **Multiple Conversations** - Organize chats into separate threads
- **Conversation History** - Persist and retrieve previous conversations
- **Custom Instructions** - Tailor AI behavior to your needs
- **Smart Memory** - Retain user preferences and context

### 🎙️ Voice Features
- **Voice Input** - Speak to chat using Web Speech API
- **Voice Output** - Listen to AI responses
- **Real-time Voice Chat** - Live conversation mode
- **Audio Recording** - Save conversations as audio

### 🎨 Advanced Features
- **Image Generation** - Create images with AI
- **Web Search** - Find current information
- **Code Execution** - Run code snippets safely
- **File Sharing** - Upload and share files
- **Collaboration** - Share conversations with others
- **Analytics** - Track usage and insights

## 🏗️ Project Structure

```
lexa-backend/               - Node.js/Hono REST API
├── src/
│   ├── server.ts          - Main app entry
│   ├── db.ts              - MongoDB connection
│   ├── models/            - Database schemas
│   ├── routes/            - API endpoints
│   ├── middleware/        - Auth, rate limiting, logging
│   ├── chat.ts            - Chat logic
│   └── seed.ts            - Database seeding
├── supabase/
│   └── functions/
│       └── chat/          - Edge Function for AI
└── package.json

lexa-frontend/              - React/TypeScript + Vite + Tailwind
├── src/
│   ├── main.tsx           - App entry
│   ├── App.tsx            - Router setup
│   ├── pages/             - Route pages
│   ├── components/        - React components
│   ├── hooks/             - Custom hooks
│   ├── lib/               - Utilities
│   ├── types/             - TypeScript types
│   └── integrations/      - Supabase client
├── public/                - Static assets
└── package.json
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Supabase account
- Anthropic API key

### Installation & Setup

**1. Clone & Install**
```bash
git clone <repo-url>
cd lexa-backend && npm install
cd ../lexa-frontend && npm install
```

**2. Configure Environment**

Backend (.env):
```env
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/lexa_ai
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-key
ANTHROPIC_API_KEY=sk-ant-...
PORT=3000
CORS_ORIGINS=http://localhost:5173
```

Frontend (.env):
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-key
VITE_API_BASE_URL=http://localhost:3000/api
```

**3. Start Development**

```bash
# Terminal 1: Backend
cd lexa-backend
npm run dev

# Terminal 2: Frontend
cd lexa-frontend
npm run dev

# Optional - Terminal 3: Seed database
cd lexa-backend
npm run seed
```

Visit `http://localhost:5173`

## 📖 Documentation

- [Setup Guide](./SETUP_GUIDE.md) - Complete configuration guide
- [Deployment Guide](./DEPLOYMENT_GUIDE.md) - Production deployment strategies
- [Backend README](./lexa-backend/README.md) - Backend-specific docs
- [Frontend README](./lexa-frontend/README.md) - Frontend-specific docs

## 🔧 Tech Stack

**Frontend**
- React 18 + TypeScript
- Vite + TailwindCSS
- shadcn/ui + Framer Motion
- TanStack Query + Zustand

**Backend**
- Node.js + Hono
- MongoDB + Mongoose
- Supabase + Auth
- JWT + Rate Limiting

**Services**
- Anthropic Claude 3.5 Sonnet
- Supabase Edge Functions
- MongoDB Atlas
- Railway/Vercel for hosting

## 🌐 API Endpoints

```
POST   /api/chat                    - Stream chat response
GET    /api/conversations          - List all conversations
GET    /api/conversations/:id      - Get specific conversation
DELETE /api/conversations/:id      - Delete conversation
GET    /health                      - Health check
```

## 🚀 Deployment

### Quick Deploy

**Railway** (Backend):
```bash
railway link <project-id>
railway up
```

**Vercel** (Frontend):
```bash
vercel
```

**Docker** (Full Stack):
```bash
docker build -t lexa-backend .
docker run -p 3000:3000 lexa-backend
```

See [Deployment Guide](./DEPLOYMENT_GUIDE.md) for detailed instructions.

## 🧪 Testing

```bash
cd lexa-backend
npm test              # Run backend tests
npm run lint         # Lint backend

cd ../lexa-frontend
npm test             # Run frontend tests
npm run build        # Build for production
```

## 📊 Database Schema

**Users**: Profiles, preferences, usage
**Conversations**: Chat threads with metadata
**Messages**: Individual messages with role/content
**Memories**: User knowledge retention
**Analytics**: Usage tracking and insights

## 🔐 Security

- ✅ JWT authentication
- ✅ Rate limiting per tier
- ✅ CORS protection
- ✅ Input validation (Zod)
- ✅ HTTPS enforced
- ✅ Database encryption
- ✅ Audit logging

## 🤝 Contributing

```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes & commit
git commit -m "feat: add your feature"

# Push & create PR
git push origin feature/your-feature
```

## 🐛 Troubleshooting

**Backend won't start?**
- Check Node version (need 18+)
- Verify MONGO_URI in .env
- Ensure Supabase credentials are correct

**Frontend CORS errors?**
- Add frontend URL to backend CORS_ORIGINS
- Check VITE_API_BASE_URL is correct
- Verify backend is running on port 3000

**Database connection issues?**
- Check MongoDB connection string
- Verify IP whitelist in Atlas
- Test connection with MongoDB Compass

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for more troubleshooting.

## 📄 License

MIT License - See [LICENSE](./LICENSE)

## 📧 Support

- 📝 [Documentation](./SETUP_GUIDE.md)
- 🚀 [Deployment](./DEPLOYMENT_GUIDE.md)
- 🐛 Report issues on GitHub

---

Made with ❤️ | Version 1.0.0 | May 2026

## Google Login Setup

Before using Google login, you need to:
1. Create a Google OAuth application
2. Configure Supabase with Google OAuth credentials
3. Set up environment variables

**See [GOOGLE_LOGIN_SETUP.md](./GOOGLE_LOGIN_SETUP.md) for detailed instructions.**

## Available Scripts

### Backend
- `npm run dev` - Start development server
- `npm run build` - Compile TypeScript
- `npm run lint` - Type check
- `npm start` - Run production build

### Frontend
- `npm run dev` - Start dev server
- `npm run build` - Production build
- `npm run lint` - ESLint check
- `npm run test` - Run tests
- `npm run test:watch` - Watch mode testing

## Key Features
- Real-time chat functionality
- Google OAuth login
- PWA support with service workers
- Offline indicators
- React Query for data management
- TypeScript for type safety
- Tailwind CSS for styling
- Shadcn UI components

## Technologies
- **Backend**: Node.js, Hono, MongoDB, TypeScript
- **Frontend**: React 18, Vite, React Router, Tailwind CSS, Supabase
