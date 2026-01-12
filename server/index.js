const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Initialize Socket.IO
const io = new Server(server, {
    cors: {
        origin: ['https://fluxo-xi.vercel.app', 'http://localhost:5173', 'http://localhost:3000'],
        credentials: true,
        methods: ['GET', 'POST']
    },
    transports: ['websocket', 'polling'],
    path: '/socket.io/'
});

// Middleware
app.use(cors({
    origin: ['https://fluxo-xi.vercel.app', 'http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

// Set COOP headers to allow Google OAuth popups
app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'unsafe-none');
    res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
    next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const userRoutes = require('./routes/userRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const workspaceRoutes = require('./routes/workspaceRoutes');
const roleRoutes = require('./routes/roleRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const accessRequestRoutes = require('./routes/accessRequestRoutes');
const messageRoutes = require('./routes/messageRoutes');

// Socket.IO handler
const { initializeSocket } = require('./socket/messageHandler');
initializeSocket(io);

// Make io accessible to routes
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/workspaces/:workspaceId/roles', roleRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/access-requests', accessRequestRoutes);
app.use('/api', messageRoutes); // Message routes
app.use('/api/landing', require('./routes/landingRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api', taskRoutes); // This route handles general task operations (Ensure this is AFTER specific routes to avoid middleware conflicts)

// Serve static assets (images, files)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/', (req, res) => {
    res.send('TaskFlow API is running');
});

app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        dbState: mongoose.networkState || mongoose.connection.readyState, // 0: disconnected, 1: connected, 2: connecting, 3: disconnecting
        timestamp: new Date().toISOString()
    });
});

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error(err));

// Export for Vercel
module.exports = app;

// Only listen if the file is run directly (Railway, Local)
// This prevents Vercel (which imports the file) from trying to start a second server
if (require.main === module) {
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log('Socket.IO initialized');
    });
}
