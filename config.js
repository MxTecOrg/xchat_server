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
    SERVER: { version: "v0.0.1" }
 }; 
 
 module.exports = config;
