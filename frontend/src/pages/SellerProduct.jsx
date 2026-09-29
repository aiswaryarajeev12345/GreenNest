import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import { getImage, upload, update } from "../api/features";

const CATEGORIES = [
  "Vegetables",
  "Fruits",
  "Herbs",
  "Seeds",
  "Plants",
  "Gardening Materials",
  "Garden Kits",
  "Other",
];

const CATEGORY_UNITS = {
  Vegetables: ["kg"],
  Fruits: ["kg"],
  Herbs: ["kg"],
  Seeds: ["kg"],
  Plants: ["plant"],
  "Gardening Materials": ["piece"],
  "Garden Kits": ["kit"],
  Other: ["kg"],
};

const INITIAL_FORM = {
  name: "",
  description: "",
  category: "Vegetables",
  price: "",
  quantity: "",
  unit: "kg",
  location: "",
  is_available: true,
};

export default function SellerProduct() {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEditMode = Boolean(id);

  const [form, setForm] = useState(INITIAL_FORM);

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==============================
  // LOAD PRODUCT FOR EDIT
  // ==============================

  useEffect(() => {
    if (!isEditMode) {
      return;
    }

    async function loadProduct() {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          `/marketplace/products/${id}/`
        );

        const product = response.data;

        const category =
          product.category || "Vegetables";

        const allowedUnits =
          CATEGORY_UNITS[category] || ["kg"];

        const productUnit =
          allowedUnits.includes(product.unit)
            ? product.unit
            : allowedUnits[0];

        setForm({
          name: product.name || "",
          description: product.description || "",
          category,
          price: product.price || "",
          quantity: product.quantity || "",
          unit: productUnit,
          location: product.location || "",
          is_available: Boolean(product.is_available),
        });

        if (product.image) {
          setPreview(getImage(product.image));
        }
      } catch (err) {
        console.error("Could not load product:", err);

        const message =
          err.response?.data?.detail ||
          "Could not load this product.";

        setError(message);
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [id, isEditMode]);


  // ==============================
  // INPUT CHANGE
  // ==============================

  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    if (name === "category") {
      const newUnits =
        CATEGORY_UNITS[value] || ["kg"];

      setForm((current) => ({
        ...current,
        category: value,
        unit: newUnits[0],
      }));
    } else {
      setForm((current) => ({
        ...current,
        [name]: type === "checkbox" ? checked : value,
      }));
    }

    setError("");
    setSuccess("");
  }


  // ==============================
  // IMAGE CHANGE
  // ==============================

  function handleImageChange(e) {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    setImage(file);

    const imageUrl = URL.createObjectURL(file);

    setPreview(imageUrl);

    setError("");
    setSuccess("");
  }


  // ==============================
  // SUBMIT
  // ==============================

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const data = new FormData();

      data.append("name", form.name);
      data.append("description", form.description);
      data.append("category", form.category);
      data.append("price", form.price);
      data.append("quantity", form.quantity);
      data.append("unit", form.unit);
      data.append("location", form.location);
      data.append(
        "is_available",
        form.is_available ? "true" : "false"
      );

      if (image) {
        data.append("image", image);
      }


      // ==========================
      // CREATE
      // ==========================

      if (!isEditMode) {
        await upload(
          "/marketplace/products/",
          data
        );

        navigate("/seller/dashboard");
        return;
      }


      // ==========================
      // EDIT
      // ==========================

      await update(
        `/marketplace/products/${id}/`,
        data
      );

      setSuccess("Product updated successfully.");

      setTimeout(() => {
        navigate("/seller/dashboard");
      }, 800);

    } catch (err) {
      console.error("Product save error:", err);

      const responseData = err.response?.data;

      if (responseData && typeof responseData === "object") {
        const messages = [];

        Object.entries(responseData).forEach(
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
          "Could not save the product."
        );
      } else {
        setError(
          "Could not save the product. Please try again."
        );
      }
    } finally {
      setSaving(false);
    }
  }


  // ==============================
  // LOADING
  // ==============================

  if (loading) {
    return (
      <div className="page-center">
        Loading your product...
      </div>
    );
  }


  // ==============================
  // PAGE
  // ==============================

  const availableUnits =
    CATEGORY_UNITS[form.category] || ["kg"];

  return (
    <div className="form-page">

      <div className="form-heading">

        <p className="eyebrow">
          {isEditMode
            ? "EDIT LISTING"
            : "SELL ON GREENNEST"}
        </p>

        <h1>
          {isEditMode
            ? "Update your garden listing."
            : "List something from your garden."}
        </h1>

        <p>
          {isEditMode
            ? "Update your product details, quantity or availability."
            : "Share fresh produce, plants or gardening materials with your community."}
        </p>

      </div>


      <form
        className="form-card"
        onSubmit={handleSubmit}
      >

        {/* ERROR */}

        {error && (
          <div className="error">
            {error}
          </div>
        )}


        {/* SUCCESS */}

        {success && (
          <div className="success">
            {success}
          </div>
        )}


        {/* PRODUCT NAME */}

        <label>
          Product name

          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Example: Fresh Tomatoes"
            required
          />
        </label>


        {/* CATEGORY */}

        <label>
          Category

          <select
            name="category"
            value={form.category}
            onChange={handleChange}
          >
            {CATEGORIES.map((category) => (
              <option
                key={category}
                value={category}
              >
                {category}
              </option>
            ))}
          </select>
        </label>


        {/* DESCRIPTION */}

        <label>
          Description

          <textarea
            name="description"
            rows="5"
            value={form.description}
            onChange={handleChange}
            placeholder="Describe your product..."
            required
          />
        </label>


        {/* PRICE / QUANTITY / UNIT */}

        <div className="form-row">

          <label>
            Price (₹)

            <input
              type="number"
              name="price"
              min="0.01"
              step="0.01"
              value={form.price}
              onChange={handleChange}
              required
            />
          </label>


          <label>
            Quantity

            <input
              type="number"
              name="quantity"
              min="0"
              step="1"
              value={form.quantity}
              onChange={handleChange}
              required
            />
          </label>


          <label>
            Unit

            <select
              name="unit"
              value={form.unit}
              onChange={handleChange}
              required
            >
              {availableUnits.map((unit) => (
                <option
                  key={unit}
                  value={unit}
                >
                  {unit}
                </option>
              ))}
            </select>

          </label>

        </div>


        {/* LOCATION */}

        <label>
          Location

          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="City / locality"
          />
        </label>


        {/* IMAGE */}

        <label className="upload-box">

          {preview ? (
            <>
              <img
                src={preview}
                alt="Product preview"
              />

              <span>
                Product preview
              </span>
            </>
          ) : (
            <>
              <b>
                ＋ Add product photo
              </b>

              <span>
                Use a clear photo of your produce
                or garden item
              </span>
            </>
          )}

          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImageChange}
          />

        </label>


        {/* AVAILABILITY */}

        <label className="check">

          <input
            type="checkbox"
            name="is_available"
            checked={form.is_available}
            onChange={handleChange}
          />

          Available for purchase

        </label>


        {/* BUTTONS */}

        <div
          style={{
            display: "flex",
            gap: "12px",
            marginTop: "10px",
          }}
        >

          <button
            type="submit"
            className="btn btn-green"
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : isEditMode
              ? "Save changes →"
              : "Publish listing →"}
          </button>


          <button
            type="button"
            className="btn"
            onClick={() =>
              navigate("/seller/dashboard")
            }
            disabled={saving}
          >
            Cancel
          </button>

        </div>

      </form>

    </div>
  );
}