import {Link} from "react-router-dom";
import {useAuth} from "../context/AuthContext";
import {DEFAULT_IMAGES} from "../api/defaultImages";
const imgs={
 hero:DEFAULT_IMAGES.hero,
 garden:DEFAULT_IMAGES.garden,
 harvest:DEFAULT_IMAGES.harvest,
 people:DEFAULT_IMAGES.community};
export default function Home(){const {isAuthenticated}=useAuth();return <div className="home">
 <section className="home-hero"><img src={imgs.hero} onError={(e)=>{e.currentTarget.onerror=null;e.currentTarget.src=imgs.garden;}} alt="GreenNest garden"/><div className="hero-overlay"><p>GREENNEST · GROWING TOGETHER</p><h1>Grow your own<br/><i>green world.</i></h1><span>From terrace gardens to fresh harvests — a place to grow, share, exchange and learn.</span><div><Link className="btn btn-light" to={isAuthenticated?"/community":"/register"}>{isAuthenticated?"Explore the community":"Join GreenNest"}</Link><Link className="text-link" to="/marketplace">Shop local harvests →</Link></div></div></section>
 <section className="intro"><p className="eyebrow">A garden is better shared</p><h2>Everything your little garden needs to <em>thrive.</em></h2><p>Meet home growers, share what you are learning, discover fresh produce, exchange seeds and learn from experienced gardeners.</p></section>
 <section className="feature-grid">
  <Link to="/community" className="feature-card"><img src={imgs.people} onError={(e)=>{e.currentTarget.onerror=null;e.currentTarget.src=imgs.garden;}} alt="Community members planting together"/><div><small>01 · COMMUNITY</small><h3>Show what you're growing.</h3><span>Share your terrace journey, ask questions and inspire other growers.</span></div></Link>
  <Link to="/marketplace" className="feature-card tall"><img src={imgs.harvest} onError={(e)=>{e.currentTarget.onerror=null;e.currentTarget.src=imgs.garden;}} alt="Fresh harvest"/><div><small>02 · MARKETPLACE</small><h3>Fresh from local gardens.</h3><span>Find home-grown vegetables, seeds, plants and garden essentials.</span></div></Link>
  <Link to="/classes" className="feature-card"><img src={imgs.garden} onError={(e)=>{e.currentTarget.onerror=null;e.currentTarget.src=imgs.hero;}} alt="Gardener tending vegetable garden"/><div><small>03 · LEARN</small><h3>Learn from people who grow.</h3><span>Join practical gardening classes led by experienced experts.</span></div></Link>
 </section>
 <section className="steps"><div><small>THE GREENNEST CYCLE</small><h2>Seed → Grow → Share → Harvest</h2></div><div className="step-list"><div><b>01</b><h3>Plant</h3><p>Start with a seed, pot or small terrace bed.</p></div><div><b>02</b><h3>Grow</h3><p>Learn and improve with your community.</p></div><div><b>03</b><h3>Share</h3><p>Exchange knowledge, plants and materials.</p></div><div><b>04</b><h3>Harvest</h3><p>Enjoy or sell what your garden gives back.</p></div></div></section>
 <section className="cta-band"><h2>There’s a gardener waiting to<br/><em>grow with you.</em></h2><Link className="btn btn-green" to={isAuthenticated?"/community":"/register"}>Start growing →</Link></section>
 </div>}
