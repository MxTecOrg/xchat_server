/**/
const config = require("../../config.js");
const chat = require("./chat");
const bot_creator = require("./bot_creator.js");

const client = async (io , socket , id) => {
    await chat(io , socket , id);
    bot_creator(io , socket , id);
};

module.exports = client;
