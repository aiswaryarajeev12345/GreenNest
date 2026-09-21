import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const INITIAL_FORM = {
  delivery_name: "",
  delivery_phone: "",
  delivery_address: "",
  delivery_city: "",
  delivery_district: "",
  delivery_state: "",
  delivery_pincode: "",
};

export default function Checkout() {
  const navigate = useNavigate();

  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");

    const requiredFields = [
      "delivery_name",
      "delivery_phone",
      "delivery_address",
      "delivery_city",
      "delivery_district",
      "delivery_state",
      "delivery_pincode",
    ];

    const missing = requiredFields.find(
      (field) => !String(form[field]).trim()
    );

    if (missing) {
      setError(
        "Please complete all delivery information."
      );
      return;
    }

    if (!/^\d{10}$/.test(form.delivery_phone.trim())) {
      setError(
        "Please enter a valid 10-digit phone number."
      );
      return;
    }

    if (!/^\d{6}$/.test(form.delivery_pincode.trim())) {
      setError(
        "Please enter a valid 6-digit pincode."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await api.post(
        "/orders/create/",
        {
          delivery_name:
            form.delivery_name.trim(),

          delivery_phone:
            form.delivery_phone.trim(),

          delivery_address:
            form.delivery_address.trim(),

          delivery_city:
            form.delivery_city.trim(),

          delivery_district:
            form.delivery_district.trim(),

          delivery_state:
            form.delivery_state.trim(),

          delivery_pincode:
            form.delivery_pincode.trim(),
        }
      );

      const order = response.data;

      navigate(`/orders/${order.id}`);
    } catch (err) {
      console.error(
        "Checkout error:",
        err
      );

      const data = err.response?.data;

      if (data && typeof data === "object") {
        const messages = [];

        Object.entries(data).forEach(
          ([field, value]) => {
            if (Array.isArray(value)) {
              messages.push(
                `${field}: ${value.join(" ")}`
              );
            } else {
              messages.push(
                `${field}: ${String(value)}`
              );
            }
          }
        );

        setError(
          messages.join(" | ") ||
            "Could not continue to payment."
        );
      } else {
        setError(
          "Could not continue to payment. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="form-page">

      <div className="form-heading">

        <p className="eyebrow">
          CHECKOUT
        </p>

        <h1>
          Bring the <em>garden home.</em>
        </h1>

        <p>
          Your delivery details are used only
          to fulfil this order.
        </p>

      </div>

      <form
        className="form-card"
        onSubmit={handleSubmit}
      >

        <p>
          Please complete delivery information.
        </p>

        {error && (
          <div className="error">
            {error}
          </div>
        )}

        <label>
          Name

          <input
            type="text"
            name="delivery_name"
            value={form.delivery_name}
            onChange={handleChange}
            placeholder="Full name"
            required
          />
        </label>

        <label>
          Phone

          <input
            type="tel"
            name="delivery_phone"
            value={form.delivery_phone}
            onChange={handleChange}
            placeholder="10-digit phone number"
            maxLength="10"
            required
          />
        </label>

        <label>
          Address

          <textarea
            name="delivery_address"
            value={form.delivery_address}
            onChange={handleChange}
            placeholder="House / street / locality"
            rows="3"
            required
          />
        </label>

        <div className="form-row">

          <label>
            City

            <input
              type="text"
              name="delivery_city"
              value={form.delivery_city}
              onChange={handleChange}
              placeholder="City"
              required
            />
          </label>

          <label>
            District

            <input
              type="text"
              name="delivery_district"
              value={form.delivery_district}
              onChange={handleChange}
              placeholder="District"
              required
            />
          </label>

        </div>

        <div className="form-row">

          <label>
            State

            <input
              type="text"
              name="delivery_state"
              value={form.delivery_state}
              onChange={handleChange}
              placeholder="State"
              required
            />
          </label>

          <label>
            Pincode

            <input
              type="text"
              name="delivery_pincode"
              value={form.delivery_pincode}
              onChange={handleChange}
              placeholder="6-digit pincode"
              maxLength="6"
              required
            />
          </label>

        </div>

        <button
          type="submit"
          className="btn btn-green"
          disabled={loading}
        >
          {loading
            ? "Creating order..."
            : "Continue to Demo Payment →"}
        </button>

        <small>
          Demo payment only · No real money will
          be charged.
        </small>

      </form>

    </div>
  );
}