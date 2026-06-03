#!/bin/bash

# Lexa AI - Setup Script
# This script sets up both backend and frontend for development

set -e  # Exit on error

echo "🤖 Lexa AI - Setup Script"
echo "=========================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js
echo ""
echo -e "${YELLOW}Checking Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js 18+${NC}"
    exit 1
fi

NODE_VERSION=$(node -v)
echo -e "${GREEN}✅ Node.js ${NODE_VERSION}${NC}"

# Setup Backend
echo ""
echo -e "${YELLOW}Setting up Backend...${NC}"
cd lexa-backend

if [ ! -f ".env" ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo -e "${YELLOW}⚠️  Please update lexa-backend/.env with your credentials${NC}"
fi

echo "Installing dependencies..."
npm install

cd ..

# Setup Frontend
echo ""
echo -e "${YELLOW}Setting up Frontend...${NC}"
cd lexa-frontend

if [ ! -f ".env" ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo -e "${YELLOW}⚠️  Please update lexa-frontend/.env with your credentials${NC}"
fi

echo "Installing dependencies..."
npm install

cd ..

echo ""
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Update environment variables:"
echo "   - lexa-backend/.env"
echo "   - lexa-frontend/.env"
echo ""
echo "2. Start development servers:"
echo "   Terminal 1: cd lexa-backend && npm run dev"
echo "   Terminal 2: cd lexa-frontend && npm run dev"
echo ""
echo "3. Open http://localhost:5173 in your browser"
echo ""
echo "For detailed setup, see SETUP_GUIDE.md"
