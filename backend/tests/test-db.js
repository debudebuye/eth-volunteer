require('dotenv').config();
const mongoose = require('mongoose');

console.log('Testing MongoDB connection...');
console.log('Connection string:', process.env.MONGO_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@'));

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected Successfully!');
    console.log('Database:', mongoose.connection.name);
    console.log('Host:', mongoose.connection.host);
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Failed:');
    console.error('Error:', err.message);
    console.error('\nPossible solutions:');
    console.error('1. Check if MongoDB Atlas cluster is running');
    console.error('2. Verify your IP is whitelisted in MongoDB Atlas');
    console.error('3. Check username and password are correct');
    console.error('4. See TROUBLESHOOTING.md for more help');
    process.exit(1);
  });
