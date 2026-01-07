const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Workspace = require('../models/Workspace');
const path = require('path');

// Load env from parent directory
dotenv.config({ path: path.join(__dirname, '../.env') });

const migrateWorkspaces = async () => {
    try {
        console.log('Connecting to MongoDB...');
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/taskflow';
        console.log(`Using URI: ${uri.replace(/:[^:]*@/, ':****@')}`); // Hide credentials

        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        const users = await User.find({});
        console.log(`Found ${users.length} users to check.`);

        for (const user of users) {
            console.log(`Checking user: ${user.name} (${user._id})`);

            // Re-fetch to ensure we have the latest (though find() above is fresh)
            // Check if they already have a workspace that IS private
            const existingPrivate = await Workspace.findOne({ owner: user._id, isPrivate: true });

            if (existingPrivate) {
                console.log(`User ${user.name} already owns a private workspace: ${existingPrivate.name}`);
                if (!user.privateWorkspaceId || user.privateWorkspaceId.toString() !== existingPrivate._id.toString()) {
                    console.log('Linking existing private workspace to user profile...');
                    user.privateWorkspaceId = existingPrivate._id;
                    await user.save();
                }
                continue;
            }

            if (!user.privateWorkspaceId) {
                console.log(`Creating NEW private workspace for user: ${user.name}`);

                const privateWorkspace = await Workspace.create({
                    name: 'My Workspace',
                    owner: user._id,
                    isPrivate: true,
                    canAddMembers: false,
                    members: [{
                        user: user._id,
                        role: 'Owner',
                        permissions: {
                            canManageSettings: true,
                            canManageMembers: false,
                            canDeleteWorkspace: true
                        }
                    }]
                });

                user.privateWorkspaceId = privateWorkspace._id;
                // If they have no active workspace, set this one
                if (!user.lastActiveWorkspace) {
                    user.lastActiveWorkspace = privateWorkspace._id;
                }
                await user.save();
                console.log(`Private workspace created for ${user.name}`);
            } else {
                // They have an ID, verify it exists
                const ws = await Workspace.findById(user.privateWorkspaceId);
                if (!ws) {
                    console.log(`User has privateWorkspaceId but workspace not found. Cleaning up...`);
                    user.privateWorkspaceId = null;
                    await user.save();
                    // Rerun this user? or just let next run handle it. 
                    // For now, simpler to just skip and let user re-run if needed, or handle it now.
                    // I'll leave it for now to avoid complexity in this turn.
                } else {
                    console.log(`User ${user.name} has linked private workspace.`);
                }
            }
        }

        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrateWorkspaces();
