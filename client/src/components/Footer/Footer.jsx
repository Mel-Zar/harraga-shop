function Footer() {
    return (
        <footer
            style={{
                backgroundColor: "#111",
                color: "#fff",
                padding: "40px 20px",
                marginTop: "50px",
            }}
        >
            <div
                style={{
                    maxWidth: "1200px",
                    margin: "0 auto",
                    display: "flex",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "30px",
                }}
            >
                {/* Brand */}
                <div>
                    <h2>Harraga</h2>

                    <p>
                        Premium fashion and
                        streetwear.
                    </p>
                </div>

                {/* Shop */}
                <div>
                    <h3>Shop</h3>

                    <p>New Arrivals</p>

                    <p>Best Sellers</p>

                    <p>Products</p>
                </div>

                {/* Support */}
                <div>
                    <h3>Support</h3>

                    <p>Contact Us</p>

                    <p>Shipping</p>

                    <p>Returns</p>
                </div>

                {/* Social */}
                <div>
                    <h3>Follow Us</h3>

                    <p>Instagram</p>

                    <p>TikTok</p>

                    <p>Facebook</p>
                </div>
            </div>

            <hr
                style={{
                    margin: "30px 0",
                    borderColor: "#333",
                }}
            />

            <p
                style={{
                    textAlign: "center",
                    margin: 0,
                }}
            >
                © {new Date().getFullYear()} Harraga.
                All Rights Reserved.
            </p>
        </footer>
    );
}

export default Footer;