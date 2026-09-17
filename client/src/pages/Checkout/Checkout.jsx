import {
    useEffect,
    useState,
} from "react";

import { useCart } from "../../context/useCart";

import { useNavigate } from "react-router-dom";

import { toast } from "react-toastify";

import {
    getAddresses,
    addAddress,
} from "../../services/userService";

import AddressInput from "../../components/address/AddressInput.jsx";

import {
    createOrder,
    createPayment,
} from "../../services/orderService";

function Checkout() {

    const {
        cartItems,
        clearCart,
    } = useCart();

    const navigate =
        useNavigate();


    // ============================================
    // 👤 AUTHENTICATION
    // ============================================

    const token =
        localStorage.getItem("token");

    const isLoggedIn =
        Boolean(
            token &&
            token !== "null" &&
            token !== "undefined"
        );


    // ============================================
    // 📍 SAVED ADDRESSES
    // ============================================

    const [addresses, setAddresses] =
        useState([]);

    const [selectedAddressId, setSelectedAddressId] =
        useState("");

    const [useNewAddress, setUseNewAddress] =
        useState(!isLoggedIn);

    const [saveNewAddress, setSaveNewAddress] =
        useState(false);

    const [makeNewAddressDefault, setMakeNewAddressDefault] =
        useState(false);

    const [addressesLoading, setAddressesLoading] =
        useState(false);


    // ============================================
    // 🌍 COUNTRIES
    // ============================================

    const [countries, setCountries] =
        useState([]);


    // ============================================
    // 📝 CHECKOUT FORM
    // ============================================

    const [form, setForm] =
        useState({
            name: "",
            email: "",
            address: "",
            phone: "",
            city: "",
            postalCode: "",
            country: "",
            countryCode: "",
            addressVerified: false,
        });


    // ============================================
    // 💳 PAYMENT METHOD
    // ============================================

    const [paymentMethod, setPaymentMethod] =
        useState("cod");


    // ============================================
    // 🔒 SUBMIT STATE
    // ============================================

    const [isSubmitting, setIsSubmitting] =
        useState(false);


    // ============================================
    // 🌍 LOAD COUNTRIES
    // ============================================

    useEffect(() => {

        const fetchCountries =
            async () => {

                try {

                    const response =
                        await fetch(
                            `${import.meta.env.VITE_API_URL}/api/countries`
                        );

                    const data =
                        await response.json();

                    console.log(
                        "📦 CHECKOUT COUNTRIES:",
                        data
                    );

                    if (
                        Array.isArray(data)
                    ) {

                        setCountries(
                            data
                        );

                    } else if (
                        data &&
                        typeof data ===
                        "object"
                    ) {

                        setCountries(
                            Object.values(data)
                        );

                    } else {

                        setCountries([]);

                    }

                } catch (error) {

                    console.error(
                        "GET CHECKOUT COUNTRIES ERROR:",
                        error
                    );

                    setCountries([]);

                    toast.error(
                        "Failed to load countries."
                    );

                }

            };

        fetchCountries();

    }, []);


    // ============================================
    // 📍 LOAD SAVED ADDRESSES
    // ============================================

    useEffect(() => {

        const fetchAddresses =
            async () => {

                if (!isLoggedIn) {
                    return;
                }

                try {

                    setAddressesLoading(
                        true
                    );

                    const data =
                        await getAddresses(
                            token
                        );

                    let loadedAddresses = [];

                    if (
                        Array.isArray(data)
                    ) {

                        loadedAddresses =
                            data;

                    } else if (
                        Array.isArray(
                            data?.addresses
                        )
                    ) {

                        loadedAddresses =
                            data.addresses;

                    }

                    setAddresses(
                        loadedAddresses
                    );


                    // ============================================
                    // ⭐ AUTOMATICALLY SELECT PRIMARY ADDRESS
                    // ============================================

                    if (
                        loadedAddresses.length > 0
                    ) {

                        const defaultAddress =
                            loadedAddresses.find(
                                (address) =>
                                    address.isDefault === true
                            );

                        const addressToSelect =
                            defaultAddress ||
                            loadedAddresses[0];

                        const addressId =
                            addressToSelect._id ||
                            addressToSelect.id;

                        setSelectedAddressId(
                            String(
                                addressId
                            )
                        );

                        setUseNewAddress(
                            false
                        );

                        setForm(
                            (previousForm) => ({
                                ...previousForm,

                                name:
                                    addressToSelect.fullName ||
                                    previousForm.name,

                                phone:
                                    addressToSelect.phone ||
                                    previousForm.phone,

                                address:
                                    addressToSelect.street ||
                                    previousForm.address,

                                city:
                                    addressToSelect.city ||
                                    previousForm.city,

                                postalCode:
                                    addressToSelect.postalCode ||
                                    previousForm.postalCode,

                                country:
                                    addressToSelect.country ||
                                    previousForm.country,

                                countryCode:
                                    addressToSelect.countryCode ||
                                    previousForm.countryCode,

                                addressVerified:
                                    true,
                            })
                        );

                    } else {

                        setUseNewAddress(
                            true
                        );

                    }

                } catch (error) {

                    console.error(
                        "GET CHECKOUT ADDRESSES ERROR:",
                        error
                    );

                    toast.error(
                        error?.message ||
                        "Failed to load saved addresses."
                    );

                    setUseNewAddress(
                        true
                    );

                } finally {

                    setAddressesLoading(
                        false
                    );

                }

            };

        fetchAddresses();

    }, [
        isLoggedIn,
        token,
    ]);


    // ============================================
    // 💰 PRICING
    // ============================================

    const subtotal =
        cartItems.reduce(
            (total, item) =>
                total +
                Number(
                    item.price || 0
                ) *
                Number(
                    item.quantity || 0
                ),
            0
        );


    const tax =
        subtotal * 0.25;


    const shipping =
        cartItems.length > 0
            ? 49
            : 0;


    const totalPrice =
        subtotal +
        tax +
        shipping;


    // ============================================
    // 📦 TOTAL ITEMS
    // ============================================

    const totalItems =
        cartItems.reduce(
            (total, item) =>
                total +
                Number(
                    item.quantity || 0
                ),
            0
        );


    // ============================================
    // 📝 HANDLE FORM CHANGE
    // ============================================

    const handleChange = (
        e
    ) => {

        const {
            name,
            value,
        } = e.target;


        setForm(
            (previousForm) => ({
                ...previousForm,
                [name]: value,

                ...(name === "address"
                    ? {
                        addressVerified:
                            false,
                    }
                    : {}),
            })
        );

    };


    // ============================================
    // 🌍 HANDLE COUNTRY CHANGE
    // ============================================

    const handleCountryChange = (
        e
    ) => {

        const selectedCountry =
            e.target.value;

        setForm(
            (previousForm) => ({
                ...previousForm,

                country:
                    selectedCountry,

                countryCode:
                    "",

                addressVerified:
                    false,
            })
        );

    };


    // ============================================
    // 📍 HANDLE SAVED ADDRESS CHANGE
    // ============================================

    const handleAddressSelection = (
        e
    ) => {

        const value =
            e.target.value;


        if (
            value === "new"
        ) {

            setSelectedAddressId(
                ""
            );

            setUseNewAddress(
                true
            );

            setForm(
                (previousForm) => ({
                    ...previousForm,
                    addressVerified:
                        false,
                })
            );

            return;

        }


        const selectedAddress =
            addresses.find(
                (address) =>
                    String(
                        address._id ||
                        address.id
                    ) ===
                    String(value)
            );


        if (!selectedAddress) {
            return;
        }


        setSelectedAddressId(
            String(value)
        );

        setUseNewAddress(
            false
        );


        setForm(
            (previousForm) => ({
                ...previousForm,

                name:
                    selectedAddress.fullName ||
                    "",

                phone:
                    selectedAddress.phone ||
                    "",

                address:
                    selectedAddress.street ||
                    "",

                city:
                    selectedAddress.city ||
                    "",

                postalCode:
                    selectedAddress.postalCode ||
                    "",

                country:
                    selectedAddress.country ||
                    "",

                countryCode:
                    selectedAddress.countryCode ||
                    "",

                addressVerified:
                    true,
            })
        );

    };


    // ============================================
    // 🧹 NORMALIZE FORM
    // ============================================

    const normalizedForm = {

        name:
            form.name.trim(),

        email:
            form.email.trim(),

        address:
            form.address.trim(),

        phone:
            form.phone.trim(),

        city:
            form.city.trim(),

        postalCode:
            form.postalCode.trim(),

        country:
            form.country.trim(),

        countryCode:
            form.countryCode?.trim() ||
            "",

        addressVerified:
            Boolean(
                form.addressVerified
            ),
    };


    // ============================================
    // 📧 EMAIL VALIDATION
    // ============================================

    const isValidEmail = (
        email
    ) => {

        if (!email) {
            return true;
        }


        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
            email
        );

    };


    // ============================================
    // 📞 PHONE VALIDATION
    // ============================================

    const isValidPhone = (
        phone
    ) => {

        return /^[0-9+\s()-]{7,20}$/.test(
            phone
        );

    };


    // ============================================
    // 💾 SAVE NEW ADDRESS
    // ============================================

    const saveAddressToBook =
        async () => {

            if (
                !isLoggedIn ||
                !saveNewAddress
            ) {
                return;
            }


            const addressData = {

                fullName:
                    normalizedForm.name,

                phone:
                    normalizedForm.phone,

                street:
                    normalizedForm.address,

                city:
                    normalizedForm.city,

                postalCode:
                    normalizedForm.postalCode,

                country:
                    normalizedForm.country,

                isDefault:
                    makeNewAddressDefault,

            };


            const response =
                await addAddress(
                    token,
                    addressData
                );


            let savedAddresses = [];

            if (
                Array.isArray(response)
            ) {

                savedAddresses =
                    response;

            } else if (
                Array.isArray(
                    response?.addresses
                )
            ) {

                savedAddresses =
                    response.addresses;

            }


            if (
                savedAddresses.length > 0
            ) {

                setAddresses(
                    savedAddresses
                );

            }

        };


    // ============================================
    // 🛒 CREATE ORDER
    // ============================================

    const handleSubmit = async (
        e
    ) => {

        e.preventDefault();


        // ============================================
        // 🛒 CART VALIDATION
        // ============================================

        if (
            !cartItems.length
        ) {

            toast.warning(
                "Your cart is empty!"
            );

            return;
        }


        // ============================================
        // 📝 REQUIRED FORM VALIDATION
        // ============================================

        if (
            !normalizedForm.name ||
            !normalizedForm.address ||
            !normalizedForm.phone ||
            !normalizedForm.country
        ) {

            toast.error(
                "Please fill all required fields."
            );

            return;
        }


        // ============================================
        // 📍 GOOGLE ADDRESS VALIDATION
        // ============================================

        if (
            useNewAddress &&
            !normalizedForm.addressVerified
        ) {

            toast.warning(
                "Please select a valid address from the address suggestions."
            );

            return;
        }


        // ============================================
        // 📧 EMAIL VALIDATION
        // ============================================

        if (
            normalizedForm.email &&
            !isValidEmail(
                normalizedForm.email
            )
        ) {

            toast.error(
                "Please enter a valid email address."
            );

            return;
        }


        // ============================================
        // 📞 PHONE VALIDATION
        // ============================================

        if (
            !isValidPhone(
                normalizedForm.phone
            )
        ) {

            toast.error(
                "Please enter a valid phone number."
            );

            return;
        }


        // ============================================
        // 🔒 PREVENT DOUBLE SUBMIT
        // ============================================

        if (
            isSubmitting
        ) {

            return;

        }


        setIsSubmitting(
            true
        );


        try {

            // ============================================
            // 💾 SAVE NEW ADDRESS IF REQUESTED
            // ============================================

            if (
                useNewAddress &&
                saveNewAddress &&
                isLoggedIn
            ) {

                await saveAddressToBook();

            }


            // ============================================
            // 📦 CREATE SAFE ORDER PAYLOAD
            // ============================================

            const order = {

                customer: {

                    name:
                        normalizedForm.name,

                    email:
                        normalizedForm.email,

                    phone:
                        normalizedForm.phone,

                    address:
                        normalizedForm.address,

                    city:
                        normalizedForm.city,

                    postalCode:
                        normalizedForm.postalCode,

                    country:
                        normalizedForm.country,

                },


                items:
                    cartItems.map(
                        (item) => ({

                            productId:
                                item._id,

                            name:
                                item.name,

                            image:
                                item.images?.[0] ||
                                item.image ||
                                "",

                            price:
                                Number(
                                    item.price
                                ),

                            quantity:
                                Number(
                                    item.quantity
                                ) || 1,

                        })
                    ),


                pricing: {

                    subtotal,

                    tax,

                    shipping,

                    total:
                        totalPrice,

                },


                payment: {

                    method:
                        paymentMethod,

                    status:
                        "pending",

                },

            };


            // ============================================
            // 🚀 SEND ORDER
            // ============================================

            const data =
                await createOrder(
                    order
                );


            console.log(
                "ORDER CREATED:",
                data
            );


            // ============================================
            // ❗ VERIFY BACKEND RESPONSE
            // ============================================

            if (
                !data ||
                data.success === false
            ) {

                throw new Error(
                    data?.message ||
                    "Failed to create order."
                );

            }


            // ============================================
            // 💳 CREATE PAYMENT
            // ============================================

            if (
                paymentMethod !== "cod"
            ) {

                const createdOrder =
                    data.order ||
                    data.data ||
                    data;


                const orderId =
                    createdOrder?._id ||
                    createdOrder?.id;


                if (!orderId) {

                    throw new Error(
                        "Order was created, but no order ID was returned."
                    );

                }


                const paymentData =
                    await createPayment(
                        orderId,
                        paymentMethod
                    );


                console.log(
                    "PAYMENT RESPONSE:",
                    paymentData
                );


                // ============================================
                // ❗ VERIFY PAYMENT RESPONSE
                // ============================================

                if (
                    !paymentData ||
                    paymentData.success === false
                ) {

                    throw new Error(
                        paymentData?.message ||
                        "Failed to create payment."
                    );

                }


                // ============================================
                // 💳 STRIPE / KLARNA
                // ============================================

                if (
                    paymentData.checkoutUrl
                ) {

                    toast.success(
                        "Order created. Redirecting to payment..."
                    );


                    window.location.href =
                        paymentData.checkoutUrl;


                    return;

                }


                // ============================================
                // 📱 SWISH
                // ============================================

                if (
                    paymentMethod === "swish"
                ) {

                    toast.success(
                        "Swish payment created. Please complete your payment."
                    );


                    clearCart(
                        false
                    );


                    navigate(
                        `/orders/${orderId}`
                    );


                    return;

                }


                throw new Error(
                    "Payment was created but no payment URL was returned."
                );

            }


            // ============================================
            // ✅ COD SUCCESS
            // ============================================

            toast.success(
                "Order placed successfully!"
            );


            // ============================================
            // 🧹 CLEAR CART
            // ============================================

            clearCart(
                false
            );


            // ============================================
            // 🏠 GO HOME
            // ============================================

            navigate(
                "/"
            );


        } catch (
        error
        ) {

            console.error(
                "ORDER ERROR:",
                error
            );


            const message =
                error?.response?.data
                    ?.message ||
                error?.message ||
                "Failed to place order. Please try again.";


            toast.error(
                message
            );

        } finally {

            // ============================================
            // 🔓 ENABLE SUBMIT AGAIN
            // ============================================

            setIsSubmitting(
                false
            );

        }

    };


    // ============================================
    // 🧾 CHECKOUT PAGE
    // ============================================

    return (

        <div
            style={{
                maxWidth:
                    "900px",

                margin:
                    "0 auto",

                padding:
                    "20px",
            }}
        >

            <h1>
                Checkout 🧾
            </h1>


            <form
                onSubmit={
                    handleSubmit
                }
                noValidate
            >


                {/* ============================================
                    👤 CUSTOMER INFORMATION
                ============================================ */}

                <h2>
                    Customer Information
                </h2>


                <input
                    name="name"
                    type="text"
                    placeholder="Full Name *"
                    value={
                        form.name
                    }
                    onChange={
                        handleChange
                    }
                    required
                />


                <input
                    name="email"
                    type="email"
                    placeholder="Email"
                    value={
                        form.email
                    }
                    onChange={
                        handleChange
                    }
                />


                <input
                    name="phone"
                    type="tel"
                    placeholder="Phone *"
                    value={
                        form.phone
                    }
                    onChange={
                        handleChange
                    }
                    required
                />


                {/* ============================================
                    📍 SHIPPING INFORMATION
                ============================================ */}

                <h2>
                    Shipping Information
                </h2>


                {/* ============================================
                    📍 SAVED ADDRESS SELECTOR
                ============================================ */}

                {isLoggedIn && (
                    <div
                        style={{
                            marginBottom:
                                "20px",
                        }}
                    >

                        <h3>
                            Saved Addresses
                        </h3>


                        {addressesLoading ? (

                            <p>
                                Loading saved addresses...
                            </p>

                        ) : addresses.length > 0 ? (

                            <>

                                <select
                                    value={
                                        useNewAddress
                                            ? "new"
                                            : selectedAddressId
                                    }
                                    onChange={
                                        handleAddressSelection
                                    }
                                >

                                    {addresses.map(
                                        (address) => {

                                            const addressId =
                                                address._id ||
                                                address.id;

                                            return (

                                                <option
                                                    key={
                                                        addressId
                                                    }
                                                    value={
                                                        addressId
                                                    }
                                                >
                                                    {address.fullName}
                                                    {" - "}
                                                    {address.street}
                                                    {" - "}
                                                    {address.city}
                                                    {
                                                        address.isDefault
                                                            ? " (Primary)"
                                                            : ""
                                                    }
                                                </option>

                                            );

                                        }
                                    )}


                                    <option
                                        value="new"
                                    >
                                        Use a new address
                                    </option>

                                </select>


                                {addresses.some(
                                    (address) =>
                                        address.isDefault ===
                                        true
                                ) && !useNewAddress && (

                                        <p>
                                            ★ Primary address selected
                                        </p>

                                    )}

                            </>

                        ) : (

                            <p>
                                No saved addresses. Enter a new address below.
                            </p>

                        )}

                    </div>
                )}


                {/* ============================================
                    🌍 COUNTRY
                ============================================ */}

                <select
                    name="country"
                    value={
                        form.country
                    }
                    onChange={
                        handleCountryChange
                    }
                    required
                    disabled={
                        isLoggedIn &&
                        !useNewAddress &&
                        Boolean(selectedAddressId)
                    }
                >

                    <option value="">
                        Select country
                    </option>

                    {countries.map(
                        (country, index) => (

                            <option
                                key={`${country}-${index}`}
                                value={country}
                            >
                                {country}
                            </option>

                        )
                    )}

                </select>


                {/* ============================================
                    📍 GOOGLE ADDRESS SEARCH
                ============================================ */}

                {(
                    !isLoggedIn ||
                    useNewAddress ||
                    !selectedAddressId
                ) ? (

                    <AddressInput
                        form={form}
                        setForm={setForm}
                        loading={false}
                    />

                ) : (

                    <input
                        name="address"
                        type="text"
                        placeholder="Address *"
                        value={
                            form.address
                        }
                        onChange={
                            handleChange
                        }
                        required
                        disabled
                    />

                )}


                <input
                    name="city"
                    type="text"
                    placeholder="City"
                    value={
                        form.city
                    }
                    onChange={
                        handleChange
                    }
                    required
                    disabled={
                        isLoggedIn &&
                        !useNewAddress &&
                        Boolean(selectedAddressId)
                    }
                />


                <input
                    name="postalCode"
                    type="text"
                    placeholder="Postal Code"
                    value={
                        form.postalCode
                    }
                    onChange={
                        handleChange
                    }
                    required
                    disabled={
                        isLoggedIn &&
                        !useNewAddress &&
                        Boolean(selectedAddressId)
                    }
                />


                {/* ============================================
                    🆕 NEW ADDRESS OPTIONS
                ============================================ */}

                {isLoggedIn &&
                    useNewAddress && (

                        <div
                            style={{
                                marginTop:
                                    "15px",
                                marginBottom:
                                    "25px",
                            }}
                        >

                            <label
                                style={{
                                    display:
                                        "block",
                                    marginBottom:
                                        "10px",
                                }}
                            >

                                <input
                                    type="checkbox"
                                    checked={
                                        saveNewAddress
                                    }
                                    onChange={(
                                        e
                                    ) =>
                                        setSaveNewAddress(
                                            e.target.checked
                                        )
                                    }
                                />

                                {" "}
                                Save this address to my Address Book

                            </label>


                            {saveNewAddress && (

                                <label
                                    style={{
                                        display:
                                            "block",
                                    }}
                                >

                                    <input
                                        type="checkbox"
                                        checked={
                                            makeNewAddressDefault
                                        }
                                        onChange={(
                                            e
                                        ) =>
                                            setMakeNewAddressDefault(
                                                e.target.checked
                                            )
                                        }
                                    />

                                    {" "}
                                    Make this my primary address

                                </label>

                            )}

                        </div>

                    )}


                {/* ============================================
                    🧾 ORDER SUMMARY
                ============================================ */}

                <h2>
                    Order Summary
                </h2>


                <p>
                    {cartItems.length}{" "}
                    {
                        cartItems.length === 1
                            ? "product"
                            : "products"
                    }{" "}
                    ·{" "}
                    {totalItems}{" "}
                    {
                        totalItems === 1
                            ? "item"
                            : "items"
                    }
                </p>


                {!cartItems.length ? (

                    <p>
                        Your cart is empty.
                    </p>

                ) : (

                    cartItems.map(
                        (item) => {

                            const itemPrice =
                                Number(
                                    item.price ||
                                    0
                                );


                            const itemQuantity =
                                Number(
                                    item.quantity ||
                                    0
                                );


                            const itemTotal =
                                itemPrice *
                                itemQuantity;


                            const image =
                                item.images?.[0] ||
                                item.image ||
                                "";


                            const imageUrl =
                                image.startsWith(
                                    "http"
                                )
                                    ? image
                                    : `${import.meta.env.VITE_API_URL}${image}`;


                            return (

                                <div
                                    key={
                                        item._id
                                    }
                                >

                                    {/* ============================================
                                        🖼️ PRODUCT
                                    ============================================ */}

                                    {image ? (

                                        <img
                                            src={
                                                imageUrl
                                            }
                                            alt={
                                                item.name
                                            }
                                            width="100"
                                            height="100"
                                        />

                                    ) : (

                                        <div>
                                            No image
                                        </div>

                                    )}


                                    {/* ============================================
                                        📦 PRODUCT INFORMATION
                                    ============================================ */}

                                    <h3>
                                        {
                                            item.name
                                        }
                                    </h3>


                                    <p>
                                        Price per item: $
                                        {itemPrice.toFixed(
                                            2
                                        )}
                                    </p>


                                    <p>
                                        Quantity:{" "}
                                        {
                                            itemQuantity
                                        }
                                    </p>


                                    <p>
                                        Product total: $
                                        {itemTotal.toFixed(
                                            2
                                        )}
                                    </p>


                                    <hr />

                                </div>

                            );

                        }
                    )

                )}


                {/* ============================================
                    💰 PRICE BREAKDOWN
                ============================================ */}

                <h2>
                    Price Summary
                </h2>


                <p>
                    Subtotal: $
                    {subtotal.toFixed(
                        2
                    )}
                </p>


                <p>
                    Tax (25%): $
                    {tax.toFixed(
                        2
                    )}
                </p>


                <p>
                    Shipping: $
                    {shipping.toFixed(
                        2
                    )}
                </p>


                <hr />


                <h2>
                    Total: $
                    {totalPrice.toFixed(
                        2
                    )}
                </h2>


                {/* ============================================
                    📍 DELIVERY SUMMARY
                ============================================ */}

                <h2>
                    Delivery Information
                </h2>


                <p>
                    Name:{" "}
                    {normalizedForm.name ||
                        "Not provided"}
                </p>


                <p>
                    Phone:{" "}
                    {normalizedForm.phone ||
                        "Not provided"}
                </p>


                <p>
                    Address:{" "}
                    {normalizedForm.address ||
                        "Not provided"}
                </p>


                <p>
                    City:{" "}
                    {normalizedForm.city ||
                        "Not provided"}
                </p>


                <p>
                    Postal Code:{" "}
                    {normalizedForm.postalCode ||
                        "Not provided"}
                </p>


                <p>
                    Country:{" "}
                    {normalizedForm.country ||
                        "Not provided"}
                </p>


                {/* ============================================
                    💳 PAYMENT
                ============================================ */}

                <h2>
                    Payment
                </h2>


                <label>
                    <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={
                            paymentMethod === "cod"
                        }
                        onChange={() =>
                            setPaymentMethod(
                                "cod"
                            )
                        }
                    />

                    Cash on Delivery
                </label>


                <br />


                <label>
                    <input
                        type="radio"
                        name="paymentMethod"
                        value="stripe"
                        checked={
                            paymentMethod === "stripe"
                        }
                        onChange={() =>
                            setPaymentMethod(
                                "stripe"
                            )
                        }
                    />

                    Stripe
                </label>


                <br />


                <label>
                    <input
                        type="radio"
                        name="paymentMethod"
                        value="klarna"
                        checked={
                            paymentMethod === "klarna"
                        }
                        onChange={() =>
                            setPaymentMethod(
                                "klarna"
                            )
                        }
                    />

                    Klarna
                </label>


                <br />


                <label>
                    <input
                        type="radio"
                        name="paymentMethod"
                        value="swish"
                        checked={
                            paymentMethod === "swish"
                        }
                        onChange={() =>
                            setPaymentMethod(
                                "swish"
                            )
                        }
                    />

                    Swish
                </label>


                <p>
                    Payment method:{" "}
                    {
                        paymentMethod === "cod"
                            ? "Cash on Delivery"
                            : paymentMethod === "stripe"
                                ? "Stripe"
                                : paymentMethod === "klarna"
                                    ? "Klarna"
                                    : "Swish"
                    }
                </p>


                <p>
                    Payment status:
                    {" "}
                    Pending
                </p>


                {/* ============================================
                    🚀 PLACE ORDER
                ============================================ */}

                <button
                    type="submit"
                    disabled={
                        isSubmitting ||
                        !cartItems.length
                    }
                >
                    {isSubmitting
                        ? "Placing Order..."
                        : paymentMethod === "cod"
                            ? "Place Order"
                            : "Continue to Payment"}
                </button>

            </form>

        </div>

    );
}

export default Checkout;