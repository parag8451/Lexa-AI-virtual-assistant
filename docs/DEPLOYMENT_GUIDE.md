# Lexa AI - Complete Deployment Guide

## Quick Start (Development)

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Supabase account
- Anthropic API key (Claude)

### 1. Clone & Setup

```bash
# Clone repository
git clone <repo-url>
cd lexa-backend && npm install
cd ../lexa-frontend && npm install
```

### 2. Environment Configuration

**Backend (.env)**
```
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/lexa_ai
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-key
ANTHROPIC_API_KEY=sk-ant-...
PORT=3000
NODE_ENV=development
CORS_ORIGINS=http://localhost:5173,http://localhost:8082
```

**Frontend (.env)**
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-key
VITE_API_BASE_URL=http://localhost:3000/api
```

### 3. Start Development Servers

```bash
# Terminal 1 - Backend
cd lexa-backend
npm run dev

# Terminal 2 - Frontend  
cd lexa-frontend
npm run dev

# Terminal 3 (Optional) - Seed database
cd lexa-backend
npm run seed
```

Visit `http://localhost:5173`

---

## Deployment Guides

### Option 1: Railway (Recommended for Backend)

#### Backend Deployment

1. **Create Railway Project**
   - Go to railway.app
   - Click "New Project" → "GitHub Repo"
   - Select lexa-backend repository

2. **Add MongoDB Plugin**
   - In Railway project: Add → Add from Database
   - Select "MongoDB"
   - Railway auto-populates `DATABASE_URL`

3. **Configure Variables**
   ```
   PORT=3000
   NODE_ENV=production
   MONGO_URI=${{Mongo.DATABASE_URL}}
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-key
   ANTHROPIC_API_KEY=sk-ant-...
   CORS_ORIGINS=https://your-frontend-domain.com
   ```

4. **Deploy**
   - Railway auto-deploys on push to main
   - Check deployment logs in Railway dashboard
   - Copy backend URL for frontend configuration

### Option 2: Render (Backend Alternative)

1. **Create New Web Service**
   - Go to render.com
   - Click "New +" → "Web Service"
   - Connect GitHub repository

2. **Configure**
   ```
   Build: npm install
   Start: npm run build && npm start
   ```

3. **Environment Variables**
   - Add all from backend .env to Render dashboard

4. **Deploy**
   - Render auto-deploys on push

---

### Option 3: Vercel (Frontend Deployment)

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to vercel.com
   - Import lexa-frontend repository
   - Vercel auto-detects Vite configuration

3. **Configure Environment**
   - In Vercel project settings → Environment Variables
   - Add frontend .env variables

4. **Deploy**
   - Vercel auto-deploys on push
   - Get production URL

---

### Option 4: Netlify (Frontend Alternative)

1. **Connect Repository**
   - Go to netlify.com
   - Click "Add new site" → "Import an existing project"
   - Select lexa-frontend

2. **Build Settings**
   ```
   Build command: npm run build
   Publish directory: dist
   ```

3. **Environment Variables**
   - Site settings → Build & deploy → Environment
   - Add frontend .env variables

4. **Deploy**
   - Netlify auto-deploys on push

---

### Option 5: Docker (Full Stack)

**Dockerfile (Backend)**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist

EXPOSE 3000

CMD ["npm", "start"]
```

**Build & Run**
```bash
# Build
docker build -t lexa-backend:latest .

# Run
docker run -p 3000:3000 \
  -e MONGO_URI=... \
  -e VITE_SUPABASE_URL=... \
  -e ANTHROPIC_API_KEY=... \
  lexa-backend:latest
```

---

## Supabase Setup for Production

### 1. Edge Function Deployment

```bash
# Navigate to project
supabase functions deploy chat \
  --project-id your-project-id

# Set environment variables
supabase secrets set \
  ANTHROPIC_API_KEY=sk-ant-... \
  --project-id your-project-id
```

### 2. Database Setup

Run migrations on Supabase:
```sql
-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  email TEXT,
  tier TEXT DEFAULT 'free',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create conversations table
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  title TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id),
  role TEXT,
  content TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 3. Authentication Setup

- Go to Supabase dashboard → Authentication
- Enable Email/Password provider
- (Optional) Enable Google OAuth
- Configure redirect URLs

---

## Database Setup

### MongoDB Atlas (Recommended)

1. **Create Account**
   - Go to mongodb.com/cloud/atlas
   - Create free cluster

2. **Get Connection String**
   - Cluster → Connect → Connect application
   - Copy connection string
   - Replace `<username>`, `<password>`, `<database>`

3. **Seed Database**
   ```bash
   cd lexa-backend
   npm run seed
   ```

### Local MongoDB

```bash
# Install MongoDB
# macOS: brew install mongodb-community
# Linux: Follow MongoDB docs
# Windows: Download MongoDB installer

# Start MongoDB
mongod

# Seed database
npm run seed
```

---

## Production Checklist

### Security
- [ ] All environment variables set (no hardcoded secrets)
- [ ] CORS properly configured
- [ ] HTTPS enabled
- [ ] Rate limiting active
- [ ] JWT tokens validated
- [ ] Database backups configured
- [ ] Monitoring enabled

### Performance
- [ ] Frontend optimized (tree shaking, code splitting)
- [ ] Backend response caching
- [ ] Database indexes created
- [ ] CDN configured for static assets
- [ ] Image compression enabled
- [ ] Lazy loading implemented

### Monitoring & Logging
- [ ] Application logs aggregated
- [ ] Error tracking (Sentry) configured
- [ ] Performance monitoring active
- [ ] Database slow query monitoring
- [ ] Uptime monitoring configured
- [ ] Alert notifications set

### Infrastructure
- [ ] Auto-scaling configured
- [ ] Load balancing set up
- [ ] Database replication enabled
- [ ] Backups scheduled (daily minimum)
- [ ] Disaster recovery plan documented
- [ ] API rate limiting enforced

---

## Troubleshooting Deployments

### Backend Won't Start
```bash
# Check logs
railway logs  # or render logs

# Verify environment variables
echo $MONGO_URI
echo $VITE_SUPABASE_URL

# Test locally first
npm run build
npm start
```

### Frontend Won't Connect to Backend
- Check `VITE_API_BASE_URL` in frontend .env
- Verify backend CORS includes frontend URL
- Check browser console for CORS errors
- Ensure backend is running and accessible

### Database Connection Failed
- Verify MONGO_URI connection string
- Check IP whitelist in MongoDB Atlas
- Confirm username/password correct
- Test with MongoDB compass tool

### Supabase Edge Function Not Working
```bash
# Check function logs
supabase functions list
supabase functions download chat

# Re-deploy
supabase functions deploy chat
```

---

## Scaling Strategy

### Phase 1 (MVP)
- Single backend instance
- Shared database
- Basic rate limiting
- Manual scaling

### Phase 2 (Growth)
- Multiple backend instances
- Database replication
- Redis caching
- Load balancer
- CDN for frontend

### Phase 3 (Scale)
- Microservices architecture
- Horizontal scaling
- Database sharding
- Message queue (Bull, RabbitMQ)
- Advanced monitoring

---

## Cost Optimization

### MongoDB Atlas
- Use shared tier for dev
- M0 cluster free forever
- Pay-as-you-go for production
- Enable compression for data savings

### Supabase
- Free tier includes 500MB storage
- Edge Functions: $0.50/million requests
- Database: $100/month for production

### Railway/Render
- Railway: $5/month starting
- Render: $7/month starting
- Auto-scales with load

### Frontend Hosting
- Vercel/Netlify: Free with limits
- Both have generous free tiers
- Pay only for overages

---

## CI/CD Pipeline

### GitHub Actions (Example)

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run build
      - run: npm run lint
      
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v3
        with:
          name: dist
          path: dist/
```

---

## Support & Resources

- [Hono Docs](https://hono.dev)
- [MongoDB Docs](https://docs.mongodb.com)
- [Supabase Docs](https://supabase.com/docs)
- [React Docs](https://react.dev)
- [Anthropic Docs](https://docs.anthropic.com)

---

**Version**: 1.0.0  
**Last Updated**: May 29, 2026
