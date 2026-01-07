const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config({ path: '../.env' });

const fixOwner = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const email = 'thisarasanka4@gmail.com';
        const user = await User.findOne({ email });

        if (user) {
            user.role = 'Owner';
            user.isApproved = true;
            await user.save();
            console.log(`SUCCESS: Updated ${email} to Owner and Approved.`);
        } else {
            console.log(`ERROR: User ${email} not found.`);
        }

        mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

fixOwner();
