import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Profile from "../../Components/Profile/Profile";
import "./ProfilePage.css";
import authService from "../../services/authService";

const ProfilePage = ({ isLoggedIn, setisLoggedIn }) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication on component mount and when isLoggedIn changes
    if (!authService.isAuthenticated() || !isLoggedIn) {
      authService.logout(); // Clear any stale auth data
      setisLoggedIn(false);
    navigate('/login');
    }
  }, [isLoggedIn, navigate, setisLoggedIn]);

  // If not authenticated, don't render the profile
  if (!authService.isAuthenticated() || !isLoggedIn) {
    return null;
  }

  return (
    <div className="profile-page-container">
      <div className="profile-content">
        <Profile />
      </div>
    </div>
  );
};

export default ProfilePage;