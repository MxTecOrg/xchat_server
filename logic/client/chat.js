/**/
const config = require("../../config.js");
const uid = require(config.LOGIC + "/helpers/uid.js");
const DB = require(config.LOGIC + "/helpers/DB.js");

const chat = async (io , socket , id) => {
    const user = await Object.assign( {} , DB.findUserById(id));
    delete user.password;
    delete user.rooms;
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
        if(!data.arr_id || !data.chat_id || !data.type || !data.message) return;
        if(data.type == "text" && data.message == "") return;
        const mess_id = uid.num(8);
        
        const mess = await DB.newMess(id , data.chat_id , mess_id , data.type , data.message , data.reply);
        if(mess) {
            await socket.to(data.chat_id).emit("message" , mess);
            socket.emit("mess_arr" , {
                arr_id : arr_id,
                chat_id : data.chat_id,
                mess_id : mess_id
            })
        }
    });
    
    socket.on("create-room" , async (data) => {
        const chat_id = uid.num(12);
        
        const room = await DB.createRoom(chat_id , id , data.name , data.desc , data.pic , data.members , data.type);
        if(!room) return socket.emit("toast" , {
            status : false,
            data : "CANNOT_CREATE_ROOM"
        });
        
        for(let m of room.members){
            if(io.sockets[m]) {
                await io.sockets[m].join(chat_id);
            }
        }
        
        io.of("/client").to(chat_id).emit("new-room" , room);
    });
    
};

module.exports = chat;