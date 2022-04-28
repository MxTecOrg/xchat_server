const config = require("../config.js");
const io = require(config.DIRNAME + "/server.js");
const auth = require(config.LOGIC + "/auth/authenticator.js");
const DB = require(config.LOGIC + "/helpers/DB.js");
const client = require(config.LOGIC + "/client/client.js");
const bot = require(config.LOGIC + "/bot/bot.js");

io.of("/client").on("connection", (socket) => {
    if (!socket.handshake.query) {
        socket.emit("alert", "EMPTY_TOKEN");
        socket.disconnect();
        return;
    }
    const token = socket.handshake.query.token;
    if (!token) {
        socket.emit("alert", "EMPTY_TOKEN")
        socket.disconnect();
        return;
    }
    const id = auth.verify(token);
    if (!id) {
        socket.emit("alert", "WRONG_TOKEN");
        socket.disconnect();
        return;
    }

    if (!DB.findUserById(id)) {
        socket.emit("alert", "USER_NOT_FOUND");
        socket.disconnect();
        return;
    }
    
    if(io.sockets[id]) {
        io.sockets[id].emit("alert" , "OTHER_CONNECT");
        io.sockets[id].disconnect();
        delete io.sockets[id];
    }
    io.sockets[id] = socket;
    DB.setUserValue(id, "isOnline", true);

    client(io, socket, id);

    socket.on("disconnect", (data) => {
        DB.setUserValue(id, "isOnline", false);
        delete io.sockets[id];
    });
});

io.of("/bot").on("connection", async (socket) => {
    if (!socket.handshake.query) {
        socket.emit("error", "EMPTY_TOKEN");
        socket.disconnect();
        return;
    }
    const token = socket.handshake.query.token;
    if (!token) {
        socket.emit("error", "EMPTY_TOKEN")
        socket.disconnect();
        return;
    }
    const _bot = await DB.findBotByToken(token);
    if (!_bot) {
        socket.emit("error", "WRONG_TOKEN");
        socket.disconnect();
        return;
    }

    if(io.sockets[_bot.id]) {
        io.sockets[_bot.id].emit("error", "OTHER_CONNECT");
        io.sockets[_bot.id].disconnect();
        delete io.sockets[_bot.id];
    }
    io.sockets[_bot.id] = socket;
    DB.setBotValue(_bot.id, "isOnline", true);

    bot(io, socket, id);

    socket.on("disconnect", (data) => {
        DB.setBotValue(_bot.id, "isOnline", false);
        delete io.sockets[_bot.id];
    });
})

module.exports = true;
