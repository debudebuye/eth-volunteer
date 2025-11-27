require('dotenv').config();
const mongoose = require('mongoose');

console.log('Testing new MongoDB connection...');

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected Successfully!');
    console.log('Database:', mongoose.connection.name);
    console.log('Host:', mongoose.connection.host);
    console.log('\n🎉 Your new secure cluster is working!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Failed:');
    console.error('Error:', err.message);
    process.exit(1);
  });
