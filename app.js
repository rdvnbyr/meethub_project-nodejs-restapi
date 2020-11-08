const express = require('express');
const connectDB = require('./config/db');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const dotenv = require('dotenv');
const colors = require('colors');

dotenv.config();

const app = express();

// cors policy
app.use(cors());

// body parsed
app.use(bodyParser.json());

// multer
const fileStorage = multer.diskStorage({
    destination: ( req, file, cb ) => {// nereye kayit yapilacak
        cb(null, 'images');
    },
    filename: (req, file, cb) => {// hangi ism ile kayit yapilacak
        cb( null, new Date().toISOString() + '-' + file.originalname );
    }
});

const fileFilter = ( req, file, cb ) => {
    if (
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpeg' ||
        file.mimetype === 'image/webp'
    ) {
        cb(null, true);
    } else {
        cb(null, false);
    };
};

// multer image upload middleware
app.use(
    multer({
        storage: fileStorage,
        fileFilter: fileFilter
    }).single('image'));

// path for images
app.use('/images', express.static(path.join( __dirname, 'images' )));

// import all routes
const authRoutes = require('./routes/auth');
const shopRoutes = require('./routes/shop');
const adminRoutes = require('./routes/admin');
const cartRoutes = require('./routes/cart');
const subscribeRoutes = require('./routes/subscribe');

app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/shop', shopRoutes);
app.use('/cart', cartRoutes);
app.use('/subscribe', subscribeRoutes);


// error handling
app.use((error, req, res, next) => {
    console.log('--ERROR--',error);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({
        message: message,
        data: data
    })
});

const port = process.env.PORT || 8080;

// DB COnnect
connectDB();
app.listen(
    port,
    console.log(`Server running in ${process.env.NODE_ENV} on port ${port}`.yellow.bold)
);