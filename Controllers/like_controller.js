const {auth_token} = require("../config/middlewares");
const Like = require("../Models/Likes");
const { Put_notification } = require("./Notification_controller");



const add_like = async (req, res) => {
    try {
        const { userId, ownerId, collection_ref, itemId } = req.body
        const like_ = await Like.create({ userId, collection_ref, itemId });
        if (userId != ownerId) {
            Put_notification(userId, [ownerId], 'like', itemId, collection_ref);
        }
        return res.status(200).json(like_);
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
};

const dis_like = async (req, res) => {
    try {
        const { _id } = req.body
        const dislike_ = await Like.deleteOne({ _id })
        res.status(200).json(dislike_)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
};


module.exports = { add_like, dis_like }