# Setup & Deployment Guide

Complete setup instructions for Stark Interface - Real-Time 3D AI Assistant

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Development Setup](#development-setup)
3. [Configuration](#configuration)
4. [Database Setup](#database-setup)
5. [Running Services](#running-services)
6. [Testing](#testing)
7. [Production Deployment](#production-deployment)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements

- **OS**: macOS, Linux, or Windows with WSL2
- **Memory**: Minimum 8GB RAM, 16GB recommended
- **Storage**: 5GB free disk space
- **Network**: Stable internet connection for API calls

### Required Software

- **Node.js**: 20.0.0 or higher
- **Bun**: 1.0.0 or higher (or npm/yarn alternative)
- **Docker**: 24.0.0 or higher (for containerized setup)
- **PostgreSQL**: 15.0 or higher (if not using Docker)
- **Redis**: 7.0 or higher (if not using Docker)

### API Keys Required

- **OpenAI**: https://platform.openai.com/api-keys (with Realtime API access)
- **Optional**: Deepgram, ElevenLabs, Tavily for enhanced features

## Development Setup

### Step 1: Clone Repository

```bash
git clone https://github.com/yourusername/stark-interface-main.git
cd stark-interface-main/stark-interface-main
```

### Step 2: Install Dependencies

Using Bun (recommended):
```bash
bun install
```

Or using npm:
```bash
npm install
```

### Step 3: Copy Environment File

```bash
cp .env.example .env.local
```

### Step 4: Configure Environment Variables

Edit `.env.local` and add your API keys:

```env
# Required
VITE_OPENAI_API_KEY=sk-your-key-here

# Optional - Backend services
DATABASE_URL=postgresql://dev:dev_password@localhost:5432/stark_db
REDIS_URL=redis://localhost:6379

# Frontend configuration
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
```

### Step 5: Start Development Server

```bash
bun run dev
```

The application will be available at `http://localhost:5173`

## Configuration

### Frontend Environment Variables

Create `.env.local` in the project root:

```env
# OpenAI Configuration
VITE_OPENAI_API_KEY=sk-...

# Environment
VITE_ENV=development
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001

# 3D Avatar
VITE_AVATAR_MODEL_URL=/models/avatar.glb
VITE_AVATAR_SCALE=1.5

# Voice Settings
VITE_VOICE_SPEED=1.0
VITE_VOICE_VOLUME=0.8
VITE_SAMPLE_RATE=24000

# Features
VITE_ENABLE_RAG=true
VITE_ENABLE_TOOLS=true
VITE_ENABLE_AUDIO_VISUALIZATION=true

# Memory
VITE_MAX_MESSAGES=1000
VITE_EMBEDDING_MODEL=text-embedding-3-small
```

### TypeScript Configuration

The project uses strict TypeScript with the following settings:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

## Database Setup

### Using Docker Compose (Recommended)

```bash
# Start all services including database
docker-compose up -d

# Verify services are running
docker-compose ps

# View logs
docker-compose logs -f
```

### Manual PostgreSQL Setup

```bash
# Create database
createdb -U postgres stark_db

# Install pgvector extension
psql -U postgres -d stark_db -c "CREATE EXTENSION IF NOT EXISTS vector"

# Run migrations (if applicable)
psql -U postgres -d stark_db < migrations/001_initial_schema.sql
```

### Redis Setup

```bash
# Using Docker
docker run -d -p 6379:6379 redis:7-alpine

# Or using Homebrew (macOS)
brew install redis
redis-server
```

## Running Services

### Local Development

Start all services at once:

```bash
docker-compose up -d
```

Or start individually:

```bash
# Terminal 1: Frontend dev server
bun run dev

# Terminal 2: Backend API (if applicable)
# cd server && python -m uvicorn main:app --reload

# Terminal 3: Monitor logs
docker-compose logs -f
```

### Development Commands

```bash
# Build production bundle
bun run build

# Type check
bun x tsc --noEmit

# Lint code
bun run lint

# Format code
bun x prettier --write src

# Run tests
bun run test

# Test watch mode
bun run test:watch
```

## Testing

### Run All Tests

```bash
bun run test
```

### Test Specific File

```bash
bun run test src/hooks/useRealtimeVoice.test.ts
```

### Test Coverage

```bash
bun run test --coverage
```

### Test Watch Mode

```bash
bun run test:watch
```

## Production Deployment

### Vercel Deployment (Recommended for Frontend)

1. **Connect GitHub Repository**
   - Push code to GitHub
   - Go to https://vercel.com/new
   - Select your repository

2. **Configure Build Settings**
   - Framework: Vite
   - Build command: `bun run build`
   - Output directory: `dist`

3. **Environment Variables**
   - Add all variables from `.env.local`
   - Set `VITE_ENV=production`

4. **Deploy**
   ```bash
   # Automatic on git push to main
   ```

### Self-Hosted Deployment

#### Using Docker

```bash
# Build image
docker build -t stark-interface:latest .

# Run container
docker run -p 3000:3000 \
  -e VITE_OPENAI_API_KEY=sk-... \
  -e VITE_API_URL=https://api.yourdomain.com \
  stark-interface:latest
```

#### Using Docker Compose (Production)

```bash
# Build all services
docker-compose build

# Start services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# View logs
docker-compose logs -f
```

#### Manual Deployment

```bash
# Build production bundle
bun run build

# Install production dependencies
bun install --prod

# Start server using Node
npm install -g serve
serve -s dist -l 3000

# Or with PM2
npm install -g pm2
pm2 start "serve -s dist -l 3000" --name stark-interface
pm2 save
pm2 startup
```

### Environment Variables for Production

```env
# Ensure these are set in production
VITE_ENV=production
VITE_OPENAI_API_KEY=sk-...
VITE_API_URL=https://api.yourdomain.com
VITE_WS_URL=wss://api.yourdomain.com
NODE_ENV=production
```

### SSL/TLS Setup

For production with HTTPS/WSS:

1. **Using Nginx**
   ```nginx
   server {
     listen 443 ssl http2;
     server_name yourdomain.com;
     
     ssl_certificate /path/to/cert.pem;
     ssl_certificate_key /path/to/key.pem;
     
     location / {
       proxy_pass http://localhost:3000;
     }
     
     location /ws {
       proxy_pass ws://localhost:3001;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection "upgrade";
     }
   }
   ```

2. **Using Certbot**
   ```bash
   certbot certonly --standalone -d yourdomain.com
   ```

## Troubleshooting

### Issue: WebRTC Connection Fails

**Symptoms**: Can't connect to voice API
**Solutions**:
```bash
# Check network connectivity
curl https://api.openai.com/v1/models

# Verify API key
echo $VITE_OPENAI_API_KEY

# Check firewall settings - ensure ports 3000-3001 are open
```

### Issue: Avatar Not Rendering

**Symptoms**: Black screen where avatar should be
**Solutions**:
```bash
# Ensure 3D model exists
ls public/models/avatar.glb

# Check browser console for WebGL errors
# (Press F12 → Console)

# Verify Three.js is loaded
```

### Issue: Audio Latency Too High

**Symptoms**: Delayed audio response
**Solutions**:
```bash
# Reduce sample rate in .env
VITE_SAMPLE_RATE=16000

# Check network latency
ping api.openai.com

# Ensure sufficient CPU resources
# Monitor: Task Manager → Performance
```

### Issue: Database Connection Error

**Symptoms**: "Connection refused" errors
**Solutions**:
```bash
# Check PostgreSQL is running
psql -U postgres -d stark_db -c "SELECT 1"

# Verify connection string
echo $DATABASE_URL

# Check database exists
createdb -U postgres stark_db

# Restart services
docker-compose restart postgres
```

### Issue: Out of Memory

**Symptoms**: Application crashes after ~30min
**Solutions**:
```bash
# Increase Node.js memory
NODE_OPTIONS=--max_old_space_size=4096 bun run dev

# Check for memory leaks in browser DevTools
# Chrome DevTools → Memory tab

# Clear old conversation history
# Settings → Clear Memory
```

## Performance Optimization

### Bundle Size

```bash
# Analyze bundle
bun x vite-plugin-visualizer

# Expected sizes
# initial bundle: ~2MB
# Three.js chunk: ~1.2MB
# UI components: ~600KB
```

### Database Optimization

```sql
-- Create indexes for faster queries
CREATE INDEX idx_messages_timestamp ON messages(timestamp DESC);
CREATE INDEX idx_messages_role ON messages(role);

-- Enable query caching in Redis
-- Set TTL on frequently accessed data
```

### Network Optimization

```bash
# Enable compression in production
# Nginx: gzip on; gzip_types text/javascript application/json;

# CDN configuration for static assets
# Point /models/* to CDN bucket
```

## Monitoring & Logging

### Application Logs

```bash
# View all logs
docker-compose logs

# Real-time logs
docker-compose logs -f app

# Specific service logs
docker-compose logs backend
```

### Error Tracking (Sentry)

```env
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

### Analytics

```env
VITE_POSTHOG_API_KEY=your-posthog-key
```

## Security Checklist

- [ ] All API keys stored in environment variables
- [ ] HTTPS/WSS enabled in production
- [ ] CORS properly configured
- [ ] Input validation on all forms
- [ ] Rate limiting enabled
- [ ] Database backups configured
- [ ] Access logs monitored
- [ ] Secrets not committed to git

## Support & Resources

- **Documentation**: See IMPLEMENTATION_GUIDE.md
- **Issues**: GitHub Issues
- **Community**: GitHub Discussions
- **Email**: support@starkinterface.dev

---

For more information, see the main README.md and IMPLEMENTATION_GUIDE.md
