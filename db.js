const { MongoClient } = require("mongodb");

const uri = "mongodb://localhost:27017";
let db;
const connectDB = async () => {
  if (db) {
    return db;
  }
  try {
    const client = await MongoClient.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    db = client.db("EventDatabase");
    console.log("Connected to MongoDB");
    return db;
  } catch (error) {
    console.error("Error connecting to MongoDB", error);
    throw error;
  }
};

module.exports = connectDB;
