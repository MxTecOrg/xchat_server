const config = require("../../config.js");
const uid = require(config.LOGIC + "/helpers/uid.js");
const bcrypt = require("bcryptjs");
const DB = require(config.LOGIC + "/helpers/DB.js");

/* Funtion register
* @params req{ body : {username , email , password , rpassword , token}}
* @params res {}
*/

const register = async (req , res) => {
  
    let username,
    email,
    password,
    rpassword,
    token;
  
    try {
        const body = req.body;
        username = (body.username ? body.username : undefined);
        email = (body.email ? body.email : undefined);
        password = (body.password ? body.password : undefined);
        rpassword = (body.rpassword ? body.rpassword : undefined);
        token = (body.token ? body.token : undefined)
    } catch (err) {
        return res.json({
            status: false,
            data: "DATA_ERROR"
        });
    }
    const pair = DB.getTokenPair(email);
    if(!token){
        return res.json({
            status : false,
            data : "EMPTY_TOKEN"
        });
    }
    
    else if(!pair){
        return res.json({
            status : false,
            data : "TOKEN_TIMEOUT"
        });
    }
    
    else if(pair != token){
        return res.json({
            status: false,
            data: "WRONG_TOKEN"
        });
    }
  
    else if (!username) {
        return res.json({
            status: false,
            data: "EMPTY_USER"
        });
    }

    else if (!email) {
        return res.json({
            status: false, 
            data: "EMPTY_MAIL"
        });
    }

    else if (!password) {
        return res.json({
            status: false,
            data: "EMPTY_PASS"
        });
    }
  
    else if (!validateEmail(email)) {
        return res.json({
            status: false,
            data: "WRONG_MAIL"
        });
    }
  
    if(DB.findUserByName(username)) return res.json({ status : false , data : "ACC_USE"});
    if(DB.findUserByMail(email)) return res.json({ status: false , data : "MAIL_USE"});
    
    const char = /^[a-zA-Z0-9]+$/;
    if (!char.test(username)) {
        return res.json({
            status: false,
            data: "USERNAME_BAD_CHAR"
        });
    }
    
    if (password.length < 8) {
        return res.json({
            status: false,
            data: "PASS_LENGTH"
        });
    }

    if (password != rpassword) {
        return res.json({
            status: false,
            data: "PASS_MATCH"
        });
    }
  
    const account = {
        id: "",
        username: "",
        nickname: "",
        email: "",
        password: "",
        color : "",
        profile_pic : "",
        chats : [],
        banList : [],
        acceptInvitations: true,
        isOnline: false,
        lastTimeOnline: new Date().getTime(),
        suscribed: false,
        verified: false,
        acclevel: 1 //0 = baneado , 1 = usuario regular , 2 = maestro , 3 = moderador , 4 = admin
    };
    
    account.id = uid.num(8);
    account.username = username;
    account.color = "#000000".replace(/0/g,function(){return (~~((Math.random()*10) + 6)).toString(16);});
    account.nickname = "user_" + uid.alphanum(4);
    account.email = email;
    account.password = bcrypt.hashSync(password, 10);
  
    try {
        DB.addUser(account.id , account);

        return res.json({
            status: true,
            data: "REGISTERED"
        });
        
     }catch (err) {
        console.log(err);
        return res.json({
            status: false,
            data:
            "DATA_ERROR",
            error: err
        });

    }
}

const validateEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

module.exports = register;
