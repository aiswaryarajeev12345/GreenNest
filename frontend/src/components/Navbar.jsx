import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";

export default function Navbar() {
  const { isAuthenticated, logout, role } = useAuth();

  const [open, setOpen] = useState(false);

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("greennest-theme") === "dark";
  });

  const nav = useNavigate();

  const close = () => setOpen(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("greennest-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("greennest-theme", "light");
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((current) => !current);
  };

  const handleLogout = () => {
    logout();
    close();
    nav("/");
  };

  return (
    <header className="site-nav">
      <div className="nav-inner">

        <Link
          className="brand"
          to="/"
          onClick={close}
        >
          <span>🌿</span> GreenNest
        </Link>

      

        <button
          className="menu-btn"
          onClick={() => setOpen(!open)}
          aria-label="Toggle navigation menu"
        >
          ☰
        </button>

        <nav
          className={open ? "nav-links open" : "nav-links"}
        >

        

          {isAuthenticated && role === "ADMIN" ? (
            <>
              <NavLink
                to="/"
                onClick={close}
              >
                Home
              </NavLink>

              <NavLink
                to="/admin-dashboard"
                onClick={close}
              >
                Admin Dashboard
              </NavLink>

              <NavLink
                to="/admin-monitor"
                onClick={close}
              >
                Monitor
              </NavLink>

              <button
                className="nav-logout"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
            

              {isAuthenticated ? (
                <>
                  <NavLink
                    to="/"
                    onClick={close}
                  >
                    Home
                  </NavLink>

                  <NavLink
                    to="/community"
                    onClick={close}
                  >
                    Community
                  </NavLink>

                  <NavLink
                    to="/marketplace"
                    onClick={close}
                  >
                    Marketplace
                  </NavLink>

                  <NavLink
                    to="/exchange"
                    onClick={close}
                  >
                    Exchange
                  </NavLink>

                  <NavLink
                    to="/classes"
                    onClick={close}
                  >
                    Classes
                  </NavLink>

                  <NavLink
                    to="/cart"
                    onClick={close}
                  >
                    Basket
                  </NavLink>

                

                  {(role === "GROWER" ||
                    role === "SELLER") && (
                    <NavLink
                      to="/seller/dashboard"
                      onClick={close}
                    >
                      Sell
                    </NavLink>
                  )}

                  <NavLink
                    to="/profile"
                    onClick={close}
                  >
                    Profile
                  </NavLink>

                  <button
                    className="nav-logout"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
               

                  <NavLink
                    to="/"
                    onClick={close}
                  >
                    Home
                  </NavLink>

                  <NavLink
                    to="/login"
                    onClick={close}
                  >
                    Login
                  </NavLink>

                  <Link
                    className="nav-join"
                    to="/register"
                    onClick={close}
                  >
                    Join
                  </Link>
                </>
              )}
            </>
          )}

          {/* DARK MODE */}

          <button
            className="theme-toggle"
            onClick={toggleDarkMode}
            aria-label={
              darkMode
                ? "Switch to light mode"
                : "Switch to dark mode"
            }
            title={
              darkMode
                ? "Switch to light mode"
                : "Switch to dark mode"
            }
          >
            {darkMode ? "☀️" : "🌙"}
          </button>

        </nav>
      </div>
    </header>
  );
}