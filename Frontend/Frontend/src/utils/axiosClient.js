// axiosClient.js
import axios from 'axios';

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://dsa-mentor-1-q84w.onrender.com',
    withCredentials: true, // MOST IMPORTANT - cookies automatically bhejega
    headers: {
        'Content-Type': 'application/json'
    }
});

// Token interceptor HATA DO - cookies automatically jayengi
// axiosClient.interceptors.request.use() - YE REMOVE KARO

export default axiosClient;