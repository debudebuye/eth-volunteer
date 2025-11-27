// Quick MongoDB Connection Test
require('dotenv').config();
const mongoose = require('mongoose');

console.log('Testing MongoDB Connection...');
console.log('URI:', process.env.MONGO_URI?.replace(/:[^:@]+@/, ':****@')); // Hide password

mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 10000, // 10 second timeout
})
  .then(() => {
    console.log('✅ MongoDB Connected Successfully!');
    console.log('Database:', mongoose.connection.db.databaseName);
    mongoose.connection.close();
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Failed:');
    console.error('Error:', err.message);
    console.error('\nPossible causes:');
    console.error('1. DNS resolution issue (try flushing DNS: ipconfig /flushdns)');
    console.error('2. Firewall blocking MongoDB ports');
    console.error('3. VPN or proxy interference');
    console.error('4. Cluster is paused in Atlas');
    console.error('5. Wrong credentials in connection string');
    process.exit(1);
  });
