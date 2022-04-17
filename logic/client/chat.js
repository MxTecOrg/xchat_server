/**/
const config = require("../../config.js");
const uid = require(config.LOGIC + "/helpers/uid.js");
const DB = require(config.LOGIC + "/helpers/DB.js");

const chat = async (io , socket , id) => {
    const user = await Object.assign( {} , DB.findUserById(id));
    delete user.password;
    await socket.emit("load-user" , user)
    const rooms = user.rooms;
    let Rooms = {};
    for(let r of rooms){
        await socket.join(r);
        const rm = await DB.getRoom(r);
        if(rm){
            const nr = await Object.assign({} , rm);
            delete nr.messages;
            if(nr.owner != id && !nr.admins.includes(id)) {
                delete nr.link;
                delete nr.banList;
            }
            Rooms[r] = nr;
        }
    }
    await socket.emit("load-rooms" , Rooms);
    const nm = await DB.getNewMess(id);
    await socket.emit("load-chats" , (nm ? nm : {}));
    
    socket.on("message" , async (data) => {
        const mess = DB.newMess(id , data.chat_id , data.mess_id , data.type , data.message , data.reply);
        if(mess) socket.to(data.chat_id).emit("message" , mess);
    });
};

module.exports = chat;