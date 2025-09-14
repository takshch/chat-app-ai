# ViralLens Chat Client

A React.js application with TypeScript for chatting with AI, featuring user authentication and a modern chat interface.

## Features

- **User Authentication**: Sign up and login with email/password
- **Chat Interface**: Create new chats and continue existing conversations
- **Real-time Messaging**: Send messages and receive AI responses
- **Chat History**: View and select from previous conversations
- **Responsive Design**: Works on desktop and mobile devices

## Pages

### 1. Sign Up Page (`/signup`)
- Accepts email, password, and optional name
- Redirects to login page after successful registration
- Form validation and error handling

### 2. Login Page (`/login`)
- Email and password authentication
- Redirects to dashboard after successful login
- Shows success message from signup if applicable

### 3. Dashboard Page (`/dashboard`)
- **Sidebar Section**:
  - "Create Chat" button to start new conversations
  - List of existing chats with titles and dates
  - User info and logout button
- **Main Section**:
  - Current chat messages with scrollbar
  - ChatGPT-style input box at the bottom
  - Typing indicator for AI responses

## API Integration

The application integrates with the following server endpoints:

### Authentication
- `POST /auth/signup` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `GET /auth/me` - Get current user
- `GET /auth/verify` - Verify authentication token

### Chat
- `POST /chat/create` - Create new chat
- `POST /chat/send` - Send message to existing chat
- `GET /chat/history/:chatId` - Get chat history
- `GET /chat/chats` - Get user's chat list

## Getting Started

1. Make sure the server is running on `http://localhost:3001`
2. Install dependencies: `npm install`
3. Start the development server: `npm start`
4. Open `http://localhost:3000` in your browser

## Environment Variables

Set the following environment variable:
- `REACT_APP_API_URL`: Backend API URL (default: `http://localhost:3001`)

## Technologies Used

- React 19.1.1
- TypeScript
- React Router DOM
- Axios for API calls
- CSS3 for styling
- Context API for state management

## Project Structure

```
src/
├── components/
│   └── ProtectedRoute.tsx
├── contexts/
│   └── AuthContext.tsx
├── pages/
│   ├── SignupPage.tsx
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── AuthPages.css
│   └── DashboardPage.css
├── services/
│   └── api.ts
├── types/
│   └── index.ts
├── App.tsx
├── App.css
└── index.tsx
```