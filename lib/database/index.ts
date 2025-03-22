import mongoose from "mongoose";

// const MONGODB_URI = process.env.MONGODB_URI;

// let cached = (global as any).mongoose || { conn: null, promise: null };

// export const connectToDatabase = async () => {
//   if (cached.conn) return cached.conn;

//   if (!MONGODB_URI) {
//     throw new Error("MONGODB_URI is missing");
//   }

//   try {
//     cached.promise =
//       cached.promise ||
//       mongoose.connect(MONGODB_URI, {
//         dbName: "eventMasters", // Specify the database name explicitly
//         // useNewUrlParser: true,
//         //  useUnifiedTopology: true,
//         connectTimeoutMS: 10000, // Timeout after 10s if no response
//         serverSelectionTimeoutMS: 5000, // Fail fast if the server is unreachable
//       });

//     cached.conn = await cached.promise;

//     console.log("✅ Connected to MongoDB");
//     return cached.conn;
//   } catch (error) {
//     console.error("❌ MongoDB Connection Error:", error);
//     throw new Error("Failed to connect to MongoDB");
//   }
// };

export const connectToDatabase = async () => {
  if (mongoose.connections[0].readyState) return true;

  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    throw new Error("Failed to connect to MongoDB");
  }
};
