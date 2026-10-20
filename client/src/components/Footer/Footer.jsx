
import { Link } from "react-router-dom";
import "./Footer.scss";

export default function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="site-footer">
            <div className="site-footer__inner">
                <div className="site-footer__main">
                    <section className="site-footer__brand">
                        <Link to="/" className="site-footer__logo">
                            HARRAGA<span>.</span>
                        </Link>

                        <p>
                            Premium fashion and streetwear.
                            <br />
                            Built for your own style.
                        </p>
                    </section>

                    <nav className="site-footer__column" aria-label="Shop">
                        <h2>Shop</h2>
                        <Link to="/products">All Products</Link>
                        <Link to="/products">New Arrivals</Link>
                        <Link to="/products">Best Sellers</Link>
                    </nav>

                    <nav className="site-footer__column" aria-label="Kundservice">
                        <h2>Kundservice</h2>
                        <Link to="/kundservice">Kontakta oss</Link>
                        <Link to="/kundservice">Leverans</Link>
                        <Link to="/kundservice">Returer</Link>
                        <Link to="/kundservice">Vanliga frågor</Link>
                    </nav>

                    <nav className="site-footer__column" aria-label="Sociala medier">
                        <h2>Följ oss</h2>
                        <a
                            href="https://www.instagram.com/"
                            target="_blank"
                            rel="noreferrer"
                        >
                            Instagram ↗
                        </a>
                        <a
                            href="https://www.tiktok.com/"
                            target="_blank"
                            rel="noreferrer"
                        >
                            TikTok ↗
                        </a>
                        <a
                            href="https://www.facebook.com/"
                            target="_blank"
                            rel="noreferrer"
                        >
                            Facebook ↗
                        </a>
                    </nav>
                </div>

                <div className="site-footer__bottom">
                    <p>© {year} Harraga. All rights reserved.</p>
                    <Link to="/" className="site-footer__back-to-top">
                        Till startsidan ↑
                    </Link>
                </div>
            </div>
        </footer>
    );
}
