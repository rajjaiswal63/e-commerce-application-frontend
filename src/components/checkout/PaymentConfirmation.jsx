import React, { useEffect, useRef, useState } from "react";
import { Alert, Button, Skeleton } from "@mui/material";
import { FaCheckCircle } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { razorpayPaymentConfirmation } from "../../store/actions";
import { formatPrice } from "../../utils/formatPrice";
import toast from "react-hot-toast";

const PaymentConfirmation = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const searchParams = new URLSearchParams(location.search);
    const dispatch = useDispatch();
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [orderCreated, setOrderCreated] = useState(false);
    const [confirmedOrder, setConfirmedOrder] = useState(null);
    const [retryVersion, setRetryVersion] = useState(0);
    const confirmationStarted = useRef(false);
    const razorpayOrderId = searchParams.get("razorpay_order_id");
    const razorpayPaymentId = searchParams.get("razorpay_payment_id");
    const razorpaySignature = searchParams.get("razorpay_signature");

    useEffect(() => {
        if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
            setErrorMessage("Razorpay payment confirmation details are missing. Please contact support.");
            return;
        }

        if (sessionStorage.getItem("confirmedRazorpayPayment") === razorpayPaymentId) {
            setOrderCreated(true);
            try {
                setConfirmedOrder(JSON.parse(sessionStorage.getItem("confirmedRazorpayOrder") || "null"));
            } catch {
                setConfirmedOrder(null);
            }
            return;
        }

        if (confirmationStarted.current) return;
        confirmationStarted.current = true;
        const savedAddress = localStorage.getItem("CHECKOUT_ADDRESS");
        let addressId = null;
        try {
            addressId = savedAddress ? JSON.parse(savedAddress)?.addressId || null : null;
        } catch {
            addressId = null;
        }

        const sendData = { razorpayOrderId, razorpayPaymentId, razorpaySignature, addressId };
        dispatch(razorpayPaymentConfirmation(sendData, setErrorMessage, setLoading, toast))
            .then((result) => {
                setOrderCreated(Boolean(result?.success));
                setConfirmedOrder(result?.order || null);
            });
    }, [razorpayOrderId, razorpayPaymentId, razorpaySignature, dispatch, retryVersion]);

    const retryConfirmation = () => {
        confirmationStarted.current = false;
        setErrorMessage("");
        setRetryVersion((current) => current + 1);
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            {loading ? (
                <div className="max-w-xl mx-auto"><Skeleton /></div>
            ) : errorMessage ? (
                <div className="max-w-xl mx-auto text-center space-y-4">
                    <Alert severity="error">{errorMessage}</Alert>
                    <Button variant="contained" onClick={retryConfirmation}>Retry order confirmation</Button>
                </div>
            ) : !orderCreated ? (
                <Alert severity="info" className="max-w-xl mx-auto">Verifying your Razorpay payment and creating the order…</Alert>
            ) : (
                <div className="p-8 rounded-lg shadow-lg text-center max-w-md mx-auto border border-gray-200">
                    <div className="text-green-500 mb-4 flex justify-center">
                        <FaCheckCircle size={64} />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">Order placed successfully</h2>
                    {confirmedOrder && (
                        <div className="text-gray-700 space-y-2 mb-6">
                            <p>Order #{confirmedOrder.orderId}</p>
                            <p>Status: {confirmedOrder.orderStatus}</p>
                            <p>Total: {formatPrice(confirmedOrder.totalAmount)}</p>
                        </div>
                    )}
                    <Button variant="contained" onClick={() => navigate("/profile/orders")}>View my orders</Button>
                </div>
            )}
        </div>
    );
};

export default PaymentConfirmation;