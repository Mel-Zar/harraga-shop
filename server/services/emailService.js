
import { Resend } from "resend";

console.log(
    "Resend API key loaded:",
    Boolean(process.env.RESEND_API_KEY)
);

const resend = process.env.RESEND_API_KEY
    ? new Resend(process.env.RESEND_API_KEY.trim())
    : null;

export async function sendSupportEmail(ticket) {
    const supportEmail = process.env.SUPPORT_EMAIL?.trim();
    const fromEmail = process.env.RESEND_FROM_EMAIL?.trim();

    if (!resend || !supportEmail || !fromEmail) {
        console.warn(
            "E-post ej skickad: kontrollera RESEND_API_KEY, SUPPORT_EMAIL och RESEND_FROM_EMAIL."
        );

        return false;
    }

    try {
        const { data, error } = await resend.emails.send({
            from: fromEmail,
            to: [supportEmail],
            replyTo: ticket.email,
            subject: `Kundservice: ${ticket.type} - ${ticket.subject}`,
            text: [
                "Nytt kundserviceärende från Harraga",
                "",
                `Ärendenummer: ${ticket._id}`,
                `Namn: ${ticket.name || "Ej angivet"}`,
                `E-post: ${ticket.email}`,
                `Ärendetyp: ${ticket.type}`,
                `Ordernummer: ${ticket.orderNumber || "Ej angivet"}`,
                `Ämne: ${ticket.subject}`,
                "",
                "Meddelande:",
                ticket.message,
            ].join("\n"),
        });

        if (error) {
            console.error(
                "Resend kunde inte skicka mejlet:",
                error
            );

            return false;
        }

        if (!data?.id) {
            console.warn(
                "Resend returnerade inget e-post-ID."
            );

            return false;
        }

        console.log(
            "Kundservicemejl accepterat av Resend:",
            data.id
        );

        return true;
    } catch (error) {
        console.error(
            "Fel vid e-postutskick:",
            error
        );

        return false;
    }
}
