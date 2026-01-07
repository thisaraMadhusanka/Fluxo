const mongoose = require('mongoose');
require('dotenv').config({ path: './server/.env' });

const Workspace = require('./server/models/Workspace');
const Member = require('./server/models/Member');
const Task = require('./server/models/Task');
const Project = require('./server/models/Project');
const Role = require('./server/models/Role');

async function deleteTestWorkspace() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find the workspace by name
        const workspace = await Workspace.findOne({ name: /Updated Test Work/i });

        if (!workspace) {
            console.log('Workspace not found');
            process.exit(0);
        }

        console.log('Found workspace:', workspace.name, workspace._id);

        // Delete all related data
        await Task.deleteMany({ workspace: workspace._id });
        console.log('✓ Deleted tasks');

        await Project.deleteMany({ workspace: workspace._id });
        console.log('✓ Deleted projects');

        await Member.deleteMany({ workspace: workspace._id });
        console.log('✓ Deleted members');

        await Role.deleteMany({ workspace: workspace._id });
        console.log('✓ Deleted roles');

        await Workspace.deleteOne({ _id: workspace._id });
        console.log('✓ Deleted workspace');

        console.log('\n✅ Successfully deleted "Updated Test Workspace" and all related data');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

deleteTestWorkspace();
