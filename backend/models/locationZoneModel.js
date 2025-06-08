// /backend/models/locationZoneModel.js (actualizat cu funcții pentru nume)
const { db } = require('../config/firebase');

const zonesCollection = 'location_zones';

/**
 * Creează o nouă zonă de locație
 * @param {Object} zoneData - Datele zonei
 * @returns {Promise<string>} - ID-ul zonei create
 */
const createLocationZone = async (zoneData) => {
  try {
    const docRef = await db.collection(zonesCollection).add({
      name: zoneData.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating location zone:', error);
    throw error;
  }
};

/**
 * Obține toate zonele de locație
 * @returns {Promise<Array>} - Lista de zone
 */
const getAllLocationZones = async () => {
  try {
    const snapshot = await db.collection(zonesCollection).get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting all location zones:', error);
    throw error;
  }
};

/**
 * Obține o zonă de locație după ID
 * @param {string} zoneId - ID-ul zonei
 * @returns {Promise<Object|null>} - Datele zonei sau null
 */
const getLocationZoneById = async (zoneId) => {
  try {
    const zoneDoc = await db.collection(zonesCollection).doc(zoneId).get();

    if (!zoneDoc.exists) {
      return null;
    }

    return {
      id: zoneDoc.id,
      ...zoneDoc.data()
    };
  } catch (error) {
    console.error('Error getting location zone by ID:', error);
    throw error;
  }
};

/**
 * Obține o zonă de locație după nume
 * @param {string} zoneName - Numele zonei
 * @returns {Promise<Object|null>} - Datele zonei sau null
 */
const getLocationZoneByName = async (zoneName) => {
  try {
    // Folosim o interogare cu filtru pentru a găsi zona după nume
    const snapshot = await db.collection(zonesCollection)
      .where('name', '==', zoneName)
      .limit(1)
      .get();
    
    if (snapshot.empty) {
      return null;
    }
    
    // Returnează primul document găsit
    const zoneDoc = snapshot.docs[0];
    return {
      id: zoneDoc.id,
      ...zoneDoc.data()
    };
  } catch (error) {
    console.error('Error getting location zone by name:', error);
    throw error;
  }
};

/**
 * Obține sau creează o zonă de locație după nume
 * @param {string} zoneName - Numele zonei
 * @returns {Promise<Object>} - Datele zonei
 */
const getOrCreateLocationZoneByName = async (zoneName) => {
  try {
    // Încearcă să găsească zona după nume
    const existingZone = await getLocationZoneByName(zoneName);
    
    // Dacă zona există, o returnează
    if (existingZone) {
      return existingZone;
    }
    
    // Dacă zona nu există, o creează
    console.log(`Location zone '${zoneName}' not found, creating it...`);
    const zoneId = await createLocationZone({ name: zoneName });
    
    // Returnează zona nou creată
    return {
      id: zoneId,
      name: zoneName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error getting or creating location zone by name:', error);
    throw error;
  }
};

/**
 * Actualizează o zonă de locație
 * @param {string} zoneId - ID-ul zonei
 * @param {Object} updateData - Datele care trebuie actualizate
 * @returns {Promise<void>}
 */
const updateLocationZone = async (zoneId, updateData) => {
  try {
    await db.collection(zonesCollection).doc(zoneId).update({
      ...updateData,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating location zone:', error);
    throw error;
  }
};

/**
 * Șterge o zonă de locație
 * @param {string} zoneId - ID-ul zonei
 * @returns {Promise<void>}
 */
const deleteLocationZone = async (zoneId) => {
  try {
    await db.collection(zonesCollection).doc(zoneId).delete();
  } catch (error) {
    console.error('Error deleting location zone:', error);
    throw error;
  }
};

module.exports = {
  createLocationZone,
  getAllLocationZones,
  getLocationZoneById,
  getLocationZoneByName,
  getOrCreateLocationZoneByName,
  updateLocationZone,
  deleteLocationZone
};