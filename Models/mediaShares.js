const mongoose = require('mongoose');


const SchemaTable = new mongoose.Schema({
    senderId: {
        required: true,
        type: mongoose.Schema.Types.ObjectId
    },
    recieverId: {
        required: true,
        type: mongoose.Schema.Types.ObjectId
    },
    contentId: {
        required: true,
        type: mongoose.Schema.Types.ObjectId
    },
    type: {
        required: true,
        type: String
    },
    createAt: {
        type: Date,
        default: Date.now
    }
});
module.exports = mongoose.model("mediaShares",SchemaTable)