import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";

export default function ExpertClassForm() {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Vegetable Gardening",
    date: "",
    start_time: "",
    duration: 60,
    location: "",
    mode: "ONLINE",
    price: 0,
    max_seats: 20,
  });

  const [image, setImage] = useState(null);
  const [existingImage, setExistingImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEdit);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!isEdit) {
      setLoadingData(false);
      return;
    }

    async function loadClass() {
      try {
        const response = await api.get(`/classes/${id}/`);
        const data = response.data;

        setForm({
          title: data.title || "",
          description: data.description || "",
          category: data.category || "Vegetable Gardening",
          date: data.date || "",
          start_time: data.start_time || "",
          duration: data.duration || 60,
          location: data.location || "",
          mode: data.mode || "ONLINE",
          price: data.price || 0,
          max_seats: data.max_seats || 20,
        });

        setExistingImage(data.image || "");
      } catch (error) {
        console.error(error);

        setMessage(
          error.response?.data?.detail ||
            "Could not load this class."
        );
      } finally {
        setLoadingData(false);
      }
    }

    loadClass();
  }, [id, isEdit]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0];

    if (file) {
      setImage(file);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const data = new FormData();

      data.append("title", form.title);
      data.append("description", form.description);
      data.append("category", form.category);
      data.append("date", form.date);
      data.append("start_time", form.start_time);
      data.append("duration", form.duration);
      data.append("location", form.location);
      data.append("mode", form.mode);
      data.append("price", form.price);
      data.append("max_seats", form.max_seats);

      if (image) {
        data.append("image", image);
      }

      if (isEdit) {
        await api.patch(`/classes/${id}/`, data);
      } else {
        await api.post("/classes/", data);
      }

      navigate("/dashboard");
    } catch (error) {
      console.error(error);

      const errors = error.response?.data;

      if (typeof errors === "object" && errors !== null) {
        const firstError = Object.values(errors)[0];

        if (Array.isArray(firstError)) {
          setMessage(String(firstError[0]));
        } else {
          setMessage(String(firstError));
        }
      } else {
        setMessage(
          "Could not save the class. Please check your details."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  if (loadingData) {
    return (
      <div className="page">
        <div className="empty-state">
          Loading class...
        </div>
      </div>
    );
  }

  return (
    <div className="page">

      {/* HEADER */}
      <div className="page-hero">
        <div>
          <p className="eyebrow">
            {isEdit ? "EDIT CLASS" : "CREATE CLASS"}
          </p>

          <h1>
            {isEdit
              ? "Update your class."
              : "Share what you know."}
          </h1>

          <p>
            Create a practical gardening class
            for the GreenNest community.
          </p>
        </div>
      </div>

      {/* FORM */}
      <div
        style={{
          maxWidth: "760px",
          margin: "0 auto 60px",
          background: "#ffffff",
          padding: "30px",
          borderRadius: "20px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
        }}
      >

        {message && (
          <div className="toast">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* TITLE */}
          <div className="form-group">
            <label>
              Class title
            </label>

            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Example: Growing Tomatoes Successfully"
              required
            />
          </div>

          {/* DESCRIPTION */}
          <div className="form-group">
            <label>
              Description
            </label>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="What will students learn?"
              rows="5"
              required
            />
          </div>

          {/* CATEGORY */}
          <div className="form-group">
            <label>
              Category
            </label>

            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              required
            >
              <option value="Terrace Farming">
                Terrace Farming
              </option>

              <option value="Vegetable Gardening">
                Vegetable Gardening
              </option>

              <option value="Organic Gardening">
                Organic Gardening
              </option>

              <option value="Seed Starting">
                Seed Starting
              </option>

              <option value="Composting">
                Composting
              </option>

              <option value="Balcony Gardening">
                Balcony Gardening
              </option>

              <option value="Beginner Gardening">
                Beginner Gardening
              </option>

              <option value="Other">
                Other
              </option>
            </select>
          </div>

          {/* DATE + TIME */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "20px",
            }}
          >

            <div className="form-group">
              <label>
                Date
              </label>

              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>
                Start time
              </label>

              <input
                type="time"
                name="start_time"
                value={form.start_time}
                onChange={handleChange}
                required
              />
            </div>

          </div>

          {/* DURATION + SEATS */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "20px",
            }}
          >

            <div className="form-group">
              <label>
                Duration (minutes)
              </label>

              <input
                type="number"
                name="duration"
                value={form.duration}
                onChange={handleChange}
                min="15"
                required
              />
            </div>

            <div className="form-group">
              <label>
                Maximum seats
              </label>

              <input
                type="number"
                name="max_seats"
                value={form.max_seats}
                onChange={handleChange}
                min="1"
                required
              />
            </div>

          </div>

          {/* MODE */}
          <div className="form-group">
            <label>
              Class mode
            </label>

            <select
              name="mode"
              value={form.mode}
              onChange={handleChange}
              required
            >
              <option value="ONLINE">
                Online
              </option>

              <option value="OFFLINE">
                Offline
              </option>
            </select>
          </div>

          {/* LOCATION */}
          <div className="form-group">
            <label>
              Location / Meeting link
            </label>

            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="Example: Google Meet / Palakkad"
            />
          </div>

          {/* PRICE */}
          <div className="form-group">
            <label>
              Price
            </label>

            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              min="0"
              step="0.01"
            />

            <small>
              Enter 0 for a free class.
            </small>
          </div>

          {/* IMAGE */}
          <div className="form-group">
            <label>
              Class image
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />

            {existingImage && !image && (
              <p style={{ marginTop: "10px" }}>
                Existing image will be kept.
              </p>
            )}

            {image && (
              <p style={{ marginTop: "10px" }}>
                Selected: {image.name}
              </p>
            )}
          </div>

          {/* BUTTONS */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
              marginTop: "25px",
            }}
          >

            <button
              type="submit"
              className="btn btn-green"
              disabled={loading}
            >
              {loading
                ? "Publishing..."
                : isEdit
                ? "Update class"
                : "Publish class"}
            </button>

            <button
              type="button"
              className="btn"
              onClick={() => navigate("/dashboard")}
            >
              Cancel
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}