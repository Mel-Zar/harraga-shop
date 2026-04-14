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

// verify connection
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

        headers: {
            "X-Priority": "3",
            "X-MSMail-Priority": "Normal",
            "Importance": "Normal"
        }
    });
};

// =========================
// WELCOME EMAIL (CLEAN HTML)
// =========================
const sendWelcomeEmail = async (to, firstName) => {
    return sendEmail({
        to,
        subject: "Welcome to Harraga Shop 🎉",
        html: `
        <div style="font-family:Arial, sans-serif; padding:20px; background:#f9f9f9;">
            <div style="max-width:500px; margin:auto; background:white; padding:20px; border-radius:10px;">
                <h2 style="color:#111;">Welcome ${firstName} 👋</h2>
                <p>Your account has been successfully created.</p>
                <p>Welcome to Harraga Shop.</p>
                <hr />
                <p style="font-size:12px; color:gray;">
                    If this wasn't you, you can ignore this email.
                </p>
            </div>
        </div>
        `,
    });
};

// =========================
// RESET EMAIL
// =========================
const sendResetPasswordEmail = async (to, resetUrl) => {
    return sendEmail({
        to,
        subject: "Reset your Harraga Shop password",
        html: `
        <div style="font-family:Arial, sans-serif; padding:20px;">
            <h2>Password Reset</h2>
            <p>You requested a password reset.</p>

            <a href="${resetUrl}"
               style="display:inline-block;padding:10px 15px;background:#000;color:#fff;text-decoration:none;border-radius:5px;">
               Reset Password
            </a>

            <p style="margin-top:20px; font-size:12px; color:gray;">
                This link expires in 15 minutes.
            </p>
        </div>
        `,
    });
};

module.exports = {
    sendEmail,
    sendWelcomeEmail,
    sendResetPasswordEmail,
};
