import { Router } from "express";
import {
  addToWatchlist,
  removeFromWatchlist,
  getLogged,
  getWatchlist,
  getRecommendedMovies,
  updateProfile,
} from "../controllers/user.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticate);
router.post("/add-to-watchlist", addToWatchlist);
router.post("/remove-from-watchlist", removeFromWatchlist);
router.get("/get-logged", getLogged);
router.get("/get-watchlist", getWatchlist);
router.post("/recommended-movies", getRecommendedMovies);
router.put("/profile", updateProfile);

export default router;
