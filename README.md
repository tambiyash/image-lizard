# 🦎 ImageIguana

![ImageIguana Logo](https://via.placeholder.com/1200x300/10b981/ffffff?text=ImageIguana)

## 🎯 Project Objective

ImageIguana is an AI-powered image generation platform that allows users to create stunning visuals using various AI models. The platform offers different models with varying capabilities, a credit-based system for generating images, and a gallery to view and manage created images.

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
- **Vercel AI SDK** - AI model integration
- **Fal.ai** - AI image generation models
  - fast-sdxl
  - recraft-v3
  - stable-diffusion-3.5-large

### Deployment & Infrastructure
- **Vercel** - Hosting and deployment
- **Environment Variables** - Configuration management

## 🚀 Local Setup

### Prerequisites
- Node.js 18+ and npm/yarn
- Supabase account
- Fal.ai API key

### Step 1: Clone the repository
```bash
git clone https://github.com/yourusername/imageiguana.git
cd imageiguana
nvm use
```

I'll format the README file to make it more organized and visually appealing in preview:

```markdown project="ImageIguana" file="README.md"
...
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


## 📋 Implementation Plan

### 1. Project Setup and Configuration

- Initialize Next.js project with TypeScript
- Set up Tailwind CSS and shadcn/ui components
- Configure Supabase client
- Set up environment variables
- Create basic layout with header and responsive design


### 2. Database Design and Setup

- Create database schema:

- `profiles` table extending Supabase auth
- `images` table for storing generated images
- `transactions` table for credit purchases



- Implement Row Level Security (RLS) policies:

- Users can only view/modify their own data
- Admins have broader access



- Create triggers for user signup to automatically create profiles
- Set up database diagnostics and admin tools for troubleshooting


### 3. Authentication System

- Implement user signup with email/password
- Create login functionality
- Set up auth context provider for global state management
- Create protected routes that require authentication
- Implement profile management (update name, username)
- Add password change functionality


### 4. Credit System

- Design credit packages with different tiers
- Implement credit purchase flow
- Create transaction recording system
- Set up credit balance management
- Add credit usage tracking
- Implement credit deduction for image generation


### 5. Image Generation

- Integrate Fal.ai API for image generation
- Implement model selection (Iguana Fast, Sketch, Pro)
- Create image generation UI with prompt input
- Add prompt enhancement features
- Implement loading states and progress indicators
- Create skeleton loading UI for image generation
- Add image count selection (1, 2, or 4 images)
- Implement generation cancellation


### 6. Gallery and Image Management

- Create image storage system
- Implement gallery view with filtering by model
- Add image download functionality
- Create image metadata display
- Implement responsive image grid
- Add pagination or infinite scroll


### 7. UI/UX Design

- Design responsive layouts for all pages
- Create dashboard with usage statistics
- Implement mobile navigation with slide-out menu
- Design loading states and skeletons
- Create error handling UI
- Add tooltips and help text


### 8. Deployment and Testing

- Set up Vercel deployment
- Configure production environment variables
- Test all features across different devices
- Optimize performance and loading times
- Implement error logging


## 📝 Additional Information

### Project Structure

```plaintext
/app                  # Next.js App Router pages
  /admin              # Admin tools and diagnostics
    /check-connection # Database connection checker
    /db-diagnostics   # Database diagnostics tool
    /execute-sql      # SQL execution tool (dev only)
    /setup            # Database setup tool
  /api                # API routes
    /check-connection # API for checking DB connection
    /db-diagnostics   # API for DB diagnostics
    /execute-sql      # API for executing SQL
    /generate-image   # API for generating images
    /images           # API for image CRUD operations
    /setup-database   # API for setting up database
    /transactions     # API for transaction operations
  /checkout           # Checkout flow
    /success          # Checkout success page
  /dashboard          # User dashboard
  /gallery            # Image gallery
  /login              # Login page
  /playground         # Image generation playground
  /settings           # User settings
  /signup             # Signup page
/components           # Reusable React components
  /ui                 # UI components from shadcn/ui
  /credit-package-card # Credit package component
  /dashboard-layout   # Layout for dashboard pages
  /header             # Site header with navigation
  /image-card         # Image display component
  /image-skeleton     # Skeleton loader for images
  /logo               # Site logo component
  /mobile-nav         # Mobile navigation component
  /model-card         # AI model selection card
  /sidebar            # Dashboard sidebar navigation
/context              # React context providers
  /auth-context.tsx   # Authentication context
/lib                  # Utility functions and services
  /constants.ts       # Application constants
  /db.ts              # Database utilities
  /image-service.ts   # Image generation service
  /payment-service.ts # Payment processing service
  /supabase.ts        # Supabase client
  /utils.ts           # General utilities
/types                # TypeScript type definitions
  /index.ts           # Type definitions
/public               # Static assets
```

### API Endpoints

- `/api/images` - CRUD operations for images

- `GET` - Retrieve user's images
- `POST` - Save a generated image



- `/api/transactions` - Create and retrieve transactions

- `GET` - Get user's transaction history
- `POST` - Create a new transaction



- `/api/generate-image` - Generate images with AI

- `POST` - Generate image with specified model and prompt



- `/api/setup-database` - Set up database schema

- `POST` - Create tables, policies, and triggers



- `/api/check-connection` - Check database connection

- `GET` - Verify Supabase connection





### Credit System

The platform uses a credit-based system where:

- Users start with 16 free credits upon signup
- Different models cost different amounts of credits:

- Iguana Fast: 4 credits per image
- Iguana Sketch: 32 credits per image
- Iguana Pro: 63 credits per image



- Credits can be purchased in packages:

- Starter: 50 credits for $5
- Popular: 150 credits for $12
- Professional: 400 credits for $29
- Studio: 1000 credits for $59



- Transactions are recorded for all credit purchases
- Credits are deducted immediately upon successful image generation


### AI Models

- **Iguana Fast** (fast-sdxl)

- Quick generation, versatile style
- 4 credits per image
- Good for rapid prototyping and general use



- **Iguana Sketch** (recraft-v3)

- Detailed illustrations and concept art
- 32 credits per image
- Specialized for artistic and design work



- **Iguana Pro** (stable-diffusion-3.5-large)

- Ultra-realistic, professional quality
- 63 credits per image
- Best for final, production-ready images





### Responsive Design

The application is fully responsive with:

- Desktop layout with sidebar navigation
- Mobile layout with hamburger menu and slide-out navigation
- Adaptive image grid layouts
- Touch-friendly controls
- Responsive form elements


### Development Tools

- Use the admin tools at `/admin/db-diagnostics` to check database status
- Execute custom SQL at `/admin/execute-sql` (development only)
- Check connection status at `/admin/check-connection`
- Set up database at `/admin/setup`


### Authentication Flow

1. User signs up with email, password, and full name
2. Supabase creates an auth record
3. Database trigger creates a profile record with 16 free credits
4. User can log in with email and password
5. Auth context maintains user state throughout the application


### Image Generation Flow

1. User selects a model and enters a prompt
2. User chooses number of images to generate (1, 2, or 4)
3. System calculates total credit cost
4. User initiates generation
5. Progress is tracked in real-time
6. Generated images are saved to the database
7. Credits are deducted from user's balance
8. Images appear in the user's gallery


### Error Handling

- Form validation for all user inputs
- API error handling with user-friendly messages
- Database connection error detection
- Image generation error recovery
- Credit balance validation before generation


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