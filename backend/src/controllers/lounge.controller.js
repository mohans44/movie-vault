import Discussion from "../models/discussion.model.js";
import User from "../models/user.model.js";

const normalizeTags = (value) => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => String(item || "").trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 8);
};

export const listDiscussions = async (req, res) => {
  try {
    const query = String(req.query.q || "").trim();
    const sort = String(req.query.sort || "recent").trim().toLowerCase();
    const limit = Math.min(Math.max(Number(req.query.limit || 24), 1), 60);

    const filter = query
      ? {
          $or: [
            { title: { $regex: query, $options: "i" } },
            { cinema_name: { $regex: query, $options: "i" } },
            { body: { $regex: query, $options: "i" } },
          ],
        }
      : {};

    const sortQuery =
      sort === "popular"
        ? { comments_count: -1, created_at: -1 }
        : { created_at: -1 };

    const discussions = await Discussion.find(filter)
      .sort(sortQuery)
      .limit(limit)
      .select(
        "title cinema_name body tags created_by_username created_by_name participants comments_count created_at updated_at"
      )
      .lean();

    const sanitized = discussions.map((item) => ({
      ...item,
      body_preview:
        item.body.length > 240 ? `${item.body.slice(0, 240).trimEnd()}...` : item.body,
    }));

    return res.status(200).json({ discussions: sanitized });
  } catch (error) {
    return res.status(500).json({ error: "Failed to load discussions", details: error.message });
  }
};

export const getDiscussionById = async (req, res) => {
  try {
    const { discussionId } = req.params;
    const discussion = await Discussion.findById(discussionId).lean();
    if (!discussion) {
      return res.status(404).json({ error: "Discussion not found" });
    }
    return res.status(200).json({ discussion });
  } catch (error) {
    return res.status(500).json({ error: "Failed to load discussion", details: error.message });
  }
};

export const createDiscussion = async (req, res) => {
  try {
    const userId = req.user?.user_id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const author = await User.findById(userId).select("username name").lean();
    if (!author) return res.status(404).json({ error: "User not found" });

    const title = String(req.body.title || "").trim();
    const cinemaName = String(req.body.cinema_name || "").trim();
    const body = String(req.body.body || "").trim();
    const tags = normalizeTags(req.body.tags);

    if (!title || !cinemaName || !body) {
      return res.status(400).json({ error: "Title, cinema name, and body are required" });
    }

    const discussion = await Discussion.create({
      title,
      cinema_name: cinemaName,
      body,
      tags,
      created_by_user_id: userId,
      created_by_username: author.username,
      created_by_name: author.name || "",
      participants: [author.username],
      comments_count: 0,
      comments: [],
    });

    return res.status(201).json({ discussion });
  } catch (error) {
    return res.status(500).json({ error: "Failed to create discussion", details: error.message });
  }
};

export const addComment = async (req, res) => {
  try {
    const userId = req.user?.user_id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { discussionId } = req.params;
    const message = String(req.body.message || "").trim();
    const parentCommentId = req.body.parent_comment_id
      ? String(req.body.parent_comment_id).trim()
      : null;
    if (!message) return res.status(400).json({ error: "Comment message is required" });

    const author = await User.findById(userId).select("username name").lean();
    if (!author) return res.status(404).json({ error: "User not found" });

    const discussion = await Discussion.findById(discussionId);
    if (!discussion) return res.status(404).json({ error: "Discussion not found" });

    if (parentCommentId) {
      const parentExists = discussion.comments.some(
        (comment) => String(comment._id) === parentCommentId
      );
      if (!parentExists) {
        return res.status(400).json({ error: "Parent comment not found" });
      }
    }

    discussion.comments.push({
      author_username: author.username,
      author_name: author.name || "",
      parent_comment_id: parentCommentId,
      message,
    });
    discussion.comments_count = discussion.comments.length;
    if (!discussion.participants.includes(author.username)) {
      discussion.participants.push(author.username);
    }

    await discussion.save();
    return res.status(201).json({ discussion });
  } catch (error) {
    return res.status(500).json({ error: "Failed to add comment", details: error.message });
  }
};

export const deleteDiscussion = async (req, res) => {
  try {
    const userId = req.user?.user_id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { discussionId } = req.params;
    const discussion = await Discussion.findById(discussionId).select(
      "created_by_user_id created_by_username"
    );
    if (!discussion) return res.status(404).json({ error: "Discussion not found" });

    const requester = await User.findById(userId).select("username").lean();
    if (!requester) return res.status(404).json({ error: "User not found" });

    const isOwnerById = String(discussion.created_by_user_id) === String(userId);
    const isOwnerByUsername =
      requester.username && requester.username === discussion.created_by_username;

    if (!isOwnerById && !isOwnerByUsername) {
      return res.status(403).json({ error: "Only the creator can delete this discussion" });
    }

    await Discussion.findByIdAndDelete(discussionId);
    return res.status(200).json({ message: "Discussion deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete discussion", details: error.message });
  }
};
