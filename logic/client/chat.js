/**/
const config = require("../../config.js");
const uid = require(config.LOGIC + "/helpers/uid.js");
const DB = require(config.LOGIC + "/helpers/DB.js");

const chat = async (io , socket , id) => {
    const user = await JSON.parse(JSON.stringify( DB.findUserById(id)));
    delete user.password;
    await socket.emit("load-user" , user);
    const rooms = user.rooms;
    
    socket.on("get-room-data" , async (data) => {
        const room = await DB.getRoom(data.room);
        if(room){
            const rm = JSON.parse(JSON.stringify(room));
            delete rm.messages;
            if(rm.owner != id && !rm.admins.includes(id)) {
                delete rm.link;
                delete rm.banList;
            }
            socket.emit("get-room-data" , rm);
            await socket.join(data.room);
        }
    });
    
    socket.on("get-room-mess" , async (data) => {
        const mess = await DB.getRoomMessFrom(data.chat_id , data.lastMess);
        if(mess) socket.emit("get-room-mess" , {
            chat_id : data.chat_id,
            data : mess
        });
    });
    
    socket.on("message" , async (data) => {
        if(!data.arriv_id || !data.chat_id || !data.type || !data.message) return;
        if(data.type == "text" && data.message == "") return;
        const mess_id = uid.num(8);
        
        const mess = await DB.newMess(id , data.chat_id , mess_id , data.type , data.message , data.reply);
        if(mess) {
            await socket.to(data.chat_id).emit("message" , mess);
            socket.emit("arriv-mess" , {
                arriv_id : data.arriv_id,
                chat_id : data.chat_id,
                mess_id : mess_id
            });
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
    
    socket.on("mess-r" , async (data) => {
        if(!data.chat_id || !data.mess_id) return;
        const mess = await DB.setReceived(id , data.chat_id , data.mess_id);
        if(mess) {
            if(io.sockets[mess.user_id]) return io.sockets[mess.user_id].emit("mess-r" , {user_id : id , chat_id : mess.chat_id , mess_id : mess.mess_id});
        }
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
        const room = await DB.joinRoom(id , data.chat_id);
        if(!room.status) return socket.emit("bottomsheet" , room);
        
        socket.emit("new-room" , room);
        await socket.join(room.chat_id);
        const mess_id = uid.num(8);
        
        const mess = await DB.newMess("SYSTEM" , room.chat_id , mess_id , "text" ,  user.name + " se ah unido al chat.");
        
        socket.to(room.chat_id).emit("joined" ,
        { user_id : id , room : room_chat_id });
        
        io.of("/client").to(room.chat_id).emit("message", mess);
    });
    
    socket.on("edit-mess" , async (data) => {
        const edit = await DB.editTextMess(id , data.chat_id , data.mess_id , data.message);
        if(edit) return socket.to(data.chat_id).emit("edit-mess" , edit);
        else socket.emit("toast" , "No se pudo editar el mensaje.")
    });
    
    socket.on("del-mess" , async (data) => {
        const del = await DB.delMess(id, data.chat_id, data.mess_id);
        if (edit) return socket.to(data.chat_id).emit("del-mess", del);
        else socket.emit("toast" , "No se pudo borrar el mensaje.")
    });
    
    socket.on("add-contact" , async (data) => {
        const user = (await DB.findUserbyId(data) || await DB.findUserByMail(data));
        if(!user) return socket.emit("toast" , "USER_NOT_FOUND");
        if(user.id == id) return socket.emit("toast" , "CANNOT_SELF_ADD");
        if((await DB.getUserValue(id , "contacts")).includes(user.id)) return socket.emit("toast" , "ALREADY_IN_CONTACTS");
        if(await DB.addContact(id , user.id)){
            return socket.emit("add-contact" , {
                id : user.id,
                email : user.email,
                nick : user.nick,
                pic : user.pic,
                desc : user.desc,
                color : user.color,
                statuses : user.statuses
            });
        }
        socket.emit("toast" , "USER_NOT_FOUND");
    });
    
};

module.exports = chat;
