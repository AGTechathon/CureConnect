import axios from 'axios';

const instance = axios.create({
    baseURL: 'http://localhost:5001/api/v1',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Forwarded-Proto': 'https'
    },
    withCredentials: true
});

export default instance;