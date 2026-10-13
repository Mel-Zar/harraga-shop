import { useState } from "react";
import { Link } from "react-router-dom";
import { sendSupportMessage } from "../../services/supportService";

const categories = [
    "Reklamation",
    "Retur och återbetalning",
    "Leverans och frakt",
    "Orderfråga",
    "Betalning",
    "Produktfråga",
    "Övrigt",
];

const initialForm = {
    name: "",
    email: "",
    type: "Övrigt",
    orderNumber: "",
    subject: "",
    message: "",
};

export default function CustomerService() {
    const [form, setForm] = useState(initialForm);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(null);

    function handleChange(event) {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));

        setError("");
    }

    async function handleSubmit(event) {
        event.preventDefault();

        setError("");
        setSuccess(null);
        setLoading(true);

        try {
            const result = await sendSupportMessage(form);

            setSuccess({
                message: result.message,
                ticketId: result.ticketId,
                emailSent: result.emailSent,
            });

            setForm(initialForm);
        } catch (err) {
            setError(
                err.message ||
                "Kunde inte skicka ditt ärende. Försök igen."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="cs-page">
            <section className="cs-hero">
                <span className="cs-eyebrow">
                    HARRAGA CUSTOMER CARE
                </span>

                <h1>Vi finns här för dig.</h1>

                <p>
                    Har du en fråga om din beställning, en
                    reklamation eller behöver du hjälp?
                    Skicka ett meddelande så hjälper vi dig.
                </p>

                <div className="cs-hero-links">
                    <Link to="/profile/orders">
                        Mina beställningar
                    </Link>

                    <span>·</span>

                    <Link to="/products">
                        Utforska produkter
                    </Link>
                </div>
            </section>

            <section className="cs-layout">
                <aside className="cs-info">
                    <div className="cs-info-icon">✉</div>

                    <h2>Kontakta kundservice</h2>

                    <p>
                        Beskriv ditt ärende så tydligt som möjligt
                        så blir det enklare för oss att hjälpa dig.
                    </p>

                    <div className="cs-info-item">
                        <span className="cs-info-symbol">01</span>
                        <div>
                            <h3>Välj ärende</h3>
                            <p>
                                Berätta vad du behöver hjälp med.
                            </p>
                        </div>
                    </div>

                    <div className="cs-info-item">
                        <span className="cs-info-symbol">02</span>
                        <div>
                            <h3>Beskriv problemet</h3>
                            <p>
                                Lägg till ordernummer och detaljer
                                om det är relevant.
                            </p>
                        </div>
                    </div>

                    <div className="cs-info-item">
                        <span className="cs-info-symbol">03</span>
                        <div>
                            <h3>Skicka ditt ärende</h3>
                            <p>
                                Vi kan kontakta dig via din
                                angivna e-postadress.
                            </p>
                        </div>
                    </div>

                    <div className="cs-note">
                        <strong>Tips vid reklamation</strong>
                        <p>
                            Beskriv vad som är fel på produkten,
                            när du upptäckte problemet och vilket
                            ordernummer beställningen har.
                        </p>
                    </div>
                </aside>

                <section className="cs-form-card">
                    {success ? (
                        <div
                            className="cs-success"
                            role="status"
                        >
                            <div className="cs-success-icon">
                                ✓
                            </div>

                            <h2>Tack för ditt meddelande!</h2>

                            <p>{success.message}</p>

                            {success.ticketId && (
                                <p className="cs-ticket-id">
                                    Ärendenummer:
                                    <br />
                                    <strong>
                                        {success.ticketId}
                                    </strong>
                                </p>
                            )}

                            {!success.emailSent && (
                                <p className="cs-warning">
                                    Ärendet har sparats, men
                                    e-postutskicket kunde inte
                                    bekräftas. Spara gärna ditt
                                    ärendenummer.
                                </p>
                            )}

                            <button
                                type="button"
                                className="cs-submit"
                                onClick={() => {
                                    setSuccess(null);
                                    setError("");
                                }}
                            >
                                Skicka ett nytt ärende
                            </button>

                            <Link
                                to="/"
                                className="cs-back-link"
                            >
                                Tillbaka till startsidan
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className="cs-form-heading">
                                <span>VI HJÄLPER DIG</span>
                                <h2>Skicka ett meddelande</h2>
                                <p>
                                    Fyll i uppgifterna nedan.
                                    Fält markerade med * är obligatoriska.
                                </p>
                            </div>

                            <div className="cs-field">
                                <label htmlFor="cs-name">
                                    Namn
                                </label>

                                <input
                                    id="cs-name"
                                    name="name"
                                    type="text"
                                    value={form.name}
                                    onChange={handleChange}
                                    maxLength={100}
                                    autoComplete="name"
                                    placeholder="Ditt namn"
                                />
                            </div>

                            <div className="cs-field">
                                <label htmlFor="cs-email">
                                    E-postadress *
                                </label>

                                <input
                                    id="cs-email"
                                    name="email"
                                    type="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    maxLength={254}
                                    autoComplete="email"
                                    placeholder="namn@exempel.se"
                                    required
                                />
                            </div>

                            <div className="cs-field">
                                <label htmlFor="cs-type">
                                    Vad gäller ditt ärende? *
                                </label>

                                <select
                                    id="cs-type"
                                    name="type"
                                    value={form.type}
                                    onChange={handleChange}
                                    required
                                >
                                    {categories.map((category) => (
                                        <option
                                            key={category}
                                            value={category}
                                        >
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="cs-field">
                                <label htmlFor="cs-order">
                                    Ordernummer
                                </label>

                                <input
                                    id="cs-order"
                                    name="orderNumber"
                                    type="text"
                                    value={form.orderNumber}
                                    onChange={handleChange}
                                    maxLength={100}
                                    placeholder="Exempelvis #10024"
                                />

                                <small>
                                    Fyll i om ditt ärende gäller
                                    en beställning.
                                </small>
                            </div>

                            <div className="cs-field">
                                <label htmlFor="cs-subject">
                                    Ämne *
                                </label>

                                <input
                                    id="cs-subject"
                                    name="subject"
                                    type="text"
                                    value={form.subject}
                                    onChange={handleChange}
                                    maxLength={150}
                                    placeholder="Kort beskrivning av ärendet"
                                    required
                                />
                            </div>

                            <div className="cs-field">
                                <label htmlFor="cs-message">
                                    Ditt meddelande *
                                </label>

                                <textarea
                                    id="cs-message"
                                    name="message"
                                    value={form.message}
                                    onChange={handleChange}
                                    maxLength={5000}
                                    rows={7}
                                    placeholder="Beskriv hur vi kan hjälpa dig..."
                                    required
                                />

                                <small className="cs-character-count">
                                    {form.message.length}/5000 tecken
                                </small>
                            </div>

                            {error && (
                                <div
                                    className="cs-error"
                                    role="alert"
                                >
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="cs-submit"
                                disabled={loading}
                            >
                                {loading
                                    ? "Skickar ditt ärende..."
                                    : "Skicka meddelande →"}
                            </button>

                            <p className="cs-privacy">
                                Dina uppgifter används för att
                                hantera ditt kundserviceärende.
                            </p>
                        </form>
                    )}
                </section>
            </section>
        </main>
    );
}
