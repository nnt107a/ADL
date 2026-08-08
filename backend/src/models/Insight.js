import mongoose from 'mongoose';

const insightSchema = new mongoose.Schema(
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
      default: 'Insight',
    },
    excerpt: {
      type: String,
      required: true,
      trim: true,
    },
    filters: {
      type: [String],
      default: [],
    },
    content: {
      type: String,
      trim: true,
      required: true,
    },
    translations: {
      type: {
        en: {
          title: { type: String, trim: true },
          excerpt: { type: String, trim: true },
          content: { type: String, trim: true },
        },
        vi: {
          title: { type: String, trim: true },
          excerpt: { type: String, trim: true },
          content: { type: String, trim: true },
        },
        cn: {
          title: { type: String, trim: true },
          excerpt: { type: String, trim: true },
          content: { type: String, trim: true },
        },
        _id: false,
      },
      default: () => ({}),
    },
    imageUrl: {
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

insightSchema.index({ publishedAt: -1, createdAt: -1 });

const Insight = mongoose.model('Insight', insightSchema);

export default Insight;
