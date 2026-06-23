import { useNavigate } from "react-router-dom";
import ProductGallery from "../ProductGallery/ProductGallery";

function HomeProductCard({ product }) {
    const navigate = useNavigate();

    return (
        <div
            style={{
                border: "1px solid #ddd",
                borderRadius: "12px",
                overflow: "hidden",
                background: "#fff",
            }}
        >
            <ProductGallery
                images={product.images}
                productName={product.name}
                imageStyle={{
                    width: "100%",
                    height: "200px",
                    objectFit: "fit",

                }}
            />

            <div
                style={{
                    padding: "15px",
                }}
            >
                <h2>{product.name}</h2>

                <p>{product.description}</p>

                <p>
                    <strong>
                        ${product.price}
                    </strong>
                </p>

                <button
                    onClick={() =>
                        navigate(
                            `/products/${product._id}`
                        )
                    }
                >
                    View Product
                </button>
            </div>
        </div>
    );
}

export default HomeProductCard;