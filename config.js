/* Base Config */
const config = {
    URL: "https://mxtec-org-xchat.glitch.me",
    PORT: process.env.PORT || 8081, //port
    DIRNAME: __dirname, //root folder
    DB: __dirname + "/database", //database
    LOGIC: __dirname + "/logic", //logic 
    WEBCLI: __dirname + "/webclient",
    TOKEN: {
        secret: "super_secret_token_keyword",
        expire: "365d"
    },
    SERVER: { version: "v0.0.1" },
    ROOMS_CONFIG: {
        chats_mem: 100,
        channels_mem: 250,
        bots_mem: 500,
        chat_mess_tol: 250,
        channels_mess_tol: 500,
        bots_mess_tol: 100
    },
    VIP: {
        "basic": {
            max_own_bots: 1,
            max_own_channels: 1,
            max_own_groups: 2,
            max_bots: 10,
            max_channels: 10,
            max_groups: 10,
            price: 0
        },
        "bronce": {
            max_own_bots: 2,
            max_own_channels: 2,
            max_own_groups: 4,
            max_bots: 15,
            max_channels: 15,
            max_groups: 15,
            price: 25 //mn
        },
        "silver": {
            max_own_bots: 5,
            max_own_channels: 5,
            max_own_groups: 10,
            max_bots: 20,
            max_channels: 20,
            max_groups: 20,
            price: 50 //mn
        },
        "gold": {
            max_own_bots: 10,
            max_own_channels: 10,
            max_own_groups: 25,
            max_bots: 50,
            max_channels: 50,
            max_groups: 50,
            price: 75 //mn
        },
    }
};

module.exports = config;
