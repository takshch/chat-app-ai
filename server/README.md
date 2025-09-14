# ViralLens API Server

A modern Node.js Express.js server built with TypeScript for the ViralLens application.

## Features

- 🚀 **Direct TypeScript execution** - No compilation step needed, runs like Bun
- 🔧 **Zero configuration** - Works out of the box with tsx
- 🛡️ **Type safety** - Full TypeScript support with strict type checking
- 🧹 **Clean code** - ESLint configured for code quality
- 🔐 **Authentication** - JWT-based authentication system with HTTP-only cookies
- ⚙️ **Environment Management** - Type-safe environment variables with ts-dotenv
- 📝 **API endpoints** - RESTful API with proper error handling
- 🗄️ **MongoDB Integration** - Mongoose ORM with proper schema validation

## Quick Start

### Option 1: Manual Docker Setup

```bash
# Start the entire stack
npm run docker:up

# View logs
npm run docker:logs

# Stop services
npm run docker:down
```

### Option 2: Local Development Setup

#### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your configuration
# Make sure to set MONGODB_URI to your MongoDB connection string
```

### Development

```bash
# Start development server with hot reload
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix
```

### Production

```bash
# Start production server
npm start
```

## Available Scripts

- `npm run dev` - Start development server with hot reload using tsx
- `npm start` - Start production server
- `npm run type-check` - Run TypeScript type checking without emitting files
- `npm run lint` - Run ESLint to check code quality
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run build` - Build the project (for production deployment)
- `npm run clean` - Remove build artifacts

## Project Structure

```
src/
├── middleware/          # Express middleware
│   └── auth.ts         # Authentication middleware
├── models/             # Data models
│   ├── User.ts         # User model
│   └── Chat.ts         # Chat model
├── routes/             # API routes
│   ├── auth.ts         # Authentication routes
│   └── chat.ts         # Chat routes
├── types/              # TypeScript type definitions
│   ├── user.ts         # User types and schemas
│   └── chat.ts         # Chat types and schemas
└── server.ts           # Main server file
```

## API Endpoints

### Authentication

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login (sets HTTP-only cookie)
- `POST /api/auth/logout` - User logout (clears HTTP-only cookie)
- `GET /api/auth/me` - Get current user profile
- `GET /api/auth/verify` - Verify JWT token

### Chat

- `POST /api/chat/send` - Send message (creates new chat if no chatId provided)
- `GET /api/chat/history/:chatId` - Get chat history
- `GET /api/chat/chats` - Get all chats for sidebar
- `PATCH /api/chat/:chatId/title` - Update chat title
- `DELETE /api/chat/:chatId` - Delete chat

### Cookie Authentication

The authentication system uses HTTP-only cookies for enhanced security:

- **Default Configuration**: Cookies are set for `localhost` domain with `SameSite=lax` and `Secure=false`
- **Customizable**: All cookie settings can be configured via environment variables
- **Fallback**: The system also supports Authorization header tokens for API clients
- **Security**: HTTP-only cookies prevent XSS attacks by making tokens inaccessible to JavaScript

### Health Check

- `GET /health` - Server health check

## Environment Variables

Create a `.env` file with the following variables:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# CORS Configuration
CLIENT_URL=http://localhost:3000

# Cookie Configuration
COOKIE_DOMAIN=localhost
COOKIE_SECURE=false
COOKIE_SAME_SITE=lax

# OpenRouter Configuration (for AI chat responses)
OPENROUTER_API_KEY=your-openrouter-api-key-here
OPENROUTER_MODEL=meta-llama/llama-3.2-3b-instruct:free
```

## Technology Stack

- **Runtime**: Node.js with tsx for direct TypeScript execution
- **Framework**: Express.js
- **Language**: TypeScript with strict type checking
- **Database**: MongoDB with Mongoose ORM
- **Authentication**: JWT with bcrypt for password hashing and HTTP-only cookies
- **Environment**: Type-safe environment variables with ts-dotenv
- **AI Integration**: OpenRouter API with Llama models for chat responses
- **Validation**: Zod for schema validation
- **Code Quality**: ESLint with TypeScript rules

## Docker Setup

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (20.10+) - Install Docker Desktop or Docker Engine
- [Docker Compose](https://docs.docker.com/compose/install/) (2.0+) - Usually included with Docker Desktop

**Quick Installation Links:**
- **Windows/Mac**: [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- **Linux**: [Docker Engine](https://docs.docker.com/engine/install/)
- **Docker Compose**: [Installation Guide](https://docs.docker.com/compose/install/)

### Available Scripts

```bash
# Production Docker commands
npm run docker:build    # Build Docker images
npm run docker:up       # Start services in background
npm run docker:down     # Stop services
npm run docker:logs     # View logs
npm run docker:restart  # Restart services
npm run docker:clean    # Clean up everything

# Development Docker commands (with hot reload)
npm run docker:dev         # Start development environment
npm run docker:dev:build   # Build development images
npm run docker:dev:down    # Stop development environment
npm run docker:dev:logs    # View development logs
```

### Quick Start Commands

**For Development:**
```bash
npm run docker:dev
```

**For Production:**
```bash
npm run docker:up
```

### Docker Services

- **API Server** (Port 3001): Node.js/Express server with TypeScript
- **MongoDB** (Port 27017): Database with authentication and initialization
- **Networking**: Services communicate via Docker network

### Environment Variables (Docker)

The Docker setup includes these pre-configured environment variables:

```env
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb://app_user:app_password@mongodb:27017/virallens?authSource=virallens
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
COOKIE_DOMAIN=localhost
COOKIE_SECURE=false
COOKIE_SAME_SITE=lax
```

### Docker Volumes

- `mongodb_data`: Persistent MongoDB data storage
- Source code is mounted in development mode for hot reload

## MongoDB Setup

### Docker MongoDB (Recommended)

The Docker setup automatically configures MongoDB with:
- Authentication enabled
- Database initialization scripts
- Proper user permissions
- Data persistence

**No local MongoDB installation required** - everything runs in Docker containers.

### MongoDB Atlas (Cloud Alternative)

If you prefer cloud MongoDB instead of Docker:
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in your `.env` file

### Database Schema

The application uses the following MongoDB collections:

- **users**: Stores user authentication data with email, password hash, and profile information
- **chats**: Stores chat conversations with messages, titles, and user associations

## Development Experience

This setup provides a seamless development experience similar to Bun:

- ✅ No compilation step required
- ✅ Direct TypeScript execution
- ✅ Hot reload in development
- ✅ Type safety throughout
- ✅ Clean, linted code
- ✅ No generated .js files to manage
- ✅ MongoDB integration with Mongoose ORM

## Contributing

1. Make sure your code passes linting: `npm run lint`
2. Ensure TypeScript compilation is successful: `npm run type-check`
3. Test your changes thoroughly
4. Follow the existing code style and patterns

## License

ISC
