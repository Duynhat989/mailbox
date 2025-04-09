import axios from 'axios';
import CryptoJS from 'crypto-js'; // Hãy đảm bảo cài đặt thư viện này: npm install crypto-js

// Khóa mã hóa - bạn nên lưu khóa này ở file .env
const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'your-secret-key';

const request = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 120000,
    headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
    },
});
request.interceptors.request.use(config => {
    // Lấy token từ localStorage
    const user = JSON.parse(localStorage.getItem('user')) || null;
    if (user) {
        config.headers.Authorization = `Bearer ${user?.data?.token}`;
    }
    return config;
}, error => Promise.reject(error));

// // Hàm mã hóa data
// const encryptData = (data) => {
//     if (!data) return data;

//     // Chuyển đổi object thành chuỗi JSON
//     const jsonString = JSON.stringify(data);

//     // Mã hóa bằng AES
//     return CryptoJS.AES.encrypt(jsonString, ENCRYPTION_KEY).toString();
// };

// // Hàm giải mã data
// const decryptData = (encryptedData) => {
//     if (!encryptedData) return encryptedData;

//     // Giải mã chuỗi
//     const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);

//     // Chuyển đổi về chuỗi gốc
//     return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
// };

// // Interceptor cho request
// request.interceptors.request.use(config => {
//     // Lấy token từ localStorage
//     const token = localStorage.getItem('ainow_token');
//     if (token) {
//         config.headers.Authorization = `Bearer ${token}`;
//     }

//     // Mã hóa body của request nếu có
//     console.log('Request data before encryption:', config.data);
//     if (config.data) {
//         // Đánh dấu là dữ liệu đã được mã hóa
//         config.headers['X-Encrypted'] = 'true';

//         // Mã hóa dữ liệu
//         config.data = {
//             e: encryptData(config.data)
//         };
//     }

//     return config;
// }, error => Promise.reject(error));

// // Interceptor cho response
// request.interceptors.response.use(
//     response => {
//         // Kiểm tra xem response có chứa dữ liệu mã hóa hay không
//         if (response.headers && response.headers['x-encrypted'] === 'true' && response.data && response.data.r) {
//             let temp = decryptData(response.data.r)
//             // Kiểm tra xem dữ liệu đã được giải mã hay chưa
//             console.log('Decrypted response data:', temp);
//             return temp;
//         }
//         return response.data;
//     },
//     error => {
//         console.error('Error in response:', error);
//         let response = decryptData(error.response.data.r)
//         if (error.response?.status === 401) {
//             localStorage.removeItem('ainow_user');
//             localStorage.removeItem('ainow_token');
//         }
//         return Promise.reject(response);
//     }
// );

export default request;