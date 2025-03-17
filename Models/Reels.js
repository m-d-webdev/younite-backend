const mongoose = require("mongoose");

const ReelSchema = new mongoose.Schema({
    url: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    authorId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    createAt: {
        type: Date,
        default: Date.now()
    }
});
ReelSchema.index({ description: "text" })

const ReelsModel = new mongoose.model("Reels", ReelSchema);
const exEn = async () => {
    try {
        await ReelsModel.createIndexes();
        console.log("Reels : indexes created success");

    } catch (error) {
        console.log('failed to create index for reels ');

    }
}
exEn()




module.exports = ReelsModel