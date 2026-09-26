import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { DEFAULT_IMAGES } from "../api/defaultImages";

const imgs = {
  hero: DEFAULT_IMAGES.hero,
  garden: DEFAULT_IMAGES.garden,
  harvest: DEFAULT_IMAGES.harvest,
  people: DEFAULT_IMAGES.community,
};

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home">

      {/* =========================
          HERO
      ========================= */}
      <section className="home-hero">

        <img
          src={imgs.hero}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = imgs.garden;
          }}
          alt="GreenNest garden"
        />

        <div className="hero-overlay">

          <p>GREENNEST · GROWING TOGETHER</p>

          <h1>
            Grow your own
            <br />
            <em>green world.</em>
          </h1>

          <span>
            From terrace gardens to fresh harvests — a place to grow,
            share, exchange and learn.
          </span>

          <div className="hero-actions">

            <Link
              className="btn btn-light"
              to={isAuthenticated ? "/community" : "/register"}
            >
              {isAuthenticated
                ? "Explore the community"
                : "Join GreenNest"}
            </Link>

            <Link
              className="hero-text-link"
              to="/marketplace"
            >
              Explore local harvests →
            </Link>

          </div>

        </div>
      </section>


      {/* =========================
          INTRO
      ========================= */}
      <section className="intro">

        <p className="eyebrow">
          A garden is better shared
        </p>

        <h2>
          Everything your little garden needs to{" "}
          <em>thrive.</em>
        </h2>

        <p>
          Meet home growers, share what you are learning,
          discover fresh produce, exchange seeds and learn
          from experienced gardeners.
        </p>

      </section>


      {/* =========================
          FEATURES
      ========================= */}
      <section className="feature-grid">

        <Link
          to="/community"
          className="feature-card"
        >
          <img
            src={imgs.people}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = imgs.garden;
            }}
            alt="Community members planting together"
          />

          <div>
            <small>01 · COMMUNITY</small>

            <h3>
              Show what you're growing.
            </h3>

            <span>
              Share your terrace journey, ask questions
              and inspire other growers.
            </span>
          </div>
        </Link>


        <Link
          to="/marketplace"
          className="feature-card tall"
        >
          <img
            src={imgs.harvest}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = imgs.garden;
            }}
            alt="Fresh garden harvest"
          />

          <div>
            <small>02 · MARKETPLACE</small>

            <h3>
              Fresh from local gardens.
            </h3>

            <span>
              Find home-grown vegetables, seeds, plants
              and garden essentials.
            </span>
          </div>
        </Link>


        <Link
          to="/classes"
          className="feature-card"
        >
          <img
            src={imgs.garden}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = imgs.hero;
            }}
            alt="Gardener tending a vegetable garden"
          />

          <div>
            <small>03 · LEARN</small>

            <h3>
              Learn from people who grow.
            </h3>

            <span>
              Join practical gardening classes led by
              experienced experts.
            </span>
          </div>
        </Link>

      </section>


      {/* =========================
          GREENNEST CYCLE
      ========================= */}
      <section className="steps">

        <div className="steps-heading">

          <small>
            THE GREENNEST CYCLE
          </small>

          <h2>
            Seed → Grow → Share → Harvest
          </h2>

        </div>


        <div className="step-list">

          <div className="step-item">
            <b>01</b>

            <h3>
              Plant
            </h3>

            <p>
              Start with a seed, pot or small terrace bed.
            </p>
          </div>


          <div className="step-item">
            <b>02</b>

            <h3>
              Grow
            </h3>

            <p>
              Learn and improve with your community.
            </p>
          </div>


          <div className="step-item">
            <b>03</b>

            <h3>
              Share
            </h3>

            <p>
              Exchange knowledge, plants and materials.
            </p>
          </div>


          <div className="step-item">
            <b>04</b>

            <h3>
              Harvest
            </h3>

            <p>
              Enjoy or sell what your garden gives back.
            </p>
          </div>

        </div>

      </section>


      {/* =========================
          FINAL CTA
      ========================= */}
      <section className="cta-band">

        <p className="eyebrow">
          YOUR GARDEN. YOUR COMMUNITY.
        </p>

        <h2>
          There's a gardener waiting to
          <br />
          <em>grow with you.</em>
        </h2>

        <Link
          className="btn btn-copper"
          to={isAuthenticated ? "/community" : "/register"}
        >
          Start growing →
        </Link>

      </section>

    </div>
  );
}