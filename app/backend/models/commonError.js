const errorMessage = async (error, h) => {
  try {
    var ext = JSON.stringify(error?.response?.data?.errors || {});
    return h.response({ message: `An internal server error occurred. Please try again later.${(ext)+' '+(error?.response?.data?.message || error.toString())}` }).code(500)
  } catch (err) {
    return h.response({ message: `An unexpected error occurred. ${err.toString()}` }).code(500)
  }
}

module.exports = { errorMessage }
