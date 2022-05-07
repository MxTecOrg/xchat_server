const config = require("../../config.js");
const { Sequelize, Model, DataTypes, Op } = require("sequelize");
const UserModel = require("./models/user.js");
const RoomModel = require("./models/room.js");
const MessageModel = require("./models/message.js");

/**********************
 * Iniciando Conexion *
 **********************/
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: config.DB + '/database.sqlite',
    loggin: false
});

(async () => {
    try {
        sequelize.authenticate();
    } catch (err) {
        throw new Error("" + err)
    }
})();

/*********************
 * Modelo de Usuario *
 *********************/
class User extends Model {
    getData() {
        const rows = ["user_id", "nickname", "color", "desc", "pic", "rooms", "bots", "channels", "own_rooms", "own_bots", "own_channels", "banList", "contacts", "statuses", "xcoins", "isOnline", "lastTimeOnline", "vip"];
        let ret = {};
        for (let row of rows) {
            if (this[row]) {
                try {
                    ret[row] = JSON.parse(this[row]);
                } catch (err) {
                    ret[row] = this[row];
                }
            }
        }
        return ret;
    }

    async setData(obj) {
        let parsedObj = {};
        for (let o in obj) {
            if (!this[o]) continue;
            parsedObj[o] = (typeof(obj) === "object" ? JSON.stringify(obj[o]) : obj[o]);
        }
        try {
            await this.update(parsedObj , {
                where : {
                    user_id : this.user_id
                }
            });
            return true;
        } catch (err) {
            console.err(err);
            return false;
        }
    }
}

User.init(
    UserModel(DataTypes),
    {
        sequelize
    }
);

(async () => {
    await User.sync();
})();

/*******************
 * Modelo de Rooms *
 *******************/

class Room extends Model {
    getData() {
        const rows = ["chat_id", "type", "pic", "gType", "link", "name", "desc", "bgColor", "textColor", "owner", "admins", "members", "banList", "bots", "pinned"];

        let ret = {};
        for (let row of rows) {
            if (this[row]) {
                try {
                    ret[row] = JSON.parse(this[row]);
                } catch (err) {
                    ret[row] = this[row];
                }
            }
        }
        return ret;
    }

    async setData(obj) {
        let parsedObj = {};
        for (let o in obj) {
            if (!this[o]) continue;
            parsedObj[o] = (typeof(obj) === "object" ? JSON.stringify(obj[o]) : obj[o]);
        }
        try {
            await this.update(parsedObj , {
                where: {
                    chat_id : this.chat_id
                }
            });
            return true;
        } catch (err) {
            console.log(err);
            return false;
        }
    }
}

Room.init(
    RoomModel(DataTypes),
    {
        sequelize
    }
);

(async () => {
    await Room.sync();
})();

/***********************
 * Modelo de Mensajes *
 **********************/

class Message extends Model {
    getData() {
        const rows = ["mess_id", "user_id", "user_nick", "user_color", "chat_id", "type", "reply", "shared", "isEdited", "isBot", "receivedBy", "seenBy","message","inline","keyboard","date"];
        let ret = {};
        for (let row of rows) {
            if (this[row]) {
                try {
                    ret[row] = JSON.parse(this[row]);
                } catch (err) {
                    ret[row] = this[row];
                }
            }
        }
        return ret;
    }

    async setData(obj) {
        let parsedObj = {};
        for (let o in obj) {
            if (this[o] == null) continue;
            parsedObj[o] = (typeof(obj) == "object" ? JSON.stringify(obj[o]) : obj[o]);
        }
        try {
            await this.update(parsedObj);
            return true;
        } catch (err) {
            console.log(err);
            return false;
        }
    }
}

Message.init(
    MessageModel(DataTypes),
    {
        sequelize
    }
);


(async () => {
    await Message.sync();
})();


module.exports = {
    User,
    Room,
    Message,
    Op
}
