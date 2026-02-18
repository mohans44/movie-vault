import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true, trim: true },
  mail: { type: String, required: true, unique: true, trim: true, lowercase: true },
  // Backward compatibility for older deployments that used "email" field/index.
  email: { type: String, unique: true, sparse: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  logged: { type: [String], default: [] },
  watchlist: { type: [String], default: [] },
  joined: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);

export default User;
