# 🚀 Lexa AI - Getting Started (Start Here!)

Welcome to Lexa AI! This guide will get you up and running in minutes.

## 📋 Prerequisites Checklist

Before starting, make sure you have:

- [ ] Node.js 18 or higher installed
  ```bash
  node --version  # Should be v18+
  ```
- [ ] Git installed
- [ ] MongoDB Atlas account (free tier)
- [ ] Supabase account (free tier)
- [ ] Anthropic API key (Claude 3.5)

## ⚡ 5-Minute Setup

### 1. Clone Repository
```bash
git clone <your-repo-url>
cd Lexa-AI-virtual-assistant
```

### 2. Run Setup Script

**Windows:**
```bash
setup.bat
```

**macOS/Linux:**
```bash
chmod +x setup.sh
./setup.sh
```

### 3. Configure Credentials

**Backend** (`lexa-backend/.env`):
```env
MONGO_URI=your-mongodb-connection-string
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-key
ANTHROPIC_API_KEY=sk-ant-your-key
PORT=3000
CORS_ORIGINS=http://localhost:5173
```

**Frontend** (`lexa-frontend/.env`):
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-key
VITE_API_BASE_URL=http://localhost:3000/api
```

### 4. Start Development

**Terminal 1 - Backend:**
```bash
cd lexa-backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd lexa-frontend
npm run dev
```

**Terminal 3 - Seed Database (Optional):**
```bash
cd lexa-backend
npm run seed
```

### 5. Open in Browser

Visit: `http://localhost:5173`

✅ **Done!** You now have a fully functional AI chat application.

---

## 🔐 Getting Credentials

### MongoDB Atlas

1. Go to [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Create free account
3. Create cluster (M0 is free)
4. Click "Connect" → "Connect application"
5. Copy connection string
6. Replace `<username>`, `<password>`, `<database>`
7. Paste into `MONGO_URI`

### Supabase

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Go to Settings → API
4. Copy `Project URL` → `VITE_SUPABASE_URL`
5. Copy `anon public` key → `VITE_SUPABASE_ANON_KEY`
6. Copy `service_role` key → `VITE_SUPABASE_PUBLISHABLE_KEY`

### Anthropic API Key

1. Go to [anthropic.com](https://anthropic.com)
2. Create account
3. Go to API keys
4. Create new key
5. Copy key → `ANTHROPIC_API_KEY`

---

## 📚 Documentation Guide

### New to the Project?
→ Start with [README.md](./README.md)

### Setting Up?
→ Read [SETUP_GUIDE.md](./SETUP_GUIDE.md)

### Going to Production?
→ Check [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

### Need Quick Commands?
→ Use [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)

### Project Complete?
→ See [COMPLETION_SUMMARY.md](./COMPLETION_SUMMARY.md)

---

## 🎯 What You Get

After setup, you'll have:

✅ Real-time AI chat interface  
✅ Conversation history  
✅ User authentication  
✅ Voice input/output support (ready)  
✅ Responsive design (mobile/desktop)  
✅ Rate limiting & usage tracking  
✅ Production-ready backend  
✅ Modern React frontend  

---

## 🐛 Troubleshooting

### "Cannot find module"
```bash
# Clear and reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### "Port 3000 already in use"
```bash
# Find and kill process
lsof -i :3000          # macOS/Linux
netstat -ano | findstr :3000  # Windows
```

### "MongoDB connection failed"
- Check `MONGO_URI` is correct
- Check username/password
- Check whitelist IP in MongoDB Atlas

### "Supabase auth failed"
- Check `VITE_SUPABASE_URL` is correct
- Check Supabase keys
- Ensure keys match between backend/frontend

### "API not responding"
- Check backend is running (`npm run dev`)
- Check `VITE_API_BASE_URL` is correct
- Check CORS_ORIGINS includes frontend URL

**For more help**, see [SETUP_GUIDE.md](./SETUP_GUIDE.md#troubleshooting)

---

## 💡 First Steps After Setup

1. **Explore the UI**
   - Try sending a message
   - Check if response streams in real-time
   - View conversation history

2. **Check the Code**
   - Review `lexa-backend/src/server.ts`
   - Check `lexa-frontend/src/pages/Index.tsx`
   - Study `lexa-frontend/src/hooks/useChat.ts`

3. **Test Features**
   - Create new conversation
   - Delete a conversation
   - Try authentication flow

4. **Customize**
   - Change UI colors (Tailwind)
   - Modify system prompt
   - Add custom instructions

5. **Deploy** (when ready)
   - Follow [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
   - Choose hosting (Railway, Vercel, etc)
   - Set up CI/CD

---

## 🎓 Learning Path

### Week 1: Understand the Project
- [ ] Read all documentation
- [ ] Run locally and explore
- [ ] Understand architecture
- [ ] Review API endpoints

### Week 2: Explore Code
- [ ] Study backend structure
- [ ] Understand frontend hooks
- [ ] Review component patterns
- [ ] Check database schemas

### Week 3: Make Changes
- [ ] Customize styling
- [ ] Add small features
- [ ] Modify system prompt
- [ ] Experiment with code

### Week 4: Deploy
- [ ] Follow deployment guide
- [ ] Choose hosting platform
- [ ] Deploy to production
- [ ] Configure monitoring

---

## 🚀 Common Customizations

### Change App Name
Find and replace "Lexa" with your app name in:
- Frontend components
- Backend responses
- Documentation

### Change Primary Color
In `lexa-frontend/tailwind.config.ts`:
```typescript
theme: {
  colors: {
    primary: '#your-color',
  }
}
```

### Add Custom System Prompt
In `lexa-frontend/src/components/chat/ChatHeader.ts`:
```typescript
export const getPersonalityPrompt = (personality: string) => {
  const prompts: Record<string, string> = {
    custom: "Your custom prompt here..."
  };
  return prompts[personality] || prompts.professional;
};
```

### Add API Endpoint
In `lexa-backend/src/routes/chat.ts`:
```typescript
chatRouter.post('/your-endpoint', async (c) => {
  // Your logic
  return c.json({ result: 'success' });
});
```

---

## 📞 Getting Help

1. **Check Documentation**
   - [README.md](./README.md)
   - [SETUP_GUIDE.md](./SETUP_GUIDE.md)
   - [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)

2. **Search Issues**
   - Look for similar problems on GitHub
   - Check error messages carefully

3. **Review Code Comments**
   - Comments explain complex logic
   - Type definitions show parameters

4. **Try Similar Solutions**
   - Search for similar issues online
   - Check framework documentation
   - Review code patterns

5. **Post an Issue**
   - Provide error message
   - Include setup details
   - Share relevant code

---

## ✅ Success Checklist

- [ ] Setup script ran successfully
- [ ] Environment variables configured
- [ ] Backend server running on port 3000
- [ ] Frontend running on port 5173
- [ ] Can access app at http://localhost:5173
- [ ] Can send a chat message
- [ ] Response appears in real-time
- [ ] Conversation saves in history
- [ ] No CORS errors
- [ ] Database connection works

If all checked ✅, you're ready to go!

---

## 🎉 Next Actions

### For Learning
- Study the code structure
- Review component patterns
- Understand hook usage
- Learn about the API

### For Customization
- Modify styling
- Add features
- Change prompts
- Integrate services

### For Deployment
- Choose hosting
- Configure environment
- Deploy backend
- Deploy frontend
- Test in production

### For Production
- Set up monitoring
- Enable analytics
- Configure backups
- Plan scaling

---

## 📊 Project Stats

- **Backend**: ~2,000 lines of TypeScript
- **Frontend**: ~5,000 lines of TypeScript/React
- **Components**: 40+
- **API Endpoints**: 5+
- **Hooks**: 20+
- **Database Models**: 5+
- **Documentation**: 10,000+ words

---

## 🎯 Recommended Workflow

```
1. Setup & Run Locally
   ↓
2. Explore Codebase
   ↓
3. Make Small Customizations
   ↓
4. Add Features Gradually
   ↓
5. Test Thoroughly
   ↓
6. Deploy to Production
   ↓
7. Monitor & Iterate
```

---

## 🤝 Contributing

Want to improve Lexa? Great!

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

---

## 📄 Files You'll Use Most

- `lexa-backend/src/server.ts` - Backend main file
- `lexa-backend/src/routes/chat.ts` - Chat API routes
- `lexa-frontend/src/App.tsx` - Frontend router
- `lexa-frontend/src/pages/Index.tsx` - Chat page
- `lexa-frontend/src/hooks/useChat.ts` - Chat logic hook
- `lexa-frontend/src/lib/streaming.ts` - Streaming utilities

---

## 🎓 Pro Tips

1. **Use VS Code** for best developer experience
2. **Install ES7+ snippets** extension
3. **Use Postman** for API testing
4. **Monitor logs** closely during development
5. **Test on mobile** early and often
6. **Use browser DevTools** extensively
7. **Keep environment variables safe**
8. **Backup database regularly**

---

## 🚀 Ready to Launch?

Once you're comfortable:

1. Review [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
2. Choose hosting provider
3. Set up production environment
4. Deploy with confidence!

---

**Created**: May 29, 2026  
**Version**: 1.0.0  
**Status**: Ready to Use ✅

Welcome aboard! Happy coding! 🎉
