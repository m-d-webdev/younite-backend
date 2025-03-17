const mongoose = require('mongoose');

const User = require('../Models/Users');
const Likes = require("../Models/Likes")
const Comments = require("../Models/Comments");
const Replies = require("../Models/Replies");
const { Put_notification } = require('./Notification_controller');



const get_replies = async (req, res) => {
    try {
        const { commentId } = req.query
        let replies = await Replies.find({ commentId }).sort({ createAt: -1 });

        replies = await Promise.all(
            replies.map(async c => {
                const author = await User.findOne(
                    { _id: c.authorId },
                    { _id: 0, FirstName: 1, LastName: 1, profile_img: 1 }
                );
                const likes = await Likes.countDocuments({ itemId: c._id, collection_ref: "replies" })
                return { ...c._doc, author, likes }
            })
        )
        res.status(200).json(replies);
    } catch (error) {
        console.log("Getting replies error =>", error.message);
        res.status(400).json({ message: "Failed to get  comments" })

    }
};

const add_reply = async (req, res) => {
    try {
        const { userId, commentId, content } = req.body
        const comment = await Replies.create({
            authorId: userId,
            commentId,
            content
        });
        const user = await User.findOne({ _id: userId }, { _id: 0, FirstName: 1, LastName: 1, profile_img: 1 })
        const OnwerCommentId = await Comments.findOne({ _id: commentId }, { authorId: 1 })
        if (OnwerCommentId.authorId != userId) {
            Put_notification(userId, [OnwerCommentId.authorId], 'replay', comment._id, "replay",)
        }
        return res.status(200).json({ ...comment._doc, author: user, likes: 0 });

    } catch (error) {
        console.log("Add replies error =>", error.message);
        res.status(400).json({ message: "Failed to store the reply" + error.message })

    }
};


module.exports = { add_reply, get_replies }