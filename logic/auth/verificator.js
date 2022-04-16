const config = require("../../config.js");
const uid = require(config.LOGIC + "/helpers/uid.js");
const auth = require("authenticator");
const nodemailer = require("nodemailer");

const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "fireshoot.dev@gmail.com",
        pass: "hnm4Pz9h"
    }
});

const verificator = async (req, res) => {
    let email;

    try {
        const body = req.email;
        email = (body.email ? body.email: undefined);
        let _token = uid.num(5);
        DB.addTokenPair(email , token)
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
        res.json({
            status : true,
            data : "MTOKEN_SENDED"
        });
    }catch(err) {}
}

module.exports = verificator;