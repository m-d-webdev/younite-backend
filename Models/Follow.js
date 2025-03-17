const mongoose = require("mongoose");



const follow_schema = new mongoose.Schema({
    user_id: {
        type: mongoose.Types.ObjectId,
        required: true,
    },
    followers: {
        type: [mongoose.Types.ObjectId],
        default: []
    },
    following: {
        type: [mongoose.Types.ObjectId],
        default: []
    },
})

// follow_schema.pre('save', (req, res, next) => {
//     if (!this.isModified("following")) return next();
//     const following_user_id = this.following_user_id;
//     const userId = this.userId;

//     const response = await 


// })


module.exports = mongoose.model("Follow", follow_schema)