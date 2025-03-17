const mongoose = require("mongoose");
const Post = require('../Models/Posts');
const User = require('../Models/Users');
const Likes = require("../Models/Likes")
const Comments = require("../Models/Comments")
const { _IMG_UPLOADER } = require("./file_uploads");
const Create_post = async (req, res) => {
    try {
        const { content, userId, title } = req.body;
        const images = req.files != null ? req.files.images : [];
        if (!images && !content) return res.status(400).json({ message: "Can't post whitout content or  images " })

        let array_imgs = []
        if (Array.isArray(images)) {
            if (images.length > 0) {
                for await (const element of images) {
                    const url = await _IMG_UPLOADER(element);
                    array_imgs.push(url);
                }
            }
        } else {
            const url = await _IMG_UPLOADER(images);
            array_imgs.push(url);
        }

        const post_req = await Post.create({ title, content, image: array_imgs, authorId: userId });
        return res.status(200).json({
            message: "Posted success",
            ...post_req
        });
    } catch (error) {
        console.log(error.message);

        res.status(400).json({ message: "Failed to posts your post" + error.message })
    }
}

const Get_posts = async (req, res) => {
    try {
        let Posts = await Post.find().sort({ createdAt: -1 }).limit(5);

        Posts = await Promise.all(
            Posts.map(async (p) => {
                const user_info = await User.findOne(
                    { _id: p.authorId },
                    { _id: 0, FirstName: 1, LastName: 1, profile_img: 1 }
                );
                const likes_count = await Likes.countDocuments({ itemId: p._id, collection_ref: "posts" });
                const comments_count = await Comments.countDocuments({ articleId: p._id, collection_ref: "posts" });
                return { ...p._doc, author: user_info, likes: likes_count, comments_count };
            })
        );
        res.status(200).json({ posts: Posts });
    } catch (error) {
        console.log(error.message);
        res.status(400).json({ message: error.message });
    }

}

const Get_More_posts = async (req, res) => {
    try {

        const { ids } = req.query;
        let Posts = await Post.find({ _id: { $nin: ids } }).sort({ createdAt: -1 }).limit(5);

        Posts = await Promise.all(
            Posts.map(async (p) => {
                const user_info = await User.findOne(
                    { _id: p.authorId },
                    { _id: 0, FirstName: 1, LastName: 1, profile_img: 1 }
                );
                const likes_count = await Likes.countDocuments({ itemId: p._id, collection_ref: "posts" });
                const comments_count = await Comments.countDocuments({ articleId: p._id, collection_ref: "posts" });
                return { ...p._doc, author: user_info, likes: likes_count, comments_count };
            })
        );
        res.status(200).json({ posts: Posts });
    } catch (error) {
        console.log(error.message);
        res.status(400).json({ message: error.message });
    }

}





const Get_single_post = async (postId) => {
    return new Promise(
        async (resolve, reject) => {
            try {
                let p = await Post.findOne({ _id: postId });
                const user_info = await User.findOne(
                    { _id: p.authorId },
                    { FirstName: 1, LastName: 1, profile_img: 1 }
                );
                const likes_count = await Likes.countDocuments({ itemId: p._id, collection_ref: "posts" });
                const comments_count = await Comments.countDocuments({ articleId: p._id, collection_ref: "posts" });
                resolve({ ...p._doc, author: user_info, likes: likes_count, comments_count });
            } catch (error) {
                console.log('hey ', error);
                reject(error)
            }
        }
    )


}


const get_sp_user_posts = async (req, res) => {
    try {
        let { _id } = req.query;
        const lastIds = req.query.lastIds || [];

        let Posts = await Post.find({ authorId: _id, _id: { $nin: lastIds } }).sort({ createdAt: -1 }).limit(5)
        const user_info = await User.findOne(
            { _id },
            { _id: 0, FirstName: 1, LastName: 1, profile_img: 1 }
        );

        Posts = await Promise.all(
            Posts.map(async (p) => {
                const likes_count = await Likes.countDocuments({ itemId: p._id, collection_ref: "posts" });
                const comments_count = await Comments.countDocuments({ articleId: p._id, collection_ref: "posts" });
                return { ...p._doc, author: user_info, likes: likes_count, comments_count };
            })
        );

        return res.status(200).json({ Posts })

    } catch (error) {
        return res.status(400).send(error)
    }
}

module.exports = { Create_post, Get_posts, get_sp_user_posts, Get_single_post, Get_More_posts }