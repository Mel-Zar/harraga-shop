import User from "../models/User.js";
import { getCountryCode } from "./countryController.js";

// =========================
// ADDRESS SEARCH (EXTERNAL API)
// =========================
export const searchAddress = async (req, res) => {
    try {
        const qRaw = req.query?.q;
        const countryRaw = req.query?.country;

        if (typeof qRaw !== "string" || typeof countryRaw !== "string") {
            return res.status(200).json([]);
        }

        const q = qRaw.trim();
        const country = countryRaw.trim();

        if (!q || !country) {
            return res.status(200).json([]);
        }

        if (q.length > 150 || country.length > 80) {
            return res.status(200).json([]);
        }

        const countryCodeRaw = getCountryCode(country);

        if (!countryCodeRaw || typeof countryCodeRaw !== "string") {
            return res.status(200).json([]);
        }

        const countryCode = countryCodeRaw.toLowerCase().trim();

        const smartQuery = `${q}, ${country}`;

        const url = new URL("https://nominatim.openstreetmap.org/search");
        url.searchParams.set("format", "jsonv2");
        url.searchParams.set("addressdetails", "1");
        url.searchParams.set("limit", "10");
        url.searchParams.set("dedupe", "1");
        url.searchParams.set("q", smartQuery);
        url.searchParams.set("countrycodes", countryCode);

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000);

        let response;

        try {
            response = await fetch(url.toString(), {
                method: "GET",
                headers: {
                    "User-Agent": "workhub-app/1.0",
                    "Accept": "application/json",
                },
                signal: controller.signal,
            });
        } catch (err) {
            clearTimeout(timeout);
            return res.status(200).json([]);
        }

        clearTimeout(timeout);

        if (!response.ok) {
            return res.status(200).json([]);
        }

        const data = await response.json();

        const cleaned = Array.isArray(data)
            ? data
                .filter((i) => i?.address)
                .map((i) => ({
                    display_name: i.display_name,
                    address: i.address,
                }))
            : [];

        return res.status(200).json(cleaned);
    } catch (err) {
        console.error(err);
        return res.status(200).json([]);
    }
};

// =========================
// ADD ADDRESS (MONGODB)
// =========================
export const addAddress = async (req, res) => {
    try {
        const userId = req.user.id;

        const {
            id,
            fullName,
            phone,
            street,
            city,
            postalCode,
            country,
        } = req.body;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const newAddress = {
            id: id || Date.now(),
            fullName,
            phone,
            street,
            city,
            postalCode,
            country,
        };

        user.addresses.push(newAddress);

        await user.save();

        return res.status(200).json({
            message: "Address added",
            addresses: user.addresses,
        });
    } catch (err) {
        console.error("ADD ADDRESS ERROR:", err);
        return res.status(500).json({ message: "Server error" });
    }
};

// =========================
// GET ADDRESSES
// =========================
export const getAddresses = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json(user.addresses || []);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

// =========================
// DELETE ADDRESS
// =========================
export const deleteAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const id = req.params.id;

        user.addresses = user.addresses.filter(
            (a) => String(a.id) !== String(id)
        );

        await user.save();

        return res.status(200).json({
            message: "Address deleted",
            addresses: user.addresses,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};