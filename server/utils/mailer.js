const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    pool: true,
    maxConnections: 5,
    rateLimit: true,
});

// verify SMTP connection
transporter.verify((err) => {
    if (err) {
        console.log("❌ SMTP ERROR:", err);
    } else {
        console.log("✅ Mail server ready");
    }
});

const sendEmail = async ({ to, subject, html }) => {
    if (!to || !subject || !html) {
        throw new Error("Missing email parameters");
    }

    return transporter.sendMail({
        from: {
            name: "Harraga Shop",
            address: process.env.EMAIL_USER
        },
        to,
        subject,
        html,
        replyTo: process.env.EMAIL_USER,
    });
};

// =========================
// WELCOME EMAIL
// =========================
const sendWelcomeEmail = async (to, firstName) => {
    return sendEmail({
        to,
        subject: "Welcome to Harraga Shop 🎉",
        html: `
            <div style="font-family:Arial;padding:20px">
                <h2>Welcome ${firstName} 👋</h2>
                <p>Your account is now active.</p>
            </div>
        `
    });
};

// =========================
// VERIFICATION EMAIL (NY)
// =========================
const sendVerificationEmail = async (to, verifyUrl) => {
    return sendEmail({
        to,
        subject: "Verify your email - Harraga Shop",
        html: `
            <div style="font-family:Arial;padding:20px">
                <h2>Verify your email</h2>
                <p>Click below to activate your account:</p>
                <a href="${verifyUrl}">Verify Email</a>
                <p>This link expires in 24h.</p>
            </div>
        `
    });
};

// =========================
// RESET EMAIL
// =========================
const sendResetPasswordEmail = async (to, resetUrl) => {
    return sendEmail({
        to,
        subject: "Reset your password",
        html: `
            <div style="font-family:Arial;padding:20px">
                <h2>Password Reset</h2>
                <a href="${resetUrl}">Reset Password</a>
            </div>
        `
    });
};

module.exports = {
    sendEmail,
    sendWelcomeEmail,
    sendVerificationEmail,
    sendResetPasswordEmail,
};
