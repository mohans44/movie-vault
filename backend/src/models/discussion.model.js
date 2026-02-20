import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    author_username: { type: String, required: true, trim: true },
    author_name: { type: String, trim: true, default: "" },
    parent_comment_id: { type: String, default: null },
    message: { type: String, required: true, trim: true, maxlength: 1500 },
  },
  { _id: true, timestamps: { createdAt: "created_at", updatedAt: false } }
);

const discussionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 140 },
    cinema_name: { type: String, required: true, trim: true, maxlength: 120 },
    body: { type: String, required: true, trim: true, maxlength: 3000 },
    tags: { type: [String], default: [] },
    created_by_user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    created_by_username: { type: String, required: true, trim: true },
    created_by_name: { type: String, trim: true, default: "" },
    participants: { type: [String], default: [] },
    comments_count: { type: Number, default: 0 },
    comments: { type: [commentSchema], default: [] },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

discussionSchema.index({ created_at: -1 });
discussionSchema.index({ comments_count: -1 });
discussionSchema.index({ title: "text", body: "text", cinema_name: "text" });

const Discussion = mongoose.model("Discussion", discussionSchema);

export default Discussion;
