const express = require('express');
const { auth_token } = require('../config/middlewares');
const {
    GetPersonalPosts,
    GetPersonalReels,
    GetPersonalBlogs
} = require('../Controllers/profile_controller');
const router = express.Router();


router.get('/GetPersonalPosts', auth_token, GetPersonalPosts);
router.get('/GetPersonalReels', auth_token, GetPersonalReels);
router.get('/GetPersonalBlogs', auth_token, GetPersonalBlogs);

module.exports = router
