const mongoose = require("mongoose");


const replies_schma = mongoose.Schema({
    commentId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    authorId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    createAt: {
        type: Date,
        default: Date.now()
    },
    updatedAt: {
        type: Date,
    },
})


replies_schma.pre("findAndUpdate", (next) => {
    const u = this.getUpdate();
    if (u.$set) {
        this.$set.updatedAt = Date.now();
    }
})


module.exports = mongoose.model("Replies", replies_schma)