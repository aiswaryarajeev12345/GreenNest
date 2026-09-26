import { useEffect, useState } from "react";
import api from "../api/axios";
import { getImage } from "../api/features";
import { DEFAULT_IMAGES } from "../api/defaultImages";

export default function Classes() {
  const [items, setItems] = useState([]);
  const [joined, setJoined] = useState(new Set());
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setMsg("");

    try {
      const response = await api.get("/classes/");

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.results || [];

      setItems(data);

      /*
       * Do NOT reset joined here.
       *
       * The joined state is managed locally when
       * the user joins or leaves a class.
       */
    } catch (error) {
      console.error("Classes loading error:", error);

      setItems([]);

      setMsg(
        error.response?.data?.detail ||
          "Could not load classes."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function join(id) {
    try {
      await api.post(`/classes/${id}/join/`);

      setMsg("You're enrolled in this class!");

      setJoined((previous) => {
        const updated = new Set(previous);
        updated.add(id);
        return updated;
      });

      await load();
    } catch (error) {
      setMsg(
        error.response?.data?.detail ||
          "Could not join this class."
      );
    }
  }

  async function leave(id) {
    try {
      await api.delete(`/classes/${id}/join/`);

      setMsg("You left the class.");

      setJoined((previous) => {
        const updated = new Set(previous);
        updated.delete(id);
        return updated;
      });

      await load();
    } catch (error) {
      setMsg(
        error.response?.data?.detail ||
          "Could not leave this class."
      );
    }
  }

  function classImage(item) {
    if (item.image) {
      return getImage(item.image);
    }

    return (
      DEFAULT_IMAGES.people ||
      DEFAULT_IMAGES.garden
    );
  }

  return (
    <div className="page">

      {/* HERO */}
      <div className="page-hero">
        <div>
          <p className="eyebrow">
            LEARN FROM GROWERS
          </p>

          <h1>
            Gardening knowledge,{" "}
            <em>grown locally.</em>
          </h1>

          <p>
            Practical classes from experienced gardeners —
            from seed starting to terrace harvests.
          </p>
        </div>
      </div>

      {/* MESSAGE */}
      {msg && (
        <div className="toast">
          {msg}
        </div>
      )}

      {/* LOADING */}
      {loading ? (
        <div className="empty">
          <div style={{ fontSize: "3rem" }}>
            🌱
          </div>

          <h3>
            Loading classes...
          </h3>

          <p>
            Finding gardening classes for you.
          </p>
        </div>
      ) : items.length === 0 ? (

        /* EMPTY STATE */
        <div className="empty">
          <div style={{ fontSize: "3.5rem" }}>
            📚
          </div>

          <h3>
            No classes available yet
          </h3>

          <p>
            Expert gardeners haven't published
            any classes yet.
          </p>

          <p>
            Check back soon for new gardening
            lessons and workshops.
          </p>
        </div>

      ) : (

        /* CLASS LIST */
        <div className="class-grid">

          {items.map((item) => {
            const isJoined = joined.has(item.id);

            const isFull =
              Number(item.seats_taken || 0) >=
              Number(item.max_seats || 0);

            return (
              <article
                className="class-card"
                key={item.id}
              >

                {/* CLASS IMAGE */}
                <img
                  src={classImage(item)}
                  alt={item.title}
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src =
                      DEFAULT_IMAGES.garden;
                  }}
                />

                <div>

                  {/* CATEGORY + MODE */}
                  <small>
                    {item.category}
                    {" · "}
                    {item.mode}
                  </small>

                  {/* TITLE */}
                  <h3>
                    {item.title}
                  </h3>

                  {/* DESCRIPTION */}
                  <p>
                    {item.description}
                  </p>

                  {/* DATE + TIME */}
                  <p>
                    <b>
                      {item.date}
                    </b>
                    {" · "}
                    {item.start_time}
                    {" · "}
                    {item.duration} min
                  </p>

                  {/* EXPERT + SEATS */}
                  <p>
                    with{" "}
                    {item.expert_name ||
                      "GreenNest Expert"}
                    {" · "}
                    {item.seats_taken || 0}
                    /
                    {item.max_seats} seats
                  </p>

                  {/* CLASS ACTIONS */}
                  <div className="class-actions">

                    {/* PRICE */}
                    <strong>
                      {Number(item.price)
                        ? `₹${item.price}`
                        : "Free"}
                    </strong>

                    {/* JOIN / LEAVE */}
                    {isJoined ? (

                      <button
                        className="btn btn-green small class-action-btn"
                        onClick={() =>
                          leave(item.id)
                        }
                      >
                        ✓ Joined · Leave
                      </button>

                    ) : (

                      <button
                        className="btn btn-green small class-action-btn"
                        onClick={() =>
                          join(item.id)
                        }
                        disabled={isFull}
                      >
                        {isFull
                          ? "Class full"
                          : "Join class"}
                      </button>

                    )}

                  </div>

                  {/* GOOGLE MEET
                      ONLY AFTER JOINING */}
              {isJoined && (
  <div className="class-meet-action">
    <a
      href="https://meet.google.com/edj-ixuf-ibm"
      target="_blank"
      rel="noopener noreferrer"
      className="class-meet-btn"
    >
      <span>🎥</span>
      <span>Join Google Meet</span>
    </a>
  </div>
)}

                </div>

              </article>
            );
          })}

        </div>
      )}

    </div>
  );
}