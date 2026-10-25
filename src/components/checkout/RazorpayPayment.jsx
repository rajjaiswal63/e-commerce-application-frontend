import { Alert, Skeleton } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createRazorpayOrder } from "../../store/actions";

const loadRazorpayCheckout = () => new Promise((resolve, reject) => {
    if (window.Razorpay) {
        resolve();
        return;
    }

    const existingScript = document.querySelector('script[data-razorpay-checkout="true"]');
    if (existingScript) {
        existingScript.addEventListener("load", () => resolve(), { once: true });
        existingScript.addEventListener("error", () => reject(new Error("Could not load Razorpay Checkout.")), { once: true });
        return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.dataset.razorpayCheckout = "true";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Could not load Razorpay Checkout. Check your internet connection."));
    document.body.appendChild(script);
});

const RazorpayPayment = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const orderRequested = useRef(false);
    const [checkoutReady, setCheckoutReady] = useState(Boolean(window.Razorpay));
    const [checkoutError, setCheckoutError] = useState("");
    const { razorpayOrder, user, selectedUserCheckoutAddress } = useSelector((state) => state.auth);
    const { isLoading, errorMessage } = useSelector((state) => state.errors);
    const addressId = selectedUserCheckoutAddress?.addressId;

    useEffect(() => {
        let active = true;
        loadRazorpayCheckout()
            .then(() => active && setCheckoutReady(true))
            .catch((error) => active && setCheckoutError(error.message));
        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        if (!razorpayOrder && addressId && !orderRequested.current) {
            orderRequested.current = true;
            dispatch(createRazorpayOrder(addressId)).then((order) => {
                if (!order) orderRequested.current = false;
            });
        }
    }, [dispatch, razorpayOrder, addressId]);

    const retryOrder = () => {
        if (orderRequested.current || !addressId) return;
        setCheckoutError("");
        orderRequested.current = true;
        dispatch(createRazorpayOrder(addressId)).then((order) => {
            if (!order) orderRequested.current = false;
        });
    };

    const handlePayment = () => {
        const key = import.meta.env.VITE_RAZORPAY_KEY_ID;
        if (!key) {
            setCheckoutError("Add VITE_RAZORPAY_KEY_ID to the frontend .env file and restart Vite.");
            return;
        }
        if (!window.Razorpay || !razorpayOrder) {
            setCheckoutError("Razorpay Checkout is still loading. Please try again.");
            return;
        }

        setCheckoutError("");
        const options = {
            key,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            name: "E-Shop",
            description: "E-commerce order",
            order_id: razorpayOrder.orderId,
            prefill: {
                name: user?.username || "",
                email: user?.email || "",
            },
            theme: { color: "#2563eb" },
            handler: (response) => {
                const params = new URLSearchParams({
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                });
                navigate("/order-confirm?" + params.toString());
            },
        };

        const checkout = new window.Razorpay(options);
        checkout.on("payment.failed", (response) => {
            setCheckoutError(response?.error?.description || "Payment failed. You can retry the payment.");
        });
        checkout.open();
    };

    if (isLoading && !razorpayOrder) {
        return <div className="max-w-lg mx-auto"><Skeleton /></div>;
    }

    const missingPublicKey = !import.meta.env.VITE_RAZORPAY_KEY_ID;
    const message = checkoutError || errorMessage
        || (!addressId ? "Select a delivery address before starting payment."
            : missingPublicKey ? "Add VITE_RAZORPAY_KEY_ID to the frontend .env file and restart Vite." : "");
    const canPay = checkoutReady && Boolean(razorpayOrder) && Boolean(addressId) && !missingPublicKey;

    return (
        <div className="max-w-lg mx-auto p-5">
            <h2 className="text-xl font-semibold mb-3">Razorpay Secure Checkout</h2>
            <p className="text-gray-600 mb-4">Your payment details are entered securely in Razorpay Checkout.</p>
            {message && <Alert severity="error" className="mb-4">{message}</Alert>}
            {errorMessage && !razorpayOrder && !isLoading && (
                <button type="button" onClick={retryOrder} className="text-blue-700 underline mb-4">Retry creating payment order</button>
            )}
            <button
                type="button"
                onClick={handlePayment}
                disabled={!canPay}
                className="text-white w-full px-5 py-3 bg-blue-600 rounded-md font-semibold disabled:opacity-50"
            >
                {razorpayOrder ? "Continue to Razorpay" : "Preparing payment"}
            </button>
        </div>
    );
};

export default RazorpayPayment;