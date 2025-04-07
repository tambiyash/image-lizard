# ImageVivid

## 🎯 Project Objective

ImageVivid is an AI-powered image generation platform that allows users to create stunning visuals using various AI models. The platform offers different models with varying capabilities, a credit-based system for generating images, and a gallery to view and manage created images.

**Key Features:**
- 🖼️ Generate images using multiple AI models with different styles and capabilities
- 💳 Credit-based system with various purchase options
- 🗂️ Personal gallery to view and manage generated images
- 👤 User authentication and profile management
- 📱 Responsive design for all devices
- 🔄 Real-time progress tracking during image generation
- 🎨 Auto-enhance feature for optimizing prompts
- 📊 Dashboard with usage statistics and recent activity
- 💾 Automatic image saving to personal gallery
- 🔍 Filter images by model type in gallery

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **React** - UI library
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Reusable UI components
- **Lucide React** - Icon library
- **React Context API** - State management

### Backend & Data
- **Supabase** - Backend-as-a-Service
  - Authentication with email/password
  - PostgreSQL database
  - Row Level Security (RLS)
  - Database triggers for user creation
- **Fal.ai** - AI image generation models

### Deployment & Infrastructure
- **Vercel** - Hosting and deployment
- **Environment Variables** - Configuration management

## 🚀 Local Setup

### Prerequisites
- Node.js 18+ and npm/yarn
- Supabase account
- Fal.ai API key
See `.env-example` file

### Step 1: Clone the repository
```bash
git clone https://github.com/tambiyash/image-vivid.git
cd image-vivid
nvm use
```

### Step 2: Install dependencies

```shellscript
npm install
# or
yarn install
```

### Step 3: Set up environment variables

Create a `.env.local` file in the root directory with the following variables:

```plaintext
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
FAL_API_KEY=your_fal_ai_api_key
```

### Step 4: Set up the database

1. Run the database setup script by visiting `/admin/setup` in the browser after starting the development server
2. Verify the database connection at `/admin/check-connection`
3. Check database diagnostics at `/admin/db-diagnostics`


The setup will create the following tables:

- `profiles` - User profiles linked to Supabase auth
- `images` - Generated images with metadata
- `transactions` - Credit purchase records


### Step 5: Run the development server

```shellscript
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Step 6: Create a test user

1. Visit [http://localhost:3000/signup](http://localhost:3000/signup)
2. Create an account with email and password
3. New users automatically receive 16 free credits


## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Contributors

- Your Name - Initial work - [YourGitHub](https://github.com/yourusername)


## 🙏 Acknowledgments

- [Vercel](https://vercel.com) for hosting
- [Supabase](https://supabase.com) for backend services
- [Fal.ai](https://fal.ai) for AI image generation
- [shadcn/ui](https://ui.shadcn.com) for UI components
- [Lucide React](https://lucide.dev) for icons