const mongoose = require('mongoose');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
const colors = require('colors');
const users = require('./data/users');
const products = require('./data/products');
const User = require('./models/user');
const Product = require('./models/products');

dotenv.config();

connectDB();

const importData = async () => {
    try {
        await User.deleteMany();
        await Product.deleteMany();

        const createdUsers = await User.insertMany(users);
        const adminUser = createdUsers[0]._id;
        const sampleProducts = products.map(product => {
            return {...product, user: adminUser}
        });
        await Product.insertMany(sampleProducts);
        console.log('data imported'.green.inverse);
    } catch (error) {
        console.log(`${error}`.red.inverse);
        next(error);
    }
}

const destroyData = async () => {
    try {
        await User.deleteMany();
        await Product.deleteMany();
        
        console.log('data destroyed'.red.inverse);
    } catch (error) {
        console.log(`${error}`.red.underline.bold);
        next(error);
    }
};

if(process.argv[2] === '-d') {
    destroyData()
};
if(process.argv[2] === '-im') {
    importData()
};
