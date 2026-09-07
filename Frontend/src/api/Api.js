import axios from "axios"

// const baseURL = "https://backend-ecole-62xj.onrender.com/api/v1"
const baseURL = "http://localhost:5000/api/v1"
const token = window.localStorage.getItem("auth")
export const Axios = axios.create({baseURL})
export const AxiosToken = axios.create({baseURL,headers:{
    Authorization:`bearer ${token}` 
}})