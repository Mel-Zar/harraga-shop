import axios from "axios";

export const verifyCaptcha = async (token) => {
    const res = await axios.post(
        "https://api.hcaptcha.com/siteverify",
        new URLSearchParams({
            secret: process.env.HCAPTCHA_SECRET,
            response: token,
        })
    );

    return res.data.success;
}; 