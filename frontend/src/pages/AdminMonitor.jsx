import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

export default function AdminMonitor() {
  const [activity, setActivity] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadActivity();
  }, []);

  async function loadActivity() {
    try {
      setError("");

      const response = await api.get(
        "/auth/admin/activity/"
      );

      console.log(
        "ADMIN ACTIVITY:",
        response.data
      );

      setActivity(response.data);
    } catch (err) {
      console.error(
        "ADMIN ACTIVITY ERROR:",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.detail ||
        "Unable to load platform activity."
      );
    }
  }

  function formatDate(date) {
    if (!date) {
      return "";
    }

    return new Date(date).toLocaleString();
  }

  return (
    <div className="page">

      {/* HERO */}

      <div className="page-hero">

        <div>

          <p className="eyebrow">
            PLATFORM MONITORING
          </p>

          <h1>
            Monitor GreenNest
          </h1>

          <p>
            Keep track of recent activity
            across the platform.
          </p>

        </div>

        <div className="dash-leaf">
          👀
        </div>

      </div>


      {/* ERROR */}

      {error && (
        <div className="form-error">
          {error}
        </div>
      )}


      {/* ACTIVITY */}

      <section className="admin-section">

        <div className="section-heading">

          <p className="eyebrow">
            RECENT ACTIVITY
          </p>

          <h2>
            What's happening?
          </h2>

        </div>


        <div className="activity-list">


          {/* USERS */}

          <div className="activity-card">

            <span>👤</span>

            <div>

              <h3>
                User Activity
              </h3>

              {!activity ? (
                <p>Loading...</p>
              ) : activity.users.length === 0 ? (
                <p>No users found.</p>
              ) : (
                activity.users.map((user) => (
                  <p key={user.id}>
                    <strong>
                      {user.username}
                    </strong>
                    {" "}registered on{" "}
                    {formatDate(user.date)}
                  </p>
                ))
              )}

            </div>

            <span className="activity-status">
              {activity
                ? `${activity.users.length} recent`
                : "..."}
            </span>

          </div>


          {/* COMMUNITY */}

          <div className="activity-card">

            <span>📝</span>

            <div>

              <h3>
                Community Activity
              </h3>

              {!activity ? (
                <p>Loading...</p>
              ) : activity.posts.length === 0 ? (
                <p>No community posts found.</p>
              ) : (
                activity.posts.map((post) => (
                  <p key={post.id}>
                    <strong>
                      {post.title}
                    </strong>
                    {" "}—{" "}
                    {formatDate(post.date)}
                  </p>
                ))
              )}

            </div>

            <span className="activity-status">
              {activity
                ? `${activity.posts.length} recent`
                : "..."}
            </span>

          </div>


          {/* MARKETPLACE */}

          <div className="activity-card">

            <span>🥕</span>

            <div>

              <h3>
                Marketplace Activity
              </h3>

              {!activity ? (
                <p>Loading...</p>
              ) : activity.products.length === 0 ? (
                <p>No products found.</p>
              ) : (
                activity.products.map((product) => (
                  <p key={product.id}>
                    <strong>
                      {product.name}
                    </strong>
                    {" "}listed on{" "}
                    {formatDate(product.date)}
                  </p>
                ))
              )}

            </div>

            <span className="activity-status">
              {activity
                ? `${activity.products.length} recent`
                : "..."}
            </span>

          </div>


          {/* EXCHANGE */}

          <div className="activity-card">

            <span>🔄</span>

            <div>

              <h3>
                Exchange Activity
              </h3>

              {!activity ? (
                <p>Loading...</p>
              ) : activity.exchanges.length === 0 ? (
                <p>No exchange listings found.</p>
              ) : (
                activity.exchanges.map((exchange) => (
                  <p key={exchange.id}>
                    <strong>
                      {exchange.title}
                    </strong>
                    {" "}created on{" "}
                    {formatDate(exchange.date)}
                  </p>
                ))
              )}

            </div>

            <span className="activity-status">
              {activity
                ? `${activity.exchanges.length} recent`
                : "..."}
            </span>

          </div>


          {/* CLASSES */}

          <div className="activity-card">

            <span>🎓</span>

            <div>

              <h3>
                Class Activity
              </h3>

              {!activity ? (
                <p>Loading...</p>
              ) : activity.classes.length === 0 ? (
                <p>No expert classes found.</p>
              ) : (
                activity.classes.map((item) => (
                  <p key={item.id}>
                    <strong>
                      {item.title}
                    </strong>
                    {" "}created on{" "}
                    {formatDate(item.date)}
                  </p>
                ))
              )}

            </div>

            <span className="activity-status">
              {activity
                ? `${activity.classes.length} recent`
                : "..."}
            </span>

          </div>


          {/* ORDERS */}

          <div className="activity-card">

            <span>📦</span>

            <div>

              <h3>
                Order Activity
              </h3>

              {!activity ? (
                <p>Loading...</p>
              ) : activity.orders.length === 0 ? (
                <p>No orders found.</p>
              ) : (
                activity.orders.map((order) => (
                  <p key={order.id}>
                    <strong>
                      Order #{order.id}
                    </strong>
                    {" "}— Status:{" "}
                    {order.status}
                    {" "}—{" "}
                    {formatDate(order.date)}
                  </p>
                ))
              )}

            </div>

            <span className="activity-status">
              {activity
                ? `${activity.orders.length} recent`
                : "..."}
            </span>

          </div>

        </div>

      </section>


      {/* BACK */}

      <section className="admin-monitor-actions">

        <Link to="/admin-dashboard">
          ← Back to Admin Dashboard
        </Link>

      </section>

    </div>
  );
}