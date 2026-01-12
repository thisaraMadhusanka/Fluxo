const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

const approveAllUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const result = await User.updateMany(
            { isApproved: false },
            { $set: { isApproved: true } }
        );

        console.log(`✅ Approved ${result.modifiedCount} users.`);
        process.exit(0);
    } catch (error) {
        console.error('Error approving users:', error);
        process.exit(1);
    }
};

approveAllUsers();
