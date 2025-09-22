# Remixable Deployment Guide

## Prerequisites

- Node.js 18+ and npm
- GitHub account
- Vercel account (for deployment)
- Supabase account (for backend features)

## Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd remixable
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open browser**
   Navigate to `http://localhost:8080`

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# AI Integration
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key

# Supabase (via Lovable integration)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Farcaster Integration
FARCASTER_APP_ID=your_farcaster_app_id
FARCASTER_WEBHOOK_SECRET=your_webhook_secret

# Base Chain Integration
BASE_RPC_URL=https://mainnet.base.org
BASE_CHAIN_ID=8453
```

## Deployment to Vercel

### Automatic Deployment (Recommended)

1. **Connect GitHub to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Build Settings**
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "dist",
     "framework": "vite"
   }
   ```

3. **Set Environment Variables**
   - In Vercel dashboard, go to Project Settings > Environment Variables
   - Add all the environment variables from `.env.local`

4. **Deploy**
   - Vercel will automatically deploy on every push to main branch
   - Your app will be available at `https://your-project.vercel.app`

### Manual Deployment

1. **Build for production**
   ```bash
   npm run build
   ```

2. **Deploy with Vercel CLI**
   ```bash
   npm i -g vercel
   vercel --prod
   ```

## GitHub CI/CD Setup

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build project
        run: npm run build
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## Supabase Integration

### Using Lovable's Native Integration

1. **Connect Supabase in Lovable**
   - Click the green Supabase button in the Lovable interface
   - Follow the setup wizard to connect your Supabase project

2. **Enable Required Features**
   - Authentication (Email/Password)
   - Database (for storing app templates and user data)
   - Storage (for generated app assets)
   - Edge Functions (for AI generation endpoints)

### Manual Supabase Setup

1. **Create Supabase Project**
   - Go to [Supabase Dashboard](https://supabase.com/dashboard)
   - Create new project

2. **Set up Database Tables**
   ```sql
   -- Users table (handled by Supabase Auth)
   
   -- Generated Apps table
   CREATE TABLE generated_apps (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES auth.users(id),
     title TEXT NOT NULL,
     description TEXT,
     template_id TEXT,
     prompt TEXT,
     generated_code JSONB,
     published_url TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   
   -- App Templates table
   CREATE TABLE app_templates (
     id TEXT PRIMARY KEY,
     title TEXT NOT NULL,
     description TEXT,
     category TEXT NOT NULL,
     prompt TEXT NOT NULL,
     features TEXT[],
     difficulty TEXT DEFAULT 'beginner',
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

3. **Set up Row Level Security (RLS)**
   ```sql
   -- Enable RLS
   ALTER TABLE generated_apps ENABLE ROW LEVEL SECURITY;
   ALTER TABLE app_templates ENABLE ROW LEVEL SECURITY;
   
   -- Policies
   CREATE POLICY "Users can view their own apps" ON generated_apps
     FOR SELECT USING (auth.uid() = user_id);
   
   CREATE POLICY "Users can create their own apps" ON generated_apps
     FOR INSERT WITH CHECK (auth.uid() = user_id);
   
   CREATE POLICY "Anyone can view templates" ON app_templates
     FOR SELECT USING (true);
   ```

## Farcaster Mini App Integration

### Frame Configuration

1. **Set up Frame Endpoints**
   Create API routes in your deployment:
   - `/api/frame/build` - Handle app generation requests
   - `/api/frame/templates` - Show template selection
   - `/api/frame/preview` - Display generated app preview

2. **Configure Farcaster Manifest**
   The `.well-known/farcaster.json` file is already configured.
   Update the URLs to match your deployed domain.

3. **Test Frame Integration**
   - Use [Frame Validator](https://warpcast.com/~/developers/frames) to test
   - Deploy to production and test in Farcaster clients

## Custom Domain Setup

1. **Add Domain in Vercel**
   - Go to Project Settings > Domains
   - Add your custom domain
   - Configure DNS records as instructed

2. **Update Farcaster Manifest**
   - Update URLs in `.well-known/farcaster.json`
   - Redeploy to apply changes

## Monitoring & Analytics

### Vercel Analytics
- Enable in Project Settings > Analytics
- View performance metrics and usage

### Error Monitoring
Consider integrating:
- Sentry for error tracking
- LogRocket for user session replay
- PostHog for product analytics

## Performance Optimization

1. **Image Optimization**
   - Use Vercel's Image Optimization
   - Implement lazy loading for generated previews

2. **Caching Strategy**
   - Cache AI-generated responses
   - Implement Redis for session data

3. **Bundle Optimization**
   - Code splitting for large templates
   - Tree shake unused dependencies

## Security Considerations

1. **API Rate Limiting**
   - Implement rate limiting for AI generation
   - Use Vercel Edge Config for limits

2. **Input Validation**
   - Sanitize all user inputs
   - Validate prompts before AI processing

3. **CORS Configuration**
   - Configure proper CORS for Frame integration
   - Whitelist allowed origins

## Scaling Considerations

1. **Database Scaling**
   - Monitor Supabase usage
   - Consider read replicas for high traffic

2. **AI API Limits**
   - Implement queue system for generation
   - Use multiple AI providers for redundancy

3. **CDN Integration**
   - Use Vercel's Edge Network
   - Cache static assets globally

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed

2. **Environment Variables**
   - Ensure all required vars are set
   - Check variable names match exactly

3. **Farcaster Integration**
   - Verify manifest JSON is valid
   - Check Frame endpoints return correct format

4. **AI Generation Errors**
   - Monitor API key limits
   - Implement fallback models

### Debug Mode

Enable debug logging:
```bash
DEBUG=remixable:* npm run dev
```

## Support

- GitHub Issues: [Your Repository Issues]
- Discord: [Community Discord]
- Documentation: [docs.remixable.ai]

## License

MIT License - see LICENSE file for details.