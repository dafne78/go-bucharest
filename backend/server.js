// /backend/server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Încarcă variabilele de mediu
dotenv.config();

// Importă Firebase Admin SDK
const { db } = require('./config/firebase');


// Importă rutele
const authRoutes = require('./routes/authRoutes');
const locationZoneRoutes = require('./routes/locationZoneRoutes');
const tagRoutes = require('./routes/tagRoutes');
const eventCategoryRoutes = require('./routes/eventCategoryRoutes');
const eventRoutes = require('./routes/eventRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const imageRoutes = require('./routes/imageRoutes');
const userRoutes = require('./routes/userRoutes')


// Creează aplicația Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(morgan('dev'));

// Ruta de bază pentru a testa dacă serverul funcționează
app.get('/', (req, res) => {
  res.json({ message: 'API-ul funcționează!' });
});

// Ruta de test pentru a verifica conexiunea la Firebase
app.get('/test-firebase', async (req, res) => {
  try {
    // Încearcă să accesezi o colecție
    const snapshot = await db.collection('test').limit(1).get();
    res.json({ 
      success: true, 
      message: 'Conexiunea la Firebase funcționează!',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Eroare la conectarea cu Firebase:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Eroare la conectarea cu Firebase', 
      error: error.message 
    });
  }
});


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Folosește rutele
app.use('/api/auth', authRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/location-zones', locationZoneRoutes);
app.use('/api/event-categories', eventCategoryRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/image', imageRoutes);
app.use('/api/users', userRoutes)

// Gestionarea rutelor inexistente
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint-ul nu a fost găsit' });
});

// Gestionarea erorilor
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: err.message || 'Eroare de server',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

// Pornește serverul
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serverul rulează pe portul ${PORT} în modul ${process.env.NODE_ENV}`);
});