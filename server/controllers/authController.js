const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const bcrypt = require('bcryptjs');
const { sendRegistrationNotification } = require('../services/emailService');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.APP_SECRET, { expiresIn: '30d' });
};

// Register new user with email/password
exports.registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Check for specific owner email
        const isOwner = email === 'thisarasanka4@gmail.com';


        // Create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: isOwner ? 'Owner' : 'Member',
            isApproved: isOwner // Only owner is approved by default
        });

        if (!isOwner) {
            // Send notification to owner
            await sendRegistrationNotification(name, email);

            // Create notification for ALL owners
            const { createNotification } = require('./notificationController');
            const owners = await User.find({ role: 'Owner' });

            for (const owner of owners) {
                await createNotification({
                    userId: owner._id,
                    type: 'system',
                    title: 'New User Registration',
                    message: `${name} (${email}) has registered and is waiting for approval`,
                    link: '/settings/users',
                    metadata: { userId: user._id, userEmail: email }
                });
            }

            // Return success WITHOUT token - user must wait for approval
            return res.status(201).json({
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    isApproved: false
                },
                message: 'Registration successful. Please wait for admin approval to access your account. You will receive an email once approved.'
            });
        }

        // Owner gets auto-approved and workspace created
        await ensurePrivateWorkspace(user);
        const token = generateToken(user._id);

        res.status(201).json({
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                position: user.position,
                bio: user.bio,
                isApproved: user.isApproved,
                privateWorkspaceId: user.privateWorkspaceId
            },
            token,
            message: 'Registration successful'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};



// Login user with email/password
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check if user has a password (might be Google-only user)
        if (!user.password) {
            return res.status(401).json({ message: 'Please login with Google' });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check if approved
        if (email === 'thisarasanka4@gmail.com' && (!user.isApproved || user.role !== 'Owner')) {
            user.role = 'Owner';
            user.isApproved = true;
            await user.save();
        }

        if (!user.isApproved) {
            return res.status(403).json({ message: 'Account pending approval. Please contact the owner.' });
        }

        // Ensure private workspace exists
        await ensurePrivateWorkspace(user);

        const token = generateToken(user._id);

        res.status(200).json({
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                position: user.position,
                bio: user.bio,
                privateWorkspaceId: user.privateWorkspaceId
            },
            token,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

// Helper to ensure private workspace exists
const ensurePrivateWorkspace = async (user) => {
    if (user.privateWorkspaceId) return user.privateWorkspaceId;

    const Workspace = require('../models/Workspace');

    // Double check if one already exists for this owner
    const existing = await Workspace.findOne({ owner: user._id, isPrivate: true });
    if (existing) {
        user.privateWorkspaceId = existing._id;
        user.lastActiveWorkspace = existing._id;
        await user.save();
        return existing._id;
    }

    const privateWorkspace = await Workspace.create({
        name: 'My Workspace',
        owner: user._id,
        isPrivate: true,
        canAddMembers: false,
        members: [{
            user: user._id,
            role: 'Owner', // Owner role for private workspace
            permissions: {
                canManageSettings: true,
                canManageMembers: false,
                canDeleteWorkspace: true
            }
        }]
    });

    user.privateWorkspaceId = privateWorkspace._id;
    user.lastActiveWorkspace = privateWorkspace._id;
    await user.save();
    return privateWorkspace._id;
};

// Google OAuth authentication
exports.googleAuth = async (req, res) => {
    const { credential } = req.body;

    try {
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { email, name, picture, sub } = payload;

        let user = await User.findOne({ email });

        if (!user) {
            // Reject unknown users instead of auto-creating accounts
            return res.status(403).json({
                message: 'No account found with this email. Please register first or contact your administrator to request access.',
                requiresRegistration: true
            });
        }

        // User exists - Force update role if it's the owner email (fix for existing users)
        if (email === 'thisarasanka4@gmail.com' && user.role !== 'Owner') {
            user.role = 'Owner';
            user.isApproved = true;
            await user.save();
        }

        // Ensure private workspace exists for ALL Google users (new or existing)
        await ensurePrivateWorkspace(user);

        // Check info approved (even for existing users)
        if (!user.isApproved) {
            return res.status(403).json({ message: 'Account pending approval. Please contact the owner.' });
        }

        const token = generateToken(user._id);

        res.status(200).json({
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                position: user.position,
                bio: user.bio,
                privateWorkspaceId: user.privateWorkspaceId
            },
            token,
        });
    } catch (error) {
        console.error('Google Auth Error Details:', error.message);
        if (error.response) {
            console.error('Google API Error:', error.response.data);
        }
        console.error('Full Error Object:', error);
        res.status(400).json({ message: 'Google Auth Failed', error: error.message });
    }
};

