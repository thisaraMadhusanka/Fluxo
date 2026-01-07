# Fluxo - Project Management Platform

A modern, feature-rich project management application built with the MERN stack.

## Features

- 🚀 Real-time collaboration
- 📋 Kanban boards with drag-and-drop
- ✅ Advanced task management
- 👥 Team workspaces
- 📊 Project analytics
- 🔐 Secure authentication (OAuth & Email)
- 📧 Access request system
- 🎨 Modern, responsive UI

## Tech Stack

### Frontend
- React 18 with Vite
- Redux Toolkit for state management
- Framer Motion for animations
- Tailwind CSS for styling
- Lucide React for icons

### Backend
- Node.js & Express
- MongoDB with Mongoose
- JWT authentication
- Google OAuth 2.0
- Nodemailer for emails

## Getting Started

### Prerequisites
- Node.js v16+
- MongoDB Atlas account

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/fluxo.git
cd fluxo
```

2. Install dependencies
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

3. Environment Variables

Create `.env` in server directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
APP_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
CLIENT_URL=http://localhost:5173
EMAIL_USER=your_email
EMAIL_PASS=your_app_password
```

Create `.env` in client directory:
```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

4. Run the application
```bash
# Run server (from server directory)
npm run dev

# Run client (from client directory)
npm run dev
```

## Deployment

See [DEPLOYMENT_GUIDE.md](./deployment_guide.md) for detailed deployment instructions.

## License

MIT License

## Author

Built with ❤️ by Thisara Madhusanka
