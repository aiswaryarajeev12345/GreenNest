import { useEffect, useState } from "react";
import api from "../api/axios";
import { getImage, upload } from "../api/features";
import { DEFAULT_IMAGES } from "../api/defaultImages";

const EMPTY_FORM = {
  title: "",
  description: "",
  category: "Seeds",
  location: "",
  image: null,
};

const CATEGORIES = [
  "Seeds",
  "Plants",
  "Fertilizers",
  "Gardening Materials",
  "Garden Tools",
  "Other",
];

export default function Exchange() {
  const [items, setItems] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [ownerRequests, setOwnerRequests] = useState([]);

  const [showCreate, setShowCreate] = useState(false);
  const [showMyRequests, setShowMyRequests] = useState(false);
  const [showOwnerRequests, setShowOwnerRequests] = useState(false);

  const [requestItem, setRequestItem] = useState(null);
  const [statusItem, setStatusItem] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);

  const [requestForm, setRequestForm] = useState({
    offered_item: "",
    message: "",
    image: null,
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadListings() {
    try {
      const response = await api.get("/exchange/");
      setItems(response.data.results || response.data || []);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to load exchange listings."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadMyRequests() {
    try {
      const response = await api.get("/exchange/my-requests/");
      setMyRequests(response.data || []);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to load your exchange requests."
      );
    }
  }

  async function loadOwnerRequests() {
    try {
      const response = await api.get("/exchange/owner-requests/");
      setOwnerRequests(response.data || []);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to load exchange requests."
      );
    }
  }

  useEffect(() => {
    loadListings();
    loadMyRequests();
    loadOwnerRequests();
  }, []);

  function resetMessages() {
    setMessage("");
    setError("");
  }

  function handleFormChange(event) {
    const { name, value, files } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: files ? files[0] : value,
    }));
  }

  async function createListing(event) {
    event.preventDefault();
    resetMessages();
    setSaving(true);

    try {
      const data = new FormData();

      data.append("title", form.title);
      data.append("description", form.description);
      data.append("category", form.category);
      data.append("location", form.location);

      if (form.image) {
        data.append("image", form.image);
      }

      await upload("/exchange/", data);

      setMessage("Your exchange listing has been published.");

      setForm(EMPTY_FORM);
      setShowCreate(false);

      await loadListings();
    } catch (err) {
      const backendError = err.response?.data;

      setError(
        backendError?.detail ||
          backendError?.title?.[0] ||
          backendError?.description?.[0] ||
          "Could not create the exchange listing."
      );
    } finally {
      setSaving(false);
    }
  }

  function openRequest(item) {
    resetMessages();

    if (item.status === "AVAILABLE") {
      setRequestItem(item);

      setRequestForm({
        offered_item: "",
        message: "",
        image: null,
      });

      return;
    }

    setStatusItem(item);
  }

  async function sendRequest() {
    if (!requestForm.offered_item.trim()) {
      setError(
        "Please enter what you are offering in exchange."
      );
      return;
    }

    resetMessages();
    setSaving(true);

    try {
      const data = new FormData();

      data.append(
        "offered_item",
        requestForm.offered_item.trim()
      );

      data.append(
        "message",
        requestForm.message.trim()
      );

      if (requestForm.image) {
        data.append("image", requestForm.image);
      }

      await upload(
        `/exchange/${requestItem.id}/request/`,
        data
      );

      setMessage("Exchange request sent successfully.");

      setRequestItem(null);

      await Promise.all([
        loadListings(),
        loadMyRequests(),
        loadOwnerRequests(),
      ]);
    } catch (err) {
      const backendError = err.response?.data;

      setError(
        backendError?.detail ||
          backendError?.offered_item?.[0] ||
          backendError?.image?.[0] ||
          "Could not send the exchange request."
      );
    } finally {
      setSaving(false);
    }
  }

  async function cancelRequest(id) {
    resetMessages();

    try {
      await api.patch("/exchange/my-requests/", {
        id,
        status: "CANCELLED",
      });

      setMessage("Exchange request cancelled.");

      await Promise.all([
        loadMyRequests(),
        loadListings(),
      ]);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Could not cancel the request."
      );
    }
  }

  async function updateRequest(id, status) {
    resetMessages();

    try {
      await api.patch(
        `/exchange/requests/${id}/action/`,
        { status }
      );

      setMessage(
        status === "ACCEPTED"
          ? "Exchange request accepted."
          : status === "REJECTED"
          ? "Exchange request rejected."
          : "Exchange marked as completed."
      );

      await Promise.all([
        loadListings(),
        loadOwnerRequests(),
        loadMyRequests(),
      ]);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Could not update the exchange request."
      );
    }
  }

  function listingImage(item) {
    if (item.image) {
      return getImage(item.image);
    }

    return (
      DEFAULT_IMAGES.seedlings ||
      DEFAULT_IMAGES.garden
    );
  }

  function statusLabel(status) {
    const labels = {
      AVAILABLE: "Available",
      PENDING: "Request pending",
      ACCEPTED: "Exchange accepted",
      COMPLETED: "Completed",
      CANCELLED: "Exchange cancelled",
      REJECTED: "Request rejected",
    };

    return labels[status] || status;
  }

  return (
    <div className="page">

      {/* HERO */}
      <div className="page-hero">
        <div>
          <p className="eyebrow">
            SHARE · SWAP · GROW
          </p>

          <h1>
            Trade what your garden <em>has.</em>
          </h1>

          <p>
            Exchange seeds, plants and gardening materials
            with people in your community.
          </p>
        </div>

        <button
          className="btn btn-green"
          onClick={() => {
            resetMessages();
            setShowCreate(true);
          }}
        >
          + Offer an item
        </button>
      </div>

      {/* MESSAGES */}
      {message && (
        <div className="success">
          {message}
        </div>
      )}

      {error && (
        <div className="error">
          {error}
        </div>
      )}

      {/* ACTION BUTTONS */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
          marginBottom: "30px",
        }}
      >
        <button
          className="btn exchange-action-btn"
          onClick={() => {
            resetMessages();
            setShowMyRequests(true);
            loadMyRequests();
          }}
        >
          My requests
        </button>

        <button
          className="btn exchange-action-btn"
          onClick={() => {
            resetMessages();
            setShowOwnerRequests(true);
            loadOwnerRequests();
          }}
        >
          Requests for my items
        </button>
      </div>

      {/* LISTINGS */}
      <div className="section-title">
        <div>
          <p className="eyebrow">
            COMMUNITY EXCHANGE
          </p>

          <h2
            style={{
              font: '600 2.4rem "Playfair Display", serif',
              margin: "8px 0 25px",
            }}
          >
            Available to swap
          </h2>
        </div>
      </div>

      {loading ? (
        <div className="empty">
          Loading exchange listings...
        </div>
      ) : items.length === 0 ? (
        <div className="empty">
          <div style={{ fontSize: "3rem" }}>
            🌱
          </div>

          <h3>
            No exchange listings yet
          </h3>

          <p>
            Be the first grower to offer something
            from your garden.
          </p>

          <button
            className="btn btn-green"
            onClick={() => setShowCreate(true)}
          >
            Offer an item
          </button>
        </div>
      ) : (
        <div className="class-grid">
          {items.map((item) => (
            <article
              className="class-card"
              key={item.id}
              onClick={() => openRequest(item)}
              style={{ cursor: "pointer" }}
            >
              <img
                src={listingImage(item)}
                alt={item.title}
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src =
                    DEFAULT_IMAGES.garden;
                }}
              />

              <div>
                <small>
                  {item.category}
                  {" · "}
                  EXCHANGE
                </small>

                <h3>
                  {item.title}
                </h3>

                <p>
                  {item.description}
                </p>

                <p>
                  📍{" "}
                  {item.location || "Local grower"}
                </p>

                <p>
                  with{" "}
                  {item.owner_name ||
                    "GreenNest grower"}
                </p>

                {/* NEW EXCHANGE-SPECIFIC AREA */}
            {/* STATUS IS NOW THE BUTTON — opens details/request modal */}
<div className="exchange-status-actions">
  <button
    type="button"
    className="exchange-request-btn"
    onClick={(event) => {
      event.stopPropagation();
      openRequest(item);
    }}
  >
    {statusLabel(item.status)}
  </button>
</div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* CREATE LISTING MODAL */}
      {showCreate && (
        <div
          className="modal"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            overflowY: "auto",
            padding: "24px",
            boxSizing: "border-box",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            className="modal-card"
            style={{
              maxHeight: "calc(100vh - 48px)",
              overflowY: "auto",
              width: "min(560px, 100%)",
              boxSizing: "border-box",
              margin: "auto",
            }}
          >
            <button
              className="close"
              onClick={() => setShowCreate(false)}
            >
              ×
            </button>

            <p className="eyebrow">
              CREATE EXCHANGE LISTING
            </p>

            <h2>
              Offer something from your garden
            </h2>

            <form
              onSubmit={createListing}
              className="form-card"
              style={{
                padding: 0,
                boxShadow: "none",
                background: "transparent",
              }}
            >
              <label>
                Item name

                <input
                  name="title"
                  value={form.title}
                  onChange={handleFormChange}
                  placeholder="Example: Mango Plant"
                  required
                />
              </label>

              <label>
                Category

                <select
                  name="category"
                  value={form.category}
                  onChange={handleFormChange}
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

              <label>
                Description

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleFormChange}
                  placeholder="Describe what you are offering..."
                  rows="4"
                  required
                />
              </label>

              <label>
                Location

                <input
                  name="location"
                  value={form.location}
                  onChange={handleFormChange}
                  placeholder="Example: Palakkad"
                />
              </label>

              <label>
                Photo

                <input
                  name="image"
                  type="file"
                  accept="image/*"
                  onChange={handleFormChange}
                />
              </label>

              <button
                className="btn btn-green"
                type="submit"
                disabled={saving}
              >
                {saving
                  ? "Publishing..."
                  : "Publish exchange item"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* REQUEST MODAL */}
      {requestItem && (
        <div
          className="modal"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            overflowY: "auto",
            padding: "24px",
            boxSizing: "border-box",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            className="modal-card"
            style={{
              maxHeight: "calc(100vh - 48px)",
              overflowY: "auto",
              width: "min(560px, 100%)",
              boxSizing: "border-box",
              margin: "auto",
            }}
          >
            <button
              className="close"
              onClick={() => setRequestItem(null)}
            >
              ×
            </button>

            <p className="eyebrow">
              EXCHANGE REQUEST
            </p>

            <h2>
              {requestItem.title}
            </h2>

            <p>
              Tell the grower what you would like
              to offer in exchange.
            </p>

            <label>
              What are you offering?

              <input
                value={requestForm.offered_item}
                onChange={(event) =>
                  setRequestForm({
                    ...requestForm,
                    offered_item:
                      event.target.value,
                  })
                }
                placeholder="Example: Tomato seeds"
              />
            </label>

            <label>
              Message

              <textarea
                value={requestForm.message}
                onChange={(event) =>
                  setRequestForm({
                    ...requestForm,
                    message: event.target.value,
                  })
                }
                placeholder="Write a message to the grower..."
                rows="4"
              />
            </label>

            <label>
              Photo of what you are offering

              <input
                type="file"
                accept="image/*"
                onChange={(event) =>
                  setRequestForm({
                    ...requestForm,
                    image:
                      event.target.files?.[0] ||
                      null,
                  })
                }
              />
            </label>

            {requestForm.image && (
              <div
                style={{
                  marginTop: "12px",
                  marginBottom: "15px",
                }}
              >
                <p
                  style={{
                    marginBottom: "8px",
                    fontWeight: 600,
                  }}
                >
                  Selected photo
                </p>

                <img
                  src={URL.createObjectURL(
                    requestForm.image
                  )}
                  alt="Selected exchange item"
                  style={{
                    width: "160px",
                    height: "130px",
                    objectFit: "cover",
                    borderRadius: "14px",
                  }}
                />
              </div>
            )}

            <button
              className="btn btn-green"
              onClick={sendRequest}
              disabled={saving}
            >
              {saving
                ? "Sending..."
                : "Send exchange request"}
            </button>
          </div>
        </div>
      )}

      {/* STATUS MODAL */}
      {statusItem && (
        <div
          className="modal"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            overflowY: "auto",
            padding: "24px",
            boxSizing: "border-box",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            className="modal-card"
            style={{
              maxHeight: "calc(100vh - 48px)",
              overflowY: "auto",
              width: "min(560px, 100%)",
              boxSizing: "border-box",
              margin: "auto",
            }}
          >
            <button
              className="close"
              onClick={() => setStatusItem(null)}
            >
              ×
            </button>

            <p className="eyebrow">
              COMMUNITY EXCHANGE
            </p>

            <h2>
              {statusItem.title}
            </h2>

            {statusItem.image && (
              <img
                src={listingImage(statusItem)}
                alt={statusItem.title}
                style={{
                  width: "100%",
                  maxHeight: "280px",
                  objectFit: "cover",
                  borderRadius: "16px",
                  marginBottom: "20px",
                }}
              />
            )}

            <p>
              {statusItem.description}
            </p>

            <p>
              📍{" "}
              {statusItem.location ||
                "Local grower"}
            </p>

            <p>
              with{" "}
              {statusItem.owner_name ||
                "GreenNest grower"}
            </p>

            <div
              style={{
                marginTop: "20px",
                padding: "18px",
                borderRadius: "14px",
                background: "var(--surface)",
              }}
            >
              {statusItem.status === "PENDING" && (
                <>
                  <h3>
                    Exchange request pending
                  </h3>

                  <p>
                    Your exchange request has
                    already been sent to the grower.
                  </p>

                  <p>
                    Please wait for the grower
                    to respond.
                  </p>
                </>
              )}

              {statusItem.status === "COMPLETED" && (
                <>
                  <h3>
                    Exchange completed
                  </h3>

                  <p>
                    This exchange has already
                    been completed and is no
                    longer available.
                  </p>
                </>
              )}

              {statusItem.status === "ACCEPTED" && (
                <>
                  <h3>
                    Exchange accepted
                  </h3>

                  <p>
                    Your exchange request has
                    been accepted by the grower.
                  </p>
                </>
              )}

              {statusItem.status === "REJECTED" && (
                <>
                  <h3>
                    Request rejected
                  </h3>

                  <p>
                    This exchange request was
                    not accepted by the grower.
                  </p>
                </>
              )}

              {statusItem.status === "CANCELLED" && (
                <>
                  <h3>
                    Exchange request cancelled
                  </h3>

                  <p>
                    This exchange request has
                    been cancelled.
                  </p>
                </>
              )}

              {![
                "PENDING",
                "COMPLETED",
                "ACCEPTED",
                "REJECTED",
                "CANCELLED",
              ].includes(statusItem.status) && (
                <>
                  <h3>
                    {statusLabel(
                      statusItem.status
                    )}
                  </h3>

                  <p>
                    This exchange listing is
                    currently not available for
                    a new request.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MY REQUESTS MODAL */}
      {showMyRequests && (
        <div
          className="modal"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            overflowY: "auto",
            padding: "24px",
            boxSizing: "border-box",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            className="modal-card"
            style={{
              maxWidth: "720px",
              maxHeight: "calc(100vh - 48px)",
              overflowY: "auto",
              width: "100%",
              boxSizing: "border-box",
              margin: "auto",
            }}
          >
            <button
              className="close"
              onClick={() => setShowMyRequests(false)}
            >
              ×
            </button>

            <p className="eyebrow">
              MY REQUESTS
            </p>

            <h2>
              Exchange requests I sent
            </h2>

            {myRequests.length === 0 ? (
              <div className="empty">
                You haven't sent any exchange
                requests yet.
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gap: "12px",
                }}
              >
                {myRequests.map((request) => (
                  <div
                    key={request.id}
                    style={{
                      background: "white",
                      padding: "18px",
                      borderRadius: "16px",
                    }}
                  >
                    <small>
                      {request.listing?.title ||
                        `Listing #${request.listing}`}
                    </small>

                    <h3
                      style={{
                        margin: "7px 0",
                      }}
                    >
                      Offering:{" "}
                      {request.offered_item}
                    </h3>

                    {request.message && (
                      <p>
                        {request.message}
                      </p>
                    )}

                    {request.image && (
                      <div
                        style={{
                          marginTop: "12px",
                        }}
                      >
                        <p
                          style={{
                            fontWeight: 600,
                            marginBottom: "8px",
                          }}
                        >
                          Your offered item
                        </p>

                        <img
                          src={getImage(
                            request.image
                          )}
                          alt={request.offered_item}
                          style={{
                            width: "180px",
                            height: "140px",
                            objectFit: "cover",
                            borderRadius: "14px",
                            display: "block",
                          }}
                        />
                      </div>
                    )}

                    <div
                      style={{
                        marginTop: "12px",
                      }}
                    >
                      <span className="status">
                        {statusLabel(
                          request.status
                        )}
                      </span>

                      {request.status === "PENDING" && (
                        <button
                          className="btn small"
                          style={{
                            marginLeft: "10px",
                            background: "#f3e3df",
                            color: "#8b4f45",
                          }}
                          onClick={() =>
                            cancelRequest(
                              request.id
                            )
                          }
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* OWNER REQUESTS MODAL */}
      {showOwnerRequests && (
        <div
          className="modal"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            overflowY: "auto",
            padding: "24px",
            boxSizing: "border-box",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            className="modal-card"
            style={{
              maxWidth: "760px",
              maxHeight: "calc(100vh - 48px)",
              overflowY: "auto",
              width: "100%",
              boxSizing: "border-box",
              margin: "auto",
            }}
          >
            <button
              className="close"
              onClick={() =>
                setShowOwnerRequests(false)
              }
            >
              ×
            </button>

            <p className="eyebrow">
              INCOMING REQUESTS
            </p>

            <h2>
              People requesting my items
            </h2>

            {ownerRequests.length === 0 ? (
              <div className="empty">
                No one has requested your
                exchange items yet.
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gap: "14px",
                }}
              >
                {ownerRequests.map((request) => (
                  <div
                    key={request.id}
                    style={{
                      background: "white",
                      padding: "20px",
                      borderRadius: "17px",
                    }}
                  >
                    <small>
                      {request.listing?.title ||
                        `Listing #${request.listing}`}
                    </small>

                    <h3
                      style={{
                        margin: "7px 0",
                      }}
                    >
                      {request.requester_name ||
                        "GreenNest member"}
                    </h3>

                    <p>
                      <strong>
                        Offering:
                      </strong>{" "}
                      {request.offered_item}
                    </p>

                    {request.message && (
                      <p>
                        <strong>
                          Message:
                        </strong>{" "}
                        {request.message}
                      </p>
                    )}

                    {request.image && (
                      <div
                        style={{
                          marginTop: "12px",
                        }}
                      >
                        <p
                          style={{
                            fontWeight: 600,
                            marginBottom: "8px",
                          }}
                        >
                          Offered item photo
                        </p>

                        <img
                          src={getImage(
                            request.image
                          )}
                          alt={request.offered_item}
                          style={{
                            width: "180px",
                            height: "140px",
                            objectFit: "cover",
                            borderRadius: "14px",
                          }}
                        />
                      </div>
                    )}

                    <div
                      style={{
                        marginTop: "12px",
                      }}
                    >
                      <span className="status">
                        {statusLabel(
                          request.status
                        )}
                      </span>
                    </div>

                    {request.status === "PENDING" && (
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          marginTop: "15px",
                          flexWrap: "wrap",
                        }}
                      >
                        <button
                          className="btn btn-green small"
                          onClick={() =>
                            updateRequest(
                              request.id,
                              "ACCEPTED"
                            )
                          }
                        >
                          Accept
                        </button>

                        <button
                          className="btn small"
                          style={{
                            background: "#f3e3df",
                            color: "#8b4f45",
                          }}
                          onClick={() =>
                            updateRequest(
                              request.id,
                              "REJECTED"
                            )
                          }
                        >
                          Reject
                        </button>
                      </div>
                    )}

                    {request.status === "ACCEPTED" && (
                      <button
                        className="btn btn-green small"
                        style={{
                          marginTop: "15px",
                        }}
                        onClick={() =>
                          updateRequest(
                            request.id,
                            "COMPLETED"
                          )
                        }
                      >
                        Mark completed
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
