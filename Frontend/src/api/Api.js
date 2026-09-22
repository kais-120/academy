import axios from "axios";

// const baseURL = "https://backend-ecole-62xj.onrender.com/api/v1";
const baseURL = "http://localhost:5000/api/v1"


export const Axios = axios.create({
    baseURL,
});

export const AxiosToken = axios.create({
    baseURL,
});

AxiosToken.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("auth");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        } else {
            delete config.headers.Authorization;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);