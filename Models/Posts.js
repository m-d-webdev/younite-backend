const mongoose = require("mongoose")

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: false,
      trim: true,
    },
    content: {
      type: String,
      required: false,
    },
    image: {
      type: [String],
      default: [],
      required: false,
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users',
      required: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    likes: {
      type: Number,
      default: 0,
    },

    views: {
      type: Number,
      default: 0,
    },

    categories: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);



postSchema.index({ title: 'text', content: 'text' });
postSchema.index({ authorId: 1 });
postSchema.index({ tags: 1 });
postSchema.index({ categories: 1 });


const Posts = mongoose.model('Posts', postSchema);


async function createIndex() {
  await Posts.createIndexes();
  console.log("Posts : Indexes created successfully!");
}


createIndex();


module.exports = Posts
