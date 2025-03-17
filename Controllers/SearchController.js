const Users = require('../Models/Users');
const Posts = require('../Models/Posts');
const Blogs = require('../Models/Blogs');
const Reels = require('../Models/Reels');
const Comments = require('../Models/Comments');
const Likes = require('../Models/Likes');


const getSearch = async (req, res) => {
    try {
        const { q } = req.query
        const searchTerm = new RegExp(q, "i")
        //----------
        const usersRes = await Users.find({
            $or: [
                {
                    FirstName: { $regex: searchTerm },
                },
                {
                    LastName: { $regex: searchTerm },
                }
            ]
        }, { FirstName: 1, LastName: 1, profile_img: 1 });

        // -------------------
        let PostsRes = await Posts.find(
            { $text: { $search: q } },
            { score: { $meta: "textScore" } }
        ).sort({ score: { $meta: "textScore" } });

        let BlogsRes = await Blogs.find(
            { $text: { $search: q } },
            { score: { $meta: "textScore" } }
        ).sort({ score: { $meta: "textScore" } });

        let ReelsRes = await Reels.find(
            { $text: { $search: q } },
            { score: { $meta: "textScore" } }
        ).sort({ score: { $meta: "textScore" } });

        PostsRes = await Promise.all(
            PostsRes.map(async (p) => {
                const user_info = await Users.findOne(
                    { _id: p.authorId },
                    { _id: 0, FirstName: 1, LastName: 1, profile_img: 1 }
                );
                const likes_count = await Likes.countDocuments({ itemId: p._id, collection_ref: "posts" });
                const comments_count = await Comments.countDocuments({ articleId: p._id, collection_ref: "posts" });
                return { ...p._doc, author: user_info, likes: likes_count, comments_count };
            })
        );
        // 
        BlogsRes = await Promise.all(
            BlogsRes.map(async b => {
                const author = await Users.findOne({ _id: b.author });
                const likes_count = await Likes.countDocuments({ itemId: b._id, collection_ref: "blogs" });
                const comments_count = await Comments.countDocuments({ articleId: b._id, collection_ref: "blogs" });
                return { ...b._doc, author, likes: likes_count, comments_count }
            })
        );

        ReelsRes = await Promise.all(
            ReelsRes.map(async (r) => {
                const user = await Users.findOne({ _id: r.authorId }, { _id: 0, FirstName: 1, LastName: 1, profile_img: 1 })
                const likes_count = await Likes.countDocuments({ itemId: r._id, collection_ref: "reels" });
                const comments_count = await Comments.countDocuments({ articleId: r._id, collection_ref: "reels" });
                return { ...r._doc, author: user, likes: likes_count, comments_count };
            })
        )

        return res.status(200).json({ users: usersRes, posts: PostsRes, blogs: BlogsRes, reels: ReelsRes })

    } catch (error) {
        console.log(error);

        return res.status(400).send("error")
    }
}

module.exports = {
    getSearch,
}