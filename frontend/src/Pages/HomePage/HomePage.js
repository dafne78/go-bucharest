import Hero from "../../Components/Hero/Hero";
import DisplayEvents from "../../Components/DisplayEvents/DisplayEvents";
import './Home.css';

const HomePage = () => {
    return (
        <div className="home-container">
            <Hero/>
            <div className="home-section">
                <DisplayEvents />
            </div>
            {/* Add more sections as needed */}
        </div>
    );
}

export default HomePage;