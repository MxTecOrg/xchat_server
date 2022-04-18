const config = require("../../config.js");
const DB = require(config.LOGIC + "/helpers/DB.js");
const authenticator = require("./authenticator.js");
const bcrypt = require("bcryptjs");

/* function login
* @Method : POST
* @param req {body : {username , password , app_token}}
* @param res {}
*/

const login = async (req, res) => {
    if (!req.body) return res.json({status : false , data : "NO_DATA"});
    let username,
    password;
    try {
        const body = req.body;
        username = body.username;
        password = body.password;
    } catch (err) {
        return res.json({
            status: false,
            data: "DATA_ERROR",
            error: err
        });
    }

    const account = await DB.findUserByName(username);

    if (!account) {
        return res.json({
            status: false,
            data: "WRONG_USER"
        });
    }
    
    if(!account.verified){
        return res.json({
            status : false,
            data : "ACC_NOT_VERIFIED"
        });
    }


    if (!bcrypt.compareSync(password, account.password)) {
        return res.json({
            status: false,
            data: "WRONG_USER"
        });
    }

    if (account.id == null || account.id == undefined) {
        return res.json({
            status: false,
            data: "ACC_ERROR"
        });
    }
    return res.json({
        status: true,
        data: authenticator.generate(account.id)
    });
}

module.exports = login;
