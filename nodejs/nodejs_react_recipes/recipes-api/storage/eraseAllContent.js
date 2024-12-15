import mongoose from 'mongoose';

// Function to reset all collections in the database
export async function resetDatabase() {
  try {
    const collections = Object.keys(mongoose.connection.collections);
    for (const collectionName of collections) {
      const collection = mongoose.connection.collections[collectionName];
      await collection.deleteMany(); // Clear all documents
    }
    console.log('Database reset successfully');
  } catch (error) {
    console.error('Error resetting database:', error);
  }
}

// Function to drop the entire database
export async function dropDatabase() {
  try {
    await mongoose.connection.db.dropDatabase();
    console.log('Database dropped successfully');
  } catch (error) {
    console.error('Error dropping database:', error);
  }
}

// Example usage (Uncomment for standalone execution)
(async () => {
  await mongoose.connect('mongodb://localhost:27017/recipes', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  console.log('Connected to MongoDB');
  await dropDatabase(); // or dropDatabase()
  process.exit(0); // Exit the process
})();
