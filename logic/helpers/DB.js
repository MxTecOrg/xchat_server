/********************
* Database Manager  *
*********************/

const fs = require("fs");
const config = require("../../config.js");

var USERS = {} , BOTS = {} , CHANNELS = {} , TOKEN_PAIRS = {};

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
    
    loadAll: function() {
        this.loadUsers();
    },

    saveUsers: async function() {
        console.time("Users saved in:");
        for (let u in USERS) {
            await fs.writeFile(config.DB + "/users/" + u + ".json", JSON.stringify(USERS[u]), ()=> {});
        }
        console.timeEnd("Users saved in:");
        return true;
    },
    
    
    autoSave: function(time) {
        const su = this.saveUsers;
        async function s() {
            await su();
        }
        setInterval(s , time);
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
            switch(condition){
                case "==":
                    if(USERS[u][key] == value) f.push(USERS[u]);
                    return f;
                    break;
                case "!=":
                    if(USERS[u][key] != value) f.push(USERS[u]);
                    return f;
                    break;
                case "<":
                    if(USERS[u][key] < value) f.push(USERS[u]);
                    return f;
                    break;
                case ">":
                    if(USERS[u][key] > value) f.push(USERS[u]);
                    return f;
                    break;
                case "<=":
                    if(USERS[u][key] <= value) f.push(USERS[u]);
                    return f;
                    break;
                case ">=":
                    if(USERS[u][key] >= value) f.push(USERS[u]);
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
        if(USERS[id]){
            return USERS[id][key];
        }else return null;
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
    
    addTokenPair : function (token , _token){
        TOKEN_PAIRS[token] = _token;
    },
    
    getTokenPair: function (token){
        return TOKEN_PAIRS[token]
    },
    
    delTokenPair: function (token){
        delete TOKEN_PAIRS[token]
    }
};

module.exports = DB;
