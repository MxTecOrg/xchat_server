/********************
 * Database Manager  *
 *********************/

const fs = require("fs");
const config = require("../../config.js");
const uid = require(config.LOGIC + "/helpers/uid.js");

var USERS = {},
    ROOMS = {},
    BOTS = {},
    CHANNELS = {},
    TOKEN_PAIRS = {};

const DB = {
    loadUsers: function() {
        console.time("Users loaded in:");
        const _users = fs.readdirSync(config.DB + "/users/");
        try {
            for (let u of _users) {
                USERS[u.split(".")[0]] = JSON.parse(fs.readFileSync(config.DB + "/users/" + u));
            }
        } catch (err) {
            console.error(err);
        }
        console.timeEnd("Users loaded in:");
    },

    loadRooms: function() {
        console.time("Rooms loaded in:");
        const _rooms = fs.readdirSync(config.DB + "/rooms/");
        try {
            for (let u of _rooms) {
                ROOMS[u.split(".")[0]] = JSON.parse(fs.readFileSync(config.DB + "/rooms/" + u));
            }
        } catch (err) {
            console.error(err);
        }
        console.timeEnd("Rooms loaded in:");
    },

    loadBots: function() {
        console.time("Bots loaded in:");
        const _bots = fs.readdirSync(config.DB + "/bots/");
        try {
            for (let u of _bots) {
                BOTS[u.split(".")[0]] = JSON.parse(fs.readFileSync(config.DB + "/bots/" + u));
            }
        } catch (err) {
            console.error(err);
        }
        console.timeEnd("Bots loaded in:");
    },

    loadAll: function() {
        this.loadUsers();
        this.loadRooms();
        this.loadBots();
    },

    saveUsers: async function() {
        console.time("Users saved in:");
        for (let u in USERS) {
            await fs.writeFile(config.DB + "/users/" + u + ".json", JSON.stringify(USERS[u]), () => {});
        }
        console.timeEnd("Users saved in:");
        return true;
    },

    saveRooms: async function() {
        console.time("Rooms saved in:");
        for (let u in ROOMS) {
            await fs.writeFile(config.DB + "/rooms/" + u + ".json", JSON.stringify(ROOMS[u]), () => {});
        }
        console.timeEnd("Rooms saved in:");
        return true;
    },

    saveBots: async function() {
        console.time("Bots saved in:");
        for (let u in BOTS) {
            await fs.writeFile(config.DB + "/bots/" + u + ".json", JSON.stringify(BOTS[u]), () => {});
        }
        console.timeEnd("Bots saved in:");
        return true;
    },


    autoSave: function(time) {
        const su = this.saveUsers;
        const sr = this.saveRooms;
        const sb = this.saveBots;
        async function s() {
            await su();
            await sr();
            await sb();
        }
        setInterval(s, time);
    },

    addUser: function(id, data) {
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

    findAllUsers: function(key, condition, value) {
        let f = [];
        for (let u in USERS) {
            switch (condition) {
                case "==":
                    if (USERS[u][key] == value) f.push(USERS[u]);
                    return f;
                case "!=":
                    if (USERS[u][key] != value) f.push(USERS[u]);
                    return f;
                case "<":
                    if (USERS[u][key] < value) f.push(USERS[u]);
                    return f;
                case ">":
                    if (USERS[u][key] > value) f.push(USERS[u]);
                    return f;
                case "<=":
                    if (USERS[u][key] <= value) f.push(USERS[u]);
                    return f;
                case ">=":
                    if (USERS[u][key] >= value) f.push(USERS[u]);
                    return f;
                default:
                    f.push(USERS[u]);
                    return f;
            }
        }
        return f;
    },

    getUserValue: function(id, key) {
        if (USERS[id]) {
            return USERS[id][key];
        } else return null;
    },

    setUserValue: function(id, key, value) {
        if (USERS[id]) {
            USERS[id][key] = value;
            return true;
        } else return null;
    },

    addUserValue: function(id, key, value) {
        if (USERS[id]) {
            USERS[id][key] += value;
            return true;
        } else return null;
    },

    addContact: function(id, user) {
        if (USERS[users]) {
            USERS[id].contacts.push(user);
            return true;
        } else return null;
    },

    addTokenPair: function(token, _token) {
        TOKEN_PAIRS[token] = _token;
    },

    getTokenPair: function(token) {
        return TOKEN_PAIRS[token];
    },

    delTokenPair: function(token) {
        delete TOKEN_PAIRS[token];
    },

    createPrivateRoom: async function(user, user2) {
        if (!USERS[user2]) return {
            status: false,
            data: "BANNED_USER"
        };

        if (USERS[user2].banList.includes(user)) return {
            status: false,
            data: "BANNED_USER"
        };
        let Room = DB.getRoom(user + "-" + user2) || DB.getRoom(user2 + "-" + user);
        if (Room) return {
            status: false,
            data: "ALREADY_ON_ROOM"
        };
        const mess_id = uid.num(8);
        Room = user + "-" + user2;
        ROOMS[Room] = await {
            chat_id: Room,
            type: "private",
            pinned: [],
            bots: [],
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
                    shared: 0,
                    isEdited: 0,
                    isBot: 0,
                    receivedBy: [],
                    seenBy: [],
                    inline: [],
                    keyboard: [],
                    message: "Se ha iniciado el chat privado seguro.",
                    date: new Date().getTime()
                }
            },
            members: [user, user2]
        };
        return {
            status: true,
            data: ROOMS[Room]
        }
    },

    createRoom: async function(chat_id, owner, name, desc, pic, members, type) {
        const user = await DB.findUserById(owner);
        if (config.VIP[user.vip].max_own_groups <= user.own_rooms.length) return null;
        let mem = [owner];
        for (let m of members) {
            if (USERS[m] && USERS[m].acceptInvitations) {
                mem.push(m);
            }
        }
        const mess_id = uid.num(8);
        ROOMS[chat_id] = await {
            chat_id: chat_id,
            pic: (!pic ? "" : pic),
            type: "group",
            gType: (type ? type : "public"),
            link: config.URL + "/xgp=" + chat_id,
            name: (name ? name : "group-" + uid.alphanum(5)),
            desc: (desc ? desc : "El admin es muy vago como para poner una descripción"),
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
                    shared: 0,
                    isEdited: 0,
                    isBot: 0,
                    receivedBy: [],
                    seenBy: [],
                    message: "Se ha creado la sala \"" + name + "\"",
                    inline: [],
                    keyboard: [],
                    date: new Date().getTime()
                }
            },
            level: 1
        };

        for (let m of ROOMS[chat_id].members) {
            USERS[m].rooms.push(chat_id);
        }

        USERS[owner].own_rooms.push(chat_id);

        return ROOMS[chat_id];
    },


    findRoomByLink: async function(link) {
        let chat_id = link.split("/")[1];
        if (!chat_id) return null;
        chat_id = chat_id.replace("xgp", "");
        if (!ROOMS[chat_id]) return null;
        else return chat_id;
    },

    joinRoom: async function(id, room) {
        if (!ROOMS[room]) return {
            status: false,
            data: "NOT_FOUND"
        };

        if (ROOMS[chat_id].members.includes(id)) return {
            status: false,
            data: "ALREADY_JOINED"
        };

        if (ROOMS[room].members.length >= config.ROOMS_CONFIG.chats_mem) return {
            status: false,
            data: "MAX_MEMB"
        };
        await ROOMS[room].members.push(id);
        const Mess = await Object.keys(ROOMS[room].messages);
        const lastMess = Mess[Mess.length - 1];
        USERS[id].rooms.push(room);
        return {
            status: true,
            data: ROOMS[room]
        }

    },


    joinRoomByLink: async function(id, link) {
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

    getRoomMess: async function(id) {
        const r = await this.getRoom(id);
        if (r && r.messages) return r.messages;
        else return null;
    },

    getRoomMessFrom: async function(id, mess_id) {
        const r = await this.getRoom(id);
        let mess = {};
        let found = false;
        if (r && r.messages) {
            const keys = Object.keys(r.messages);
            //const tol = config.ROOMS_CONFIG.chats_mess_tol;
            const length = 0;
            if (r.messages[mess_id]) length = keys.indexOf(mess_id);
            else return null;
            for (let x = length; x < keys.length; x++) {
                mess[keys[x]] = r.messages[keys[x]];
            }
            return (Object.keys(mess) < 1 ? null : mess);
        } else return null;
    },

    newMess: async function(id, chat_id, mess_id, type, message, reply, isBot, inline, keyboard) {
        const user = await this.findUserById(id);
        if (!ROOMS[chat_id] && id != "SYSTEM") return null;
        const nmess = {
            mess_id: mess_id,
            user_id: id,
            user_nick: (user.nick ? user.nick : "SYSTEM"),
            user_color: (user.color ? user.color : "SYSTEM"),
            chat_id: chat_id,
            type: type,
            reply: (reply ? reply : ""),
            shared: 0,
            isEdited: 0,
            isBot: (isBot ? 1 : 0),
            receivedBy: [],
            seenBy: [],
            message: message,
            inline: (inline ? inline : []),
            keyboard: (keyboard ? keyboard : []),
            date: new Date().getTime()
        };
        ROOMS[chat_id].messages[mess_id] = nmess;
        return nmess;
    },

    editTextMess: function(id, chat_id, mess_id, newMess, del , inline , keyboard) {
        if (!ROOMS[chat_id] || !ROOMS[chat_id].messages[mess_id]) return null;
        const mess = ROOMS[chat_id].messages[mess_id];
        if (mess.user_id != id && ROOMS[chat_id].owner != id && !ROOMS[chat_id].admins.includes(id)) return null;
        if (mess.message == newMess) return null;
        if (del) {
            mess.message = newMess;
            ROOMS[chat_id].messages[mess_id] = mess;
            return mess;
        }
        mess.message = newMess;
        mess.isEdited = true;
        mess.inline = (inline ? inline : mess.inline);
        mess.keyboard = (keyboard ? keyboard : mess.keyboard);
        ROOMS[chat_id].messages[mess_id] = mess;
        return mess;
    },

    delMess: function(id, chat_id, mess_id) {
        const ret = this.editTextMess(id, chat_id, mess_id, "El mensaje ha sido eliminado.", true);
        if (ret) return ret;
        else return null;
    },

    findBotById: async function(bot_id) {
        if (BOTS[bot_id]) return BOTS[bot_id];
        else return null;
    },

    findBotByName: async function(name) {
        for (let bot in BOTS) {
            if (BOTS[bot].name == name) return BOTS[bot];
        }
        return null;
    },

    findBotByToken: async function(token) {
        for (let bot in BOTS) {
            if (BOTS[bot].token == token) return BOTS[bot];
        }
        return null;
    },

    getBotValue: function(id, key) {
        if (BOTS[id]) {
            return BOTS[id][key];
        } else return null;
    },

    setBotValue: function(id, key, value) {
        if (BOTS[id]) {
            BOTS[id][key] = value;
            return true;
        } else return null;
    },

    createBot: async function(id, name, desc) {
        const user = await DB.findUserById(id);
        if (config.VIP[user.vip].max_bot >= user.own_bots.length) return {
            status: false,
            data: "MAX_BOTS"
        }

        const char = /^[a-zA-Z0-9]+$/;
        if (!char.test(name)) return {
            status: false,
            data: "BAD_NAME"
        }

        if (await DB.findBotByName(name)) return {
            status: false,
            data: "BOTNAME_IN_USE"
        }

        const bot_id = uid.num(10);

        BOTS[bot_id] = {
            id: bot_id,
            name: name,
            link: config.URL + "/bot=" + bot_id,
            owner: id,
            pic: "",
            commands: [{ cmd: "/start", desc: "Iniciar el Bot" }],
            desc: (desc ? desc : "Un bot que no hace nada :( \nAun ;)"),
            token: uid.alphanum(32),
            members: [owner],
            groups: [],
            channels: [],
            creationDate : new Date().getTime(),
            lastBroadcast: (new Date().getTime() - (1000 * 60 * 60 * 6)),
            isOnline: false,
            lastTimeOnline: new Date().getTime(),
            stars: 0
        };

        USERS[id].own_bots.push(bot_id);
        USERS[id].bots.push(bot_id);

        return {
            status: true,
            data: BOTS[bot_id]
        };

    },
    
    startBotRoom : async function(user_id , bot_id){
        if(USERS[user_id].bots.includes(bot_id + "_" + user_id)) return {
            status : false,
            data : "ALREADY_IN_BOT"
        };
        
        if(!BOTS[bot_id]) return {
            status: false,
            data : "BOT_NOT_EXISTS"
        };
        
        
    }
};

module.exports = DB;
