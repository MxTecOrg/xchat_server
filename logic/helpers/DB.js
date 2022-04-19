/********************
* Database Manager  *
*********************/

const fs = require("fs");
const config = require("../../config.js");
const uid = require(config.LOGIC + "/helpers/uid.js");

var USERS = {}, ROOMS = {}, BOTS = {}, CHANNELS = {}, TOKEN_PAIRS = {};

const DB = {
    loadUsers: function () {
        console.time("Users loaded in:")
        const _users = fs.readdirSync(config.DB + "/users/");
        try {
            for (let u of _users) {
                USERS[u.split(".")[0]] = JSON.parse(fs.readFileSync(config.DB + "/users/" + u));
            }
        }catch(err) {
            console.error(err);
        }
        console.timeEnd("Users loaded in:");
    },

    loadRooms: function () {
        console.time("Rooms loaded in:")
        const _rooms = fs.readdirSync(config.DB + "/rooms/");
        try {
            for (let u of _rooms) {
                ROOMS[u.split(".")[0]] = JSON.parse(fs.readFileSync(config.DB + "/rooms/" + u));
            }
        }catch(err) {
            console.error(err);
        }
        console.timeEnd("Rooms loaded in:");
    },

    loadAll: function() {
        this.loadUsers();
        this.loadRooms();
    },

    saveUsers: async function() {
        console.time("Users saved in:");
        for (let u in USERS) {
            await fs.writeFile(config.DB + "/users/" + u + ".json", JSON.stringify(USERS[u]), ()=> {});
        }
        console.timeEnd("Users saved in:");
        return true;
    },

    saveRooms: async function() {
        console.time("Rooms saved in:");
        for (let u in ROOMS) {
            await fs.writeFile(config.DB + "/rooms/" + u + ".json", JSON.stringify(ROOMS[u]), ()=> {});
        }
        console.timeEnd("Rooms saved in:");
        return true;
    },


    autoSave: function(time) {
        const su = this.saveUsers;
        const sr = this.saveRooms;
        async function s() {
            await su();
            await sr();
        }
        setInterval(s, time);
    },

    addUser: function(id , data) {
        if (!USERS[id]) {
            USERS[id] = data;
            return true;
        } else return null;
    },

    delUser: function(id) {
        if (!USERS[id]) {
            delete USERS[id];
            return true;
        } else return null;
    },

    findUserById: function(id) {
        if (USERS[id]) return USERS[id];
        else return null;
    },

    findUserByName: function(user) {
        for (let u in USERS) {
            if (USERS[u].username == user) {
                return USERS[u];
            }
        }
        return null;
    },

    findUserByNick: function(nick) {
        for (let u in USERS) {
            if (USERS[u].nick == nick) {
                return USERS[u];
            }
        }
        return null;
    },

    findUserByMail: function(mail) {
        for (let u in USERS) {
            if (USERS[u].email == mail) {
                return USERS[u];
            }
        }
        return null;
    },

    findAllUsers: function(key , condition , value) {
        let f = [];
        for (let u in USERS) {
            switch (condition) {
                case "==":
                    if (USERS[u][key] == value) f.push(USERS[u]);
                    return f;
                    break;
                case "!=":
                    if (USERS[u][key] != value) f.push(USERS[u]);
                    return f;
                    break;
                case "<":
                    if (USERS[u][key] < value) f.push(USERS[u]);
                    return f;
                    break;
                case ">":
                    if (USERS[u][key] > value) f.push(USERS[u]);
                    return f;
                    break;
                case "<=":
                    if (USERS[u][key] <= value) f.push(USERS[u]);
                    return f;
                    break;
                case ">=":
                    if (USERS[u][key] >= value) f.push(USERS[u]);
                    return f;
                    break;
                default:
                    f.push(USERS[u]);
                    return f;
                    break;
            }
        }
        return f;
    },

    getUserValue: function(id , key) {
        if (USERS[id]) {
            return USERS[id][key];
        } else return null;
    },

    setUserValue: function(id , key , value) {
        if (USERS[id]) {
            USERS[id][key] = value;
            return true;
        } else return null;
    },

    addUserValue: function(id , key , value) {
        if (USERS[id]) {
            USERS[id][key] += value;
            return true;
        } else return null;
    },

    addTokenPair: function (token , _token) {
        TOKEN_PAIRS[token] = _token;
    },

    getTokenPair: function (token) {
        return TOKEN_PAIRS[token];
    },

    delTokenPair: function (token) {
        delete TOKEN_PAIRS[token];
    },

    createPrivateRoom : async function (user , user2) {
        if (!USERS[user2]) return {
            status : false,
            data : "BANNED_USER"
        };
        
        if (USERS[user2].banList.includes(user)) return {
            status : false,
            data : "BANNED_USER"
        };
        let Room = DB.getRoom(user + "-" + user2) || DB.getRoom(user2 + "-" + user);
        if (Room) return {
            status : false,
            data : "ALREADY_ON_ROOM"
        };
        const mess_id = uid.num(8);
        Room = user + "-" + user2;
        ROOMS[Room] = await {
            chat_id: Room,
            type: "private",
            pinned: [],
            bgColor: "SYSTEM",
            textColor: "SYSTEM",
            messages: {
                [mess_id]: {
                    mess_id: mess_id,
                    user_id: "SYSTEM",
                    user_nick: "SYSTEM",
                    user_color: "SYSTEM",
                    chat_id: Room,
                    type: "text",
                    reply: "",
                    isEdited: false,
                    isBot: false,
                    receivedBy: [],
                    seenBy: [],
                    inline: [],
                    keyboard: [],
                    message: "Se ha iniciado el chat privado seguro.",
                    date: new Date()
                }
            },
            members : [user , user2]
        };
        return {
            status : true,
            data : ROOMS[Room]
        }
    },

    createRoom: async function (chat_id , owner , name , desc , pic , members , type) {
        let mem = [owner];
        for (let m of members) {
            if (USERS[m] && USERS[m].acceptInvitations) {
                mem.push(m);
            }
        }
        const mess_id = uid.num(8);
        ROOMS[chat_id] = await {
            chat_id: chat_id,
            pic: (!pic ? "": pic),
            type: "group",
            gType: (type ? type: "public"),
            link: "/xgp" + chat_id + "/" + uid.alphanum(12),
            name: (name ? name: "group-" + uid.alphanum(5)),
            desc: (desc ? desc: "El admin es muy vago como para poner una descripción"),
            bgColor: "SYSTEM",
            textColor: "SYSTEM",
            owner: owner,
            admins: [],
            members: mem,
            banList: [],
            bots: [],
            pinned: [],
            messages: {
                [mess_id]: {
                    mess_id: mess_id,
                    user_id: "SYSTEM",
                    user_nick: "SYSTEM",
                    user_color: "SYSTEM",
                    chat_id: chat_id,
                    type: "text",
                    reply: "",
                    isEdited: false,
                    isBot: false,
                    receivedBy: [],
                    seenBy: [],
                    message: "Se ha creado la sala \"" + name + "\"",
                    inline: [],
                    keyboard: [],
                    date: new Date()
                }
            },
            boosted : 1
        };

        for (let m of ROOMS[chat_id].members) {
            const Mess = Object.keys(ROOMS[chat_id].messages);
            const lastMess = Mess[Mess.length - 1];
            USERS[m].rooms.push(chat_id);
        }

        return ROOMS[chat_id];
    },
    

    findRoomByLink: async function (link) {
        let chat_id = link.split("/")[1];
        if (!chat_id) return null;
        chat_id = chat_id.replace("xgp", "");
        if (!ROOMS[chat_id]) return null;
        else return chat_id;
    },

    joinRoom: async function (id , room) {
        if (!ROOMS[room]) return {
            status : false,
            data : "NOT_FOUND"
        };
        
        if (ROOMS[chat_id].members.includes(id)) return {
            status : false,
            data : "ALREADY_JOINED"
        };
        
        if (ROOMS[room].members.length >= config.ROOMS_CONFIG.chats_mem) return {
            status : false,
            data: "MAX_MEMB"
        };
        await ROOMS[room].members.push(id);
        const Mess = await Object.keys(ROOMS[room].messages);
        const lastMess = Mess[Mess.length - 1];
        USERS[id].rooms.push(room);
        return { 
            status : true,
            data : ROOMS[room]
        }

    },


    joinRoomByLink: async function (id , link) {
        const chat_id = await this.findRoomByLink(link);
        if (!chat_id) return null;
        if (ROOMS[chat_id].banList.includes(id)) return null;
        if (ROOMS[chat_id].members.includes(id)) return null;
        if (ROOMS[chat_id].members.length >= config.ROOMS_CONFIG.chats_mem) return null;
        ROOMS[chat_id].members.push(id);
        return true;
    },

    getRoom: async function(id) {
        if (ROOMS[id]) return await ROOMS[id];
        else return null;
    },

    getRoomMembs: async function(id) {
        const r = this.getRoom(id);
        if (r && r.members) return await r.members;
        else return null;
    },

    getRoomMess: async function (id) {
        const r = await this.getRoom(id);
        if (r && r.messages) return r.messages;
        else return null;
    },

    getRoomMessFrom: async function (id , mess_id) {
        const r = await this.getRoom(id);
        let mess = {};
        let found = false;
        if (r && r.messages) {
            const keys = Object.keys(r.messages);
            const tol = config.ROOMS_CONFIG.chats_mess_tol;
            const length = (keys.length - tol < 0 ? 0: keys.length - tol);
            const aKeys = keys.splice(length, keys.length);
            if (aKeys.includes(mess_id)) length = aKeys.indexOf(mess_id);
            for (let x = length; x < keys.length; x++) {
                mess[keys[x]] = r.messages[keys[x]];
            }
            return mess;
        } else return null;
    },

    newMess: async function (id , chat_id , mess_id , type , message , reply) {
        const user = await this.findUserById(id);
        if (!ROOMS[chat_id] && id != "SYSTEM") return null;
        const nmess = await {
            mess_id: mess_id,
            user_id: id,
            user_nick: (user.nick ? user.nick : "SYSTEM"),
            user_color: (user.color ? user.color : "SYSTEM"),
            chat_id: chat_id,
            type: type,
            reply: (reply ? reply: ""),
            isEdited: false,
            isBot: false,
            receivedBy: [],
            seenBy: [],
            message: message,
            inline: [],
            keyboard: [],
            date: new Date()
        };
        ROOMS[chat_id].messages[mess_id] = nmess;
        return nmess;
    },

    editTextMess: function (id , chat_id , mess_id , newMess , del) {
        if (!ROOMS[chat_id] || !ROOMS[chat_id].messages[mess_id]) return null;
        const mess = ROOMS[chat_id].messages[mess_id];
        if (mess.user_id != id && !del && ROOMS[chat_id].owner != id && !ROOMS[chat_id].admins.includes(id)) return null;
        if (mess.message == newMess) return null;
        mess.message = newMess;
        ROOMS[chat_id].messages[mess_id] = mess;
        return mess;
    },

    delMess: function (id , chat_id , mess_id) {
        const ret = this.editTextMess(id, chat_id, mess_id, "El mensaje ha sido eliminado.", true);
        if (ret) return ret;
        else return null;
    }
};

module.exports = DB;