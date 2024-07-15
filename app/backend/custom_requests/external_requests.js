const axios = require('axios');

const handleAxiosError = (error) => {
  if (error.response) {
    console.error('Error response data:', error.response.data);
    console.error('Error response status:', error.response.status);
    console.error('Error response headers:', error.response.headers);
  } else if (error.request) {
    console.error('Error request:', error.request);
  } else {
    console.error('Error message:', error.message);
  }
  console.error('Error config:', error.config);
};

const sendExternalRequestGet = async (url, data, headers = {}) => {
  try {
    const response = await axios.get(url, {
      params: data,
      headers: headers
    });
    return response.data;
  } catch (error) {
    handleAxiosError(error);
    throw error;
  }
};

const sendExternalRequestPost = async (url, data, headers = {}) => {
  try {
    const response = await axios.post(url, data, {
      headers: headers
    });
    return response.data;
  } catch (error) {
    handleAxiosError(error);
    throw error;
  }
};

const sendExternalRequestPut = async (url, data, headers = {}) => {
  try {
    const response = await axios.put(url, data, {
      headers: headers
    });
    return response.data;
  } catch (error) {
    handleAxiosError(error);
    throw error;
  }
};

const sendExternalRequestDelete = async (url, data, headers = {}) => {
  try {
    const response = await axios.delete(url, {
      headers: headers,
      data: data
    });
    return response.data;
  } catch (error) {
    handleAxiosError(error);
    throw error;
  }
};

module.exports = { sendExternalRequestGet, sendExternalRequestPost, sendExternalRequestPut, sendExternalRequestDelete };