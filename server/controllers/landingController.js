const { sendContactFormNotification, sendSubscriptionConfirmation } = require('../services/emailService');

// @desc    Submit contact form
// @route   POST /api/landing/contact
// @access  Public
exports.submitContact = async (req, res) => {
    try {
        const { name, email, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Send email to admin
        await sendContactFormNotification({ name, email, message });

        res.status(200).json({ message: 'Message sent successfully' });
    } catch (error) {
        console.error('Submit Contact Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Subscribe to newsletter
// @route   POST /api/landing/subscribe
// @access  Public
exports.subscribeNewsletter = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // Send confirmation to user
        await sendSubscriptionConfirmation(email);

        // TODO: Save to database if needed in future

        res.status(200).json({ message: 'Subscribed successfully' });
    } catch (error) {
        console.error('Subscribe Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
