import mongoose from 'mongoose';

const newsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    type: {
      type: String,
      trim: true,
      default: 'News',
    },
    excerpt: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      trim: true,
      required: function requiredContent() {
        return !this.contentFileUrl;
      },
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    contentFileUrl: {
      type: String,
      trim: true,
    },
    contentFileName: {
      type: String,
      trim: true,
    },
    publishedAt: {
      type: Date,
      default: () => new Date(),
    },
  },
  {
    timestamps: true,
  }
);

newsSchema.index({ publishedAt: -1, createdAt: -1 });

const News = mongoose.model('News', newsSchema);

export default News;
