/**/
const config = require("../../config.js");
const uid = require(config.LOGIC + "/helpers/uid.js");
const DB = require(config.LOGIC + "/helpers/DB.js");

const chat = async (io , socket , id) => {
    const user = await JSON.parse(JSON.stringify( DB.findUserById(id)));
    delete user.password;
    delete user.rooms;
    await socket.emit("load-user" , user)
    const rooms = user.rooms;
    let Rooms = {};
    for(let r of rooms){
        await socket.join(r);
        const rm = await DB.getRoom(r);
        if(rm){
            const nr = await JSON.parse(JSON.stringify( rm));
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
        if(!room) return socket.emit("toast" , "CANNOT_CREATE_ROOM");
        
        for(let m of room.members){
            if(io.sockets[m]) {
                await io.sockets[m].join(chat_id);
            }
        }
        
        io.of("/client").to(chat_id).emit("new-room" , room);
    });
    
    socket.on("start-pv" , async (data) => {
        if(!data.user_id) return socket.emit("toast" , {
            status : false,
            data : "DATA_ERROR"
        });
        const room = await DB.createPrivateRoom(id , data.user_id);
        if(!room.status) return socket.emit("toast" , room);
        socket.join(room.chat_id);
        if(io.sockets[data.user_id]) io.sockets[data.user_id].join(room.data.chat_id);
        io.of("/clients").to(room.data.chat_id).emit("new-pv" , room.data);
    });
    
    socket.on("mess-received" , async (data) => {
        if(!data.chat_id || !data.mess_id) return;
        const mess = DB.setReceived(id , data.chat_id , data.mess_id);
        
    });
    
    socket.on("find-room-from-link" , async (link) => {
        const chat_id = await DB.findRoomByLink(link);
        if(!chat_id) return socket.emit("bottomsheet" , "NOT_FOUND");
        const room = await DB.getRoom(chat_id);
        if(!room) return socket.emit("bottomsheet" , {
            status : false,
            data : "NOT_FOUND"
        });
            
        socket.emit("bottomsheet" , {
            status : true,
            data : {
                chat_id : chat_id,
                name : room.name,
                desc : room.desc,
                pic : room.pic,
                owner : await DB.findUserbyId(room.owner),
                members : room.members.length,
                bgColor: room.bgColor ,
                textColor: room.textColor
            }
        })
    });
    
    socket.on("join-room" , async (data) => {
        const room = await DB.joinRoom(id , data.id);
        if(!room.status) return socket.emit("bottomsheet" , room);
        await socket.join(room.id)
        socket.emit("new-room" , room);
        
        const mess_id = uid.num(8);
        
        const mess = await DB.newMess("SYSTEM" , room.id , mess_id , "text" ,  user.name + " se ah unido al chat.");
        
        socket.to(room.chat_id).emit("joined" , id);
        
        io.of("/client").to(room.id).emit("message", mess);
    });
    
    socket.on("edit-mess" , async (data) => {
        
    });
    
};

module.exports = chat;