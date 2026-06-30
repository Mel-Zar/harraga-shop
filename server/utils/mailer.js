import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

// =========================
// CHECK API KEY
// =========================
const apiKey = process.env.RESEND_API_KEY;

console.log("🔵 RESEND KEY CHECK:", apiKey ? "SET ✅" : "MISSING ❌");
console.log("RESEND KEY:", process.env.RESEND_API_KEY);

if (!apiKey) {
    console.error("❌ RESEND_API_KEY is missing in your .env file");
}

// =========================
// INIT RESEND SAFELY
// =========================
const resend = apiKey ? new Resend(apiKey) : null;

// =========================
// CORE EMAIL FUNCTION
// =========================
export const sendEmail = async ({ to, subject, html }) => {
    if (!to || !subject || !html) {
        throw new Error("Missing email parameters");
    }

    if (!resend) {
        throw new Error("Resend is not initialized (missing API key)");
    }

    try {
        const result = await resend.emails.send({
            from: "Harraga Shop <onboarding@resend.dev>",
            to,
            subject,
            html,
        });

        console.log("✅ Email sent:", result?.data?.id || result);
        return result;

    } catch (err) {
        console.error("❌ Email failed:", err);
        throw err;
    }
};

// =========================
// WELCOME EMAIL
// =========================
export const sendWelcomeEmail = async (to, firstName) => {
    return sendEmail({
        to,
        subject: "Welcome to Harraga Shop 🎉",
        html: `
            <div style="font-family:Arial;padding:20px">
                <h2>Welcome ${firstName} 👋</h2>
                <p>Your account is now active.</p>
            </div>
        `,
    });
};

// =========================
// VERIFICATION EMAIL
// =========================
export const sendVerificationEmail = async (to, verifyUrl) => {
    return sendEmail({
        to,
        subject: "Verify your email - Harraga Shop",
        html: `
            <div style="font-family:Arial;padding:20px">
                <h2>Verify your email</h2>
                <p>Click below to activate your account:</p>

                <a href="${verifyUrl}" style="padding:10px 16px;display:inline-block;background:black;color:white;text-decoration:none;border-radius:6px;">
                    Verify Email
                </a>

                <p>This link expires in 24 hours.</p>
            </div>
        `,
    });
};

// =========================
// RESET PASSWORD EMAIL
// =========================
export const sendResetPasswordEmail = async (to, resetUrl) => {
    return sendEmail({
        to,
        subject: "Reset your password",
        html: `
            <div style="font-family:Arial;padding:20px">
                <h2>Reset Password</h2>

                <a href="${resetUrl}" style="padding:10px 16px;display:inline-block;background:black;color:white;text-decoration:none;border-radius:6px;">
                    Reset Password
                </a>

                <p>If you didn't request this, ignore this email.</p>
            </div>
        `,
    });
};