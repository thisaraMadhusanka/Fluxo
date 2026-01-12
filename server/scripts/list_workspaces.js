const mongoose = require('mongoose');
const Workspace = require('../models/Workspace');
const User = require('../models/User');
require('dotenv').config({ path: '../.env' });

const listWorkspaces = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const workspaces = await Workspace.find({}).populate('owner', 'email');

        console.log(`Total Workspaces: ${workspaces.length}`);

        const counts = {};
        workspaces.forEach(w => {
            const name = w.name;
            counts[name] = (counts[name] || 0) + 1;
        });

        console.log('--- Counts by Name ---');
        console.table(counts);

        console.log('--- "My Workspace" Details ---');
        const myWorkspaces = workspaces.filter(w => w.name === 'My Workspace');
        myWorkspaces.forEach(w => {
            console.log(`ID: ${w._id}, Owner: ${w.owner?.email}, Created: ${w.createdAt}`);
        });

        process.exit(0);

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

listWorkspaces();
