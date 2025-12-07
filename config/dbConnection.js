import mongoose from "mongoose";

const dbConnection = async (dbUrl) => {
  if (!dbUrl) {
    console.error("DB_URL not found in env");
    process.exit(1);
  }

  try {
    await mongoose.connect(dbUrl, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
};

export default dbConnection;
