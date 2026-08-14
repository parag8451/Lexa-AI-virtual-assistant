import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGO_URI;

if (!uri) {
  throw new Error("��� MONGO_URI is missing in .env file");
}

// Connection pooling configuration
const MONGO_OPTIONS: mongoose.ConnectOptions = {
  retryWrites: true,
  w: "majority",
  maxPoolSize: parseInt(process.env.MONGO_MAX_POOL_SIZE || '10', 10),
  minPoolSize: parseInt(process.env.MONGO_MIN_POOL_SIZE || '2', 10),
  maxIdleTimeMS: parseInt(process.env.MONGO_MAX_IDLE_TIME || '30000', 10),
  serverSelectionTimeoutMS: parseInt(process.env.MONGO_SERVER_SELECTION_TIMEOUT || '5000', 10),
  socketTimeoutMS: parseInt(process.env.MONGO_SOCKET_TIMEOUT || '45000', 10),
  family: 4, // Use IPv4, skip trying IPv6
  compressors: ['zlib'],
  zlibCompressionLevel: 6,
};

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    return mongoose.connection;
  }

  try {
    await mongoose.connect(uri, MONGO_OPTIONS);
    isConnected = true;
    
    mongoose.connection.on('connected', () => {
      console.log("���� Lexa DB connected successfully");
    });
    
    mongoose.connection.on('error', (err) => {
      console.error("���� MongoDB connection error:", err);
      isConnected = false;
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn("���� MongoDB disconnected");
      isConnected = false;
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      process.exit(0);
    });

    return mongoose.connection;
  } catch (error) {
    console.error("���� MongoDB connection failed:", error);
    process.exit(1);
  }
};

export { connectDB, isConnected };
export default connectDB;
