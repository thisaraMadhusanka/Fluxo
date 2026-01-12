const mongoose = require('mongoose');
const Task = require('../models/Task');
const Message = require('../models/Message');
const Project = require('../models/Project');
const Notification = require('../models/Notification');
const Workspace = require('../models/Workspace');
require('dotenv').config({ path: '../.env' });

const addIndexes = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Task Indexes
        // Most queries filter by project or workspace
        console.log('Indexing Tasks...');
        await Task.collection.createIndex({ project: 1, status: 1 });
        await Task.collection.createIndex({ workspace: 1, assignedTo: 1 });
        await Task.collection.createIndex({ workspace: 1, createdAt: -1 });

        // Message Indexes (Already had some, adding more specific ones)
        console.log('Indexing Messages...');
        // Compound index for fetching conversation history sorted by time
        await Message.collection.createIndex({ conversation: 1, createdAt: -1 });

        // Project Indexes
        console.log('Indexing Projects...');
        // Fast lookup of projects in a workspace
        await Project.collection.createIndex({ workspace: 1, status: 1 });
        // Fast lookup of projects where user is a member
        await Project.collection.createIndex({ "members.user": 1 });

        // Notification Indexes
        console.log('Indexing Notifications...');
        await Notification.collection.createIndex({ user: 1, isRead: 1, createdAt: -1 });

        console.log('✅ Indexing complete.');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

addIndexes();
