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

function formatMoney(value) {
  const amount = Number(value ?? 0);

  return amount.toFixed(2);
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

export default function OrderDetail() {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  useEffect(() => {
    loadOrder();
  }, [id]);

  async function loadOrder() {
    try {
      setLoading(true);

      const response = await api.get(`/orders/${id}/`);

      setOrder(response.data);
    } catch (error) {
      console.error("Failed to load order:", error);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }

  async function handlePayment() {
    if (!order) return;

    try {
      setPaymentLoading(true);
      setPaymentError("");
      setPaymentSuccess(false);

      /*
       * Step 1:
       * Create demo payment.
       */
      await api.post("/orders/create-payment/", {
        order_id: order.id,
      });

      /*
       * Step 2:
       * Verify demo payment.
       */
      const response = await api.post(
        "/orders/verify-payment/",
        {
          order_id: order.id,
        }
      );

      /*
       * Backend returns the updated order.
       */
      if (response.data?.order) {
        setOrder(response.data.order);
      } else {
        await loadOrder();
      }

      setPaymentSuccess(true);
    } catch (error) {
      console.error("Payment failed:", error);

      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.error ||
        "Payment could not be completed.";

      setPaymentError(message);
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

  /*
   * -------------------------------------------------------
   * ORDER DATA
   * -------------------------------------------------------
   */

  const orderStatus = String(
    order.status || "PENDING"
  ).toUpperCase();

  const currentStatusIndex =
    getStatusIndex(orderStatus);

  /*
   * Backend uses total_amount.
   */
  const totalAmount = Number(
    order.total_amount ?? 0
  );

  /*
   * Calculate subtotal from order items when possible.
   *
   * This avoids showing ₹0.00 when the backend does not
   * provide a separate subtotal field.
   */
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

  /*
   * -------------------------------------------------------
   * DELIVERY DATA
   * Backend fields:
   *
   * delivery_name
   * delivery_phone
   * delivery_address
   * delivery_city
   * delivery_district
   * delivery_state
   * delivery_pincode
   * -------------------------------------------------------
   */

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

  /*
   * -------------------------------------------------------
   * PAYMENT
   * -------------------------------------------------------
   */

  const paymentStatus = String(
    order.payment_status || "PENDING"
  ).toUpperCase();

  const isPaid = paymentStatus === "PAID";

  /*
   * -------------------------------------------------------
   * RENDER
   * -------------------------------------------------------
   */

  return (
    <main className="order-detail-page">
      <div className="order-detail-container">

        {/* =================================================
            BACK BUTTON
            ================================================= */}

        <Link
          to="/dashboard"
          className="order-back-link"
        >
          ← Back to Dashboard
        </Link>

        {/* =================================================
            ORDER HEADER
            ================================================= */}

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

        {/* =================================================
            PAYMENT SUCCESS
            ================================================= */}

        {paymentSuccess && (
          <div className="payment-success-message">
            ✓ Payment completed successfully.
          </div>
        )}

        {/* =================================================
            PAYMENT ERROR
            ================================================= */}

        {paymentError && (
          <div className="payment-error-message">
            {paymentError}
          </div>
        )}

        {/* =================================================
            ORDER PROGRESS
            ================================================= */}

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

        {/* =================================================
            MAIN CONTENT
            ================================================= */}

        <div className="order-detail-grid">

          {/* =================================================
              LEFT SIDE
              ================================================= */}

          <div className="order-detail-main">

            {/* =================================================
                ORDER ITEMS
                ================================================= */}

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

                        {/* Image */}

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

                        {/* Product */}

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

                        {/* Price */}

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

            {/* =================================================
                DELIVERY INFORMATION
                ================================================= */}

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

          {/* =================================================
              RIGHT SIDE - PAYMENT
              ================================================= */}

          <aside className="order-detail-sidebar">

            <section className="order-section-card payment-card">

              <div className="section-heading">
                <span>Payment</span>

                <h2>
                  Payment Summary
                </h2>
              </div>

              <div className="payment-summary">

                {/* Subtotal */}

                <div className="summary-row">
                  <span>
                    Subtotal
                  </span>

                  <strong>
                    ₹{formatMoney(subtotal)}
                  </strong>
                </div>

                {/* Divider */}

                <div className="summary-divider" />

                {/* Total */}

                <div className="summary-total">
                  <span>
                    Total
                  </span>

                  <strong>
                    ₹{formatMoney(totalAmount)}
                  </strong>
                </div>

              </div>

              {/* Payment Status */}

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

              {/* Pay Button */}

              {!isPaid && (
                <button
                  type="button"
                  className="btn btn-green payment-button"
                  onClick={handlePayment}
                  disabled={paymentLoading}
                >
                  {paymentLoading
                    ? "Processing..."
                    : "Pay Now"}
                </button>
              )}

              {/* Paid */}

              {isPaid && (
                <div className="paid-message">
                  ✓ Payment completed
                </div>
              )}

            </section>

          </aside>

        </div>

      </div>
    </main>
  );
}