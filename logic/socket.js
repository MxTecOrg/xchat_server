const config = require("../config.js");
const io = require(config.DIRNAME + "/server.js");
const auth = require(config.LOGIC + "/auth/authenticator.js");
const DB = require(config.LOGIC + "/helpers/DB.js");
const client = require(config.LOGIC + "/client/client.js");

io.of("/client").on("connection", (socket) => {
    const token = socket.handshake.query.token;
    if(!token) return socket.disconnect();
    const id = auth.verify(token);
    if (!id) return socket.disconnect();

    if (!DB.findUserById(id)) return socket.disconnect();
    io.sockets[id] = socket;
    DB.setUserValue(id, "isOnline", true);

    client(io , socket , id);

    socket.on("disconnect", (data) => {
        DB.setUserValue(id, "isOnline", false);
        delete io.sockets[id];
    });
});

module.exports = true;