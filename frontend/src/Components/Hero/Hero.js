import { Link } from 'react-router-dom';
import hero_img from '../../assets/hero-background.jpeg';
import "./Hero.css";

function Hero() {
    return (
        <section className="hero">
            <div className="hero-image-container">
                <img 
                    alt="Bucharest Parliament Palace" 
                    src={hero_img}
                    className="hero-image"
                />
                <div className="image-overlay"></div>
            </div>
            <div className="hero-content">
                <h1 className="hero-title">Live the City, Not Just Visit It</h1>
                <Link to="/events" className="hero-button">
                    Plan Your Journey
                </Link>
            </div>
        </section>
    );
}
 
export default Hero;