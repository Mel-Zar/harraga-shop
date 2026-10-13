
import SupportTicket from "../models/SupportTicket.js";
import { sendSupportEmail } from "../services/emailService.js";

const allowedTypes = [
    "Reklamation",
    "Retur och återbetalning",
    "Leverans och frakt",
    "Orderfråga",
    "Betalning",
    "Produktfråga",
    "Övrigt",
];

export async function createSupportTicket(req, res) {
    try {
        const {
            name = "",
            email,
            type,
            orderNumber = "",
            subject,
            message,
        } = req.body ?? {};

        if (
            typeof name !== "string" ||
            typeof email !== "string" ||
            typeof type !== "string" ||
            typeof orderNumber !== "string" ||
            typeof subject !== "string" ||
            typeof message !== "string"
        ) {
            return res.status(400).json({
                message: "Kontrollera att alla fält har rätt format.",
            });
        }

        const cleanName = name.trim();
        const cleanEmail = email.trim().toLowerCase();
        const cleanOrderNumber = orderNumber.trim();
        const cleanSubject = subject.trim();
        const cleanMessage = message.trim();

        if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail) ||
            cleanEmail.length > 254
        ) {
            return res.status(400).json({
                message: "Ange en giltig e-postadress.",
            });
        }

        if (!allowedTypes.includes(type)) {
            return res.status(400).json({
                message: "Välj en giltig ärendetyp.",
            });
        }

        if (
            cleanName.length > 100 ||
            cleanOrderNumber.length > 100 ||
            !cleanSubject ||
            cleanSubject.length > 150 ||
            !cleanMessage ||
            cleanMessage.length > 5000
        ) {
            return res.status(400).json({
                message: "Kontrollera att alla fält är korrekt ifyllda.",
            });
        }

        const ticket = await SupportTicket.create({
            name: cleanName,
            email: cleanEmail,
            type,
            orderNumber: cleanOrderNumber,
            subject: cleanSubject,
            message: cleanMessage,
        });

        let emailSent = false;

        try {
            const result = await sendSupportEmail(ticket);
            emailSent = Boolean(result);
        } catch (emailError) {
            console.error(
                "Kundärendet sparades, men e-postutskicket misslyckades:",
                emailError
            );
        }

        return res.status(201).json({
            message: emailSent
                ? "Ditt ärende har skickats till kundservice."
                : "Ditt ärende har sparats, men e-postbekräftelse saknas.",
            ticketId: ticket._id,
            emailSent,
        });
    } catch (error) {
        console.error("Fel vid skapande av kundserviceärende:", error);

        return res.status(500).json({
            message: "Ett fel uppstod. Försök igen senare.",
        });
    }
}
