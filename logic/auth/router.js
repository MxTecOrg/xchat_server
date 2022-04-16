const router = require("express").Router();
const login = require("./login.js"); 
const register = require("./register.js");
const verify = require("./verificator");

router.post("/login" , (req , res) => login(req, res));
router.post("/register" , (req , res) => register(req , res));
router.post("/verify" , (req , res) => verify(req , res));

module.exports = router;
