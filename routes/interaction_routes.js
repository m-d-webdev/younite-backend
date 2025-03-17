const express = require('express');
const { auth_token } = require("../config/middlewares")
const { add_like, dis_like } = require('../Controllers/like_controller')
const { add_comments, get_comments } = require("../Controllers/comments_controller")
const { add_reply, get_replies } = require("../Controllers/replies_controller");
const { filter_notification, describNotification } = require('../Controllers/Notification_controller');
const router = express.Router();

router.post("/add_like", auth_token, add_like);
router.post("/dislike", auth_token, dis_like);
// ------------
router.post("/add_comment", auth_token, add_comments);
router.get("/get_article_comments", auth_token, get_comments);
// ------------
router.get("/get_comment_replies", auth_token, get_replies);
router.post("/add_replay", auth_token, add_reply);
router.get("/get_new_notifications", auth_token, filter_notification);
router.get("/describNotification", auth_token, describNotification);

module.exports = router