import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGO_URI;

if (!uri) {
  throw new Error("❌ MONGO_URI is missing in .env file");
}

const connectDB = async () => {
  try {
    await mongoose.connect(uri, {
      retryWrites: true,
      w: "majority",
    });
    console.log("🟢 Lexa DB connected successfully");
    return mongoose.connection;
  } catch (error) {
    console.error("🔴 MongoDB connection failed:", error);
    process.exit(1);
  }
};

export default connectDB;
