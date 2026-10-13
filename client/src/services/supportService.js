
const API_URL = (
    import.meta.env.VITE_API_URL || "/api"
).replace(/\/$/, "");

export async function sendSupportMessage(data) {
    try {
        const response = await fetch(`${API_URL}/support`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(data),
        });

        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(
                result.message ||
                "Kunde inte skicka ditt ärende. Försök igen."
            );
        }

        return result;
    } catch (error) {
        if (error instanceof TypeError) {
            throw new Error(
                "Kunde inte ansluta till servern. Kontrollera att backend är igång."
            );
        }

        throw error;
    }
}
