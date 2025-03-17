const express = require("express")
const { Create_post, Get_posts, Get_More_posts } = require('../Controllers/post_controller');
const router = express.Router();
const { auth_token } = require('../config/middlewares');

// Need to add  midlware on this to posts
router.post('/', auth_token, Create_post);
router.get('/', Get_posts);
router.get('/getMore', Get_More_posts);

module.exports = router