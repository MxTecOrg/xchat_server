/**/
const config = require("../../config.js");
const DB = require(config.LOGIC + "/helpers/DB.js");
const uid = require(config.LOGIC + "/helpers/uid.js");
const sendToken = require("./sendToken.js");

const resendToken = async (req , res) => {
    if(!req.body || !req.body.email) return res.json({
            status : false,
            data : "WRONG_DATA"
        });
    
    
    const email = req.body.email;
    const user = await DB.findUserByMail(email);
    if(!user) return res.json({
        status : false,
        data : "USER_NOT_FOUND"
    });
    
    await sendToken(email);
    
    res.json({
        status: true,
        data : "TOKEN_SENDED"
    });
    
}

module.exports = resendToken;