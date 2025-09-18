// // src/api/config.js

// import axios from "axios";


// const API_URL = process.env.REACT_APP_API_URL;
// console.log(API_URL)

// axios.get(`${process.env.REACT_APP_API_URL}/products`)
//   .then(res => console.log(res.data))
//   .catch(err => console.error(err));

// export default API_URL;
// src/api/config.js
// src/api/config.js
// config.js
// config.js
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "ngrok-skip-browser-warning": "true",
    Accept: "application/json",
  },
});

// Xuất ra cả 2
export { API_URL, api };
