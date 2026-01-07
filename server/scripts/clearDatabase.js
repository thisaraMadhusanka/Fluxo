const mongoose = require('mongoose');
const readline = require('readline');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/taskflow', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function clearDatabase() {
    console.log('\n⚠️  WARNING: This will delete ALL data from the database!\n');
    console.log('Collections that will be cleared:');
    console.log('  - Users');
    console.log('  - Workspaces');
    console.log('  - Projects');
    console.log('  - Tasks');
    console.log('  - Notifications');
    console.log('  - All other collections\n');

    rl.question('Are you sure you want to continue? (yes/no): ', async (answer) => {
        if (answer.toLowerCase() === 'yes') {
            try {
                console.log('\nClearing database...');

                // Get all collections
                const collections = await mongoose.connection.db.collections();

                for (let collection of collections) {
                    const count = await collection.countDocuments();
                    await collection.deleteMany({});
                    console.log(`✓ Cleared ${collection.collectionName}: ${count} documents deleted`);
                }

                console.log('\n✅ Database cleared successfully!');
                console.log('\nYou can now:');
                console.log('1. Register a new account');
                console.log('2. Create a new workspace');
                console.log('3. Start fresh!\n');

            } catch (error) {
                console.error('❌ Error clearing database:', error);
            }
        } else {
            console.log('\n❌ Operation cancelled');
        }

        rl.close();
        mongoose.connection.close();
        process.exit(0);
    });
}

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');
    clearDatabase();
});

mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});
