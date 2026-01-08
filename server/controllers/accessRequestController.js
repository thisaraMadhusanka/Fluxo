const AccessRequest = require('../models/AccessRequest');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

// Generate random password
const generatePassword = () => {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
};

// @desc    Submit access request
// @route   POST /api/access-requests
// @access  Public
const submitRequest = async (req, res) => {
    try {
        console.log('Received access request:', req.body);
        const { name, email, company, message } = req.body;

        if (!name || !email) {
            return res.status(400).json({ message: 'Name and email are required' });
        }

        // Check if email already has a pending or approved request
        const existingRequest = await AccessRequest.findOne({
            email,
            status: { $in: ['pending', 'approved'] }
        });

        if (existingRequest) {
            return res.status(400).json({
                message: existingRequest.status === 'pending'
                    ? 'You already have a pending access request'
                    : 'This email has already been approved'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        const accessRequest = await AccessRequest.create({
            name,
            email,
            company,
            message
        });

        // Send notification to admin
        const { sendAccessRequestNotification } = require('../services/emailService');
        await sendAccessRequestNotification({ name, email, company, message });

        res.status(201).json({
            message: 'Access request submitted successfully. You will receive an email once approved.',
            request: accessRequest
        });
    } catch (error) {
        console.error('Submit Request Error:', error);
        res.status(500).json({ message: 'Server error submitting request' });
    }
};

// @desc    Get all access requests
// @route   GET /api/access-requests
// @access  Private/Owner
const getRequests = async (req, res) => {
    try {
        const { status } = req.query;
        const filter = status ? { status } : {};

        const requests = await AccessRequest.find(filter)
            .populate('processedBy', 'name email')
            .sort({ createdAt: -1 });

        res.json(requests);
    } catch (error) {
        console.error('Get Requests Error:', error);
        res.status(500).json({ message: 'Server error fetching requests' });
    }
};

// @desc    Approve access request
// @route   PUT /api/access-requests/:id/approve
// @access  Private/Owner
const approveRequest = async (req, res) => {
    try {
        const request = await AccessRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ message: 'Access request not found' });
        }

        if (request.status !== 'pending') {
            return res.status(400).json({ message: 'Request has already been processed' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: request.email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Generate password
        const generatedPassword = generatePassword();
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(generatedPassword, salt);

        // Create user
        const newUser = await User.create({
            name: request.name,
            email: request.email,
            password: hashedPassword,
            role: 'Member',
            isApproved: true
        });

        // Update request
        request.status = 'approved';
        request.processedBy = req.user.id;
        request.processedAt = new Date();
        await request.save();

        // Send email with credentials (using environment variable for email config)
        try {
            // Configure nodemailer transport
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });

            const loginUrl = `${process.env.CLIENT_URL}/login`;

            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: request.email,
                subject: 'Welcome to Fluxo - Your Access Has Been Approved!',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #F26B3A;">Welcome to Fluxo!</h2>
                        <p>Hi ${request.name},</p>
                        <p>Great news! Your access request has been approved.</p>
                        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="margin-top: 0;">Your Login Credentials:</h3>
                            <p><strong>Email:</strong> ${request.email}</p>
                            <p><strong>Password:</strong> ${generatedPassword}</p>
                        </div>
                        <p>
                            <a href="${loginUrl}" style="display: inline-block; background-color: #F26B3A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 10px 0;">
                                Login to Fluxo
                            </a>
                        </p>
                        <p style="color: #666; font-size: 14px; margin-top: 30px;">
                            We recommend changing your password after your first login.
                        </p>
                        <p style="color: #999; font-size: 12px; margin-top: 40px;">
                            If you didn't request access to Fluxo, please ignore this email.
                        </p>
                    </div>
                `
            });
        } catch (emailError) {
            console.error('Email Error:', emailError);
            // Don't fail the entire operation if email fails
        }

        res.json({
            message: 'Access request approved and user created successfully',
            user: {
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email
            }
        });
    } catch (error) {
        console.error('Approve Request Error:', error);
        res.status(500).json({ message: 'Server error approving request' });
    }
};

// @desc    Reject access request
// @route   PUT /api/access-requests/:id/reject
// @access  Private/Owner
const rejectRequest = async (req, res) => {
    try {
        const { reason } = req.body;
        const request = await AccessRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ message: 'Access request not found' });
        }

        if (request.status !== 'pending') {
            return res.status(400).json({ message: 'Request has already been processed' });
        }

        request.status = 'rejected';
        request.rejectionReason = reason;
        request.processedBy = req.user.id;
        request.processedAt = new Date();
        await request.save();

        res.json({ message: 'Access request rejected', request });
    } catch (error) {
        console.error('Reject Request Error:', error);
        res.status(500).json({ message: 'Server error rejecting request' });
    }
};

module.exports = {
    submitRequest,
    getRequests,
    approveRequest,
    rejectRequest
};
