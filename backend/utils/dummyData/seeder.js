const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('colors');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../../config.env') });

const User = require('../../modules/user/models/userModel');

// Resolve database connection URI (Docker vs Local)
const DB_URI =
  process.env.DB_URI ||
  process.env.MONGO_URI ||
  'mongodb://127.0.0.1:27017/tic_db';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(DB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline);
  } catch (err) {
    console.error(`MongoDB Connection Error: ${err.message}`.red);
    process.exit(1);
  }
};

// Read users.json
const usersFile = path.join(__dirname, 'users.json');
let users = [];
if (fs.existsSync(usersFile)) {
  users = JSON.parse(fs.readFileSync(usersFile, 'utf-8'));
}

// Insert / Seed Users into MongoDB
const insertData = async () => {
  await connectDB();
  try {
    console.log('Seeding users into MongoDB...'.yellow);

    for (const u of users) {
      const existing = await User.findOne({ email: u.email });
      if (existing) {
        existing.role = u.role;
        existing.active = true;
        existing.name = u.name;
        if (u.phone) existing.phone = u.phone;
        existing.password = u.password; // Triggers pre-save hash
        await existing.save();
        console.log(`Updated user: ${u.email} [role: ${u.role}]`.green);
      } else {
        await User.create(u);
        console.log(`Created user: ${u.email} [role: ${u.role}]`.green);
      }
    }

    console.log('Users Seeded Successfully!'.green.inverse);
    process.exit(0);
  } catch (error) {
    console.error(`Seeding error: ${error.message}`.red.inverse);
    process.exit(1);
  }
};

// Delete / Destroy Seeded Users from MongoDB
const destroyData = async () => {
  await connectDB();
  try {
    const emails = users.map((u) => u.email);
    const result = await User.deleteMany({ email: { $in: emails } });
    console.log(`Deleted ${result.deletedCount} seeded users.`.red.inverse);
    process.exit(0);
  } catch (error) {
    console.error(`Destroy error: ${error.message}`.red.inverse);
    process.exit(1);
  }
};

if (process.argv[2] === '-i' || process.argv[2] === '--insert') {
  insertData();
} else if (process.argv[2] === '-d' || process.argv[2] === '--destroy') {
  destroyData();
} else {
  // Default to insert if executed directly
  console.log('Running seeder: use -i to insert or -d to delete.'.yellow);
  insertData();
}
