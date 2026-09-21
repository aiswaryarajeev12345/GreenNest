import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || "/dashboard";

  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await login(form.username, form.password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      const detail =
        err.response?.data?.detail ||
        "We couldn't log you in with those details. Check your username and password.";
      setError(detail);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="gn-container gn-auth-page">
      <div className="gn-auth-card">
        <h1>Welcome back</h1>
        <p className="gn-auth-sub">Log in to your GreenNest account.</p>

        {error && <div className="gn-banner-error">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="gn-field">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              value={form.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="gn-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <button className="gn-btn gn-btn-primary" type="submit" disabled={isSubmitting} style={{ width: "100%" }}>
            {isSubmitting ? "Logging in…" : "Log in"}
          </button>
        </form>

        <p className="gn-auth-footer">
          New to GreenNest? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
