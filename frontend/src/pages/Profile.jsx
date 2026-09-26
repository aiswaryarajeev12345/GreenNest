import React, { useEffect, useState } from "react";
import {
  User,
  MapPin,
  Phone,
  Award,
  Upload,
  Save,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

const Profile = () => {
  const { user, updateProfile, refreshProfile } = useAuth();

  const [formData, setFormData] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    bio: user?.profile?.bio || "",
    location_city: user?.profile?.location_city || "",
    phone_number: user?.profile?.phone_number || "",
    gardening_experience:
      user?.profile?.gardening_experience || "BEGINNER",
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(
    user?.profile?.avatar
      ? `http://localhost:8000${user.profile.avatar}`
      : null
  );

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    setFormData({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      bio: user.profile?.bio || "",
      location_city: user.profile?.location_city || "",
      phone_number: user.profile?.phone_number || "",
      gardening_experience:
        user.profile?.gardening_experience || "BEGINNER",
    });

    if (user.profile?.avatar) {
      setAvatarPreview(
        user.profile.avatar.startsWith("http")
          ? user.profile.avatar
          : `http://localhost:8000${user.profile.avatar}`
      );
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSuccess("");
    setError("");
    setLoading(true);

    try {
      let dataToSubmit;

      if (avatarFile) {
        dataToSubmit = new FormData();

        Object.keys(formData).forEach((key) => {
          dataToSubmit.append(key, formData[key]);
        });

        dataToSubmit.append("avatar", avatarFile);
      } else {
        dataToSubmit = formData;
      }

      await updateProfile(dataToSubmit);
      await refreshProfile();

      setSuccess("Profile updated successfully!");
      setAvatarFile(null);
    } catch (err) {
      console.error("Update profile error:", err);
      setError("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="profile-page">
      <div className="profile-container">

        {/* PAGE INTRO */}
        <div className="profile-intro">
          <p className="eyebrow">YOUR GREENNEST PROFILE</p>

          <h1>
            My Gardener <em>Profile</em>
          </h1>

          <p>
            Manage your personal details, gardening experience,
            location and profile picture.
          </p>
        </div>

        {/* SUCCESS */}
        {success && (
          <div className="profile-message profile-success">
            <CheckCircle size={18} />
            <span>{success}</span>
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="profile-message profile-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* PROFILE CARD */}
        <section className="profile-shell">

          {/* IDENTITY */}
          <div className="profile-identity">

            <div className="profile-avatar-wrap">

              <div className="profile-avatar">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Profile"
                  />
                ) : (
                  <User size={46} />
                )}
              </div>

              <label
                htmlFor="avatar-upload"
                className="profile-avatar-edit"
                title="Change profile picture"
              >
                <Upload size={15} />

                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                />
              </label>

            </div>

            <div className="profile-user-info">

              <p className="profile-label">
                GREENNEST MEMBER
              </p>

              <h2>{user?.username}</h2>

              <p className="profile-email">
                {user?.email}
              </p>

              <div className="profile-badges">

                <span className="profile-badge profile-role">
                  {user?.profile?.role_display ||
                    user?.profile?.role}
                </span>

                <span className="profile-badge profile-points">
                  <Award size={14} />
                  Points: {user?.profile?.reputation_points || 0}
                </span>

              </div>

            </div>
          </div>

          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            className="profile-form"
          >

            <div className="profile-section-heading">
              <p>PERSONAL DETAILS</p>
              <h3>Tell us about yourself</h3>
            </div>

            <div className="profile-form-grid">

              <div className="form-group">
                <label className="form-label">
                  First Name
                </label>

                <input
                  type="text"
                  name="first_name"
                  className="form-input"
                  value={formData.first_name}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Last Name
                </label>

                <input
                  type="text"
                  name="last_name"
                  className="form-input"
                  value={formData.last_name}
                  onChange={handleChange}
                />
              </div>

            </div>

            <div className="form-group">
              <label className="form-label">
                Gardener Bio / About Me
              </label>

              <textarea
                name="bio"
                rows="4"
                className="form-textarea"
                placeholder="Tell the GreenNest community about your garden..."
                value={formData.bio}
                onChange={handleChange}
              />
            </div>

            <div className="profile-form-grid">

              <div className="form-group">
                <label className="form-label">
                  <MapPin size={15} />
                  City / Location
                </label>

                <input
                  type="text"
                  name="location_city"
                  className="form-input"
                  placeholder="e.g. Bengaluru"
                  value={formData.location_city}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Phone size={15} />
                  Phone Number
                </label>

                <input
                  type="text"
                  name="phone_number"
                  className="form-input"
                  placeholder="+91 98765 43210"
                  value={formData.phone_number}
                  onChange={handleChange}
                />
              </div>

            </div>

            <div className="form-group">
              <label className="form-label">
                Gardening Experience Level
              </label>

              <select
                name="gardening_experience"
                className="form-select"
                value={formData.gardening_experience}
                onChange={handleChange}
              >
                <option value="BEGINNER">
                  Beginner (0–1 years)
                </option>

                <option value="INTERMEDIATE">
                  Intermediate (1–3 years)
                </option>

                <option value="EXPERT">
                  Expert / Veteran (3+ years)
                </option>
              </select>
            </div>

            <div className="profile-form-footer">

              <p>
                Your profile information helps other
                GreenNest members connect with you.
              </p>

              <button
                type="submit"
                className="btn profile-save-btn"
                disabled={loading}
              >
                <Save size={17} />

                {loading
                  ? "Saving Changes..."
                  : "Update Profile"}
              </button>

            </div>

          </form>

        </section>

      </div>
    </main>
  );
};

export default Profile;