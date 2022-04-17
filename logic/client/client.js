/**/
const config = require("../../config.js");
const chat = require("./chat");

const client = async (io , socket , id) => {
    chat(io , socket , id);
};

module.exports = client;