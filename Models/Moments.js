const mongoose = require('mongoose');

const ReaplySchema = new mongoose.Schema({
    content: { type: String, required: true },
    authorId: { type: mongoose.Schema.Types.ObjectId, required: true },
    createAt: { type: Date, default: Date.now },
});


const moment_schema = mongoose.Schema({
    authorId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    style: {
        type: String,
        required: false
    },
    url: {
        type: String,
        required: false
    },
    content: {
        type: String,
        required: false
    },
    views: {
        type: [mongoose.Schema.Types.ObjectId]
    },
    replies: [ReaplySchema],
    createAt: {
        type: Date,
        default: Date.now
    }
})


module.exports = mongoose.model("moments", moment_schema)
