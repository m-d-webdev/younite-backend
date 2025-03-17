const express = require("express");
const m = require('mongoose')
const { _IMG_UPLOADER } = require("./file_uploads")
const User = require("../Models/Users");
const Likes = require("../Models/Likes");
const Follow = require('../Models/Follow');
const Moment = require('../Models/Moments')
const Posts = require("../Models/Posts")
const Reels = require("../Models/Reels");
const Blogs = require("../Models/Blogs");
// const MessagesModel = require('../Models/Messages')
// const { Put_notification } = require("./Notification_controller");
// const UserContacts = require("../Models/UserContacts");
// const NotificationModel = require("../Models/Notification")
// const { Add_message } = require("./Messages_controller");
const Comments = require("../Models/Comments");


const GetPersonalPosts = async (req, res) => {
    try {
        const { userId } = req.body;

        let PostsData = await Posts.find({ authorId: userId }).limit(5).sort({ createdAt: -1 });
        const user_info = await User.findOne(
            { _id: userId },
            {  FirstName: 1, LastName: 1, profile_img: 1 }
        );
        PostsData = await Promise.all(
            PostsData.map(async (p) => {
                const likes_count = await Likes.countDocuments({ itemId: p._id, collection_ref: "posts" });
                const comments_count = await Comments.countDocuments({ articleId: p._id, collection_ref: "posts" });
                return { ...p._doc, author: user_info, likes: likes_count, comments_count };
            })
        );
        return res.status(200).json(PostsData);
    } catch (error) {
        console.log(error);

        return res.status(400).send(error)
    }
}


const GetPersonalBlogs = async (req, res) => {
    try {
        const { userId } = req.body;

        let BlogsData = await Blogs.find({ author: userId }).limit(5).sort({ createAt: -1 });
        const user_info = await User.findOne(
            { _id: userId },
            {  FirstName: 1, LastName: 1, profile_img: 1 }
        );
        BlogsData = await Promise.all(
            BlogsData.map(async (p) => {
                const likes_count = await Likes.countDocuments({ itemId: p._id, collection_ref: "blogs" });
                const comments_count = await Comments.countDocuments({ articleId: p._id, collection_ref: "blogs" });
                return { ...p._doc, author: user_info, likes: likes_count, comments_count };
            })
        );
        return res.status(200).json(BlogsData);
    } catch (error) {
        console.log(error);

        return res.status(400).send(error)
    }
}



const GetPersonalReels = async (req, res) => {
    try {
        const { userId } = req.body;
        let ReelsData = await Reels.find({ authorId: userId }).limit(10).sort({ createAt: -1 });
        const user_info = await User.findOne(
            { _id: userId },
            {  FirstName: 1, LastName: 1, profile_img: 1 }
        );
        ReelsData = await Promise.all(
            ReelsData.map(async (p) => {
                const likes_count = await Likes.countDocuments({ itemId: p._id, collection_ref: "reels" });
                const comments_count = await Comments.countDocuments({ articleId: p._id, collection_ref: "reels" });
                return { ...p._doc, author: user_info, likes: likes_count, comments_count };
            })
        );
        return res.status(200).json(ReelsData);
    } catch (error) {
        console.log(error);

        return res.status(400).send(error)
    }
}




module.exports = {
    GetPersonalPosts,
    GetPersonalReels,
    GetPersonalBlogs
}