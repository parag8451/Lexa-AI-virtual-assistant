# Lexa AI Virtual Assistant - Complete Setup Guide

## Project Overview
Lexa is a full-stack AI virtual assistant built with React (frontend) and Node.js/Hono (backend), powered by Anthropic's Claude and Supabase.

## Architecture

### Backend (Node.js/Hono)
- **Framework**: Hono (lightweight, fast)
- **Database**: MongoDB (conversations, users, messages)
- **Cache**: Redis (optional, for rate limiting)
- **Authentication**: Supabase JWT tokens
- **Streaming**: Native ReadableStream for AI responses

### Frontend (React/TypeScript)
- **Framework**: React 18 + TypeScript + Vite
- **UI**: shadcn/ui + Tailwind CSS
- **State**: React Query (TanStack)
- **Real-time**: Supabase real-time subscriptions
- **Features**: Voice input/output, image generation, web search, collaboration

## Prerequisites

- Node.js 18+
- MongoDB instance (Atlas or local)
- Supabase project
- Git

## Installation & Setup

### 1. Backend Setup

```bash
cd lexa-backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Fill in required values:
# - MONGO_URI: MongoDB connection string
# - VITE_SUPABASE_URL: Your Supabase URL
# - VITE_SUPABASE_PUBLISHABLE_KEY: Your Supabase publishable key
# - ANTHROPIC_API_KEY: Your Anthropic API key (if using directly)
# - CORS_ORIGINS: Frontend URLs
```

**Environment Variables Needed:**
```
MONGO_URI=mongodb+srv://...
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=...
PORT=3000
NODE_ENV=development
CORS_ORIGINS=http://localhost:5173,http://localhost:8082
```

### 2. Frontend Setup

```bash
cd lexa-frontend

# Install dependencies
npm install  # or bun install

# Create .env file
cp .env.example .env

# Fill in required values:
# - VITE_SUPABASE_URL: Same as backend
# - VITE_SUPABASE_ANON_KEY: Supabase anon key
# - VITE_API_BASE_URL: Backend URL (http://localhost:3000/api)
```

**Environment Variables Needed:**
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=...
VITE_API_BASE_URL=http://localhost:3000/api
```

### 3. Supabase Setup

#### Create Authentication
1. Go to Supabase Dashboard → Authentication → Providers
2. Enable Email/Password authentication
3. Optional: Enable Google OAuth for social login

#### Create Tables (if using directly)
Run the migration files in `lexa-backend/supabase/migrations/` or create them manually:

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  email TEXT UNIQUE,
  tier TEXT DEFAULT 'free',
  usage_count INTEGER DEFAULT 0,
  usage_reset_at TIMESTAMP,
  preferences JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Conversations table
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  title TEXT,
  model TEXT DEFAULT 'lexa-balanced',
  total_tokens INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id),
  role TEXT,
  content TEXT,
  tokens INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd lexa-backend
npm run dev
# Runs on http://localhost:3000
```

**Terminal 2 - Frontend:**
```bash
cd lexa-frontend
npm run dev
# Runs on http://localhost:5173
```

### Production Build

**Backend:**
```bash
npm run build
npm start
```

**Frontend:**
```bash
npm run build
# Static files in dist/
```

## API Endpoints

### Chat Endpoints
- `POST /api/chat` - Stream chat response
  - Headers: `Authorization: Bearer {token}`
  - Body: `{ messages: ChatMessage[], model?: string }`
  - Returns: Server-Sent Events (SSE) stream

- `GET /api/conversations` - Get user's conversations
- `GET /api/conversations/:id` - Get specific conversation
- `DELETE /api/conversations/:id` - Delete conversation
- `GET /health` - Health check

## Database Schema

### User
```typescript
{
  _id: ObjectId,
  supabaseId: string,
  email: string,
  tier: 'free' | 'pro' | 'enterprise',
  usageCount: number,
  usageResetAt: Date,
  preferences: {
    personality: string,
    model: string,
    theme: 'light' | 'dark' | 'auto'
  }
}
```

### Conversation
```typescript
{
  _id: ObjectId,
  userId: string,
  title: string,
  messages: Message[],
  totalTokens: number,
  model: string,
  createdAt: Date,
  updatedAt: Date
}
```

### Message
```typescript
{
  role: 'user' | 'assistant' | 'system',
  content: string,
  tokens?: number,
  toolCalls?: Array<{ toolName, toolInput }>,
  timestamp: Date
}
```

## Key Features

### ✅ Implemented
- User authentication (Supabase)
- Chat streaming with SSE
- Rate limiting (free/pro/enterprise tiers)
- Conversation history
- User preferences
- MongoDB integration
- JWT middleware
- Logging middleware

### 🔄 In Progress
- Voice input/output (Web Speech API)
- Image generation integration
- Web search capability
- Collaboration features
- Real-time updates

### 📋 Features List
- Chat with AI assistant
- Multiple conversation threads
- User preferences & personality selection
- Rate limiting by tier
- Token usage tracking
- Conversation export
- Custom instructions
- Memory & context retention

## Troubleshooting

### "Cannot connect to MongoDB"
- Check MONGO_URI in .env
- Ensure MongoDB instance is running
- Check network/firewall settings
- Verify credentials are correct

### "Supabase authentication failed"
- Check VITE_SUPABASE_URL and keys
- Ensure URLs match between backend/frontend
- Check Supabase project settings

### "Rate limit exceeded"
- Wait for the cooldown period
- Upgrade to higher tier for more requests
- Check rate limit settings in backend

### "CORS errors"
- Add frontend URL to CORS_ORIGINS in backend .env
- Ensure credentials are sent correctly
- Check browser console for detailed error

## Performance Optimization

### Frontend
- Lazy load components
- Virtualize long message lists
- Debounce search/input
- Preload critical routes

### Backend
- Connection pooling
- Caching frequently accessed data
- Optimize database queries
- Use streaming for large responses

## Security Considerations

- ✅ JWT token validation
- ✅ Rate limiting per user/tier
- ✅ CORS configuration
- ✅ Input validation with Zod
- ✅ Secure database connection
- ✅ Environment variables for secrets

**Additional Recommendations:**
- Use HTTPS in production
- Enable 2FA for Supabase
- Rotate API keys regularly
- Monitor for suspicious activity
- Implement request signing
- Use secrets management tool

## Deployment

### Backend (Example: Railway/Render)
```bash
# Build
npm run build

# Environment variables (set in platform)
PORT=3000
MONGO_URI=...
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
CORS_ORIGINS=https://yourdomain.com

# Start
npm start
```

### Frontend (Example: Vercel/Netlify)
```bash
# Build
npm run build

# Environment variables (set in platform)
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_API_BASE_URL=https://api.yourdomain.com

# Deploy dist folder
```

## Development Workflow

```bash
# Start both dev servers
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Lint code
npm run lint

# Format code
npm run format
```

## Contributing

1. Create feature branch: `git checkout -b feature/feature-name`
2. Make changes and test
3. Commit with clear message: `git commit -m "feat: add feature"`
4. Push and create PR

## Support

For issues or questions:
1. Check troubleshooting section
2. Review environment setup
3. Check logs (frontend console, backend terminal)
4. Open GitHub issue with details

## License

MIT License - See LICENSE file for details

---

**Last Updated**: May 29, 2026
**Version**: 1.0.0
