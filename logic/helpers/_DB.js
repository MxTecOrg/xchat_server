const config = require("../../config.js");
const { Sequelize, Model, DataTypes } = require("sequelize");
const UserModel = require("./models/user.js");

/**********************
 * Iniciando Conexion *
 **********************/
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: config.DB + '/database.sqlite'
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
    getData(){
        const rows = ["user_id" , "username" , "nickname" , "email" , "password" , "color" , "desc" , "pic" , "rooms" , "bots" , "channels" , "own_rooms" , "own_bots" , "own_channels" , "banList" , "contacts" , "statuses" , "xcoins" , "acceptInvitations" , "isOnline" , "lastTimeOnline" , "verified" , "vip" , "acclevel" ];
        let ret = {};
        for(let row of rows){
            if(this[row]){
                try{
                    ret[row] = JSON.parse(this[row]);
                }catch(err){
                    ret[row] = this[row];
                }
            }
        }
        return ret;
    }
    
    async setData(obj){
        let parsedObj = {};
        for(let o in obj){
            if(!this[o]) continue;
            parsedObj[o] = (typeof(obj) === "object" ? JSON.stringify(obj[o]) : obj[o]);
        }
        try{
            await this.update(parsedObj);
            return true;
        }catch(err){
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


module.exports = {
    User
}