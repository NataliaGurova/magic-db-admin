
import mongoose from "mongoose";

let isConnected = false;

export async function connectDB(): Promise<void> {
  if (isConnected) return;

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("❌ Missing MONGODB_URI in .env.local");

  try {
    await mongoose.connect(uri, {
      dbName: process.env.MONGODB_DB || "magicdb",
    });
    isConnected = true;
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    throw error;
  }
}







// import mongoose from "mongoose";

// const MONGODB_URI = process.env.MONGODB_URI as string;

// if (!MONGODB_URI) {
//   throw new Error("⚠️ Please define MONGODB_URI in .env.local");
// }

// export async function connectDB() {
//   if (mongoose.connection.readyState >= 1) return;
//   await mongoose.connect(MONGODB_URI);
//   console.log("✅ MongoDB connected");
// }

