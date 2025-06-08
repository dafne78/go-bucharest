import { useNavigate } from "react-router-dom";
import Profile from "../../Components/Profile/Profile";
import "./ProfilePage.css";

export default function ProfilePage({ isLoggedIn, setisLoggedIn }) {
  const navigate = useNavigate();

  if (!isLoggedIn) {
    navigate('/login');
    console.log(isLoggedIn);
    return null;
  }

  return (
    <div className="profile-page-container">
      <div className="profile-content">
        <Profile />
      </div>
    </div>
  );
}