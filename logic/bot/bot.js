/**/

const config = require("../../config.js");
const uid = require(config.LOGIC + "/helpers/uid.js");
const DB = require(config.LOGIC + "/helpers/DB.js");

var rps = {};

setInterval(() => {
    rps = {};
} , 1000);

const bot = async(io , socket , id) => {
    socket.onAny(async () => {
        if(rps[id]) rps[id]++;
        else {
            rps[id] = 1;
            return;
        }
        const bot = await DB.findBotById(id);
        const user = await DB.findUserById(bot.owner);
        
        if(rps[id] >= config.VIP[user.vip].bot_rps) {
            socket.emit("error" , "RPS_LIMIT");
            return socket.disconnect();
        }
    });
    
    socket.on("message" , async (data) => {
        if(!data.chat_id) return socket.emit("error" , "ROOM_MISSING");
        const room = await DB.getRoom(data.chat_id);
        if(!room) return socket.emit("error" , "ROOM_NOT_FOUND");
        if(!room.bots.includes(id)) return socket.emit("error" , "BOT_NOT_IN_ROOM");
        const mess_id = uid.num(8);
        const mess = await DB.newMess(id, data.chat_id, mess_id, "text", data.message, data.reply , true , data.inline , data.keyboard);
        if(mess){
            if(room.type == "group" || room.type == "channel") io.to(data.chat_id).emit("message" , mess);
            else if(room.type == "private" && io.sockets[room.members[0]])  io.sockets[room.members[0]].emit("message" , mess);
        }
    });
    
    socket.on("broadcast" , async (message) => {
        const _bot = await DB.findBotById(id);
        const user = await DB.findUserById(_bot.owner);
        if(_bot.lastBroadcast >= (new Date().getTime() - (1000 * 60 * 60 * config.VIP[user.vip].bot_broadcast))) return socket.emit("error" , "BROADCAST_TIME");
        DB.setBotValue(id , "lastBroadcast" , new Date().getTime());
        for (let r of _bot.members) {
            const mess_id = uid.num(8);
            const room = await DB.getRoom(r);
            const mess = await DB.newMess(id, r, mess_id, "text", message, false, true, [], []);
            if (mess && r) {
                const rm = r.members[0];
                if(io.sockets[rm]) io.sockets[rm].emit("message", mess);
            }
        }
        for (let g of _bot.groups) {
            const mess_id = uid.num(8);
            const mess = await DB.newMess(id, g, mess_id, "text", message, false, true, [], []);
            if (mess) {
                io.to(g).emit("message", mess);
            }
        }
        for (let c of _bot.channels) {
            const mess_id = uid.num(8);
            const mess = await DB.newMess(id, c, mess_id, "text", message, false, true, [], []);
            if (mess) {
                io.to(c).emit("message", mess);
            }
        }
    });
    
    socket.on("get-bot-info" , async (callback) => {
        const _bot = await DB.findBotById(id);
        callback(_bot);
    });
    
    socket.on("get-bot-rooms" , async (callback) => {
        const _bot = await DB.findBotById(id);
        callback([..._bot.members , ..._bot.groups , ..._bot.channels]);
    });
    
    socket.on("get-room-data" , async (room , callback) => {
        const _bot = await DB.findBotById(id);
        const rooms = [..._bot.members, ..._bot.groups, ..._bot.channels];
        if(!rooms.includes(room)) return socket.emit("error" , "BOT_NOT_IN_ROOM")
        const _room = await DB.getRoom(room);
        if(!_room.bots.includes(id)) return socket.emit("error" , "BOT_NOT_IN_ROOM");
        const r = JSON.parse(JSON.stringify(_room));
        delete r.messages;
        delete r.link;
        if(!r.admins.includes(id)) delete r.banList;
        callback(r);
    });
    
    socket.on("edit-mess" , async (chat_id , mess_id , message) => {
        const edit = DB.editTextMess(id, chat_id, mess_id, message);
        const room = await DB.getRoom(chat_id);
        if(edit) {
            if(room.type == "group" || room.type == "channel") return io.to(data.chat_id).emit("edit-mess" , edit);
            else if(io.sockets[room.members[0]]) io.sockets[room.members[0]].emit("edit-mess" , edit)
        }
    });
    
    socket.on("del-mess" , async (chat_id , mess_id) => {
        const del = DB.delMess(id , chat_id , mess_id);
        const room = await DB.getRoom(chat_id);
        if (del) {
            if (room.type == "group" || room.type == "channel") return io.to(data.chat_id).emit("del-mess", edit);
            else if (io.sockets[room.members[0]]) io.sockets[room.members[0]].emit("del-mess", del)
        }
    });
    
    
};

module.exports = bot;
