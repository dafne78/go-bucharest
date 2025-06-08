import { Link, useNavigate } from "react-router-dom";
import Profile from "../../Components/Profile/Profile";
import "./ProfilePage.css";

export default function ProfilePage({ isLoggedIn, setisLoggedIn }) {
  const navigate = useNavigate();

  const handleSignOut = () => {
    // Clear any stored auth data
    localStorage.removeItem('user');
    // Update login state
    setisLoggedIn(false);
    // Redirect to home page
    navigate('/');
  };

  return (
    <div className="profile-page-container">
      {!isLoggedIn ? (
        <div className="login-message">
          <h2>Oops! Looks like you're not logged in.</h2>
          <p>Log in to see your profile, past events, and leave reviews for your experiences.</p>
          <div className="auth-options">
            <Link to="/signup" className="auth-button signup-button">
              Sign Up
            </Link>
            <Link to="/login" className="auth-button login-button">
              Log In
            </Link>
          </div>
        </div>
      ) : (
        <div className="profile-content">
          <Profile />
          <div className="sign-out-container">
            <button 
              onClick={handleSignOut}
              className="auth-button sign-out-button"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}