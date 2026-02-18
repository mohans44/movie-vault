import mongoose from "mongoose";

let isConnecting = false;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1 || isConnecting) {
    return mongoose.connection.readyState === 1;
  }

  try {
    isConnecting = true;
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 4000,
      family: 4,
    });
    console.log("MongoDB connected");
    return true;
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    return false;
  } finally {
    isConnecting = false;
  }
};

export const isDatabaseReady = () => mongoose.connection.readyState === 1;

export default connectDB;
