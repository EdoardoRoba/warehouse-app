import axios from "axios"

export const axiosInstance = axios.create({
    // baseURL: "https://my-warehouse-app-heroku.herokuapp.com/api/"
    // baseURL: "http://localhost:8050/api/"
    baseURL: ""
})

export const beUrl = "https://my-warehouse-app-heroku.herokuapp.com/api/"