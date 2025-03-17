const express = require('express');
const  {auth_token}  = require("../config/middlewares")
const { Get_Blogs, Create_Blog ,getMore_blogs} = require('../Controllers/blog_controller')


const router = express.Router();

router.get('/', auth_token, Get_Blogs)
router.post('/', auth_token, Create_Blog)
router.get('/getMore', auth_token, getMore_blogs)


module.exports = router

