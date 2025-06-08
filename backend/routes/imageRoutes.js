// /backend/routes/imageRoutes.js
// /backend/routes/imageRoutes.js
const express = require('express');
const router = express.Router();
const imageController = require('../controllers/imageController');
const { protect } = require('../middleware/authMiddleware');

// Rute publice pentru obținerea imaginilor
router.get('/list/:folder', imageController.listImages); // Listeză imaginile dintr-un folder
router.get('/info/:folder/:filename', imageController.getImageInfo); // Obține metadate despre o imagine
router.get('/:folder/:filename', imageController.getImage); // Obține imaginea propriu-zisă
router.get('/folders', imageController.listFolders); // Listează toate folderele disponibile

router.post('/add/:folder', protect, imageController.uploadImage);
// Rută pentru folder implicit (general)
router.post('/add', protect, imageController.uploadImage);
router.delete('/delete/:id', protect, imageController.deleteImage);

module.exports = router;