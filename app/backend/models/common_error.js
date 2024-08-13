const errorMessage = async (error, h) => {
    try {
        return h.response({ message: 'An internal server error occurred. Please try again later.' }).code(500);
    } catch (error) {
        return error;
    }
}
module.exports = {errorMessage}