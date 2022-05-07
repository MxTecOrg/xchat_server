/**/
const config = require("../../config.js");
const DB = require(config.LOGIC + "/helpers/DB.js");
const { User } = require(config.LOGIC + "/helpers/_DB.js");

const verify = async (req, res) => {
    if (!req.body || !req.body.email || !req.body.token) {
        return res.json({
            status: false,
            data: "WRONG_DATA"
        });
    }

    const pair = await DB.getTokenPair(req.body.email);
    if (pair != req.body.token) {
        return res.json({
            status: false,
            data: "WRONG_TOKEN"
        });
    }

    const user = await User.findOne({
        where: {
            email: req.body.email
        }
    });
    if (!user) {
        return res.json({
            status: false,
            data: "USER_NOT_FOUND"
        });
    }
    try {
        await user.setData({
            verified: true
        });
    } catch (err) {
        return res.json({
            status: false,
            data: "UNEXPECTED_ERROR"
        });
    }

    res.json({
        status: true,
        data: "VERIFIED"
    });
};

module.exports = verify;
