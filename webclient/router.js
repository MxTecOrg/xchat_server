const router = require("express").Router();

/*base muestra */
router.get("/index", (req , res) =>{
    res.send("./index.html");
});

module.exports = router;