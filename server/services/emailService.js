const nodemailer = require('nodemailer');

// Universal Transporter (shared config)
const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_APP_PASSWORD
        }
    });
};

// Styles for all emails
const emailStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
    body { font-family: 'Plus Jakarta Sans', Arial, sans-serif; line-height: 1.6; color: #1F1F1F; background-color: #000000; margin: 0; padding: 0; }
    .wrapper { width: 100%; background-color: #000000; padding: 40px 0; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; box-shadow: 0 10px 15px -3px rgba(255, 255, 255, 0.1); overflow: hidden; border: 1px solid #333333; }
    .header { background: #ffffff; padding: 32px; text-align: center; border-bottom: 1px solid #f1f5f9; }
    .logo { font-size: 28px; font-weight: 800; color: #1F1F1F; letter-spacing: -1px; text-decoration: none; }
    .logo span { color: #F26B3A; }
    .hero { padding: 48px 32px 24px; text-align: center; }
    .success-icon { width: 80px; height: 80px; background: #fff1eb; color: #F26B3A; border-radius: 50%; display: block; text-align: center; line-height: 80px; font-size: 40px; margin: 0 auto 24px auto; }
    .danger-icon { width: 80px; height: 80px; background: #fee2e2; color: #ef4444; border-radius: 50%; display: block; text-align: center; line-height: 80px; font-size: 40px; margin: 0 auto 24px auto; }
    h1 { margin: 0 0 16px 0; color: #1F1F1F; font-size: 30px; letter-spacing: -1px; line-height: 1.2; font-weight: 800; }
    p { margin: 0 0 24px 0; color: #7C6E65; font-size: 16px; max-width: 480px; margin-left: auto; margin-right: auto; }
    .content { padding: 0 40px 40px; text-align: center; }
    .btn { display: inline-block; background: #F26B3A; color: white !important; font-weight: 600; padding: 16px 48px; border-radius: 12px; text-decoration: none; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(242, 107, 58, 0.3); transition: all 0.2s; }
    .btn:hover { background: #ea580c; transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(242, 107, 58, 0.4); }
    .footer { background: #000000; padding: 24px; text-align: center; font-size: 13px; color: #666666; }
`;

// Send invitation email
exports.sendInvitationEmail = async (email, workspaceName, inviterName, inviteLink) => {
    try {
        const transporter = createTransporter();
        const subject = `${inviterName} invited you to join ${workspaceName} on Fluxo`;

        const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invitation to ${workspaceName}</title>
        <style>${emailStyles}</style>
    </head>
    <body>
        <div class="wrapper">
            <div class="container">
                <div class="header">
                    <a href="#" class="logo">Flux<span>o.</span></a>
                </div>
                <div class="hero">
                    <div class="success-icon">💌</div>
                    <h1>You've Been Invited</h1>
                    <p><strong>${inviterName}</strong> has invited you to join the workspace <strong>${workspaceName}</strong>.</p>
                </div>
                <div class="content">
                    <a href="${inviteLink}" class="btn">Accept Invitation</a>
                </div>
                <div class="footer">
                    <p>© 2026 Fluxo Inc. All rights reserved.</p>
                </div>
            </div>
        </div>
    </body>
    </html>
        `;

        await transporter.sendMail({
            from: `Fluxo Team <${process.env.EMAIL_USER}>`,
            to: email,
            subject,
            html
        });

        console.log('✅ Invitation email sent to', email);
        return { success: true };
    } catch (error) {
        console.error('Failed to send invitation email:', error);
        throw error;
    }
};

// Send approval notification email
exports.sendApprovalNotification = async (userEmail, userName) => {
    try {
        const loginUrl = process.env.CLIENT_URL
            ? `${process.env.CLIENT_URL}/login`
            : 'https://fluxo-xi.vercel.app/login';

        console.log(`📧 Sending approval email to ${userEmail} using App Password`);

        const transporter = createTransporter();

        const subject = '🎉 You\'re in! Your Fluxo account is checked and approved';
        const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Approved</title>
        <style>${emailStyles}</style>
    </head>
    <body>
        <div class="wrapper">
            <div class="container">
                <div class="header">
                    <a href="#" class="logo">Flux<span>o.</span></a>
                </div>
                <div class="hero">
                    <div class="success-icon">🚀</div>
                    <h1>You're Ready to Launch!</h1>
                    <p>Hi ${userName},<br>Your account has been officially approved. You now have full access to Fluxo workspace.</p>
                </div>
                <div class="content">
                    <a href="${loginUrl}" class="btn">Login to Dashboard</a>
                </div>
                <div class="footer">
                    <p>Questions? Just reply to this email.</p>
                    <p>© 2026 Fluxo Inc. All rights reserved.</p>
                </div>
            </div>
        </div>
    </body>
    </html>
        `;

        const result = await transporter.sendMail({
            from: `Fluxo Team <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject,
            html
        });

        console.log('✅ Approval email sent successfully');
        return { success: true, messageId: result.messageId };
    } catch (error) {
        console.error('💥 sendApprovalNotification failed:', error.message);
    }
};

// Send account suspended notification
exports.sendAccountSuspendedNotification = async (userEmail, userName) => {
    try {
        console.log(`📧 Sending suspended email to ${userEmail}`);
        const transporter = createTransporter();

        const subject = '⚠️ Account Suspended';
        const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Suspended</title>
        <style>${emailStyles}</style>
    </head>
    <body>
        <div class="wrapper">
            <div class="container">
                <div class="header">
                    <a href="#" class="logo">Flux<span>o.</span></a>
                </div>
                <div class="hero">
                    <div class="danger-icon">⚠️</div>
                    <h1>Account Suspended</h1>
                    <p>Hi ${userName},<br>Your account has been suspended by the administrator. You no longer have access to Fluxo workspace.</p>
                </div>
                <div class="footer">
                    <p>© 2026 Fluxo Inc. All rights reserved.</p>
                </div>
            </div>
        </div>
    </body>
    </html>
        `;

        const result = await transporter.sendMail({
            from: `Fluxo Team <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject,
            html
        });

        console.log('✅ Suspended email sent successfully');
        return { success: true, messageId: result.messageId };
    } catch (error) {
        console.error('💥 sendAccountSuspendedNotification failed:', error.message);
    }
};

// Send registration notification to admin
exports.sendRegistrationNotification = async (userName, userEmail) => {
    try {
        const transporter = createTransporter();

        // This is sent to the system admin for email alerts
        const adminEmail = 'thisarasanka4@gmail.com';

        const subject = `New User Registration: ${userName}`;
        const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>${emailStyles}</style>
    </head>
    <body>
        <div class="wrapper">
            <div class="container">
                <div class="header">
                    <a href="#" class="logo">Flux<span>o.</span></a>
                </div>
                <div class="hero">
                    <div class="success-icon">👤</div>
                    <h1>New Registration</h1>
                    <p><strong>${userName}</strong> (${userEmail}) has registered and is waiting for approval.</p>
                </div>
                <div class="content">
                    <a href="https://fluxo-xi.vercel.app/settings/users" class="btn">Manage Users</a>
                </div>
            </div>
        </div>
    </body>
    </html>
        `;

        await transporter.sendMail({
            from: `Fluxo System <${process.env.EMAIL_USER}>`,
            to: adminEmail,
            subject,
            html
        });
        console.log('✅ Admin registration alert sent');
    } catch (error) {
        console.error('Failed to send admin alert:', error);
    }
};
