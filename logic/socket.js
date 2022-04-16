const config = require("../config.js");
const io = require(config.DIRNAME + "/server.js");
const auth = require(config.LOGIC + "/auth/authenticator.js");
const DB = require(config.LOGIC + "/helpers/DB.js");
//const load = require(config.LOGIC + "/socket/Socks.js");

io.on("connection", (socket) => {
    const token = socket.handshake.query.token,
    api = socket.handshake.query.api,
    bot = socket.handshake.query.bot;

    const typo = (api ? "api": (bot ? "bot": (token ? "token": "none")));

    switch (typo) {
        case "token":
            const id = auth.verify(token);
            if (!id) return socket.disconnect();

            if (!DB.findUserById(id)) return socket.disconnect();

            io.sockets[id] = socket;
            DB.setUserValue(id, "isOnline", true);

            //Socks(io , socket , id);

            socket.on("disconnect", (data) => {
                DB.setUserValue(id, "isOnline", false);
                delete io.socket[id];
            });
            break;
        case "api":
            break;
        case "bot":
            break;
    }
});

module.exports = true;