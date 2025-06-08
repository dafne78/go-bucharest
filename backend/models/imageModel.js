// /backend/models/localImageModel.js
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Asigură-te că folderul uploads există
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * Încarcă o imagine local
 * @param {Buffer} fileBuffer - Buffer-ul fișierului
 * @param {string} originalFileName - Numele original al fișierului
 * @param {string} folder - Folderul în care se va salva imaginea
 * @returns {Promise<string>} - Calea către imagine
 */
const uploadImage = async (fileBuffer, originalFileName, folder = 'general') => {
  try {
    // Creează folderul dacă nu există
    const folderPath = path.join(uploadsDir, folder);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
    
    // Generează un nume unic pentru fișier
    const fileExtension = path.extname(originalFileName);
    const fileName = `${uuidv4()}${fileExtension}`;
    const filePath = path.join(folderPath, fileName);
    
    // Scrie fișierul
    fs.writeFileSync(filePath, fileBuffer);
    
    // Returnează calea relativă (pentru a fi servită de Express)
    return `/uploads/${folder}/${fileName}`;
  } catch (error) {
    console.error('Error uploading image locally:', error);
    throw error;
  }
};

/**
 * Șterge o imagine locală
 * @param {string} imagePath - Calea către imagine
 * @returns {Promise<void>}
 */
const deleteImage = async (imagePath) => {
  try {
    // Verifică dacă calea începe cu /uploads
    if (!imagePath || !imagePath.startsWith('/uploads')) {
      console.warn('Invalid image path format:', imagePath);
      return;
    }
    
    // Extrage calea fișierului
    const filePath = path.join(__dirname, '..', imagePath);
    
    // Verifică dacă fișierul există
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Image deleted: ${filePath}`);
    } else {
      console.warn(`Image not found for deletion: ${filePath}`);
    }
  } catch (error) {
    console.error('Error deleting local image:', error);
    throw error;
  }
};

/**
 * Determină tipul de conținut bazat pe extensia fișierului
 * @param {string} extension - Extensia fișierului (inclusiv punctul)
 * @returns {string} - Tipul de conținut MIME
 */
const getContentType = (extension) => {
  switch (extension.toLowerCase()) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.gif':
      return 'image/gif';
    case '.webp':
      return 'image/webp';
    case '.svg':
      return 'image/svg+xml';
    default:
      return 'application/octet-stream';
  }
};

module.exports = {
  uploadImage,
  deleteImage,
  getContentType
};