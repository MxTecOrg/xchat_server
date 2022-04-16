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

    createP2PRoom: function (user , user2) {
        if (!USERS[user2] || USERS[user2].banList.includes(user)) return false;
        let Room = DB.getRoom(user + "-" + user2) || DB.getRoom(user2 + "-" + user);
        if (Room) return false;
        Room = user + "-" + user2;
        ROOMS[Room] = {
            id: Room,
            type: "private",
            secure: uid.alphanum(32),
            pinned: [],
            bgColor: "SYSTEM",
            textColor: "SYSTEM",
            messages: [{
                mess_id: uid.num(6),
                user_id: "SYSTEM",
                user_nick: "SYSTEM",
                user_color: "SYSTEM",
                chat_id: Room,
                type: "text",
                key: "",
                reply: "",
                isEdited: false,
                receivedBy: [],
                seenBy: [],
                message: "Se ha iniciado el chat privado seguro.",
                date: new Date()
            }]
        };
        return ROOMS[Room]
    },

    createRoom: function (id , owner , name , desc , pic , members , type) {
        let mem = [owner];
        for (let m of members) {
            if (USERS[m] && USERS[m].acceptInvitations) {
                mem.push(m);
            }
        }

        ROOMS[id] = {
            id: id,
            pic: (!pic ? "": pic),
            type: "group",
            gType: (type ? type: "public"),
            name: (name ? name: "group-" + uid.alphanum(5)),
            desc: (desc ? desc: "El admin es muy vago como para poner una descripción"),
            bgColor: "SYSTEM",
            textColor: "SYSTEM",
            owner: owner,
            admins: [],
            members: mem,
            banList : [],
            bots: [],
            pinned: [],
            messages: [{
                mess_id: uid.num(6),
                user_id: "SYSTEM",
                user_nick: "SYSTEM",
                user_color: "SYSTEM",
                chat_id: id,
                type: "text",
                key: "",
                reply: "",
                isEdited: false,
                receivedBy: [],
                seenBy: [],
                message: "Se ha creado la sala \"" + this.name + "\"",
                inline: [],
                keyboard: [],
                date: new Date()
            }]
        };

        return ROOMS[id].messages;
    },

    getRoom: function(id) {
        if (ROOMS[id]) return ROOMS[id];
        else return null;
    },

    getRoomMembs: function(id) {
        const r = this.getRoom(id);
        if (r && r.members) return r.members;
        else return null;
    },

    getRoomMess: function (id) {
        const r = this.getRoom(id);
        if (r && r.messages) return r.messages;
        else return null;
    },

    getRoomMessFrom: function (id , mess_id) {
        const r = this.getRoom(id);
        let mess = [];
        let found = false;
        if (r && r.messages) {
            for (let m of r.messages) {
                if(m.mess_id == mess_id) found = true;
                if (found) {
                    mess.push(m)
                }
            }
            if(found) return mess;
            else return null;
        } else return null;
    },
    
    getNewMess : function (id){
        const user = this.findUserById(id);
        
        if(user) {
            const rooms = user.rooms;
            let allMess = [];
            for(let r of rooms){
                const mess = this.getRoomMessFrom(r.id , r.lastMess);
                if(mess) allMess.push(mess);
            }
            return allMess;
        }else return null;
    }


};

module.exports = DB;