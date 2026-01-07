const mongoose = require('mongoose');
require('dotenv').config();

const Workspace = require('./models/Workspace');
const Member = require('./models/Member');
const Task = require('./models/Task');
const Project = require('./models/Project');
const Role = require('./models/Role');

async function deleteTestWorkspace() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find the workspace by exact name
        const workspace = await Workspace.findOne({ name: "Updated Test Workspace" });

        if (!workspace) {
            console.log('❌ Workspace not found');
            process.exit(0);
        }

        console.log('Found workspace:', workspace.name, workspace._id);

        // Delete all related data
        const tasks = await Task.deleteMany({ workspace: workspace._id });
        console.log(`✓ Deleted ${tasks.deletedCount} tasks`);

        const projects = await Project.deleteMany({ workspace: workspace._id });
        console.log(`✓ Deleted ${projects.deletedCount} projects`);

        const members = await Member.deleteMany({ workspace: workspace._id });
        console.log(`✓ Deleted ${members.deletedCount} members`);

        const roles = await Role.deleteMany({ workspace: workspace._id });
        console.log(`✓ Deleted ${roles.deletedCount} roles`);

        await Workspace.deleteOne({ _id: workspace._id });
        console.log('✓ Deleted workspace');

        console.log('\n✅ Successfully deleted "Updated Test Workspace" and all related data');
        console.log('Please refresh your application to see the changes.');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

deleteTestWorkspace();
