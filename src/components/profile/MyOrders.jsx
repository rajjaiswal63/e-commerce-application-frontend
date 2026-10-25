import { Alert, Button, Pagination, Skeleton } from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../api/api";
import { formatPrice } from "../../utils/formatPrice";

const PAGE_SIZE = 10;

const MyOrders = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [pagination, setPagination] = useState({ totalPages: 0 });
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [authenticationRequired, setAuthenticationRequired] = useState(false);
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        let active = true;
        setLoading(true);
        setErrorMessage("");
        api.get("/order/users/orders", {
            params: { pageNumber: page, pageSize: PAGE_SIZE, sortBy: "orderDate", sortOrder: "desc" },
        })
            .then(({ data }) => {
                if (!active) return;
                setOrders(data.content || []);
                setPagination(data);
                setAuthenticationRequired(false);
            })
            .catch((error) => {
                if (!active) return;
                const unauthorized = error?.response?.status === 401;
                setAuthenticationRequired(unauthorized);
                setErrorMessage(unauthorized
                    ? "Your login session has expired. Sign in again to load your orders."
                    : error?.response?.data?.message || "Could not load your orders. Please try again.");
            })
            .finally(() => active && setLoading(false));

        return () => { active = false; };
    }, [page, retryCount]);

    const signInAgain = () => {
        localStorage.removeItem("auth");
        dispatch({ type: "LOG_OUT" });
        navigate("/login", { state: { from: location }, replace: true });
    };

    return (
        <main className="container mx-auto px-4 py-10 max-w-5xl">
            <h1 className="text-3xl font-bold text-slate-800 mb-6">My Orders</h1>
            {loading ? (
                <div className="space-y-4"><Skeleton height={120} /><Skeleton height={120} /></div>
            ) : errorMessage ? (
                <div className="space-y-4">
                    <Alert severity="error">{errorMessage}</Alert>
                    {authenticationRequired ? (
                        <Button variant="contained" onClick={signInAgain}>Sign in again</Button>
                    ) : (
                        <Button variant="outlined" onClick={() => setRetryCount((value) => value + 1)}>Retry</Button>
                    )}
                </div>
            ) : orders.length === 0 ? (
                <div className="rounded-lg border p-8 text-center text-gray-600">
                    No orders have been placed yet.
                </div>
            ) : (
                <>
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <article key={order.orderId} className="rounded-lg border bg-white p-5 shadow-sm">
                                <header className="flex flex-wrap items-start justify-between gap-3 border-b pb-3">
                                    <div>
                                        <h2 className="font-semibold text-slate-800">Order #{order.orderId}</h2>
                                        <p className="text-sm text-gray-500">
                                            Placed {order.orderDate ? new Date(order.orderDate).toLocaleDateString("en-IN") : ""}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold">{formatPrice(order.totalAmount || 0)}</p>
                                        <p className="text-sm text-gray-600">{order.orderStatus}</p>
                                    </div>
                                </header>
                                <div className="divide-y">
                                    {(order.orderItems || []).map((item) => (
                                        <div key={item.orderItemId} className="flex flex-wrap justify-between gap-2 py-3">
                                            <span>{item.product?.productName || "Product"} × {item.quantity}</span>
                                            <span>{formatPrice(Number(item.orderedProductPrice || 0) * Number(item.quantity || 0))}</span>
                                        </div>
                                    ))}
                                </div>
                                <footer className="border-t pt-3 text-sm text-gray-600">
                                    Payment: {order.payment?.paymentMethod || order.payment?.pgName || "Not available"}
                                </footer>
                            </article>
                        ))}
                    </div>
                    {pagination.totalPages > 1 && (
                        <div className="flex justify-center pt-6">
                            <Pagination
                                count={pagination.totalPages}
                                page={page + 1}
                                onChange={(_, value) => setPage(value - 1)}
                                color="primary"
                                shape="rounded"
                            />
                        </div>
                    )}
                </>
            )}
        </main>
    );
};

export default MyOrders;