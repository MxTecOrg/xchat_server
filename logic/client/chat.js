/**/
const config = require("../../config.js");
const uid = require(config.LOGIC + "/helpers/uid.js");
const DB = require(config.LOGIC + "/helpers/DB.js");
const { User, Room, Message, Op } = require(config.LOGIC + "/helpers/_DB.js");

const chat = async (io, socket, id) => {
    const user = await User.findOne({
        where: {
            user_id: id
        }
    });
    const user_data = user.getData();
    await socket.emit("load-user", user_data);

    socket.on("get-room-data", async () => {
        let __r = [];
        for (let r of user_data.rooms) {
            const room = await Room.findOne({
                where: {
                    chat_id: r
                }
            });
            if (room) {
                const rm = room.getData();
                if (rm.owner != id && !rm.admins.includes(id)) {
                    delete rm.link;
                    delete rm.banList;
                }
                __r.push(rm)
                socket.join(r);
            }
        }
        socket.emit("get-room-data", __r)
    });

    socket.on("get-room-mess", async (data) => {
        if (!data) return;
        let messages = [];
        for (let _m of data) {
            if (!_m.chat_id || !_m.date) continue;
            const mess = await Message.findAll({
                where: {
                    [Op.and]: {
                        chat_id: _m.chat_id
                    },
                    [Op.and]: {
                        date: {
                            [Op.gt]: (_m.date == 0 ? new Date().getTime() : _m.date)
                        }
                    }
                }
            });
            if (mess) {
                messages = messages.concat(mess);
            }
        }
        socket.emit("get-room-mess", messages);
    });

    socket.on("message", async (data) => {
        if (!data.arriv_id || !data.chat_id || !data.type || !data.message) return;
        const mess_id = uid.num(8);
        const room = await Room.findOne({
            where: {
                chat_id: data.chat_id
            }
        });
        if (!room) return socket.emit("toast", "ROOM_NOT_FOUND");
        switch (data.type) {
            case "text":
                if (data.message.length < 1 || data.message.length > 1000) return socket.emit("toast", "MESS_WRONG_LENGTH");
                const mess = await Message.create({
                    mess_id: mess_id,
                    chat_id: data.chat_id,
                    type: data.type,
                    user_id: id,
                    message: data.message,
                    reply: (!isNaN(data.reply) ? data.reply : null),
                    date: new Date().getTime()
                });
                if (mess) {
                    await socket.to(data.chat_id).emit("message", mess.getData());
                    for (let bot of room.bots) {
                        if (io.sockets[bot]) io.sockets[bot].emit("message", mess);
                    }
                    socket.emit("arriv-mess", {
                        arriv_id: data.arriv_id,
                        chat_id: data.chat_id,
                        mess_id: mess_id
                    });
                }
                break;
            default:
                socket.emit("toast", "MESS_TYPE_NOT_FOUND");
                break;
        }
    });

    socket.on("create-room", async (data) => {
        const chat_id = uid.num(12);
        const user = await User.findOne({
            where: {
                user_id: id
            }
        }).getData();
        if (config.VIP[user.vip].max_own_groups <= user.own_rooms.length) return null;
        let mem = [id];
        if (!data.members) data.members = [];
        for (let m of members) {
            const memb = await User.findOne({
                where: {
                    user_id: m
                }
            })
            if (memb && memb.acceptInvitations) {
                mem.push(m);
            }
        }
        const room = await Room.create({
            chat_id: chat_id,
            owner: id,
            name: data.name,
            desc: data.desc,
            pic: (data.pic ? data.pic : ""),
            members: (typeof(data.members) == "object" ? JSON.stringify(data.members) : data.members),
            type: "group"
        });
        if (!room) return socket.emit("toast", "CANNOT_CREATE_ROOM");

        for (let m of room.members) {
            const membe = await User.findOne({
                where: {
                    user_id: m
                }
            });
            let mm = membe.getData();
            mm.rooms.push(chat_id);
            membe.setData({
                rooms: membe.rooms
            });
            if (io.sockets[m]) {
                await io.sockets[m].join(chat_id);
            }
        }

        io.of("/client").to(chat_id).emit("new-room", room);
    });

    socket.on("start-pv", async (data) => {
        if (!data.user_id) return socket.emit("toast", "WRONG_DATA");
        const ouser = await User.findOne({
            where: {
                user_id: data.user_id
            }
        });
        if (!ouser) return socket.emit("toast", "USER_NOT_FOUND");
        const _ouser = ouser.getData();
        if (ouser.banList.includes(id)) return socket.emit("toast", "USER_BANNED_U");
        const user = await User.findOne({
            where: {
                user_id: id
            }
        });
        const _user = user.getData();
        const croom = Room.findOne({
            where: {
                [Op.or]: [
                    {
                        chat_id: id + user_id
                    }, {
                        chat_id: user_id + id
                    }
                ]
            }
        });
        if (!croom) return socket.emit("toast", "ROOM_EXISTS");
        const chat_id = id + user_id;
        const room = Room.create({
            chat_id: chat_id,
            owner: id,
            name: "SYSTEM",
            desc: "SYSTEM",
            pic: "",
            members: JSON.stringify([id , user_id]),
            type: "private"
        });
        if(!room) return socket.emit("toast" , "UNEXPECTED_ERROR");
        _user.rooms.push(chat_id);
        _ouser.rooms.push(chat_id);
        
        user.setData({
            rooms : _user.rooms
        });
        
        ouser.setData({
            rooms : _ouser.rooms
        });
        
        socket.join(chat_id);
        if (io.sockets[user_id]) io.sockets[user_id].join(chat_id);
        io.of("/client").to(chat_id).emit("new-pv", room.getData());
    });


    socket.on("find-room-from-link", async (link) => {
        const _room = await Room.findOne({
            where : {
                link : link
            }
        });
        if (!_room) return socket.emit("bottomsheet", {
            status: false,
            data: "NOT_FOUND"
        });
        const room = _room.getData();

        socket.emit("bottomsheet", {
            status: true,
            data: {
                chat_id: room.chat_id,
                name: room.name,
                desc: room.desc,
                pic: room.pic,
                owner: await User.findOne(room.owner).nickname,
                members: room.members.length,
                bgColor: room.bgColor,
                textColor: room.textColor
            }
        })
    });

    socket.on("join-room", async (data) => {
        const room = await DB.joinRoom(id, data.chat_id);
        if (!room.status) return socket.emit("bottomsheet", room);

        socket.emit("new-room", room);
        await socket.join(room.chat_id);
        const mess_id = uid.num(8);

        const mess = await DB.newMess("SYSTEM", room.chat_id, mess_id, "text", user.name + " se ah unido al chat.");

        socket.to(room.chat_id).emit("joined", { user_id: id, room: room_chat_id });

        io.of("/client").to(room.chat_id).emit("message", mess);
    });

    socket.on("edit-mess", async (data) => {
        const edit = await DB.editTextMess(id, data.chat_id, data.mess_id, data.message);
        if (edit) return socket.to(data.chat_id).emit("edit-mess", edit);
        else socket.emit("toast", "No se pudo editar el mensaje.");
    });

    socket.on("del-mess", async (data) => {
        const del = await DB.delMess(id, data.chat_id, data.mess_id);
        if (edit) return socket.to(data.chat_id).emit("del-mess", del);
        else socket.emit("toast", "No se pudo borrar el mensaje.");
    });

    socket.on("add-contact", async (data) => {
        if (data == id) return socket.emit("toast", "CANNOT_SELF_ADD");
        const u = await User.findOne({
            where: {
                user_id: id
            }
        });


        const user = await User.findOne({
            where: {
                [Op.or]: [
                    {
                        user_id: data
                    },
                    {
                        email: data
                    }
                ]
            }
        });
        if (!user) return socket.emit("toast", "USER_NOT_FOUND");
        if (u.contacts.includes(user.user_id)) return socket.emit("toast", "ALREADY_IN_CONTACTS");

        u.contacts.push(contact);
        try {
            await u.setData({
                contacts: u.contacts
            });

            return socket.emit("add-contact", {
                id: user.user_id,
                email: user.email,
                nick: user.nick,
                pic: user.pic,
                desc: user.desc,
                color: user.color,
                statuses: user.statuses
            });
        } catch (err) {
            return socket.emit("toast", "USER_NOT_FOUND");
        }
    });



};

module.exports = chat;
