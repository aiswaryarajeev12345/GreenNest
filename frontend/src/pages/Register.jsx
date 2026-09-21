import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ROLE_OPTIONS = [
  { value: "GROWER", label: "Grower — I tend my own garden" },
  { value: "SELLER", label: "Seller — I have produce to share or sell" },
  { value: "EXPERT", label: "Expert — I mentor other gardeners" },
];

const INITIAL_FORM = {
  username: "",
  email: "",
  phone: "",
  password: "",
  confirm_password: "",
  role: "GROWER",
};

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    setFieldErrors({});

    if (form.password !== form.confirm_password) {
      setFieldErrors({ confirm_password: "Passwords do not match." });
      return;
    }

    setIsSubmitting(true);
    try {
      await register(form);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === "object") {
        const flat = {};
        Object.entries(data).forEach(([key, val]) => {
          flat[key] = Array.isArray(val) ? val.join(" ") : String(val);
        });
        setFieldErrors(flat);
        if (data.detail) setFormError(String(data.detail));
      } else {
        setFormError(
          err.message || "Unable to connect to the GreenNest backend. Please make sure Django is running."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="gn-container gn-auth-page">
      <div className="gn-auth-card">
        <h1>Join GreenNest</h1>
        <p className="gn-auth-sub">Create your account and pick how you'll take part.</p>

        {formError && <div className="gn-banner-error">{formError}</div>}
        {success && (
          <div className="gn-banner-success">Account created — taking you to the login page…</div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="gn-field">
            <label htmlFor="username">Username</label>
            <input id="username" name="username" value={form.username} onChange={handleChange} required />
            {fieldErrors.username && <p className="gn-error-text">{fieldErrors.username}</p>}
          </div>

          <div className="gn-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
            />
            {fieldErrors.email && <p className="gn-error-text">{fieldErrors.email}</p>}
          </div>

          <div className="gn-field">
            <label htmlFor="phone">Phone (optional)</label>
            <input id="phone" name="phone" value={form.phone} onChange={handleChange} />
            {fieldErrors.phone && <p className="gn-error-text">{fieldErrors.phone}</p>}
          </div>

          <div className="gn-field">
            <label htmlFor="role">I am joining as a…</label>
            <select id="role" name="role" value={form.role} onChange={handleChange}>
              {ROLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {fieldErrors.role && <p className="gn-error-text">{fieldErrors.role}</p>}
          </div>

          <div className="gn-field-row">
            <div className="gn-field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={handleChange}
                required
              />
              {fieldErrors.password && <p className="gn-error-text">{fieldErrors.password}</p>}
            </div>

            <div className="gn-field">
              <label htmlFor="confirm_password">Confirm password</label>
              <input
                id="confirm_password"
                name="confirm_password"
                type="password"
                autoComplete="new-password"
                value={form.confirm_password}
                onChange={handleChange}
                required
              />
              {fieldErrors.confirm_password && (
                <p className="gn-error-text">{fieldErrors.confirm_password}</p>
              )}
            </div>
          </div>

          <button
            className="gn-btn gn-btn-primary"
            type="submit"
            disabled={isSubmitting || success}
            style={{ width: "100%", marginTop: "0.4rem" }}
          >
            {isSubmitting ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="gn-auth-footer">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
