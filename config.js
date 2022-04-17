/* Base Config */
const config = { 
    URL: "https://xchat_server.glitch.me", 
    PORT: process.env.PORT || 8081, //port
    DIRNAME: __dirname, //root folder
    DB: __dirname + "/database", //database
    LOGIC: __dirname + "/logic", //logic 
    TOKEN: { 
        secret: "super_secret_token_keyword", 
        expire: "6h" 
    }, 
    SERVER: { version: "v0.0.1" },
    ROOMS_CONFIG : {
        chats_mem : 100,
        channels_mem : 250,
        bots_mem : 500,
        chat_mess_tol : 250,
        channels_mess_tol : 500,
        bots_mess_tol : 100
    }
 }; 
 
 module.exports = config;
