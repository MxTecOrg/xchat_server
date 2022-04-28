/**/

const config = require("../../config.js");
const uid = require(config.LOGIC + "/helpers/uid.js");
const DB = require(config.LOGIC + "/helpers/DB.js");

const bot = async(io , socket , id) => {
    socket.on("message" , (data) => {
        if(!data.chat_id) return socket.emit("error" , "ROOM_MISSING");
        const room = await DB.getRoom(data.chat_id);
        if(!room) return socket.emit("error" , "ROOM_NOT_FOUND");
        if(!room.bots.includes(id)) return socket.emit("error" , "BOT_NOT_IN_ROOM");
        const mess_id = uid.num(8);
        const mess = await DB.newMess(id, data.chat_id, mess_id, "text", data.message, data.reply , true , data.inline , data.keyboard);
        if(mess){
            socket.to(data.chat_id).emit("message" , mess);
        }
    });
    
    
};

module.exports = bot;
