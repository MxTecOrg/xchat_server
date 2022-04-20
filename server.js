
/*****************
 * Server Config *
 *****************/
 
const config = require("./config.js");
const app = require("express")();
const server = require("http").Server(app);
const io = require("socket.io")(server , {
    cors : {
        origin : "*",
        method : ["POST" , "GET"]
    }
});
const router = require(config.LOGIC + "/router.js");
const cors = require("cors");
const bodyParser = require("body-parser");
const DB = require(config.LOGIC + "/helpers/DB.js");

app.use(cors());

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

/* Express router */
app.use("/", router);
// Wakeup route
app.post("/wakeup", (req, res) => {
    res.json({
        status: true
    });
});
//Error 404
app.use((req , res) => { 
    res.json({
    status: false, message: "ERROR 404"});
});

/* Loading all db data */
DB.loadAll();

server.listen(config.PORT , (log) => console.log("Server running on port:" + config.PORT));

/* Exporting and Importing socket.io methods */
module.exports = io;

require(config.LOGIC + "/socket.js");

/* Start saving db periodically */
DB.autoSave(60 * 1000);