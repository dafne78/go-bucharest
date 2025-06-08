import apiService from './apiService';


const UPLOAD_BASE_URL = 'http://localhost:5000/api/image/add';

const imageService = {
  upload: (file = 'events') => {
    console.log()
    return apiService.uploadImage(`${UPLOAD_BASE_URL}`, file);
  }
};

export default imageService;