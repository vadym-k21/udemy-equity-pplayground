import mongoose from "mongoose";

async function connectDB() {
  try {
    await mongoose.connect("mongodb://root:root@localhost:27018/admin");
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    process.exit();
  }
}

export default connectDB;
