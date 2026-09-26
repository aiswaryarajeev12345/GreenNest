import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import api from "../api/axios";
import { getImage } from "../utils/image";

const STATUS_STEPS = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
];

const PAYMENT_METHODS = [
  {
    id: "UPI",
    title: "UPI",
    description: "Google Pay, PhonePe, Paytm",
    icon: "📱",
  },
  {
    id: "CARD",
    title: "Card",
    description: "Credit or debit card",
    icon: "💳",
  },
  {
    id: "NET_BANKING",
    title: "Net Banking",
    description: "Pay using your bank",
    icon: "🏦",
  },
];

function formatMoney(value) {
  return Number(value ?? 0).toFixed(2);
}

function formatDate(value) {
  if (!value) return "N/A";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

function getStatusIndex(status) {
  const index = STATUS_STEPS.indexOf(
    String(status || "").toUpperCase()
  );

  return index === -1 ? 0 : index;
}

function createDemoTransactionId(orderId) {
  const randomPart = Math.random()
    .toString(36)
    .substring(2, 10)
    .toUpperCase();

  return `GN-DEMO-${orderId}-${randomPart}`;
}

export default function OrderDetail() {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const [paymentLoading, setPaymentLoading] =
    useState(false);

  const [paymentSuccess, setPaymentSuccess] =
    useState(false);

  const [paymentError, setPaymentError] =
    useState("");

  const [showPaymentCheckout, setShowPaymentCheckout] =
    useState(false);

  const [paymentMethod, setPaymentMethod] =
    useState("");

  const [transactionId, setTransactionId] =
    useState("");

  // Demo payment fields
  const [upiId, setUpiId] = useState("");

  const [cardNumber, setCardNumber] =
    useState("");

  const [cardName, setCardName] =
    useState("");

  const [cardExpiry, setCardExpiry] =
    useState("");

  const [cardCvv, setCardCvv] =
    useState("");

  const [selectedBank, setSelectedBank] =
    useState("");

  useEffect(() => {
    loadOrder();
  }, [id]);

  async function loadOrder() {
    try {
      setLoading(true);

      const response = await api.get(`/orders/${id}/`);

      setOrder(response.data);
    } catch (error) {
      console.error(
        "Failed to load order:",
        error
      );

      setOrder(null);
    } finally {
      setLoading(false);
    }
  }

  function openPaymentCheckout() {
    setPaymentError("");
    setPaymentSuccess(false);
    setPaymentMethod("");

    setUpiId("");
    setCardNumber("");
    setCardName("");
    setCardExpiry("");
    setCardCvv("");
    setSelectedBank("");

    setShowPaymentCheckout(true);
  }

  function closePaymentCheckout() {
    if (paymentLoading) {
      return;
    }

    setShowPaymentCheckout(false);
    setPaymentError("");
  }

  function validatePaymentDetails() {
    if (!paymentMethod) {
      return "Please choose a payment method.";
    }

    if (paymentMethod === "UPI") {
      if (!upiId.trim()) {
        return "Please enter a demo UPI ID.";
      }

      if (!upiId.includes("@")) {
        return "Please enter a valid demo UPI ID.";
      }
    }

    if (paymentMethod === "CARD") {
      if (!cardNumber.trim()) {
        return "Please enter a demo card number.";
      }

      if (
        cardNumber.replace(/\s/g, "").length !==
        16
      ) {
        return "Demo card number must contain 16 digits.";
      }

      if (!cardName.trim()) {
        return "Please enter the cardholder name.";
      }

      if (!cardExpiry.trim()) {
        return "Please enter the expiry date.";
      }

      if (!cardCvv.trim()) {
        return "Please enter the demo CVV.";
      }

      if (cardCvv.length !== 3) {
        return "Demo CVV must contain 3 digits.";
      }
    }

    if (paymentMethod === "NET_BANKING") {
      if (!selectedBank) {
        return "Please select a bank.";
      }
    }

    return "";
  }

  async function handlePayment() {
    if (!order || paymentLoading) {
      return;
    }

    const validationError =
      validatePaymentDetails();

    if (validationError) {
      setPaymentError(validationError);
      return;
    }

    try {
      setPaymentLoading(true);
      setPaymentError("");
      setPaymentSuccess(false);

      /*
       * DEMO PAYMENT ONLY.
       *
       * These fields are NOT sent to Razorpay,
       * Stripe, a bank, UPI provider, or any
       * real payment service.
       */

      await api.post(
        "/orders/create-payment/",
        {
          order_id: order.id,
        }
      );

      /*
       * Simulate payment verification.
       */

      await new Promise((resolve) =>
        setTimeout(resolve, 1500)
      );

      /*
       * Demo verification.
       */

      const response = await api.post(
        "/orders/verify-payment/",
        {
          order_id: order.id,
        }
      );

      if (response.data?.order) {
        setOrder(response.data.order);
      } else {
        await loadOrder();
      }

      const demoId =
        createDemoTransactionId(order.id);

      setTransactionId(demoId);

      setPaymentSuccess(true);
      setShowPaymentCheckout(false);
    } catch (error) {
      console.error(
        "Demo payment failed:",
        error
      );

      setPaymentError(
        error?.response?.data?.detail ||
          "Demo payment could not be completed."
      );
    } finally {
      setPaymentLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="order-detail-page">
        <div className="order-detail-container">
          <div className="loading-card order-section-card">
            Loading order details...
          </div>
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="order-detail-page">
        <div className="order-detail-container">
          <div className="error-card order-section-card">
            <h2>Order not found</h2>

            <p>
              We could not load this order.
            </p>

            <Link
              to="/dashboard"
              className="btn btn-green"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const orderStatus = String(
    order.status || "PENDING"
  ).toUpperCase();

  const currentStatusIndex =
    getStatusIndex(orderStatus);

  const totalAmount = Number(
    order.total_amount ?? 0
  );

  const items = Array.isArray(order.items)
    ? order.items
    : [];

  const calculatedSubtotal = items.reduce(
    (total, item) => {
      const quantity = Number(
        item.quantity ?? 0
      );

      const price = Number(
        item.price ?? 0
      );

      const itemSubtotal =
        item.subtotal !== undefined &&
        item.subtotal !== null
          ? Number(item.subtotal)
          : quantity * price;

      return total + itemSubtotal;
    },
    0
  );

  const subtotal =
    order.subtotal !== undefined &&
    order.subtotal !== null
      ? Number(order.subtotal)
      : calculatedSubtotal || totalAmount;

  const deliveryName =
    order.delivery_name || "N/A";

  const deliveryPhone =
    order.delivery_phone || "N/A";

  const deliveryAddress =
    order.delivery_address || "N/A";

  const deliveryCity =
    order.delivery_city || "";

  const deliveryDistrict =
    order.delivery_district || "";

  const deliveryState =
    order.delivery_state || "";

  const deliveryPincode =
    order.delivery_pincode || "";

  const fullAddress = [
    deliveryAddress,
    deliveryCity,
    deliveryDistrict,
    deliveryState,
    deliveryPincode,
  ]
    .filter(Boolean)
    .join(", ");

  const paymentStatus = String(
    order.payment_status || "PENDING"
  ).toUpperCase();

  const isPaid = paymentStatus === "PAID";

  const selectedMethod =
    PAYMENT_METHODS.find(
      (method) =>
        method.id === paymentMethod
    );

  return (
    <main className="order-detail-page">
      <div className="order-detail-container">

        <Link
          to="/dashboard"
          className="order-back-link"
        >
          ← Back to Dashboard
        </Link>

        {/* ORDER HEADER */}

        <div className="order-detail-header">
          <div>
            <span className="order-eyebrow">
              Order Details
            </span>

            <h1>
              Order #{order.id}
            </h1>

            <p>
              Order placed on{" "}
              {formatDate(
                order.created_at ||
                  order.order_date ||
                  order.created
              )}
            </p>
          </div>

          <div className="order-header-status">
            {orderStatus}
          </div>
        </div>

        {/* SUCCESS */}

        {paymentSuccess && (
          <div className="payment-success-message">
            <strong>
              ✓ Payment completed successfully
            </strong>

            <p>
              Your GreenNest demo payment has
              been verified and your order is
              confirmed.
            </p>

            {transactionId && (
              <div className="demo-transaction">
                <span>
                  Demo Transaction ID
                </span>

                <strong>
                  {transactionId}
                </strong>
              </div>
            )}
          </div>
        )}

        {/* ERROR */}

        {paymentError &&
          !showPaymentCheckout && (
            <div className="payment-error-message">
              {paymentError}
            </div>
          )}

        {/* ORDER STATUS */}

        <section className="order-section-card">
          <div className="section-heading">
            <span>Order Progress</span>

            <h2>Order Status</h2>
          </div>

          <div className="order-status-timeline">
            {STATUS_STEPS.map(
              (status, index) => {
                const isCompleted =
                  index <= currentStatusIndex;

                const isCurrent =
                  index === currentStatusIndex;

                const lineCompleted =
                  index < currentStatusIndex;

                return (
                  <div
                    key={status}
                    className={`order-status-step ${
                      isCompleted
                        ? "completed"
                        : ""
                    } ${
                      isCurrent
                        ? "active"
                        : ""
                    }`}
                  >
                    <div className="order-status-circle">
                      {isCompleted
                        ? "✓"
                        : index + 1}
                    </div>

                    <div className="order-status-label">
                      {status}
                    </div>

                    {index <
                      STATUS_STEPS.length - 1 && (
                      <div
                        className={`order-status-line ${
                          lineCompleted
                            ? "completed"
                            : ""
                        }`}
                      />
                    )}
                  </div>
                );
              }
            )}
          </div>
        </section>

        <div className="order-detail-grid">

          {/* LEFT */}

          <div className="order-detail-main">

            {/* ITEMS */}

            <section className="order-section-card">
              <div className="section-heading">
                <span>Your Purchase</span>

                <h2>Order Items</h2>
              </div>

              <div className="order-items-list">

                {items.length === 0 ? (
                  <p>
                    No items found in this order.
                  </p>
                ) : (
                  items.map((item, index) => {
                    const quantity =
                      Number(
                        item.quantity ?? 0
                      );

                    const price =
                      Number(
                        item.price ?? 0
                      );

                    const itemSubtotal =
                      item.subtotal !==
                        undefined &&
                      item.subtotal !== null
                        ? Number(item.subtotal)
                        : quantity * price;

                    const image =
                      getImage(
                        item.product_image
                      );

                    return (
                      <div
                        className="order-item-row"
                        key={
                          item.id ||
                          `${item.product_name}-${index}`
                        }
                      >
                        <div className="order-item-image">
                          {image ? (
                            <img
                              src={image}
                              alt={
                                item.product_name ||
                                "Product"
                              }
                            />
                          ) : (
                            "🌱"
                          )}
                        </div>

                        <div className="order-item-info">
                          <h3>
                            {item.product_name ||
                              item.product?.name ||
                              "Product"}
                          </h3>

                          <p>
                            Quantity: {quantity}
                          </p>
                        </div>

                        <div className="order-item-price">
                          <span>
                            ₹{formatMoney(price)}
                          </span>

                          <strong>
                            ₹
                            {formatMoney(
                              itemSubtotal
                            )}
                          </strong>
                        </div>
                      </div>
                    );
                  })
                )}

              </div>
            </section>

            {/* DELIVERY */}

            <section className="order-section-card">
              <div className="section-heading">
                <span>Shipping</span>

                <h2>
                  Delivery Information
                </h2>
              </div>

              <div className="delivery-grid">

                <div className="delivery-info">
                  <span>Name</span>

                  <strong>
                    {deliveryName}
                  </strong>
                </div>

                <div className="delivery-info">
                  <span>Phone</span>

                  <strong>
                    {deliveryPhone}
                  </strong>
                </div>

                <div className="delivery-info delivery-address">
                  <span>
                    Delivery Address
                  </span>

                  <strong>
                    {fullAddress || "N/A"}
                  </strong>
                </div>

              </div>
            </section>

          </div>

          {/* RIGHT PAYMENT */}

          <aside className="order-detail-sidebar">

            <section className="order-section-card payment-card">

              <div className="section-heading">
                <span>Payment</span>

                <h2>
                  Payment Summary
                </h2>
              </div>

              <div className="payment-summary">

                <div className="summary-row">
                  <span>Subtotal</span>

                  <strong>
                    ₹{formatMoney(subtotal)}
                  </strong>
                </div>

                <div className="summary-divider" />

                <div className="summary-total">
                  <span>Total</span>

                  <strong>
                    ₹{formatMoney(totalAmount)}
                  </strong>
                </div>

              </div>

              <div className="payment-status-row">
                <span>
                  Payment Status
                </span>

                <strong
                  className={
                    isPaid
                      ? "payment-paid"
                      : "payment-pending"
                  }
                >
                  {paymentStatus}
                </strong>
              </div>

              {/* PAY BUTTON */}

              {!isPaid &&
                !showPaymentCheckout && (
                  <>
                    <div className="demo-payment-note">
                      🔒 DEMO PAYMENT — No real
                      money will be charged.
                      <br />
                      Do not enter real banking
                      details.
                    </div>

                    <button
                      type="button"
                      className="btn btn-green payment-button"
                      onClick={
                        openPaymentCheckout
                      }
                    >
                      Continue to Payment →
                    </button>
                  </>
                )}

              {/* CHECKOUT */}

              {!isPaid &&
                showPaymentCheckout && (
                  <div className="payment-checkout">

                    <div className="payment-checkout-header">
                      <div>
                        <span>
                          GreenNest Secure Checkout
                        </span>

                        <small>
                          Demo payment
                        </small>
                      </div>

                      <button
                        type="button"
                        className="payment-close-btn"
                        onClick={
                          closePaymentCheckout
                        }
                        disabled={
                          paymentLoading
                        }
                      >
                        ×
                      </button>
                    </div>

                    <div className="demo-checkout-warning">
                      <strong>
                        DEMO MODE
                      </strong>

                      <span>
                        This checkout does not
                        process real money.
                        Never enter real card,
                        UPI, or banking details.
                      </span>
                    </div>

                    <p className="payment-checkout-note">
                      Choose how you want to
                      simulate your payment.
                    </p>

                    {/* METHOD */}

                    <div className="payment-method-list">

                      {PAYMENT_METHODS.map(
                        (method) => {
                          const selected =
                            paymentMethod ===
                            method.id;

                          return (
                            <button
                              type="button"
                              key={method.id}
                              className={`payment-method-option ${
                                selected
                                  ? "selected"
                                  : ""
                              }`}
                              onClick={() => {
                                setPaymentMethod(
                                  method.id
                                );

                                setPaymentError(
                                  ""
                                );
                              }}
                              disabled={
                                paymentLoading
                              }
                            >
                              <span className="payment-method-icon">
                                {method.icon}
                              </span>

                              <span className="payment-method-content">
                                <strong>
                                  {method.title}
                                </strong>

                                <small>
                                  {method.description}
                                </small>
                              </span>

                              <span className="payment-method-radio">
                                {selected
                                  ? "✓"
                                  : ""}
                              </span>
                            </button>
                          );
                        }
                      )}

                    </div>

                    {/* UPI */}

                    {paymentMethod === "UPI" && (
                      <div className="payment-input-section">

                        <label>
                          UPI ID
                        </label>

                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) =>
                            setUpiId(
                              e.target.value
                            )
                          }
                          placeholder="example@upi"
                          disabled={
                            paymentLoading
                          }
                        />

                        <small>
                          Demo example:
                          demo@upi
                        </small>

                      </div>
                    )}

                    {/* CARD */}

                    {paymentMethod === "CARD" && (
                      <div className="payment-input-section">

                        <label>
                          Card Number
                        </label>

                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength="19"
                          value={cardNumber}
                          onChange={(e) =>
                            setCardNumber(
                              e.target.value
                                .replace(
                                  /\D/g,
                                  ""
                                )
                                .replace(
                                  /(.{4})/g,
                                  "$1 "
                                )
                                .trim()
                            )
                          }
                          placeholder="1234 5678 9012 3456"
                          disabled={
                            paymentLoading
                          }
                        />

                        <div className="payment-input-row">

                          <div>
                            <label>
                              Name on Card
                            </label>

                            <input
                              type="text"
                              value={cardName}
                              onChange={(e) =>
                                setCardName(
                                  e.target.value
                                )
                              }
                              placeholder="Demo User"
                              disabled={
                                paymentLoading
                              }
                            />
                          </div>

                          <div>
                            <label>
                              Expiry
                            </label>

                            <input
                              type="text"
                              maxLength="5"
                              value={cardExpiry}
                              onChange={(e) =>
                                setCardExpiry(
                                  e.target.value
                                )
                              }
                              placeholder="MM/YY"
                              disabled={
                                paymentLoading
                              }
                            />
                          </div>

                          <div>
                            <label>
                              CVV
                            </label>

                            <input
                              type="password"
                              maxLength="3"
                              value={cardCvv}
                              onChange={(e) =>
                                setCardCvv(
                                  e.target.value
                                    .replace(
                                      /\D/g,
                                      ""
                                    )
                                )
                              }
                              placeholder="123"
                              disabled={
                                paymentLoading
                              }
                            />
                          </div>

                        </div>

                        <small>
                          Use dummy details only.
                        </small>

                      </div>
                    )}

                    {/* NET BANKING */}

                    {paymentMethod ===
                      "NET_BANKING" && (
                      <div className="payment-input-section">

                        <label>
                          Select Bank
                        </label>

                        <select
                          value={selectedBank}
                          onChange={(e) =>
                            setSelectedBank(
                              e.target.value
                            )
                          }
                          disabled={
                            paymentLoading
                          }
                        >
                          <option value="">
                            Choose a demo bank
                          </option>

                          <option value="HDFC">
                            HDFC Bank
                          </option>

                          <option value="SBI">
                            State Bank of India
                          </option>

                          <option value="ICICI">
                            ICICI Bank
                          </option>

                          <option value="AXIS">
                            Axis Bank
                          </option>
                        </select>

                        <small>
                          Bank selection is only
                          simulated.
                        </small>

                      </div>
                    )}

                    {paymentError && (
                      <div className="payment-checkout-error">
                        {paymentError}
                      </div>
                    )}

                    {/* VERIFICATION */}

                    {paymentLoading && (
                      <div className="payment-verifying">

                        <div className="payment-spinner" />

                        <strong>
                          Verifying demo payment...
                        </strong>

                        <span>
                          Please wait while GreenNest
                          confirms your payment.
                        </span>

                      </div>
                    )}

                    <button
                      type="button"
                      className="btn btn-green payment-confirm-button"
                      onClick={handlePayment}
                      disabled={paymentLoading}
                    >
                      {paymentLoading
                        ? "Verifying..."
                        : `Pay ₹${formatMoney(
                            totalAmount
                          )}`}
                    </button>

                    {selectedMethod && (
                      <div className="selected-payment-method">
                        Selected:{" "}
                        <strong>
                          {selectedMethod.title}
                        </strong>
                      </div>
                    )}

                    <small className="payment-demo-label">
                      DEMO MODE · ₹0 real money
                    </small>

                  </div>
                )}

              {/* PAID */}

              {isPaid && (
                <div className="paid-message">
                  <strong>
                    ✓ Payment completed
                  </strong>

                  <span>
                    Your order has been confirmed.
                  </span>

                  {transactionId && (
                    <div className="paid-transaction">
                      <small>
                        Demo Transaction ID
                      </small>

                      <strong>
                        {transactionId}
                      </strong>
                    </div>
                  )}
                </div>
              )}

            </section>

          </aside>

        </div>
      </div>
    </main>
  );
}