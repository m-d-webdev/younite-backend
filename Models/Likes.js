const mongoose = require("mongoose");



const likes_schema  = new mongoose.Schema({
    itemId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },

    collection_ref: {
        type: String,
        required: true
    },
    like_at: {
        type: Date,
        default: Date.now()
    }
});


module.exports = mongoose.model('Likes', likes_schema)