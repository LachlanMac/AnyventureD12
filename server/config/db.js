const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Default to localhost MongoDB for local development
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/starventuredb';
    
    const conn = await mongoose.connect(mongoURI, {
      // These options are no longer needed in newer mongoose versions but kept for compatibility
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;