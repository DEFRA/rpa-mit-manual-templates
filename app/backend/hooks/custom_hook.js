const globalState = {};

const setGlobal = (key, value) => {
    globalState[key] = value;
};

const getGlobal = (key) => {
    return globalState[key];
};

module.exports = { setGlobal, getGlobal };