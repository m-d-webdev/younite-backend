const mongoose = require("mongoose")




const BlogSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    tags: {
        type: [String],
        required: false
    },
    createAt: {
        type: Date,
        default: Date.now
    }
},
    {
        timestamps: true,
    }
);

BlogSchema.index({ title: "text", content: "text" });
BlogSchema.index({ tags: 1 });
const blogsModel = mongoose.model("Blogs", BlogSchema)
const c = async () => {
    try {
        await blogsModel.createIndexes();
        console.log("Blogs : indexesx created ");
    } catch (error) {
        console.log("Failed to create indexes for blogs  ");
    }
}

c()
module.exports = blogsModel