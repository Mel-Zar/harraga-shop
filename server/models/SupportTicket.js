
import mongoose from "mongoose";

const supportTicketSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            maxlength: 100,
            default: "",
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            maxlength: 254,
        },
        type: {
            type: String,
            required: true,
            enum: [
                "Reklamation",
                "Retur och återbetalning",
                "Leverans och frakt",
                "Orderfråga",
                "Betalning",
                "Produktfråga",
                "Övrigt",
            ],
        },
        orderNumber: {
            type: String,
            trim: true,
            maxlength: 100,
            default: "",
        },
        subject: {
            type: String,
            required: true,
            trim: true,
            maxlength: 150,
        },
        message: {
            type: String,
            required: true,
            trim: true,
            maxlength: 5000,
        },
        status: {
            type: String,
            enum: ["Ny", "Pågående", "Besvarad", "Stängd"],
            default: "Ny",
        },
    },
    { timestamps: true }
);

const SupportTicket = mongoose.model(
    "SupportTicket",
    supportTicketSchema
);

export default SupportTicket;
