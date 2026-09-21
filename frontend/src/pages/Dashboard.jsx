import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ExpertDashboard from "./ExpertDashboard";

export default function Dashboard() {
  const { user, role } = useAuth();

  // EXPERT
  if (role === "EXPERT") {
    return <ExpertDashboard />;
  }

  return (
    <div className="page dashboard-new">

      {/* HERO */}
      <div className="dash-hero">
        <div>

          <p className="eyebrow">
            YOUR GREENNEST
          </p>

          <h1>
            Hello, {user?.username}.
            <br />
            <em>Keep growing.</em>
          </h1>

          <p>
            Your garden community is ready when you are.
          </p>

        </div>

        <div className="dash-leaf">
          🌿
        </div>
      </div>

      {/* QUICK LINKS */}
      <div className="quick-grid">

        <Link to="/community">
          <span>🌱</span>

          <h3>
            Community
          </h3>

          <p>
            Share what is growing.
          </p>
        </Link>

        <Link to="/marketplace">
          <span>🥬</span>

          <h3>
            Marketplace
          </h3>

          <p>
            Find fresh local produce.
          </p>
        </Link>

        <Link to="/exchange">
          <span>🔄</span>

          <h3>
            Exchange
          </h3>

          <p>
            Swap seeds and plants.
          </p>
        </Link>

        <Link to="/classes">
          <span>📚</span>

          <h3>
            Expert classes
          </h3>

          <p>
            Learn from growers.
          </p>
        </Link>

        <Link to="/orders">
          <span>📦</span>

          <h3>
            My orders
          </h3>

          <p>
            Track your purchases.
          </p>
        </Link>

        {(role === "GROWER" || role === "SELLER") && (
          <Link to="/seller/dashboard">

            <span>🧺</span>

            <h3>
              Sell
            </h3>

            <p>
              Manage your listings.
            </p>

          </Link>
        )}

      </div>
    </div>
  );
}