const mongoose = require("mongoose");


const comments_schema = mongoose.Schema({
    authorId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    articleId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    collection_ref: {
        type: String,
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
    }
});



comments_schema.pre("findOneAndUpdate", (next) => {
    const u = this.getUpdate();
    if (u.$set) {
        this.$set.updatedAt = Date().now()
    }
    next()
})


module.exports = mongoose.model("Comments", comments_schema)