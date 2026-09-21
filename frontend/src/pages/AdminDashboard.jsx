import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getStatistics();
  }, []);

  async function getStatistics() {
    try {
      setError("");

      const response = await api.get(
        "/auth/admin/statistics/"
      );

      console.log(
        "ADMIN STATISTICS:",
        response.data
      );

      setStats(response.data);
    } catch (error) {
      console.error(
        "ADMIN STATISTICS ERROR:",
        error.response?.data || error.message
      );

      setError(
        error.response?.data?.detail ||
        "Could not load statistics."
      );
    }
  }

  return (
    <div className="page">

      {/* HERO */}

      <div className="page-hero">

        <div>
          <p className="eyebrow">
            GREENNEST ADMIN
          </p>

          <h1>
            Admin Dashboard
          </h1>

          <p>
            Overview and management center for
            the GreenNest platform.
          </p>
        </div>

        <div className="dash-leaf">
          🌿
        </div>

      </div>


      {/* ERROR */}

      {error && (
        <div className="form-error">
          {error}
        </div>
      )}


      {/* STATISTICS */}

      <section className="admin-stats">

        <div className="admin-stat-card">
          <span>👥</span>

          <div>
            <small>USERS</small>

            <h2>
              {stats ? stats.users : "..."}
            </h2>
          </div>
        </div>


        <div className="admin-stat-card">
          <span>📝</span>

          <div>
            <small>COMMUNITY POSTS</small>

            <h2>
              {stats
                ? stats.community_posts
                : "..."}
            </h2>
          </div>
        </div>


        <div className="admin-stat-card">
          <span>🥕</span>

          <div>
            <small>PRODUCTS</small>

            <h2>
              {stats ? stats.products : "..."}
            </h2>
          </div>
        </div>


        <div className="admin-stat-card">
          <span>🔄</span>

          <div>
            <small>EXCHANGES</small>

            <h2>
              {stats ? stats.exchanges : "..."}
            </h2>
          </div>
        </div>


        <div className="admin-stat-card">
          <span>🎓</span>

          <div>
            <small>EXPERT CLASSES</small>

            <h2>
              {stats
                ? stats.expert_classes
                : "..."}
            </h2>
          </div>
        </div>


        <div className="admin-stat-card">
          <span>📦</span>

          <div>
            <small>ORDERS</small>

            <h2>
              {stats ? stats.orders : "..."}
            </h2>
          </div>
        </div>

      </section>


      {/* ADMIN TOOLS */}

      <section className="admin-section">

        <div className="section-heading">

          <p className="eyebrow">
            ADMIN TOOLS
          </p>

          <h2>
            Manage GreenNest
          </h2>

        </div>


        <div className="quick-grid">

          <Link to="/admin-monitor">
            <span>👀</span>

            <h3>
              Monitor Activity
            </h3>

            <p>
              View recent activity happening
              across the platform.
            </p>
          </Link>


          <Link to="/community">
            <span>📝</span>

            <h3>
              Community
            </h3>

            <p>
              Review community posts and
              discussions.
            </p>
          </Link>


          <Link to="/marketplace">
            <span>🥕</span>

            <h3>
              Marketplace
            </h3>

            <p>
              Review products listed by
              growers.
            </p>
          </Link>


          <Link to="/exchange">
            <span>🔄</span>

            <h3>
              Exchange
            </h3>

            <p>
              Review seed and plant exchange
              activity.
            </p>
          </Link>


          <Link to="/classes">
            <span>🎓</span>

            <h3>
              Expert Classes
            </h3>

            <p>
              Review gardening classes and
              enrollments.
            </p>
          </Link>


          <a
            href="http://127.0.0.1:8000/admin/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>⚙️</span>

            <h3>
              Django Admin
            </h3>

            <p>
              Open the complete backend
              administration panel.
            </p>
          </a>

        </div>

      </section>

    </div>
  );
}