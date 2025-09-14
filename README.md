# ViralLens - Full Stack AI Chat Application

A modern full-stack web application built with React, Node.js, Express, and MongoDB Atlas for AI-powered chat functionality.

## 🏗️ Architecture

- **Frontend**: React 19 with TypeScript, Tailwind CSS
- **Backend**: Node.js with Express, TypeScript
- **Database**: MongoDB Atlas (Cloud)
- **AI Integration**: OpenRouter API
- **Containerization**: Docker & Docker Compose

## 📁 Project Structure

```
Virallens/
├── client/                 # React frontend
│   ├── src/
│   ├── public/
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   └── nginx.conf
├── server/                 # Node.js backend
│   ├── src/
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   └── .env               # Environment variables
├── docker-compose.yml      # Production setup
└── docker-compose.dev.yml  # Development setup
```

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- MongoDB Atlas account

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Virallens
```

### 2. Environment Setup

Create a `.env` file in the `server/` directory:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# MongoDB Atlas Configuration
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/virallens?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# CORS Configuration
CLIENT_URL=http://localhost:3000

# Cookie Configuration
COOKIE_DOMAIN=localhost
COOKIE_SECURE=false
COOKIE_SAME_SITE=lax

# OpenRouter Configuration
OPENROUTER_API_KEY=your-openrouter-api-key
OPENROUTER_MODEL=meta-llama/llama-3.2-3b-instruct:free
```

### 3. MongoDB Atlas Setup

1. Create a free MongoDB Atlas account
2. Create a new cluster
3. Create a database user
4. Add your IP to network access
5. Get your connection string and update `MONGODB_URI` in `.env`

## 🐳 Docker Deployment

### Production Deployment

```bash
# Build and start all services
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down
```

### Development with Docker

```bash
# Start development environment
docker compose -f docker-compose.dev.yml up -d

# View logs
docker compose -f docker-compose.dev.yml logs -f

# Stop development environment
docker compose -f docker-compose.dev.yml down
```

## 💻 Development

### Docker Development (Recommended)

```bash
# Development with hot reload
docker compose -f docker-compose.dev.yml up -d
```

## 📋 Docker Commands

### Production Commands

```bash
# Build and start production containers
docker compose up -d

# View logs
docker compose logs -f

# Stop containers
docker compose down

# Rebuild and restart
docker compose up -d --build
```

### Development Commands

```bash
# Start development containers with hot reload
docker compose -f docker-compose.dev.yml up -d

# View development logs
docker compose -f docker-compose.dev.yml logs -f

# Stop development containers
docker compose -f docker-compose.dev.yml down

# Rebuild development containers
docker compose -f docker-compose.dev.yml up -d --build
```

### Utility Commands

```bash
# View all running containers
docker compose ps

# Clean up Docker resources
docker compose down -v --remove-orphans
docker system prune -f
```

## 🌐 Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Backend server port | 3001 |
| `NODE_ENV` | Environment mode | development |
| `MONGODB_URI` | MongoDB Atlas connection string | Required |
| `JWT_SECRET` | JWT signing secret | Required |
| `CLIENT_URL` | Frontend URL for CORS | http://localhost:3000 |
| `OPENROUTER_API_KEY` | OpenRouter API key | Required |

### Docker Services

- **backend**: Node.js API server
- **frontend**: React application with nginx

## 🛠️ Development

### Adding New Features

1. Make changes to the respective frontend/backend code
2. In development mode, changes are automatically reflected
3. For production, rebuild the Docker images

### Database Schema

The application uses MongoDB with the following collections:
- `users` - User authentication and profile data
- `chats` - Chat conversations and messages

## 🚀 Production Deployment

1. Set up MongoDB Atlas production cluster
2. Update environment variables for production
3. Build and deploy with Docker Compose:

```bash
docker compose up -d
```

## 📝 API Endpoints

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/chat` - Get user's chats
- `POST /api/chat` - Create new chat
- `POST /api/chat/:id/message` - Send message to chat

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with Docker
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.
