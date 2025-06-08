import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/common/Sidebar/Sidebar';
import DashboardPage from './pages/DashboardPage/DashboardPage';
import UserPage from './pages/UsersPage/UserPage';
import EventsPage from './pages/EventsPage/EventsPage';
import LoginPage from './pages/LoginPage/LoginPage';
import PrivateRoute from './components/common/PrivateRoute/PrivateRoute';
import './App.css';

// Importarea stilurilor globale
import './styles/variables.css';
import './styles/global.css';
import TagsPage from './pages/TagsPage/TagsPage';
import CategoryPage from './pages/CategoryPage/CategoryPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta de autentificare */}
        <Route path="/admin/login" element={<LoginPage />} />
        
        {/* Rute protejate */}
        <Route path="/admin" element={
          <PrivateRoute>
            <div className="admin-app">
              <Sidebar />
              <main className="content">
                <DashboardPage />
              </main>
            </div>
          </PrivateRoute>
        } />
        
        <Route path="/users" element={
          <PrivateRoute>
            <div className="admin-app">
              <Sidebar />
              <main className="content">
                <UserPage />
              </main>
            </div>
          </PrivateRoute>
        } />
        
        <Route path="/events" element={
          <PrivateRoute>
            <div className="admin-app">
              <Sidebar />
              <main className="content">
                <EventsPage />
              </main>
            </div>
          </PrivateRoute>
        } />
        
        <Route path="/tags" element={
          <PrivateRoute>
            <div className="admin-app">
              <Sidebar />
              <main className="content">
                <TagsPage />
              </main>
            </div>
          </PrivateRoute>
        } />
        
        <Route path="/categories" element={
          <PrivateRoute>
            <div className="admin-app">
              <Sidebar />
              <main className="content">
                <CategoryPage />
              </main>
            </div>
          </PrivateRoute>
        } />        
        {/* Redirecționare implicită */}
        <Route path="/" element={<Navigate to="/admin" replace />} />
      </Routes>
    </Router>
  );
}

export default App;