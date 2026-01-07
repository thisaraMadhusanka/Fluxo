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
        <title>You've been invited to Fluxo</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
            body { font-family: 'Plus Jakarta Sans', Arial, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f8fafc; margin: 0; padding: 0; }
            .wrapper { width: 100%; background-color: #f8fafc; padding: 40px 0; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03); overflow: hidden; border: 1px solid #e2e8f0; }
            .header { background: #ffffff; padding: 32px; text-align: center; border-bottom: 1px solid #f1f5f9; }
            .logo { font-size: 28px; font-weight: 800; color: #0f172a; letter-spacing: -1px; text-decoration: none; }
            .logo span { color: #f97316; }
            .hero { padding: 40px 32px; text-align: center; background: linear-gradient(180deg, #fff7ed 0%, #ffffff 100%); }
            .content { padding: 0 32px 32px 32px; }
            .avatar-group { margin-bottom: 24px; }
            .avatar { width: 64px; height: 64px; border-radius: 50%; background: #f97316; color: white; display: inline-flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 700; border: 4px solid white; box-shadow: 0 4px 6px -1px rgba(249, 115, 22, 0.2); }
            h2 { margin: 0 0 16px 0; color: #0f172a; font-size: 24px; letter-spacing: -0.5px; }
            p { margin: 0 0 24px 0; color: #475569; font-size: 16px; }
            .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; text-align: left; margin-bottom: 32px; }
            .card-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
            .card-row:last-child { margin-bottom: 0; }
            .label { font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; font-weight: 600; }
            .value { font-size: 14px; color: #0f172a; font-weight: 600; }
            .btn { display: inline-block; background: #f97316; color: white !important; font-weight: 600; padding: 16px 32px; border-radius: 100px; text-decoration: none; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(249, 115, 22, 0.4); transition: all 0.2s; }
            .btn:hover { background: #ea580c; transform: translateY(-1px); box-shadow: 0 6px 8px -1px rgba(249, 115, 22, 0.5); }
            .footer { background: #f8fafc; padding: 24px; text-align: center; font-size: 13px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
            .link { color: #f97316; text-decoration: none; font-weight: 500; }
        </style>
    </head>
    <body>
        <div class="wrapper">
            <div class="container">
                <div class="header">
                    <a href="#" class="logo">Flux<span>o.</span></a>
                </div>
                <div class="hero">
                    <div class="avatar-group">
                        <div class="avatar">${inviterName.charAt(0).toUpperCase()}</div>
                    </div>
                    <h2>Invitation to Collaborate</h2>
                    <p><strong>${inviterName}</strong> has invited you to join the workspace <strong>${workspaceName}</strong>.</p>
                </div>
                <div class="content">
                    <div class="card">
                        <div class="card-row">
                            <span class="label">Workspace</span>
                            <span class="value">${workspaceName}</span>
                        </div>
                        <div class="card-row">
                            <span class="label">Role</span>
                            <span class="value">Member</span>
                        </div>
                        <div class="card-row">
                            <span class="label">Invited by</span>
                            <span class="value">${inviterName}</span>
                        </div>
                    </div>
                    
                    <div style="text-align: center; margin-bottom: 40px;">
                        <a href="${acceptUrl}" class="btn">Join Workspace</a>
                    </div>
                    
                    <p style="text-align: center; font-size: 14px; color: #64748b;">
                        This invite link will expire in 7 days. If you weren't expecting this, you can safely ignore this email.
                    </p>
                </div>
                <div class="footer">
                    <p>© 2026 Fluxo Inc. Project Management Made Simple.</p>
                </div>
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

        const subject = '🎉 You\'re in! Your Fluxo account is checked and approved';
        const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Approved</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
            body { font-family: 'Plus Jakarta Sans', Arial, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f8fafc; margin: 0; padding: 0; }
            .wrapper { width: 100%; background-color: #f8fafc; padding: 40px 0; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); overflow: hidden; border: 1px solid #e2e8f0; }
            .header { background: #ffffff; padding: 32px; text-align: center; border-bottom: 1px solid #f1f5f9; }
            .logo { font-size: 28px; font-weight: 800; color: #0f172a; letter-spacing: -1px; text-decoration: none; }
            .logo span { color: #f97316; }
            .hero { padding: 48px 32px 24px; text-align: center; }
            .success-icon { width: 80px; height: 80px; background: #dcfce7; color: #16a34a; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 40px; margin-bottom: 24px; box-shadow: 0 4px 6px -1px rgba(22, 163, 74, 0.1); }
            h1 { margin: 0 0 16px 0; color: #0f172a; font-size: 30px; letter-spacing: -1px; line-height: 1.2; }
            p { margin: 0 0 24px 0; color: #475569; font-size: 17px; max-width: 460px; margin-left: auto; margin-right: auto; }
            .content { padding: 0 40px 40px; text-align: center; }
            .btn { display: inline-block; background: #f97316; color: white !important; font-weight: 600; padding: 18px 48px; border-radius: 12px; text-decoration: none; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(249, 115, 22, 0.3); transition: all 0.2s; width: 100%; box-sizing: border-box; text-align: center; }
            .btn:hover { background: #ea580c; transform: translateY(-1px); box-shadow: 0 10px 15px -3px rgba(249, 115, 22, 0.4); }
            .divider { height: 1px; background: #e2e8f0; margin: 32px 0; }
            .next-steps { text-align: left; background: #f8fafc; padding: 24px; border-radius: 12px; border: 1px solid #e2e8f0; }
            .step { display: flex; align-items: self-start; margin-bottom: 16px; }
            .step:last-child { margin-bottom: 0; }
            .step-icon { min-width: 24px; height: 24px; background: #e0f2fe; color: #0284c7; border-radius: 50%; padding: 4px; margin-right: 12px; margin-top: 2px; }
            .step-content h4 { margin: 0 0 4px 0; font-size: 15px; color: #0f172a; }
            .step-content p { font-size: 14px; margin: 0; text-align: left; }
            .footer { background: #f8fafc; padding: 24px; text-align: center; font-size: 13px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
        </style>
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
                    <p>Hi ${userName},<br>Your account has been officially approved by our admins. You now have full access to Fluxo workspace.</p>
                </div>
                <div class="content">
                    <a href="${loginUrl}" class="btn">Login to Dashboard</a>
                    
                    <div class="divider"></div>
                    
                    <div class="next-steps">
                        <div class="step">
                            <div class="step-content">
                                <h4>✅ Complete Setup</h4>
                                <p>Update your profile with a photo and bio.</p>
                            </div>
                        </div>
                        <div class="step">
                            <div class="step-content">
                                <h4>📊 Create Projects</h4>
                                <p>Start organizing your tasks and timeline.</p>
                            </div>
                        </div>
                        <div class="step">
                            <div class="step-content">
                                <h4>👥 Invite Team</h4>
                                <p>Add members to your workspace to collaborate.</p>
                            </div>
                        </div>
                    </div>
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
