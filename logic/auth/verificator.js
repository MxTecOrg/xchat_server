        const nodemailer = require("nodemailer");
        const transport = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "fireshoot.dev@gmail.com",
                pass: "hnm4Pz9h"
            }
        });

        const message = {
            from: "Infinity-Dungeon Team.",
            to: email,
            subject: "Verificación de Cuenta.",
            text:
            "Para verificar su cuenta siga el siguiente link:\n" +
            config.URL +
            "/auth/verify/" +
            account.id
        };

        transport.sendMail(message, function(err, info) {
            if (err) {} else {}
        });
