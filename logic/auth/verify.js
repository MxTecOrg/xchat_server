/**/
const config = require("../../config.js");
const DB = require(config.LOGIC + "/helpers/DB.js"):

const verify = async (req , res) => {
    if(!req.body.email || !req.body.token){
        return res.json({
            status : false,
            data : "WRONG_DATA"
        });
    }
  
    const pair = DB.getPairToken(req.body.email);
    if(pair != req.body.token){
        return res.json({
            status : false,
            data : "WRONG_TOKEN"
        });
    }
  
    const user = await DB.findUserByMail(req.body.email);
    DB.setUserValue(user.id , "verified" , true);
  
    res.json({
        status : true,
        data : "VERIFIED"
    });
};
