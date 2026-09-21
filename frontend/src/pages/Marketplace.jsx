import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { getImage } from "../api/features";
import { productImage } from "../api/defaultImages";

const cats = [
  "All",
  "Vegetables",
  "Fruits",
  "Herbs",
  "Seeds",
  "Plants",
  "Gardening Materials",
  "Garden Kits",
];

export default function Marketplace() {
  const [items, setItems] = useState([]);
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");
  const [msg, setMsg] = useState("");

  async function load() {
    try {
      const response = await api.get(
        "/marketplace/products/",
        {
          params: {
            ...(cat !== "All" && {
              category: cat,
            }),
            ...(q && {
              search: q,
            }),
          },
        }
      );

      setItems(
        response.data.results || response.data
      );
    } catch (error) {
      console.error(
        "Could not load marketplace:",
        error
      );
    }
  }

  useEffect(() => {
    load();
  }, [cat]);

  async function add(id) {
    try {
      await api.post(
        "/cart/items/",
        {
          product: id,
          quantity: 1,
        }
      );

      setMsg(
        "Added to your garden basket."
      );

      setTimeout(() => {
        setMsg("");
      }, 1800);
    } catch (error) {
      setMsg(
        error.response?.data?.detail ||
          "Could not add this item."
      );
    }
  }

  return (
    <div className="page">

      <div className="market-hero">

        <div>
          <p className="eyebrow">
            GREENNEST MARKETPLACE
          </p>

          <h1>
            Fresh from{" "}
            <em>local gardens.</em>
          </h1>

          <p>
            Home-grown produce, seeds, plants
            and gardening essentials shared
            by growers.
          </p>
        </div>

        <div className="search">

          <input
            placeholder="Search the garden…"
            value={q}
            onChange={(e) =>
              setQ(e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                load();
              }
            }}
          />

          <button onClick={load}>
            Search
          </button>

        </div>

      </div>

      {msg && (
        <div className="toast">
          {msg}
        </div>
      )}

      <div className="filters">

        {cats.map((category) => (
          <button
            key={category}
            className={
              cat === category
                ? "active"
                : ""
            }
            onClick={() =>
              setCat(category)
            }
          >
            {category}
          </button>
        ))}

      </div>

      <div className="product-grid">

        {items.map((product) => {

          const available =
            Number(product.quantity) > 0;

          return (
            <article
              className="product-card"
              key={product.id}
            >

              <Link
                to={`/marketplace/products/${product.id}`}
              >
                <img
                  src={
                    product.image
                      ? getImage(product.image)
                      : productImage(
                          product.category
                        )
                  }
                  alt={product.name}
                />
              </Link>

              <div>

                <small>
                  {product.category}
                </small>

                <h3>
                  {product.name}
                </h3>

                <p>
                  by {product.seller_name} ·{" "}
                  {product.location || "Local"}
                </p>

                <strong>
                  ₹{product.price}{" "}
                  <small>
                    / {product.unit}
                  </small>
                </strong>

                <p>
                  {available
                    ? `${product.quantity} ${product.unit} available`
                    : "Sold out"}
                </p>

                <button
                  className="btn btn-green small"
                  disabled={!available}
                  onClick={() =>
                    add(product.id)
                  }
                >
                  {available
                    ? "Add to basket"
                    : "Sold out"}
                </button>

              </div>

            </article>
          );
        })}

      </div>

    </div>
  );
}