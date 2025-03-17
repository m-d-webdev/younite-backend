const moogoose = require("mongoose");
const Reel = require('../Models/Reels');
const User = require('../Models/Users');
const path = require('path');
const Likes = require("../Models/Likes")
const Comments = require("../Models/Comments")

const { _REEL_UPLOADER } = require("./file_uploads");
const Create_reel = async (req, res) => {
    try {
        const { userId, description } = req.body
        const url = await _REEL_UPLOADER(req.files.video)

        const reel = await Reel.create({
            authorId: userId,
            description,
            url: url
        });

        return res.status(200).json({ message: "Uploaded succesfully", reel: reel })

    } catch (error) {
        console.log("Error => ", error.message);
        return res.status(400).json({ messge: `faield to create reel ${error.message}` })
    }
}


const Get_reels = async (req, res) => {
    try {
        let reels_data = await Reel.find().limit(5).sort({ createAt: -1 })
        reels_data = await Promise.all(
            reels_data.map(async (r) => {
                const user = await User.findOne({ _id: r.authorId }, { _id: 0, FirstName: 1, LastName: 1, profile_img: 1 })
                const likes_count = await Likes.countDocuments({ itemId: r._id, collection_ref: "reels" });
                const comments_count = await Comments.countDocuments({ articleId: r._id, collection_ref: "reels" });


                return { ...r._doc, author: user, likes: likes_count, comments_count }
            })
        )
        return res.status(200).json({ message: "Done", reels: reels_data })
    } catch (error) {
        return res.status(400).json({ messge: `faield to get reels from the db ${error.message}` })
    }
}

const Get_More_reels = async (req, res) => {
    try {

        const { ids } = req.query;
        let reels_data = await Reel.find({ _id: { $nin: ids } }).sort({ createAt: -1 }).limit(5);

        reels_data = await Promise.all(
            reels_data.map(async (r) => {
                const user = await User.findOne({ _id: r.authorId }, { _id: 0, FirstName: 1, LastName: 1, profile_img: 1 })
                const likes_count = await Likes.countDocuments({ itemId: r._id, collection_ref: "reels" });
                const comments_count = await Comments.countDocuments({ articleId: r._id, collection_ref: "reels" });


                return { ...r._doc, author: user, likes: likes_count, comments_count }
            })
        )
        return res.status(200).json({ message: "Done", reels: reels_data })
    } catch (error) {
        return res.status(400).json({ messge: `faield to get reels from the db ${error.message}` })
    }
}

const Get_single_reel = async (reelId) => {
    return new Promise(
        async (resolve, reject) => {
            try {
                let p = await Reel.findOne({ _id: reelId });
                const user_info = await User.findOne(
                    { _id: p.authorId },
                    { _id: 0, FirstName: 1, LastName: 1, profile_img: 1 }
                );
                const likes_count = await Likes.countDocuments({ itemId: p._id, collection_ref: "reels" });
                const comments_count = await Comments.countDocuments({ articleId: p._id, collection_ref: "reels" });
                resolve({ ...p._doc, author: user_info, likes: likes_count, comments_count });
            } catch (error) {
                console.log(error.message);
                reject(error)
            }
        }
    )


}


const get_sp_friend_reels = async (req, res) => {
    try {
        let { _id } = req.query;
        const lastIds = req.query.lastIds || [];
        let Reels = await Reel.find({ authorId: _id, _id: { $nin: lastIds } }).sort({ createAt: -1 }).limit(8)
        const user_info = await User.findOne(
            { _id },
            { _id: 0, FirstName: 1, LastName: 1, profile_img: 1 }
        );

        Reels = await Promise.all(
            Reels.map(async (p) => {
                const likes_count = await Likes.countDocuments({ itemId: p._id, collection_ref: "reels" });
                const comments_count = await Comments.countDocuments({ articleId: p._id, collection_ref: "reels" });
                return { ...p._doc, author: user_info, likes: likes_count, comments_count };
            })
        );

        return res.status(200).json({ Reels })
    } catch (error) {
        return res.status(400).send(error)
    }
}

module.exports = { Get_reels, Create_reel, get_sp_friend_reels, Get_single_reel, Get_More_reels }