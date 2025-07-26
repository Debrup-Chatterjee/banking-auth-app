// src/utils/api.js

import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

export const getLoginLogs = async (email) => {
  const res = await axios.get(`${API_BASE}/logins/${email}`);
  return res.data;
};
