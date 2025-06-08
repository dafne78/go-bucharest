import Navbar from "./Components/Navbar/Navbar";
import { Route, Routes, useLocation  } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext';
import Home from './Pages/HomePage/HomePage.js'
import EventsPage from "./Pages/EventsPage/EventsPage.js";
import AboutPage from './Pages/AboutPage/AboutPage.js';
import ReviewPage from './Pages/ReviewPage/ReviewPage.js';
import ContactPage from './Pages/ContactPage/ContactPage.js';
import ProfilePage from './Pages/ProfilePage/ProfilePage.js';
import Footer from './Components/Footer/Footer';
import LoginPage from './Pages/LoginPage/LoginPage.js';
import EventDetails from "./Pages/EventDetailsPage/EventDetailsPage.js";
import { useState } from "react";
import './App.css'; // Make sure to create this file
import { useEffect } from 'react';
import SignupPage from "./Pages/SignupPage/SignupPage.js";

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // Scroll to top if path changes
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    // Scroll to element if hash exists
    if (hash) {
      const element = document.getElementById(hash.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [hash]);

  return null;
};

const App = () => {
  const [isLoggedIn, setisLoggedIn] = useState(false);

  return (
    <div className="app-container">
      <Navbar isLoggedIn={isLoggedIn} setisLoggedIn={setisLoggedIn} />
      <div className="content-wrap">
        <ScrollToTop />
        <AuthProvider>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/about' element={<AboutPage />} />
            <Route path='/events' element={<EventsPage />} />
            <Route path='/review' element={<ReviewPage isLoggedIn={isLoggedIn} />} />
            <Route path='/contact' element={<ContactPage />} />
            <Route path='/profile' element={<ProfilePage isLoggedIn={isLoggedIn} setisLoggedIn={setisLoggedIn}/>} />
            <Route path="/events/:id" element={<EventDetails />} />
            <Route path="/login" element={<LoginPage setisLoggedIn={setisLoggedIn}/>} />
            <Route path="/signup" element={<SignupPage />} />
          </Routes>
        </AuthProvider>
      </div>
      <Footer />
    </div>
  )
}

export default App;