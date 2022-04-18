const config = require("../../config.js");
const uid = require(config.LOGIC + "/helpers/uid.js");
const auth = require("./authenticator.js");
const DB = require(config.LOGIC + "/helpers/DB.js");
const nodemailer = require("nodemailer");

const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "fireshoot.dev@gmail.com",
        pass: "hnm4Pz9h"
    }
});

const sendToken = async (email) => {

    try {
        if(!email) return;
        let _token = uid.num(5);
        DB.addTokenPair(email , _token)
        const message = {
            from: "XChat Team.",
            to: email,
            subject: "Verificación de Cuenta.",
            text:
            "Su token de verificacion de cuenta es : \n" +
            _token + "\nEste token solo sera valido por 5 minutos."
        };
        
        setTimeout(function() {
            DB.delTokenPair(email);
        }, 5 * 60 * 1000);

        await transport.sendMail(message, function(err, info) {
            if (err) {} else {}
        });
        return true;
    }catch(err) {}
}

module.exports = sendToken;