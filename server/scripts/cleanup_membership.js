const mongoose = require('mongoose');
const Workspace = require('../models/Workspace');
const Member = require('../models/Member');
const User = require('../models/User');
require('dotenv').config({ path: '../.env' });

const cleanup = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const email = 'thisarasanka4@gmail.com';
        const user = await User.findOne({ email });

        if (!user) {
            console.log('User not found');
            process.exit(1);
        }

        console.log(`Cleaning up for user: ${user.email} (${user._id})`);

        // 1. Delete Orphan Workspaces (No Owner)
        // Find workspaces where owner user doesn't exist? OR where owner field is null?
        // Mongoose might not filter owner: null if it's just a broken ref.
        // But we can check if owner field is physically null/undefined.

        // Actually, let's just inspect "My Workspace" entries.
        const allWorkspaces = await Workspace.find({});

        let removedMembershipCount = 0;
        let deletedWorkspaceCount = 0;

        for (const w of allWorkspaces) {
            // Check if Owner exists
            const ownerExists = await User.findById(w.owner);

            if (!ownerExists) {
                console.log(`Deleting orphan workspace: ${w.name} (${w._id}) - Owner missing`);
                await Workspace.findByIdAndDelete(w._id);
                await Member.deleteMany({ workspace: w._id });
                deletedWorkspaceCount++;
                continue;
            }

            // Logic: If workspace is "My Workspace" AND owner is NOT me -> Leave it.
            if (w.name === 'My Workspace' && w.owner.toString() !== user._id.toString()) {
                console.log(`Removing membership from other's personal workspace: ${w._id} (Owner: ${w.owner})`);
                await Member.findOneAndDelete({ user: user._id, workspace: w._id });
                removedMembershipCount++;
            }
        }

        console.log('--- Cleanup Summary ---');
        console.log(`Deleted Orphan Workspaces: ${deletedWorkspaceCount}`);
        console.log(`Removed Incorrect Memberships: ${removedMembershipCount}`);

        process.exit(0);

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

cleanup();
