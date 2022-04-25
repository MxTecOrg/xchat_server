const config = require("../../config.js");
const uid = require(config.LOGIC + "/helpers/uid.js");
const DB = require(config.LOGIC + "/helpers/DB.js");


const bot_creator = async (io, socket, id) => {
    socket.on("create-bot", async (data) => {
        if (!data.name) return socket.emit("toast", "Inserte un nombre.");
        const bot = await DB.createBot(id, data.name, data.desc);
        if (!bot.status) return socket.emit("toast", bot.data);
        socket.emit("create-bot", bot.data);
    });
};

module.exports = bot_creator;
