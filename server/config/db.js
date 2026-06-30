import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI;

        if (!uri) {
            throw new Error("❌ MONGO_URI is missing in .env");
        }

        await mongoose.connect(uri);

        console.log("MongoDB connected ✅");
    } catch (error) {
        console.error("DB error ❌", error.message || error);
        process.exit(1);
    }
};

export default connectDB;