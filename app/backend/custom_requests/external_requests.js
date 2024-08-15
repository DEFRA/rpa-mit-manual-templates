const axios = require('axios');

const handleAxiosError = (error) => {};

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