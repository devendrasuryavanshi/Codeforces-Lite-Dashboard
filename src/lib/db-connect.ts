import mongoose from "mongoose";

const dbURL = process.env.ATLASDB_URL;

const connectDB = async () => {
    if (mongoose.connections[0].readyState) {
        return;
    }
    if (dbURL) {
        await mongoose.connect(dbURL);
    }

    console.log("MongoDB connected");
};

export default connectDB;