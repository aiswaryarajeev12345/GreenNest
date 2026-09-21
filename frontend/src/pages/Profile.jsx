import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import "../styles/profile.css";

// Convert Django media URL into a URL React can display
function getAvatarUrl(url) {
  if (!url) return "";

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  return `http://127.0.0.1:8000${url}`;
}

export default function Profile() {
  const { user, refreshProfile } = useAuth();

  const [form, setForm] = useState({
    phone: "",
    location: "",
    gardening_experience: "",
    bio: "",
  });

  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState("");

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =====================================================
  // LOAD PROFILE
  // =====================================================

  useEffect(() => {
    if (user?.profile) {
      setForm({
        phone: user.profile.phone || "",
        location: user.profile.location || "",
        gardening_experience:
          user.profile.gardening_experience || "",
        bio: user.profile.bio || "",
      });

      setPreview(
        getAvatarUrl(user.profile.avatar)
      );
    }
  }, [user]);

  // =====================================================
  // HANDLE TEXT INPUT
  // =====================================================

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    setMessage("");
    setError("");
  }

  // =====================================================
  // HANDLE PROFILE IMAGE
  // =====================================================

  function handleAvatarChange(e) {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    // Make sure the selected file is an image
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    setAvatar(file);

    // Show selected image immediately
    const imageUrl = URL.createObjectURL(file);
    setPreview(imageUrl);

    setMessage("");
    setError("");
  }

  // =====================================================
  // SAVE PROFILE
  // =====================================================

  async function handleSubmit(e) {
    e.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const data = new FormData();

      data.append("phone", form.phone);
      data.append("location", form.location);
      data.append(
        "gardening_experience",
        form.gardening_experience
      );
      data.append("bio", form.bio);

      if (avatar) {
        data.append("avatar", avatar);
      }

      await api.put(
        "/auth/profile/",
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Get updated profile from Django
      await refreshProfile();

      setMessage(
        "Profile updated successfully."
      );

      setAvatar(null);
    } catch (err) {
      const responseData = err.response?.data;

      if (
        responseData &&
        typeof responseData === "object"
      ) {
        const errors = Object.values(responseData)
          .flat()
          .join(" ");

        setError(
          errors || "Unable to update profile."
        );
      } else {
        setError(
          "Unable to update profile."
        );
      }
    } finally {
      setSaving(false);
    }
  }

  // =====================================================
  // USER INFORMATION
  // =====================================================

  const username =
    user?.username || "User";

  const email =
    user?.email || "";

  const role =
    user?.profile?.role || "GROWER";

  const roleName =
    role.charAt(0) +
    role.slice(1).toLowerCase();

  const initial =
    username.charAt(0).toUpperCase();

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="profile-page">

      <div className="profile-container">

        {/* =================================================
            PROFILE HEADER
        ================================================= */}

        <div className="profile-header">

          <div className="profile-avatar">

            {preview ? (
              <img
                src={preview}
                alt="Profile"
                onError={(e) => {
                  e.currentTarget.style.display =
                    "none";
                }}
              />
            ) : (
              <span>{initial}</span>
            )}

          </div>

          <div className="profile-title">

            <h1>
              Your Profile
            </h1>

            <p>
              Manage your GreenNest account
              and gardening information.
            </p>

          </div>

        </div>

        {/* =================================================
            ACCOUNT INFORMATION
        ================================================= */}

        <div className="profile-card">

          <h2>
            Account Information
          </h2>

          <p className="profile-description">
            Your GreenNest account details
          </p>

          <div className="account-grid">

            {/* USERNAME */}

            <div className="account-item">

              <span>
                Username
              </span>

              <strong>
                {username}
              </strong>

            </div>

            {/* EMAIL */}

            <div className="account-item">

              <span>
                Email
              </span>

              <strong>
                {email}
              </strong>

            </div>

            {/* ROLE */}

            <div className="account-item">

              <span>
                Role
              </span>

              <strong className="role-badge">
                {roleName}
              </strong>

            </div>

          </div>

        </div>

        {/* =================================================
            PERSONAL INFORMATION
        ================================================= */}

        <div className="profile-card">

          <h2>
            Personal Information
          </h2>

          <p className="profile-description">
            Tell the GreenNest community
            a little about yourself.
          </p>

          <form onSubmit={handleSubmit}>

            <div className="form-grid">

              {/* PHONE */}

              <div className="form-group">

                <label htmlFor="phone">
                  Phone
                </label>

                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                />

              </div>

              {/* LOCATION */}

              <div className="form-group">

                <label htmlFor="location">
                  Location
                </label>

                <input
                  id="location"
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="Enter your location"
                />

              </div>

              {/* GARDENING EXPERIENCE */}

              <div className="form-group full">

                <label htmlFor="gardening_experience">
                  Gardening Experience
                </label>

                <select
                  id="gardening_experience"
                  name="gardening_experience"
                  value={
                    form.gardening_experience
                  }
                  onChange={handleChange}
                >

                  <option value="">
                    Select experience
                  </option>

                  <option value="BEGINNER">
                    Beginner
                  </option>

                  <option value="INTERMEDIATE">
                    Intermediate
                  </option>

                  <option value="EXPERIENCED">
                    Experienced
                  </option>

                </select>

              </div>

              {/* BIO */}

              <div className="form-group full">

                <label htmlFor="bio">
                  Bio
                </label>

                <textarea
                  id="bio"
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  placeholder="Write something about yourself..."
                  rows="5"
                />

              </div>

              {/* PROFILE IMAGE */}

              <div className="form-group full">

                <label htmlFor="avatar">
                  Profile Image
                </label>

                <input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  onChange={
                    handleAvatarChange
                  }
                />

                {/* IMAGE PREVIEW */}

                {preview && (
                  <div className="profile-image-preview">

                    <img
                      src={preview}
                      alt="Selected profile"
                    />

                    <div>
                      <strong>
                        Profile image preview
                      </strong>

                      <span>
                        Your selected image
                      </span>
                    </div>

                  </div>
                )}

              </div>

            </div>

            {/* =================================================
                SUCCESS MESSAGE
            ================================================= */}

            {message && (
              <div className="profile-success">
                {message}
              </div>
            )}

            {/* =================================================
                ERROR MESSAGE
            ================================================= */}

            {error && (
              <div className="profile-error">
                {error}
              </div>
            )}

            {/* =================================================
                SAVE BUTTON
            ================================================= */}

            <div className="profile-actions">

              <button
                type="submit"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </button>

            </div>

          </form>

        </div>

      </div>

    </div>
  );
}