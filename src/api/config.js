// src/api/config.js

import axios from "axios";


const API_URL = process.env.REACT_APP_API_URL;


axios.get(`${process.env.REACT_APP_API_URL}/products`)
  .then(res => console.log(res.data))
  .catch(err => console.error(err));

export default API_URL;
