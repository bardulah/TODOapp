# AI Todo App - Smart Task Management

A modern, intelligent todo list application powered by AI. Built with Next.js 15, TypeScript, Prisma, and integrations with multiple AI providers (Gemini, OpenRouter, Groq).

## Features

### Core Functionality
- **Task Management**: Create, read, update, and delete tasks with ease
- **Priority System**: P1 (Urgent) to P4 (Low) priority levels with visual indicators
- **Time Management**: Due dates and time estimates for better planning
- **Status Tracking**: Todo, In Progress, and Completed statuses
- **Categories**: Organize tasks into custom categories
- **Subtasks**: Break down complex tasks into manageable steps

### AI-Powered Features
- **Natural Language Input**: Create tasks using natural language (e.g., "Buy milk tomorrow P1")
- **Smart Recommendations**: Get AI suggestions for prioritizing and organizing tasks
- **Task Brainstorming**: Generate subtasks and action items for complex projects
- **Task Rewriting**: Improve task clarity with AI-powered rewriting
- **Intelligent Parsing**: Automatically extract priority, due dates, and time estimates from natural language

### Multi-Provider AI Support
- **Google Gemini** (gemini-2.0-flash-exp)
- **OpenRouter** (access to GPT-4o-mini and other models)
- **Groq** (llama-3.3-70b-versatile)

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Database**: SQLite (development) / PostgreSQL (production)
- **ORM**: Prisma
- **Authentication**: NextAuth.js v5
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **AI Integration**: Google Generative AI, OpenAI SDK

## Getting Started

### Prerequisites

- Node.js 18+ installed
- An API key for at least one AI provider:
  - [Google Gemini API Key](https://makersuite.google.com/app/apikey)
  - [OpenRouter API Key](https://openrouter.ai/keys)
  - [Groq API Key](https://console.groq.com/keys)
- (Optional) GitHub OAuth App or Google OAuth credentials for authentication

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd todoapp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your API keys:
   ```env
   # Database (SQLite for dev, PostgreSQL for production)
   DATABASE_URL="file:./dev.db"

   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"

   # AI Providers (at least one required)
   GEMINI_API_KEY="your-gemini-api-key"
   OPENROUTER_API_KEY="your-openrouter-api-key"
   GROQ_API_KEY="your-groq-api-key"

   # OAuth (optional but recommended)
   GITHUB_ID="your-github-oauth-app-id"
   GITHUB_SECRET="your-github-oauth-app-secret"
   GOOGLE_CLIENT_ID="your-google-oauth-client-id"
   GOOGLE_CLIENT_SECRET="your-google-oauth-client-secret"
   ```

4. **Generate NextAuth secret**
   ```bash
   openssl rand -base64 32
   ```
   Copy the output to `NEXTAUTH_SECRET` in your `.env` file.

5. **Set up the database**
   ```bash
   npm run db:push
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## Setting Up OAuth Authentication

### GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in:
   - Application name: "AI Todo App"
   - Homepage URL: `http://localhost:3000` (for dev) or your production URL
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Copy the Client ID and generate a Client Secret
5. Add them to your `.env` file

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client IDs
5. Configure the OAuth consent screen
6. Add authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
7. Copy the Client ID and Client Secret to your `.env` file

## Deployment

### Vercel (Recommended)

1. **Push your code to GitHub**

2. **Import to Vercel**
   - Go to [Vercel](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

3. **Configure environment variables**
   - Add all environment variables from your `.env` file
   - For production, use a PostgreSQL database (Vercel Postgres recommended)

4. **Update database configuration**

   In `prisma/schema.prisma`, change:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

5. **Deploy**
   - Vercel will automatically build and deploy your app
   - The build command includes `prisma generate` automatically

### VPS Deployment

1. **Set up your server** (Ubuntu example)
   ```bash
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # Install PostgreSQL
   sudo apt-get install postgresql postgresql-contrib
   ```

2. **Clone and build**
   ```bash
   git clone <your-repo-url>
   cd todoapp
   npm install
   npm run build
   ```

3. **Set up environment variables**
   ```bash
   nano .env
   # Add your production environment variables
   ```

4. **Run with PM2** (process manager)
   ```bash
   npm install -g pm2
   pm2 start npm --name "todo-app" -- start
   pm2 startup
   pm2 save
   ```

5. **Set up Nginx** (reverse proxy)
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

6. **SSL with Let's Encrypt**
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

## Database Management

```bash
# Push schema changes to database
npm run db:push

# Open Prisma Studio (database GUI)
npm run db:studio

# Generate Prisma Client
npx prisma generate
```

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/         # NextAuth routes
│   │   ├── tasks/        # Task CRUD operations
│   │   └── ai/           # AI features
│   ├── auth/             # Authentication pages
│   └── page.tsx          # Main dashboard
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   └── tasks/            # Task-specific components
├── lib/                   # Utility functions
│   ├── ai/               # AI service layer
│   ├── db.ts             # Data access layer
│   └── utils.ts          # Helper functions
├── prisma/               # Database schema
│   └── schema.prisma
└── public/               # Static assets
```

## Usage Guide

### Creating Tasks

1. Click "New Task" button
2. Enter task title (try natural language like "Review PR tomorrow P1")
3. Click "AI Parse" to automatically extract priority and due date
4. Fill in additional details (description, time estimate, category)
5. Click "AI Rewrite" to improve task clarity
6. Click "Create Task"

### Using AI Features

1. Click "AI Assistant" button
2. Choose from:
   - **Smart Recommendations**: Get prioritization suggestions for all tasks
   - **Brainstorm Task**: Break down complex tasks into subtasks

### Managing Tasks

- **Complete**: Click the circle icon next to a task
- **Edit**: Click the pencil icon
- **Delete**: Click the trash icon
- **Filter**: Use the filter buttons (All, Todo, In Progress, Completed)

## AI Provider Configuration

The app automatically uses the first available AI provider based on your environment variables:
1. Gemini (if `GEMINI_API_KEY` is set)
2. OpenRouter (if `OPENROUTER_API_KEY` is set)
3. Groq (if `GROQ_API_KEY` is set)

### Recommended Models

- **Gemini**: `gemini-2.0-flash-exp` (default) - Fast and cost-effective
- **OpenRouter**: `openai/gpt-4o-mini` (default) - Balanced performance
- **Groq**: `llama-3.3-70b-versatile` (default) - Very fast inference

## Troubleshooting

### Prisma Client not found
```bash
npx prisma generate
```

### Database connection issues
- Check your `DATABASE_URL` in `.env`
- Ensure PostgreSQL is running (if using PostgreSQL)
- For SQLite, ensure the directory is writable

### AI features not working
- Verify your API keys are correctly set in `.env`
- Check the browser console for error messages
- Ensure at least one AI provider API key is configured

### Build errors
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
npm run build
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

If you encounter any issues or have questions, please open an issue on GitHub.

---

Built with by AI Todo App Team
