const errorMessage = async (error, h) => {
    console.log(error)
    return h.response({ message: 'An internal server error occurred. Please try again later.' }).code(500);
}
module.exports = {errorMessage}