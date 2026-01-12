const mongoose = require('mongoose');
const User = require('../models/User');
const Workspace = require('../models/Workspace');
const Member = require('../models/Member');
const Role = require('../models/Role');
require('dotenv').config({ path: '../.env' });

const fixMembership = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const email = 'thisarasanka4@gmail.com';
        const user = await User.findOne({ email });

        if (!user) {
            console.log(`User ${email} not found`);
            process.exit(1);
        }

        console.log(`Found User: ${user._id}`);

        // Find Owner Role
        const ownerRole = await Role.findOne({ name: 'Owner' });
        if (!ownerRole) {
            console.log('Owner role not found in DB');
            // Try to find ANY role or create one?
            // Assuming roles exist. 
            process.exit(1);
        }
        console.log(`Found Owner Role: ${ownerRole._id}`);

        const workspaces = await Workspace.find({});
        console.log(`Found ${workspaces.length} workspaces`);

        for (const workspace of workspaces) {
            let member = await Member.findOne({ user: user._id, workspace: workspace._id });

            if (!member) {
                console.log(`Creating membership for workspace: ${workspace.title} (${workspace._id})`);
                await Member.create({
                    user: user._id,
                    workspace: workspace._id,
                    role: ownerRole._id,
                    status: 'Active'
                });
            } else {
                console.log(`Membership already exists for: ${workspace.title}`);
                // Ensure role is owner
                if (member.role.toString() !== ownerRole._id.toString()) {
                    console.log(`Updating role to Owner for workspace: ${workspace.title}`);
                    member.role = ownerRole._id;
                    await member.save();
                }
            }
        }

        console.log('✅ Membership fix complete.');
        process.exit(0);

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

fixMembership();
