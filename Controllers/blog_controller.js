const mongoose = require("mongoose")
const Blog = require('../Models/Blogs');
const User = require('../Models/Users');
const Likes = require("../Models/Likes")
const Comments = require("../Models/Comments");

const Get_Blogs = async (req, res) => {
    try {
        let blogs_data = await Blog.find().sort({ createAt: -1 }).limit(5)
        blogs_data = await Promise.all(
            blogs_data.map(async b => {
                const author = await User.findOne({ _id: b.author });
                const likes_count = await Likes.countDocuments({ itemId: b._id, collection_ref: "blogs" });
                const comments_count = await Comments.countDocuments({ articleId: b._id, collection_ref: "blogs" });

                return { ...b._doc, author, likes: likes_count, comments_count }
            })
        );
        res.status(200).json({ blogs: blogs_data });
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
};

const getMore_blogs = async (req, res) => {
    try {
        const { ids } = req.query;
        let blogs_data = await Blog.find({ _id: { $nin: ids } }).sort({ createdAt: -1 }).limit(5);
        blogs_data = await Promise.all(
            blogs_data.map(async b => {
                const author = await User.findOne({ _id: b.author });
                const likes_count = await Likes.countDocuments({ itemId: b._id, collection_ref: "blogs" });
                const comments_count = await Comments.countDocuments({ articleId: b._id, collection_ref: "blogs" });

                return { ...b._doc, author, likes: likes_count, comments_count }
            })
        );
        res.status(200).json({ blogs: blogs_data });
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
};


const Create_Blog = async (req, res) => {
    try {

        const { title, content, userId } = req.body;

        const is_created = await Blog.create({ title, content, author: userId, tags: [] })
        if (is_created) {
            return res.status(200).json({ message: "Done", blog: is_created })
        } else {
            return res.status(400).json({ message: error.message })
        }

    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}


const Get_single_blog = async (blogId) => {
    return new Promise(
        async (resolve, reject) => {
            try {
                let p = await Blog.findOne({ _id: blogId });
                const user_info = await User.findOne(
                    { _id: p.author },
                    { FirstName: 1, LastName: 1, profile_img: 1 }
                );
                const likes_count = await Likes.countDocuments({ itemId: p._id, collection_ref: "blogs" });
                const comments_count = await Comments.countDocuments({ articleId: p._id, collection_ref: "blogs" });
                resolve({ ...p._doc, author: user_info, likes: likes_count, comments_count });
            } catch (error) {
                console.log(error.message);
                reject(error)
            }
        }
    )


}


const get_sp_friend_blogs = async (req, res) => {
    try {
        let { _id } = req.query;
        const lastIds = req.query.lastIds || [];
        console.log('we get this from front blogs  =>', lastIds);
        let Blogs = await Blog.find({ author: _id, _id: { $nin: lastIds } }).sort({ createAt: -1 }).limit(5)

        const user_info = await User.findOne(
            { _id },
            { FirstName: 1, LastName: 1, profile_img: 1 }
        );

        Blogs = await Promise.all(
            Blogs.map(async (p) => {
                const likes_count = await Likes.countDocuments({ itemId: p._id, collection_ref: "blogs" });
                const comments_count = await Comments.countDocuments({ articleId: p._id, collection_ref: "blogs" });
                return { ...p._doc, author: user_info, likes: likes_count, comments_count };
            })
        );

        return res.status(200).json({ Blogs })

    } catch (error) {
        return res.status(400).send(error)
    }
}


module.exports = { Get_Blogs, Create_Blog, get_sp_friend_blogs, Get_single_blog, getMore_blogs }