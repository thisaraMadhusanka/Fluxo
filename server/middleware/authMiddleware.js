const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.APP_SECRET);

            // Get user from the token
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            // Check if approved
            if (!req.user.isApproved) {
                return res.status(403).json({ message: 'Account pending approval' });
            }

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const admin = (req, res, next) => {
    if (req.user && (req.user.role === 'Admin' || req.user.role === 'Owner')) { // Owner is super admin
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as an admin' });
    }
};

const owner = (req, res, next) => {
    if (req.user && req.user.role === 'Owner') {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as Owner' });
    }
};

module.exports = { protect, admin, owner };
