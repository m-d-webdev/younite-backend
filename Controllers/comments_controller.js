const mongoose = require('mongoose');

const User = require('../Models/Users');
const Likes = require("../Models/Likes")
const Comments = require("../Models/Comments");
const Replies = require("../Models/Replies");
const Moments = require('../Models/Moments');
const { Put_notification } = require('./Notification_controller');



const get_comments = async (req, res) => {
    try {
        const { articleId, collection_ref } = req.query
        let comments = await Comments.find({
            articleId,
            collection_ref,
        }).sort({ createAt: -1 }).limit(20)
        comments = await Promise.all(
            comments.map(async c => {
                const author = await User.findOne(
                    { _id: c.authorId },
                    { _id: 0, FirstName: 1, LastName: 1, profile_img: 1 }
                );
                const likes = await Likes.countDocuments({ itemId: c._id, collection_ref: "comments" })
                const replies_count = await Replies.countDocuments({ commentId: c._id });
                return { ...c._doc, author, likes, replies_count }
            })
        )
        res.status(200).json(comments);
    } catch (error) {
        console.log("Getting comments error =>", error.message);
        res.status(400).json({ message: "Failed to get  comments" })

    }
};

const add_comments = async (req, res) => {
    try {
        const { userId, ownerId, articleId, collection_ref, content } = req.body
        const comment = await Comments.create({
            authorId: userId,
            articleId,
            collection_ref,
            content
        });
        const user = await User.findOne({ _id: userId }, { _id: 0, FirstName: 1, LastName: 1, profile_img: 1 })
        if (ownerId != userId) {
            Put_notification(userId, [ownerId], 'comment', articleId, collection_ref)
        }
        return res.status(200).json({ ...comment._doc, author: user, likes: 0, replies_count: 0 });
    } catch (error) {
        console.log("Add comment error =>", error.message);
        res.status(400).json({ message: "Failed to store the comment" })

    }
};

module.exports = { add_comments, get_comments }