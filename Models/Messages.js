const mongoose = require("mongoose");


const MessagesSchema = mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    recieverId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    createAt: {
        type: String,
        required: true
    },
    received: {
        type: Boolean,
        required: false
    },
    viewed: {
        type: Boolean,
        required: false
    },
    savedInDb: {
        type: Boolean,
        required: false
    },
});



module.exports = mongoose.model("Messages", MessagesSchema)