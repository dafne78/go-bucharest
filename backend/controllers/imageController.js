// /backend/controllers/imageController.js
const localImageModel = require('../models/imageModel');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configurare multer pentru procesarea fișierelor încărcate
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limită de 5MB
  },
  fileFilter: (req, file, cb) => {
    // Acceptă doar imagini
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Doar fișierele imagine sunt permise!'));
    }
  }
}).single('image'); // Numele câmpului din formular

/**
 * Sanitizează numele folderului/fișierului
 * @param {string} name - Numele original
 * @returns {string} - Numele sanitizat
 */
const sanitizeName = (name) => {
  if (!name) return '';
  // Elimină caracterele speciale și spațiile multiple
  return name.replace(/[^\w\s-]/g, '').trim();
};

/**
 * Obține informații despre fișier
 * @param {string} filePath - Calea fișierului
 * @returns {Object} - Informații despre fișier
 */
const getFileInfo = (filePath) => {
  const stats = fs.statSync(filePath);
  const extension = path.extname(filePath).toLowerCase();
  
  return {
    name: path.basename(filePath),
    size: stats.size,
    created: stats.birthtime,
    modified: stats.mtime,
    mimeType: localImageModel.getContentType(extension),
    path: filePath.replace(path.join(__dirname, '..'), '')
  };
};

/**
 * @desc    Listează toate folderele disponibile
 * @route   GET /api/image/folders
 * @access  Public
 */
const listFolders = async (req, res) => {
  try {
    const uploadsDir = path.join(__dirname, '../uploads');
    
    // Asigură-te că folderul uploads există
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      return res.json({
        success: true,
        data: []
      });
    }
    
    // Citește conținutul folderului și filtrează doar directoarele
    const contents = fs.readdirSync(uploadsDir, { withFileTypes: true });
    const folders = contents
      .filter(item => item.isDirectory())
      .map(folder => ({
        name: folder.name,
        path: `/uploads/${folder.name}`
      }));
    
    res.json({
      success: true,
      count: folders.length,
      data: folders
    });
  } catch (error) {
    console.error('Error listing folders:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la listarea folderelor',
      error: error.message
    });
  }
};

/**
 * @desc    Listează imaginile dintr-un folder
 * @route   GET /api/image/list/:folder
 * @access  Public
 */
const listImages = async (req, res) => {
  try {
    // Obține și sanitizează folderul (folosește 'general' ca default)
    const folder = sanitizeName(req.params.folder || 'general');
    const folderPath = path.join(__dirname, '../uploads', folder);
    
    // Verifică dacă folderul există
    if (!fs.existsSync(folderPath)) {
      return res.status(404).json({
        success: false,
        message: `Folderul '${folder}' nu există`
      });
    }
    
    // Citește fișierele din folder și filtrează doar imaginile
    const files = fs.readdirSync(folderPath);
    const imageFiles = files.filter(file => {
      const extension = path.extname(file).toLowerCase();
      return /\.(jpg|jpeg|png|gif|webp)$/i.test(extension);
    });
    
    // Obține informații despre fiecare imagine
    const images = imageFiles.map(file => {
      const filePath = path.join(folderPath, file);
      const fileInfo = getFileInfo(filePath);
      
      // Adaugă URL-ul pentru accesare directă
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      fileInfo.url = `${baseUrl}/uploads/${folder}/${file}`;
      
      return fileInfo;
    });
    
    res.json({
      success: true,
      count: images.length,
      folder: folder,
      data: images
    });
  } catch (error) {
    console.error('Error listing images:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la listarea imaginilor',
      error: error.message
    });
  }
};

/**
 * @desc    Obține informații despre o imagine specifică
 * @route   GET /api/image/info/:folder/:filename
 * @access  Public
 */
const getImageInfo = async (req, res) => {
  try {
    // Obține și sanitizează parametrii
    const folder = sanitizeName(req.params.folder || 'general');
    const filename = req.params.filename;
    
    // Construiește calea către fișier
    const filePath = path.join(__dirname, '../uploads', folder, filename);
    
    // Verifică dacă fișierul există
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Imaginea nu a fost găsită'
      });
    }
    
    // Obține informații despre fișier
    const fileInfo = getFileInfo(filePath);
    
    // Adaugă URL-ul pentru accesare directă
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    fileInfo.url = `${baseUrl}/uploads/${folder}/${filename}`;
    
    res.json({
      success: true,
      data: fileInfo
    });
  } catch (error) {
    console.error('Error getting image info:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la obținerea informațiilor despre imagine',
      error: error.message
    });
  }
};

/**
 * @desc    Obține o imagine specifică
 * @route   GET /api/image/:folder/:filename
 * @access  Public
 */
const getImage = async (req, res) => {
  try {
    // Obține și sanitizează parametrii
    const folder = sanitizeName(req.params.folder || 'general');
    const filename = req.params.filename;
    
    // Construiește calea către fișier
    const filePath = path.join(__dirname, '../uploads', folder, filename);
    
    // Verifică dacă fișierul există
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Imaginea nu a fost găsită'
      });
    }
    
    // Determină tipul de conținut
    const contentType = localImageModel.getContentType(path.extname(filename));
    res.set('Content-Type', contentType);
    
    // Trimite fișierul
    res.sendFile(filePath);
  } catch (error) {
    console.error('Error in getImage controller:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la obținerea imaginii',
      error: error.message
    });
  }
};

/**
 * @desc    Încarcă o imagine
 * @route   POST /api/image/:folder?
 * @access  Private
 */
const uploadImage = async (req, res) => {
  upload(req, res, async function(err) {
    if (err instanceof multer.MulterError) {
      // Eroare multer (ex: limită de dimensiune depășită)
      return res.status(400).json({
        success: false,
        message: `Eroare la încărcare: ${err.message}`
      });
    } else if (err) {
      // Alte erori (ex: tip de fișier nepermis)
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    
    // Verifică dacă un fișier a fost încărcat
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Niciun fișier încărcat'
      });
    }
    
    try {
      // Determină și sanitizează folderul de încărcare
      let folder = "general";
      if (req.params && req.params.folder) {
        folder = sanitizeName(req.params.folder);
      }
      
      console.log("Uploading to folder:", folder);
      
      // Încarcă imaginea local
      const imagePath = await localImageModel.uploadImage(
        req.file.buffer,
        req.file.originalname,
        folder
      );
      
      // URL-ul complet pentru accesare
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const imageUrl = `${baseUrl}${imagePath}`;
      
      res.status(201).json({
        success: true,
        message: 'Imagine încărcată cu succes',
        data: {
          url: imageUrl,
          path: imagePath,
          fileName: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype
        }
      });
    } catch (error) {
      console.error('Error in uploadImage controller:', error);
      res.status(500).json({
        success: false,
        message: 'Eroare la încărcarea imaginii',
        error: error.message
      });
    }
  });
};

/**
 * @desc    Șterge o imagine
 * @route   DELETE /api/image
 * @access  Private
 */
const deleteImage = async (req, res) => {
  try {
    const { imagePath } = req.body;
    
    if (!imagePath) {
      return res.status(400).json({
        success: false,
        message: 'Calea imaginii este obligatorie'
      });
    }
    
    await localImageModel.deleteImage(imagePath);
    
    res.json({
      success: true,
      message: 'Imagine ștearsă cu succes'
    });
  } catch (error) {
    console.error('Error in deleteImage controller:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la ștergerea imaginii',
      error: error.message
    });
  }
};

module.exports = {
  listFolders,
  listImages,
  getImageInfo,
  getImage,
  uploadImage,
  deleteImage
};