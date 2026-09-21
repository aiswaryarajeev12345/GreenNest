import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import api from "../api/axios";

import { getImage } from "../api/features";

import { productImage } from "../api/defaultImages";


export default function ProductDetail() {

  const { id } = useParams();

  const [product, setProduct] =
    useState(null);

  const [qty, setQty] =
    useState(1);

  const [msg, setMsg] =
    useState("");

  useEffect(() => {

    api
      .get(
        `/marketplace/products/${id}/`
      )
      .then((response) => {
        setProduct(response.data);
      })
      .catch((error) => {
        console.error(
          "Could not load product:",
          error
        );
      });

  }, [id]);


  if (!product) {
    return (
      <div className="page-center">
        Loading product…
      </div>
    );
  }


  const available =
    Number(product.quantity) > 0;


  async function add() {

    if (!available) {
      setMsg(
        "This product is sold out."
      );

      return;
    }

    try {

      await api.post(
        "/cart/items/",
        {
          product: product.id,
          quantity: qty,
        }
      );

      setMsg(
        "Added to your garden basket."
      );

    } catch (error) {

      setMsg(
        error.response?.data?.detail ||
          "Could not add to basket."
      );

    }
  }


  return (

    <div className="detail-page">

      <Link
        className="back"
        to="/marketplace"
      >
        ← Marketplace
      </Link>


      <div className="product-detail">

        <div>

          <img
            className="detail-image"
            src={
              product.image
                ? getImage(product.image)
                : productImage(
                    product.category
                  )
            }
            alt={product.name}
          />

        </div>


        <div>

          <small>
            {product.category}
          </small>

          <h1>
            {product.name}
          </h1>


          <div className="price">

            ₹{product.price}

            <span>
              / {product.unit}
            </span>

          </div>


          <p>
            Grown/supplied by{" "}
            <b>
              {product.seller_name}
            </b>{" "}
            ·{" "}
            {product.location ||
              "Local garden"}
          </p>


          <p className="story-text">
            {product.description}
          </p>


          <p>

            {available
              ? `${product.quantity} ${product.unit} available`
              : "Sold out"}

          </p>


          {available && (

            <div className="qty">

              <button
                onClick={() =>
                  setQty(
                    Math.max(
                      1,
                      qty - 1
                    )
                  )
                }
              >
                −
              </button>

              <b>
                {qty}
              </b>

              <button
                onClick={() =>
                  setQty(
                    Math.min(
                      Number(product.quantity),
                      qty + 1
                    )
                  )
                }
              >
                +
              </button>

            </div>

          )}


          {msg && (

            <div className="success">
              {msg}
            </div>

          )}


          <button
            className="btn btn-green"
            onClick={add}
            disabled={!available}
          >
            {available
              ? "Add to garden basket"
              : "Sold out"}
          </button>

        </div>

      </div>

    </div>

  );
}