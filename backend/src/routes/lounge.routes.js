import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import {
  addComment,
  createDiscussion,
  deleteDiscussion,
  getDiscussionById,
  listDiscussions,
} from "../controllers/lounge.controller.js";

const router = Router();

router.get("/discussions", listDiscussions);
router.get("/discussions/:discussionId", getDiscussionById);
router.post("/discussions", authenticate, createDiscussion);
router.post("/discussions/:discussionId/comments", authenticate, addComment);
router.delete("/discussions/:discussionId", authenticate, deleteDiscussion);

export default router;
