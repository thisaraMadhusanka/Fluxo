const axios = require('axios');

// Send email via Google Apps Script
const sendViaGAS = async (to, subject, htmlBody) => {
    const gasUrl = process.env.GAS_EMAIL_URL;
    const gasSecret = process.env.GAS_API_SECRET;

    console.log('\n=== EMAIL SERVICE DEBUG ===');
    console.log('GAS_EMAIL_URL:', gasUrl || 'MISSING');
    console.log('GAS_API_SECRET:', gasSecret ? 'SET' : 'MISSING');
    console.log('Recipient:', to);
    console.log('Subject:', subject);

    if (!gasUrl) {
        console.error('❌ ERROR: GAS_EMAIL_URL not configured in .env');
        throw new Error('GAS_EMAIL_URL is required');
    }

    try {
        console.log('📤 Sending request to GAS...');
        const response = await axios.post(gasUrl, {
            secret: gasSecret,
            to: to,
            subject: subject,
            htmlBody: htmlBody
        }, {
            timeout: 10000 // 10 second timeout
        });

        console.log('📥 GAS Response Status:', response.status);
        console.log('📥 GAS Response Data:', JSON.stringify(response.data, null, 2));

        if (response.data && response.data.success) {
            console.log('✅ Email sent successfully via GAS');
            return { success: true, messageId: 'GAS-' + Date.now() };
        } else {
            console.error('❌ GAS returned failure:', response.data);
            throw new Error(response.data?.error || 'GAS returned success=false');
        }
    } catch (error) {
        console.error('❌ GAS Request Failed:');
        console.error('   Error:', error.message);
        if (error.response) {
            console.error('   HTTP Status:', error.response.status);
            console.error('   Response:', error.response.data);
        }
        throw error;
    }
};

// Main function: Send invitation email
exports.sendInvitationEmail = async (userEmail, workspaceName, inviterName, acceptUrl) => {
    try {
        const subject = `You're invited to join ${workspaceName}`;
        const html = getInvitationEmailTemplate(userEmail, workspaceName, inviterName, acceptUrl);

        return await sendViaGAS(userEmail, subject, html);
    } catch (error) {
        console.error('💥 sendInvitationEmail failed:', error.message);
        throw error;
    }
};

// Email template
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

// Send approval email
exports.sendApprovalNotification = async (userEmail, userName) => {
    try {
        const loginUrl = `${process.env.CLIENT_URL}/login`;
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

        return await sendViaGAS(userEmail, subject, html);
    } catch (error) {
        console.error('💥 sendApprovalNotification failed:', error.message);
        // Don't throw to prevent blocking the approval process
    }
};

module.exports = exports;
