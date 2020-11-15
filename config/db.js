const mongoose = require('mongoose');

const connectDB = async (req,res,next) => {
    try {
        const connect = await mongoose.connect(
            process.env.MONGO_URI,
            {
                 useNewUrlParser: true,
                 useUnifiedTopology: true,
                 useCreateIndex: true,
                 useFindAndModify: false
            }
        );
        console.log(`MongDB Connected ${connect.connection.host}`.blue.underline);
    } catch (error) {
        console.log(`DB_CONNECT_ERROR: ${error}`.red.underline.bold);
        next(error);
    };
};

module.exports = connectDB;