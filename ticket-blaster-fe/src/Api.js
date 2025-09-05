import axios from 'axios';

export default function Api() {
    return axios.create({
        baseURL: import.meta.env.VITE_REACT_APP_BACKEND_API,
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
        },
    });
};

