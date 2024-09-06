const axios = require('axios')
const { getGlobal } = require('../hooks/customHooks')
const constantModel = require('../app_constants/appConstant')

const handleAxiosError = (error) => {
  console.error('Axios error:', error.response.data)
}

const addTokenHeader = (url, headers) => {
  if (getGlobal('request') && getGlobal('request').yar.get('accessToken')) {
    if (url.startsWith(constantModel.requestHost)) {
      headers.Authorization = `Bearer ${getGlobal('request').yar.get('accessToken')}`
    }
    return headers
  }
}

const sendExternalRequestGet = async (url, data, headers = {}) => {
  try {
    headers = addTokenHeader(url, headers)
    const response = await axios.get(url, {
      params: data,
      headers,
      scopes: 'api://442bf74f-8332-4b81-9335-8d4d45b24eb6/referencedata.getall'
    })
    return response.data
  } catch (error) {
    handleAxiosError(error)
    throw error
  }
}

const sendExternalRequestPost = async (url, data, headers = {}) => {
  try {
    headers = addTokenHeader(url, headers)
    const response = await axios.post(url, data, {
      headers
    })
    return response.data
  } catch (error) {
    handleAxiosError(error)
    throw error
  }
}

const sendExternalRequestPut = async (url, data, headers = {}) => {
  try {
    headers = addTokenHeader(url, headers)
    const response = await axios.put(url, data, {
      headers
    })
    return response.data
  } catch (error) {
    handleAxiosError(error)
    throw error
  }
}

const sendExternalRequestDelete = async (url, data, headers = {}) => {
  try {
    headers = addTokenHeader(url, headers)
    const response = await axios.delete(url, {
      headers,
      data
    })
    return response.data
  } catch (error) {
    handleAxiosError(error)
    throw error
  }
}

module.exports = { sendExternalRequestGet, sendExternalRequestPost, sendExternalRequestPut, sendExternalRequestDelete }
