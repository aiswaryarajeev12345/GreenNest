import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

export default function SellerDashboard() {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");

  async function load() {
    try {
      setError("");

      const [statsResponse, ordersResponse, productsResponse] =
        await Promise.all([
          api.get("/orders/seller/dashboard/"),
          api.get("/orders/seller/"),
          api.get("/marketplace/products/"),
        ]);

      setStats(statsResponse.data);
      setOrders(ordersResponse.data);

      const allProducts =
        productsResponse.data.results ||
        productsResponse.data;

      setProducts(
        allProducts.filter(
          (product) =>
            product.seller === statsResponse.data.user_id ||
            product.seller_id === statsResponse.data.user_id ||
            product.seller_name === statsResponse.data.username
        )
      );
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail ||
          "Could not load Seller Studio."
      );
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function updateOrderStatus(id, value) {
    try {
      await api.patch(
        `/orders/seller/${id}/status/`,
        {
          status: value,
        }
      );

      await load();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          "Could not update order status."
      );
    }
  }

  if (!stats) {
    return (
      <div className="page-center">
        Loading seller studio…
      </div>
    );
  }

  return (
    <div className="page">
      <div className="seller-head">
        <div>
          <p className="eyebrow">
            SELLER STUDIO
          </p>

          <h1>
            Grow your marketplace.
          </h1>

          <p>
            Manage listings and fulfil orders from one place.
          </p>
        </div>

        <Link
          className="btn btn-green"
          to="/seller/products/new"
        >
          ＋ Add product
        </Link>
      </div>

      {error && (
        <div className="error">
          {error}
        </div>
      )}

      <div className="stat-grid">
        <div>
          <small>PRODUCTS</small>
          <b>{stats.total_products}</b>
        </div>

        <div>
          <small>ORDERS</small>
          <b>{stats.total_orders}</b>
        </div>

        <div>
          <small>IN PROGRESS</small>
          <b>{stats.pending_orders}</b>
        </div>

        <div>
          <small>COMPLETED</small>
          <b>{stats.completed_orders}</b>
        </div>

        <div>
          <small>SALES</small>
          <b>
            ₹{stats.total_sales}
          </b>
        </div>
      </div>

      <section className="seller-section">
        <div className="section-title">
          <h2>
            My products
          </h2>

          <Link to="/marketplace">
            View marketplace →
          </Link>
        </div>

        {products.length > 0 ? (
          <div className="seller-products">
            {products.map((product) => (
              <div
                className="seller-order"
                key={product.id}
              >
                <div>
                  <b>
                    {product.name}
                  </b>

                  <p>
                    ₹{product.price} /{" "}
                    {product.unit} · Quantity:{" "}
                    {product.quantity}
                  </p>

                  <small>
                    {product.is_available
                      ? "Available"
                      : "Sold out"}
                  </small>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    alignItems: "center",
                  }}
                >
                  <Link
                    className="btn"
                    to={`/seller/products/${product.id}/edit`}
                  >
                    Edit
                  </Link>

                  <Link
                    className="btn btn-green"
                    to={`/marketplace/products/${product.id}`}
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty">
            Your products will appear here.
          </div>
        )}
      </section>

      <section className="seller-section">
        <div className="section-title">
          <h2>
            Recent orders
          </h2>

          <Link to="/marketplace">
            View marketplace →
          </Link>
        </div>

        {orders.map((order) => (
          <div
            className="seller-order"
            key={order.id}
          >
            <div>
              <b>
                Order #{order.id}
              </b>

              <p>
                {order.items
                  ?.map((item) => item.product_name)
                  .join(", ")}
              </p>
            </div>

            <strong>
              ₹{order.total_amount}
            </strong>

            <select
              value={order.status}
              onChange={(e) =>
                updateOrderStatus(
                  order.id,
                  e.target.value
                )
              }
            >
              {[
                "PENDING",
                "CONFIRMED",
                "PROCESSING",
                "SHIPPED",
                "DELIVERED",
              ].map((status) => (
                <option
                  key={status}
                  value={status}
                >
                  {status}
                </option>
              ))}
            </select>
          </div>
        ))}

        {!orders.length && (
          <div className="empty">
            Your incoming orders will appear here.
          </div>
        )}
      </section>
    </div>
  );
}