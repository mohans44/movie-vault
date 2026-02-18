import { isDatabaseReady } from "../config/db.js";

export const requireDatabase = (req, res, next) => {
  if (isDatabaseReady()) {
    return next();
  }

  return res.status(503).json({
    error: "Database unavailable. Please ensure MongoDB is running.",
  });
};

