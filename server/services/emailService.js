const emailjs = require('@emailjs/nodejs');

// Initialize EmailJS with your credentials
// Using the same credentials as frontend for consistency
const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID || 'service_2xvzpo8';
const EMAILJS_PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY || 'CzO1CtVscsgKy6YGK';
const EMAILJS_PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY; // Add this to .env

// Send email via EmailJS
const sendViaEmailJS = async (to, fromName, subject, htmlBody) => {
    console.log('\n=== EMAIL SERVICE (EmailJS) ===');
    console.log('Service ID:', EMAILJS_SERVICE_ID || 'MISSING');
    console.log('Public Key:', EMAILJS_PUBLIC_KEY ? 'SET' : 'MISSING');
    console.log('Recipient:', to);
    console.log('Subject:', subject);

    if (!EMAILJS_SERVICE_ID || !EMAILJS_PUBLIC_KEY || !EMAILJS_PRIVATE_KEY) {
        console.error('❌ ERROR: EmailJS credentials not configured in .env');
        throw new Error('EmailJS credentials are required');
    }

    try {
        console.log('📤 Sending email via EmailJS...');

        // EmailJS template parameters
        const templateParams = {
            to_email: to,
            from_name: fromName || 'Fluxo',
            subject: subject,
            message_html: htmlBody,
            reply_to: 'noreply@fluxo.app'
        };

        const response = await emailjs.send(
            EMAILJS_SERVICE_ID,
            process.env.EMAILJS_TEMPLATE_ID || 'template_default',
            templateParams,
            {
                publicKey: EMAILJS_PUBLIC_KEY,
                privateKey: EMAILJS_PRIVATE_KEY,
            }
        );

        console.log('✅ Email sent successfully via EmailJS');
        console.log('Response:', response);
        return { success: true, messageId: response.text };
    } catch (error) {
        console.error('❌ EmailJS Request Failed:');
        console.error('   Error:', error.message);
        console.error('   Full Error:', error);
        throw error;
    }
};

// Send invitation email
exports.sendInvitationEmail = async (userEmail, workspaceName, inviterName, acceptUrl) => {
    try {
        const subject = `You're invited to join ${workspaceName}`;
        const html = getInvitationEmailTemplate(userEmail, workspaceName, inviterName, acceptUrl);

        return await sendViaEmailJS(userEmail, 'Fluxo Team', subject, html);
    } catch (error) {
        console.error('💥 sendInvitationEmail failed:', error.message);
        throw error;
    }
};

// Email template for invitations
const getInvitationEmailTemplate = (userEmail, workspaceName, inviterName, acceptUrl) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #1F1F1F; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #0F0F0F; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
            .button { display: inline-block; padding: 15px 30px; background: #F26B3A; color: #ffffff !important; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
            .button:hover { background: #d95a2b; }
            .footer { text-align: center; padding: 20px; color: #7A7A7A; font-size: 12px; }
            .info-box { background: #F4ECE4; border-left: 4px solid #F26B3A; padding: 15px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎯 Fluxo</h1>
                <p>You've been invited to collaborate!</p>
            </div>
            <div class="content">
                <h2>Hi there!</h2>
                <p><strong>${inviterName}</strong> has invited you to join <strong>${workspaceName}</strong> on Fluxo.</p>
                
                <div class="info-box">
                    <p><strong>📧 Invitation Email:</strong> ${userEmail}</p>
                    <p><strong>📁 Workspace:</strong> ${workspaceName}</p>
                </div>

                <p>To accept this invitation and join the team:</p>
                <ol>
                    <li>Click the button below</li>
                    <li>Sign in with your Google account (${userEmail})</li>
                    <li>Start collaborating!</li>
                </ol>

                <center>
                    <a href="${acceptUrl}" class="button">Accept Invitation</a>
                </center>

                <p style="color: #666; font-size: 14px; margin-top: 20px;">
                    <strong>Note:</strong> This invitation link will expire in 7 days. If you didn't expect this invitation, you can safely ignore this email.
                </p>
            </div>
            <div class="footer">
                <p>© 2026 Fluxo - Project Management Made Simple</p>
                <p>This is an automated email. Please do not reply.</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

// Send approval notification email
exports.sendApprovalNotification = async (userEmail, userName) => {
    try {
        const loginUrl = process.env.CLIENT_URL
            ? `${process.env.CLIENT_URL}/login`
            : 'https://fluxo-xi.vercel.app/login';

        console.log(`📧 Sending approval email to ${userEmail}`);
        console.log(`🔗 Login URL: ${loginUrl}`);

        const subject = '🎉 Your Fluxo Account is Approved!';
        const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; padding: 40px 0; }
            .logo { font-size: 28px; font-weight: 900; color: #1a1d23; letter-spacing: -1px; }
            .logo span { color: #f97316; }
            .card { background: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); border: 1px solid #f3f4f6; }
            .btn { display: inline-block; background: #f97316; color: white; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: 600; margin-top: 24px; }
            .btn:hover { background: #ea580c; }
            .footer { text-align: center; margin-top: 40px; color: #9ca3af; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">Flux<span>o.</span></div>
            </div>
            <div class="card">
                <h2 style="margin-top: 0; color: #111827; font-size: 24px;">You're in! 🚀</h2>
                <p style="font-size: 16px; color: #4b5563;">Hi ${userName},</p>
                <p style="font-size: 16px; color: #4b5563;">
                    Great news! Your account has been approved by the admin. You can now access your workspace and start managing your projects properly.
                </p>
                <center>
                    <a href="${loginUrl}" class="btn">Log In to Fluxo</a>
                </center>
                <p style="margin-top: 32px; font-size: 14px; color: #6b7280; text-align: center;">
                    Or copy this link: <br>
                    <a href="${loginUrl}" style="color: #f97316;">${loginUrl}</a>
                </p>
            </div>
            <div class="footer">
                <p>© 2026 Fluxo. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
        `;

        const result = await sendViaEmailJS(userEmail, 'Fluxo Team', subject, html);
        console.log('✅ Approval email sent successfully');
        return result;
    } catch (error) {
        console.error('💥 sendApprovalNotification failed:', error.message);
        console.error('Full error:', error);
        // Don't throw to prevent blocking the approval process
    }
};

// Send registration notification to admin
exports.sendRegistrationNotification = async (userName, userEmail) => {
    try {
        const adminEmail = 'thisarasanka4@gmail.com';
        const subject = '👤 New User Registration on Fluxo';
        const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .card { background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #f97316; }
        </style>
    </head>
    <body>
        <div class="container">
            <h2>New User Awaiting Approval</h2>
            <div class="card">
                <p><strong>Name:</strong> ${userName}</p>
                <p><strong>Email:</strong> ${userEmail}</p>
            </div>
            <p>Please log in to your Fluxo admin panel to approve or reject this user.</p>
        </div>
    </body>
    </html>
        `;

        return await sendViaEmailJS(adminEmail, 'Fluxo System', subject, html);
    } catch (error) {
        console.error('💥 sendRegistrationNotification failed:', error.message);
    }
};

module.exports = exports;
