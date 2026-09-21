import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function ExpertDashboard() {
  const navigate = useNavigate();

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function loadClasses() {
    try {
      setLoading(true);
      setMessage("");

      const response = await api.get("/classes/?mine=1");

      const data = response.data;

      setClasses(
        Array.isArray(data)
          ? data
          : data.results || []
      );
    } catch (error) {
      console.error(error);

      setMessage(
        error.response?.data?.detail ||
          "Could not load your classes."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadClasses();
  }, []);

  async function deleteClass(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this class?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/classes/${id}/`);

      setMessage("Class deleted successfully.");

      await loadClasses();
    } catch (error) {
      console.error(error);

      setMessage(
        error.response?.data?.detail ||
          "Could not delete the class."
      );
    }
  }

  function editClass(id) {
    if (!id) {
      setMessage("Class ID is missing.");
      return;
    }

    navigate(`/expert/classes/${id}/edit`);
  }

  function createClass() {
    navigate("/expert/classes/new");
  }

  return (
    <div className="page">

      {/* =========================
          HERO
      ========================= */}

      <div className="page-hero">
        <div>
          <p className="eyebrow">
            EXPERT DASHBOARD
          </p>

          <h1>
            Teach what you know.
          </h1>

          <p>
            Create and manage gardening classes
            for the GreenNest community.
          </p>
        </div>
      </div>


      {/* =========================
          HEADER
      ========================= */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "20px",
          flexWrap: "wrap",
          marginBottom: "30px",
        }}
      >

        <div>
          <h2>
            My Classes
          </h2>

          <p>
            Create practical gardening lessons
            and share your experience.
          </p>
        </div>

        <button
          className="btn btn-green"
          onClick={createClass}
        >
          + Create class
        </button>

      </div>


      {/* =========================
          MESSAGE
      ========================= */}

      {message && (
        <div className="toast">
          {message}
        </div>
      )}


      {/* =========================
          LOADING
      ========================= */}

      {loading && (
        <div className="empty-state">
          Loading your classes...
        </div>
      )}


      {/* =========================
          EMPTY
      ========================= */}

      {!loading && classes.length === 0 && (
        <div className="empty-state">

          <div
            style={{
              fontSize: "50px",
            }}
          >
            📚
          </div>

          <h3>
            No classes yet
          </h3>

          <p>
            You haven't published any gardening classes.
          </p>

          <button
            className="btn btn-green"
            onClick={createClass}
          >
            Create your first class
          </button>

        </div>
      )}


      {/* =========================
          CLASS LIST
      ========================= */}

      {!loading && classes.length > 0 && (
        <div className="class-grid">

          {classes.map((item) => (

            <article
              className="class-card"
              key={item.id}
            >

              <div>

                {/* CATEGORY + MODE */}

                <small>
                  {item.category} · {item.mode}
                </small>


                {/* TITLE */}

                <h3>
                  {item.title}
                </h3>


                {/* CLASS ID */}

                <small
                  style={{
                    display: "block",
                    marginTop: "5px",
                    opacity: 0.7,
                  }}
                >
                  Class ID: {item.id}
                </small>


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


                {/* SEATS */}

                <p>
                  {item.seats_taken || 0}
                  /
                  {item.max_seats}
                  {" "}seats
                </p>


                {/* BUTTONS */}

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap",
                    marginTop: "18px",
                  }}
                >

                  <button
                    className="btn btn-green small"
                    onClick={() =>
                      editClass(item.id)
                    }
                  >
                    Edit
                  </button>


                  <button
                    className="btn small"
                    onClick={() =>
                      deleteClass(item.id)
                    }
                  >
                    Delete
                  </button>

                </div>

              </div>

            </article>

          ))}

        </div>
      )}

    </div>
  );
}