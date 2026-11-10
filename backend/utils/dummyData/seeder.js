const fs = require('fs');
const path = require('path');
require('colors');
const dotenv = require('dotenv');

const Product = require('../../modules/product/productModel');
const dbConnection = require('../../config/database');

dotenv.config({ path: path.join(__dirname, '../../config.env') });

// Connect DB
dbConnection();

// Read products.json
const products = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'products.json'), 'utf-8')
);

// Insert data into DB
const insertData = async () => {
  try {
    await Product.create(products);
    console.log('Data Inserted Successfully!'.green.inverse);
    process.exit();
  } catch (error) {
    console.error(`${error}`.red.inverse);
    process.exit(1);
  }
};

// Delete data from DB
const destroyData = async () => {
  try {
    await Product.deleteMany();
    console.log('Data Destroyed Successfully!'.red.inverse);
    process.exit();
  } catch (error) {
    console.error(`${error}`.red.inverse);
    process.exit(1);
  }
};

if (process.argv[2] === '-i') {
  insertData();
} else if (process.argv[2] === '-d') {
  destroyData();
} else {
  console.log('Use -i to insert or -d to delete'.yellow);
  process.exit();
}
