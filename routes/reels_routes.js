const express = require("express");
const {auth_token} = require('../config/middlewares')
const { Get_reels, Create_reel ,Get_More_reels } = require('../Controllers/reel_controler')
const router = express.Router()



router.post("/create", auth_token, Create_reel)
router.get('/', auth_token, Get_reels)
router.get('/getMore', auth_token, Get_More_reels)


module.exports = router